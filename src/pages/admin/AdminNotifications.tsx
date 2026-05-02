import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, getDocs } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrors';
import { Bell, Send } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
}

export default function AdminNotifications() {
  const [users, setUsers] = useState<User[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetUserId, setTargetUserId] = useState<string>('all');
  const [isSending, setIsSending] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Fetch users for the dropdown
    getDocs(collection(db, 'users')).then(snapshot => {
      const u: User[] = [];
      snapshot.forEach(doc => {
        u.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(u);
    }).catch(e => {
        handleFirestoreError(e, OperationType.LIST, 'users');
    });

    // Fetch notifications history
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const h: any[] = [];
      snapshot.forEach(doc => h.push({ id: doc.id, ...doc.data() }));
      setHistory(h);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setIsSending(true);

    try {
      await addDoc(collection(db, 'notifications'), {
        title: title.trim(),
        message: message.trim(),
        targetUserId,
        createdAt: new Date().toISOString()
      });
      setTitle('');
      setMessage('');
      alert("Notification sent successfully!");
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'notifications');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold text-white">Send Notifications</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-fit">
          <h2 className="text-xl font-bold text-white mb-6">Create New Notification</h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Target User</label>
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition"
              >
                <option value="all">All Users (Broadcast)</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="Notification Title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="Message body..."
              />
            </div>
            <button
              type="submit"
              disabled={isSending}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              {isSending ? 'Sending...' : 'Send Notification'}
            </button>
          </form>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">Recent Notifications</h2>
          </div>
          <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No notifications sent yet.</div>
            ) : history.map(n => (
              <div key={n.id} className="p-6 hover:bg-gray-800/50 transition">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-white">{n.title}</div>
                  <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-sm text-gray-400 mb-3">{n.message}</div>
                <div className="inline-block px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs font-mono text-gray-300">
                  Target: {n.targetUserId === 'all' ? 'All Users' : (users.find(u => u.id === n.targetUserId)?.email || n.targetUserId)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
