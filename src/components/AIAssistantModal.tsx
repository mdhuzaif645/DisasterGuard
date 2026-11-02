/**
 * DisasterGuard AI Safety Assistant Panel & Modal
 * Powered by Google Gemini on the backend server.
 */

import React, { useState } from 'react';
import { api } from '../api/client';
import { LanguageCode } from '../types';
import { Sparkles, Send, X, ShieldAlert, Bot, User, PhoneCall, HelpCircle } from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, language }) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello, I am your DisasterGuard AI Safety Advisor. Ask me anything about preparing for floods, cyclones, earthquakes, heatwaves, or how to handle emergency situations safely.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'What are the 3 immediate steps for a cyclone warning?',
    'How do I safely purify water during urban floods?',
    'What must go into a 72-hour family emergency go-bag?',
    'Should I turn off electricity if flood water enters home?',
  ];

  const handleSend = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setPrompt('');
    setIsLoading(true);

    try {
      const res = await api.askAI(userText, { language });
      setMessages([...newMessages, { role: 'assistant', content: res.reply }]);
    } catch (_err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content:
            'Unable to contact AI service at this moment. For urgent safety, follow official instructions from district authorities or call emergency helpline 112.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-indigo-700/60 rounded-2xl shadow-2xl flex flex-col h-[650px] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 px-6 py-4 flex items-center justify-between border-b border-indigo-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                DisasterGuard AI Safety Advisor
                <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                  Gemini Flash
                </span>
              </h2>
              <p className="text-xs text-indigo-200">Official preparedness advice & simple alert clarifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Disclaimer Banner */}
        <div className="bg-slate-950 px-6 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>AI advice does not replace official alerts. Life-threatening emergency?</span>
          <a href="tel:112" className="text-rose-400 font-bold hover:underline flex items-center gap-1">
            <PhoneCall className="w-3 h-3" /> Dial 112
          </a>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs leading-relaxed ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-900/60 flex items-center justify-center flex-shrink-0 text-indigo-400 border border-indigo-700/50">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-3.5 shadow-sm ${
                  m.role === 'user'
                    ? 'bg-rose-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {m.content}
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-rose-900/60 flex items-center justify-center flex-shrink-0 text-rose-300 border border-rose-700/50">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 text-xs items-center text-slate-400">
              <div className="w-7 h-7 rounded-lg bg-indigo-900/60 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-400 animate-spin" />
              </div>
              <span className="italic">Reviewing safety guidelines and generating steps...</span>
            </div>
          )}
        </div>

        {/* Preset Prompt Chips */}
        <div className="px-6 py-2 bg-slate-950/80 border-t border-slate-800 overflow-x-auto flex gap-2 no-scrollbar">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              className="text-[11px] whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700 transition"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(prompt);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask safety questions (e.g. 'What supplies for cyclone?')..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
