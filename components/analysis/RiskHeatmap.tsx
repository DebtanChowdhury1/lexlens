'use client';

import { useState, useCallback } from 'react';
import { getRiskColor } from '@/lib/utils';
import type { Clause } from '@/types/analysis';

interface Props {
  clauses: Clause[];
}

export default function RiskHeatmap({ clauses }: Props) {
  const [selected, setSelected] = useState<Clause | null>(null);

  const handleToggle = useCallback((clause: Clause) => {
    setSelected((prev) => (prev?.id === clause.id ? null : clause));
  }, []);

  return (
    <div className="rounded-xl border border-white/10 bg-[#12121A] p-6">
      <h3 className="font-semibold text-[#F8FAFC] mb-1">Risk Heatmap</h3>
      <p className="text-sm text-[#94A3B8] mb-5">
        Visual overview of risk distribution across all clauses. Tap a cell for details.
      </p>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Risk heatmap cells">
        {clauses.map((clause, i) => {
          const color = getRiskColor(clause.riskLevel);
          const isSelected = selected?.id === clause.id;
          return (
            <button
              key={clause.id || i}
              aria-label={`${clause.title}: risk score ${clause.riskScore}`}
              aria-pressed={isSelected}
              onClick={() => handleToggle(clause)}
              className="relative rounded-md transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              style={{
                width: '40px',
                height: '40px',
                background: `${color}30`,
                border: `2px solid ${isSelected ? color : `${color}60`}`,
              }}
            >
              <div
                className="absolute bottom-0 left-0 right-0 rounded-b-sm transition-all duration-300"
                style={{
                  height: `${clause.riskScore}%`,
                  background: `${color}70`,
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-5 flex-wrap">
        {[
          { label: 'Safe', color: '#059669' },
          { label: 'Caution', color: '#D97706' },
          { label: 'Danger', color: '#EA580C' },
          { label: 'Critical', color: '#DC2626' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
            <span className="text-xs text-[#94A3B8]">{label}</span>
          </div>
        ))}
      </div>

      {/* Detail panel — shown on click/tap */}
      {selected && (
        <div className="mt-4 p-4 bg-[#1A1A27] rounded-lg border border-white/10 text-sm" role="region" aria-label="Selected clause details">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-[#F8FAFC]">{selected.title}</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ color: getRiskColor(selected.riskLevel), background: `${getRiskColor(selected.riskLevel)}20` }}
            >
              {selected.riskScore}/100
            </span>
          </div>
          <p className="text-[#94A3B8] leading-relaxed">{selected.plainEnglish}</p>
          {selected.recommendation && (
            <p className="text-emerald-400/80 text-xs mt-2 leading-relaxed">
              <span className="font-semibold">Tip:</span> {selected.recommendation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
