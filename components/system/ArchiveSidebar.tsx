
import React from 'react';
import { EventLog } from '../../types';

interface Props {
  logs: EventLog[];
  onSelect: (id: string) => void;
}

const ArchiveSidebar: React.FC<Props> = ({ logs, onSelect }) => {
  return (
    <div className="w-80 border-l border-zinc-900 h-full flex flex-col bg-black overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-zinc-900">
        <h3 className="font-display font-black text-white uppercase text-sm tracking-[0.2em]">Incident Registry</h3>
        <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest mt-2">Ephemeral Records Only</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-10 text-center px-8">
            <i className="fas fa-shield-halved text-5xl mb-6"></i>
            <p className="text-[10px] font-mono uppercase tracking-widest leading-relaxed">
              Buffer empty.<br/>Zero visual vectors stored.<br/>Privacy verified.
            </p>
          </div>
        ) : (
          logs.map(log => (
            <div 
              key={log.id} 
              onClick={() => onSelect(log.id)}
              className={`border p-4 transition-all cursor-pointer group bg-zinc-950/20 ${log.isFalsePositive ? 'border-zinc-900 opacity-40' : 'border-zinc-800 hover:border-white'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[11px] font-black uppercase tracking-widest ${log.isFalsePositive ? 'text-zinc-600' : 'text-white'}`}>
                    {log.room}
                </span>
                <span className="text-[9px] font-mono text-zinc-700">{log.time}</span>
              </div>
              <div className={`h-px w-full mb-3 transition-colors ${log.isFalsePositive ? 'bg-zinc-950' : 'bg-zinc-900 group-hover:bg-zinc-700'}`}></div>
              <div className="flex items-center justify-between">
                <p className={`text-[9px] font-mono uppercase tracking-tighter ${log.isFalsePositive ? 'text-zinc-700' : 'text-zinc-500'}`}>
                    {log.isFalsePositive ? 'VOIDED_RECORD' : `EVENT: ${log.type}`}
                </p>
                {!log.isFalsePositive && <div className="w-2 h-2 bg-red-600 animate-pulse"></div>}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-8 border-t border-zinc-900 bg-black">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 bg-zinc-800 rounded-full animate-pulse"></div>
          <span className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.3em]">AES-256 SECURED</span>
        </div>
      </div>
    </div>
  );
};

export default ArchiveSidebar;
