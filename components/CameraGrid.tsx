
import React from 'react';
import { Camera } from '../types';

interface CameraGridProps {
  cameras: Camera[];
  selectedCameraId: string;
  onSelect: (id: string) => void;
}

const CameraGrid: React.FC<CameraGridProps> = ({ cameras, selectedCameraId, onSelect }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cameras.map((camera) => (
        <button
          key={camera.id}
          onClick={() => onSelect(camera.id)}
          className={`
            relative group overflow-hidden rounded-xl border-2 transition-all duration-300 h-32 md:h-40 flex flex-col items-center justify-center text-center p-4
            ${selectedCameraId === camera.id ? 'border-indigo-500 ring-2 ring-indigo-50/50 bg-white' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'}
            ${camera.status === 'FallDetected' ? 'border-rose-500 bg-rose-50' : ''}
          `}
        >
          {/* Status Badge */}
          <div className="absolute top-2 right-2">
             <div className={`
              px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5
              ${camera.status === 'Monitoring' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}
            `}>
              <span className={`w-1.5 h-1.5 rounded-full ${camera.status === 'Monitoring' ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'}`}></span>
              {camera.status}
            </div>
          </div>

          <div className={`
            mb-2 w-10 h-10 rounded-full flex items-center justify-center text-lg
            ${camera.status === 'Monitoring' ? 'bg-slate-100 text-slate-400' : 'bg-rose-200 text-rose-600'}
          `}>
            <i className={`fas ${camera.status === 'Monitoring' ? 'fa-eye-slash' : 'fa-triangle-exclamation animate-bounce'}`}></i>
          </div>

          <span className="font-semibold text-slate-700 text-sm">{camera.name}</span>
          <span className="text-[10px] text-slate-400 mt-1">ID: {camera.id.toUpperCase()}</span>

          {/* Abstract Pulse to represent monitoring activity without showing video */}
          {camera.status === 'Monitoring' && (
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-0.5 h-4">
                {[...Array(5)].map((_, i) => (
                    <div 
                        key={i} 
                        className="w-1 bg-emerald-300 rounded-full" 
                        style={{ 
                            height: `${20 + Math.random() * 80}%`,
                            transition: 'height 0.3s ease-in-out',
                            opacity: 0.4
                        }}
                    ></div>
                ))}
             </div>
          )}

          {/* Privacy Message Overlay (visible on hover) */}
          <div className="absolute inset-0 bg-indigo-600/90 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity p-4">
            <p className="text-xs font-medium leading-relaxed">
               Click to view rolling buffer analysis for this room
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default CameraGrid;
