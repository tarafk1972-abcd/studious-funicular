import { NextResponse } from 'next/server';
import { deleteMapArea } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const success = deleteMapArea(id);
    if (!success) {
      return NextResponse.json({ error: 'Area peta tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus area peta' }, { status: 500 });
  }
}
