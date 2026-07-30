import { NextResponse } from 'next/server';
import { setClusterMapArea, getUsers, getClusters } from '@/lib/db';

export const dynamic = 'force-dynamic';

// API Area Peta Klaster (Offline Map Area)
// Admin pertama klaster menentukan area peta yang akan ter-download
// ke aplikasi setiap smartphone anggota agar bekerja secara offline.
//
// POST { actorId, clusterId, centerLat, centerLng, radiusKm, minZoom?, maxZoom? }

export async function GET() {
  try {
    // Kembalikan ringkasan area peta seluruh klaster
    const clusters = getClusters().map((c) => ({
      id: c.id,
      name: c.name,
      mapArea: c.mapArea || null,
    }));
    return NextResponse.json(clusters);
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil area peta klaster' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { actorId, clusterId, centerLat, centerLng, radiusKm, minZoom, maxZoom } = body;

    if (!actorId || !clusterId || centerLat === undefined || centerLng === undefined || !radiusKm) {
      return NextResponse.json(
        { error: 'actorId, clusterId, centerLat, centerLng, dan radiusKm wajib diisi' },
        { status: 400 }
      );
    }

    // Hanya ADMIN klaster tersebut atau SUPERADMIN yang boleh menentukan area peta
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
        { error: 'Hanya Admin klaster ini atau Superadmin yang dapat menentukan area peta offline' },
        { status: 403 }
      );
    }

    const updated = setClusterMapArea(clusterId, actorId, {
      centerLat,
      centerLng,
      radiusKm,
      minZoom,
      maxZoom,
    });
    if (!updated) {
      return NextResponse.json({ error: 'Klaster tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      cluster: updated,
      message: `Area peta klaster ${updated.name} ditetapkan (radius ${updated.mapArea?.radiusKm} km). Anggota kini dapat men-download peta area ini untuk dipakai offline.`,
    });
  } catch {
    return NextResponse.json({ error: 'Gagal menetapkan area peta klaster' }, { status: 500 });
  }
}
