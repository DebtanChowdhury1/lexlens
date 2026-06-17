'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Download, ArrowLeft, ArrowRight, Clock, FileText, AlertTriangle, Filter, Pencil, Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import RiskMeter from '@/components/analysis/RiskMeter';
import ClauseCard from '@/components/analysis/ClauseCard';
import RedFlagBanner from '@/components/analysis/RedFlagBanner';
import RiskHeatmap from '@/components/analysis/RiskHeatmap';
import { getRiskBgClass, getRiskLabel } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { Contract, ClauseRisk } from '@/types/analysis';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Payment', 'Termination', 'IP/Ownership', 'Liability', 'Privacy', 'Non-compete', 'Dispute', 'Other'];
const RISK_FILTERS: { label: string; value: ClauseRisk | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Safe', value: 'safe' },
  { label: 'Caution', value: 'caution' },
  { label: 'Danger', value: 'danger' },
  { label: 'Critical', value: 'critical' },
];

export default function ReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState<ClauseRisk | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [downloading, setDownloading] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [savingRename, setSavingRename] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const load = () => {
      fetch(`/api/contracts/${id}`)
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          if (!d.contract) { router.push('/dashboard'); return; }
          if (d.contract.status === 'processing') {
            // Poll every 3 s while still processing
            setTimeout(load, 3000);
            return;
          }
          setContract(d.contract);
        })
        .catch(() => { if (!cancelled) router.push('/dashboard'); })
        .finally(() => { if (!cancelled) setLoading(false); });
    };
    load();
    return () => { cancelled = true; };
  }, [id, router]);

  const handleRenameStart = () => {
    setRenameValue(contract?.filename ?? '');
    setRenaming(true);
  };

  const handleRenameCancel = () => {
    setRenaming(false);
    setRenameValue('');
  };

  const handleRenameSave = async () => {
    const trimmed = renameValue.trim();
    if (!trimmed || !contract) return;
    setSavingRename(true);
    try {
      const res = await fetch(`/api/contracts/${id}/rename`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: trimmed }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setContract((prev) => prev ? { ...prev, filename: data.filename } : prev);
      toast.success('Report renamed');
      setRenaming(false);
    } catch {
      toast.error('Failed to rename. Please try again.');
    } finally {
      setSavingRename(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    toast.loading('Generating PDF report…', { id: 'pdf-export' });
    try {
      const res = await fetch(`/api/export/${id}`);
      if (!res.ok) throw new Error('Server error');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LexLens-Report-${contract?.filename ?? 'contract'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!', { id: 'pdf-export' });
    } catch {
      toast.error('PDF generation failed. Please try again.', { id: 'pdf-export' });
    } finally {
      setDownloading(false);
    }
  };

  // Confetti for low risk
  useEffect(() => {
    if (contract?.riskLevel === 'low') {
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      });
    }
  }, [contract?.riskLevel]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`h-${i === 0 ? 32 : 56} rounded-xl shimmer`} />
        ))}
      </div>
    );
  }

  if (!contract) return null;

  const sortedClauses = [...(contract.clauses ?? [])].sort((a, b) => b.riskScore - a.riskScore);
  const filteredClauses = sortedClauses.filter((c) => {
    if (riskFilter !== 'all' && c.riskLevel !== riskFilter) return false;
    if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
    return true;
  });

  const RISK_BANNER_COLORS: Record<string, string> = {
    low: 'bg-emerald-950/30 border-emerald-600/40 text-emerald-400',
    medium: 'bg-amber-950/30 border-amber-600/40 text-amber-400',
    high: 'bg-orange-950/30 border-orange-600/40 text-orange-400',
    critical: 'bg-red-950/30 border-red-600/40 text-red-400',
  };

  const RISK_ICONS: Record<string, string> = {
    low: '✅',
    medium: '⚠️',
    high: '🔶',
    critical: '🚨',
  };

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="gap-2 text-[#94A3B8] hover:text-white -ml-2">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Button>
      </Link>

      {/* ── HEADER ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/10 bg-[#12121A] p-6 md:p-8"
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                <FileText size={11} className="mr-1" />
                {contract.contractType}
              </Badge>
              {contract.partyNames?.map((p) => (
                <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
              ))}
            </div>
            {renaming ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSave(); if (e.key === 'Escape') handleRenameCancel(); }}
                  maxLength={100}
                  className="flex-1 rounded-xl border border-violet-500/60 bg-[#0D0D15] text-[#F8FAFC] px-4 py-2 text-xl font-bold focus:outline-none"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                />
                <Button size="sm" onClick={handleRenameSave} disabled={savingRename} className="gap-1">
                  <Check size={14} /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={handleRenameCancel} className="text-[#94A3B8]">
                  <X size={14} />
                </Button>
              </div>
            ) : (
              <div className="flex items-start gap-2 group">
                <h1
                  className="text-2xl md:text-3xl font-bold text-[#F8FAFC] break-all"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                  title={contract.filename}
                >
                  {contract.filename.length > 80
                    ? contract.filename.slice(0, 77) + '…'
                    : contract.filename}
                </h1>
                <button
                  onClick={handleRenameStart}
                  title="Rename report"
                  className="mt-1.5 opacity-0 group-hover:opacity-100 text-[#475569] hover:text-violet-400 transition-all flex-shrink-0"
                >
                  <Pencil size={16} />
                </button>
              </div>
            )}
            <p className="text-sm text-[#94A3B8] flex items-center gap-1.5 flex-wrap">
              <Clock size={13} />
              Analyzed {formatDistanceToNow(new Date(contract.uploadedAt), { addSuffix: true })}
              {contract.aiModel && <span className="text-violet-400">· LexLens AI</span>}
              {contract.confidence > 0 && (
                <Tooltip content="Analysis reliability (1–10): how confident the AI is based on document clarity and completeness.">
                  <span className="text-[#64748B] cursor-help underline decoration-dotted">
                    · Confidence {contract.confidence}/10
                  </span>
                </Tooltip>
              )}
              {contract.governingLaw && contract.governingLaw !== 'Not specified' && (
                <Tooltip content="The legal jurisdiction that governs this contract. Laws and enforceability vary significantly by region.">
                  <span className="text-[#64748B] cursor-help underline decoration-dotted">· {contract.governingLaw}</span>
                </Tooltip>
              )}
              {contract.processingTime > 0 && (
                <span className="text-[#64748B]">
                  · {(contract.processingTime / 1000).toFixed(1)}s
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/analyze">
              <Button variant="outline" className="gap-2 border-white/20 hover:border-violet-500/50">
                <FileText size={16} />
                Analyze New
              </Button>
            </Link>
            <Button onClick={handleDownload} disabled={downloading} className="gap-2">
              <Download size={16} />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Risk level banner */}
        <div
          className={`mt-5 rounded-xl border px-5 py-4 text-lg font-bold ${RISK_BANNER_COLORS[contract.riskLevel]}`}
        >
          {RISK_ICONS[contract.riskLevel]}&nbsp;
          {contract.riskLevel.toUpperCase()} RISK CONTRACT
        </div>
      </motion.div>

      {/* ── RED FLAGS ──────────────────── */}
      {contract.redFlags?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <RedFlagBanner redFlags={contract.redFlags} />
        </motion.div>
      )}

      {/* ── RISK OVERVIEW ──────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-2 gap-6"
      >
        {/* Risk meter */}
        <div className="rounded-xl border border-white/10 bg-[#12121A] p-6 flex flex-col items-center justify-center gap-3">
          <RiskMeter score={contract.overallRiskScore} riskLevel={contract.riskLevel} size={220} />
          <Tooltip content="0 = completely safe, 100 = extremely dangerous. Scores above 75 indicate critical risk requiring immediate legal review.">
            <p className="text-xs text-[#475569] cursor-help underline decoration-dotted">
              What does this score mean?
            </p>
          </Tooltip>
        </div>

        {/* Summary + key findings */}
        <div className="rounded-xl border border-white/10 bg-[#12121A] p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">AI Summary</p>
            <p className="text-[#CBD5E1] leading-relaxed">{contract.summary}</p>
          </div>

          {contract.keyFindings?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Key Findings</p>
              <ul className="space-y-2">
                {contract.keyFindings.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#CBD5E1]">
                    <span className="text-violet-400 mt-0.5 flex-shrink-0">•</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── CLAUSE ANALYSIS ────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-[#F8FAFC]" style={{ fontFamily: 'Syne, sans-serif' }}>
            Clause Analysis
          </h2>
          <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
            <Filter size={14} />
            <span>{filteredClauses.length} of {contract.clauses?.length ?? 0} clauses</span>
          </div>
        </div>

        {/* Risk filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {RISK_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setRiskFilter(value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                riskFilter === value
                  ? 'bg-violet-600 text-white border-transparent'
                  : 'border-white/10 text-[#94A3B8] hover:text-white hover:border-white/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                categoryFilter === cat
                  ? 'bg-[#1A1A27] text-[#F8FAFC] border-white/30'
                  : 'border-transparent text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Clause cards */}
        <div className="space-y-3">
          {filteredClauses.length === 0 ? (
            <div className="text-center py-12 text-[#94A3B8]">
              No clauses match the selected filters.
            </div>
          ) : (
            filteredClauses.map((clause, i) => (
              <ClauseCard key={clause.id || i} clause={clause} index={i} />
            ))
          )}
        </div>
      </motion.div>

      {/* ── RISK HEATMAP ───────────────── */}
      {contract.clauses?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <RiskHeatmap clauses={contract.clauses} />
        </motion.div>
      )}

      {/* ── AI DISCLAIMER ──────────────── */}
      <div className="rounded-xl border border-white/5 bg-[#0D0D15] p-5 text-center text-xs text-[#475569]">
        This report is generated by LexLens AI and is for informational purposes only.
        It does not constitute legal advice. Please consult a qualified attorney before signing any contract.
      </div>

      {/* ── START NEW ──────────────────── */}
      <div className="flex flex-col items-center gap-3 py-6">
        <p className="text-sm text-[#64748B]">Done reviewing? Analyze another contract.</p>
        <Link href="/analyze">
          <Button size="lg" className="gap-2 group"
            style={{ boxShadow: '0 0 24px rgba(124,58,237,0.25)' }}>
            <FileText size={18} />
            Analyze Another Contract
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
