'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Upload, FileText, ArrowRight, Search, X, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContractCard from '@/components/dashboard/ContractCard';
import StatsBar from '@/components/dashboard/StatsBar';
import type { ContractListItem } from '@/types/analysis';

type SortOption = 'newest' | 'oldest' | 'risk-high' | 'risk-low';
const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  'risk-high': 'Highest risk',
  'risk-low': 'Lowest risk',
};

export default function DashboardPage() {
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [riskFilter, setRiskFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContracts, setTotalContracts] = useState(0);
  const [sortOpen, setSortOpen] = useState(false);

  const loadPage = useCallback((p: number) => {
    setLoading(true);
    fetch(`/api/contracts?page=${p}`)
      .then((r) => r.json())
      .then((d) => {
        setContracts(d.contracts ?? []);
        setTotalPages(d.pagination?.totalPages ?? 1);
        setTotalContracts(d.pagination?.total ?? 0);
        setPage(p);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadPage(1); }, [loadPage]);

  const handleDelete = (id: string) => {
    setContracts((prev) => prev.filter((c) => c._id !== id));
  };

  const filtered = useMemo(() => {
    let list = contracts.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        c.filename.toLowerCase().includes(q) ||
        c.contractType?.toLowerCase().includes(q) ||
        c.riskLevel?.toLowerCase().includes(q);
      const matchesRisk = riskFilter === 'all' || c.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    });

    switch (sort) {
      case 'oldest':    list = [...list].sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()); break;
      case 'risk-high': list = [...list].sort((a, b) => b.overallRiskScore - a.overallRiskScore); break;
      case 'risk-low':  list = [...list].sort((a, b) => a.overallRiskScore - b.overallRiskScore); break;
      default:          list = [...list].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    }
    return list;
  }, [contracts, search, sort, riskFilter]);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#F8FAFC]" style={{ fontFamily: 'Syne, sans-serif' }}>
            Dashboard
          </h1>
          <p className="text-[#94A3B8] mt-1">Your contract analysis history</p>
        </div>
        <Link href="/analyze">
          <Button size="lg" className="gap-2 shrink-0">
            <Upload size={18} />
            Analyze New Contract
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {!loading && contracts.length > 0 && (
        <div className="mb-8"><StatsBar contracts={contracts} /></div>
      )}

      {/* Search + filters */}
      {!loading && contracts.length > 0 && (
        <div className="space-y-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, type, or risk level..."
                aria-label="Search contracts"
                className="w-full rounded-xl border border-white/10 bg-[#12121A] text-[#F8FAFC] placeholder-[#475569] pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-violet-500/60 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] hover:text-white transition-colors"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Custom sort dropdown */}
            <div className="relative flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-[#475569] flex-shrink-0" />
              <button
                onClick={() => setSortOpen((o) => !o)}
                aria-label="Sort contracts"
                aria-expanded={sortOpen}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#12121A] text-[#94A3B8] text-sm px-3 py-3 hover:border-violet-500/40 focus:outline-none focus:border-violet-500/60 transition-colors cursor-pointer min-w-[140px] justify-between"
              >
                <span>{SORT_LABELS[sort]}</span>
                <ChevronDown size={14} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                  <div className="absolute top-full right-0 mt-1 z-20 w-44 rounded-xl border border-white/10 bg-[#12121A] shadow-xl overflow-hidden">
                    {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setSort(opt); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sort === opt ? 'bg-violet-600/20 text-violet-300' : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'}`}
                      >
                        {SORT_LABELS[opt]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Risk filter chips with counts */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'low', 'medium', 'high', 'critical'].map((r) => {
              const count = r === 'all' ? contracts.length : contracts.filter((c) => c.riskLevel === r).length;
              return (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                    riskFilter === r
                      ? 'bg-violet-600 text-white border-transparent'
                      : 'border-white/10 text-[#94A3B8] hover:text-white hover:border-white/20'
                  }`}
                >
                  {r === 'all' ? 'All risks' : r.charAt(0).toUpperCase() + r.slice(1)}
                  {count > 0 && <span className="ml-1.5 opacity-70">({count})</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Contracts */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 rounded-xl shimmer" />
          ))}
        </div>
      ) : contracts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-violet-600/10 border border-violet-600/20 flex items-center justify-center mb-6">
            <FileText size={36} className="text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold text-[#F8FAFC] mb-2">No contracts yet</h2>
          <p className="text-[#94A3B8] mb-6 max-w-sm">
            Upload your first contract and get an instant AI-powered risk analysis in under 30 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/analyze">
              <Button size="lg" className="gap-2">
                Analyze Your First Contract
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-white/20 gap-2">
                <FileText size={16} />
                See a Sample Report
              </Button>
            </Link>
          </div>
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <Search size={36} className="text-[#475569] mb-4" />
          <p className="text-[#94A3B8]">No contracts match &ldquo;{search}&rdquo;</p>
          <button onClick={() => setSearch('')} className="text-violet-400 text-sm mt-2 hover:underline">
            Clear search
          </button>
        </motion.div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c, i) => (
              <ContractCard key={c._id} contract={c} onDelete={handleDelete} index={i} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                onClick={() => loadPage(page - 1)}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-white/10 text-[#94A3B8] hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-[#94A3B8]">
                Page {page} of {totalPages}
                <span className="text-[#475569] ml-1">({totalContracts} total)</span>
              </span>
              <button
                onClick={() => loadPage(page + 1)}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-white/10 text-[#94A3B8] hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
