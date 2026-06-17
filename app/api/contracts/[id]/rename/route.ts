import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db/mongoose';
import { ContractModel } from '@/lib/db/models/Contract';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

function isValidId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid contract ID' }, { status: 400 });
    }

    const body = await req.json();
    const name = (body.filename ?? '').trim().replace(/[<>"`\\]/g, '').slice(0, 100);
    if (!name) {
      return NextResponse.json({ error: 'Filename cannot be empty' }, { status: 422 });
    }

    await connectDB();

    const updated = await ContractModel.findOneAndUpdate(
      { _id: params.id, userId },
      { filename: name },
      { new: true, select: '_id filename' }
    ).lean();

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true, filename: (updated as any).filename });
  } catch {
    return NextResponse.json({ error: 'Failed to rename contract' }, { status: 500 });
  }
}
