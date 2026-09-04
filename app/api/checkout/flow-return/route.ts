import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Flow envía el token vía POST a la URL de retorno
  const formData = await request.formData();
  const token = formData.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/checkout?error=NoToken', request.url), 303);
  }

  // Redirigir al cliente a una página de estado donde leeremos el token
  // IMPORTANTE: 303 (See Other) fuerza que el navegador haga GET en vez de repetir el POST
  return NextResponse.redirect(new URL(`/checkout/status?token=${token}`, request.url), 303);
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
