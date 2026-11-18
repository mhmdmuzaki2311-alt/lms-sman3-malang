import React from 'react';

export default function TypingIndicator({ typingUsers = [] }) {
  if (!typingUsers || typingUsers.length === 0) return null;

  const text = typingUsers.length === 1
    ? `${typingUsers[0]} sedang mengetik...`
    : `${typingUsers.join(', ')} sedang mengetik...`;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs italic animate-pulse">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-150"></span>
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-300"></span>
      </div>
      <span className="font-medium text-[11px]">{text}</span>
    </div>
  );
}
