
import React from 'react';
import { Camera, BufferFrame } from '../types';

interface RollingTimelineProps {
  camera: Camera;
  isPaused: boolean;
}

const RollingTimeline: React.FC<RollingTimelineProps> = ({ camera, isPaused }) => {
  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-slate-900">
      {/* Labels */}
      <div className="flex justify-between px-8 py-3 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 z-10">
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Memory State:</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono flex items-center gap-1.5 border border-amber-500/30">
                <i className="fas fa-memory text-[8px]"></i> VOLATILE BUFFER (RAM)
            </span>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Auto-Deletes unless event occurs</span>
            <div className="h-4 w-px bg-slate-700"></div>
            <span className="text-[10px] font-mono text-emerald-400">ACTIVE: {camera.name}</span>
        </div>
      </div>

      <div className="flex-1 flex relative">
        {/* Left: Buffered Data */}
        <div className="w-[45%] h-full flex items-center justify-end px-4 gap-2 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none"></div>
            <div className="flex items-center gap-2 pr-12">
                {[...camera.buffer].reverse().map((frame, idx) => (
                    <div 
                        key={frame.id}
                        className="w-16 h-24 rounded border border-slate-700 bg-slate-800 flex flex-col items-center justify-center transition-all duration-300"
                        style={{ opacity: 1 - (idx * 0.1), transform: `scale(${1 - (idx * 0.05)})` }}
                    >
                        <i className="fas fa-file-image text-slate-600 mb-1"></i>
                        <span className="text-[8px] font-mono text-slate-500">T-{idx}s</span>
                        {isPaused && idx < 5 && (
                             <div className="absolute inset-0 bg-rose-500/20 animate-pulse border-2 border-rose-500 rounded"></div>
                        )}
                    </div>
                ))}
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none"></div>
        </div>

        {/* Center: NOW Marker */}
        <div className="w-[10%] flex flex-col items-center justify-center relative z-20">
            <div className="h-full w-0.5 bg-indigo-500 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-lg shadow-indigo-500/50">
                    NOW
                </div>
            </div>
            {/* Pulsing circle at bottom of marker */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-500/30 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
            </div>
        </div>

        {/* Right: Destruction Zone */}
        <div className="w-[45%] h-full bg-slate-900 relative flex items-center justify-start overflow-hidden">
            <div className="absolute inset-0 shredded-texture opacity-30 pointer-events-none"></div>
            <div className="pl-12 flex items-center">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-rose-400/50 italic text-xs font-medium">
                        <i className="fas fa-scissors"></i>
                        <span>Zero-Retention Zone</span>
                    </div>
                    <div className="h-0.5 w-64 bg-gradient-to-r from-rose-500/50 to-transparent"></div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-2 animate-pulse">
                        Irreversible Data Shredding Active
                    </div>
                </div>
            </div>
            
            {/* Dissolve visual effect */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-900 via-slate-900 to-transparent z-10"></div>
            
            {/* Floating "Pixel particles" */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute w-1 h-1 bg-slate-700/50 rounded-full animate-ping"
                        style={{
                            left: `${20 + Math.random() * 60}%`,
                            top: `${20 + Math.random() * 60}%`,
                            animationDelay: `${i * 0.2}s`,
                            animationDuration: `${1 + Math.random() * 2}s`
                        }}
                    ></div>
                ))}
            </div>
        </div>
      </div>

      {/* Buffer Logic Legend */}
      <div className="absolute bottom-4 left-8 right-8 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-3 text-emerald-400/60">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-emerald-400/20 bg-emerald-400/5 backdrop-blur-sm">
                <i className="fas fa-check-circle text-[10px]"></i>
                <span className="text-[9px] font-bold uppercase tracking-wider">Analyzing Local Vector Data</span>
            </div>
        </div>
        <div className="flex items-center gap-3 text-rose-400/60">
             <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-rose-400/20 bg-rose-400/5 backdrop-blur-sm">
                <i className="fas fa-trash text-[10px]"></i>
                <span className="text-[9px] font-bold uppercase tracking-wider">Frames Destroyed Forever</span>
            </div>
        </div>
      </div>

      {/* Alert Overlay during Event */}
      {isPaused && (
        <div className="absolute inset-0 bg-rose-600/10 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center">
            <div className="bg-rose-600 text-white px-6 py-3 rounded-lg shadow-2xl animate-pulse flex items-center gap-4 border border-rose-400/50">
                <i className="fas fa-exclamation-triangle text-2xl"></i>
                <div>
                    <h3 className="font-bold text-lg uppercase tracking-tight">Event Identified</h3>
                    <p className="text-xs opacity-90">Extracting critical safety snippet (3s) to secure storage.</p>
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
        </div>
      )}
    </div>
  );
};

export default RollingTimeline;
