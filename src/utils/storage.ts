import { HealthReading, ThresholdConfig, UserProfile, WatchDevice } from '../types';
import { DEFAULT_PROFILE, DEFAULT_THRESHOLDS, generateInitialReadings, INITIAL_WATCH_DEVICE } from '../data/initialData';

const KEYS = {
  READINGS: 'smart_health_watch_readings_v1',
  THRESHOLDS: 'smart_health_watch_thresholds_v1',
  PROFILE: 'smart_health_watch_profile_v1',
  WATCH_DEVICE: 'smart_health_watch_device_v1',
  DISCLAIMER_ACK: 'smart_health_watch_disclaimer_ack_v1',
};

// Load readings from LocalStorage or populate default sample data
export function loadReadings(): HealthReading[] {
  try {
    const data = localStorage.getItem(KEYS.READINGS);
    if (!data) {
      const initial = generateInitialReadings();
      saveReadings(initial);
      return initial;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load readings from storage:', err);
    return generateInitialReadings();
  }
}

export function saveReadings(readings: HealthReading[]): void {
  try {
    localStorage.setItem(KEYS.READINGS, JSON.stringify(readings));
  } catch (err) {
    console.error('Failed to save readings to storage:', err);
  }
}

export function addReading(reading: HealthReading): HealthReading[] {
  const current = loadReadings();
  // Keep up to 500 essential logs to stay fast and lightweight
  const updated = [reading, ...current].slice(0, 500);
  saveReadings(updated);
  return updated;
}

export function clearAllReadings(): HealthReading[] {
  localStorage.removeItem(KEYS.READINGS);
  return [];
}

export function loadThresholds(): ThresholdConfig {
  try {
    const data = localStorage.getItem(KEYS.THRESHOLDS);
    return data ? JSON.parse(data) : DEFAULT_THRESHOLDS;
  } catch {
    return DEFAULT_THRESHOLDS;
  }
}

export function saveThresholds(config: ThresholdConfig): void {
  try {
    localStorage.setItem(KEYS.THRESHOLDS, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save thresholds:', err);
  }
}

export function loadProfile(): UserProfile {
  try {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile:', err);
  }
}

export function loadWatchDevice(): WatchDevice {
  try {
    const data = localStorage.getItem(KEYS.WATCH_DEVICE);
    return data ? JSON.parse(data) : INITIAL_WATCH_DEVICE;
  } catch {
    return INITIAL_WATCH_DEVICE;
  }
}

export function saveWatchDevice(device: WatchDevice): void {
  try {
    localStorage.setItem(KEYS.WATCH_DEVICE, JSON.stringify(device));
  } catch (err) {
    console.error('Failed to save watch device state:', err);
  }
}

// Calculate client storage memory size
export function getStorageStats(): { bytesUsed: number; formattedSize: string; count: number } {
  try {
    let totalBytes = 0;
    for (const key in localStorage) {
      if (key.startsWith('smart_health_watch_')) {
        const item = localStorage.getItem(key);
        if (item) totalBytes += item.length * 2; // ~2 bytes per char UTF-16
      }
    }
    const kb = totalBytes / 1024;
    const formatted = kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(1)} KB`;
    const readings = loadReadings();
    return { bytesUsed: totalBytes, formattedSize: formatted, count: readings.length };
  } catch {
    return { bytesUsed: 0, formattedSize: '0 KB', count: 0 };
  }
}

// CSV Export functionality
export function exportReadingsToCSV(readings: HealthReading[], profileName: string): void {
  if (readings.length === 0) return;

  const headers = [
    'Timestamp (ISO)',
    'Date & Time',
    'Heart Rate (BPM)',
    'Systolic BP (mmHg)',
    'Diastolic BP (mmHg)',
    'SpO2 (%)',
    'Glucose (mg/dL)',
    'Temperature (°C)',
    'Skin/Baro Pressure (hPa)',
    'Data Type',
    'Source',
    'Notes',
  ];

  const rows = readings.map((r) => [
    `"${r.timestamp}"`,
    `"${new Date(r.timestamp).toLocaleString()}"`,
    r.heartRate,
    r.systolicBP,
    r.diastolicBP,
    r.spO2,
    r.glucose,
    r.temperature,
    r.skinPressure,
    r.isDemo ? 'DEMO / SIMULATED' : 'LIVE MEASURED',
    `"${r.source}"`,
    `"${r.notes || ''}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = profileName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);

  link.setAttribute('href', url);
  link.setAttribute('download', `smart_health_readings_${safeName}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
