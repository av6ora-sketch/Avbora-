import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function AdminCommunity() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, 'posts'));
      const snapshot = await getDocs(q);
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'posts', id), { status });
      setPosts(posts.map(p => p.id === id ? { ...p, status } : p));
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'posts', id));
      setPosts(posts.filter(p => p.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Review Community Posts</h1>

      {loading ? (
        <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>
      ) : (
        <div className="grid gap-4">
          {posts.map(post => (
            <div key={post.id} className="bg-gray-900 border border-gray-800 p-5 rounded-xl flex flex-col md:flex-row justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded-full ${post.status === 'approved' ? 'bg-emerald-900/30 text-emerald-500' : post.status === 'rejected' ? 'bg-red-900/30 text-red-500' : 'bg-yellow-900/30 text-yellow-500'}`}>
                    {post.status || 'pending'}
                  </span>
                  <div className="text-gray-500 text-xs text-mono">User: {post.userId}</div>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap">{post.content}</p>
              </div>
              <div className="flex items-center gap-2 md:flex-col md:w-32 shrink-0">
                {post.status !== 'approved' && (
                  <button onClick={() => handleUpdateStatus(post.id, 'approved')} className="flex-1 w-full p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded font-medium text-sm transition">Approve</button>
                )}
                {post.status !== 'rejected' && (
                  <button onClick={() => handleUpdateStatus(post.id, 'rejected')} className="flex-1 w-full p-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded font-medium text-sm transition">Reject</button>
                )}
                <button onClick={() => handleDelete(post.id)} className="flex-1 w-full p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded font-medium text-sm transition">Delete</button>
              </div>
            </div>
          ))}
          {posts.length === 0 && <div className="text-gray-500 text-center py-12">No posts to review.</div>}
        </div>
      )}
    </div>
  );
}
