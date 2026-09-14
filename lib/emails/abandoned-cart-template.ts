export interface AbandonedCartItem {
  title: string;
  size?: string;
  quantity: number;
  price: number;
  image_url?: string | null;
}

export interface AbandonedCartEmailProps {
  clientName?: string;
  items: AbandonedCartItem[];
  subtotal: number;
  checkoutUrl?: string;
}

// ─── PALETA DE COLORES OFICIAL NOVA PERFORMANCE ───────────────────────────
// WHITE:     #FFFFFF
// BLACK:     #000000 (Superficies principales)
// IVORY:     #E6E2D3 (Acentuaciones, insignias, bordes de lujo y botones)
// OFF-WHITE: #EEEEEE (Textos secundarios y leyendas)
// ──────────────────────────────────────────────────────────────────────────

export function getAbandonedCartEmailHtml({
  clientName = 'Cliente Nova',
  items = [],
  subtotal = 0,
  checkoutUrl = 'https://novaperformance.cl/checkout'
}: AbandonedCartEmailProps): string {
  const formattedSubtotal = subtotal.toLocaleString('es-CL');
  const firstName = clientName.split(' ')[0] || 'Cliente';

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #222222;vertical-align:middle;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            ${item.image_url ? `
            <td width="60" style="vertical-align:middle;padding-right:14px;">
              <img src="${item.image_url}" alt="${item.title}" width="54" height="54" style="border-radius:8px;object-fit:cover;border:1px solid #E6E2D3;display:block;" />
            </td>
            ` : ''}
            <td style="vertical-align:middle;">
              <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:#FFFFFF;display:block;margin-bottom:4px;font-weight:700;letter-spacing:0.5px;">${item.title}</span>
              ${item.size ? `<span style="font-size:11px;color:#000000;background-color:#E6E2D3;padding:2px 8px;border-radius:4px;font-weight:700;display:inline-block;letter-spacing:0.5px;">Especificación: ${item.size}</span>` : ''}
            </td>
          </tr>
        </table>
      </td>
      <td style="padding:16px 8px;border-bottom:1px solid #222222;text-align:center;vertical-align:middle;font-size:13px;color:#EEEEEE;font-weight:bold;">
        x${item.quantity}
      </td>
      <td style="padding:16px 0;border-bottom:1px solid #222222;text-align:right;vertical-align:middle;font-size:14px;color:#FFFFFF;font-weight:bold;">
        $${(item.price * item.quantity).toLocaleString('es-CL')} <span style="font-size:10px;color:#E6E2D3;font-weight:normal;">CLP</span>
      </td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tus productos te esperan — NOVA Performance®</title>
</head>
<body style="margin:0;padding:0;min-width:100%;background-color:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#FFFFFF;">

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000000" style="background-color:#000000;">
    <tr>
      <td align="center" style="padding:32px 12px;">

        <!-- Contenedor Principal Adaptado a la Paleta Oficial (Max-width 560px) -->
        <table role="presentation" width="100%" style="max-width:560px;background-color:#0A0A0A;border:1px solid #E6E2D3;border-radius:16px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.95);" border="0" cellspacing="0" cellpadding="0">

          <!-- ══ CABECERA DE MARCA CON BORDER IVORY (#E6E2D3) ══ -->
          <tr>
            <td style="padding:24px 24px;text-align:center;background-color:#000000;border-bottom:2px solid #E6E2D3;">
              <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;font-weight:900;letter-spacing:6px;color:#FFFFFF;text-transform:uppercase;display:block;">NOVA PERFORMANCE®</span>
              <span style="font-size:8.5px;letter-spacing:3px;color:#E6E2D3;text-transform:uppercase;margin-top:4px;display:block;font-weight:700;">BIOTECHNOLOGY & SCIENTIFIC RESEARCH</span>
            </td>
          </tr>

          <!-- ══ HERO BANNER PRINCIPAL (RESERVA.PNG) ══ -->
          <tr>
            <td style="padding:0;background-color:#000000;border-bottom:1px solid #E6E2D3;">
              <img src="cid:reserva_img" alt="TUS PRODUCTOS SIGUEN RESERVADOS — NOVA Performance" style="width:100%;height:auto;display:block;border:none;outline:none;" />
            </td>
          </tr>

          <!-- ══ SECCIÓN PERSONALIZADA CON COLORES IVORY (#E6E2D3) & OFF-WHITE (#EEEEEE) ══ -->
          <tr>
            <td style="padding:38px 36px 24px;text-align:center;background-color:#0A0A0A;">
              
              <!-- INSIGNIA IVORY CREADA SEGÚN GUÍA DE ESTILO -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="background-color:#E6E2D3;border-radius:20px;padding:7px 20px;text-align:center;">
                    <span style="font-size:10px;font-weight:900;letter-spacing:2.5px;color:#000000;text-transform:uppercase;">✦ CARRITO EN ESPERA ✦</span>
                  </td>
                </tr>
              </table>

              <h1 style="margin:0 0 16px;font-size:23px;color:#FFFFFF;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;letter-spacing:1px;text-transform:uppercase;line-height:1.25;">
                ¡HOLA, ${firstName.toUpperCase()}!
              </h1>

              <p style="margin:0 auto;font-size:13.5px;color:#EEEEEE;line-height:1.7;max-width:480px;font-weight:400;">
                Notamos que ingresaste a nuestra plataforma y agregaste productos a tu carro de compra, pero por alguna razón no continuaste con el pedido.
                <br><br>
                De parte del equipo de <strong style="color:#FFFFFF;letter-spacing:0.5px;">Nova Performance®</strong>, queremos <strong style="color:#E6E2D3;">agradecerte sinceramente tu preferencia por nuestra marca</strong>. Tus productos siguen en reserva para que puedas completar tu compra:
              </p>
            </td>
          </tr>

          <!-- ══ DETALLE DE PRODUCTOS EN CARRITO ══ -->
          <tr>
            <td style="padding:28px 36px 12px;background-color:#0A0A0A;">
              
              <div style="border-top:1px solid #222222;padding-top:24px;">
                <p style="margin:0 0 16px;font-size:10.5px;letter-spacing:3px;color:#E6E2D3;text-transform:uppercase;font-weight:900;">
                  RESUMEN DE TU CARRO DE COMPRA
                </p>

                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <thead>
                    <tr>
                      <th style="text-align:left;font-size:10px;letter-spacing:1.5px;color:#E6E2D3;font-weight:bold;text-transform:uppercase;padding-bottom:10px;border-bottom:1px solid #333333;">Producto</th>
                      <th style="text-align:center;font-size:10px;letter-spacing:1.5px;color:#E6E2D3;font-weight:bold;text-transform:uppercase;padding-bottom:10px;border-bottom:1px solid #333333;">Cant.</th>
                      <th style="text-align:right;font-size:10px;letter-spacing:1.5px;color:#E6E2D3;font-weight:bold;text-transform:uppercase;padding-bottom:10px;border-bottom:1px solid #333333;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
              </div>

              <!-- CAJA DE SUBTOTAL CON MARCO IVORY -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:24px;margin-bottom:30px;">
                <tr>
                  <td style="padding:16px 20px;background-color:#121212;border-radius:10px;border:1px solid #E6E2D3;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size:13px;color:#EEEEEE;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;">
                          Total estimado
                        </td>
                        <td style="font-size:19px;color:#FFFFFF;text-align:right;font-weight:900;">
                          $${formattedSubtotal} <span style="font-size:11px;font-weight:normal;color:#E6E2D3;">CLP</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- BOTÓN CTA PRINCIPAL EN IVORY (#E6E2D3) Y TEXTO BLACK (#000000) -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${checkoutUrl}" target="_blank" style="display:block;width:100%;padding:19px 0;background-color:#E6E2D3;color:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;font-weight:900;letter-spacing:3px;text-decoration:none;text-transform:uppercase;border-radius:10px;text-align:center;box-shadow:0 8px 30px rgba(230,226,211,0.25);">
                      COMPLETAR Y FINALIZAR COMPRA →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- GARANTÍAS DE MARCA CON PALETA OFICIAL -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
                <tr>
                  <td width="33%" style="padding:4px;vertical-align:top;">
                    <div style="background-color:#121212;border:1px solid #333333;border-radius:8px;padding:14px 8px;text-align:center;">
                      <div style="font-size:9.5px;font-weight:900;color:#E6E2D3;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">PUREZA >99%</div>
                      <div style="font-size:9px;color:#EEEEEE;line-height:1.3;">Certificación HPLC</div>
                    </div>
                  </td>
                  <td width="33%" style="padding:4px;vertical-align:top;">
                    <div style="background-color:#121212;border:1px solid #333333;border-radius:8px;padding:14px 8px;text-align:center;">
                      <div style="font-size:9.5px;font-weight:900;color:#E6E2D3;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">ENVÍO RÁPIDO</div>
                      <div style="font-size:9px;color:#EEEEEE;line-height:1.3;">Despacho a Chile</div>
                    </div>
                  </td>
                  <td width="33%" style="padding:4px;vertical-align:top;">
                    <div style="background-color:#121212;border:1px solid #333333;border-radius:8px;padding:14px 8px;text-align:center;">
                      <div style="font-size:9.5px;font-weight:900;color:#E6E2D3;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">SOPORTE DIRECTO</div>
                      <div style="font-size:9px;color:#EEEEEE;line-height:1.3;">Atención Personalizada</div>
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ══ NOTA Y CONTACTO CON BORDE IVORY (#E6E2D3) ══ -->
          <tr>
            <td style="padding:0 36px 32px;background-color:#0A0A0A;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#121212;border-left:3px solid #E6E2D3;border-radius:4px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:12px;color:#EEEEEE;line-height:1.6;">
                      ¿Tienes alguna consulta con tu orden o necesitas ayuda para concretar tu pago? Escríbenos directamente respondiendo a este correo o a nuestro equipo a
                      <a href="mailto:Cnovoadrust@gmail.com" style="color:#E6E2D3;font-weight:bold;text-decoration:underline;">Cnovoadrust@gmail.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══ PIE DE PÁGINA ══ -->
          <tr>
            <td style="background-color:#000000;padding:26px 36px;text-align:center;border-top:1px solid #E6E2D3;">
              <p style="margin:0 0 8px;font-size:10.5px;letter-spacing:4px;color:#E6E2D3;text-transform:uppercase;font-weight:900;">NOVAPERFORMANCE.CL</p>
              <p style="margin:0;font-size:10px;color:#EEEEEE;line-height:1.6;">
                Compuestos de Investigación Biotecnológica de Alta Pureza.<br>
                &copy; ${new Date().getFullYear()} NOVA Performance®. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
        <!-- Fin Contenedor -->

      </td>
    </tr>
  </table>

</body>
</html>`;
}
