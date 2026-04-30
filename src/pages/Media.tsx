import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, addDoc, onSnapshot, where, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { MessageSquare, Loader2, Briefcase, ShoppingCart, Palette, Hash, Image as ImageIcon, X } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { useAuth } from '../contexts/AuthContext';

interface Post {
  id: string;
  userId: string;
  userName?: string;
  type?: 'portfolio' | 'hiring' | 'buying' | 'general';
  content: string;
  imageUrl?: string;
  status?: string;
  likes?: string[];
  sharesCount?: number;
  comments?: any[];
  createdAt: string;
}

const POST_TYPES = [
  { id: 'general', label: 'Discussion', icon: Hash, color: 'text-gray-400 bg-gray-800 border-gray-700' },
  { id: 'portfolio', label: 'Showcase Work', icon: Palette, color: 'text-purple-400 bg-purple-900/30 border-purple-900/50' },
  { id: 'hiring', label: 'Hiring', icon: Briefcase, color: 'text-blue-400 bg-blue-900/30 border-blue-900/50' },
  { id: 'buying', label: 'Looking to Buy', icon: ShoppingCart, color: 'text-emerald-400 bg-emerald-900/30 border-emerald-900/50' }
] as const;

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [postType, setPostType] = useState<Post['type']>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile, user } = useAuth();
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'posts'), where('status', '==', 'approved'), orderBy('createdAt', 'desc')); 
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetched: Post[] = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as Post);
      });
      setPosts(fetched);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB limit for firestore document
      alert("Image is too large. Please select an image under 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageFile(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePost = async () => {
    if ((!newPostContent.trim() && !imageFile) || !user) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        userName: profile?.name || user.displayName || 'User',
        type: postType,
        content: newPostContent.trim(),
        imageUrl: imageFile || null,
        likes: [],
        comments: [],
        sharesCount: 0,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setNewPostContent('');
      setPostType('general');
      setImageFile(null);
      alert('Post submitted successfully and is pending admin approval!');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'posts');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (post: Post) => {
    if (!user) return;
    try {
      const postRef = doc(db, 'posts', post.id);
      const isLiked = post.likes?.includes(user.uid);
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `posts/${post.id}`);
    }
  };

  const handleComment = async (post: Post) => {
    if (!user || !commentText.trim()) return;
    try {
      const postRef = doc(db, 'posts', post.id);
      const newComment = {
        userId: user.uid,
        userName: profile?.name || user.displayName || 'User',
        text: commentText.trim(),
        createdAt: new Date().toISOString()
      };
      await updateDoc(postRef, {
        comments: arrayUnion(newComment)
      });
      setCommentText('');
      setActiveCommentPost(null);
    } catch(e) {
      console.error(e);
    }
  };

  const handleShare = async (post: Post) => {
    try {
      await updateDoc(doc(db, 'posts', post.id), {
        sharesCount: (post.sharesCount || 0) + 1
      });
      // Try to use native share if available, otherwise just copy to clipboard
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this post',
          text: post.content,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getTypeInfo = (type?: string) => {
    return POST_TYPES.find(t => t.id === type) || POST_TYPES[0];
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Community Hub</h1>
        <p className="text-gray-400">Share your work, find talent, or request services from the community.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl mb-6 shadow-sm overflow-hidden">
        <div className="p-4 flex gap-3">
          <div className="w-10 h-10 shrink-0 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center font-bold border border-blue-900/50">
            {profile?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <textarea 
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder={`What's on your mind, ${profile?.name || 'User'}?`} 
              className="w-full bg-transparent text-white focus:outline-none resize-none pt-2 text-[15px] placeholder-gray-500"
              rows={newPostContent.split('\n').length > 1 ? Math.min(newPostContent.split('\n').length, 5) : 1}
            />
            {imageFile && (
              <div className="relative mt-2 rounded-lg overflow-hidden border border-gray-800 shrink-0 inline-block">
                <img src={imageFile} alt="Upload preview" className="max-h-64 object-cover" />
                <button 
                  onClick={() => setImageFile(null)}
                  className="absolute top-2 right-2 p-1 bg-gray-900/80 text-white rounded-full hover:bg-red-500 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="px-4 pb-3 border-t border-gray-800/50 pt-3 flex flex-wrap items-center justify-between gap-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            {POST_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = postType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setPostType(type.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold hover:bg-gray-800 transition-colors ${
                    isSelected 
                      ? type.color 
                      : 'text-gray-400 border-transparent bg-transparent hover:border-gray-700 hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                </button>
              );
            })}
            
            <div className="w-px h-6 bg-gray-800 mx-1 hidden sm:block"></div>
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Photo</span>
            </button>
          </div>
          
          <button 
            disabled={isSubmitting || (!newPostContent.trim() && !imageFile)}
            onClick={handlePost} 
            className="px-6 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold rounded-lg transition min-w-[80px] flex items-center justify-center text-sm ml-auto"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          {posts.length === 0 && (
            <div className="text-center py-16 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-lg">No posts yet. Start the conversation!</p>
            </div>
          )}

          {posts.map(post => {
            const typeInfo = getTypeInfo(post.type);
            const TypeIcon = typeInfo.icon;
            
            return (
              <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-xl shadow-sm mb-4">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center font-bold text-base border border-blue-900/50 cursor-pointer hover:opacity-80 transition">
                        {(post.userName || post.userId).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <div className="font-bold text-white text-[15px] cursor-pointer hover:underline leading-none mb-1">
                          {post.userName || `User ${post.userId.substring(0,4)}`}
                        </div>
                        <div className="text-[13px] text-gray-500 flex items-center gap-1 leading-none">
                          {new Date(post.createdAt).toLocaleString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                          <span aria-hidden="true">·</span>
                          <svg className="w-3 h-3 fill-current opacity-80" viewBox="0 0 16 16"><path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm4 11.2c-.2.2-.5.3-.8.3H4.8c-.3 0-.6-.1-.8-.3-.2-.2-.3-.5-.3-.8V5.6c0-.3.1-.6.3-.8.2-.2.5-.3.8-.3h6.4c.3 0 .6.1.8.3.2.2.3.5.3.8v4.8c0 .3-.1.6-.3.8z"/></svg>
                        </div>
                      </div>
                    </div>
                    
                    {post.type && post.type !== 'general' && (
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${typeInfo.color.replace('rounded-full border', '')}`}>
                        <TypeIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{typeInfo.label}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-200 whitespace-pre-wrap leading-relaxed text-[15px] mb-2">{post.content}</p>
                  {post.imageUrl && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-gray-800">
                      <img src={post.imageUrl} alt="Post attachment" className="w-full max-h-96 object-cover" />
                    </div>
                  )}
                </div>
                
                <div className="px-4 py-1 flex items-center justify-between text-gray-400 text-[13px] border-b border-gray-800/50">
                  <div className="flex items-center gap-1.5 py-2 cursor-pointer hover:underline">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                    </div>
                    <span>{post.likes?.length || 0}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="cursor-pointer hover:underline" onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}>
                      {post.comments?.length || 0} Comments
                    </span>
                    <span className="cursor-pointer hover:underline">{post.sharesCount || 0} Shares</span>
                  </div>
                </div>

                <div className="px-2 py-1 flex gap-1 text-[15px] font-semibold text-gray-400">
                  <button 
                    onClick={() => handleLike(post)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition ${
                      user && post.likes?.includes(user.uid) ? 'text-blue-500 bg-blue-500/10' : 'hover:bg-gray-800 hover:text-gray-300'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={user && post.likes?.includes(user.uid) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                    Like
                  </button>
                  <button 
                    onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-800 hover:text-gray-300 rounded-md transition"
                  >
                    <MessageSquare className="w-[18px] h-[18px]" />
                    Comment
                  </button>
                  <button 
                    onClick={() => handleShare(post)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-800 hover:text-gray-300 rounded-md transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    Share
                  </button>
                </div>

                {/* Comments Section */}
                {activeCommentPost === post.id && (
                  <div className="px-4 py-3 bg-gray-950/50 border-t border-gray-800/50">
                    <div className="space-y-3 mb-3 max-h-60 overflow-y-auto">
                      {post.comments?.map((comment, i) => (
                        <div key={i} className="flex gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-900/50 shrink-0">
                            {comment.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="bg-gray-800/50 rounded-2xl px-3 py-2 flex-1 relative">
                            <div className="font-bold text-white text-[13px]">{comment.userName}</div>
                            <div className="text-gray-300 text-[14px]">{comment.text}</div>
                            <div className="absolute -bottom-4 right-1 text-[10px] text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!post.comments || post.comments.length === 0) && (
                        <div className="text-center text-sm text-gray-500 py-2">No comments yet.</div>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-900/50 shrink-0">
                        {profile?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 flex bg-gray-900 border border-gray-800 rounded-full overflow-hidden focus-within:border-gray-600 transition">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleComment(post);
                          }}
                          placeholder="Write a comment..."
                          className="flex-1 bg-transparent px-3 py-2 text-sm text-white focus:outline-none"
                        />
                      </div>
                      <button 
                        onClick={() => handleComment(post)}
                        disabled={!commentText.trim()}
                        className="w-8 h-8 flex items-center justify-center shrink-0 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-full transition"
                      >
                        <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
