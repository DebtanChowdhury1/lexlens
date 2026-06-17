import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ status: 'ok', db: 'connected', ts: Date.now() });
  } catch {
    return NextResponse.json(
      { status: 'degraded', db: 'disconnected', ts: Date.now() },
      { status: 503 }
    );
  }
}
