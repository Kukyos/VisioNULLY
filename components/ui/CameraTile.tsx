
import React, { useState, useRef, useEffect } from 'react';
import { Camera, SystemMode } from '../../types';

interface Props {
  camera: Camera;
  mode: SystemMode;
  detector: any;
  onAlert: (id: string, visualBuffer: string[]) => void;
  onView: (id: string) => void;
  onLink: (id: string, url: string) => void;
  onError: (id: string, error: string) => void;
}

const CameraTile: React.FC<Props> = ({ camera, mode, detector, onAlert, onView, onLink, onError }) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [urlInput, setUrlInput] = useState(camera.streamUrl || '');
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCanvasRef = useRef<HTMLCanvasElement>(null);
  const visualBufferRef = useRef<string[]>([]);
  const isAlert = camera.status === 'ALERT';

  // Audio Spectrum Simulation (Privacy Mode)
  useEffect(() => {
    if (mode !== 'PRIVACY' || !audioCanvasRef.current) return;
    const canvas = audioCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const bars = 20;
    const barWidth = canvas.width / bars;
    const values = new Array(bars).fill(0).map(() => Math.random() * 50);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = isAlert ? '#FF3B30' : '#333';
      
      for (let i = 0; i < bars; i++) {
        values[i] += (Math.random() - 0.5) * 10;
        values[i] = Math.max(10, Math.min(canvas.height * 0.8, values[i]));
        const h = values[i];
        ctx.fillRect(i * barWidth + 2, canvas.height - h, barWidth - 4, h);
      }
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [mode, isAlert]);

  // Detection Loop & Visual Buffer Capture
  useEffect(() => {
    if (!detector || !camera.streamUrl || !canvasRef.current || !imageRef.current || camera.lastError) return;

    let active = true;
    const runDetection = async () => {
      if (!active || !imageRef.current || !canvasRef.current) return;
      
      try {
        const img = imageRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (ctx && img.complete && img.naturalWidth > 0) {
          if (canvas.width !== img.clientWidth || canvas.height !== img.clientHeight) {
            canvas.width = img.clientWidth;
            canvas.height = img.clientHeight;
          }

          // Capture frame to buffer (Rolling 15 frames ~3 seconds)
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = 160; // Low res for memory efficiency
          tempCanvas.height = 90;
          const tCtx = tempCanvas.getContext('2d');
          if (tCtx) {
            tCtx.drawImage(img, 0, 0, 160, 90);
            visualBufferRef.current.push(tempCanvas.toDataURL('image/jpeg', 0.5));
            if (visualBufferRef.current.length > 20) visualBufferRef.current.shift();
          }

          // Pose detection (only works if mode is unlocked or we are testing)
          if (mode === 'DEMO_UNLOCKED') {
            const poses = await detector.estimatePoses(img);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (poses && poses.length > 0) {
              const pose = poses[0];
              const isCompromised = checkFall(pose, canvas.height);
              if (isCompromised && !isAlert) {
                onAlert(camera.id, [...visualBufferRef.current]);
              }
              drawPose(ctx, pose, isCompromised || isAlert);
            }
          }
        }
      } catch (e: any) {
        if (e.message.includes('tainted')) {
          onError(camera.id, 'CORS_BLOCK: Snapshot denied by browser security.');
          active = false;
        }
      }
      if (active) setTimeout(runDetection, 200);
    };

    runDetection();
    return () => { active = false; };
  }, [detector, camera.streamUrl, isAlert, camera.lastError, mode]);

  const checkFall = (pose: any, height: number) => {
    const kps = pose.keypoints;
    const nose = kps.find((k: any) => k.name === 'nose');
    const lHip = kps.find((k: any) => k.name === 'left_hip');
    const rHip = kps.find((k: any) => k.name === 'right_hip');
    if (nose && lHip && rHip && nose.score > 0.3) {
      const avgHipY = (lHip.y + rHip.y) / 2;
      return (nose.y > height * 0.55 && avgHipY > height * 0.65);
    }
    return false;
  };

  const drawPose = (ctx: CanvasRenderingContext2D, pose: any, compromised: boolean) => {
    const color = compromised ? '#FF3B30' : '#32D74B';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;
    pose.keypoints.forEach((kp: any) => {
      if (kp.score > 0.3) {
        ctx.beginPath(); ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI); ctx.fill();
      }
    });
  };

  const handleSave = () => {
    let url = urlInput.trim();
    if (!url.startsWith('http')) url = 'http://' + url;
    onLink(camera.id, url);
    setIsConfiguring(false);
  };

  const handleManualAlert = () => {
    onAlert(camera.id, [...visualBufferRef.current]);
  };

  return (
    <div className={`
      relative h-72 border transition-all duration-500 overflow-hidden group
      ${isAlert ? 'border-red-600 bg-red-950/20 shadow-[0_0_30px_rgba(255,0,0,0.2)]' : 'border-zinc-900 bg-black'}
    `}>
      {/* Visual Source */}
      {camera.streamUrl && !camera.lastError ? (
        <div className="relative w-full h-full bg-zinc-950">
          <img 
            ref={imageRef}
            src={camera.streamUrl} 
            crossOrigin="anonymous"
            alt="Live" 
            className={`w-full h-full object-contain transition-opacity duration-1000 ${mode === 'PRIVACY' ? 'opacity-0' : 'opacity-100'}`}
            onError={() => onError(camera.id, 'FEED_INTERRUPTED')}
          />
          {mode === 'DEMO_UNLOCKED' && (
             <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
          )}
          
          {mode === 'PRIVACY' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
               <canvas ref={audioCanvasRef} width={300} height={150} className="w-full h-32 opacity-40" />
               <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                 <i className="fas fa-eye-slash text-zinc-800 text-2xl"></i>
                 <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Privacy Shield: Active</span>
               </div>
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 flex gap-2 z-20">
             <div className="bg-black/80 px-2 py-0.5 text-[8px] text-white/50 font-mono flex items-center gap-1">
                <span className={`w-1 h-1 rounded-full ${mode === 'PRIVACY' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                {mode === 'PRIVACY' ? 'ENCRYPTED_FLOW' : 'OPTICAL_STREAM'}
             </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#050505]">
          {camera.lastError ? (
            <div className="flex flex-col items-center w-full max-w-[200px]">
              <i className="fas fa-exclamation-triangle text-red-600 mb-2"></i>
              <p className="text-[9px] text-red-400 font-mono mb-4 text-center leading-tight uppercase">{camera.lastError}</p>
              <button onClick={() => setIsConfiguring(true)} className="w-full bg-white text-black text-[9px] font-black uppercase py-2">Reconfigure</button>
            </div>
          ) : (
            <>
              <i className="fas fa-video-slash text-zinc-900 text-3xl mb-4"></i>
              <button onClick={() => setIsConfiguring(true)} className="px-6 py-2 border border-zinc-800 text-[10px] font-black uppercase text-zinc-600 hover:text-white transition-all">Link Probe</button>
            </>
          )}
        </div>
      )}

      {/* Header Info */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/90 to-transparent flex justify-between items-start z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-tighter">{camera.id}</p>
          <h4 className="text-white font-black text-sm uppercase tracking-tight">{camera.room}</h4>
        </div>
        <div className="flex gap-2 pointer-events-auto">
            {isAlert ? (
               <button onClick={() => onView(camera.id)} className="px-3 py-1 bg-red-600 text-white text-[8px] font-black uppercase animate-pulse">Review Incident</button>
            ) : (
              <button onClick={handleManualAlert} className="px-3 py-1 bg-zinc-900 text-zinc-600 text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Test Trigger</button>
            )}
            <button onClick={() => setIsConfiguring(true)} className="w-8 h-8 flex items-center justify-center bg-black/50 border border-white/10 text-white hover:bg-white hover:text-black transition-colors">
            <i className="fas fa-cog text-xs"></i>
            </button>
        </div>
      </div>

      {/* Config Overlay */}
      {isConfiguring && (
        <div className="absolute inset-0 z-40 bg-black p-8 flex flex-col justify-center border-2 border-white/10 animate-in fade-in duration-300">
          <p className="text-[10px] font-black text-white uppercase tracking-widest mb-4">Configure Probe Target</p>
          <input 
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="192.168.1.100:8080"
            className="w-full bg-zinc-900 border border-zinc-800 px-3 py-4 text-xs text-white font-mono focus:border-white outline-none mb-4"
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 bg-white text-black text-[10px] font-black uppercase py-3">Connect</button>
            <button onClick={() => setIsConfiguring(false)} className="px-6 border border-zinc-800 text-white text-[10px] font-black uppercase">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraTile;
