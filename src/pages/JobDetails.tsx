import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Building, MapPin, Clock } from 'lucide-react';

export default function JobDetails() {
  const { id } = useParams();
  
  // In a real app we would fetch the specific job by id.
  // Using placeholder data for MVP based on ID logic in Jobs.tsx
  const job = {
    title: "Senior Frontend Engineer",
    company: "TechFlow AI",
    location: "Remote",
    type: "Permanent",
    salary: "$120k - $160k",
    description: "We are looking for an experienced frontend engineer to lead the development of our core AI interfaces. You will work closely with design and backend teams to deliver high-performance React applications.",
    requirements: ["React", "TypeScript", "Tailwind CSS", "5+ years experience"],
    aiExplanation: "This role strongly matches your React and TypeScript skills. It's a senior position, which aligns with your 'Advanced' experience level. They are looking for someone who can lead projects autonomously."
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/jobs" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6 transition">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Jobs
      </Link>
      
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-4">{job.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1"><Building className="w-4 h-4" /> {job.company}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {job.type}</span>
            </div>
          </div>
          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-gray-950 font-bold rounded-lg transition text-lg">
            Apply Now
          </button>
        </div>

        <div className="bg-[#111111] border border-blue-500/20 p-5 rounded-lg mb-8">
          <div className="flex items-center gap-2 mb-3 text-blue-500 font-bold">
            <Sparkles className="w-5 h-5" /> AI Analysis
          </div>
          <p className="text-gray-300">{job.aiExplanation}</p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">Job Description</h2>
            <p className="text-gray-400 leading-relaxed">{job.description}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Requirements</h2>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              {job.requirements.map((req, i) => <li key={i}>{req}</li>)}
            </ul>
          </section>
        </div>
      </div>
      
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
        <h2 className="text-xl font-bold text-white mb-4">AI Suggested Cover Letter Outline</h2>
        <div className="bg-gray-950 p-4 rounded-lg font-mono text-sm text-gray-400 whitespace-pre-wrap">
{`Highlight your extensive experience with React and TypeScript.
Mention a specific complex UI project you led.
Emphasize your capability to work remotely and independently.
Express excitement about working on AI interfaces.`}
        </div>
      </div>
    </div>
  );
}
