import { NextResponse } from 'next/server';
import { createFlowPayment } from '@/lib/flow';

export async function POST(request: Request) {
  try {
    const { orderId, amount, email } = await request.json();

    if (!orderId || !amount || !email) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://amorajewelry.cl';

    // Generar el pago en Flow
    const flowResponse = await createFlowPayment({
      commerceOrder: orderId.toString(),
      subject: `Orden #${orderId} - Amora Jewelry`,
      amount: Math.round(amount),
      email: email,
      urlConfirmation: `${baseUrl}/api/checkout/flow-webhook`,
      urlReturn: `${baseUrl}/api/checkout/flow-return`,
    });

    // Flow retorna una URL y un Token. El cliente debe ser redirigido a URL?token=TOKEN
    const redirectUrl = `${flowResponse.url}?token=${flowResponse.token}`;

    return NextResponse.json({ redirectUrl });

  } catch (error: any) {
    console.error('Error creando pago en Flow:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
