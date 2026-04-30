import React, { useEffect, useState, useRef } from 'react';
import { db } from '../../firebase';
import { collection, query, doc, updateDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { Loader2, MessageSquare, Send, ArrowLeft } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrors';

export default function AdminSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'support'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTickets(data);
      
      if (activeTicket) {
        const updated = data.find(t => t.id === activeTicket.id);
        if (updated) setActiveTicket(updated);
      }
      
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'support');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeTicket?.id]);

  useEffect(() => {
    if (activeTicket) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTicket]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'support', id), { status });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `support/${id}`);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !activeTicket) return;
    try {
      const newReply = {
        text: replyText.trim(),
        senderRole: 'admin',
        senderName: 'Support Team',
        createdAt: new Date().toISOString()
      };
      
      await updateDoc(doc(db, 'support', activeTicket.id), { 
        messages: [...(activeTicket.messages || []), newReply], 
        status: 'answered',
        updatedAt: new Date().toISOString()
      });
      setReplyText('');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `support/${activeTicket.id}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex bg-gray-950 overflow-hidden">
      
      {/* Sidebar - Tickets List */}
      <div className={`w-full md:w-1/3 border-r border-gray-800 flex flex-col ${activeTicket ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-800 bg-gray-950">
          <h2 className="text-xl font-bold text-white">Support Chats</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
             <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No tickets found.</div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {tickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => setActiveTicket(ticket)}
                  className={`w-full text-left p-4 hover:bg-gray-800 transition ${activeTicket?.id === ticket.id ? 'bg-gray-800' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-white text-sm truncate pr-2">{ticket.userName || 'User'}</h3>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap">
                      {new Date(ticket.updatedAt || ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-medium truncate mb-1">{ticket.subject}</div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 truncate pr-2">
                       {ticket.messages && ticket.messages.length > 0 
                         ? ticket.messages[ticket.messages.length - 1].text 
                         : ticket.message}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                      ticket.status === 'open' ? 'bg-blue-900/30 text-blue-500' :
                      ticket.status === 'answered' ? 'bg-emerald-900/30 text-emerald-500' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Chat Area */}
      <div className={`flex-1 flex flex-col bg-gray-950 ${!activeTicket ? 'hidden md:flex' : 'flex'}`}>
        {!activeTicket ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a chat to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button 
                  onClick={() => setActiveTicket(null)}
                  className="md:hidden p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="truncate">
                  <h2 className="text-white font-bold truncate">{activeTicket.subject}</h2>
                  <p className="text-xs text-gray-400 truncate">{activeTicket.userName} ({activeTicket.userEmail || activeTicket.userId})</p>
                </div>
              </div>
              <div className="shrink-0 ml-4 border-l border-gray-800 pl-4 justify-end">
                <select 
                  value={activeTicket.status || 'open'} 
                  onChange={(e) => handleUpdateStatus(activeTicket.id, e.target.value)}
                  className={`bg-gray-950 border px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition focus:outline-none ${
                    activeTicket.status === 'open' ? 'text-blue-500 border-blue-500/50 hover:bg-blue-900/20' :
                    activeTicket.status === 'answered' ? 'text-emerald-500 border-emerald-500/50 hover:bg-emerald-900/20' :
                    'text-gray-400 border-gray-700 hover:bg-gray-800'
                  }`}
                >
                  <option value="open">Open</option>
                  <option value="answered">Answered</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Initial user message */}
              <div className="flex justify-start">
                <div className="bg-gray-800 text-white max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3">
                  <p className="whitespace-pre-wrap text-sm">{activeTicket.message}</p>
                  <span className="text-[10px] text-gray-400 block text-right mt-1">
                    {new Date(activeTicket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Legacy Replies */}
              {activeTicket.adminReplies && activeTicket.adminReplies.length > 0 && activeTicket.adminReplies.map((reply: any, idx: number) => {
                const replyText = typeof reply === 'string' ? reply : reply.message;
                return (
                  <div key={`legacy-${idx}`} className="flex justify-end">
                    <div className="bg-blue-600 text-white max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3">
                      <p className="whitespace-pre-wrap text-sm">{replyText}</p>
                    </div>
                  </div>
                );
              })}

              {/* New Messages Array */}
              {activeTicket.messages && activeTicket.messages.map((msg: any, idx: number) => {
                const isAdmin = msg.senderRole === 'admin';
                return (
                  <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      isAdmin 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-gray-800 text-white rounded-tl-sm'
                    }`}>
                      <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                      <span className={`text-[10px] block text-right mt-1 ${isAdmin ? 'text-blue-200' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-gray-900 border-t border-gray-800 shrink-0">
               <div className="flex items-end gap-2">
                 <textarea
                   value={replyText}
                   onChange={(e) => setReplyText(e.target.value)}
                   onKeyDown={handleKeyDown}
                   placeholder="Type your reply..."
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
            </div>
          </>
        )}
      </div>
      
    </div>
  );
}
