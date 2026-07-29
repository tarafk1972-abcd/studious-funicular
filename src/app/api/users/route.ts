import { NextResponse } from 'next/server';
import { getUsers, createUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = getUsers();
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data anggota komunitas' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, role, block, phone, cluster, status, avatar, bio, language } = body;

    if (!name || !block) {
      return NextResponse.json({ error: 'Nama dan Blok Rumah wajib diisi' }, { status: 400 });
    }

    const result = createUser({
      name,
      email,
      role: role || 'WARGA',
      block,
      phone: phone || '0812-0000-0000',
      cluster: cluster || 'Klaster Menteng Asri',
      status: status || 'AMAN',
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bio: bio || 'Anggota baru klaster',
      language: language === 'en' ? 'en' : 'id',
    });

    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Gagal mendaftarkan anggota baru' }, { status: 500 });
  }
}
