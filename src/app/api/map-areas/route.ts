import { NextResponse } from 'next/server';
import { getMapAreas, addMapArea } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const areas = getMapAreas();
    return NextResponse.json(areas);
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data peta area' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { blockName, description, x, y, type, addedByAdminId } = body;

    if (!blockName || x === undefined || y === undefined) {
      return NextResponse.json({ error: 'Nama blok dan koordinat wajib diisi' }, { status: 400 });
    }

    const newArea = addMapArea({
      blockName,
      description: description || 'Area pemantauan klaster',
      x: Number(x),
      y: Number(y),
      type: type || 'RUMAH',
      addedByAdminId,
    });

    return NextResponse.json(newArea, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Gagal menambahkan area baru pada peta' }, { status: 500 });
  }
}
