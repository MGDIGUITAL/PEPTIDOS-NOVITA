import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Flow envía el token vía POST a la URL de retorno
  const formData = await request.formData();
  const token = formData.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/checkout?error=NoToken', request.url));
  }

  // Redirigir al cliente a una página de estado donde leeremos el token
  return NextResponse.redirect(new URL(`/checkout/status?token=${token}`, request.url));
}

// Algunos casos (dependiendo del medio de pago) podrían venir por GET
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/checkout?error=NoToken', request.url));
  }

  return NextResponse.redirect(new URL(`/checkout/status?token=${token}`, request.url));
}
