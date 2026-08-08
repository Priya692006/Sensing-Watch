import { ActiveAlert, HealthReading, HealthStatus, ThresholdConfig } from '../types';

export function evaluateParameterStatus(
  val: number,
  min: number,
  max: number,
  margin = 0.1
): HealthStatus {
  if (val < min || val > max) {
    return 'alert';
  }
  // Attention if near boundaries (within 10% of threshold range)
  const range = max - min;
  if (val <= min + range * margin || val >= max - range * margin) {
    return 'attention';
  }
  return 'normal';
}

export function evaluateBPStatus(sys: number, dia: number, config: ThresholdConfig): HealthStatus {
  if (sys > config.systolicMax + 10 || dia > config.diastolicMax + 10 || sys < 90 || dia < 60) {
    return 'alert';
  }
  if (sys > config.systolicMax || dia > config.diastolicMax) {
    return 'attention';
  }
  return 'normal';
}

export function evaluateGlucoseStatus(glucose: number, config: ThresholdConfig): HealthStatus {
  if (glucose < config.glucoseMin - 15 || glucose > config.glucoseMax + 40) {
    return 'alert';
  }
  if (glucose < config.glucoseMin || glucose > config.glucoseMax) {
    return 'attention';
  }
  return 'normal';
}

export function calculateActiveAlerts(
  latest: HealthReading | null,
  config: ThresholdConfig
): ActiveAlert[] {
  if (!latest) return [];

  const alerts: ActiveAlert[] = [];
  const timeStr = new Date(latest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Heart Rate
  if (latest.heartRate > config.heartRateMax) {
    alerts.push({
      id: `hr-high-${latest.id}`,
      parameter: 'Heart Rate',
      message: `High Pulse Rate recorded (${latest.heartRate} BPM > max ${config.heartRateMax})`,
      severity: latest.heartRate > config.heartRateMax + 20 ? 'alert' : 'attention',
      timestamp: timeStr,
      readingValue: `${latest.heartRate} BPM`,
    });
  } else if (latest.heartRate < config.heartRateMin) {
    alerts.push({
      id: `hr-low-${latest.id}`,
      parameter: 'Heart Rate',
      message: `Low Pulse Rate recorded (${latest.heartRate} BPM < min ${config.heartRateMin})`,
      severity: latest.heartRate < config.heartRateMin - 10 ? 'alert' : 'attention',
      timestamp: timeStr,
      readingValue: `${latest.heartRate} BPM`,
    });
  }

  // Blood Pressure
  if (latest.systolicBP > config.systolicMax || latest.diastolicBP > config.diastolicMax) {
    alerts.push({
      id: `bp-high-${latest.id}`,
      parameter: 'Blood Pressure',
      message: `Elevated Blood Pressure estimated (${latest.systolicBP}/${latest.diastolicBP} mmHg)`,
      severity: latest.systolicBP > config.systolicMax + 15 ? 'alert' : 'attention',
      timestamp: timeStr,
      readingValue: `${latest.systolicBP}/${latest.diastolicBP} mmHg`,
    });
  }

  // Oxygen
  if (latest.spO2 < config.spO2Min) {
    alerts.push({
      id: `spo2-low-${latest.id}`,
      parameter: 'Blood Oxygen',
      message: `Oxygen saturation below minimum (${latest.spO2}% < ${config.spO2Min}%)`,
      severity: latest.spO2 < 90 ? 'alert' : 'attention',
      timestamp: timeStr,
      readingValue: `${latest.spO2}%`,
    });
  }

  // Glucose
  if (latest.glucose > config.glucoseMax) {
    alerts.push({
      id: `gluc-high-${latest.id}`,
      parameter: 'Blood Sugar',
      message: `Elevated Glucose level (${latest.glucose} mg/dL > ${config.glucoseMax})`,
      severity: latest.glucose > config.glucoseMax + 40 ? 'alert' : 'attention',
      timestamp: timeStr,
      readingValue: `${latest.glucose} mg/dL`,
    });
  } else if (latest.glucose < config.glucoseMin) {
    alerts.push({
      id: `gluc-low-${latest.id}`,
      parameter: 'Blood Sugar',
      message: `Low Glucose level (${latest.glucose} mg/dL < ${config.glucoseMin})`,
      severity: latest.glucose < 60 ? 'alert' : 'attention',
      timestamp: timeStr,
      readingValue: `${latest.glucose} mg/dL`,
    });
  }

  // Temperature
  if (latest.temperature > config.tempMax) {
    alerts.push({
      id: `temp-high-${latest.id}`,
      parameter: 'Body Temp',
      message: `Elevated Temperature recorded (${latest.temperature}°C > ${config.tempMax}°C)`,
      severity: latest.temperature > 38.0 ? 'alert' : 'attention',
      timestamp: timeStr,
      readingValue: `${latest.temperature}°C`,
    });
  }

  return alerts;
}

export function computeOverallHealthStatus(
  latest: HealthReading | null,
  config: ThresholdConfig
): { status: HealthStatus; label: string; score: number; colorClass: string; bgClass: string } {
  if (!latest) {
    return {
      status: 'normal',
      label: 'Awaiting Data',
      score: 100,
      colorClass: 'text-gray-600',
      bgClass: 'bg-gray-100 dark:bg-gray-800',
    };
  }

  const alerts = calculateActiveAlerts(latest, config);
  const criticalCount = alerts.filter((a) => a.severity === 'alert').length;
  const attentionCount = alerts.filter((a) => a.severity === 'attention').length;

  if (criticalCount > 0) {
    return {
      status: 'alert',
      label: 'Attention Required',
      score: Math.max(50, 85 - criticalCount * 20),
      colorClass: 'text-red-600 dark:text-red-400',
      bgClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
    };
  }

  if (attentionCount > 0) {
    return {
      status: 'attention',
      label: 'Mild Variance',
      score: Math.max(75, 92 - attentionCount * 8),
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
    };
  }

  return {
    status: 'normal',
    label: 'Optimal Baseline',
    score: 98,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
  };
}

// Generate realistic next simulated tick based on previous reading
export function generateSensorTick(
  prevReading: HealthReading | null,
  isDemo = true,
  activityMode: 'resting' | 'exercise' | 'stress' | 'sleep' = 'resting'
): HealthReading {
  const baseHr = activityMode === 'exercise' ? 128 : activityMode === 'stress' ? 98 : activityMode === 'sleep' ? 56 : 72;
  const baseSys = activityMode === 'exercise' ? 138 : activityMode === 'stress' ? 128 : 118;
  const baseDia = activityMode === 'exercise' ? 88 : activityMode === 'stress' ? 82 : 76;
  const baseGluc = activityMode === 'exercise' ? 108 : 98;

  const hrVariation = Math.floor(Math.random() * 7 - 3);
  const hr = Math.max(45, Math.min(185, (prevReading ? prevReading.heartRate : baseHr) + hrVariation));

  const sysVariation = Math.floor(Math.random() * 5 - 2);
  const sys = Math.max(90, Math.min(160, (prevReading ? prevReading.systolicBP : baseSys) + sysVariation));

  const diaVariation = Math.floor(Math.random() * 3 - 1);
  const dia = Math.max(55, Math.min(100, (prevReading ? prevReading.diastolicBP : baseDia) + diaVariation));

  const spo2 = Math.min(100, Math.max(92, Math.floor(98 + (Math.random() * 2 - 1))));
  const glucose = Math.max(65, Math.min(220, (prevReading ? prevReading.glucose : baseGluc) + Math.floor(Math.random() * 5 - 2)));
  const temp = Number((36.5 + (activityMode === 'exercise' ? 0.4 : 0) + (Math.random() * 0.2 - 0.1)).toFixed(1));
  const skinPress = Number((1013.2 + (Math.random() * 1.2 - 0.6)).toFixed(1));

  return {
    id: `tick-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    heartRate: hr,
    systolicBP: sys,
    diastolicBP: dia,
    spO2: spo2,
    glucose: glucose,
    temperature: temp,
    skinPressure: skinPress,
    steps: (prevReading?.steps || 3420) + Math.floor(Math.random() * 15),
    isDemo: isDemo,
    source: isDemo ? 'simulated_watch' : 'bluetooth_watch',
  };
}

export function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 5) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Recently';
  }
}

export function convertTemp(celsius: number, unit: 'C' | 'F'): string {
  if (unit === 'F') {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${fahrenheit.toFixed(1)}°F`;
  }
  return `${celsius.toFixed(1)}°C`;
}
