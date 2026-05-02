import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, setDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Globe2, Plus, Loader2, ExternalLink, CheckCircle, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleAuthProvider, signInWithPopup, linkWithPopup } from 'firebase/auth';

interface BloggerBlog {
  id: string;
  name: string;
  url: string;
  postsId?: string;
}

interface ConnectedBlog {
  id: string; // The Firestore doc ID
  blogId: string;
  name: string;
  url: string;
  userId: string;
  createdAt: any;
  autoPublish?: boolean;
  keywords?: string;
  topic?: string;
  language?: string;
  tone?: string;
  schedule?: string;
}

import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

import { GoogleGenAI } from "@google/genai";
import { Sparkles, Settings2, Save, X, Wand2 } from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';

export default function BlogSettings() {
  const { isAR } = useLanguage();
  const { user } = useAuth();

  const [blogs, setBlogs] = useState<ConnectedBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedBlogs, setFetchedBlogs] = useState<BloggerBlog[]>([]);
  const [editingBlog, setEditingBlog] = useState<ConnectedBlog | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedPost, setLastGeneratedPost] = useState<any>(null);

  const t = {
    title: isAR ? 'إعدادات الموقع والمحتوى' : 'Site & Content Settings',
    desc: isAR ? 'اربط حسابات بلوجر الخاصة بك لتفعيل النشر التلقائي وتخصيص المحتوى.' : 'Connect your Blogger accounts to enable auto-publishing and content customization.',
    connectTitle: isAR ? 'ربط حساب بلوجر' : 'Connect Blogger Account',
    connectDesc: isAR ? 'امنح Avbora صلاحية القراءة والكتابة لمدونات بلوجر الخاصة بك. بمجرد الاتصال، يمكن للذكاء الاصطناعي جدولة ونشر المقالات تلقائيًا.' : 'Authorize Avbora to read/write your Blogger blogs. Once connected, AI can automatically schedule and publish articles.',
    authBtn: isAR ? 'ترخيص بلوجر' : 'Authorize Blogger',
    linking: isAR ? 'جاري الاتصال...' : 'Connecting...',
    linkedTitle: isAR ? 'المدونات المرتبطة حالياً' : 'Currently Linked Blogs',
    noBlogs: isAR ? 'لم تقم بربط أي مدونة بعد. ابدأ بترخيص بلوجر.' : "You haven't linked any blogs yet. Authorize Blogger to get started.",
    settingsBtn: isAR ? 'الإعدادات' : 'Settings',
    generateBtn: isAR ? 'توليد الآن' : 'Generate Now',
    visitBtn: isAR ? 'زيارة' : 'Visit',
    topicLbl: isAR ? 'الموضوع الرئيسي' : 'Primary Topic',
    langLbl: isAR ? 'اللغة' : 'Language',
    keywordsLbl: isAR ? 'الكلمات المفتاحية المستهدفة' : 'Target Keywords',
    toneLbl: isAR ? 'نبرة الصوت' : 'AI Tone',
    scheduleLbl: isAR ? 'جدول النشر التلقائي' : 'Auto-Publish Schedule',
    enableAuto: isAR ? 'تفعيل النشر التلقائي' : 'Enable Auto-Publishing',
    aiWillPost: isAR ? 'سيقوم الذكاء الاصطناعي بالنشر تلقائياً' : 'AI will post automatically',
    saveBtn: isAR ? 'حفظ الإعدادات' : 'Save Settings',
  };

  useEffect(() => {
    fetchConnectedBlogs();
  }, [user]);

  const fetchConnectedBlogs = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'user_blogs'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const data: ConnectedBlog[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as ConnectedBlog);
      });
      setBlogs(data);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'user_blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectBlogger = async () => {
    if (!user) return;
    setConnecting(true);
    setError(null);
    try {
      // Create a Google provider and request Blogger scope
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/blogger');
      // Force consent to get a fresh token
      provider.setCustomParameters({ prompt: 'consent' });

      let result;
      
      // If user signed in with Email, we link. If signed in with Google, we can re-auth.
      // For simplicity, we'll try signInWithPopup which can act as a re-auth/scope request
      // even if already signed in, or linkWithPopup
      try {
        const isGoogleProvider = user.providerData.some(p => p.providerId === 'google.com');
        if (!isGoogleProvider) {
          result = await linkWithPopup(user, provider);
        } else {
          result = await signInWithPopup(auth, provider);
        }
      } catch (linkErr: any) {
         if (linkErr.code === 'auth/credential-already-in-use') {
            result = await signInWithPopup(auth, provider);
         } else {
            throw linkErr;
         }
      }
      
      const credential = GoogleAuthProvider.credentialFromResult(result!);
      const token = credential?.accessToken;

      if (!token) {
        throw new Error('Failed to get Google Access Token');
      }

      // Fetch the blogs from Blogger API
      const response = await fetch('https://www.googleapis.com/blogger/v3/users/self/blogs', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch blogs from Blogger API. Make sure Blogger API is enabled in your Google Cloud Project.');
      }

      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        setFetchedBlogs(data.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          url: item.url
        })));
      } else {
        setFetchedBlogs([]);
        setError("No Blogger blogs found for this Google account.");
      }
      
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to connect to Blogger");
    } finally {
      setConnecting(false);
    }
  };

  const handleLinkBlog = async (blog: BloggerBlog) => {
    if (!user) return;
    
    // Check if already linked
    if (blogs.some(b => b.blogId === blog.id)) {
      alert("This blog is already connected.");
      return;
    }

    try {
      const docId = `${user.uid}_${blog.id}`;
      const docRef = doc(db, 'user_blogs', docId);
      const blogData = {
        blogId: blog.id,
        name: blog.name,
        url: blog.url,
        userId: user.uid,
        createdAt: serverTimestamp(),
        topic: '',
        language: 'Arabic',
        tone: 'Professional',
        schedule: 'Daily',
        autoPublish: false
      };
      await setDoc(docRef, blogData);
      
      const newBlog = { id: docId, ...blogData } as ConnectedBlog;
      setBlogs([...blogs, newBlog]);
      setFetchedBlogs(fetchedBlogs?.filter(b => b.id !== blog.id) || null);
      
      // Automatically open settings for the new blog
      setEditingBlog(newBlog);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `user_blogs/${blog.id}`);
    }
  };

  const handleUnlinkBlog = async (id: string) => {
    if (!confirm("Are you sure you want to unlink this blog? Auto-publishing will stop working for it.")) return;
    try {
      await deleteDoc(doc(db, 'user_blogs', id));
      setBlogs(blogs.filter(b => b.id !== id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `user_blogs/${id}`);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog || !user) return;
    setIsUpdating(true);
    try {
      const docRef = doc(db, 'user_blogs', editingBlog.id);
      const { id, ...updateData } = editingBlog;
      await setDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      setBlogs(blogs.map(b => b.id === editingBlog.id ? editingBlog : b));
      alert("Settings updated successfully!");
      setEditingBlog(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `user_blogs/${editingBlog.id}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGenerateAndPublish = async (blog: ConnectedBlog) => {
    if (!user) return;
    setIsGenerating(true);
    setLastGeneratedPost(null);

    try {
      // 1. Generate Content with Gemini
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsedResponse = JSON.parse(response.text);
      const title = parsedResponse.title;
      const initialContent = parsedResponse.content;

      const imagePrompt = `${blog.topic || 'technology'} realistic professional high quality photography`;
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1000&height=500&nologo=true`;
      
      const content = `<img src="${imageUrl}" alt="${title}" style="width:100%; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />\n\n${initialContent}`;

      // 2. Publish to Blogger
      // We need a fresh token. If we don't have one, we trigger auth.
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/blogger');
      const authResult = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(authResult);
      const token = credential?.accessToken;

      if (!token) throw new Error("Could not get Blogger access token");

      const publishResponse = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blog.blogId}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kind: 'blogger#post',
          blog: { id: blog.blogId },
          title,
          content,
        }),
      });

      if (!publishResponse.ok) {
        const errData = await publishResponse.json();
        throw new Error(errData.error?.message || "Failed to publish to Blogger");
      }

      const publishedPost = await publishResponse.json();
      
      // 3. Save article record to Firestore
      await setDoc(doc(collection(db, 'articles')), {
        title,
        content,
        imageUrl,
        blogId: blog.blogId,
        blogName: blog.name,
        userId: user.uid,
        status: 'published',
        bloggerUrl: publishedPost.url,
        createdAt: serverTimestamp()
      });

      alert("AI Article generated and published successfully!");
      setLastGeneratedPost(publishedPost.url);
    } catch (e: any) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      // Only wrap in handleFirestoreError if it's actually a Firestore permission error
      if (errorMessage.includes('Missing or insufficient permissions') || errorMessage.includes('PERMISSION_DENIED')) {
         handleFirestoreError(e, OperationType.WRITE, 'articles');
      } else {
         alert("Error generating/publishing: " + errorMessage);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto px-4 py-8 w-full ${isAR ? 'text-right' : 'text-left'}`} dir={isAR ? 'rtl' : 'ltr'}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
        <p className="text-gray-400">{t.desc}</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl mb-8">
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${isAR ? 'md:flex-row-reverse' : ''}`}>
          <div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-blue-500" /> {t.connectTitle}
            </h2>
            <p className="text-gray-400 text-sm max-w-lg">
              {t.connectDesc}
            </p>
          </div>
          <button 
            onClick={handleConnectBlogger}
            disabled={connecting}
            className="shrink-0 flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-gray-950 font-bold rounded-xl transition shadow-lg shadow-white/10 disabled:opacity-50"
          >
            {connecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {connecting ? t.linking : t.authBtn}
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">Authorization Error</span>
              {error}
            </div>
          </div>
        )}

        {/* Selected Blogs from Auth */}
        {fetchedBlogs !== null && (
          <div className="mt-8 pt-8 border-t border-gray-800 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-lg font-bold text-white mb-4">Found Blogs ({fetchedBlogs.length})</h3>
            {fetchedBlogs.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No unlinked blogs found on this account.</p>
            ) : (
              <div className="grid gap-4">
                {fetchedBlogs.map(blog => (
                  <div key={blog.id} className="p-4 bg-gray-950 border border-gray-800 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{blog.name}</div>
                      <a href={blog.url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">{blog.url}</a>
                    </div>
                    <button 
                      onClick={() => handleLinkBlog(blog)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition"
                    >
                      Link Blog
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connected Blogs */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" /> {t.linkedTitle}
        </h2>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 border-dashed rounded-2xl p-12 text-center text-gray-500">
            {t.noBlogs}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {blogs.map(blog => (
              <div key={blog.id} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl relative overflow-hidden group">
                <div className={`absolute top-0 ${isAR ? 'left-0' : 'right-0'} p-4 opacity-0 group-hover:opacity-100 transition`}>
                  <button 
                    onClick={() => handleUnlinkBlog(blog.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition"
                    title="Unlink Blog"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-900/30 text-blue-500 rounded-xl flex items-center justify-center">
                    <Globe2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{blog.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold tracking-wider uppercase">
                      <CheckCircle className="w-3 h-3" /> Connected
                    </div>
                  </div>
                </div>
                
                <div className={`mt-4 pt-4 border-t border-gray-800 flex items-center justify-between gap-3 ${isAR ? 'flex-row-reverse' : ''}`}>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingBlog(blog)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition text-xs font-bold"
                    >
                      <Settings2 className="w-4 h-4" /> {t.settingsBtn}
                    </button>
                    <button 
                      onClick={() => handleGenerateAndPublish(blog)}
                      disabled={isGenerating}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white rounded-lg transition text-xs font-bold disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      {t.generateBtn}
                    </button>
                  </div>
                  <a href={blog.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400 transition text-sm flex items-center gap-1">
                    {t.visitBtn} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {editingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" onClick={() => setEditingBlog(null)} />
          <div className="relative bg-gray-900 border border-gray-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-blue-500" /> {editingBlog.name} {t.settingsBtn}
              </h2>
              <button onClick={() => setEditingBlog(null)} className="text-gray-500 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSettings} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{t.topicLbl}</label>
                  <input 
                    value={editingBlog.topic || ''}
                    onChange={(e) => setEditingBlog({...editingBlog, topic: e.target.value})}
                    placeholder={isAR ? "مثال: أخبار التقنية" : "e.g. Technology News"}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{t.langLbl}</label>
                  <select 
                    value={editingBlog.language || 'Arabic'}
                    onChange={(e) => setEditingBlog({...editingBlog, language: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Arabic">Arabic (العربية)</option>
                    <option value="English">English</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{t.keywordsLbl}</label>
                <input 
                  value={editingBlog.keywords || ''}
                  onChange={(e) => setEditingBlog({...editingBlog, keywords: e.target.value})}
                  placeholder={isAR ? "مثال: ذكاء اصطناعي، مستقبل، برمجة" : "e.g. AI, Future, Blogging"}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{t.toneLbl}</label>
                  <select 
                    value={editingBlog.tone || 'Professional'}
                    onChange={(e) => setEditingBlog({...editingBlog, tone: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Professional">{isAR ? 'احترافي' : 'Professional'}</option>
                    <option value="Informative">{isAR ? 'معلوماتي' : 'Informative'}</option>
                    <option value="Casual">{isAR ? 'ودي' : 'Casual'}</option>
                    <option value="Storytelling">{isAR ? 'قصصي' : 'Storytelling'}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{t.scheduleLbl}</label>
                  <select 
                    value={editingBlog.schedule || 'Daily'}
                    onChange={(e) => setEditingBlog({...editingBlog, schedule: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Daily">{isAR ? 'يومياً' : 'Once Daily'}</option>
                    <option value="Bi-Daily">{isAR ? 'مرتين في اليوم' : 'Twice Daily'}</option>
                    <option value="Weekly">{isAR ? 'أسبوعياً' : 'Weekly'}</option>
                  </select>
                </div>
              </div>

              <div className={`p-4 bg-blue-900/10 border border-blue-900/20 rounded-xl flex items-center justify-between ${isAR ? 'flex-row-reverse' : ''}`}>
                <div className={isAR ? 'text-right' : 'text-left'}>
                  <div className="text-sm font-bold text-white">{t.enableAuto}</div>
                  <div className="text-[10px] text-gray-500 uppercase font-black">{t.aiWillPost}</div>
                </div>
                <button 
                  type="button"
                  onClick={() => setEditingBlog({...editingBlog, autoPublish: !editingBlog.autoPublish})}
                  className={`w-12 h-6 rounded-full transition-colors relative ${editingBlog.autoPublish ? 'bg-blue-500' : 'bg-gray-800'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editingBlog.autoPublish ? (isAR ? 'left-1' : 'right-1') : (isAR ? 'right-1' : 'left-1')}`} />
                </button>
              </div>

              <div className="pt-4">
                <button 
                  disabled={isUpdating}
                  className="w-full py-4 bg-white hover:bg-gray-100 text-gray-950 font-black rounded-xl transition flex items-center justify-center gap-2"
                >
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {t.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


