
import React, { useRef, useEffect, useState } from 'react';

declare const poseDetection: any;
declare const tf: any;

interface Props {
  onBack: () => void;
}

interface PersonState {
  trackId: number;
  fallBuffer: number;      // Consecutive frames in "alert pose"
  recoveryBuffer: number;  // Consecutive frames in "stable pose" to reset
  status: 'STABLE' | 'FALLEN';
  lastAlertTime: number;
  isLocked: boolean;        // Prevents re-triggering until recovery
}

const DevTestingPage: React.FC<Props> = ({ onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<any>(null);
  const personStates = useRef<Map<number, PersonState>>(new Map());
  const animationFrameId = useRef<number | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [fps, setFps] = useState(0);
  const [activePeople, setActivePeople] = useState(0);

  // Constants for sensitivity
  const CONFIRM_THRESHOLD = 8;    // ~0.3s to confirm (slightly faster)
  const RECOVERY_THRESHOLD = 50;  // ~2.0s to confirm standing
  const MIN_SCORE = 0.35;

  useEffect(() => {
    let stream: MediaStream;

    const init = async () => {
      try {
        await tf.ready();
        await tf.setBackend('webgl');
        
        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
          enableSmoothing: true,
          trackerType: poseDetection.TrackerType.BoundingBox
        };
        
        detectorRef.current = await poseDetection.createDetector(model, detectorConfig);
        setModelLoaded(true);

        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsStreaming(true);
            animationFrameId.current = requestAnimationFrame(render);
          };
        }
      } catch (e) {
        console.error("Initialization failed:", e);
      }
    };

    let lastTime = performance.now();
    
    const render = async () => {
      // ALWAYS schedule the next frame first to prevent the loop from dying on errors or paused video
      animationFrameId.current = requestAnimationFrame(render);

      if (!detectorRef.current || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx || video.paused || video.readyState < 2) return;

      try {
        // Sync canvas dimensions
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const now = performance.now();
        setFps(Math.round(1000 / (now - lastTime)));
        lastTime = now;

        const poses = await detectorRef.current.estimatePoses(video);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const detectedIds = new Set<number>();
        poses.forEach((pose: any) => {
          if (pose.score < 0.2) return;
          const id = pose.id || 0;
          detectedIds.add(id);

          if (!personStates.current.has(id)) {
            personStates.current.set(id, {
              trackId: id,
              fallBuffer: 0,
              recoveryBuffer: 0,
              status: 'STABLE',
              lastAlertTime: 0,
              isLocked: false
            });
          }

          const state = personStates.current.get(id)!;
          const alertProfile = checkCompromisedPose(pose, canvas.height);

          // State Machine
          if (alertProfile) {
            state.recoveryBuffer = 0;
            if (!state.isLocked) {
              state.fallBuffer++;
              if (state.fallBuffer >= CONFIRM_THRESHOLD) {
                state.status = 'FALLEN';
                state.isLocked = true;
                state.lastAlertTime = Date.now();
              }
            }
          } else {
            if (state.isLocked) {
              state.recoveryBuffer++;
              if (state.recoveryBuffer >= RECOVERY_THRESHOLD) {
                state.status = 'STABLE';
                state.isLocked = false;
                state.fallBuffer = 0;
                state.recoveryBuffer = 0;
              }
            } else {
              state.fallBuffer = Math.max(0, state.fallBuffer - 1);
            }
          }

          drawSkeleton(ctx, pose, state, alertProfile);
        });

        for (const key of personStates.current.keys()) {
          if (!detectedIds.has(key)) personStates.current.delete(key);
        }
        setActivePeople(detectedIds.size);
      } catch (err) {
        console.error("Render loop error:", err);
      }
    };

    /**
     * Enhanced Trigger Logic
     */
    const checkCompromisedPose = (pose: any, frameHeight: number) => {
      const kp = pose.keypoints;
      const get = (name: string) => kp.find((k: any) => k.name === name);
      const valid = (p: any) => p && p.score > MIN_SCORE;

      const nose = get('nose');
      const lHip = get('left_hip');
      const rHip = get('right_hip');
      const lKnee = get('left_knee');
      const rKnee = get('right_knee');
      const lAnkle = get('left_ankle');
      const rAnkle = get('right_ankle');
      const lWrist = get('left_wrist');
      const rWrist = get('right_wrist');
      const lShoulder = get('left_shoulder');
      const rShoulder = get('right_shoulder');

      const avgHipY = (valid(lHip) && valid(rHip)) ? (lHip.y + rHip.y) / 2 : (lHip?.y || rHip?.y);
      const avgAnkleY = (valid(lAnkle) && valid(rAnkle)) ? (lAnkle.y + rAnkle.y) / 2 : (lAnkle?.y || rAnkle?.y);
      const avgShoulderY = (valid(lShoulder) && valid(rShoulder)) ? (lShoulder.y + rShoulder.y) / 2 : (lShoulder?.y || rShoulder?.y);

      // Signals
      const nearGround = (avgHipY || 0) > frameHeight * 0.55;

      // 1. Horizontal Lying
      let isHorizontal = false;
      if (valid(nose) && avgHipY) {
        const bodyHeight = Math.abs(avgHipY - nose.y);
        const shoulderWidth = Math.abs((lShoulder?.x || 0) - (rShoulder?.x || 0)) || 100;
        if (bodyHeight < shoulderWidth * 1.0) isHorizontal = true;
      }

      // 2. Sitting/Crouching (Vertical compression)
      let isSitting = false;
      if (avgHipY && avgAnkleY && avgShoulderY) {
        const legLength = Math.abs(avgAnkleY - avgHipY);
        const torsoLength = Math.abs(avgHipY - avgShoulderY);
        // If legs are compressed (seated) or hips are very close to ankles
        if (legLength < torsoLength * 1.2 || legLength < 50) isSitting = true;
      }

      // 3. Hands Up Distress (Wrist above nose while seated)
      let isDistress = false;
      if (isSitting && (valid(lWrist) || valid(rWrist)) && valid(nose)) {
        const wristY = Math.min(lWrist?.y || 9999, rWrist?.y || 9999);
        if (wristY < nose.y) isDistress = true;
      }

      // 4. Knee Bend (Extreme compression)
      let extremeKneeBend = false;
      if (valid(lKnee) && avgHipY && avgAnkleY) {
        if (Math.abs(lKnee.y - avgHipY) < 40 || Math.abs(lKnee.y - avgAnkleY) < 40) extremeKneeBend = true;
      }

      if (isHorizontal && nearGround) return 'FALL_DETECTED';
      if (isDistress) return 'DISTRESS_RAISED_HANDS';
      if ((isSitting || extremeKneeBend) && nearGround) return 'LOW_CG_COMPRESSION';

      return null;
    };

    const drawSkeleton = (ctx: CanvasRenderingContext2D, pose: any, state: PersonState, profile: string | null) => {
      const isAlert = state.status === 'FALLEN';
      const color = isAlert ? '#FF3B30' : '#32D74B';
      const kps = pose.keypoints;

      // Draw Skeleton Lines
      const pairs = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      pairs.forEach(([i, j]: [number, number]) => {
        const p1 = kps[i];
        const p2 = kps[j];
        if (p1.score > MIN_SCORE && p2.score > MIN_SCORE) {
          ctx.strokeStyle = color;
          ctx.globalAlpha = isAlert ? 0.9 : 0.5;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });

      // Draw Keypoints
      ctx.globalAlpha = 1.0;
      kps.forEach((p: any) => {
        if (p.score > MIN_SCORE) {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
          ctx.fill();
        }
      });

      // Bounding Box and Label
      const validKps = kps.filter((k: any) => k.score > MIN_SCORE);
      if (validKps.length > 3) {
        const minX = Math.min(...validKps.map((k: any) => k.x)) - 25;
        const minY = Math.min(...validKps.map((k: any) => k.y)) - 25;
        const maxX = Math.max(...validKps.map((k: any) => k.x)) + 25;
        const maxY = Math.max(...validKps.map((k: any) => k.y)) + 25;

        ctx.strokeStyle = color;
        ctx.setLineDash(isAlert ? [] : [10, 5]);
        ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
        ctx.setLineDash([]);

        ctx.fillStyle = color;
        const label = isAlert ? `ID:${state.trackId} [ALERT: ${profile}]` : `ID:${state.trackId} MONITORING`;
        const tw = ctx.measureText(label).width;
        ctx.fillRect(minX, minY - 30, tw + 20, 22);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 12px Space Grotesk';
        ctx.fillText(label, minX + 10, minY - 15);
      }
    };

    init();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-black text-white overflow-hidden relative font-mono">
      {/* HUD Headers */}
      <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-50 pointer-events-none">
        <div className="flex items-center gap-6 pointer-events-auto">
          <button onClick={onBack} className="w-12 h-12 border border-white/10 hover:border-white transition-all flex items-center justify-center bg-black/60 rounded-full">
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="font-display">
            <h2 className="font-black text-2xl uppercase tracking-tighter">Corridor_Optical_Probe</h2>
            <div className="flex gap-4 mt-1 opacity-60">
              <span className="text-[10px] uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Inference_Active
              </span>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto flex flex-col items-end gap-2 bg-black/60 backdrop-blur-md p-6 border border-white/10">
            <div className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                Sync: <span className="text-white">{fps} FPS</span>
            </div>
            <div className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                Subjects: <span className="text-white">{activePeople}</span>
            </div>
        </div>
      </div>

      {/* Viewport */}
      <div className="flex-1 flex items-center justify-center relative bg-black overflow-hidden">
        {(!isStreaming || !modelLoaded) && (
          <div className="text-center flex flex-col items-center gap-6 z-50">
            <div className="w-12 h-12 border-t-2 border-white rounded-full animate-spin"></div>
            <p className="text-[10px] uppercase tracking-[0.5em] text-zinc-500 font-black">Initializing Neural Matrix</p>
          </div>
        )}
        
        <div className={`relative w-full h-full flex items-center justify-center transition-opacity duration-700 ${isStreaming ? 'opacity-100' : 'opacity-0'}`}>
          <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-contain" />
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-contain z-20 pointer-events-none" />
        </div>
      </div>

      {/* Footer */}
      <div className="h-20 bg-black border-t border-white/5 flex items-center justify-between px-12 z-50">
        <div className="flex items-center gap-12">
           <div className="flex flex-col gap-1">
              <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Confidence_Log</span>
              <div className="flex items-end gap-1 h-6">
                 {[...Array(30)].map((_, i) => (
                   <div key={i} className="w-1 bg-white/20" style={{ height: `${20 + Math.random() * 80}%` }}></div>
                 ))}
              </div>
           </div>
        </div>
        <div className="text-right">
           <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Protocol NX_01</span>
           <p className="text-[12px] font-black text-white/40 tracking-[0.2em]">EDGE_AI_SOVEREIGN</p>
        </div>
      </div>
      <div className="scanline"></div>
    </div>
  );
};

export default DevTestingPage;
