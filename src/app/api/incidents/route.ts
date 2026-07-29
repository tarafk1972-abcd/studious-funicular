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
    const { type, title, description, reporterId, reporterName, block, cluster, coordinates } = body;

    if (!type || !title || !reporterId || !block) {
      return NextResponse.json({ error: 'Missing required fields for incident' }, { status: 400 });
    }

    const newIncident = createIncident({
      type,
      title,
      description: description || '',
      reporterId,
      reporterName: reporterName || 'Warga Klaster',
      block,
      cluster: cluster || 'Klaster Menteng Asri',
      coordinates,
    });

    return NextResponse.json(newIncident, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create incident' }, { status: 500 });
  }
}
