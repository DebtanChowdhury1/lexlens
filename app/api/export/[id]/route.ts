import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db/mongoose';
import { ContractModel } from '@/lib/db/models/Contract';
import { generatePDFReport } from '@/lib/pdf/export';
import { logger } from '@/lib/logger';
import { format } from 'date-fns';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid contract ID' }, { status: 400 });
    }

    await connectDB();

    const contract = await ContractModel.findOne({ _id: params.id, userId }).lean();
    if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (contract.status !== 'complete') {
      return NextResponse.json({ error: 'Contract analysis is not complete yet.' }, { status: 409 });
    }

    const pdfBuffer = await generatePDFReport(contract as any);

    const safeName = contract.filename.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
    const date = format(new Date(contract.uploadedAt), 'yyyy-MM-dd');
    const filename = `LexLens-Report-${safeName}-${date}.pdf`;

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
      },
    });
  } catch (error) {
    logger.error('[API] Export error', { error: String(error) });
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
