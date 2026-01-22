
import React from 'react';
import { StoredEvent } from '../types';

interface SidebarProps {
  events: StoredEvent[];
}

const Sidebar: React.FC<SidebarProps> = ({ events }) => {
  return (
    <aside className="w-80 bg-white flex flex-col h-full border-l border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-database text-indigo-500"></i>
            Event Archive
        </h3>
        <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-widest mt-1">
            Permanent Storage Only
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-folder-open text-slate-400 text-2xl"></i>
            </div>
            <p className="text-sm font-medium text-slate-600">No events stored</p>
            <p className="text-xs text-slate-400 mt-2">Privacy protocol is currently preventing storage of all visual data.</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-300 transition-colors">
              <div className="relative aspect-video bg-slate-100">
                 <img src={event.clipUrl} alt="Event thumbnail" className="w-full h-full object-cover" />
                 <div className="absolute top-2 left-2 px-2 py-0.5 bg-rose-600 text-[10px] text-white font-bold rounded flex items-center gap-1">
                    <i className="fas fa-video"></i> FALL EVENT
                 </div>
                 <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                    <button className="bg-white text-slate-900 rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                        <i className="fas fa-play"></i>
                    </button>
                 </div>
              </div>
              <div className="p-3">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-slate-800">{event.cameraName}</span>
                    <span className="text-[10px] font-medium text-slate-500">{event.timestamp}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <i className="fas fa-file-code"></i>
                    HASH: {event.id.split('-')[1].substring(0, 8)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-indigo-50 border-t border-indigo-100">
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <i className="fas fa-info-circle text-xs"></i>
            </div>
            <p className="text-[10px] text-indigo-700 leading-relaxed font-medium">
                Records are automatically encrypted and accessible only by authorized caregivers during alert scenarios. 
            </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
