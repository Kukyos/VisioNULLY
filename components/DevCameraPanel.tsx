
import React from 'react';
import { BACKEND_URL } from '../config';

interface Props {
  onClose: () => void;
}

const DevCameraPanel: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-[45%] bg-black border-t border-zinc-800 z-40 flex flex-col shadow-2xl transition-transform animate-in slide-in-from-bottom duration-500">
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-4 border-b border-zinc-900">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Dev Mode</span>
            <h3 className="font-display font-bold text-white uppercase text-xl">LIVE CAMERA FEED</h3>
          </div>
          <div className="h-8 w-px bg-zinc-800"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Stream</span>
            <span className="text-white text-xs font-bold tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 animate-pulse rounded-full"></span>
              WEBCAM ACTIVE
            </span>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-widest">Minimize</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Live stream */}
        <div className="w-[65%] relative bg-black flex items-center justify-center">
          <img
            src={`${BACKEND_URL}/video_feed`}
            alt="Live webcam stream"
            className="w-full h-full object-contain bg-black"
          />
          <div className="absolute bottom-3 left-4 text-[10px] font-mono text-white/70 tracking-widest">
            cam-0 • WARD A1 • MJPEG stream
          </div>
          <div className="absolute top-3 right-4 flex items-center gap-2 text-[10px] font-mono text-green-400 tracking-widest">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            LIVE
          </div>
        </div>

        {/* Right: Stream info */}
        <div className="flex-1 flex flex-col justify-center px-8 space-y-4 bg-[#020202] border-l border-zinc-900">
          <div className="text-[11px] font-bold text-zinc-400 tracking-widest uppercase">Stream Information</div>
          <div className="text-xs text-zinc-500 font-mono leading-relaxed space-y-1">
            <div>Camera: cam-0</div>
            <div>Room: WARD A1</div>
            <div>Backend: {BACKEND_URL}</div>
            <div>Mode: Development / Debug</div>
            <div>Processing: OpenCV + HOG Detector</div>
          </div>
          <div className="pt-4 border-t border-zinc-800">
            <div className="text-[10px] text-amber-500/80 uppercase font-bold mb-1">⚠ Development Only</div>
            <div className="text-[10px] text-zinc-600 leading-relaxed">
              Live video is visible only in Dev mode for testing and calibration. 
              Switch to Privacy mode to disable visual stream.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-zinc-950 border-t border-zinc-900 flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
        <span>Dev Mode Active</span>
        <span>Stream endpoint: /video_feed</span>
        <span>VisioNULL Core v1.0</span>
      </div>
    </div>
  );
};

export default DevCameraPanel;
