import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db/mongoose';
import { ContractModel } from '@/lib/db/models/Contract';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const skip = (page - 1) * PAGE_SIZE;

    await connectDB();

    const [contracts, total] = await Promise.all([
      ContractModel.find({ userId })
        .select('-clauses.originalText')
        .sort({ uploadedAt: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean(),
      ContractModel.countDocuments({ userId }),
    ]);

    return NextResponse.json({
      contracts,
      pagination: { page, pageSize: PAGE_SIZE, total, totalPages: Math.ceil(total / PAGE_SIZE) },
    });
  } catch (error) {
    logger.error('[API] Contracts GET error', { error: String(error) });
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
  }
}
