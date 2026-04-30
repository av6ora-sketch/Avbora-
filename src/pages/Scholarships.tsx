import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { GraduationCap, ExternalLink, Loader2 } from 'lucide-react';

interface Scholarship {
  id: string;
  title: string;
  country: string;
  requirements: string;
  link: string;
}

export default function Scholarships() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        const q = query(collection(db, 'scholarships'));
        const querySnapshot = await getDocs(q);
        const fetched: Scholarship[] = [];
        querySnapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as Scholarship);
        });
        setScholarships(fetched);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchScholarships();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Scholarships</h1>
        <p className="text-gray-400">Discover global funding opportunities tailored to your country and education level.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : (
        <div className="grid gap-6">
          {scholarships.length === 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <GraduationCap className="w-12 h-12 text-gray-800 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No scholarships found</h3>
              <p className="text-gray-400">We don't have any scholarships matching your criteria right now.</p>
            </div>
          )}

          {scholarships.map(item => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row justify-between gap-6 hover:border-gray-700 transition">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-0.5 bg-gray-800 text-gray-300 text-xs rounded-full">{item.country}</span>
                </div>
                <p className="text-gray-400 text-sm mb-4"><strong>Requirements:</strong> {item.requirements}</p>
                <button className="text-sm font-medium text-blue-500 border border-blue-500/30 px-3 py-1.5 rounded bg-blue-900/10 hover:bg-blue-900/20 transition">
                  Check Eligibility
                </button>
              </div>
              <div className="md:w-32 flex flex-col justify-center">
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-gray-950 font-bold rounded-lg transition"
                >
                  Apply
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
