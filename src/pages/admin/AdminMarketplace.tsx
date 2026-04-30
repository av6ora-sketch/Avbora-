import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Loader2, Trash2, CheckSquare, XSquare } from 'lucide-react';

export default function AdminMarketplace() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const q = query(collection(db, 'marketplace'));
      const snapshot = await getDocs(q);
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'marketplace', id), { status });
      setItems(items.map(i => i.id === id ? { ...i, status } : i));
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing entirely?')) return;
    try {
      await deleteDoc(doc(db, 'marketplace', id));
      setItems(items.filter(i => i.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Review Marketplace Listings</h1>

      {loading ? (
        <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>
      ) : (
        <div className="grid gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 p-5 rounded-xl flex flex-col md:flex-row justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${item.status === 'approved' ? 'bg-emerald-900/30 text-emerald-500' : item.status === 'rejected' ? 'bg-red-900/30 text-red-500' : item.status === 'ended' ? 'bg-blue-900/30 text-blue-500' : 'bg-yellow-900/30 text-yellow-500'}`}>
                    {item.status || 'pending'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{item.description}</p>
                <div className="flex gap-4 text-xs">
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-bold uppercase">Starting</span>
                    <span className="text-blue-500 font-bold">${item.startingPrice}</span>
                  </div>
                  <div className="flex flex-col border-l border-gray-800 pl-4">
                    <span className="text-gray-500 font-bold uppercase">Current Bid</span>
                    <span className="text-emerald-500 font-bold">${item.currentBid || item.startingPrice}</span>
                  </div>
                  <div className="flex flex-col border-l border-gray-800 pl-4">
                    <span className="text-gray-500 font-bold uppercase">Bidder</span>
                    <span className="text-white font-medium">{item.highestBidderName || 'None'}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-xs mt-3 bg-gray-950 p-3 rounded-lg border border-gray-800">
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-bold uppercase">Seller Info</span>
                    <span className="text-white font-medium">{item.sellerName || 'Unknown'}</span>
                    <span className="text-gray-400">{item.sellerPhone || 'No Phone'}</span>
                    <span className="text-gray-400">{item.sellerCountry || 'No Country'}</span>
                  </div>
                  
                  <div className="flex flex-col border-l border-gray-800 pl-4">
                    <span className="text-gray-500 font-bold uppercase">Bidder Info</span>
                    {item.highestBidderId ? (
                      <>
                        <span className="text-white font-medium">{item.highestBidderName || 'Unknown'}</span>
                        <span className="text-gray-400">{item.highestBidderPhone || 'No Phone'}</span>
                        <span className="text-gray-400">{item.highestBidderCountry || 'No Country'}</span>
                      </>
                    ) : (
                      <span className="text-gray-500 italic">No bids yet</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 md:flex-col md:w-36 shrink-0">
                {item.status === 'pending' && (
                  <>
                    <button onClick={() => handleUpdateStatus(item.id, 'approved')} className="flex-1 w-full p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded font-bold text-xs transition">Approve</button>
                    <button onClick={() => handleUpdateStatus(item.id, 'rejected')} className="flex-1 w-full p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded font-bold text-xs transition">Reject</button>
                  </>
                )}
                {item.status === 'approved' && (
                  <button onClick={() => handleUpdateStatus(item.id, 'ended')} className="flex-1 w-full p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded font-bold text-xs transition">Mark as Ended</button>
                )}
                <button onClick={() => handleDelete(item.id)} className="flex-1 w-full p-2 bg-gray-500/10 text-gray-400 hover:bg-red-500/10 hover:text-red-500 rounded font-bold text-xs transition">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-gray-500 text-center py-12">No listings to review.</div>}
        </div>
      )}
    </div>
  );
}
