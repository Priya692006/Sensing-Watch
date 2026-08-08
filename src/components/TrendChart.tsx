import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Heart, Activity, Droplets, Wind, Thermometer, Compass, Calendar } from 'lucide-react';
import { HealthReading, ThresholdConfig } from '../types';
import { convertTemp } from '../utils/healthCalculators';

interface TrendChartProps {
  readings: HealthReading[];
  config: ThresholdConfig;
  tempUnit: 'C' | 'F';
}

type MetricKey = 'heartRate' | 'bloodPressure' | 'spO2' | 'glucose' | 'temperature' | 'skinPressure';

export const TrendChart: React.FC<TrendChartProps> = ({ readings, config, tempUnit }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('heartRate');
  const [timeHorizon, setTimeHorizon] = useState<'1D' | '7D' | 'ALL'>('7D');

  // Filter readings by horizon & sort chronologically for chart
  const chartData = useMemo(() => {
    if (!readings || readings.length === 0) return [];

    const sorted = [...readings].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const now = new Date().getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    let filtered = sorted;
    if (timeHorizon === '1D') {
      filtered = sorted.filter((r) => now - new Date(r.timestamp).getTime() <= oneDayMs);
    } else if (timeHorizon === '7D') {
      filtered = sorted.filter((r) => now - new Date(r.timestamp).getTime() <= 7 * oneDayMs);
    }

    return filtered.map((r) => {
      const date = new Date(r.timestamp);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dayStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

      const formattedTemp =
        tempUnit === 'F' ? Number(((r.temperature * 9) / 5 + 32).toFixed(1)) : r.temperature;

      return {
        timestamp: r.timestamp,
        label: timeHorizon === '1D' ? timeStr : `${dayStr} ${timeStr}`,
        heartRate: r.heartRate,
        systolicBP: r.systolicBP,
        diastolicBP: r.diastolicBP,
        spO2: r.spO2,
        glucose: r.glucose,
        temperature: formattedTemp,
        skinPressure: r.skinPressure,
        isDemo: r.isDemo,
      };
    });
  }, [readings, timeHorizon, tempUnit]);

  // Compute summary stats
  const stats = useMemo(() => {
    if (chartData.length === 0) return { avg: '0', min: '0', max: '0' };

    let values: number[] = [];
    if (selectedMetric === 'heartRate') values = chartData.map((d) => d.heartRate);
    else if (selectedMetric === 'spO2') values = chartData.map((d) => d.spO2);
    else if (selectedMetric === 'glucose') values = chartData.map((d) => d.glucose);
    else if (selectedMetric === 'temperature') values = chartData.map((d) => d.temperature);
    else if (selectedMetric === 'skinPressure') values = chartData.map((d) => d.skinPressure);
    else if (selectedMetric === 'bloodPressure') values = chartData.map((d) => d.systolicBP);

    if (values.length === 0) return { avg: '0', min: '0', max: '0' };

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = (sum / values.length).toFixed(1);
    const min = Math.min(...values).toFixed(1);
    const max = Math.max(...values).toFixed(1);

    return { avg, min, max };
  }, [chartData, selectedMetric]);

  const metricsConfig = [
    { key: 'heartRate' as MetricKey, label: 'Heart Rate', unit: 'BPM', icon: Heart, color: '#f43f5e', refMin: config.heartRateMin, refMax: config.heartRateMax },
    { key: 'bloodPressure' as MetricKey, label: 'Blood Pressure', unit: 'mmHg', icon: Activity, color: '#6366f1', refMax: config.systolicMax },
    { key: 'spO2' as MetricKey, label: 'Blood Oxygen', unit: 'SpO2 %', icon: Wind, color: '#06b6d4', refMin: config.spO2Min },
    { key: 'glucose' as MetricKey, label: 'Blood Glucose', unit: 'mg/dL', icon: Droplets, color: '#8b5cf6', refMin: config.glucoseMin, refMax: config.glucoseMax },
    { key: 'temperature' as MetricKey, label: 'Body Temp', unit: `°${tempUnit}`, icon: Thermometer, color: '#f59e0b', refMin: tempUnit === 'F' ? (config.tempMin * 9) / 5 + 32 : config.tempMin, refMax: tempUnit === 'F' ? (config.tempMax * 9) / 5 + 32 : config.tempMax },
    { key: 'skinPressure' as MetricKey, label: 'Pressure', unit: 'hPa', icon: Compass, color: '#10b981' },
  ];

  const currentMetricObj = metricsConfig.find((m) => m.key === selectedMetric)!;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs mb-6">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" /> Sensor Health Trends & History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive visualization of historical telemetry parameters
          </p>
        </div>

        {/* Time Horizon Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {(['1D', '7D', 'ALL'] as const).map((h) => (
            <button
              key={h}
              onClick={() => setTimeHorizon(h)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                timeHorizon === h
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {h === '1D' ? '24 Hours' : h === '7D' ? '7 Days' : 'All Logs'}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 no-scrollbar">
        {metricsConfig.map((m) => {
          const Icon = m.icon;
          const active = selectedMetric === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setSelectedMetric(m.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                active
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: active ? 'currentColor' : m.color }} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl mb-4 border border-slate-100 dark:border-slate-800 text-center">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Average</span>
          <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {stats.avg} {currentMetricObj.unit}
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Minimum</span>
          <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {stats.min} {currentMetricObj.unit}
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Maximum</span>
          <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {stats.max} {currentMetricObj.unit}
          </div>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="h-[260px] w-full mt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No health reading data available for selected period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />

              {/* Threshold Lines */}
              {currentMetricObj.refMax && (
                <ReferenceLine
                  y={currentMetricObj.refMax}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{ value: 'Upper Limit', fill: '#ef4444', fontSize: 10, position: 'top' }}
                />
              )}
              {currentMetricObj.refMin && (
                <ReferenceLine
                  y={currentMetricObj.refMin}
                  stroke="#3b82f6"
                  strokeDasharray="4 4"
                  label={{ value: 'Lower Limit', fill: '#3b82f6', fontSize: 10, position: 'bottom' }}
                />
              )}

              {/* Render Lines */}
              {selectedMetric === 'bloodPressure' ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="systolicBP"
                    name="Systolic (mmHg)"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolicBP"
                    name="Diastolic (mmHg)"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                </>
              ) : (
                <Line
                  type="monotone"
                  dataKey={selectedMetric}
                  name={`${currentMetricObj.label} (${currentMetricObj.unit})`}
                  stroke={currentMetricObj.color}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
