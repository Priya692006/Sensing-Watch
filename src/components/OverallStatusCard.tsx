import React from 'react';
import { ShieldCheck, AlertOctagon, AlertTriangle, Clock, RefreshCw, ChevronRight } from 'lucide-react';
import { ActiveAlert, HealthReading, ThresholdConfig, WatchDevice } from '../types';
import { calculateActiveAlerts, computeOverallHealthStatus, formatTimeAgo } from '../utils/healthCalculators';

interface OverallStatusCardProps {
  latestReading: HealthReading | null;
  config: ThresholdConfig;
  device: WatchDevice;
  onRefresh: () => void;
  onOpenSettings: () => void;
  isRefreshing: boolean;
}

export const OverallStatusCard: React.FC<OverallStatusCardProps> = ({
  latestReading,
  config,
  device,
  onRefresh,
  onOpenSettings,
  isRefreshing,
}) => {
  const overall = computeOverallHealthStatus(latestReading, config);
  const activeAlerts = calculateActiveAlerts(latestReading, config);

  const getStatusIcon = () => {
    switch (overall.status) {
      case 'alert':
        return <AlertOctagon className="w-7 h-7 text-red-600 dark:text-red-400" />;
      case 'attention':
        return <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400" />;
      case 'normal':
      default:
        return <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Main Status Badge & Score */}
        <div className="flex items-start sm:items-center gap-4">
          <div className={`p-3 rounded-2xl border ${overall.bgClass} shrink-0`}>
            {getStatusIcon()}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                Overall Sensor Status
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${overall.bgClass}`}>
                {overall.label}
              </span>
              {latestReading?.isDemo && (
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded font-mono border border-amber-200">
                  Demo Stream
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {overall.status === 'normal' && 'All Key Parameters Within Configured Ranges'}
              {overall.status === 'attention' && 'Slight Variance in Sensor Measurements'}
              {overall.status === 'alert' && 'Parameter Threshold Exceeded — Review Below'}
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Updated {latestReading ? formatTimeAgo(latestReading.timestamp) : 'Never'}
              </span>
              <span>•</span>
              <span>Watch Hardware: <strong className="text-slate-700 dark:text-slate-300">{device.name}</strong></span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Signal: {device.signalQuality}</span>
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={onOpenSettings}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Adjust Thresholds
          </button>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Active Alert Items List if threshold breached */}
      {activeAlerts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Active Threshold Notifications ({activeAlerts.length})
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-2 ${
                  alert.severity === 'alert'
                    ? 'bg-red-50/80 border-red-200 text-red-900 dark:bg-red-950/30 dark:border-red-900 dark:text-red-200'
                    : 'bg-amber-50/80 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200'
                }`}
              >
                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    <span>{alert.parameter}:</span>
                    <span className="font-mono bg-white/60 dark:bg-black/40 px-1.5 py-0.5 rounded">
                      {alert.readingValue}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] opacity-90">{alert.message}</p>
                </div>
                <span className="text-[10px] opacity-75 shrink-0">{alert.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
