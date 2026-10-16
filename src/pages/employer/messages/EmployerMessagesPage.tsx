import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  Search,
  User,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { employerService } from '../../../lib/employerService';
import { Message, Profile } from '../../../types/database';

export function EmployerMessagesPage() {
  const { company, profile } = useAuth();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState('');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<
    Record<string, Array<{ id: string; sender: 'employer' | 'candidate'; text: string; time: string }>>
  >({});

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'employer' as const,
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? { ...c, lastMessage: inputText, time: 'Just now', unread: 0 }
          : c
      )
    );

    setInputText('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full h-[calc(100vh-4rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-indigo-400" />
            Candidate Direct Messaging
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Communicate securely with active applicants in company-isolated channels
          </p>
        </div>
      </div>

      {/* Messaging Panel Grid */}
      <div className="flex-1 min-h-0 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-3">
        {/* Left: Conversations List */}
        <div className="border-r border-slate-800 flex flex-col h-full bg-slate-950/40">
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate conversations..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                <p className="text-xs font-medium text-slate-400">No active candidate conversations</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  When you initiate direct messaging with applicants or receive candidate inquiries, they will appear here.
                </p>
              </div>
            ) : (
              conversations.map((c) => {
                const isActive = c.id === activeConvId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                      isActive ? 'bg-indigo-600/15 border-l-2 border-indigo-500' : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={c.candidate.avatar}
                        alt={c.candidate.name}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-800"
                      />
                      {c.candidate.online && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-2 ring-slate-900" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate">{c.candidate.name}</h4>
                        <span className="text-[10px] text-slate-500">{c.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{c.candidate.role}</p>
                      <p className="text-xs text-slate-300 truncate">{c.lastMessage}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat Stream */}
        <div className="md:col-span-2 flex flex-col h-full bg-slate-900">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                <div className="flex items-center gap-3">
                  <img
                    src={activeConv.candidate.avatar}
                    alt={activeConv.candidate.name}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-800"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-white">{activeConv.candidate.name}</h3>
                    <p className="text-[11px] text-slate-400">{activeConv.candidate.role}</p>
                  </div>
                </div>

                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium">
                  Direct Applicant
                </span>
              </div>

              {/* Message Bubbles */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/20">
                {(messages[activeConvId] || []).map((msg) => {
                  const isEmp = msg.sender === 'employer';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isEmp ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                          isEmp
                            ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                            : 'bg-slate-800 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
                    </div>
                  );
                })}
              </div>

              {/* Message Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Send message to ${activeConv.candidate.name}...`}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
              Select a candidate conversation to start messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
