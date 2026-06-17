'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, Trash2, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getRiskColor, getRiskLabel } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { ContractListItem } from '@/types/analysis';
import toast from 'react-hot-toast';

interface Props {
  contract: ContractListItem;
  onDelete: (id: string) => void;
  index: number;
}

export default function ContractCard({ contract, onDelete, index }: Props) {
  const [deleting, setDeleting] = useState(false);
  const color = getRiskColor(contract.riskLevel);
  const criticalFlags = contract.redFlags?.filter((f) => f.severity === 'critical').length ?? 0;

  const handleDelete = () => {
    toast(
      (t) => (
        <span className="flex flex-col gap-2 text-sm">
          <span className="font-semibold">Delete this contract?</span>
          <span className="text-[#94A3B8] text-xs">This cannot be undone.</span>
          <span className="flex gap-2 mt-1">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                setDeleting(true);
                try {
                  const res = await fetch(`/api/contracts/${contract._id}`, { method: 'DELETE' });
                  if (res.ok) {
                    onDelete(contract._id);
                    toast.success('Contract deleted');
                  } else {
                    toast.error('Failed to delete');
                  }
                } finally {
                  setDeleting(false);
                }
              }}
              className="px-3 py-1 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 rounded-md bg-[#1A1A27] text-[#94A3B8] text-xs font-medium hover:text-white border border-white/10"
            >
              Cancel
            </button>
          </span>
        </span>
      ),
      { duration: 10000 }
    );
  };

  const handleDownload = async () => {
    if (contract.status !== 'complete') {
      toast.error('Analysis is not complete yet.');
      return;
    }
    toast.loading('Generating PDF…', { id: 'pdf' });
    try {
      const res = await fetch(`/api/export/${contract._id}`);
      if (!res.ok) throw new Error('Server error');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LexLens-${contract.filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!', { id: 'pdf' });
    } catch {
      toast.error('Download failed. Please try again.', { id: 'pdf' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="card-hover rounded-xl border border-white/10 bg-[#12121A] p-5 flex flex-col gap-4"
    >
      {/* Top section */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-violet-600/10 flex items-center justify-center flex-shrink-0 border border-violet-600/20">
          <FileText size={18} className="text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#F8FAFC] truncate" title={contract.filename}>
            {contract.filename}
          </p>
          <p className="text-sm text-[#94A3B8] mt-0.5">{contract.contractType || 'Unknown Type'}</p>
        </div>
        {/* Risk score circle */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 font-bold text-sm"
          style={{ borderColor: color, color }}
        >
          {contract.overallRiskScore}
        </div>
      </div>

      {/* Risk badge + flags */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={contract.riskLevel as any}>{getRiskLabel(contract.riskLevel)}</Badge>
        {contract.redFlags && contract.redFlags.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-red-400 bg-red-950/30 border border-red-600/30 px-2 py-0.5 rounded-full">
            <AlertTriangle size={10} />
            {contract.redFlags.length} flag{contract.redFlags.length !== 1 ? 's' : ''}
            {criticalFlags > 0 && ` (${criticalFlags} critical)`}
          </span>
        )}
      </div>

      {/* Date */}
      <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
        <Clock size={12} />
        {formatDistanceToNow(new Date(contract.uploadedAt), { addSuffix: true })}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        <Link href={`/report/${contract._id}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full gap-1.5">
            <Eye size={14} />
            View Report
          </Button>
        </Link>
        <Button variant="outline" size="sm" onClick={handleDownload} title="Download PDF">
          <Download size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
          title="Delete"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </motion.div>
  );
}
