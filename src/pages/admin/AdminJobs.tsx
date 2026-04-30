import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { Loader2, Trash2, Edit2, Plus } from 'lucide-react';

export default function AdminJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const q = query(collection(db, 'jobs'));
      const snapshot = await getDocs(q);
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await deleteDoc(doc(db, 'jobs', id));
      setJobs(jobs.filter(j => j.id !== id));
    } catch (e) {
      console.error(e);
      alert('Failed to delete job');
    }
  };

  const handleAddDemoJob = async () => {
    const newId = Date.now().toString();
    try {
      const job = {
        title: "New AI Engineer",
        company: "Avbora Inc",
        location: "Remote",
        type: "Permanent",
        salary: "$100k - $140k",
        description: "Demo description.",
        requirements: ["Python", "AI"],
        link: "https://example.com"
      };
      await setDoc(doc(db, 'jobs', newId), job);
      setJobs([...jobs, { id: newId, ...job }]);
    } catch (e) {
      console.error(e);
      alert('Failed to add job');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Manage Jobs</h1>
        <button onClick={handleAddDemoJob} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition">
          <Plus className="w-4 h-4" /> Add Demo Job
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>
      ) : (
        <div className="grid gap-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">{job.title}</h3>
                <p className="text-sm text-gray-400">{job.company} • {job.type}</p>
              </div>
              <button onClick={() => handleDelete(job.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded transition">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {jobs.length === 0 && <div className="text-gray-500 text-center py-12">No jobs currently available to manage.</div>}
        </div>
      )}
    </div>
  );
}
