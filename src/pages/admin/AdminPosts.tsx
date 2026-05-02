import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrors';
import { MessageSquare, Check, X, Trash2, ShieldAlert } from 'lucide-react';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

interface Post {
  id: string;
  userId: string;
  userName?: string;
  type?: string;
  content: string;
  imageUrl?: string;
  status: string;
  likes?: string[];
  comments?: Comment[];
  createdAt: string;
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Post[] = [];
      snapshot.forEach(doc => {
        fetched.push({ id: doc.id, ...doc.data() } as Post);
      });
      setPosts(fetched);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'posts', id), { status });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `posts/${id}`);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post entirely?')) return;
    try {
      await deleteDoc(doc(db, 'posts', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `posts/${id}`);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      const post = posts.find(p => p.id === postId);
      if (!post || !post.comments) return;
      const newComments = post.comments.filter(c => c.id !== commentId);
      await updateDoc(doc(db, 'posts', postId), { comments: newComments });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold text-white">Social Posts Moderation</h1>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No posts found.</div>
        ) : posts.map(post => (
          <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-bold text-lg text-white">{post.userName || 'Unknown User'}</div>
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="uppercase text-xs font-mono bg-gray-800 px-2 py-0.5 rounded">{post.type || 'general'}</span>
                  <span>•</span>
                  <span className={`text-xs font-bold ${post.status === 'approved' ? 'text-green-500' : post.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>
                    {post.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {post.status !== 'approved' && (
                  <button onClick={() => handleUpdateStatus(post.id, 'approved')} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg transition" title="Approve Post">
                    <Check className="w-4 h-4" />
                  </button>
                )}
                {post.status !== 'rejected' && (
                  <button onClick={() => handleUpdateStatus(post.id, 'rejected')} className="p-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded-lg transition" title="Reject Post">
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => handleDeletePost(post.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition" title="Delete Post">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-gray-300 whitespace-pre-wrap mb-4">{post.content}</div>
            
            {post.imageUrl && (
              <img src={post.imageUrl} alt="Post" className="w-full max-w-sm rounded-lg object-cover mb-4" />
            )}

            {/* Comments Section */}
            {post.comments && post.comments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <h4 className="text-gray-400 font-medium mb-3 text-sm flex items-center gap-2">Comments ({post.comments.length})</h4>
                <div className="space-y-3">
                  {post.comments.map(comment => (
                    <div key={comment.id} className="flex justify-between items-start bg-gray-950 p-3 rounded-lg border border-gray-800/50">
                      <div>
                        <div className="text-sm font-bold text-gray-300">{comment.userName || 'Unknown'}</div>
                        <div className="text-sm text-gray-400 mt-1">{comment.text}</div>
                      </div>
                      <button onClick={() => handleDeleteComment(post.id, comment.id)} className="p-1 hover:text-red-500 text-gray-500 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
