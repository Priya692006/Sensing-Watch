import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  loadReadings,
  saveReadings,
  addReading,
  clearAllReadings,
  loadThresholds,
  saveThresholds,
  loadProfile,
  saveProfile,
  loadWatchDevice,
  saveWatchDevice,
} from './utils/storage';
import { HealthReading, ThresholdConfig, UserProfile, WatchDevice } from './types';
import { generateSensorTick, evaluateParameterStatus, evaluateBPStatus, evaluateGlucoseStatus } from './utils/healthCalculators';
import { generateInitialReadings } from './data/initialData';

import { Header } from './components/Header';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { OverallStatusCard } from './components/OverallStatusCard';
import { MetricCard } from './components/MetricCard';
import { TrendChart } from './components/TrendChart';
import { HistoryTable } from './components/HistoryTable';
import { WatchConnectModal } from './components/WatchConnectModal';
import { ManualEntryModal } from './components/ManualEntryModal';
import { AlertSettingsModal } from './components/AlertSettingsModal';
import { UserProfileModal } from './components/UserProfileModal';

export default function App() {
  // Primary State
  const [readings, setReadings] = useState<HealthReading[]>(() => loadReadings());
  const [thresholds, setThresholds] = useState<ThresholdConfig>(() => loadThresholds());
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [device, setDevice] = useState<WatchDevice>(() => loadWatchDevice());

  // App UI State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activityMode, setActivityMode] = useState<'resting' | 'exercise' | 'stress' | 'sleep'>('resting');

  // Modal Dialog States
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Get latest reading
  const latestReading = useMemo(() => {
    return readings.length > 0 ? readings[0] : null;
  }, [readings]);

  // Handle manual or automated single refresh tick
  const handleRefreshData = useCallback(() => {
    if (!device.connected) return;

    setIsRefreshing(true);
    setTimeout(() => {
      const nextReading = generateSensorTick(latestReading, device.isSimulated, activityMode);
      const updated = addReading(nextReading);
      setReadings(updated);
      setIsRefreshing(false);
    }, 400);
  }, [latestReading, device, activityMode]);

  // Live Continuous Streaming Effect (Ticks every 3.5 seconds)
  useEffect(() => {
    if (!isStreaming || !device.connected) return;

    const interval = setInterval(() => {
      setReadings((prevReadings) => {
        const prev = prevReadings.length > 0 ? prevReadings[0] : null;
        const next = generateSensorTick(prev, device.isSimulated, activityMode);
        return addReading(next);
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isStreaming, device, activityMode]);

  // Device state change handler
  const handleUpdateDevice = (newDevice: WatchDevice) => {
    setDevice(newDevice);
    saveWatchDevice(newDevice);
  };

  // Add manual log entry
  const handleAddManualReading = (newReading: HealthReading) => {
    const updated = addReading(newReading);
    setReadings(updated);
  };

  // Delete individual reading
  const handleDeleteReading = (id: string) => {
    const updated = readings.filter((r) => r.id !== id);
    saveReadings(updated);
    setReadings(updated);
  };

  // Clear all data logs
  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all health logs? This action cannot be undone.')) {
      clearAllReadings();
      setReadings([]);
    }
  };

  // Reset to default sample demo readings
  const handleResetDemoData = () => {
    const demo = generateInitialReadings();
    saveReadings(demo);
    setReadings(demo);
  };

  // Save Config & Profile
  const handleSaveThresholds = (newConfig: ThresholdConfig) => {
    setThresholds(newConfig);
    saveThresholds(newConfig);
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleTempUnitToggle = () => {
    const nextUnit = profile.tempUnit === 'C' ? 'F' : 'C';
    const updated = { ...profile, tempUnit: nextUnit };
    setProfile(updated);
    saveProfile(updated);
  };

  // Compute parameter statuses
  const hrStatus = evaluateParameterStatus(
    latestReading?.heartRate || 72,
    thresholds.heartRateMin,
    thresholds.heartRateMax
  );
  const bpStatus = evaluateBPStatus(
    latestReading?.systolicBP || 120,
    latestReading?.diastolicBP || 80,
    thresholds
  );
  const glucoseStatus = evaluateGlucoseStatus(latestReading?.glucose || 100, thresholds);
  const spO2Status = evaluateParameterStatus(latestReading?.spO2 || 98, thresholds.spO2Min, 100, 0.03);
  const tempStatus = evaluateParameterStatus(
    latestReading?.temperature || 36.6,
    thresholds.tempMin,
    thresholds.tempMax
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Top Navigation Header */}
      <Header
        device={device}
        isRefreshing={isRefreshing}
        onRefresh={handleRefreshData}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onOpenManualEntry={() => setIsManualEntryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        profile={profile}
        isDemoData={latestReading?.isDemo ?? true}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Safety Medical Disclaimer Banner */}
        <DisclaimerBanner isDemoMode={latestReading?.isDemo ?? true} />

        {/* Overall Health Status Hero Banner */}
        <OverallStatusCard
          latestReading={latestReading}
          config={thresholds}
          device={device}
          onRefresh={handleRefreshData}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isRefreshing={isRefreshing}
        />

        {/* Health Parameters Grid (6 Essential Cards) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs">
              Live Sensor Telemetry Cards
            </h2>
            <span className="text-xs text-slate-500">
              6 Real-Time Sensing Nodes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              type="heartRate"
              reading={latestReading}
              status={hrStatus}
              config={thresholds}
              tempUnit={profile.tempUnit}
            />
            <MetricCard
              type="bloodPressure"
              reading={latestReading}
              status={bpStatus}
              config={thresholds}
              tempUnit={profile.tempUnit}
            />
            <MetricCard
              type="glucose"
              reading={latestReading}
              status={glucoseStatus}
              config={thresholds}
              tempUnit={profile.tempUnit}
            />
            <MetricCard
              type="spO2"
              reading={latestReading}
              status={spO2Status}
              config={thresholds}
              tempUnit={profile.tempUnit}
            />
            <MetricCard
              type="temperature"
              reading={latestReading}
              status={tempStatus}
              config={thresholds}
              tempUnit={profile.tempUnit}
              onTempUnitToggle={handleTempUnitToggle}
            />
            <MetricCard
              type="skinPressure"
              reading={latestReading}
              status="normal"
              config={thresholds}
              tempUnit={profile.tempUnit}
            />
          </div>
        </div>

        {/* Historical Trends Interactive Recharts */}
        <TrendChart readings={readings} config={thresholds} tempUnit={profile.tempUnit} />

        {/* Daily Health History Logs & CSV Export */}
        <HistoryTable
          readings={readings}
          profile={profile}
          onDeleteReading={handleDeleteReading}
          onClearAll={handleClearAllData}
          onOpenManualEntry={() => setIsManualEntryOpen(true)}
        />
      </main>

      {/* Modals */}
      <WatchConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        device={device}
        onUpdateDevice={handleUpdateDevice}
        activityMode={activityMode}
        onChangeActivityMode={setActivityMode}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
      />

      <ManualEntryModal
        isOpen={isManualEntryOpen}
        onClose={() => setIsManualEntryOpen(false)}
        onAddReading={handleAddManualReading}
        profile={profile}
      />

      <AlertSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={thresholds}
        onSaveConfig={handleSaveThresholds}
        tempUnit={profile.tempUnit}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        onResetDemoData={handleResetDemoData}
        onClearAllData={handleClearAllData}
      />

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Smart Health Sensing Watch Dashboard
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Lightweight, zero-cost, privacy-first local storage architecture. No external cloud servers or paid APIs required.
          </p>
          <p className="mt-2 text-[10px] text-slate-400 max-w-2xl mx-auto">
            Notice: Sensor measurements are intended for general fitness and wellness reference only. Optical PPG pulse sensors estimate trend parameters. Always use clinical medical hardware for health diagnoses.
          </p>
        </div>
      </footer>
    </div>
  );
}
