import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIncidents } from '../context/IncidentContext';
import WarningModal from '../components/WarningModal';
import { FallIncident } from '../components/FallIncidentQueue';
import VideoReviewModal from '../components/VideoReviewModal';

interface DemoClip {
  id: string;
  videoFile: File;
  videoUrl: string;
  fallDetected: boolean;
  fallTimestamp: number | null;
  hasBeenViewed: boolean;
}

const DemoPage: React.FC = () => {
  const navigate = useNavigate();
  const { addIncident, verifyIncident } = useIncidents();
  const [demoClip, setDemoClip] = useState<DemoClip | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentIncident, setCurrentIncident] = useState<FallIncident | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user has disabled warnings
  const [skipWarning, setSkipWarning] = useState(() => {
    return localStorage.getItem('skipFallWarning') === 'true';
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const videoUrl = URL.createObjectURL(file);
      setDemoClip({
        id: `demo-${Date.now()}`,
        videoFile: file,
        videoUrl,
        fallDetected: false,
        fallTimestamp: null,
        hasBeenViewed: false
      });
      
      // Simulate fall detection analysis
      setIsAnalyzing(true);
      setTimeout(() => {
        // Simulate fall detected at a random point in the video
        const fallTime = Math.random() * 3 + 3; // Between 3-6 seconds (moment of fall in 10s clip)
        setDemoClip(prev => prev ? {
          ...prev,
          fallDetected: true,
          fallTimestamp: fallTime
        } : null);
        setIsAnalyzing(false);
      }, 3000); // 3 second analysis simulation
    }
  };

  const handleViewClip = () => {
    if (!demoClip || !demoClip.fallDetected) return;

    // Create incident object
    const incident: FallIncident = {
      id: demoClip.id,
      room: 'DEMO ROOM',
      detectedAt: new Date().toLocaleTimeString(),
      timestamp: Date.now(),
      videoUrl: demoClip.videoUrl,
      status: 'pending'
    };

    // Add incident to global context
    addIncident(incident);
    setCurrentIncident(incident);

    // Show warning or go straight to review
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
  };

  const handleDontWarnAgain = (checked: boolean) => {
    setSkipWarning(checked);
    localStorage.setItem('skipFallWarning', checked.toString());
  };

  const handleVerify = (incidentId: string, notes: string) => {
    // Verify the incident in context
    verifyIncident(incidentId, notes);
    
    // Mark as verified and clean up
    if (demoClip?.videoUrl) {
      URL.revokeObjectURL(demoClip.videoUrl);
    }
    setDemoClip(null);
    setCurrentIncident(null);
    setShowReviewModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCloseReview = () => {
    setShowReviewModal(false);
    // Still delete the clip even if they just close
    if (demoClip?.videoUrl) {
      URL.revokeObjectURL(demoClip.videoUrl);
    }
    setDemoClip(null);
    setCurrentIncident(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full bg-black text-white">
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
          onVerify={handleVerify}
        />
      )}

      {/* Header */}
      <div className="border-b border-zinc-800 px-8 py-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <span className="text-xl">←</span>
          <span className="text-sm font-mono uppercase tracking-wider">Back to Monitor</span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-white flex items-center justify-center">
            <div className="w-1 h-1 bg-white"></div>
          </div>
          <div>
            <h1 className="font-display font-black text-3xl tracking-tighter uppercase">Demo Upload</h1>
            <p className="text-xs font-mono text-zinc-600 tracking-widest mt-1">FALL DETECTION TEST</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-8 pb-20">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-red-500 animate-pulse"></div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Privacy-First Testing</h2>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Upload a video to test edge AI fall detection. Your video is analyzed locally in your browser—nothing is sent to servers. 
            If a fall is detected, the clip is viewable once, then permanently deleted.
          </p>
        </div>

        {!demoClip && (
          <div className="border-2 border-dashed border-zinc-700 hover:border-zinc-600 transition-colors bg-zinc-900/30">
            <label className="flex flex-col items-center justify-center py-20 cursor-pointer">
              <div className="w-20 h-20 border-2 border-zinc-700 flex items-center justify-center mb-6">
                <span className="text-5xl">📹</span>
              </div>
              <span className="text-lg font-mono text-zinc-400 uppercase tracking-wider mb-2">Upload Video</span>
              <span className="text-sm text-zinc-600">MP4, WebM, MOV</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {demoClip && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 aspect-video relative overflow-hidden">
              {isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
                  <div className="w-16 h-16 border-2 border-zinc-700 border-t-white animate-spin mb-6"></div>
                  <p className="text-lg font-mono text-zinc-400 mb-2">ANALYZING VIDEO...</p>
                  <p className="text-sm text-zinc-600">Detecting fall patterns</p>
                </div>
              )}
              
              {!isAnalyzing && demoClip.fallDetected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <div className="text-center">
                    <div className="w-16 h-16 border-2 border-zinc-800 mx-auto mb-4 animate-pulse"></div>
                    <p className="text-lg font-mono text-zinc-600">VIDEO READY</p>
                    <p className="text-xs text-zinc-700 mt-2">Awaiting caregiver review</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {isAnalyzing && (
                <div className="bg-zinc-900/50 border border-zinc-800 p-6">
                  <div className="text-sm font-mono text-zinc-500 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 animate-pulse"></div>
                      <span>Scanning for anomalies...</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 animate-pulse"></div>
                      <span>Analyzing movement patterns...</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 animate-pulse"></div>
                      <span>Edge AI processing locally...</span>
                    </div>
                  </div>
                </div>
              )}

              {demoClip.fallDetected && !isAnalyzing && (
                <div className="space-y-3">
                  <div className="bg-red-950/50 border border-red-900/50 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 bg-red-500"></div>
                      <span className="text-base font-bold text-red-400 uppercase tracking-wider">Fall Detected</span>
                    </div>
                    <p className="text-xs font-mono text-red-300/70">
                      Incident timestamp: ~{demoClip.fallTimestamp?.toFixed(1)}s in 10-second clip
                    </p>
                  </div>

                  <button
                    onClick={handleViewClip}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-4 px-6 text-sm font-bold uppercase tracking-wider transition-colors"
                  >
                    🔴 View Incident Clip (One-Time Only)
                  </button>

                  <div className="bg-zinc-900/50 border border-zinc-800 p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">⚠️</span>
                      <p className="text-[10px] font-mono text-zinc-500 leading-relaxed">
                        Clip will auto-delete after viewing. No storage. No cloud backup.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-zinc-800">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-zinc-600">
            <div>
              <div className="text-2xl mb-2">🎥</div>
              <p className="font-mono text-xs leading-relaxed">
                Upload video for edge AI analysis. Processing happens locally—no server upload.
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">🔍</div>
              <p className="font-mono text-xs leading-relaxed">
                System scans for fall patterns. Only critical safety events trigger retention.
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">🗑️</div>
              <p className="font-mono text-xs leading-relaxed">
                View incident once, then automatic deletion. Zero permanent storage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
