import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { Wifi, WifiOff, RefreshCw, Radio } from 'lucide-react';

export default function ConnectionBadge() {
  const { connectionStatus, simulateDisconnect, simulateReconnect } = useSocket();

  const isConnected = connectionStatus === 'connected';
  const isReconnecting = connectionStatus === 'reconnecting';

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-2.5 px-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
      <div className="flex items-center gap-2">
        <Radio className={`w-4 h-4 ${isConnected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">WebSocket B7:</span>
        
        {isConnected && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Wifi className="w-3 h-3 text-emerald-600" /> Connected (Real-time)
          </span>
        )}

        {isReconnecting && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" /> Reconnecting...
          </span>
        )}

        {!isConnected && !isReconnecting && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <WifiOff className="w-3 h-3 text-rose-600" /> Disconnected
          </span>
        )}
      </div>

      {/* Interactive Simulator Tools for Capstone Testing */}
      <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
        {isConnected ? (
          <button
            onClick={simulateDisconnect}
            className="text-xs px-2.5 py-1 font-medium bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 rounded-lg transition-colors"
            title="Simulasi koneksi putus untuk menguji auto-reconnect"
          >
            Simulasi Disconnect
          </button>
        ) : (
          <button
            onClick={simulateReconnect}
            className="text-xs px-2.5 py-1 font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Connect Ulang & Sync
          </button>
        )}
      </div>
    </div>
  );
}
