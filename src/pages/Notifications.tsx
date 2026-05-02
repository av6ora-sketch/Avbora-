import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { Bell, CheckSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  targetUserId: string;
  createdAt: string;
  read?: boolean;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isAR } = useLanguage();

  const t = {
    title: isAR ? 'الإشعارات' : 'Notifications',
    loading: isAR ? 'جاري التحميل...' : 'Loading...',
    empty: isAR ? 'لا توجد إشعارات.' : 'No notifications.',
    markAllRead: isAR ? 'تحديد الكل كمقروء' : 'Mark all as read',
  };

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = () => {
      // Fetch both specific and all
      const qSpecific = query(
        collection(db, 'notifications'), 
        where('targetUserId', 'in', ['all', user.uid])
      );

      const unsubscribe = onSnapshot(qSpecific, async (snapshot) => {
        let fetched: AppNotification[] = [];
        snapshot.forEach(d => fetched.push({ id: d.id, ...d.data() } as AppNotification));

        // Let's sort manually since composite index might be needed otherwise
        fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Check read status from a subcollection for this user (or we use user_notifications tracking)
        // Since 'all' notifications share a document, we must track read status per user
        // Let's just track read status in a user_read_notifications collection
        const readRef = collection(db, 'user_reads', user.uid, 'reads');
        const readSnap = await getDocs(readRef).catch(() => ({ docs: [] }));
        const readIds = new Set(readSnap.docs.map(d => d.id));

        fetched = fetched.map(n => ({
          ...n,
          read: readIds.has(n.id)
        }));

        setNotifications(fetched);
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'notifications');
        setLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribe = fetchNotifications();
    return () => unsubscribe && unsubscribe();
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'user_reads', user.uid, 'reads', id), {
        readAt: new Date().toISOString()
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `user_reads/${user.uid}/reads/${id}`);
    }
  };

  const markAllRead = () => {
    notifications.filter(n => !n.read).forEach(n => handleMarkAsRead(n.id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Bell className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white transition-colors">
            {t.title}
          </h1>
        </div>
        <button 
          onClick={markAllRead}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-lg transition"
        >
          <CheckSquare className="w-4 h-4" />
          {t.markAllRead}
        </button>
      </div>

      <div className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-8 text-center text-gray-400">{t.loading}</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400">{t.empty}</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => !n.read && handleMarkAsRead(n.id)}
                className={`p-6 transition cursor-pointer ${n.read ? 'bg-gray-950/50' : 'bg-gray-900 border-l-4 border-blue-500 hover:bg-gray-800'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className={`font-bold ${n.read ? 'text-gray-400' : 'text-white'}`}>{n.title}</div>
                  <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleDateString()}</div>
                </div>
                <div className={`text-sm ${n.read ? 'text-gray-500' : 'text-gray-300'}`}>{n.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
