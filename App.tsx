
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from './hooks/useSimulation';
import { useIncidents } from './context/IncidentContext';
import CameraTile from './components/CameraTile';
import AlertTimeline from './components/AlertTimeline';
import ArchiveSidebar from './components/ArchiveSidebar';
import FallIncidentQueue from './components/FallIncidentQueue';
import WarningModal from './components/WarningModal';
import VideoReviewModal from './components/VideoReviewModal';
import { EventLog } from './types';
import { FallIncident } from './components/FallIncidentQueue';
import { BACKEND_URL } from './config';

const App: React.FC = () => {
  const navigate = useNavigate();
  const { cameras, triggerAlert, clearAlert, activeAlertId } = useSimulation();
  const { incidents, verifyIncident } = useIncidents();
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [viewingAlertId, setViewingAlertId] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentIncident, setCurrentIncident] = useState<FallIncident | null>(null);
  
  const [skipWarning, setSkipWarning] = useState(() => {
    return localStorage.getItem('skipFallWarning') === 'true';
  });

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

  const handleViewIncidentClip = (incident: FallIncident) => {
    setCurrentIncident(incident);
    if (skipWarning) {
      setShowReviewModal(true);
    } else {
      setShowWarning(true);
    }
  };

  const handleWarningConfirm = () => {
    setShowWarning(false);
    setShowReviewModal(true);
  };

  const handleWarningCancel = () => {
    setShowWarning(false);
    setCurrentIncident(null);
  };

  const handleDontWarnAgain = (checked: boolean) => {
    setSkipWarning(checked);
    localStorage.setItem('skipFallWarning', checked.toString());
  };

  const handleVerifyIncident = (incidentId: string, notes: string) => {
    verifyIncident(incidentId, notes);
    setShowReviewModal(false);
    setCurrentIncident(null);
    
    // Add to logs sidebar
    const incident = incidents.find(i => i.id === incidentId);
    if (incident) {
      setLogs(prev => [{
        id: incidentId,
        room: incident.room,
        time: incident.detectedAt,
        type: 'FALL DETECTED',
        reviewedAt: new Date().toLocaleTimeString(),
        notes
      }, ...prev]);
    }
  };

  const handleCloseReview = () => {
    setShowReviewModal(false);
    setCurrentIncident(null);
  };

  const selectedCamera = cameras.find(c => c.id === viewingAlertId);

  // Subscribe to backend fall events (SSE)
  useEffect(() => {
    const src = new EventSource(`${BACKEND_URL}/events`);
    src.addEventListener('fall', (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data);
        const id = data.cameraId || 'cam-0';
        triggerAlert(id);
        setViewingAlertId(id);
        const cam = cameras.find(c => c.id === id) || { room: 'CAM-0', id, status: 'ALERT', buffer: [] } as any;
        setLogs(prev => [{
          id: `ev-${Date.now()}`,
          room: cam.room,
          time: new Date().toLocaleTimeString(),
          type: 'FALL DETECTED'
        }, ...prev]);
      } catch {}
    });
    src.onerror = () => {
      // Keep quiet; user can start backend when ready
    };
    return () => src.close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex w-full h-screen bg-black text-white overflow-hidden">
      {/* Warning Modal */}
      {showWarning && (
        <WarningModal
          onConfirm={handleWarningConfirm}
          onCancel={handleWarningCancel}
          onDontWarnAgain={handleDontWarnAgain}
        />
      )}

      {/* Video Review Modal */}
      {showReviewModal && currentIncident && (
        <VideoReviewModal
          incident={currentIncident}
          onClose={handleCloseReview}
          onVerify={handleVerifyIncident}
        />
      )}

      {/* Main Grid Area */}
      <div className="flex-1 flex flex-col relative">
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

        {/* Demo Button */}
        <div className="absolute top-8 right-8 z-20 pointer-events-auto">
          <button
            onClick={() => navigate('/demo')}
            className="bg-white text-black px-6 py-3 font-bold text-sm uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center gap-2"
          >
            <span>📹</span>
            <span>Demo Upload</span>
          </button>
        </div>

        {/* Fall Incident Queue */}
        {incidents.length > 0 && (
          <FallIncidentQueue 
            incidents={incidents}
            onViewClip={handleViewIncidentClip}
          />
        )}

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
