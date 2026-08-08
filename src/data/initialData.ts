import { HealthReading, ThresholdConfig, UserProfile, WatchDevice } from '../types';

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  heartRateMin: 60,
  heartRateMax: 100,
  systolicMax: 130,
  diastolicMax: 85,
  spO2Min: 95,
  glucoseMin: 70,
  glucoseMax: 140,
  tempMin: 36.1,
  tempMax: 37.5,
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Morgan',
  age: 34,
  gender: 'Non-binary / Unspecified',
  tempUnit: 'C',
  emergencyContactName: 'Dr. Sam Vance',
  emergencyContactPhone: '+1 (555) 019-2834',
  medicalNotes: 'Routine fitness tracking & wellness monitoring. Non-invasive sensor evaluation.',
};

export const INITIAL_WATCH_DEVICE: WatchDevice = {
  id: 'watch-sim-01',
  name: 'Sensing Band V2 (Demo)',
  connected: true,
  batteryLevel: 88,
  signalQuality: 'Good',
  firmwareVersion: 'v2.4.1-sensing',
  hardwareSupportsBP: false, // PPG estimate only
  hardwareSupportsGlucose: false, // Optical reference estimate only
  isSimulated: true,
};

// Generate realistic 7-day initial demo data marked as isDemo: true
export function generateInitialReadings(): HealthReading[] {
  const readings: HealthReading[] = [];
  const now = new Date();
  
  // Create 15 data points across the past 7 days
  for (let i = 14; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 12 * 60 * 60 * 1000); // every 12 hours
    
    // Simulate slight natural fluctuations
    const hr = Math.floor(68 + Math.sin(i * 0.8) * 12 + (Math.random() * 6 - 3));
    const sys = Math.floor(118 + Math.cos(i * 0.5) * 8 + (Math.random() * 4 - 2));
    const dia = Math.floor(76 + Math.cos(i * 0.5) * 5 + (Math.random() * 3 - 1));
    const spo2 = Math.min(100, Math.floor(98 - (i % 3 === 0 ? 1 : 0) + (Math.random() * 1.5 - 0.5)));
    const glucose = Math.floor(95 + Math.sin(i * 1.2) * 15 + (Math.random() * 8 - 4));
    const temp = Number((36.5 + Math.sin(i * 0.4) * 0.4 + (Math.random() * 0.2 - 0.1)).toFixed(1));
    const skinPress = Number((1013.2 + Math.cos(i * 0.3) * 2.5).toFixed(1));
    const steps = 3000 + (14 - i) * 650 + Math.floor(Math.random() * 800);

    readings.push({
      id: `demo-read-${15 - i}-${time.getTime()}`,
      timestamp: time.toISOString(),
      heartRate: hr,
      systolicBP: sys,
      diastolicBP: dia,
      spO2: spo2,
      glucose: glucose,
      temperature: temp,
      skinPressure: skinPress,
      steps: steps,
      isDemo: true, // Safety rule: explicitly tagged as demo data
      source: 'simulated_watch',
      notes: i === 0 ? 'Latest automated sensor pulse check' : undefined,
    });
  }

  return readings;
}

export const MEDICAL_DISCLAIMER = {
  shortNotice: 'DISCLAIMER: DEMO & SENSOR DATA FOR WELLNESS MONITORING ONLY. NOT A MEDICAL DIAGNOSIS.',
  fullText:
    'This Smart Health Sensing Watch application displays simulated demo measurements or raw wearable sensor telemetry. Optical smartwatch sensors (PPG) provide estimated reference trends and cannot replace clinical-grade medical hardware (such as traditional blood pressure cuffs or invasive blood glucose meters). Always consult a certified medical professional for diagnosis or health concerns.',
};
