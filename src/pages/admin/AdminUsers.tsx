import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Loader2, Trash2, Edit2, Check, X } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? (This only deletes their profile doc)')) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      setUsers(users.filter(u => u.id !== id));
    } catch (e) {
      console.error(e);
      alert('Failed to delete user');
    }
  };

  const handleEdit = (user: any) => {
    setEditingId(user.id);
    setEditForm({ ...user });
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'users', editForm.id), {
        name: editForm.name,
        email: editForm.email,
        subscriptionPlan: editForm.subscriptionPlan,
        role: editForm.role || 'user'
      });
      setUsers(users.map(u => u.id === editForm.id ? editForm : u));
      setEditingId(null);
    } catch (e) {
      console.error(e);
      alert('Failed to update user');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Manage Users</h1>
      {loading ? (
        <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-950 border-b border-gray-800 text-gray-400">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-800/30">
                    {editingId === user.id ? (
                      <>
                        <td className="p-4"><input className="bg-gray-950 border border-gray-700 px-2 py-1 rounded w-full" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></td>
                        <td className="p-4"><input className="bg-gray-950 border border-gray-700 px-2 py-1 rounded w-full" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} disabled /></td>
                        <td className="p-4">
                          <select className="bg-gray-950 border border-gray-700 px-2 py-1 rounded w-full" value={editForm.subscriptionPlan || 'Free'} onChange={e => setEditForm({...editForm, subscriptionPlan: e.target.value})}>
                            <option value="Free">Free</option>
                            <option value="Pro">Pro</option>
                          </select>
                        </td>
                        <td className="p-4">
                           <select className="bg-gray-950 border border-gray-700 px-2 py-1 rounded w-full" value={editForm.role || 'user'} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button onClick={handleSave} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setEditingId(null)} className="p-2 text-gray-500 hover:bg-gray-800 rounded"><X className="w-4 h-4" /></button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4 text-white font-medium">{user.name}</td>
                        <td className="p-4 text-gray-400">{user.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${user.subscriptionPlan === 'Pro' ? 'bg-blue-900/30 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>
                            {user.subscriptionPlan || 'Free'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-red-900/30 text-red-500' : 'bg-gray-800 text-gray-400'}`}>
                            {user.role || 'User'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleEdit(user)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded transition m-1"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(user.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded transition m-1"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
