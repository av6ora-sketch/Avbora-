import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrors';
import { Database, LogIn, LogOut } from 'lucide-react';

interface Log {
  id: string;
  userId: string;
  userEmail: string;
  action: 'login' | 'logout';
  timestamp: string;
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'logs'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Log[] = [];
      snapshot.forEach(doc => {
        fetched.push({ id: doc.id, ...doc.data() } as Log);
      });
      setLogs(fetched);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'logs');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Database className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold text-white">System Logs</h1>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No logs found.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-950 border-b border-gray-800 text-gray-400">
              <tr>
                <th className="p-4 font-medium font-mono text-sm">Action</th>
                <th className="p-4 font-medium font-mono text-sm">Email</th>
                <th className="p-4 font-medium font-mono text-sm">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-800/50 transition">
                  <td className="p-4 text-white">
                    <div className="flex items-center gap-2">
                       {log.action === 'login' ? (
                          <LogIn className="w-4 h-4 text-green-500" />
                       ) : (
                          <LogOut className="w-4 h-4 text-red-500" />
                       )}
                       <span className="capitalize">{log.action}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">
                    <div className="flex items-center gap-1">
                      {log.userEmail || log.userId}
                    </div>
                  </td>
                  <td className="p-4 text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
