import { NextResponse } from 'next/server';
import { paySubscription, superadminManageSubscription, getUsers } from '@/lib/db';

export const dynamic = 'force-dynamic';

// API Langganan Aplikasi Berbayar WargaJagaWarga
// - POST { action: 'pay', userId, plan: 'BULANAN' | 'TAHUNAN' } => simulasi pembayaran
// - POST { action: 'manage', actorId, userId, manageAction } => pengawasan Superadmin

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === 'pay') {
      const { userId, plan } = body;
      if (!userId || !plan) {
        return NextResponse.json({ error: 'userId dan plan wajib diisi' }, { status: 400 });
      }
      const updated = paySubscription(userId, plan);
      if (!updated) {
        return NextResponse.json({ error: 'Anggota tidak ditemukan atau paket tidak valid' }, { status: 404 });
      }
      return NextResponse.json({
        user: updated,
        message: 'Pembayaran langganan berhasil dicatat. Terima kasih telah mendukung keamanan komunitas!',
      });
    }

    if (body.action === 'manage') {
      const { actorId, userId, manageAction, note } = body;
      if (!actorId || !userId || !manageAction) {
        return NextResponse.json({ error: 'actorId, userId, dan manageAction wajib diisi' }, { status: 400 });
      }
      // Hanya Superadmin (tarafk1972@gmail.com) yang boleh mengawasi langganan
      const actor = getUsers().find((u) => u.id === actorId);
      if (!actor || actor.role !== 'SUPERADMIN') {
        return NextResponse.json(
          { error: 'Hanya Superadmin (tarafk1972@gmail.com) yang dapat mengelola langganan anggota' },
          { status: 403 }
        );
      }
      const updated = superadminManageSubscription(userId, manageAction, note);
      if (!updated) {
        return NextResponse.json({ error: 'Anggota tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ user: updated, message: 'Langganan anggota berhasil diperbarui oleh Superadmin.' });
    }

    return NextResponse.json({ error: 'Aksi tidak dikenal' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Gagal memproses langganan' }, { status: 500 });
  }
}
