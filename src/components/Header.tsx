import React from 'react';
import { Watch, RefreshCw, PlusCircle, Settings, User, Radio, WifiOff, Battery, ShieldAlert } from 'lucide-react';
import { WatchDevice, UserProfile } from '../types';

interface Props {
  device: WatchDevice;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenConnectModal: () => void;
  onOpenManualEntry: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  profile: UserProfile;
  isDemoData: boolean;
  isStreaming: boolean;
  onToggleStreaming: () => void;
}

export const Header: React.FC<Props> = ({
  device,
  isRefreshing,
  onRefresh,
  onOpenConnectModal,
  onOpenManualEntry,
  onOpenSettings,
  onOpenProfile,
  profile,
  isDemoData,
  isStreaming,
  onToggleStreaming,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Brand & App Title */}
          <div className="flex items-center gap-3">
            <div className="relative bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30 text-emerald-400">
              <Watch className="w-6 h-6" />
              {device.connected && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-slate-100 tracking-tight leading-none">
                  Smart Health Sensing Watch
                </h1>
                {isDemoData && (
                  <span
                    className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase inline-flex items-center gap-1"
                    title="Readings generated via Watch Simulator for monitoring demonstration"
                  >
                    <Radio className="w-2.5 h-2.5 animate-pulse" /> Demo Data
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Low-Cost Telemetry Dashboard</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300 font-medium">{profile.name} ({profile.age}y)</span>
              </p>
            </div>
          </div>

          {/* Controls & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Connection Pill Button */}
            <button
              onClick={onOpenConnectModal}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                device.connected
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-rose-900/60'
              }`}
            >
              <Watch className="w-4 h-4" />
              <span>{device.connected ? device.name : 'Connect Watch'}</span>
              {device.connected && (
                <span className="flex items-center gap-1 text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400">
                  <Battery className="w-3 h-3" />
                  {device.batteryLevel}%
                </span>
              )}
            </button>

            {/* Live Telemetry Auto-Stream Toggle */}
            <button
              onClick={onToggleStreaming}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                isStreaming
                  ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title={isStreaming ? 'Pause live stream' : 'Start live sensor stream'}
            >
              <Radio className={`w-3.5 h-3.5 ${isStreaming ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{isStreaming ? 'Live Streaming' : 'Auto Stream'}</span>
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              title="Poll latest sensor values"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            {/* Manual Log Entry Button */}
            <button
              onClick={onOpenManualEntry}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
              title="Log manual cuff or glucometer reading"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Log Reading</span>
            </button>

            {/* Threshold Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="Configurable Alert Thresholds"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Profile & Storage Stats */}
            <button
              onClick={onOpenProfile}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="User Profile & Storage"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
