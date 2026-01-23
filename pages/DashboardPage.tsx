
import React, { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { usePoseDetector } from '../hooks/usePoseDetector';
import CameraTile from '../components/ui/CameraTile';
import AlertTimeline from '../components/system/AlertTimeline';
import ArchiveSidebar from '../components/system/ArchiveSidebar';
import { EventLog, SystemMode } from '../types';

interface Props {
  onNavigateDemo: () => void;
}

const DashboardPage: React.FC<Props> = ({ onNavigateDemo }) => {
  const { cameras, triggerAlert, linkStream, setCameraError, clearAlert } = useSimulation();
  const { detector, loaded } = usePoseDetector();
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [systemMode, setSystemMode] = useState<SystemMode>('PRIVACY');
  const [viewingLogId, setViewingLogId] = useState<string | null>(null);

  const handleAlert = (id: string, visualBuffer: string[]) => {
    triggerAlert(id);
    const cam = cameras.find(c => c.id === id);
    if (cam) {
      setLogs(prev => [{
        id: `ev-${Date.now()}`,
        cameraId: cam.id,
        room: cam.room,
        time: new Date().toLocaleTimeString(),
        type: 'FALL_DETECTED',
        snapshotBuffer: [...cam.buffer],
        videoBuffer: visualBuffer // Store the actual frames for playback
      }, ...prev]);
    }
  };

  const handleMarkFalsePositive = (id: string) => {
    setLogs(prev => prev.map(l => l.id === id ? { ...l, isFalsePositive: true, type: 'FALSE_POSITIVE' } : l));
    const log = logs.find(l => l.id === id);
    if (log) clearAlert(log.cameraId);
    setViewingLogId(null);
  };

  const selectedLog = logs.find(l => l.id === viewingLogId);
  const selectedCamera = viewingLogId?.startsWith('cam-') 
    ? cameras.find(c => c.id === viewingLogId) 
    : cameras.find(c => c.id === selectedLog?.cameraId);

  return (
    <div className="flex w-full h-full overflow-hidden bg-[#050505] font-mono">
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Main Header */}
        <div className="p-6 pb-4 flex justify-between items-center bg-black border-b border-zinc-900">
          <div className="flex items-center gap-6">
             <div className="w-10 h-10 bg-white flex items-center justify-center">
               <div className="w-4 h-4 bg-black rotate-45"></div>
             </div>
             <div>
                <h1 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-2">
                    VisioNULL 
                    <span className={`px-2 py-0.5 text-[10px] border ${systemMode === 'PRIVACY' ? 'border-blue-600 text-blue-500' : 'border-red-600 text-red-500'} font-black`}>
                        {systemMode === 'PRIVACY' ? 'STRICT_PRIVACY' : 'DEMO_UNLOCKED'}
                    </span>
                </h1>
                <p className="text-[9px] text-zinc-700 font-bold tracking-widest mt-1 uppercase">
                    {systemMode === 'PRIVACY' ? '// Zero-Byte Visual Retention Active' : '// Neural Diagnostics Enabled'}
                </p>
             </div>
          </div>

          <div className="flex gap-2">
            <button 
                onClick={() => setSystemMode(systemMode === 'PRIVACY' ? 'DEMO_UNLOCKED' : 'PRIVACY')}
                className={`px-4 py-2 border text-[9px] font-black uppercase transition-all ${systemMode === 'DEMO_UNLOCKED' ? 'bg-red-600 text-white border-red-600' : 'border-zinc-800 text-zinc-500 hover:text-white'}`}
            >
                {systemMode === 'PRIVACY' ? 'Unlock Full Vision' : 'Lock Privacy Shield'}
            </button>
            <button onClick={onNavigateDemo} className="px-4 py-2 border border-zinc-800 text-[9px] font-black uppercase text-zinc-400 hover:text-white transition-all">Isolated Lab</button>
          </div>
        </div>

        {/* Camera Grid */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_center,_#0a0a0a_0%,_#050505_100%)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cameras.map(cam => (
              <CameraTile 
                key={cam.id} 
                camera={cam} 
                mode={systemMode}
                detector={detector}
                onAlert={handleAlert} 
                onView={setViewingLogId}
                onLink={linkStream}
                onError={setCameraError}
              />
            ))}
          </div>

          {!loaded && (
            <div className="mt-12 p-12 border border-dashed border-zinc-900 flex flex-col items-center justify-center rounded-xl">
               <div className="w-8 h-8 border-2 border-zinc-900 border-t-white rounded-full animate-spin mb-4"></div>
               <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">Calibrating Neural Matrix...</p>
            </div>
          )}
        </div>

        {/* Expanded Review Overlay */}
        {(viewingLogId && (selectedLog || selectedCamera)) && (
          <AlertTimeline 
            camera={selectedCamera!} 
            log={selectedLog}
            onClose={() => setViewingLogId(null)} 
            onFalsePositive={handleMarkFalsePositive}
          />
        )}
      </div>

      <ArchiveSidebar logs={logs} onSelect={setViewingLogId} />
    </div>
  );
};

export default DashboardPage;
