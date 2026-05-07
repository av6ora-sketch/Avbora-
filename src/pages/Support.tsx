import React, { useEffect, useState, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, query, getDocs, addDoc, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Ticket, Loader2, Send, MessageSquare, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

export default function Support() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const { user, profile } = useAuth();
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'support'), where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetched: any[] = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTickets(fetched);
      
      // Update active ticket if it's currently selected
      if (activeTicket) {
        const updated = fetched.find(t => t.id === activeTicket.id);
        if (updated) setActiveTicket(updated);
      }
      
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'support');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, activeTicket?.id]);

  useEffect(() => {
    if (activeTicket) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTicket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject.trim() || !message.trim()) return;
    
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'support'), {
        userId: user.uid,
        userName: user.displayName || profile?.name || 'User',
        userEmail: user.email || '',
        subject: subject.trim(),
        message: message.trim(),
        status: 'open',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setSubject('');
      setMessage('');
      setShowForm(false);
      setActiveTicket({ id: docRef.id, subject: subject.trim(), status: 'open', message: message.trim(), createdAt: new Date().toISOString() });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'support');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!user || !activeTicket || !replyText.trim()) return;

    try {
      const newReply = {
        text: replyText.trim(),
        senderRole: 'user',
        senderName: user.displayName || profile?.name || 'User',
        createdAt: new Date().toISOString()
      };
      
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'support', activeTicket.id), { 
        messages: [...(activeTicket.messages || []), newReply],
        updatedAt: new Date().toISOString(),
        status: 'open'
      });
      
      setReplyText('');
    } catch (e) {
      console.error(e);
      alert('Failed to send reply');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  if (activeTicket) {
    return (
      <div className="absolute inset-0 z-20 flex flex-col bg-gray-950">
        {/* Chat Header */}
        <div className="bg-gray-900 border-b border-gray-800 p-4 flex flex-wrap sm:flex-nowrap items-center gap-4 shrink-0">
          <button 
            onClick={() => setActiveTicket(null)}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{activeTicket.subject}</h2>
            <span className={`text-xs font-bold uppercase ${
              activeTicket.status === 'answered' ? 'text-emerald-500' : 
              activeTicket.status === 'closed' ? 'text-gray-500' : 
              'text-blue-500'
            }`}>
              {activeTicket.status}
            </span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/30">
          {/* Initial Message */}
          <div className="flex justify-end">
            <div className="bg-blue-900/40 border border-blue-800/50 text-blue-50 max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{activeTicket.message}</p>
              <span className="text-[10px] text-blue-300/70 block text-right mt-1.5 font-medium">
                {new Date(activeTicket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Legacy Replies */}
          {activeTicket.adminReplies && activeTicket.adminReplies.length > 0 && activeTicket.adminReplies.map((reply: any, idx: number) => {
            const replyText = typeof reply === 'string' ? reply : reply.message;
            return (
              <div key={`legacy-${idx}`} className="flex justify-start">
                <div className="bg-gray-800/80 border border-gray-700/50 text-gray-200 max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="text-[11px] text-emerald-400 font-bold mb-1 tracking-wide uppercase">Support Team</div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{replyText}</p>
                </div>
              </div>
            );
          })}

          {/* New Messages Array */}
          {activeTicket.messages && activeTicket.messages.map((msg: any, idx: number) => {
            const isUser = msg.senderRole === 'user';
            return (
              <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                  isUser 
                    ? 'bg-blue-900/40 border border-blue-800/50 text-blue-50 rounded-tr-sm' 
                    : 'bg-gray-800/80 border border-gray-700/50 text-gray-200 rounded-tl-sm'
                }`}>
                  {!isUser && <div className="text-[11px] text-emerald-400 font-bold mb-1 tracking-wide uppercase">Support Team</div>}
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                  <span className={`text-[10px] block text-right mt-1.5 font-medium ${isUser ? 'text-blue-300/70' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="bg-gray-900 border-t border-gray-800 p-4 shrink-0">
          {activeTicket.status === 'closed' ? (
            <div className="text-center text-sm text-gray-400 py-2">
              This ticket has been closed. Please open a new ticket for further assistance.
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 resize-none max-h-32 min-h-[48px]"
                style={{ height: replyText ? 'auto' : '48px' }}
              />
              <button 
                onClick={handleReply}
                disabled={!replyText.trim()}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition shrink-0 h-12 w-12 flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Support Center</h1>
          <p className="text-gray-400">Need help? Open a ticket to chat with our team.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : 'New Ticket'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 mb-8 animate-in fade-in slide-in-from-top-4 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6">Start a Conversation</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-gray-950/50 border border-gray-800 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="What do you need help with?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full bg-gray-950/50 border border-gray-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed"
                placeholder="Describe your issue in detail..."
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-900/20"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <MessageSquare className="w-5 h-5" />
                )}
                Start Chat
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
           <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-lg">No active chats found.</p>
            <p className="text-sm mt-1">If you have any issues, feel free to start a new chat.</p>
          </div>
        ) : (
          <div className="grid divide-y divide-gray-800">
             {tickets.map(ticket => (
               <button 
                 key={ticket.id} 
                 onClick={() => setActiveTicket(ticket)}
                 className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-gray-800/50 transition text-left gap-4"
               >
                 <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                     <h3 className="text-lg font-bold text-white truncate">{ticket.subject}</h3>
                     <span className={`shrink-0 px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                       ticket.status === 'answered' ? 'bg-emerald-900/30 text-emerald-500 border border-emerald-900/50' : 
                       ticket.status === 'closed' ? 'bg-gray-800 text-gray-400 border border-gray-700' : 
                       'bg-blue-900/30 text-blue-500 border border-blue-900/50'
                     }`}>
                       {ticket.status}
                     </span>
                   </div>
                   <p className="text-sm text-gray-400 truncate">
                     {ticket.messages && ticket.messages.length > 0 
                       ? ticket.messages[ticket.messages.length - 1].text 
                       : ticket.message}
                   </p>
                 </div>
                 <div className="shrink-0 text-xs text-gray-500 whitespace-nowrap">
                   {new Date(ticket.updatedAt || ticket.createdAt).toLocaleDateString()}
                 </div>
               </button>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}

