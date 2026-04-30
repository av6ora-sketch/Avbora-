import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { Briefcase, Building, ExternalLink, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Job {
  id: string;
  title: string;
  description: string;
  type: string;
  skillsRequired: string[];
  source: string;
  link: string;
  createdAt: string;
  matchScore?: number;
}

export default function Jobs() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = query(collection(db, 'jobs'));
        const querySnapshot = await getDocs(q);
        
        let fetchedJobs: Job[] = [];
        querySnapshot.forEach((doc) => {
          fetchedJobs.push({ id: doc.id, ...doc.data() } as Job);
        });

        // AI Match Score Logic (Naive intersection for MVP)
        if (profile?.skills && profile.skills.length > 0) {
          fetchedJobs = fetchedJobs.map(job => {
            const requiredLower = job.skillsRequired.map(s => s.toLowerCase());
            const userLower = profile.skills.map(s => s.toLowerCase());
            const intersection = userLower.filter(s => requiredLower.includes(s));
            let score = 0;
            if (job.skillsRequired.length > 0) {
              score = Math.round((intersection.length / job.skillsRequired.length) * 100);
            }
            // For MVP, if required skills is empty, just give 50%
            if (job.skillsRequired.length === 0) score = 50;
            
            return { ...job, matchScore: score };
          });
          
          // Rank by match score
          fetchedJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        }

        setJobs(fetchedJobs);
      } catch (e) {
        console.error("Failed to fetch jobs", e);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Recommended Jobs</h1>
          <p className="text-gray-400">Curated opportunities matched to your skills.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {jobs.length === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No jobs found</h3>
            <p className="text-gray-400">We don't have any opportunities in the database right now.</p>
          </div>
        )}

        {jobs.map(job => (
          <div key={job.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:border-gray-700 transition">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-white">{job.title}</h3>
                {job.matchScore !== undefined && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    job.matchScore >= 80 ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800' :
                    job.matchScore >= 50 ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-800' :
                    'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}>
                    {job.matchScore}% AI Match
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300 text-xs font-medium capitalize">
                  {job.type}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-400 mb-4 gap-4">
                <span className="flex items-center gap-1.5"><Building className="w-4 h-4" /> {job.source}</span>
              </div>
              
              <p className="text-gray-300 text-sm line-clamp-2 mb-4">{job.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.map(sk => (
                  <span key={sk} className="px-2 py-1 bg-gray-950 border border-gray-800 rounded-md text-xs text-gray-400">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="md:w-32 flex flex-col justify-center">
              <Link
                to={`/jobs/${job.id}`}
                className="w-full text-center px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-gray-950 font-bold rounded-lg transition text-sm"
              >
                View & Apply
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
