import { NextResponse } from 'next/server';
import { updateUserStatus, approveUserRole } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();

    if (body.action === 'approve') {
      const updated = approveUserRole(id, body.approvalStatus, body.assignedRole);
      if (!updated) {
        return NextResponse.json({ error: 'Anggota tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json(updated);
    }

    if (!body.status) {
      return NextResponse.json({ error: 'Status wajib diisi' }, { status: 400 });
    }

    const updated = updateUserStatus(id, body.status);
    if (!updated) {
      return NextResponse.json({ error: 'Anggota tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Gagal memutakhirkan status anggota' }, { status: 500 });
  }
}
