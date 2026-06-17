import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db/mongoose';
import { ContractModel } from '@/lib/db/models/Contract';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/user
 * Deletes all contract data for the current user (GDPR right to erasure).
 * Note: Clerk account deletion must be done separately via Clerk dashboard
 * or by calling clerkClient.users.deleteUser(userId).
 */
export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const result = await ContractModel.deleteMany({ userId });
    logger.info('[API] User data deleted', { userId, deletedCount: result.deletedCount });

    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    logger.error('[API] User data deletion failed', { error: String(error) });
    return NextResponse.json({ error: 'Failed to delete account data' }, { status: 500 });
  }
}
