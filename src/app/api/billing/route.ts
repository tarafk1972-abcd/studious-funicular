import { NextResponse } from 'next/server';
import { getClusters, payClusterBilling, superadminManageClusterBilling, getUsers } from '@/lib/db';

export const dynamic = 'force-dynamic';

// API Billing PER-CLUSTER WargaJagaWarga (aplikasi berbayar, diawasi Superadmin)
// - GET => daftar klaster + billing + kode undangan
// - POST { action: 'pay', actorId, clusterId, plan } => Admin klaster membayar (simulasi)
// - POST { action: 'manage', actorId, clusterId, manageAction, payload } => pengawasan Superadmin

export async function GET() {
  try {
    return NextResponse.json(getClusters());
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data billing klaster' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === 'pay') {
      const { actorId, clusterId, plan } = body;
      if (!actorId || !clusterId || !plan) {
        return NextResponse.json({ error: 'actorId, clusterId, dan plan wajib diisi' }, { status: 400 });
      }
      // Hanya Admin klaster tsb atau Superadmin yang boleh membayar billing klaster
      const actor = getUsers().find((u) => u.id === actorId);
      const cluster = getClusters().find((c) => c.id === clusterId);
      if (!actor || !cluster) {
        return NextResponse.json({ error: 'Aktor atau klaster tidak ditemukan' }, { status: 404 });
      }
      const isAllowed =
        actor.role === 'SUPERADMIN' ||
        (actor.role === 'ADMIN' && actor.cluster.toLowerCase() === cluster.name.toLowerCase());
      if (!isAllowed) {
        return NextResponse.json(
          { error: 'Hanya Admin klaster ini atau Superadmin yang dapat membayar billing klaster' },
          { status: 403 }
        );
      }
      const updated = payClusterBilling(clusterId, plan);
      if (!updated) {
        return NextResponse.json({ error: 'Klaster tidak ditemukan atau paket tidak valid' }, { status: 404 });
      }
      return NextResponse.json({
        cluster: updated,
        message: `Pembayaran billing klaster ${updated.name} berhasil dicatat. Emergency Alert seluruh anggota tetap aktif!`,
      });
    }

    if (body.action === 'manage') {
      const { actorId, clusterId, manageAction, payload } = body;
      if (!actorId || !clusterId || !manageAction) {
        return NextResponse.json({ error: 'actorId, clusterId, dan manageAction wajib diisi' }, { status: 400 });
      }
      // Hanya Superadmin (tarafk1972@gmail.com) yang boleh mengawasi billing seluruh klaster
      const actor = getUsers().find((u) => u.id === actorId);
      if (!actor || actor.role !== 'SUPERADMIN') {
        return NextResponse.json(
          { error: 'Hanya Superadmin (tarafk1972@gmail.com) yang dapat mengelola billing klaster' },
          { status: 403 }
        );
      }
      const updated = superadminManageClusterBilling(clusterId, manageAction, payload);
      if (!updated) {
        return NextResponse.json({ error: 'Klaster tidak ditemukan atau payload tidak valid' }, { status: 404 });
      }
      return NextResponse.json({
        cluster: updated,
        message: `Billing klaster ${updated.name} berhasil diperbarui oleh Superadmin.`,
      });
    }

    return NextResponse.json({ error: 'Aksi tidak dikenal' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Gagal memproses billing klaster' }, { status: 500 });
  }
}
