import { NextResponse } from 'next/server';
import { getIncidents, createIncident } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const incidents = getIncidents();
    return NextResponse.json(incidents);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch incidents' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, title, description, reporterId, reporterName, block, cluster, coordinates, reporterLat, reporterLng } = body;

    if (!type || !title || !reporterId || !block) {
      return NextResponse.json({ error: 'Missing required fields for incident' }, { status: 400 });
    }

    // CATATAN: Emergency Alert TIDAK PERNAH diblokir oleh status billing.
    // Keselamatan warga adalah prioritas utama — masalah billing hanya
    // ditampilkan sebagai peringatan kepada ADMIN klaster (bukan warga).
    const newIncident = createIncident({
      type,
      title,
      description: description || '',
      reporterId,
      reporterName: reporterName || 'Warga Klaster',
      block,
      cluster: cluster || 'Klaster Menteng Asri',
      coordinates,
      reporterLat,
      reporterLng,
    });

    return NextResponse.json({ incident: newIncident }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create incident' }, { status: 500 });
  }
}
