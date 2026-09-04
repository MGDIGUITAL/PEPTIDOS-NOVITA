/**
 * lib/flow.ts — Integración Flow.cl (PRODUCCIÓN)
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  SEGURIDAD CRÍTICA — SOLO SERVER SIDE                       ║
 * ║  Este módulo NUNCA debe importarse en código client-side.   ║
 * ║  Las variables de entorno NO llevan prefijo NEXT_PUBLIC_.   ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import crypto from 'crypto';

// ─── Credenciales desde env (server-only) ─────────────────────────────────
// Si faltan en runtime, lanzamos error en startup para detectarlo rápido.
function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`[Flow] Variable de entorno requerida no configurada: ${key}`);
  return val;
}

const FLOW_API_KEY    = () => requireEnv('FLOW_API_KEY');
const FLOW_SECRET_KEY = () => requireEnv('FLOW_SECRET_KEY');
const FLOW_API_URL    = () => process.env.FLOW_API_URL || 'https://www.flow.cl/api';

// ─── Función de firma HMAC-SHA256 ──────────────────────────────────────────
/**
 * Genera la firma requerida por Flow.
 * Algoritmo: ordenar keys alfabéticamente, concatenar key+value, firmar con HMAC-SHA256.
 */
export function signParams(params: Record<string, string | number>): string {
  const secret = FLOW_SECRET_KEY();
  const toSign = Object.keys(params)
    .sort()
    .map(k => `${k}${params[k]}`)
    .join('');

  return crypto
    .createHmac('sha256', secret)
    .update(toSign)
    .digest('hex');
}

// ─── Verificación HMAC de webhooks entrantes (anti-hack) ──────────────────
/**
 * Verifica que un webhook de Flow es auténtico usando timing-safe comparison.
 * Rechaza cualquier request que no tenga una firma válida generada con nuestro secret.
 *
 * @param params - Todos los parámetros recibidos del webhook (incluye 's' = firma de Flow)
 * @returns true si la firma es válida, false si es un intento de manipulación
 */
export function verifyFlowWebhook(params: Record<string, string>): boolean {
  const { s: receivedSignature, ...rest } = params;

  if (!receivedSignature) return false;

  // Recalcular la firma esperada (sin el campo 's')
  const expectedSignature = signParams(rest as Record<string, string | number>);

  // Comparación en tiempo constante para prevenir timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(receivedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    // Si los buffers tienen distinto tamaño, timingSafeEqual lanza error
    return false;
  }
}

// ─── Crear pago en Flow ────────────────────────────────────────────────────
export interface FlowPaymentParams {
  commerceOrder: string;   // ID único de la orden en nuestro sistema
  subject: string;         // Descripción visible para el cliente
  amount: number;          // Monto en CLP (entero)
  email: string;           // Email del comprador
  urlConfirmation: string; // Webhook POST que Flow llama al confirmar
  urlReturn: string;       // URL donde redirigir al cliente al finalizar
  paymentMethod?: number;  // 9 = todos los medios disponibles (default)
}

export async function createFlowPayment(params: FlowPaymentParams) {
  const apiKey = FLOW_API_KEY();

  const payload: Record<string, string | number> = {
    apiKey,
    commerceOrder: params.commerceOrder,
    subject:        params.subject,
    currency:       'CLP',
    amount:         Math.round(params.amount),
    email:          params.email,
    paymentMethod:  params.paymentMethod ?? 9,
    urlConfirmation: params.urlConfirmation,
    urlReturn:       params.urlReturn,
  };

  const signature = signParams(payload);
  const body = new URLSearchParams({
    ...Object.fromEntries(Object.entries(payload).map(([k, v]) => [k, String(v)])),
    s: signature,
  });

  const res = await fetch(`${FLOW_API_URL()}/payment/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await res.json();

  if (!res.ok || data.code) {
    throw new Error(
      `[Flow] Error en payment/create — ${data.message || JSON.stringify(data)}`
    );
  }

  // Retorna { url, token } — el cliente debe ir a `${url}?token=${token}`
  return data as { url: string; token: string };
}

// ─── Obtener estado de un pago por token ──────────────────────────────────
export async function getFlowPaymentStatus(token: string) {
  const apiKey = FLOW_API_KEY();

  const params: Record<string, string> = { apiKey, token };
  const signature = signParams(params);

  const qs = new URLSearchParams({ ...params, s: signature });

  const res = await fetch(`${FLOW_API_URL()}/payment/getStatus?${qs}`, {
    method: 'GET',
    headers: { 'Cache-Control': 'no-store' },
  });

  const data = await res.json();

  if (!res.ok || data.code) {
    throw new Error(
      `[Flow] Error en payment/getStatus — ${data.message || JSON.stringify(data)}`
    );
  }

  /*
   * Retorna objeto con:
   *  - status: 1=Pendiente, 2=Pagado, 3=Rechazado, 4=Anulado
   *  - commerceOrder: ID de orden
   *  - amount: monto
   *  - payer: email del pagador
   *  - flowOrder: número de orden en Flow
   */
  return data;
}

// ─── Anular un pago ────────────────────────────────────────────────────────
export async function refundFlowPayment(commerceOrder: string, amount: number) {
  const apiKey = FLOW_API_KEY();

  const payload: Record<string, string | number> = {
    apiKey,
    commerceOrder,
    amount: Math.round(amount),
  };

  const signature = signParams(payload);
  const body = new URLSearchParams({
    ...Object.fromEntries(Object.entries(payload).map(([k, v]) => [k, String(v)])),
    s: signature,
  });

  const res = await fetch(`${FLOW_API_URL()}/refund/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await res.json();

  if (!res.ok || data.code) {
    throw new Error(
      `[Flow] Error en refund/create — ${data.message || JSON.stringify(data)}`
    );
  }

  return data;
}
