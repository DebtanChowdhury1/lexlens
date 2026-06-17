export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ClauseRisk = 'safe' | 'caution' | 'danger' | 'critical';
export type ContractStatus = 'processing' | 'complete' | 'error';

export interface Clause {
  id: string;
  title: string;
  originalText: string;
  plainEnglish: string;
  riskLevel: ClauseRisk;
  riskScore: number;
  explanation: string;
  recommendation: string;
  category: string;
}

export interface RedFlag {
  severity: 'high' | 'critical';
  title: string;
  description: string;
  clauseId?: string;
}

export interface Contract {
  _id: string;
  userId: string;
  filename: string;
  uploadedAt: string;
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

export interface ContractListItem {
  _id: string;
  filename: string;
  contractType: string;
  uploadedAt: string;
  status: ContractStatus;
  overallRiskScore: number;
  riskLevel: RiskLevel;
  redFlags: RedFlag[];
  partyNames?: string[];
  confidence?: number;
  processingTime?: number;
}

export interface AIAnalysisResult {
  contractType: string;
  partyNames: string[];
  overallRiskScore: number;
  riskLevel: RiskLevel;
  summary: string;
  keyFindings: string[];
  redFlags: RedFlag[];
  clauses: Clause[];
}

export interface UserUsage {
  userId: string;
  contractsThisMonth: number;
  lastResetDate: Date;
}
