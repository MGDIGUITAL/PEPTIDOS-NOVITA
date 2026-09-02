import crypto from 'crypto';

const FLOW_API_KEY = process.env.FLOW_API_KEY || '';
const FLOW_SECRET_KEY = process.env.FLOW_SECRET_KEY || '';
const FLOW_API_URL = process.env.FLOW_API_URL || 'https://sandbox.flow.cl/api';

/**
 * Genera la firma criptográfica (HMAC-SHA256) requerida por Flow.
 * Ordena las llaves alfabéticamente y concatena llave+valor.
 */
function signParams(params: Record<string, string | number>): string {
  const keys = Object.keys(params).sort();
  let toSign = '';
  keys.forEach(k => {
    toSign += `${k}${params[k]}`;
  });

  return crypto
    .createHmac('sha256', FLOW_SECRET_KEY)
    .update(toSign)
    .digest('hex');
}

/**
 * Crea una nueva orden de pago en Flow.
 */
export async function createFlowPayment(orderParams: {
  commerceOrder: string;
  subject: string;
  amount: number;
  email: string;
  urlConfirmation: string;
  urlReturn: string;
}) {
  const params: Record<string, any> = {
    apiKey: FLOW_API_KEY,
    commerceOrder: orderParams.commerceOrder,
    subject: orderParams.subject,
    currency: 'CLP',
    amount: orderParams.amount,
    email: orderParams.email,
    paymentMethod: 9, // 9 = Mostrar todos los medios de pago disponibles
    urlConfirmation: orderParams.urlConfirmation,
    urlReturn: orderParams.urlReturn,
  };

  const signature = signParams(params);
  params.s = signature;

  const formBody = new URLSearchParams(params).toString();

  const response = await fetch(`${FLOW_API_URL}/payment/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Error de Flow: ${data.message || 'Error desconocido'}`);
  }

  // Retorna url y token (e.g. { url: "...", token: "..." })
  return data;
}

/**
 * Obtiene el estado de un pago usando su token.
 */
export async function getFlowPaymentStatus(token: string) {
  const params: Record<string, any> = {
    apiKey: FLOW_API_KEY,
    token,
  };

  const signature = signParams(params);
  const urlParams = new URLSearchParams({ ...params, s: signature }).toString();

  const response = await fetch(`${FLOW_API_URL}/payment/getStatus?${urlParams}`, {
    method: 'GET',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Error de Flow: ${data.message || 'Error desconocido'}`);
  }

  return data; // { status, commerceOrder, amount, ... }
}
