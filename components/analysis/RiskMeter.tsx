'use client';

import { useEffect, useState } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { getRiskColor } from '@/lib/utils';
import type { RiskLevel } from '@/types/analysis';

interface Props {
  score: number;
  riskLevel: RiskLevel;
  size?: number;
}

const RISK_LABELS: Record<RiskLevel, string> = {
  low: 'Low Risk',
  medium: 'Moderate Risk',
  high: 'High Risk',
  critical: 'Critical Risk',
};

export default function RiskMeter({ score, riskLevel, size = 200 }: Props) {
  const [displayScore, setDisplayScore] = useState(0);
  const color = getRiskColor(riskLevel);

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 2;
        if (current >= score) {
          setDisplayScore(score);
          clearInterval(interval);
        } else {
          setDisplayScore(current);
        }
      }, 16);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  const data = [{ value: displayScore, fill: color }];

  return (
    <div
      className="flex flex-col items-center gap-3"
      role="img"
      aria-label={`Risk score: ${score} out of 100. ${RISK_LABELS[riskLevel]}`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <RadialBarChart
          width={size}
          height={size}
          innerRadius={size * 0.35}
          outerRadius={size * 0.48}
          data={data}
          startAngle={225}
          endAngle={-45}
          barSize={size * 0.08}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: '#1A1A27' }}
            dataKey="value"
            angleAxisId={0}
            data={data}
            cornerRadius={size * 0.04}
          />
        </RadialBarChart>

        {/* Center overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <span
            className="font-bold tabular-nums"
            style={{ fontSize: size * 0.22, color, lineHeight: 1 }}
          >
            {displayScore}
          </span>
          <span
            className="text-[#94A3B8] font-medium uppercase tracking-wider"
            style={{ fontSize: size * 0.065 }}
          >
            / 100
          </span>
        </div>
      </div>

      <div
        className="text-center font-semibold text-lg"
        style={{ color }}
      >
        {RISK_LABELS[riskLevel]}
      </div>
    </div>
  );
}
