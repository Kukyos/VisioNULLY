
import { useState, useEffect, useRef } from 'react';
import { Camera, SystemStatus, BufferFrame } from '../types';

const ROOMS = ["WARD A1", "WARD A2", "LOUNGE 01", "DINING B", "WARD C1", "KITCHEN", "HALLWAY N", "ENTRANCE"];

export const useSimulation = () => {
  const [cameras, setCameras] = useState<Camera[]>(
    ROOMS.map((room, i) => ({
      id: `cam-${i}`,
      room,
      status: 'MONITORING',
      buffer: []
    }))
  );
  
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);
  const frameCounter = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCameras(prev => prev.map(cam => {
        const newFrame: BufferFrame = {
          id: frameCounter.current++,
          timestamp: Date.now(),
          intensity: Math.random() * 100
        };
        // Keep last 30 frames (ephemeral buffer)
        return {
          ...cam,
          buffer: [...cam.buffer, newFrame].slice(-30)
        };
      }));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const triggerAlert = (id: string) => {
    setCameras(prev => prev.map(cam => cam.id === id ? { ...cam, status: 'ALERT' } : cam));
    setActiveAlertId(id);
  };

  const clearAlert = (id: string) => {
    setCameras(prev => prev.map(cam => cam.id === id ? { ...cam, status: 'MONITORING' } : cam));
    if (activeAlertId === id) setActiveAlertId(null);
  };

  return { cameras, triggerAlert, clearAlert, activeAlertId };
};
