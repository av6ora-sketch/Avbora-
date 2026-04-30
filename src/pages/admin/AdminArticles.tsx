import React, { useState, useEffect } from 'react';
import { LayoutGrid, CheckCircle, XCircle, FileText, Trash2, Edit, Loader2, Save, X, ExternalLink } from 'lucide-react';
import { db, auth } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface Article {
  id: string;
  title: string;
  content: string;
  blogName: string;
  userId: string;
  status: string;
  bloggerUrl?: string;
  createdAt: any;
}

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Article[] = [];
      snapshot.forEach(doc => {
        fetched.push({ id: doc.id, ...doc.data() } as Article);
      });
      setArticles(fetched);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'articles');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السجل نهائياً من قاعدة البيانات؟ (لن يتم حذفه من بلوجر)")) return;
    try {
      await deleteDoc(doc(db, 'articles', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `articles/${id}`);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'articles', editingArticle.id), {
        title: editingArticle.title,
        content: editingArticle.content,
        status: editingArticle.status
      });
      setEditingArticle(null);
      alert("تم تحديث المقال بنجاح!");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `articles/${editingArticle.id}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="text-right">
          <h1 className="text-3xl font-bold text-white mb-2">إدارة المقالات</h1>
          <p className="text-gray-400 text-sm">راجع، عدل، أو احذف المقالات المنشورة عبر جميع المستخدمين.</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-950/50 border-b border-gray-800 text-xs uppercase tracking-widest text-gray-500">
                <th className="p-5 font-bold">المقال</th>
                <th className="p-5 font-bold">المدونة</th>
                <th className="p-5 font-bold text-center">الحالة</th>
                <th className="p-5 font-bold text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : articles.map(article => (
                <tr key={article.id} className="hover:bg-gray-800/30 transition">
                  <td className="p-5">
                    <div className="font-bold text-white mb-1">{article.title}</div>
                    {article.bloggerUrl && (
                      <a href={article.bloggerUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                         عرض على المدونة <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                  <td className="p-5 text-gray-300">
                    <div className="font-medium">{article.blogName}</div>
                    <div className="text-[10px] text-gray-600 uppercase font-black">ID: {article.userId}</div>
                  </td>
                  <td className="p-5 text-center">
                    <span className={`uppercase text-[10px] font-black tracking-widest px-2 py-1 rounded ${article.status === 'published' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
                      {article.status === 'published' ? 'منشور' : 'مسودة'}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => setEditingArticle(article)}
                        className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition" 
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(article.id)}
                        className="p-2 bg-red-900/20 hover:bg-red-600 text-red-500 hover:text-white rounded-lg transition" 
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && articles.length === 0 && (
            <div className="p-20 text-center text-gray-500">
              لا توجد مقالات مسجلة حالياً.
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" onClick={() => setEditingArticle(null)} />
          <div className="relative bg-gray-900 border border-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95" dir="rtl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">تعديل المقال</h2>
              <button onClick={() => setEditingArticle(null)} className="text-gray-500 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="space-y-1 text-right">
                <label className="text-gray-500 text-xs font-bold uppercase tracking-widest">عنوان المقال</label>
                <input 
                  value={editingArticle.title}
                  onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1 text-right">
                <label className="text-gray-500 text-xs font-bold uppercase tracking-widest">المحتوى (HTML)</label>
                <textarea 
                  value={editingArticle.content}
                  onChange={(e) => setEditingArticle({...editingArticle, content: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none h-64 font-mono text-xs"
                />
              </div>

              <div className="pt-4">
                <button 
                  disabled={isSaving}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  حفظ التغييرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
