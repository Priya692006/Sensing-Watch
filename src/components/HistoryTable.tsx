import React, { useState, useMemo } from 'react';
import { Download, PlusCircle, Search, Trash2, Database, ShieldAlert } from 'lucide-react';
import { HealthReading, UserProfile } from '../types';
import { exportReadingsToCSV } from '../utils/storage';
import { convertTemp } from '../utils/healthCalculators';

interface HistoryTableProps {
  readings: HealthReading[];
  profile: UserProfile;
  onDeleteReading: (id: string) => void;
  onClearAll: () => void;
  onOpenManualEntry: () => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  readings,
  profile,
  onDeleteReading,
  onClearAll,
  onOpenManualEntry,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'DEMO' | 'MANUAL' | 'LIVE'>('ALL');

  // Filter readings
  const filteredReadings = useMemo(() => {
    return readings.filter((r) => {
      // Source filter
      if (sourceFilter === 'DEMO' && !r.isDemo) return false;
      if (sourceFilter === 'MANUAL' && r.source !== 'manual_entry') return false;
      if (sourceFilter === 'LIVE' && r.isDemo) return false;

      // Search filter
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const dateStr = new Date(r.timestamp).toLocaleString().toLowerCase();
      const notes = (r.notes || '').toLowerCase();
      return dateStr.includes(term) || notes.includes(term);
    });
  }, [readings, searchTerm, sourceFilter]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs mb-6">
      {/* Table Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" /> Daily Health Reading Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Stored locally in browser storage ({readings.length} total entries)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenManualEntry}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Log Manual Reading
          </button>

          <button
            onClick={() => exportReadingsToCSV(readings, profile.name)}
            disabled={readings.length === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search date or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {(['ALL', 'LIVE', 'DEMO', 'MANUAL'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setSourceFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                sourceFilter === f
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {f === 'ALL' ? 'All Data' : f === 'LIVE' ? 'Live Hardware' : f === 'DEMO' ? 'Demo Data' : 'Manual'}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3">Date & Time</th>
              <th className="p-3">Type</th>
              <th className="p-3">HR (BPM)</th>
              <th className="p-3">BP (mmHg)</th>
              <th className="p-3">SpO2</th>
              <th className="p-3">Glucose</th>
              <th className="p-3">Temp</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredReadings.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  No reading logs found matching search filter.
                </td>
              </tr>
            ) : (
              filteredReadings.map((r) => {
                const dateStr = new Date(r.timestamp).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {dateStr}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {r.isDemo ? (
                        <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                          DEMO
                        </span>
                      ) : r.source === 'manual_entry' ? (
                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                          MANUAL
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                          LIVE
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-rose-600 dark:text-rose-400">{r.heartRate}</td>
                    <td className="p-3 font-medium">{r.systolicBP}/{r.diastolicBP}</td>
                    <td className="p-3 text-cyan-600 dark:text-cyan-400 font-medium">{r.spO2}%</td>
                    <td className="p-3 text-violet-600 dark:text-violet-400 font-medium">{r.glucose}</td>
                    <td className="p-3 font-medium">{convertTemp(r.temperature, profile.tempUnit)}</td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onDeleteReading(r.id)}
                        className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded-md transition-colors cursor-pointer"
                        title="Delete reading"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {readings.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredReadings.length} of {readings.length} total entries</span>
          <button
            onClick={onClearAll}
            className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer font-medium"
          >
            Clear All History
          </button>
        </div>
      )}
    </div>
  );
};
