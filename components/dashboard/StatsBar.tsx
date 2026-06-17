'use client';

import { useEffect, useState } from 'react';
import { FileText, TrendingUp, AlertTriangle } from 'lucide-react';
import type { ContractListItem } from '@/types/analysis';

interface Props {
  contracts: ContractListItem[];
}

function Counter({ target }: { target: number }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    let current = 0;
    const step = Math.max(1, Math.floor(target / 40));
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      setVal(current);
      if (current >= target) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [target]);

  return <span>{val}</span>;
}

export default function StatsBar({ contracts }: Props) {
  const total = contracts.length;
  const avgRisk = total
    ? Math.round(contracts.reduce((s, c) => s + c.overallRiskScore, 0) / total)
    : 0;
  const totalFlags = contracts.reduce((s, c) => s + (c.redFlags?.length ?? 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        {
          icon: FileText,
          label: 'Contracts Analyzed',
          value: total,
          color: '#7C3AED',
          bg: 'bg-violet-600/10',
        },
        {
          icon: TrendingUp,
          label: 'Average Risk Score',
          value: avgRisk,
          color: avgRisk > 75 ? '#DC2626' : avgRisk > 50 ? '#EA580C' : avgRisk > 25 ? '#D97706' : '#059669',
          bg: 'bg-blue-600/10',
        },
        {
          icon: AlertTriangle,
          label: 'Red Flags Caught',
          value: totalFlags,
          color: '#DC2626',
          bg: 'bg-red-600/10',
        },
      ].map(({ icon: Icon, label, value, color, bg }) => (
        <div
          key={label}
          className="rounded-xl border border-white/10 bg-[#12121A] p-5 flex items-center gap-4"
        >
          <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
            <Icon size={22} style={{ color }} />
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color }}>
              <Counter target={value} />
            </p>
            <p className="text-sm text-[#94A3B8]">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
