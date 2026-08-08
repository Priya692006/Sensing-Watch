import React, { useState } from 'react';
import { X, PlusCircle, Check, AlertCircle } from 'lucide-react';
import { HealthReading, UserProfile } from '../types';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReading: (reading: HealthReading) => void;
  profile: UserProfile;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  isOpen,
  onClose,
  onAddReading,
  profile,
}) => {
  const [hr, setHr] = useState(72);
  const [sys, setSys] = useState(120);
  const [dia, setDia] = useState(80);
  const [spO2, setSpO2] = useState(98);
  const [glucose, setGlucose] = useState(100);
  const [temp, setTemp] = useState(36.6);
  const [notes, setNotes] = useState('Manual verification check');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert temp to Celsius if user entered in Fahrenheit
    const tempInC = profile.tempUnit === 'F' ? ((temp - 32) * 5) / 9 : temp;

    const newReading: HealthReading = {
      id: `manual-${Date.now()}`,
      timestamp: new Date().toISOString(),
      heartRate: Number(hr),
      systolicBP: Number(sys),
      diastolicBP: Number(dia),
      spO2: Number(spO2),
      glucose: Number(glucose),
      temperature: Number(Number(tempInC).toFixed(1)),
      skinPressure: 1013.2,
      isDemo: false, // Explicitly false for user manual medical readings
      source: 'manual_entry',
      notes: notes,
    };

    onAddReading(newReading);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Log Manual Health Reading</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Record certified cuff / glucometer values</p>
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
          {/* Heart Rate & SpO2 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Heart Rate (BPM)
              </label>
              <input
                type="number"
                min="30"
                max="240"
                required
                value={hr}
                onChange={(e) => setHr(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Blood Oxygen (SpO2 %)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                required
                value={spO2}
                onChange={(e) => setSpO2(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-sm"
              />
            </div>
          </div>

          {/* Blood Pressure (Sys / Dia) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Systolic BP (mmHg)
              </label>
              <input
                type="number"
                min="70"
                max="220"
                required
                value={sys}
                onChange={(e) => setSys(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Diastolic BP (mmHg)
              </label>
              <input
                type="number"
                min="40"
                max="140"
                required
                value={dia}
                onChange={(e) => setDia(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-sm"
              />
            </div>
          </div>

          {/* Blood Glucose & Temperature */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Blood Glucose (mg/dL)
              </label>
              <input
                type="number"
                min="40"
                max="400"
                required
                value={glucose}
                onChange={(e) => setGlucose(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Body Temp (°{profile.tempUnit})
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-sm"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Context / Measurement Note
            </label>
            <input
              type="text"
              placeholder="e.g. Upper arm cuff reading, Fasting check"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
            >
              Save Manual Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
