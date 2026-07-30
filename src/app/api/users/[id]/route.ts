import { NextResponse } from 'next/server';
import { updateUserStatus, approveUserRole, setUserHomeLocation } from '@/lib/db';

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

    // Tetapkan lokasi rumah anggota dari GPS smartphone yang membuka peta
    if (body.action === 'set-home-location') {
      const { lat, lng } = body;
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return NextResponse.json({ error: 'lat dan lng wajib berupa angka' }, { status: 400 });
      }
      const updated = setUserHomeLocation(id, lat, lng);
      if (!updated) {
        return NextResponse.json({ error: 'Anggota tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({
        user: updated,
        message: 'Lokasi rumah ditetapkan dari posisi GPS smartphone Anda.',
      });
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
