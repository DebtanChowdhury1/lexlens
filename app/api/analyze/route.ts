import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db/mongoose';
import { ContractModel } from '@/lib/db/models/Contract';
import { analyzeContract } from '@/lib/ai/analyze';
import { extractTextFromBuffer } from '@/lib/pdf/parse';
import { logger } from '@/lib/logger';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

// In-memory rate limiter: max 10 analyses per user per minute
const rlMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rlMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rlMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

function sanitizeName(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw.trim().replace(/[<>"`\\]/g, '').slice(0, 100);
}

// Magic-byte signatures for supported binary types
const MAGIC: Record<string, number[][]> = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    [0x50, 0x4b, 0x03, 0x04],
    [0x50, 0x4b, 0x05, 0x06],
  ],
};

function isMagicValid(buf: Buffer, mime: string): boolean {
  const sigs = MAGIC[mime];
  if (!sigs) return true;
  return sigs.some((sig) => sig.length <= buf.length && sig.every((byte, i) => buf[i] === byte));
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    await connectDB();

    let contractText = '';
    let filename = 'contract.txt';

    const contentType = request.headers.get('content-type') ?? '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const text = formData.get('text') as string | null;
      const contractName = sanitizeName(formData.get('contractName') as string | null);

      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'File too large. Maximum allowed size is 10 MB.' },
            { status: 413 }
          );
        }
        if (file.size < 100) {
          return NextResponse.json(
            { error: 'File appears to be empty or corrupted.' },
            { status: 422 }
          );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        if (!isMagicValid(buffer, file.type)) {
          return NextResponse.json(
            { error: 'File content does not match its type. Please upload a valid PDF, DOCX, or text file.' },
            { status: 422 }
          );
        }

        filename = contractName || file.name;

        try {
          contractText = await extractTextFromBuffer(buffer, file.type);
        } catch (extractErr: any) {
          if (extractErr.message?.includes('Unsupported file type')) {
            return NextResponse.json(
              { error: 'Unsupported file type. Please upload a PDF, DOCX, or plain text file.' },
              { status: 422 }
            );
          }
          return NextResponse.json(
            { error: 'Could not read this file. It may be corrupted or password-protected.' },
            { status: 422 }
          );
        }
      } else if (text) {
        contractText = text;
        filename = contractName || 'pasted-contract.txt';
      }
    } else {
      const contentLength = Number(request.headers.get('content-length') ?? '0');
      if (contentLength > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'Request body too large. Maximum 10 MB.' }, { status: 413 });
      }
      const body = await request.json();
      if (body.text) {
        contractText = body.text;
        const name = sanitizeName(body.contractName);
        if (name) filename = name;
      }
    }

    if (!contractText || contractText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Could not extract meaningful text from the document. Please try a different file.' },
        { status: 422 }
      );
    }

    // Create pending record — no originalText stored
    const contract = await ContractModel.create({
      userId,
      filename,
      status: 'processing',
    });

    let analysisResult;
    try {
      analysisResult = await analyzeContract(contractText);
    } catch (aiError: any) {
      await ContractModel.findByIdAndDelete(contract._id);

      if (aiError.message?.startsWith('NOT_A_CONTRACT:')) {
        const docType = aiError.message.replace('NOT_A_CONTRACT:', '');
        return NextResponse.json(
          {
            error: `This looks like a ${docType}, not a contract. Please upload a legal contract, agreement, or NDA.`,
            code: 'NOT_A_CONTRACT',
          },
          { status: 422 }
        );
      }
      if (aiError.message === 'AI_TIMEOUT') {
        return NextResponse.json(
          { error: 'Analysis timed out. The document may be too complex — please try again.' },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: 'AI analysis failed. Please try again in a few seconds.' },
        { status: 503 }
      );
    }

    const { result, model, processingTime } = analysisResult;
    await ContractModel.findByIdAndUpdate(contract._id, {
      status: 'complete',
      overallRiskScore: result.overallRiskScore,
      riskLevel: result.riskLevel,
      summary: result.summary,
      keyFindings: result.keyFindings,
      clauses: result.clauses,
      redFlags: result.redFlags,
      partyNames: result.partyNames,
      contractType: result.contractType,
      confidence: result.confidence,
      governingLaw: result.governingLaw,
      aiModel: model,
      processingTime,
    });

    return NextResponse.json({ contractId: contract._id.toString(), status: 'complete' });
  } catch (error) {
    logger.error('[API] Analyze unhandled error', { error: String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
