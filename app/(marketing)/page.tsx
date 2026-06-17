'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useRef, useEffect, useState, Component, type ReactNode, type ErrorInfo } from 'react';
import {
  ArrowRight, Shield, FileText, Zap, BarChart2, Columns,
  Download, Star, Check, ChevronDown, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSceneInner = dynamic(() => import('@/components/three/HeroScene'), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});

class HeroSceneErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }
  componentDidCatch(_err: Error, _info: ErrorInfo) {}
  render() {
    if (this.state.hasError) return <div className="w-full h-full" />;
    return this.props.children;
  }
}

function HeroScene() {
  return (
    <HeroSceneErrorBoundary>
      <HeroSceneInner />
    </HeroSceneErrorBoundary>
  );
}

const AmbientBackground = dynamic(() => import('@/components/three/AmbientBackground'), {
  ssr: false,
});

// ── Tilt card 3D ────────────────────────────────────────────────────────────
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Scroll section ───────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Animated number counter ──────────────────────────────────────────────────
function AnimatedCount({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = to / 60;
      const timer = setInterval(() => {
        start = Math.min(start + step, to);
        setVal(Math.floor(start));
        if (start >= to) clearInterval(timer);
      }, 16);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Shield,    title: 'Risk Detection',  desc: 'Flags dangerous clauses before they trap you in an unfair agreement.',   color: '#DC2626', glow: 'rgba(220,38,38,0.15)'   },
  { icon: FileText,  title: 'Plain English',   desc: 'Legal jargon translated instantly into language anyone can understand.',  color: '#7C3AED', glow: 'rgba(124,58,237,0.15)'  },
  { icon: Zap,       title: 'Red Flag Alerts', desc: 'Critical warnings severity-ranked in real-time before you sign.',        color: '#D97706', glow: 'rgba(217,119,6,0.15)'   },
  { icon: BarChart2, title: 'Risk Score',      desc: '0-100 risk score for every contract so you compare at a glance.',        color: '#3B82F6', glow: 'rgba(59,130,246,0.15)'  },
  { icon: Columns,   title: 'Side-by-Side',    desc: 'Original vs plain English, clause by clause in a live split view.',      color: '#059669', glow: 'rgba(5,150,105,0.15)'   },
  { icon: Download,  title: 'PDF Report',      desc: 'Download a polished full-analysis report to share with anyone.',         color: '#8B5CF6', glow: 'rgba(139,92,246,0.15)'  },
];

const TESTIMONIALS = [
  {
    name: 'Sarah K.', role: 'Freelance Designer', avatar: 'SK',
    text: 'LexLens caught a non-compete clause that would have stopped me working with clients in my entire industry for 2 years. Invisible to me until the AI flagged it.',
    rating: 5,
  },
  {
    name: 'Marcus T.', role: 'Startup Founder', avatar: 'MT',
    text: 'We used to pay a lawyer $400/hour to review contracts. LexLens does it in 20 seconds. The risk breakdown is actually clearer than what we got from legal counsel.',
    rating: 5,
  },
  {
    name: 'Priya N.', role: 'Software Engineer', avatar: 'PN',
    text: 'My employment contract had IP assignment clauses giving my employer rights to every side project I build at home. LexLens flagged it as Critical immediately.',
    rating: 5,
  },
];


// ── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  return (
    <div className="relative bg-[#0A0A0F] text-[#F8FAFC] overflow-x-hidden">
      {/* Page-wide ambient 3D background */}
      <AmbientBackground />

      {/* ── HERO ─────────────────────────────── */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] flex items-center overflow-hidden">
        {/* Full-viewport 3D canvas */}
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        >
          <HeroScene />
        </motion.div>

        {/* Deep radial gradient overlays */}
        <div className="absolute inset-0 z-[1]"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,58,237,0.08) 0%, transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-40 z-[1]"
          style={{ background: 'linear-gradient(to top, #0A0A0F, transparent)' }} />

        {/* Hero text — rendered above the 3D scene */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="relative z-10 w-full text-center px-6"
        >
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            AI-powered legal protection — instant results
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl sm:text-7xl md:text-[92px] lg:text-[108px] font-extrabold leading-[0.92] tracking-tight mb-6"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Sign Nothing
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 45%, #60A5FA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 40px rgba(124,58,237,0.4))',
            }}>
              Blindly.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.7 }}
            className="text-xl md:text-2xl text-[#94A3B8] max-w-2xl mx-auto leading-relaxed mb-10"
          >
            LexLens reads your contracts with AI precision —
            exposing hidden risks before you sign away your rights.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/analyze">
              <Button size="xl" className="gap-2 relative group overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  Analyze Your Contract Free
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="xl" className="gap-2 border-white/20 hover:border-white/40 backdrop-blur-sm">
                See How It Works
                <ChevronDown size={18} />
              </Button>
            </a>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.7 }}
            className="flex flex-wrap gap-6 justify-center mt-10 text-sm text-[#64748B]"
          >
            {['256-bit encrypted', 'Never stored longer than needed', 'No lawyer needed'].map((b) => (
              <span key={b} className="flex items-center gap-1.5">
                <Check size={13} className="text-emerald-400" />
                {b}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-[#475569]">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-0.5 h-8 bg-gradient-to-b from-violet-400/40 to-transparent rounded-full"
          />
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────── */}
      <section id="how-it-works" className="relative py-32 px-6 z-10">
        {/* Section glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[400px] rounded-full bg-violet-600/5 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-20">
              <p className="text-violet-400 font-semibold uppercase tracking-[0.2em] text-xs mb-4">Simple 3-step process</p>
              <h2 className="text-5xl md:text-6xl font-extrabold" style={{ fontFamily: 'Syne, sans-serif' }}>
                How LexLens Works
              </h2>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

            {[
              { n: '01', emoji: '📤', title: 'Upload', desc: 'Drop your PDF or paste contract text. Supports PDF, DOCX, and TXT up to 10MB.' },
              { n: '02', emoji: '🧠', title: 'Analyze', desc: 'AI scans every clause in ~15 seconds, scoring risk and translating legalese.' },
              { n: '03', emoji: '🛡️', title: 'Protect', desc: 'Get your full risk report, understand what you\'re signing, and negotiate from strength.' },
            ].map((item, i) => (
              <FadeUp key={item.n} delay={i * 0.15}>
                <TiltCard className="h-full">
                  <div
                    className="relative p-8 rounded-2xl border border-white/10 bg-[#0D0D18] h-full group"
                    style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.4)' }}
                  >
                    <div className="absolute -top-5 left-8">
                      <div className="px-3 py-1 bg-violet-600 text-white text-xs font-bold rounded-full border border-violet-400/30">
                        {item.n}
                      </div>
                    </div>
                    {/* Inner glow on hover */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12), transparent 60%)' }} />
                    <div className="text-5xl mb-5 mt-2" style={{ filter: 'drop-shadow(0 0 12px rgba(124,58,237,0.4))' }}>
                      {item.emoji}
                    </div>
                    <h3 className="text-2xl font-bold text-[#F8FAFC] mb-3">{item.title}</h3>
                    <p className="text-[#94A3B8] leading-relaxed">{item.desc}</p>
                  </div>
                </TiltCard>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO ────────────────────────── */}
      <section className="relative py-24 px-6 z-10 overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, transparent, rgba(124,58,237,0.04) 50%, transparent)' }} />

        <div className="relative max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <h2 className="text-5xl font-extrabold mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
                Watch the AI Work
              </h2>
              <p className="text-[#94A3B8] text-lg">Real-time clause scanning and risk flagging</p>
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-white/10"
              style={{ boxShadow: '0 0 80px rgba(124,58,237,0.12), 0 40px 80px rgba(0,0,0,0.5)' }}>
              {/* Left: contract scanner */}
              <div className="bg-[#0B0B14] p-8 font-mono text-sm relative border-r border-white/10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="text-[#475569] text-xs ml-2">employment_contract.pdf</span>
                </div>

                <div className="space-y-3 relative">
                  {[
                    { text: '"This Agreement shall commence on the Effective Date and continue for twelve (12) months..."', border: 'border-emerald-500/60', bg: 'bg-emerald-950/20' },
                    { text: '"Employee hereby assigns to Company all Inventions made during employment, including those on personal time using personal equipment..."', border: 'border-red-500/80', bg: 'bg-red-950/25', pulse: true },
                    { text: '"Employee agrees not to engage in any Competing Business for two (2) years following termination in any jurisdiction worldwide..."', border: 'border-amber-500/60', bg: 'bg-amber-950/20' },
                    { text: '"Company may modify, assign, or transfer this Agreement without prior notice or consent of Employee..."', border: 'border-red-500/80', bg: 'bg-red-950/25', pulse: true },
                  ].map((c, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.2 }}
                      className={`p-3 rounded-lg ${c.bg} border-l-2 ${c.border} text-[#94A3B8] text-xs leading-relaxed ${c.pulse ? 'animate-pulse' : ''}`}
                    >
                      {c.text}
                    </motion.div>
                  ))}
                </div>

                {/* Scan line */}
                <div className="absolute left-0 right-0 h-px bg-blue-400/30 scan-line pointer-events-none" />
              </div>

              {/* Right: analysis output */}
              <div className="bg-[#0E0E1A] p-8 flex flex-col gap-5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 text-xs font-bold uppercase tracking-wider">2 Critical Risks Detected</span>
                </div>

                {[
                  { title: 'IP Assignment — CRITICAL', score: 94, color: '#DC2626', desc: 'This clause gives your employer ownership of EVERYTHING you create — even on weekends with your own laptop.' },
                  { title: 'Global Non-Compete — HIGH', score: 72, color: '#D97706', desc: 'Prohibits working in your field for 2 years worldwide. This is likely unenforceable but costly to fight.' },
                ].map((flag, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.25 }}
                    className="rounded-xl p-4 border"
                    style={{
                      borderColor: `${flag.color}40`,
                      background: `${flag.color}0a`,
                      boxShadow: `0 0 20px ${flag.color}10`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold" style={{ color: flag.color }}>{flag.title}</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${flag.color}20`, color: flag.color }}>
                        {flag.score}/100
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">{flag.desc}</p>
                    {/* Score bar */}
                    <div className="mt-3 h-1 bg-[#1A1A27] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${flag.score}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 + i * 0.2, duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: flag.color }}
                      />
                    </div>
                  </motion.div>
                ))}

                <Link href="/analyze" className="mt-auto">
                  <Button className="w-full gap-2 group">
                    Try It Live &mdash; It&apos;s Free
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────── */}
      <section id="features" className="relative py-32 px-6 z-10">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -left-40 top-20 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl" />
          <div className="absolute -right-40 bottom-20 w-96 h-96 rounded-full bg-blue-600/5 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-extrabold mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>
                Everything You Need to<br />Sign Confidently
              </h2>
              <p className="text-[#94A3B8] text-xl max-w-xl mx-auto">
                The same protection as a lawyer in your pocket. In seconds, not days.
              </p>
            </div>
          </FadeUp>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {FEATURES.map((feat, i) => (
              <FadeUp key={feat.title} delay={i * 0.07}>
                <TiltCard className="h-full">
                  <div
                    className="relative h-full p-6 rounded-2xl border border-white/[0.08] bg-[#0D0D18] group cursor-pointer overflow-hidden"
                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
                  >
                    {/* Hover glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                      style={{ background: `radial-gradient(ellipse at 50% 0%, ${feat.glow}, transparent 70%)` }}
                    />
                    {/* Bottom border glow */}
                    <div
                      className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `linear-gradient(90deg, transparent, ${feat.color}60, transparent)` }}
                    />

                    <div
                      className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                      style={{ background: `${feat.glow}`, border: `1px solid ${feat.color}30` }}
                    >
                      <feat.icon size={22} style={{ color: feat.color }} />
                    </div>
                    <h3 className="relative font-bold text-lg text-[#F8FAFC] mb-2">{feat.title}</h3>
                    <p className="relative text-sm text-[#94A3B8] leading-relaxed">{feat.desc}</p>
                  </div>
                </TiltCard>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ─────────────────────── */}
      <section className="relative py-24 px-6 z-10 overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.05) 0%, transparent 60%)' }} />

        <div className="relative max-w-5xl mx-auto">
          {/* Stats */}
          <FadeUp>
            <div className="flex flex-wrap justify-center gap-12 md:gap-20 mb-20">
              {[
                { val: 12847, label: 'Contracts analyzed',     suffix: '' },
                { val: 847,   label: 'Red flags caught',       suffix: '' },
                { val: 4,     label: 'Star rating',            suffix: '.9★' },
              ].map(({ val, label, suffix }) => (
                <div key={label} className="text-center">
                  <p className="text-5xl font-extrabold mb-1"
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED, #A78BFA, #60A5FA)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                    <AnimatedCount to={val} suffix={suffix} />
                  </p>
                  <p className="text-sm text-[#64748B]">{label}</p>
                </div>
              ))}
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.12}>
                <TiltCard className="h-full">
                  <div
                    className="relative h-full p-6 rounded-2xl border border-white/[0.08] bg-[#0D0D18] flex flex-col gap-4 overflow-hidden group"
                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
                  >
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.08), transparent 60%)' }} />

                    <div className="flex gap-0.5">
                      {[...Array(t.rating)].map((_, j) => (
                        <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="relative text-sm text-[#CBD5E1] leading-relaxed flex-1">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="relative flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}>
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#F8FAFC]">{t.name}</p>
                        <p className="text-xs text-[#64748B]">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>


      {/* ── FINAL CTA ────────────────────────── */}
      <section className="relative py-28 px-6 z-10 overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.1) 0%, transparent 65%)' }} />
        {/* Animated border ring */}
        <div className="absolute inset-8 rounded-3xl border border-violet-500/10 pointer-events-none" />

        <FadeUp>
          <div className="relative max-w-3xl mx-auto text-center">
            <p className="text-violet-400 text-sm font-bold uppercase tracking-widest mb-5">Start for free today</p>
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
              Ready to see what&apos;s really<br />in your contract?
            </h2>
            <p className="text-[#94A3B8] text-xl mb-10 max-w-xl mx-auto">
              Join thousands of people who stopped signing blindly.
              Two free contracts — no credit card required.
            </p>
            <Link href="/analyze">
              <Button size="xl" className="gap-2 group relative overflow-hidden"
                style={{ boxShadow: '0 0 40px rgba(124,58,237,0.3)' }}>
                <span className="absolute inset-0 bg-gradient-to-r from-violet-700 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  Analyze Your First Contract Free
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </div>
        </FadeUp>
      </section>

      {/* ── FOOTER ───────────────────────────── */}
      <footer className="relative border-t border-white/[0.06] py-12 px-6 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center"
                style={{ boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}>
                <Shield size={14} className="text-white" />
              </div>
              <span className="font-bold text-[#F8FAFC]" style={{ fontFamily: 'Syne, sans-serif' }}>LexLens</span>
              <span className="text-[#475569] text-sm">See Through Every Contract</span>
            </div>
            <div className="flex gap-6 text-sm text-[#475569]">
              <a href="/demo" className="hover:text-[#94A3B8] transition-colors">Demo</a>
              <a href="/privacy" className="hover:text-[#94A3B8] transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-[#94A3B8] transition-colors">Terms</a>
              <a href="mailto:support@lexlens.ai" className="hover:text-[#94A3B8] transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-[#334155]">
            Your contracts are analyzed and discarded. We never sell your data.
            <br />
            &copy; {new Date().getFullYear()} LexLens. Not legal advice. Consult a qualified attorney.
          </div>
        </div>
      </footer>
    </div>
  );
}
