
export type SystemStatus = 'MONITORING' | 'ALERT' | 'STANDBY';
export type AppView = 'DASHBOARD' | 'DEMO';
export type SystemMode = 'PRIVACY' | 'DEMO_UNLOCKED';

export interface Camera {
  id: string;
  room: string;
  status: SystemStatus;
  buffer: BufferFrame[];
  visualBuffer: string[]; // Rolling base64 frames
  streamUrl?: string; 
  lastError?: string;
  isLinking?: boolean;
}

export interface BufferFrame {
  id: number;
  timestamp: number;
  intensity: number;
}

export interface EventLog {
  id: string;
  cameraId: string;
  room: string;
  time: string;
  type: string;
  snapshotBuffer: BufferFrame[];
  videoBuffer: string[]; // The recorded clip
  isFalsePositive?: boolean;
}
