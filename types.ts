
export type SystemStatus = 'MONITORING' | 'ALERT' | 'STANDBY';

export interface Camera {
  id: string;
  room: string;
  status: SystemStatus;
  buffer: BufferFrame[];
}

export interface BufferFrame {
  id: number;
  timestamp: number;
  intensity: number; // Abstract visual activity
}

export interface EventLog {
  id: string;
  room: string;
  time: string;
  type: string;
}

// Fixed error in components/Sidebar.tsx: Module '"../types"' has no exported member 'StoredEvent'.
export interface StoredEvent {
  id: string;
  cameraName: string;
  timestamp: string;
  clipUrl: string;
}
