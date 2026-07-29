import { NextResponse } from 'next/server';
import {
  getPatrolPoints,
  getPatrolScans,
  addPatrolPoint,
  deletePatrolPoint,
  recordPatrolScan,
  getUsers,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

// API Modul Patroli QR (Satpam) — sesuai alur kerja:
// scan QR -> ambil GPS -> validasi radius -> online: kirim | offline: queue -> sinkron
// - GET => { points, scans }
// - POST { action: 'scan', qrCode, satpamId, coordinates, wasOffline?, scannedAt? }
// - POST { action: 'add-point', actorId, name, clusterName, x, y, radius }  (Admin/Superadmin)
// - POST { action: 'delete-point', actorId, pointId }                       (Admin/Superadmin)

export async function GET() {
  try {
    return NextResponse.json({ points: getPatrolPoints(), scans: getPatrolScans() });
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data patroli' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === 'scan') {
      const { qrCode, satpamId, coordinates, wasOffline, scannedAt } = body;
      if (!qrCode || !satpamId || !coordinates) {
        return NextResponse.json({ error: 'qrCode, satpamId, dan coordinates wajib diisi' }, { status: 400 });
      }
      const satpam = getUsers().find((u) => u.id === satpamId);
      if (!satpam) {
        return NextResponse.json({ error: 'Petugas tidak ditemukan' }, { status: 404 });
      }
      // Sistem memastikan petugas sedang aktif bertugas (Satpam/Admin/Superadmin disetujui)
      if (satpam.approvalStatus !== 'DISETUJUI') {
        return NextResponse.json({ error: 'Petugas belum disetujui Admin — tidak dapat patroli' }, { status: 403 });
      }
      const result = recordPatrolScan({
        qrCode,
        satpamId,
        satpamName: satpam.name,
        coordinates,
        wasOffline,
        scannedAt,
      });
      if (!result.scan) {
        // QR tidak dikenal -> halaman fallback
        return NextResponse.json({ error: result.error, fallback: true }, { status: 404 });
      }
      if (result.error) {
        // Di luar radius -> scan tercatat DITOLAK
        return NextResponse.json({ scan: result.scan, error: result.error }, { status: 422 });
      }
      return NextResponse.json({
        scan: result.scan,
        message: result.scan.wasOffline
          ? `Scan offline "${result.scan.patrolPointName}" berhasil DISINKRONKAN ke server.`
          : `Scan titik patroli "${result.scan.patrolPointName}" berhasil diverifikasi server.`,
      });
    }

    if (body.action === 'add-point') {
      const { actorId, name, clusterName, x, y, radius, qrCode } = body;
      const actor = getUsers().find((u) => u.id === actorId);
      if (!actor || (actor.role !== 'ADMIN' && actor.role !== 'SUPERADMIN')) {
        return NextResponse.json(
          { error: 'Hanya Admin atau Superadmin yang dapat menentukan titik patroli' },
          { status: 403 }
        );
      }
      if (!name || x === undefined || y === undefined) {
        return NextResponse.json({ error: 'name, x, dan y wajib diisi' }, { status: 400 });
      }
      const point = addPatrolPoint({
        name,
        clusterName: clusterName || actor.cluster,
        x,
        y,
        radius: radius || 12,
        qrCode,
        addedByAdminId: actorId,
      });
      return NextResponse.json({ point, message: `Titik patroli "${point.name}" dibuat dengan QR: ${point.qrCode}` }, { status: 201 });
    }

    if (body.action === 'delete-point') {
      const { actorId, pointId } = body;
      const actor = getUsers().find((u) => u.id === actorId);
      if (!actor || (actor.role !== 'ADMIN' && actor.role !== 'SUPERADMIN')) {
        return NextResponse.json(
          { error: 'Hanya Admin atau Superadmin yang dapat menghapus titik patroli' },
          { status: 403 }
        );
      }
      const ok = deletePatrolPoint(pointId);
      if (!ok) return NextResponse.json({ error: 'Titik patroli tidak ditemukan' }, { status: 404 });
      return NextResponse.json({ message: 'Titik patroli dihapus' });
    }

    return NextResponse.json({ error: 'Aksi tidak dikenal' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Gagal memproses patroli' }, { status: 500 });
  }
}
