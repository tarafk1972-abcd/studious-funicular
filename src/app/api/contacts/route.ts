import { NextResponse } from 'next/server';
import { getContacts, createContactInquiry } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const contacts = getContacts();
    return NextResponse.json(contacts);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, message, inquiryType, communityName } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Nama, Email, dan Pesan wajib diisi' }, { status: 400 });
    }

    const newContact = createContactInquiry({
      name,
      email,
      phone: phone || '',
      message,
      inquiryType: inquiryType || 'Cara daftar komunitas',
      communityName: communityName || '',
    });

    return NextResponse.json(newContact, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create contact inquiry' }, { status: 500 });
  }
}
