import React, { useState } from 'react';
import { AlertTriangle, Info, X, ShieldAlert } from 'lucide-react';
import { MEDICAL_DISCLAIMER } from '../data/initialData';

interface Props {
  isDemoMode: boolean;
}

export const DisclaimerBanner: React.FC<Props> = ({ isDemoMode }) => {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-500/10 border-l-4 border-amber-500 p-3.5 rounded-r-lg shadow-xs mb-6 transition-all duration-200 text-amber-900 dark:text-amber-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <div className="font-semibold flex items-center gap-2 flex-wrap">
              <span>Safety & Medical Disclaimer</span>
              {isDemoMode && (
                <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                  Demo Stream Active
                </span>
              )}
            </div>
            <p className="mt-1 leading-snug text-amber-800 dark:text-amber-300">
              Readings displayed are for general wellness monitoring only and are{' '}
              <strong className="underline decoration-amber-400">not a medical diagnosis</strong>.{' '}
              {isDemoMode ? 'Current values are simulated demo sensor data.' : ''}
              {!expanded && (
                <button
                  onClick={() => setExpanded(true)}
                  className="ml-1 text-amber-700 dark:text-amber-300 font-semibold underline hover:text-amber-900 cursor-pointer"
                >
                  Read hardware limitations
                </button>
              )}
            </p>

            {expanded && (
              <div className="mt-2.5 pt-2 border-t border-amber-300/40 text-xs text-amber-900/90 dark:text-amber-200/90 space-y-1.5">
                <p>{MEDICAL_DISCLAIMER.fullText}</p>
                <div className="bg-amber-100/80 dark:bg-amber-900/30 p-2 rounded text-[11px] font-mono text-amber-900 dark:text-amber-100">
                  ⚠️ Note: Optical smartwatches (PPG) estimate BP and Glucose trends. Clinical medical hardware (cuffs / CGMs) is required for certified diagnostic accuracy.
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  className="text-amber-700 dark:text-amber-300 font-semibold underline text-[11px] cursor-pointer"
                >
                  Show less
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700/60 hover:text-amber-900 dark:text-amber-400/60 dark:hover:text-amber-200 p-1 rounded-md transition-colors"
          title="Dismiss safety notice for session"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
