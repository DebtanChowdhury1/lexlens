import mongoose, { Schema, Document } from 'mongoose';
import type { Clause, RedFlag, RiskLevel, ContractStatus } from '@/types/analysis';

export interface ContractDocument extends Document {
  userId: string;
  filename: string;
  uploadedAt: Date;
  status: ContractStatus;
  overallRiskScore: number;
  riskLevel: RiskLevel;
  summary: string;
  keyFindings: string[];
  clauses: Clause[];
  redFlags: RedFlag[];
  partyNames: string[];
  contractType: string;
  confidence: number;
  governingLaw?: string;
  aiModel: string;
  processingTime: number;
}

const ClauseSchema = new Schema({
  id: String,
  title: String,
  originalText: String,
  plainEnglish: String,
  riskLevel: { type: String, enum: ['safe', 'caution', 'danger', 'critical'] },
  riskScore: Number,
  explanation: String,
  recommendation: String,
  category: String,
});

const RedFlagSchema = new Schema({
  severity: { type: String, enum: ['high', 'critical'] },
  title: String,
  description: String,
  clauseId: String,
});

const ContractSchema = new Schema<ContractDocument>(
  {
    userId: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['processing', 'complete', 'error'], default: 'processing' },
    overallRiskScore: { type: Number, default: 0 },
    riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
    summary: { type: String, default: '' },
    keyFindings: [String],
    clauses: [ClauseSchema],
    redFlags: [RedFlagSchema],
    partyNames: [String],
    contractType: { type: String, default: 'Unknown' },
    confidence: { type: Number, default: 7 },
    governingLaw: { type: String },
    aiModel: { type: String, default: 'unknown' },
    processingTime: { type: Number, default: 0 },
  },
  { timestamps: false }
);

// Compound index: most common query pattern (user's contracts sorted by date)
ContractSchema.index({ userId: 1, uploadedAt: -1 });

export const ContractModel =
  (mongoose.models.Contract as mongoose.Model<ContractDocument>) ||
  mongoose.model<ContractDocument>('Contract', ContractSchema);
