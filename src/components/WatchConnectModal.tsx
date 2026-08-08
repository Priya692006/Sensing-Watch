import React, { useState } from 'react';
import { X, Watch, Bluetooth, Radio, Battery, ShieldCheck, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { WatchDevice } from '../types';

interface WatchConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: WatchDevice;
  onUpdateDevice: (device: WatchDevice) => void;
  activityMode: 'resting' | 'exercise' | 'stress' | 'sleep';
  onChangeActivityMode: (mode: 'resting' | 'exercise' | 'stress' | 'sleep') => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
}

export const WatchConnectModal: React.FC<WatchConnectModalProps> = ({
  isOpen,
  onClose,
  device,
  onUpdateDevice,
  activityMode,
  onChangeActivityMode,
  isStreaming,
  onToggleStreaming,
}) => {
  const [bleScanning, setBleScanning] = useState(false);
  const [bleError, setBleError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real Web Bluetooth API scanning handler
  const handleScanWebBluetooth = async () => {
    setBleScanning(true);
    setBleError(null);

    try {
      if (!('bluetooth' in navigator)) {
        throw new Error('Web Bluetooth API is not supported in this browser or iframe context. Using simulated sensing watch hub.');
      }

      // Attempt BLE request
      const bleDevice = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['heart_rate', 'battery_service'],
      });

      if (bleDevice) {
        onUpdateDevice({
          ...device,
          id: bleDevice.id || 'ble-device-1',
          name: bleDevice.name || 'Bluetooth Health Watch',
          connected: true,
          signalQuality: 'Excellent',
          isSimulated: false,
        });
        onClose();
      }
    } catch (err: any) {
      console.warn('Bluetooth pairing:', err);
      setBleError(err.message || 'Bluetooth connection canceled or unavailable in this environment. You can use the Smart Watch Simulator below.');
    } finally {
      setBleScanning(false);
    }
  };

  const toggleConnection = () => {
    onUpdateDevice({
      ...device,
      connected: !device.connected,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Watch className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Smart Sensing Watch Connection</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pair via Bluetooth BLE or Virtual Sensing Hub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Connection Status Box */}
        <div className="my-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${device.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{device.name}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
              <span>{device.connected ? 'Connected & Telemetry Active' : 'Disconnected'}</span>
              <span>•</span>
              <span className="font-mono">{device.isSimulated ? 'Virtual Simulator' : 'Hardware BLE'}</span>
            </p>
          </div>

          <button
            onClick={toggleConnection}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              device.connected
                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            {device.connected ? 'Disconnect' : 'Connect'}
          </button>
        </div>

        {/* Option 1: Hardware Web Bluetooth Scan */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Bluetooth className="w-4 h-4 text-blue-500" /> Option 1: Web Bluetooth Pairing
          </h4>

          <button
            onClick={handleScanWebBluetooth}
            disabled={bleScanning}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Bluetooth className={`w-4 h-4 ${bleScanning ? 'animate-bounce' : ''}`} />
            {bleScanning ? 'Scanning for nearby BLE Smartwatches...' : 'Scan for Hardware Watch (Web BLE)'}
          </button>

          {bleError && (
            <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{bleError}</span>
            </div>
          )}
        </div>

        {/* Option 2: Smart Watch Telemetry Simulator */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-emerald-500" /> Option 2: Virtual Sensor Simulator
          </h4>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Simulated User Activity Baseline:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(['resting', 'exercise', 'stress', 'sleep'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => onChangeActivityMode(mode)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium capitalize border transition-all cursor-pointer ${
                      activityMode === mode
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {mode === 'resting' && '🧘 Rest'}
                    {mode === 'exercise' && '🏃 Workout'}
                    {mode === 'stress' && '⚡ Stress'}
                    {mode === 'sleep' && '🌙 Sleep'}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Stream Toggle */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Continuous Telemetry Stream
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Automatically emits sensor ticks every 3 seconds
                </span>
              </div>
              <button
                onClick={onToggleStreaming}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  isStreaming
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isStreaming ? 'Streaming ON' : 'Paused'}
              </button>
            </div>

            {/* Capabilities checklist */}
            <div className="pt-2 text-xs space-y-1 text-slate-600 dark:text-slate-400">
              <span className="font-semibold block text-slate-800 dark:text-slate-200 text-[11px]">
                Hardware Sensors Supported:
              </span>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Optical PPG Pulse</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> SpO2 LED Array</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Skin Thermistor</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Barometric Pressure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-xl hover:opacity-90 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
