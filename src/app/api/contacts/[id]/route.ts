import { NextResponse } from 'next/server';
import { updateContactStatus } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();

    if (!body.status) {
      return NextResponse.json({ error: 'Status wajib diisi' }, { status: 400 });
    }

    const updated = updateContactStatus(id, body.status, body.csResponse);
    if (!updated) {
      return NextResponse.json({ error: 'Pesan pendaftaran tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Gagal memutakhirkan pesan' }, { status: 500 });
  }
}
