import React, { useState } from 'react';
import { X, Settings, RotateCcw } from 'lucide-react';
import { ThresholdConfig } from '../types';
import { DEFAULT_THRESHOLDS } from '../data/initialData';

interface AlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ThresholdConfig;
  onSaveConfig: (config: ThresholdConfig) => void;
  tempUnit: 'C' | 'F';
}

export const AlertSettingsModal: React.FC<AlertSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  tempUnit,
}) => {
  const [formData, setFormData] = useState<ThresholdConfig>({ ...config });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    onClose();
  };

  const handleResetDefaults = () => {
    setFormData({ ...DEFAULT_THRESHOLDS });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Configurable Health Alerts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Set custom trigger thresholds for parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Heart Rate */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <label className="font-bold text-slate-800 dark:text-slate-200 block mb-2">
              Heart Rate Range (BPM)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-500 block mb-0.5">Min Alert (&lt;)</span>
                <input
                  type="number"
                  value={formData.heartRateMin}
                  onChange={(e) => setFormData({ ...formData, heartRateMin: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block mb-0.5">Max Alert (&gt;)</span>
                <input
                  type="number"
                  value={formData.heartRateMax}
                  onChange={(e) => setFormData({ ...formData, heartRateMax: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Blood Pressure */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <label className="font-bold text-slate-800 dark:text-slate-200 block mb-2">
              Blood Pressure Upper Limits (mmHg)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-500 block mb-0.5">Systolic Max</span>
                <input
                  type="number"
                  value={formData.systolicMax}
                  onChange={(e) => setFormData({ ...formData, systolicMax: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block mb-0.5">Diastolic Max</span>
                <input
                  type="number"
                  value={formData.diastolicMax}
                  onChange={(e) => setFormData({ ...formData, diastolicMax: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* SpO2 and Glucose */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-2">
                SpO2 Min (%)
              </label>
              <input
                type="number"
                value={formData.spO2Min}
                onChange={(e) => setFormData({ ...formData, spO2Min: Number(e.target.value) })}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
              />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-2">
                Glucose Max (mg/dL)
              </label>
              <input
                type="number"
                value={formData.glucoseMax}
                onChange={(e) => setFormData({ ...formData, glucoseMax: Number(e.target.value) })}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold cursor-pointer"
              >
                Save Thresholds
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
