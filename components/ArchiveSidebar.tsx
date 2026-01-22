
import React from 'react';
import { EventLog } from '../types';

interface Props {
  logs: EventLog[];
}

const ArchiveSidebar: React.FC<Props> = ({ logs }) => {
  return (
    <div className="w-80 border-l border-zinc-900 h-full flex flex-col bg-black">
      <div className="p-6 border-b border-zinc-900">
        <h3 className="font-display font-bold text-white uppercase text-sm tracking-widest">Incident Log</h3>
        <p className="text-[9px] text-zinc-600 mt-1">TEXT-ONLY · NO VIDEO RETENTION</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-4">
            <div className="w-12 h-12 border-2 border-zinc-800 flex items-center justify-center mb-3">
              <div className="w-2 h-2 bg-zinc-800"></div>
            </div>
            <p className="text-[10px] font-mono uppercase tracking-tighter text-zinc-700">System is clean.<br/>No incidents logged.</p>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="border border-zinc-800 bg-zinc-900/30 hover:border-zinc-600 transition-colors">
              <div className="p-3 border-b border-zinc-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase text-white tracking-wider">{log.room}</span>
                  <span className="text-[10px] font-mono text-green-500">✓ VERIFIED</span>
                </div>
                <p className="text-[10px] font-mono text-zinc-500">
                  Detected: {log.time}
                </p>
                {log.reviewedAt && (
                  <p className="text-[10px] font-mono text-zinc-600">
                    Reviewed: {log.reviewedAt}
                  </p>
                )}
              </div>
              <div className="p-3">
                <p className="text-[10px] text-red-400 font-mono uppercase mb-2">
                  {log.type || 'FALL DETECTED'}
                </p>
                {log.notes && (
                  <p className="text-[10px] text-zinc-500 italic leading-relaxed">
                    "{log.notes}"
                  </p>
                )}
                {!log.notes && (
                  <p className="text-[10px] text-zinc-700 italic">
                    No additional notes
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-zinc-900 bg-zinc-950/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 bg-green-500"></div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Privacy Protected</span>
        </div>
        <p className="text-[9px] text-zinc-700 font-mono leading-relaxed">
          Video deleted post-review. Only metadata retained for care documentation.
        </p>
      </div>
    </div>
  );
};

export default ArchiveSidebar;
