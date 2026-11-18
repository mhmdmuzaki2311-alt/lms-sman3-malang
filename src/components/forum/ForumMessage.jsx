import React from 'react';
import { ROLE_BADGES, formatTimeAgo } from '../../utils/helpers';
import { MessageSquare, ThumbsUp, Flame, Heart } from 'lucide-react';

export default function ForumMessage({ message, isOwnMessage, onReply }) {
  const roleBadge = ROLE_BADGES[message.senderRole] || ROLE_BADGES.siswa;

  return (
    <div className={`flex gap-3 max-w-2xl ${isOwnMessage ? 'ml-auto flex-row-reverse' : ''}`}>
      
      {/* Sender Avatar */}
      <img
        src={message.senderAvatar}
        alt={message.senderName}
        className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-slate-200 dark:ring-slate-700"
      />

      <div className={`space-y-1 ${isOwnMessage ? 'items-end text-right' : ''}`}>
        
        {/* Header Metadata */}
        <div className={`flex items-center gap-2 ${isOwnMessage ? 'justify-end' : ''}`}>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{message.senderName}</span>
          <span
            className="text-[9px] font-extrabold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: roleBadge.bg, color: roleBadge.color }}
          >
            {roleBadge.text}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {formatTimeAgo(message.createdAt)}
          </span>
        </div>

        {/* Message Content Bubble */}
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm transition-all ${
            isOwnMessage
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
              : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>

        {/* Reactions & Reply Action */}
        <div className={`flex items-center gap-2 pt-1 ${isOwnMessage ? 'justify-end' : ''}`}>
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full text-[10px] text-slate-600 dark:text-slate-300 font-bold">
              {Object.entries(message.reactions).map(([emoji, count]) => (
                <span key={emoji}>{emoji} {count}</span>
              ))}
            </div>
          )}

          {onReply && (
            <button
              onClick={() => onReply(message)}
              className="text-[10px] font-semibold text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <MessageSquare className="w-3 h-3" /> Balas
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
