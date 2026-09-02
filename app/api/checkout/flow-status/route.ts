import { NextResponse } from 'next/server';
import { getFlowPaymentStatus } from '@/lib/flow';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token missing' }, { status: 400 });
  }

  try {
    const status = await getFlowPaymentStatus(token);
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
