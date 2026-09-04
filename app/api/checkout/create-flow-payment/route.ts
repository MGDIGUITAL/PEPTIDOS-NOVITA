import { NextResponse } from 'next/server';
import { createFlowPayment } from '@/lib/flow';

// ─── Headers de seguridad ──────────────────────────────────────────────────────
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options':        'DENY',
  'Cache-Control':          'no-store, no-cache, must-revalidate',
};

export async function POST(request: Request) {
  try {
    const { orderId, amount, email } = await request.json();

    if (!orderId || !amount || !email) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: orderId, amount, email' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Validaciones básicas de seguridad
    if (typeof amount !== 'number' || amount <= 0 || amount > 50_000_000) {
      return NextResponse.json(
        { error: 'Monto inválido' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      'https://novaperformance.cl';

    const flowResponse = await createFlowPayment({
      commerceOrder:   orderId.toString(),
      subject:         `Orden #${orderId} — NOVA Performance® | Peptidos Novita`,
      amount:          Math.round(amount),
      email,
      urlConfirmation: `${baseUrl}/api/checkout/flow-webhook`,
      urlReturn:       `${baseUrl}/api/checkout/flow-return`,
      paymentMethod:   9, // Todos los medios de pago disponibles
    });

    // El cliente debe redirigirse a esta URL para completar el pago
    const redirectUrl = `${flowResponse.url}?token=${flowResponse.token}`;

    return NextResponse.json(
      { redirectUrl, token: flowResponse.token },
      { status: 200, headers: SECURITY_HEADERS }
    );

  } catch (error: any) {
    console.error('[Flow] Error creando pago:', error.message);
    return NextResponse.json(
      { error: 'No se pudo iniciar el pago. Por favor intenta nuevamente.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
