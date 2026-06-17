'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, ArrowRight, Clock, Filter, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';

const SAMPLE = {
  filename: 'Employment Agreement — Acme Corp (Sample)',
  contractType: 'Employment Agreement',
  partyNames: ['Acme Corp', 'Jane Doe'],
  overallRiskScore: 74,
  riskLevel: 'high' as const,
  governingLaw: 'California, USA',
  confidence: 9,
  summary:
    'This employment agreement between Acme Corp and Jane Doe contains several one-sided clauses that heavily favor the employer. The non-compete clause is unusually broad, the IP ownership provision captures personal projects, and the arbitration clause waives class-action rights. Overall this contract significantly limits the employee\'s future career options.',
  keyFindings: [
    'Non-compete spans 2 years and covers all software companies nationwide — overly broad',
    'IP clause claims ownership of work done on personal time if "related to company business"',
    'Mandatory arbitration waives right to jury trial and class-action lawsuits',
    'At-will termination with only 2-week severance after any tenure',
    'Salary review is "at manager\'s discretion" with no guaranteed timeline',
  ],
  redFlags: [
    { severity: 'critical', title: 'Overbroad IP Assignment', description: 'Company claims ownership of any invention you create on your own time if it could be "related to" company business — this can include personal side projects and open-source work.' },
    { severity: 'high', title: 'Nationwide Non-Compete', description: 'A 2-year ban on working at any software company in the USA is likely unenforceable in California but could still deter you from taking jobs out of fear of litigation.' },
    { severity: 'high', title: 'Binding Arbitration', description: 'You waive the right to sue in court or join class-action lawsuits. Disputes must go through private arbitration, which historically favors employers.' },
  ],
  clauses: [
    {
      id: 'clause-1', title: 'Non-Compete Clause', category: 'Non-compete', riskLevel: 'critical' as const, riskScore: 88,
      originalText: 'Employee agrees not to engage in any business that competes with the Company for a period of 24 months following termination, within the United States.',
      plainEnglish: 'You cannot work for any competing company for 2 years anywhere in the US after leaving.',
      explanation: 'This is an extraordinarily broad restriction. California law generally voids non-competes, but if you move states it could be enforced.',
      recommendation: 'Push back to limit geographic scope (e.g., within 50 miles) and reduce duration to 6 months. Have a California employment lawyer review this.',
    },
    {
      id: 'clause-2', title: 'Intellectual Property Assignment', category: 'IP/Ownership', riskLevel: 'critical' as const, riskScore: 82,
      originalText: 'Employee assigns to Company all inventions, works, and developments conceived during or after employment if related to Company\'s business or using Company resources.',
      plainEnglish: 'The company owns anything you create — even on weekends — if it could be related to their business.',
      explanation: 'The "or after employment" and "related to" language is dangerously vague and could capture personal projects.',
      recommendation: 'Negotiate to add a schedule of prior inventions you want to exclude, and remove "or after employment" from the language.',
    },
    {
      id: 'clause-3', title: 'Arbitration Agreement', category: 'Dispute', riskLevel: 'danger' as const, riskScore: 71,
      originalText: 'Any disputes arising from this agreement shall be resolved by binding arbitration. Employee waives the right to participate in class action lawsuits.',
      plainEnglish: 'You give up the right to sue in court or join group lawsuits against the company.',
      explanation: 'Arbitration processes are typically faster and cheaper but historically rule in favor of repeat players (employers).',
      recommendation: 'Try to negotiate carve-outs for wage claims and discrimination suits, which courts often protect.',
    },
    {
      id: 'clause-4', title: 'Compensation and Salary Review', category: 'Payment', riskLevel: 'caution' as const, riskScore: 42,
      originalText: 'Employee will receive a base salary of $120,000 per annum. Salary adjustments are at the sole discretion of management and are not guaranteed.',
      plainEnglish: 'You get $120k per year. Raises are entirely up to your manager — the company doesn\'t have to ever give you one.',
      explanation: 'The salary is clearly stated, which is good. But the lack of any review timeline gives the company no obligation to increase pay.',
      recommendation: 'Ask for a written commitment to an annual performance review, even if increases aren\'t guaranteed.',
    },
    {
      id: 'clause-5', title: 'Termination and Severance', category: 'Termination', riskLevel: 'caution' as const, riskScore: 48,
      originalText: 'Employment is at-will. Upon termination without cause, Employee shall receive two (2) weeks\' severance pay for each year of service, up to a maximum of 8 weeks.',
      plainEnglish: 'You can be fired at any time for any reason. You\'ll get 2 weeks pay per year worked, but capped at 8 weeks total.',
      explanation: 'The at-will clause is standard, but the 8-week severance cap means long-tenured employees get the same payout as newer ones.',
      recommendation: 'Negotiate to remove the 8-week cap, especially if you\'re leaving a stable job to join this company.',
    },
    {
      id: 'clause-6', title: 'Confidentiality', category: 'Privacy', riskLevel: 'safe' as const, riskScore: 18,
      originalText: 'Employee agrees to keep all Company trade secrets and proprietary information confidential during and after employment.',
      plainEnglish: 'Don\'t share company secrets — during your job or after you leave.',
      explanation: 'Standard NDA-style clause. The scope is limited to actual trade secrets, not general knowledge you learn on the job.',
      recommendation: 'This clause is reasonable as written. No action needed.',
    },
  ],
};

const RISK_COLORS: Record<string, string> = {
  safe: '#10B981', caution: '#F59E0B', danger: '#F97316', critical: '#EF4444',
};
const RISK_LABELS: Record<string, string> = {
  safe: 'Safe', caution: 'Caution', danger: 'Danger', critical: 'Critical',
};

function RiskBadge({ level }: { level: string }) {
  const color = RISK_COLORS[level] ?? '#94A3B8';
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full border"
      style={{ color, borderColor: color + '40', background: color + '15' }}
    >
      {RISK_LABELS[level] ?? level}
    </span>
  );
}

export default function DemoPage() {
  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-violet-500/30 bg-violet-600/10 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield size={20} className="text-violet-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-violet-300">Sample Report — Demo Mode</p>
            <p className="text-xs text-[#94A3B8]">This is a demonstration with fictional data. Sign up to analyze your own contracts.</p>
          </div>
        </div>
        <Link href="/sign-up">
          <Button size="sm" className="gap-2 shrink-0">
            Analyze My Contract
            <ArrowRight size={14} />
          </Button>
        </Link>
      </div>

      {/* Header card */}
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
                {SAMPLE.contractType}
              </Badge>
              {SAMPLE.partyNames.map((p) => (
                <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
              ))}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#F8FAFC]" style={{ fontFamily: 'Syne, sans-serif' }}>
              {SAMPLE.filename}
            </h1>
            <p className="text-sm text-[#94A3B8] flex items-center gap-1.5 flex-wrap">
              <Clock size={13} />
              Analyzed just now
              <span className="text-violet-400">· LexLens AI</span>
              <span className="text-[#64748B]" title="How confident the AI is in this analysis (1–10)">
                · Confidence {SAMPLE.confidence}/10
              </span>
              <span className="text-[#64748B]">· {SAMPLE.governingLaw}</span>
            </p>
          </div>
        </div>

        {/* Risk banner */}
        <div className="mt-5 rounded-xl border border-orange-600/40 bg-orange-950/30 px-5 py-4 text-lg font-bold text-orange-400">
          HIGH RISK CONTRACT
        </div>
      </motion.div>

      {/* Red flags */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border border-red-600/30 bg-red-950/20 p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-red-400" />
          <h2 className="font-bold text-red-400">Red Flags ({SAMPLE.redFlags.length})</h2>
        </div>
        <div className="space-y-3">
          {SAMPLE.redFlags.map((flag, i) => (
            <div key={i} className="rounded-lg border border-white/5 bg-[#0D0D15] p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${flag.severity === 'critical' ? 'bg-red-950 text-red-400 border border-red-600/40' : 'bg-orange-950 text-orange-400 border border-orange-600/40'}`}>
                  {flag.severity.toUpperCase()}
                </span>
                <span className="font-semibold text-sm text-[#F8FAFC]">{flag.title}</span>
              </div>
              <p className="text-sm text-[#94A3B8]">{flag.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Risk overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-2 gap-6"
      >
        {/* Risk score visual */}
        <div className="rounded-xl border border-white/10 bg-[#12121A] p-6 flex flex-col items-center justify-center gap-3">
          <div
            className="w-36 h-36 rounded-full flex items-center justify-center border-8"
            style={{ borderColor: '#F97316', boxShadow: '0 0 40px rgba(249,115,22,0.2)' }}
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400">{SAMPLE.overallRiskScore}</div>
              <div className="text-xs text-[#94A3B8]">/ 100</div>
            </div>
          </div>
          <p className="text-sm text-[#94A3B8] text-center">
            Overall risk score — 0 is safe, 100 is extremely risky
          </p>
        </div>

        {/* Summary */}
        <div className="rounded-xl border border-white/10 bg-[#12121A] p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">AI Summary</p>
            <p className="text-[#CBD5E1] leading-relaxed text-sm">{SAMPLE.summary}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Key Findings</p>
            <ul className="space-y-2">
              {SAMPLE.keyFindings.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#CBD5E1]">
                  <span className="text-violet-400 mt-0.5 flex-shrink-0">•</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Clause analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#F8FAFC]" style={{ fontFamily: 'Syne, sans-serif' }}>
            Clause Analysis
          </h2>
          <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
            <Filter size={14} />
            <span>{SAMPLE.clauses.length} clauses</span>
          </div>
        </div>

        <div className="space-y-3">
          {SAMPLE.clauses.map((clause) => (
            <details
              key={clause.id}
              className="rounded-xl border border-white/10 bg-[#12121A] group"
            >
              <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer list-none">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: RISK_COLORS[clause.riskLevel] }}
                  />
                  <span className="font-medium text-[#F8FAFC] truncate">{clause.title}</span>
                  <span className="text-xs text-[#475569] flex-shrink-0">{clause.category}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <RiskBadge level={clause.riskLevel} />
                  <span className="text-xs text-[#475569]">{clause.riskScore}/100</span>
                </div>
              </summary>
              <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                <div>
                  <p className="text-xs text-[#475569] mb-1">Original text</p>
                  <p className="text-xs font-mono text-[#94A3B8] bg-[#0D0D15] rounded-lg p-3 leading-relaxed">
                    &ldquo;{clause.originalText}&rdquo;
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#475569] mb-1">Plain English</p>
                  <p className="text-sm text-[#CBD5E1]">{clause.plainEnglish}</p>
                </div>
                <div>
                  <p className="text-xs text-[#475569] mb-1">Why it matters</p>
                  <p className="text-sm text-[#94A3B8]">{clause.explanation}</p>
                </div>
                <div className="rounded-lg border border-violet-500/20 bg-violet-950/20 p-3">
                  <p className="text-xs text-violet-400 font-medium mb-1">Recommendation</p>
                  <p className="text-sm text-[#CBD5E1]">{clause.recommendation}</p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <div className="rounded-xl border border-white/10 bg-[#12121A] p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#F8FAFC]" style={{ fontFamily: 'Syne, sans-serif' }}>
          Ready to analyze your own contract?
        </h2>
        <p className="text-[#94A3B8] max-w-md mx-auto">
          Upload any PDF, DOCX, or paste contract text. Get a full risk analysis in under 30 seconds. Free to start.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/sign-up">
            <Button size="lg" className="gap-2" style={{ boxShadow: '0 0 24px rgba(124,58,237,0.25)' }}>
              Start for Free
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="border-white/20">
              Learn more
            </Button>
          </Link>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-[#475569] pb-4">
        This is a demonstration report. LexLens AI analysis is for informational purposes only and does not constitute legal advice.{' '}
        <Link href="/terms" className="hover:text-[#94A3B8]">Terms</Link>
        {' · '}
        <Link href="/privacy" className="hover:text-[#94A3B8]">Privacy</Link>
      </p>
    </div>
  );
}
