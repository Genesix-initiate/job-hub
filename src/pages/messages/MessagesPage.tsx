import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  CheckCheck,
  Building2,
  FileText,
  Clock,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';

export function MessagesPage() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [messagesList, setMessagesList] = useState<any[]>([]);

  useEffect(() => {
    if (profile?.id) {
      dataService.getConversations(profile.id).then((convs) => {
        setConversations(convs || []);
        if (convs && convs.length > 0 && !selectedConvId) {
          setSelectedConvId(convs[0].id);
        }
      });
    }
  }, [profile?.id, selectedConvId]);

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg = {
      id: `m-${Date.now()}`,
      sender_id: 'user',
      message: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };

    setMessagesList((prev) => [...prev, newMsg]);
    setMessageInput('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      <div>
        <span className="text-[11px] font-semibold uppercase text-emerald-400 tracking-wider">
          Direct Communications
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
          Employer Messages
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          End-to-end encrypted recruitment channels. Real-time participant chat.
        </p>
      </div>

      {/* Main Messaging Container */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px] shadow-xl">
        {/* Left Sidebar: Conversations List */}
        <div className="md:col-span-5 border-r border-slate-800 flex flex-col bg-slate-950/40">
          <div className="p-3.5 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search recruiters or messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-800/60">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                <p className="text-xs font-medium text-slate-400">No active conversations</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  When employers message you regarding your applications, they will appear here.
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = selectedConvId === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`p-4 transition cursor-pointer flex items-start gap-3 ${
                      isSelected ? 'bg-slate-900 border-l-2 border-emerald-500' : 'hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conv.partner.avatar}
                        alt={conv.partner.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      {conv.partner.online && (
                        <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full absolute bottom-0 right-0 border-2 border-slate-950" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate">{conv.partner.name}</h4>
                        <span className="text-[10px] text-slate-500 shrink-0">{conv.lastTime}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{conv.partner.title}</p>
                      <p className="text-xs text-slate-300 truncate">{conv.lastMessage}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Window: Active Chat Stream */}
        <div className="md:col-span-7 flex flex-col justify-between bg-slate-900/30">
          {activeConv ? (
            <>
              {/* Partner Chat Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <img
                    src={activeConv.partner.avatar}
                    alt={activeConv.partner.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-white">{activeConv.partner.name}</h3>
                    <p className="text-[11px] text-emerald-400">{activeConv.partner.title}</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active Channel
                </span>
              </div>

              {/* Message Feed */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3.5">
                {messagesList.map((m) => {
                  const isMe = m.sender_id === 'user';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                          isMe
                            ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                            : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                        }`}
                      >
                        {m.message}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        <span>{m.time}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-3.5 border-t border-slate-800 bg-slate-950/70 flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                  title="Attach file (PDF, PNG)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder="Type your message to the hiring coordinator..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition disabled:opacity-40 cursor-pointer shadow-md shadow-emerald-500/15"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center flex-1 text-xs text-slate-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
