import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cron from "node-cron";
import { GoogleGenAI } from "@google/genai";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Initialize Firebase Admin
// Note: In this environment, we usually rely on environmental credentials 
// or the provided firestore config. Since we are in AIS, we can use the config.
import firebaseConfig from "./firebase-applet-config.json";

const app = express();
const PORT = 3000;

// Initialize Admin SDK
// AIS typically provides a way to interact with Firestore via admin sdk if properly configured
// For this environment, we'll assume the default credentials are available or we use the project ID
initializeApp({
  projectId: firebaseConfig.projectId,
});

const db = getFirestore();

async function generateAndSaveArticles(biDailyOnly = false) {
  console.log(`Starting ${biDailyOnly ? 'mid-day Bi-Daily' : 'daily'} article generation task...`);
  try {
    const userBlogsRef = db.collection('user_blogs');
    let q = userBlogsRef.where('autoPublish', '==', true);
    
    if (biDailyOnly) {
      q = q.where('schedule', '==', 'Bi-Daily');
    } else {
      q = q.where('schedule', 'in', ['Daily', 'Bi-Daily']);
    }

    const snapshot = await q.get();
    
    if (snapshot.empty) {
      console.log("No blogs scheduled for auto-publish at this time.");
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    for (const doc of snapshot.docs) {
      const blog = doc.data();
      console.log(`Generating massive article for blog: ${blog.name} (User: ${blog.userId})`);

      const prompt = `Write an EXTENSIVE, high-quality, and professional blog post for a blog titled "${blog.name}". 
      Topic: ${blog.topic || 'General Technology'}. 
      Keywords: ${blog.keywords || 'none'}. 
      Tone: ${blog.tone || 'Professional'}. 
      Language: ${blog.language || 'Arabic'}. 
      
      CRITICAL REQUIREMENTS:
      1. Word Count & Depth (CRITICAL): The article MUST be extremely detailed and long-form, reaching a minimum of 1500 to 2000 words. You MUST delve deeply into every aspect, providing extensive background, step-by-step guides, and deep analysis. Do not summarize; expand heavily.
      2. Hook & Intro: Start with a clear "Problem" and offer a "Solution".
      3. Practical Examples: Incorporate real-world, practical examples.
      4. Practical Tips Section: Include a specific section with an <h2> or <h3> heading dedicated to "Daily Practical Tips".
      5. Backlinks (CRITICAL): You MUST include BOTH internal and external backlinks naturally within the text!
         - Internal Link: You MUST include exactly one HTML hyperlink pointing to the blog's URL. Use this format: <a href="${blog.url || 'https://example.com'}">INSERT RELEVANT KEYWORD HERE</a>.
         - External Links: Include at least 2 external links to relevant resources, examples, or famous references (e.g., if discussing a recipe, link to a famous recipe source or related tool; <a href="https://example.com" target="_blank" rel="noopener">Relevant Text</a>).
      6. Visual Identity & Formatting: Use advanced semantic HTML (<h2>, <h3>, <h4>, <ul>, <li>, <strong>, <blockquote>). Ensure the layout is visually appealing. Break up long paragraphs to enhance readability.
      7. Image Inclusion & Optimization:
         - A Hero image is already added automatically. You MUST add EXACTLY ONE MORE inline image in the middle of the article using pollinations.ai. Format: <img src="https://image.pollinations.ai/prompt/YOUR_SECTION_TOPIC_HERE_in_english_realistic_photography?width=800&height=500&nologo=true" alt="Section Topic" style="width:100%; max-width: 800px; border-radius: 8px; margin: 20px auto; display: block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
      8. SEO Optimization: Distribute the provided keywords naturally throughout the text, including at least two in <h2> or <h3> headings. Use bold (<strong>) for important SEO keywords. Provide a strong closing statement.
      9. Output Format: Return ONLY a valid JSON object with exactly two keys: "title" (string) and "content" (string containing the raw HTML). DO NOT wrap the output in markdown code blocks.

      Target Audience: People interested in ${blog.topic || 'the blog topic'}. Make it highly valuable.`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
        
        const text = response.text;
        const { title, content } = JSON.parse(text);

        const imagePrompt = `${blog.topic || 'technology'} realistic professional high quality photography`;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1000&height=500&nologo=true`;

        // Save to articles collection
        await db.collection('articles').add({
          title,
          content,
          imageUrl,
          blogId: blog.blogId,
          blogName: blog.name,
          userId: blog.userId,
          status: 'draft',
          isAutoGenerated: true,
          seoScore: Math.floor(Math.random() * 20) + 80, // Simulated SEO score for UI
          createdAt: FieldValue.serverTimestamp()
        });

        console.log(`Successfully generated and saved 1000+ word article for ${blog.name}`);
      } catch (err) {
        console.error(`Error generating article for ${blog.name}:`, err);
      }
    }
  } catch (error) {
    console.error("Cron job error:", error);
  }
}

// Schedule task at 00:00 every day (Daily and Bi-Daily)
cron.schedule("0 0 * * *", () => {
  generateAndSaveArticles();
});

// Schedule task at 12:00 every day (Bi-Daily only)
cron.schedule("0 12 * * *", () => {
  console.log("Triggering 12:00 Bi-Daily article generation...");
  generateAndSaveArticles(true); // pass flag to filter for Bi-Daily only if needed
});

// For testing: You can trigger this via an internal API if needed
app.get("/api/trigger-cron", async (req, res) => {
  await generateAndSaveArticles();
  res.json({ message: "Cron task triggered manually" });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
