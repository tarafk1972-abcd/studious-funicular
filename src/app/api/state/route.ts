import { NextResponse } from 'next/server';
import { getState, resetState } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const state = getState();
    return NextResponse.json(state);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch state' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.action === 'reset') {
      const state = resetState();
      return NextResponse.json({ message: 'State reset to initial demo data', state });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to reset state' }, { status: 500 });
  }
}
