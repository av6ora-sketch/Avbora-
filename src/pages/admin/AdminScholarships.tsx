import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { Loader2, Trash2, Plus } from 'lucide-react';

export default function AdminScholarships() {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScholarships = async () => {
    try {
      const q = query(collection(db, 'scholarships'));
      const snapshot = await getDocs(q);
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setScholarships(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scholarship?')) return;
    try {
      await deleteDoc(doc(db, 'scholarships', id));
      setScholarships(scholarships.filter(j => j.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddDemo = async () => {
    const newId = Date.now().toString();
    try {
      const item = {
        title: "Demo Scholarship",
        country: "USA",
        requirements: "Bachelors Degree",
        link: "https://example.com"
      };
      await setDoc(doc(db, 'scholarships', newId), item);
      setScholarships([...scholarships, { id: newId, ...item }]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Manage Scholarships</h1>
        <button onClick={handleAddDemo} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition">
          <Plus className="w-4 h-4" /> Add Demo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>
      ) : (
        <div className="grid gap-4">
          {scholarships.map(item => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.country}</p>
              </div>
              <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded transition">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {scholarships.length === 0 && <div className="text-gray-500 text-center py-12">No scholarships currently available to manage.</div>}
        </div>
      )}
    </div>
  );
}
