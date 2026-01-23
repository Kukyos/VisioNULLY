
import React, { useState, useEffect } from 'react';
import { Camera, EventLog } from '../../types';

interface Props {
  camera: Camera;
  log?: EventLog;
  onClose: () => void;
  onFalsePositive: (id: string) => void;
}

const AlertTimeline: React.FC<Props> = ({ camera, log, onClose, onFalsePositive }) => {
  const [playHead, setPlayHead] = useState(0);
  const isArchived = !!log;
  
  // Use the captured video buffer if it exists
  const videoFrames = log?.videoBuffer || camera.visualBuffer || [];
  const hasVideo = videoFrames.length > 0;

  useEffect(() => {
    if (!hasVideo) return;
    const interval = setInterval(() => {
      setPlayHead(p => (p + 1) % videoFrames.length);
    }, 150); // Fast playback simulation
    return () => clearInterval(interval);
  }, [hasVideo, videoFrames.length]);

  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 backdrop-blur-sm">
      <div className="w-full max-w-5xl border border-zinc-800 bg-black shadow-2xl relative overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="p-8 border-b border-zinc-900 flex justify-between items-center bg-zinc-950">
          <div className="flex gap-8 items-center">
            <div className="w-12 h-12 bg-red-600 flex items-center justify-center text-white">
               <i className="fas fa-video text-xl animate-pulse"></i>
            </div>
            <div>
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Incident_Visual_Review</p>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{camera.room} // {camera.id}</h2>
            </div>
          </div>
          <button onClick={onClose} className="w-14 h-14 border border-zinc-800 hover:border-white text-zinc-600 hover:text-white transition-all flex items-center justify-center">
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Visual Buffer Playback */}
          <div className="flex-1 bg-black relative flex flex-col items-center justify-center p-8 border-r border-zinc-900">
            <div className="w-full aspect-video bg-zinc-950 border-2 border-zinc-800 relative overflow-hidden group">
               {hasVideo ? (
                 <div className="relative w-full h-full flex items-center justify-center">
                    <img 
                      src={videoFrames[playHead]} 
                      alt="Buffer Playback" 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-4 left-4 right-4 h-1 bg-zinc-900">
                      <div 
                        className="h-full bg-red-600 transition-all duration-75"
                        style={{ width: `${(playHead / (videoFrames.length - 1)) * 100}%` }}
                      ></div>
                    </div>
                 </div>
               ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <i className="fas fa-spinner fa-spin text-zinc-800 text-3xl mb-4"></i>
                    <p className="text-[10px] text-zinc-700 font-mono">RETRIEVING_EPHEMERAL_BUFFER...</p>
                 </div>
               )}
               
               <div className="absolute top-4 right-4 bg-red-600 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-widest animate-pulse z-20">
                  {isArchived ? 'ARCHIVE_PLAYBACK' : 'LIVE_RAM_BUFFER'}
               </div>
               
               <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                  <div className="bg-black/80 px-2 py-1 text-[8px] text-zinc-400 font-mono border border-zinc-800 uppercase">
                    Capture_Frame: {playHead.toString().padStart(2, '0')}
                  </div>
               </div>
               <div className="scanline"></div>
            </div>

            <div className="w-full mt-6 grid grid-cols-2 gap-4">
               <div className="p-4 border border-zinc-900 bg-zinc-950/30">
                  <p className="text-[9px] text-zinc-600 uppercase font-black mb-1">Incident Type</p>
                  <p className="text-sm text-white font-black uppercase tracking-tight">FALL_DETECTED // <span className="text-red-500">CRITICAL</span></p>
               </div>
               <div className="p-4 border border-zinc-900 bg-zinc-950/30">
                  <p className="text-[9px] text-zinc-600 uppercase font-black mb-1">Human Check</p>
                  <p className="text-sm text-white font-black uppercase tracking-tight">Status: <span className="text-zinc-500 font-mono italic text-[10px]">AWAITING_VERIFICATION</span></p>
               </div>
            </div>
          </div>

          {/* Controls */}
          <div className="w-96 p-8 flex flex-col bg-zinc-950/50">
            <div className="flex-1 space-y-6">
               <div className="p-4 border border-zinc-800 bg-black">
                  <p className="text-[9px] font-black text-zinc-500 uppercase mb-3 tracking-widest">Metadata Terminal</p>
                  <div className="space-y-2 text-[10px] font-mono">
                    <div className="flex justify-between border-b border-zinc-900 pb-1">
                      <span className="text-zinc-600">SOURCE:</span>
                      <span className="text-white">{camera.room}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900 pb-1">
                      <span className="text-zinc-600">TIMESTAMP:</span>
                      <span className="text-white">{log ? log.time : 'BUFFER_NOW'}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900 pb-1">
                      <span className="text-zinc-600">RETENTION:</span>
                      <span className="text-red-500 font-black">VOLATILE_RAM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">SESS_AUTH:</span>
                      <span className="text-green-500">VERIFIED</span>
                    </div>
                  </div>
               </div>

               <div className="space-y-3">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Actions Required</p>
                  <button className="w-full py-4 bg-white text-black text-[11px] font-black uppercase hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                    <i className="fas fa-ambulance"></i> Dispatch Emergency
                  </button>
                  <button className="w-full py-4 border border-zinc-800 text-white text-[11px] font-black uppercase hover:border-white transition-all">
                    Initiate VoIP Link
                  </button>
                  <button 
                    onClick={() => log && onFalsePositive(log.id)}
                    className="w-full py-4 border border-red-900 text-red-500 text-[11px] font-black uppercase hover:bg-red-950/20 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-trash-alt"></i> Mark False Positive
                  </button>
               </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-900">
               <div className="flex items-center gap-2 mb-2">
                 <i className="fas fa-shield-alt text-blue-500 text-xs"></i>
                 <span className="text-[9px] font-black text-blue-500 uppercase">Privacy Policy NX-12</span>
               </div>
               <p className="text-[9px] text-zinc-600 font-mono leading-relaxed uppercase">
                 This clip exists only in volatile memory. Disconnecting or marking as false positive will permanently shred these visual frames.
               </p>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="p-4 border-t border-zinc-900 flex justify-between items-center text-[9px] font-mono text-zinc-700 bg-black">
          <div className="flex gap-4">
             <span>ENCRYPT: AES_256_GCM</span>
             <span>BUFFER_SIZE: {videoFrames.length} FRMS</span>
          </div>
          <span className="animate-pulse text-red-900 font-black">UNSHREDDED_DATA_EXPOSED // HUMAN_REVIEW_ACTIVE</span>
          <span>SESS_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default AlertTimeline;
