
import React from 'react';
import { Camera } from '../types';

interface Props {
  camera: Camera;
  onClose: () => void;
}

const AlertTimeline: React.FC<Props> = ({ camera, onClose }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-1/2 bg-black border-t border-zinc-800 z-50 flex flex-col shadow-2xl transition-transform animate-in slide-in-from-bottom duration-500">
      <div className="flex justify-between items-center px-8 py-4 border-b border-zinc-900">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Analysis Target</span>
            <h3 className="font-display font-bold text-white uppercase text-xl">{camera.room}</h3>
          </div>
          <div className="h-8 w-px bg-zinc-800"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Status</span>
            <span className="text-white text-xs font-bold tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-white animate-ping rounded-full"></span>
              TEMPORARY ACCESS GRANTED
            </span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left side: Ephemeral History */}
        <div className="w-[45%] flex items-center justify-end px-12 relative overflow-hidden">
          <div className="flex gap-4 items-center">
             <div className="text-right">
                <p className="text-[10px] font-mono text-zinc-600">PRE-EVENT BUFFER</p>
                <p className="text-[9px] text-zinc-800">Volatile RAM</p>
             </div>
             {camera.buffer.slice(0, 8).map((f, i) => (
               <div key={f.id} className="w-16 h-32 border border-zinc-800 bg-zinc-950/50 flex flex-col items-center justify-center grayscale opacity-30">
                  <i className="fas fa-microchip text-zinc-800 text-xl"></i>
                  <span className="mt-2 text-[8px] font-mono text-zinc-700">BIT-{f.id % 999}</span>
               </div>
             ))}
          </div>
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-black pointer-events-none"></div>
        </div>

        {/* Center: Live Extraction */}
        <div className="w-[10%] border-x border-zinc-900 flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
          <div className="z-10 bg-white text-black px-4 py-1 text-[10px] font-black uppercase tracking-tighter transform -rotate-90">
            PROBE ACTIVE
          </div>
        </div>

        {/* Right side: Destruction Zone */}
        <div className="w-[45%] flex flex-col justify-center px-12 relative bg-[#020202]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_0%,_transparent_70%)]"></div>
          <div className="flex items-center gap-4">
             <i className="fas fa-scissors text-zinc-800"></i>
             <div className="flex flex-col">
               <span className="text-[11px] font-bold text-zinc-700 tracking-widest uppercase">Nullification Zone</span>
               <div className="h-[1px] w-64 bg-zinc-900 my-2"></div>
               <p className="text-[9px] font-mono text-zinc-800 leading-relaxed uppercase">
                 Automatic deletion of visual vectors.<br/>
                 Retention policy: Zero bytes stored.<br/>
                 Cycle time: 300ms.
               </p>
             </div>
          </div>
          <div className="absolute top-0 right-0 p-8">
            <i className="fas fa-trash-alt text-4xl text-zinc-900"></i>
          </div>
        </div>
      </div>

      <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
        <span>Session ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
        <span className="animate-pulse">WARNING: DATA WILL BE PERMANENTLY ERASED ON DISCONNECT</span>
        <span>VisioNULL Core v1.0</span>
      </div>
    </div>
  );
};

export default AlertTimeline;
