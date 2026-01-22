import React from 'react';

export interface FallIncident {
  id: string;
  room: string;
  detectedAt: string;
  timestamp: number;
  videoUrl?: string;
  status: 'pending' | 'viewed' | 'verified';
  reviewedAt?: string;
  notes?: string;
}

interface FallIncidentQueueProps {
  incidents: FallIncident[];
  onViewClip: (incident: FallIncident) => void;
}

const FallIncidentQueue: React.FC<FallIncidentQueueProps> = ({ incidents, onViewClip }) => {
  const pendingIncidents = incidents.filter(i => i.status === 'pending');
  const verifiedIncidents = incidents.filter(i => i.status === 'verified');

  if (incidents.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-24 right-8 z-20 w-96 max-h-[70vh] overflow-y-auto bg-zinc-900/95 border border-zinc-800 backdrop-blur-sm shadow-xl">
      <div className="p-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-red-500 animate-pulse"></div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
            Fall Incidents
          </h3>
        </div>
        <p className="text-[10px] text-zinc-500 font-mono">
          {pendingIncidents.length} PENDING · {verifiedIncidents.length} VERIFIED
        </p>
      </div>

      <div className="divide-y divide-zinc-800">
        {pendingIncidents.map(incident => (
          <div key={incident.id} className="p-4 hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-red-500 text-lg">🔴</span>
                  <h4 className="text-sm font-bold text-white uppercase">{incident.room}</h4>
                </div>
                <p className="text-xs text-zinc-500 font-mono">
                  Detected: {incident.detectedAt}
                </p>
              </div>
              <button
                onClick={() => onViewClip(incident)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap"
              >
                View Clip
              </button>
            </div>
            <div className="bg-red-950/30 border border-red-900/30 px-2 py-1">
              <p className="text-[10px] font-mono text-red-400">FALL DETECTED - REQUIRES REVIEW</p>
            </div>
          </div>
        ))}

        {verifiedIncidents.length > 0 && (
          <div className="p-3 bg-zinc-800/30">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-2">
              Recently Verified
            </p>
            {verifiedIncidents.slice(0, 3).map(incident => (
              <div key={incident.id} className="mb-2 last:mb-0 p-2 bg-zinc-900/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-green-500 text-sm">✅</span>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase">{incident.room}</h4>
                </div>
                <p className="text-[10px] text-zinc-600 font-mono">
                  Detected: {incident.detectedAt}
                </p>
                <p className="text-[10px] text-zinc-600 font-mono">
                  Reviewed: {incident.reviewedAt}
                </p>
                {incident.notes && (
                  <p className="text-[10px] text-zinc-500 mt-1 italic">
                    "{incident.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FallIncidentQueue;
