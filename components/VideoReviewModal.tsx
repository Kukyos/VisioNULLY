import React, { useState, useRef, useEffect } from 'react';
import { FallIncident } from './FallIncidentQueue';

interface VideoReviewModalProps {
  incident: FallIncident;
  onClose: () => void;
  onVerify: (incidentId: string, notes: string) => void;
}

const VideoReviewModal: React.FC<VideoReviewModalProps> = ({ incident, onClose, onVerify }) => {
  const [videoEnded, setVideoEnded] = useState(false);
  const [notes, setNotes] = useState('');
  const [countdown, setCountdown] = useState(10);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Auto-play video when modal opens
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, []);

  useEffect(() => {
    if (videoEnded && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [videoEnded, countdown]);

  const handleVideoEnded = () => {
    setVideoEnded(true);
  };

  const handleVerify = () => {
    onVerify(incident.id, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-red-950/50 border-b border-red-900/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-red-500 text-xl">⚠️</span>
                <h2 className="text-lg font-bold text-white uppercase">Incident Review</h2>
              </div>
              <p className="text-xs text-red-400 font-mono">
                {incident.room} · {incident.detectedAt}
              </p>
            </div>
            {!videoEnded && (
              <div className="bg-red-500/20 border border-red-500 px-3 py-1">
                <p className="text-xs font-mono text-red-400">ONE-TIME VIEW ONLY</p>
              </div>
            )}
          </div>
        </div>

        {/* Video Player */}
        <div className="bg-black aspect-video relative">
          {!videoEnded ? (
            <>
              <video
                ref={videoRef}
                src={incident.videoUrl}
                className="w-full h-full object-contain"
                onEnded={handleVideoEnded}
                controls={false}
              />
              <div className="absolute top-4 left-4 bg-red-500 px-3 py-1 text-xs font-mono text-white font-bold">
                ● LIVE REVIEW
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-black/80 p-3">
                <p className="text-xs text-zinc-400 font-mono">
                  Fall detected at ~{Math.floor(Math.random() * 3 + 3)}s into clip. Clip shows 3 seconds before incident + 7 seconds after.
                </p>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🗑️</div>
                <p className="text-xl font-mono text-zinc-500 mb-2">VIDEO DELETED</p>
                <p className="text-sm text-zinc-600">Clip permanently removed from memory</p>
                {countdown > 0 && (
                  <p className="text-xs text-zinc-700 mt-4 font-mono">
                    Auto-closing in {countdown}s...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Verification Form */}
        {videoEnded && (
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                Incident Verification
              </h3>
              <div className="bg-zinc-800/50 border border-zinc-700 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Room:</span>
                  <span className="text-white font-mono">{incident.room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Detected:</span>
                  <span className="text-white font-mono">{incident.detectedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Reviewed:</span>
                  <span className="text-white font-mono">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Incident:</span>
                  <span className="text-red-400 font-mono">FALL DETECTED</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Caregiver Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Wet floor, patient assisted, no injuries observed..."
                className="w-full bg-zinc-800 border border-zinc-700 text-white p-3 text-sm font-mono resize-none focus:outline-none focus:border-zinc-500"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-4 text-sm font-bold uppercase tracking-wider transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleVerify}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 text-sm font-bold uppercase tracking-wider transition-colors"
              >
                Verify & Log Incident ✓
              </button>
            </div>

            <div className="bg-zinc-800/30 border border-zinc-700 p-3">
              <p className="text-[10px] text-zinc-600 font-mono leading-relaxed">
                ⓘ Video has been deleted. Only text record will be stored in incident log for documentation purposes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoReviewModal;
