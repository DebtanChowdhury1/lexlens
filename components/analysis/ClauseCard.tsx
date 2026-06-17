'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getRiskBgClass, getRiskColor, getRiskLabel, cn } from '@/lib/utils';
import type { Clause } from '@/types/analysis';

interface Props {
  clause: Clause;
  index: number;
}

const RISK_ICONS = {
  safe: CheckCircle,
  caution: Info,
  danger: AlertTriangle,
  critical: ShieldAlert,
};

export default function ClauseCard({ clause, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const Icon = RISK_ICONS[clause.riskLevel];
  const color = getRiskColor(clause.riskLevel);
  const isCritical = clause.riskLevel === 'critical';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={cn(
        'rounded-xl border bg-[#12121A] overflow-hidden transition-all duration-200',
        isCritical
          ? 'border-red-600/40 animate-critical-pulse'
          : 'border-white/10 hover:border-white/20'
      )}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-colors"
      >
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: `${color}20` }}
        >
          <Icon size={16} style={{ color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#F8FAFC] truncate">{clause.title}</span>
            <Badge variant={clause.riskLevel as any}>{getRiskLabel(clause.riskLevel)}</Badge>
            <span className="text-xs text-[#94A3B8] bg-[#1A1A27] px-2 py-0.5 rounded-full">
              {clause.category}
            </span>
          </div>
          <p className="text-sm text-[#94A3B8] mt-1 line-clamp-1">{clause.plainEnglish}</p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Risk score mini bar */}
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className="text-xs text-[#94A3B8]">Risk</span>
            <div className="w-16 h-1.5 bg-[#1A1A27] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${clause.riskScore}%`, background: color }}
              />
            </div>
            <span className="text-xs font-mono" style={{ color }}>{clause.riskScore}</span>
          </div>

          <ChevronDown
            size={18}
            className="text-[#94A3B8] transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
          />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              <div className="h-px bg-white/10" />

              {/* Side by side */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Original */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    Original Language
                  </p>
                  <div className="bg-[#0F172A] rounded-lg p-3 border border-white/10">
                    <p className="text-sm font-mono text-[#CBD5E1] leading-relaxed whitespace-pre-wrap">
                      {clause.originalText}
                    </p>
                  </div>
                </div>

                {/* Plain English */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    Plain English
                  </p>
                  <div className="bg-[#1A1A27] rounded-lg p-3 border border-white/10">
                    <p className="text-sm text-[#F8FAFC] leading-relaxed">{clause.plainEnglish}</p>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              {clause.explanation && (
                <div className="rounded-lg p-4 bg-[#1A1A27] border border-white/10 space-y-1">
                  <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
                    <Info size={12} /> Why This Matters
                  </p>
                  <p className="text-sm text-[#CBD5E1]">{clause.explanation}</p>
                </div>
              )}

              {/* Recommendation */}
              {clause.recommendation && (
                <div className="rounded-lg p-4 bg-emerald-900/10 border border-emerald-600/20 space-y-1">
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle size={12} /> What To Do
                  </p>
                  <p className="text-sm text-emerald-100/80">{clause.recommendation}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
