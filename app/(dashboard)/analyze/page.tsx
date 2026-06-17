'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Brain, Scale, Search, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DropZone from '@/components/upload/DropZone';
import toast from 'react-hot-toast';

const AnalysisScene = dynamic(() => import('@/components/three/AnalysisScene'), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});

type Tab = 'upload' | 'paste';
type Stage = 'input' | 'processing' | 'done';

const STEPS = [
  { icon: Radio,       label: 'Extracting contract text...' },
  { icon: Brain,       label: 'Identifying clause types...' },
  { icon: Scale,       label: 'Scoring risk levels...' },
  { icon: Search,      label: 'Detecting red flags...' },
  { icon: FileText,    label: 'Writing plain English summaries...' },
  { icon: CheckCircle, label: 'Generating your report...' },
];

export default function AnalyzePage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState('');

  const handleTabChange = (t: Tab) => {
    setTab(t);
    // Clear the other input when switching tabs to avoid stale state
    if (t === 'upload') setPasteText('');
    else setFile(null);
  };
  const [contractName, setContractName] = useState('');
  const [stage, setStage] = useState<Stage>('input');
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const stepRef = useRef<NodeJS.Timeout | null>(null);

  const hasName = contractName.trim().length > 0;
  const canSubmit = hasName && (tab === 'upload' ? !!file : pasteText.trim().length > 100);

  const startProgressAnimation = () => {
    setProgress(0);
    setStepIndex(0);

    progressRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 92) { clearInterval(progressRef.current!); return p; }
        return p + Math.random() * 3;
      });
    }, 400);

    stepRef.current = setInterval(() => {
      setStepIndex((i) => {
        if (i >= STEPS.length - 2) { clearInterval(stepRef.current!); return i; }
        return i + 1;
      });
    }, 4000);
  };

  const stopProgressAnimation = () => {
    if (progressRef.current) clearInterval(progressRef.current);
    if (stepRef.current) clearInterval(stepRef.current);
  };

  const handleSubmit = async () => {
    setStage('processing');
    startProgressAnimation();

    try {
      const formData = new FormData();
      if (contractName.trim()) {
        formData.append('contractName', contractName.trim());
      }
      if (contractName.trim().length === 0) {
        toast.error('Please give this report a name before analyzing.');
        setStage('input');
        stopProgressAnimation();
        return;
      }
      if (tab === 'upload' && file) {
        formData.append('file', file);
      } else {
        formData.append('text', pasteText);
      }

      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Analysis failed. Please try again.');
      }

      setStepIndex(STEPS.length - 1);
      setProgress(100);
      stopProgressAnimation();

      setTimeout(() => {
        router.push(`/report/${data.contractId}`);
      }, 800);
    } catch (err: any) {
      stopProgressAnimation();
      toast.error(err.message ?? 'Analysis failed. Please try again.');
      setStage('input');
    }
  };

  useEffect(() => {
    return () => stopProgressAnimation();
  }, []);

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        {stage === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#F8FAFC]" style={{ fontFamily: 'Syne, sans-serif' }}>
                Analyze a Contract
              </h1>
              <p className="text-[#94A3B8] mt-1">
                Upload your document or paste the text. AI analysis takes ~15-30 seconds.
              </p>
            </div>

            {/* Contract Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                Report Name <span className="text-red-400">*</span>
              </label>
              <input
                id="contract-name"
                type="text"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                placeholder="e.g. Employment Agreement — Acme Corp"
                maxLength={100}
                aria-required="true"
                aria-describedby="contract-name-hint"
                className={`w-full rounded-xl border bg-[#12121A] text-[#F8FAFC] placeholder-[#475569] px-4 py-3 text-sm focus:outline-none transition-colors ${
                  contractName.trim().length > 0
                    ? 'border-violet-500/60'
                    : 'border-white/10 focus:border-violet-500/40'
                }`}
              />
              <p id="contract-name-hint" className="text-xs text-[#475569] mt-1.5">
                {contractName.trim().length === 0
                  ? 'Give this report a name so you can find it later in your dashboard.'
                  : `${contractName.trim().length}/100 characters`}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-[#12121A] border border-white/10 rounded-xl p-1 w-fit">
              {(['upload', 'paste'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTabChange(t)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                    tab === t
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {t === 'upload' ? '📎 Upload File' : '✏️ Paste Text'}
                </button>
              ))}
            </div>

            {tab === 'upload' ? (
              <DropZone onFile={setFile} />
            ) : (
              <div className="space-y-3">
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste your contract text here... (minimum 100 characters)"
                  rows={14}
                  className="w-full rounded-xl border border-white/10 bg-[#12121A] text-[#F8FAFC] placeholder-[#475569] p-4 font-mono text-sm resize-none focus:outline-none focus:border-violet-500/60 transition-colors"
                />
                <p className={`text-xs ${pasteText.length < 100 && pasteText.length > 0 ? 'text-amber-400' : 'text-[#94A3B8]'}`}>
                  {pasteText.length} characters
                  {pasteText.length > 0 && pasteText.length < 100 && ' — minimum 100 characters required'}
                </p>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <div className="rounded-lg border border-amber-600/20 bg-amber-950/10 px-4 py-3 text-xs text-[#94A3B8]">
                <span className="text-amber-400 font-medium">Not legal advice.</span>{' '}
                LexLens AI analysis is for informational purposes only. Always consult a qualified attorney before signing.{' '}
                Your document text is processed securely — see our{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">Privacy Policy</a>.
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                size="lg"
                className="w-full gap-2 text-base"
                aria-label={!hasName ? 'Enter a report name to enable analysis' : undefined}
              >
                {!hasName ? 'Enter Report Name to Continue' : 'Analyze Contract with AI'}
              </Button>
              <p className="text-xs text-[#94A3B8] text-center">
                ~15-30 seconds · Powered by LexLens AI
              </p>
            </div>
          </motion.div>
        )}

        {stage === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-8"
          >
            {/* 3D scene */}
            <div className="w-48 h-48 md:w-64 md:h-64">
              <AnalysisScene step={stepIndex} />
            </div>

            {/* Status */}
            <div className="w-full max-w-md space-y-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stepIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center gap-2 text-lg font-medium text-[#F8FAFC]"
                >
                  {(() => {
                    const Step = STEPS[stepIndex];
                    return <><Step.icon size={20} className="text-violet-400 flex-shrink-0" />{Step.label}</>;
                  })()}
                </motion.div>
              </AnimatePresence>

              {/* Progress bar */}
              <div className="w-full h-2 bg-[#1A1A27] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-600 to-blue-500 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <p className="text-sm text-[#94A3B8]">
                {Math.round(progress)}% complete &middot; Please don&apos;t close this tab
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
