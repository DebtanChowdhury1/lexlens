'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronDown, ShieldAlert } from 'lucide-react';
import type { RedFlag } from '@/types/analysis';

interface Props {
  redFlags: RedFlag[];
}

export default function RedFlagBanner({ redFlags }: Props) {
  const [open, setOpen] = useState(true);

  if (!redFlags.length) return null;

  const criticalCount = redFlags.filter((f) => f.severity === 'critical').length;

  return (
    <div className="rounded-xl border border-red-600/40 bg-red-950/20 overflow-hidden" role="alert" aria-label={`${redFlags.length} red flag${redFlags.length > 1 ? 's' : ''} detected`}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="red-flags-list"
        className="w-full flex items-center justify-between p-5 hover:bg-red-900/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        <div className="flex items-center gap-3">
          <div className="animate-critical-pulse w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
            <ShieldAlert size={20} className="text-red-400" />
          </div>
          <div className="text-left">
            <p className="font-bold text-red-400 text-lg">
              {redFlags.length} Red Flag{redFlags.length > 1 ? 's' : ''} Detected
            </p>
            <p className="text-sm text-red-300/70">
              {criticalCount > 0 && `${criticalCount} critical`}
              {criticalCount > 0 && redFlags.length - criticalCount > 0 && ', '}
              {redFlags.length - criticalCount > 0 &&
                `${redFlags.length - criticalCount} high severity`}
            </p>
          </div>
        </div>
        <ChevronDown
          size={18}
          className="text-red-400 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div id="red-flags-list" className="px-5 pb-5 space-y-3">
              {redFlags.map((flag, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex gap-3 p-4 rounded-lg border ${
                    flag.severity === 'critical'
                      ? 'border-red-600/40 bg-red-950/30'
                      : 'border-amber-600/30 bg-amber-950/20'
                  }`}
                >
                  <AlertTriangle
                    size={18}
                    className={`flex-shrink-0 mt-0.5 ${
                      flag.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
                    }`}
                  />
                  <div>
                    <p
                      className={`font-semibold text-sm ${
                        flag.severity === 'critical' ? 'text-red-300' : 'text-amber-300'
                      }`}
                    >
                      {flag.title}
                    </p>
                    <p className="text-sm text-white/60 mt-1">{flag.description}</p>
                  </div>
                  <span
                    className={`flex-shrink-0 text-xs font-bold uppercase px-2 py-0.5 rounded-full self-start ${
                      flag.severity === 'critical'
                        ? 'bg-red-600/20 text-red-400'
                        : 'bg-amber-600/20 text-amber-400'
                    }`}
                  >
                    {flag.severity}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
