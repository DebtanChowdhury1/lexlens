import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { RiskLevel, ClauseRisk } from '@/types/analysis';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskColor(risk: RiskLevel | ClauseRisk): string {
  const map: Record<string, string> = {
    low: '#059669',
    safe: '#059669',
    medium: '#D97706',
    caution: '#D97706',
    high: '#EA580C',
    danger: '#EA580C',
    critical: '#DC2626',
  };
  return map[risk] ?? '#D97706';
}

export function getRiskBgClass(risk: RiskLevel | ClauseRisk): string {
  const map: Record<string, string> = {
    low: 'bg-emerald-600/10 text-emerald-400 border-emerald-600/30',
    safe: 'bg-emerald-600/10 text-emerald-400 border-emerald-600/30',
    medium: 'bg-amber-600/10 text-amber-400 border-amber-600/30',
    caution: 'bg-amber-600/10 text-amber-400 border-amber-600/30',
    high: 'bg-orange-600/10 text-orange-400 border-orange-600/30',
    danger: 'bg-orange-600/10 text-orange-400 border-orange-600/30',
    critical: 'bg-crimson/10 text-red-400 border-red-600/30',
  };
  return map[risk] ?? 'bg-amber-600/10 text-amber-400 border-amber-600/30';
}

export function getRiskLabel(risk: RiskLevel | ClauseRisk): string {
  const map: Record<string, string> = {
    low: 'Low Risk',
    safe: 'Safe',
    medium: 'Moderate',
    caution: 'Medium Risk',
    high: 'High Risk',
    danger: 'High Risk',
    critical: 'Critical',
  };
  return map[risk] ?? risk;
}

export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [124, 58, 237];
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
