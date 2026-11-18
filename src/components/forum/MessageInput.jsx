import React, { useState, useRef } from 'react';
import { Send, Smile, Paperclip, X } from 'lucide-react';

export default function MessageInput({ onSendMessage, onTyping, replyTarget, onCancelReply }) {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);

    if (onTyping) {
      onTyping(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (onTyping) onTyping(false);
    onSendMessage(text.trim());
    setText('');
    if (onCancelReply) onCancelReply();
  };

  return (
    <div className="space-y-2">
      {/* Reply Quote Target */}
      {replyTarget && (
        <div className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border-l-4 border-blue-600 text-xs">
          <div>
            <span className="font-bold text-blue-900 dark:text-blue-200">Membalas @{replyTarget.senderName}:</span>
            <p className="text-slate-600 dark:text-slate-300 line-clamp-1 italic mt-0.5">"{replyTarget.text}"</p>
          </div>
          <button onClick={onCancelReply} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-md">
        <input
          type="text"
          value={text}
          onChange={handleChange}
          placeholder="Tulis pesan diskusi real-time (Kelompok B7)..."
          className="flex-1 px-3 py-2 bg-transparent text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
        />

        <button
          type="submit"
          disabled={!text.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:opacity-40 transition-all shadow-md shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
