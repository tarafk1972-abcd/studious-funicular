import { NextResponse } from 'next/server';
import { updateIncidentStatus, addIncidentResponder, addIncidentComment, deleteIncident } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.action === 'status') {
      const updated = updateIncidentStatus(id, body.status);
      if (!updated) return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
      return NextResponse.json(updated);
    }

    if (body.action === 'respond') {
      const updated = addIncidentResponder(id, {
        userId: body.userId,
        name: body.name,
        role: body.role,
        status: body.responderStatus || 'MELUNCUR',
      });
      if (!updated) return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
      return NextResponse.json(updated);
    }

    if (body.action === 'comment') {
      const updated = addIncidentComment(id, {
        userId: body.userId,
        userName: body.userName,
        userRole: body.userRole,
        text: body.text,
      });
      if (!updated) return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to update incident' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const success = deleteIncident(id);
    if (!success) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete incident' }, { status: 500 });
  }
}
