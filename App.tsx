
import React, { useState } from 'react';
import { useSimulation } from './hooks/useSimulation';
import CameraTile from './components/CameraTile';
import AlertTimeline from './components/AlertTimeline';
import ArchiveSidebar from './components/ArchiveSidebar';
import { EventLog } from './types';

const App: React.FC = () => {
  const { cameras, triggerAlert, clearAlert, activeAlertId } = useSimulation();
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [viewingAlertId, setViewingAlertId] = useState<string | null>(null);

  const handleAlert = (id: string) => {
    triggerAlert(id);
  };

  const handleView = (id: string) => {
    setViewingAlertId(id);
    const cam = cameras.find(c => c.id === id);
    if (cam && !logs.some(l => l.room === cam.room)) {
      setLogs(prev => [{
        id: `ev-${Date.now()}`,
        room: cam.room,
        time: new Date().toLocaleTimeString(),
        type: 'FALL DETECTED'
      }, ...prev]);
    }
  };

  const selectedCamera = cameras.find(c => c.id === viewingAlertId);

  return (
    <div className="flex w-full h-screen bg-black text-white overflow-hidden">
      {/* Main Grid Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Simple Branding Header (Optional overlay) */}
        <div className="absolute top-8 left-8 z-20 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-white flex items-center justify-center">
              <div className="w-1 h-1 bg-white"></div>
            </div>
            <h1 className="font-display font-black text-2xl tracking-tighter uppercase">VisioNULL</h1>
          </div>
          <p className="text-[10px] font-mono text-zinc-600 tracking-widest mt-1">PRIVATE EDGE-NEXUS ACTIVE</p>
        </div>

        <div className="flex-1 p-8 pt-24 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-px bg-zinc-900 border border-zinc-900">
            {cameras.map(cam => (
              <CameraTile 
                key={cam.id} 
                camera={cam} 
                onAlert={handleAlert} 
                onView={handleView}
              />
            ))}
          </div>
          
          <div className="mt-12 max-w-2xl border-l-2 border-zinc-800 pl-6 py-4">
            <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">System Manifesto</h2>
            <p className="text-sm text-zinc-600 leading-relaxed font-light">
              VisioNULL does not store video. All data exists only in volatile rolling RAM buffers. 
              The visual vectors are processed locally on the edge and destroyed immediately unless a critical safety event is identified.
              <span className="block mt-2 text-white/50 italic">Safety without surveillance. Security without visibility.</span>
            </p>
          </div>
        </div>

        {/* Dynamic Timeline Component */}
        {viewingAlertId && selectedCamera && (
          <AlertTimeline 
            camera={selectedCamera} 
            onClose={() => setViewingAlertId(null)}
          />
        )}
      </div>

      {/* Sidebar for logs */}
      <ArchiveSidebar logs={logs} />
    </div>
  );
};

export default App;
