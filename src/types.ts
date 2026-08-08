export type HealthStatus = 'normal' | 'attention' | 'alert';

export interface HealthReading {
  id: string;
  timestamp: string; // ISO string
  heartRate: number; // BPM
  systolicBP: number; // mmHg
  diastolicBP: number; // mmHg
  spO2: number; // %
  glucose: number; // mg/dL
  temperature: number; // °C
  skinPressure: number; // hPa or relative skin contact pressure
  steps?: number;
  isDemo: boolean; // true if demo/simulated data
  source: 'bluetooth_watch' | 'simulated_watch' | 'manual_entry';
  notes?: string;
}

export interface ThresholdConfig {
  heartRateMin: number;
  heartRateMax: number;
  systolicMax: number;
  diastolicMax: number;
  spO2Min: number;
  glucoseMin: number;
  glucoseMax: number;
  tempMin: number; // °C
  tempMax: number; // °C
}

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  tempUnit: 'C' | 'F';
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalNotes: string;
}

export interface WatchDevice {
  id: string;
  name: string;
  connected: boolean;
  batteryLevel: number; // 0-100%
  signalQuality: 'Excellent' | 'Good' | 'Weak' | 'Disconnected';
  firmwareVersion: string;
  hardwareSupportsBP: boolean;
  hardwareSupportsGlucose: boolean;
  isSimulated: boolean;
}

export interface ActiveAlert {
  id: string;
  parameter: string;
  message: string;
  severity: 'attention' | 'alert';
  timestamp: string;
  readingValue: string;
}
