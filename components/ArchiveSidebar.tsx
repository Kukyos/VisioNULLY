
import React from 'react';
import { EventLog } from '../types';

interface Props {
  logs: EventLog[];
}

const ArchiveSidebar: React.FC<Props> = ({ logs }) => {
  return (
    <div className="w-72 border-l border-zinc-900 h-full flex flex-col bg-black">
      <div className="p-6 border-b border-zinc-900">
        <h3 className="font-display font-bold text-white uppercase text-sm tracking-widest">Logged Incidents</h3>
        <p className="text-[9px] text-zinc-600 mt-1">ONLY VERIFIED FALL EVENTS STORED</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-4">
            <i className="fas fa-fingerprint text-3xl mb-4"></i>
            <p className="text-[10px] font-mono uppercase tracking-tighter">System is clean.<br/>No retention data found.</p>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="border border-zinc-800 p-3 hover:border-white transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black uppercase text-white tracking-widest">{log.room}</span>
                <span className="text-[8px] font-mono text-zinc-600">{log.time}</span>
              </div>
              <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-white w-1/3"></div>
              </div>
              <p className="text-[9px] text-zinc-500 font-mono uppercase">V-SNIPPET: {log.id.substring(0,8)}</p>
            </div>
          ))
        )}
      </div>

      <div className="p-6 border-t border-zinc-900 bg-zinc-950/30">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">End-to-End Cryptography</span>
        </div>
      </div>
    </div>
  );
};

export default ArchiveSidebar;
