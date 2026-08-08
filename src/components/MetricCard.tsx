import React from 'react';
import { Heart, Activity, Droplets, Wind, Thermometer, Compass, Radio } from 'lucide-react';
import { HealthReading, HealthStatus, ThresholdConfig } from '../types';
import { convertTemp, formatTimeAgo } from '../utils/healthCalculators';

interface MetricCardProps {
  type: 'heartRate' | 'bloodPressure' | 'glucose' | 'spO2' | 'temperature' | 'skinPressure';
  reading: HealthReading | null;
  status: HealthStatus;
  config: ThresholdConfig;
  tempUnit: 'C' | 'F';
  onTempUnitToggle?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  type,
  reading,
  status,
  config,
  tempUnit,
  onTempUnitToggle,
}) => {
  if (!reading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-slate-200 dark:bg-slate-800 h-10 w-10"></div>
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // Get status color tokens
  const getStatusBadge = () => {
    switch (status) {
      case 'alert':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800',
          dot: 'bg-red-500',
          label: 'Alert',
        };
      case 'attention':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
          dot: 'bg-amber-500',
          label: 'Attention',
        };
      case 'normal':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
          dot: 'bg-emerald-500',
          label: 'Normal',
        };
    }
  };

  const badge = getStatusBadge();

  // Card specific configurations
  const getCardDetails = () => {
    switch (type) {
      case 'heartRate':
        return {
          title: 'Heart Rate',
          icon: Heart,
          iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
          value: `${reading.heartRate}`,
          unit: 'BPM',
          subtitle: `Threshold: ${config.heartRateMin}–${config.heartRateMax} BPM`,
          extraWidget: (
            <div className="flex items-center gap-1 mt-2 text-rose-500">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <svg className="h-6 w-full max-w-[120px]" viewBox="0 0 100 25" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M0 12 L20 12 L25 5 L30 22 L35 2 L40 18 L45 12 L100 12" />
              </svg>
            </div>
          ),
          note: 'Pulse measured via Optical PPG sensor',
        };

      case 'bloodPressure':
        return {
          title: 'Blood Pressure',
          icon: Activity,
          iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
          value: `${reading.systolicBP} / ${reading.diastolicBP}`,
          unit: 'mmHg',
          subtitle: `Normal Target: <${config.systolicMax}/${config.diastolicMax}`,
          extraWidget: (
            <div className="mt-2 text-[11px] text-slate-500 flex justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-1.5">
              <span>SYS: <strong className="text-slate-700 dark:text-slate-200">{reading.systolicBP}</strong></span>
              <span>DIA: <strong className="text-slate-700 dark:text-slate-200">{reading.diastolicBP}</strong></span>
            </div>
          ),
          note: 'PPG estimate (cuff recommended for clinical accuracy)',
        };

      case 'glucose':
        return {
          title: 'Blood Glucose',
          icon: Droplets,
          iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400',
          value: `${reading.glucose}`,
          unit: 'mg/dL',
          subtitle: `Target: ${config.glucoseMin}–${config.glucoseMax} mg/dL`,
          extraWidget: null,
          note: 'Estimated reference (glucometer needed for clinical test)',
        };

      case 'spO2':
        return {
          title: 'Blood Oxygen',
          icon: Wind,
          iconBg: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400',
          value: `${reading.spO2}%`,
          unit: 'SpO2',
          subtitle: `Min Threshold: ${config.spO2Min}%`,
          extraWidget: (
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2.5 overflow-hidden">
              <div
                className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, reading.spO2)}%` }}
              />
            </div>
          ),
          note: 'Reflectance Oximetry LED',
        };

      case 'temperature':
        return {
          title: 'Body Temp',
          icon: Thermometer,
          iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
          value: convertTemp(reading.temperature, tempUnit),
          unit: '',
          subtitle: `Normal Range: ${convertTemp(config.tempMin, tempUnit)}–${convertTemp(config.tempMax, tempUnit)}`,
          extraWidget: (
            <div className="mt-1 flex justify-end">
              <button
                onClick={onTempUnitToggle}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline cursor-pointer"
              >
                Switch to °{tempUnit === 'C' ? 'F' : 'C'}
              </button>
            </div>
          ),
          note: 'Skin surface contact thermistor',
        };

      case 'skinPressure':
      default:
        return {
          title: 'Pressure & Motion',
          icon: Compass,
          iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
          value: `${reading.skinPressure}`,
          unit: 'hPa',
          subtitle: reading.steps !== undefined ? `Steps: ${reading.steps.toLocaleString()}` : 'Ambient Barometer',
          extraWidget: null,
          note: 'Barometric sensor + wrist contact check',
        };
    }
  };

  const info = getCardDetails();
  const IconComponent = info.icon;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
      <div>
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${info.iconBg}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{info.title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{info.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {reading.isDemo && (
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono">
                Demo
              </span>
            )}
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
              {badge.label}
            </span>
          </div>
        </div>

        {/* Primary Value */}
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <div>
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {info.value}
            </span>
            {info.unit && <span className="ml-1 text-sm font-medium text-slate-500 dark:text-slate-400">{info.unit}</span>}
          </div>

          <div className="text-right text-[11px] text-slate-400">
            {formatTimeAgo(reading.timestamp)}
          </div>
        </div>

        {info.extraWidget}
      </div>

      {/* Footer Disclaimer/Sensor note */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between gap-1">
        <span className="truncate" title={info.note}>
          {info.note}
        </span>
        <span className="shrink-0 text-slate-400 font-mono">
          {reading.source === 'manual_entry' ? 'Manual' : 'Sensor'}
        </span>
      </div>
    </div>
  );
};
