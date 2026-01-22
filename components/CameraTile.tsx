
import React from 'react';
import { Camera } from '../types';
import { BACKEND_URL } from '../config';

interface Props {
  camera: Camera;
  onAlert: (id: string) => void;
  onView: (id: string) => void;
}

const CameraTile: React.FC<Props> = ({ camera, onAlert, onView }) => {
  const isAlert = camera.status === 'ALERT';

  return (
    <div className={`
      relative h-48 rounded-none border border-zinc-800 transition-all duration-500 overflow-hidden group
      ${isAlert ? 'bg-white text-black border-white scale-[1.02] z-10' : 'bg-black text-white hover:border-zinc-500'}
    `}>
      {/* Optional live stream for primary camera */}
      {camera.id === 'cam-0' && (
        <img
          src={`${BACKEND_URL}/video_feed`}
          alt="Live stream"
          className={`absolute inset-0 w-full h-full object-cover ${isAlert ? 'opacity-60' : 'opacity-30'} pointer-events-none`}
        />
      )}
      <div className="absolute top-4 left-4 flex flex-col">
        <span className="text-[10px] font-mono tracking-tighter opacity-50">{camera.id}</span>
        <span className="font-display font-bold text-lg uppercase tracking-tight">{camera.room}</span>
      </div>

      <div className="absolute top-4 right-4">
        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 border ${isAlert ? 'border-black bg-black text-white' : 'border-zinc-700 text-zinc-500'}`}>
          <div className={`w-1 h-1 rounded-full ${isAlert ? 'bg-white animate-pulse' : 'bg-zinc-700'}`}></div>
          {camera.status}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
        {/* Activity Waveform (Abstracted) - hidden when live stream present */}
        {camera.id !== 'cam-0' && (
          <div className="flex items-end gap-[2px] h-8 opacity-30">
            {camera.buffer.slice(-10).map((f) => (
              <div key={f.id} className={`w-1 ${isAlert ? 'bg-black' : 'bg-white'}`} style={{ height: `${f.intensity}%` }}></div>
            ))}
          </div>
        )}

        {isAlert ? (
          <button 
            onClick={() => onView(camera.id)}
            className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:invert transition-all"
          >
            Open Buffer
          </button>
        ) : (
          <button 
            onClick={() => onAlert(camera.id)}
            className="text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity"
          >
            Test Probe
          </button>
        )}
      </div>

      {isAlert && <div className="absolute inset-0 border-4 border-black animate-pulse pointer-events-none"></div>}
      <div className="scanline"></div>
    </div>
  );
};

export default CameraTile;
