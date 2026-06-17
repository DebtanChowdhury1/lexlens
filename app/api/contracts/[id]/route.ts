import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db/mongoose';
import { ContractModel } from '@/lib/db/models/Contract';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

function isValidId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid contract ID' }, { status: 400 });
    }

    await connectDB();

    const contract = await ContractModel.findOne({ _id: params.id, userId }).lean();
    if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ contract });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contract' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid contract ID' }, { status: 400 });
    }

    await connectDB();

    const result = await ContractModel.findOneAndDelete({ _id: params.id, userId });
    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 });
  }
}
