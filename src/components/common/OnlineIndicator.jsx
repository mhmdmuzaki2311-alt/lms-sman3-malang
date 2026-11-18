import React from 'react';

export default function OnlineIndicator({ status = 'online', showLabel = false, size = 'md' }) {
  const isOnline = status === 'online' || status === 'connected';
  const isReconnecting = status === 'reconnecting';
  
  const sizeMap = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  let colorClass = 'bg-emerald-500';
  let pulseClass = 'bg-emerald-400';
  let labelText = 'Online';

  if (isReconnecting) {
    colorClass = 'bg-amber-500';
    pulseClass = 'bg-amber-400';
    labelText = 'Menghubungkan...';
  } else if (!isOnline) {
    colorClass = 'bg-slate-400';
    pulseClass = 'bg-slate-300';
    labelText = 'Offline';
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span className="relative flex h-3 w-3">
        {isOnline && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pulseClass} opacity-75`}></span>
        )}
        <span className={`relative inline-flex rounded-full ${sizeMap[size] || 'w-3 h-3'} ${colorClass}`}></span>
      </span>
        {showLabel && (
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
          {labelText}
        </span>
      )}
    </div>
  );
}
