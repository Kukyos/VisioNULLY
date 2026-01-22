
import React, { useEffect, useState } from 'react';
import { BACKEND_URL } from '../config';

interface DebugStatus {
    pose_detected: boolean;
    state: string;
    hip_y: number;
    shoulder_y: number;
    torso_angle: number;
    vertical_drop: number;
    head_below_hips: boolean;
}

const FeedPage: React.FC = () => {
    const [debugStatus, setDebugStatus] = useState<DebugStatus | null>(null);
    const [connected, setConnected] = useState(false);
    const [fallCount, setFallCount] = useState(0);

    // Poll debug status
    useEffect(() => {
        let mounted = true;
        const poll = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/debug_status`);
                if (res.ok && mounted) {
                    const data = await res.json();
                    setDebugStatus(data);
                    setConnected(true);
                }
            } catch {
                if (mounted) setConnected(false);
            }
        };
        poll();
        const interval = setInterval(poll, 200);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    // Listen for fall events
    useEffect(() => {
        const src = new EventSource(`${BACKEND_URL}/events`);
        src.addEventListener('fall', () => {
            setFallCount(c => c + 1);
        });
        src.onerror = () => {};
        return () => src.close();
    }, []);

    const getStateColor = (state: string) => {
        if (state === 'FALL_DETECTED') return 'text-red-500';
        if (state === 'FALL_CANDIDATE') return 'text-orange-500';
        if (state === 'NORMAL') return 'text-green-500';
        return 'text-zinc-500';
    };

    const getStateBg = (state: string) => {
        if (state === 'FALL_DETECTED') return 'bg-red-500/20 border-red-500/50';
        if (state === 'FALL_CANDIDATE') return 'bg-orange-500/20 border-orange-500/50';
        if (state === 'NORMAL') return 'bg-green-500/20 border-green-500/50';
        return 'bg-zinc-500/20 border-zinc-500/50';
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                    <a
                        href="/"
                        className="text-zinc-500 hover:text-white text-sm uppercase tracking-widest transition-colors"
                    >
                        ← Back to Dashboard
                    </a>
                </div>
                <h1 className="font-display font-black text-4xl tracking-tighter uppercase">
                    Debug Feed
                </h1>
                <p className="text-zinc-500 text-sm mt-2 font-mono">
                    Live webcam stream with MediaPipe Pose • Fall Detection Debug View
                </p>
            </div>

            {/* Connection Status Banner */}
            <div className={`mb-6 p-3 rounded-lg border ${connected ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    <span className={`text-sm font-mono ${connected ? 'text-green-400' : 'text-red-400'}`}>
                        {connected ? 'CONNECTED TO BACKEND' : 'DISCONNECTED - Start server.py'}
                    </span>
                    <span className="text-zinc-600 text-xs font-mono ml-auto">{BACKEND_URL}</span>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex gap-6">
                {/* Video Feed - Larger */}
                <div className="flex-1">
                    <div className="relative bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
                        {/* Live indicator */}
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/80 px-3 py-1.5 rounded">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            <span className="text-xs font-mono uppercase tracking-widest text-red-400">LIVE</span>
                        </div>

                        {/* Fall count badge */}
                        {fallCount > 0 && (
                            <div className="absolute top-4 right-4 z-10 bg-red-600 px-3 py-1.5 rounded">
                                <span className="text-xs font-mono uppercase text-white">
                                    FALLS: {fallCount}
                                </span>
                            </div>
                        )}

                        {/* Stream */}
                        <img
                            src={`${BACKEND_URL}/video_feed`}
                            alt="Live webcam stream with fall detection"
                            className="w-full aspect-video object-contain bg-black"
                            onError={() => setConnected(false)}
                            onLoad={() => setConnected(true)}
                        />
                    </div>

                    {/* Instructions */}
                    <div className="mt-4 p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                        <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-3">
                            Testing Instructions
                        </h3>
                        <ol className="space-y-2 text-sm text-zinc-400 list-decimal list-inside">
                            <li>Stand in front of webcam until skeleton appears (green)</li>
                            <li>Watch the "State" in debug panel - should show <span className="text-green-400">NORMAL</span></li>
                            <li>Simulate fall: quickly crouch down or lean sideways (torso horizontal)</li>
                            <li>State should change to <span className="text-orange-400">FALL_CANDIDATE</span> then <span className="text-red-400">FALL_DETECTED</span></li>
                            <li>Red banner appears on video when fall is triggered</li>
                        </ol>
                    </div>
                </div>

                {/* Debug Panel - Real-time stats */}
                <div className="w-80 space-y-4">
                    {/* Current State - Large */}
                    <div className={`p-4 rounded-lg border ${getStateBg(debugStatus?.state || 'SEARCHING')}`}>
                        <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">
                            Detection State
                        </div>
                        <div className={`text-2xl font-bold font-mono ${getStateColor(debugStatus?.state || 'SEARCHING')}`}>
                            {debugStatus?.state || 'SEARCHING'}
                        </div>
                    </div>

                    {/* Live Metrics */}
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                        <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-3">
                            Live Metrics
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                                    <span>Pose Detected</span>
                                    <span className={debugStatus?.pose_detected ? 'text-green-400' : 'text-red-400'}>
                                        {debugStatus?.pose_detected ? 'YES' : 'NO'}
                                    </span>
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                                    <span>Torso Angle</span>
                                    <span className="text-white font-mono">{debugStatus?.torso_angle || 0}°</span>
                                </div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-200 ${(debugStatus?.torso_angle || 0) > 55 ? 'bg-red-500' : 'bg-green-500'}`}
                                        style={{ width: `${Math.min(100, (debugStatus?.torso_angle || 0) / 90 * 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                                    <span>0° (standing)</span>
                                    <span className="text-orange-500">55° threshold</span>
                                    <span>90° (lying)</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                                    <span>Vertical Drop</span>
                                    <span className={`font-mono ${(debugStatus?.vertical_drop || 0) > 40 ? 'text-red-400' : 'text-white'}`}>
                                        {debugStatus?.vertical_drop || 0}px
                                    </span>
                                </div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-200 ${(debugStatus?.vertical_drop || 0) > 40 ? 'bg-red-500' : 'bg-blue-500'}`}
                                        style={{ width: `${Math.min(100, Math.abs(debugStatus?.vertical_drop || 0) / 100 * 100)}%` }}
                                    />
                                </div>
                                <div className="text-[10px] text-zinc-600 mt-1">
                                    <span className="text-orange-500">40px threshold for rapid drop</span>
                                </div>
                            </div>

                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-500">Head Below Hips</span>
                                <span className={debugStatus?.head_below_hips ? 'text-red-400' : 'text-zinc-400'}>
                                    {debugStatus?.head_below_hips ? 'YES ⚠' : 'NO'}
                                </span>
                            </div>

                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-500">Shoulder Y</span>
                                <span className="text-white font-mono">{debugStatus?.shoulder_y || 0}px</span>
                            </div>

                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-500">Hip Y</span>
                                <span className="text-white font-mono">{debugStatus?.hip_y || 0}px</span>
                            </div>
                        </div>
                    </div>

                    {/* Detection Logic */}
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                        <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-3">
                            Fall Triggers
                        </h3>
                        <ul className="space-y-2 text-xs font-mono">
                            <li className={`flex items-center gap-2 ${(debugStatus?.torso_angle || 0) > 55 ? 'text-red-400' : 'text-zinc-500'}`}>
                                <span className={`w-2 h-2 rounded-full ${(debugStatus?.torso_angle || 0) > 55 ? 'bg-red-500' : 'bg-zinc-700'}`}></span>
                                Torso horizontal (&gt;55°)
                            </li>
                            <li className={`flex items-center gap-2 ${(debugStatus?.vertical_drop || 0) > 40 ? 'text-red-400' : 'text-zinc-500'}`}>
                                <span className={`w-2 h-2 rounded-full ${(debugStatus?.vertical_drop || 0) > 40 ? 'bg-red-500' : 'bg-zinc-700'}`}></span>
                                Rapid drop (&gt;40px)
                            </li>
                            <li className={`flex items-center gap-2 ${debugStatus?.head_below_hips ? 'text-red-400' : 'text-zinc-500'}`}>
                                <span className={`w-2 h-2 rounded-full ${debugStatus?.head_below_hips ? 'bg-red-500' : 'bg-zinc-700'}`}></span>
                                Head below hips
                            </li>
                        </ul>
                        <p className="text-[10px] text-zinc-600 mt-3">
                            Fall = Horizontal OR (RapidDrop AND HeadLow)
                        </p>
                    </div>

                    {/* Debug Mode Warning */}
                    <div className="p-4 bg-amber-950/30 border border-amber-800/50 rounded-lg">
                        <h3 className="text-xs font-mono text-amber-500 uppercase tracking-widest mb-2">
                            ⚠ Debug Mode
                        </h3>
                        <p className="text-xs text-amber-200/60 leading-relaxed">
                            MediaPipe skeleton + fall detection active.
                            3-second cooldown between fall alerts.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedPage;
