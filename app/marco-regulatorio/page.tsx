import React from 'react';
import Metadata from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Marco Regulatorio y Aviso Legal | NOVA Performance®',
  description: 'Información formal y marco legal aplicable a los compuestos comercializados por NOVA PERFORMANCE® en Chile.',
};

export default function MarcoRegulatorioPage() {
  return (
    <main style={{ background: '#000000', color: '#FFFFFF', minHeight: '100vh', padding: '60px 20px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        
        {/* Navigation back */}
        <div style={{ marginBottom: 40 }}>
          <Link 
            href="/" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8, 
              color: '#E6E2D3', 
              textDecoration: 'none', 
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}
          >
            ← Volver al sitio principal
          </Link>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 50, borderBottom: '1px solid #222222', paddingBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <Image src="/logo-nova-white.png" alt="NOVA Performance" width={240} height={50} style={{ objectFit: 'contain' }} />
          </div>
          <p style={{ color: '#E6E2D3', fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
            Información Formal
          </p>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Aviso Legal · Marco Regulatorio
          </h1>
          <p style={{ color: '#888888', fontSize: '0.9rem', marginTop: 12, maxWidth: 700, margin: '12px auto 0' }}>
            Documento informativo que clarifica la naturaleza, el marco legal aplicable y las limitaciones de los compuestos comercializados a través de este sitio web en territorio chileno.
          </p>
        </div>

        {/* Content Box */}
        <div style={{ background: '#0A0A0A', border: '1px solid #222222', borderRadius: 8, padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: 36, lineHeight: 1.75 }}>
          
          {/* Section 1 */}
          <section>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', color: '#E6E2D3', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              1. Naturaleza de los productos
            </h2>
            <p style={{ color: '#CCCCCC', fontSize: '0.95rem', marginBottom: 12 }}>
              Los compuestos comercializados a través de <strong>NOVA PERFORMANCE®</strong> son productos químicos destinados exclusivamente a investigación científica (<em>“research use only” / “research compounds”</em>). Bajo dicho marco internacional:
            </p>
            <ul style={{ paddingLeft: 24, color: '#AAAAAA', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><strong>NO</strong> son medicamentos conforme al D.S. Nº 3/2010 del Ministerio de Salud y al Código Sanitario chileno.</li>
              <li><strong>NO</strong> son productos cosméticos bajo el D.S. Nº 239/2002.</li>
              <li><strong>NO</strong> son suplementos alimenticios ni alimentos de uso médico.</li>
              <li><strong>NO</strong> son dispositivos médicos.</li>
            </ul>
            <p style={{ color: '#AAAAAA', fontSize: '0.9rem', marginTop: 12 }}>
              Por su naturaleza de compuestos para investigación, no se encuentran sujetos al régimen de registro sanitario que regula los productos farmacéuticos, cosméticos o alimenticios destinados al consumo humano.
              No se realizan claims terapéuticos, médicos ni cosméticos sobre estos compuestos, ni se comercializan como sustitutos de productos farmacéuticos.
            </p>
          </section>

          <hr style={{ borderColor: '#1E1E1E' }} />

          {/* Section 2 */}
          <section>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', color: '#E6E2D3', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              2. Uso autorizado
            </h2>
            <p style={{ color: '#CCCCCC', fontSize: '0.95rem', marginBottom: 12 }}>
              Los compuestos están destinados exclusivamente a:
            </p>
            <ul style={{ paddingLeft: 24, color: '#AAAAAA', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Investigación científica en laboratorios.</li>
              <li>Estudios in vitro (cultivos celulares, líneas celulares).</li>
              <li>Estudios in vivo en modelos animales bajo protocolos de bioética.</li>
              <li>Educación científica, formación académica y desarrollo profesional.</li>
              <li>Caracterización analítica y referencia química.</li>
            </ul>
          </section>

          <hr style={{ borderColor: '#1E1E1E' }} />

          {/* Section 3 */}
          <section>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', color: '#E6E2D3', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              3. Uso NO autorizado
            </h2>
            <p style={{ color: '#CCCCCC', fontSize: '0.95rem', marginBottom: 12 }}>
              No se autoriza, recomienda, induce, sugiere ni respalda el uso de estos compuestos para:
            </p>
            <ul style={{ paddingLeft: 24, color: '#AAAAAA', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Consumo humano bajo cualquier vía de administración.</li>
              <li>Auto-administración con fines terapéuticos, estéticos, deportivos o de rendimiento.</li>
              <li>Sustitución de tratamientos médicos prescritos.</li>
              <li>Diagnóstico, prevención, tratamiento, cura o mitigación de enfermedades.</li>
              <li>Aplicación cosmética sobre la piel humana.</li>
              <li>Reventa, redistribución o reenvasado como producto distinto.</li>
            </ul>
          </section>

          <hr style={{ borderColor: '#1E1E1E' }} />

          {/* Section 4 */}
          <section>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', color: '#E6E2D3', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              4. Declaración del comprador
            </h2>
            <p style={{ color: '#CCCCCC', fontSize: '0.95rem', marginBottom: 12 }}>
              Al adquirir compuestos a través de <strong>NOVA PERFORMANCE®</strong>, el comprador declara y garantiza expresamente:
            </p>
            <ul style={{ paddingLeft: 24, color: '#AAAAAA', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Ser mayor de 18 años.</li>
              <li>Ser investigador, profesional científico, o adquirente con fines de investigación exclusivamente.</li>
              <li>Adquirir el producto bajo el marco <em>“research use only”</em> y <strong>NO</strong> para consumo humano.</li>
              <li>Asumir total y exclusiva responsabilidad sobre el uso, manipulación, almacenamiento y disposición final del producto.</li>
              <li>Liberar de toda responsabilidad civil, penal o administrativa derivada de usos no autorizados.</li>
              <li>Comprender que no se entregan protocolos médicos, dosificación para humanos, ni asesoría terapéutica.</li>
            </ul>
          </section>

          <hr style={{ borderColor: '#1E1E1E' }} />

          {/* Section 5 */}
          <section>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', color: '#E6E2D3', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              5. Garantías de calidad
            </h2>
            <p style={{ color: '#CCCCCC', fontSize: '0.95rem', marginBottom: 12 }}>
              Se garantiza, exclusivamente respecto de las características analíticas del producto entregado:
            </p>
            <ul style={{ paddingLeft: 24, color: '#AAAAAA', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Pureza química superior al 99% verificada por HPLC.</li>
              <li>Certificado de Análisis (COA) por lote, disponible bajo solicitud.</li>
              <li>Procesos de envasado bajo estándares ISO 22716 / GMP.</li>
              <li>Trazabilidad documental del lote.</li>
            </ul>
            <p style={{ color: '#888888', fontSize: '0.85rem', marginTop: 12 }}>
              Estas garantías se refieren exclusivamente a la composición química del compuesto, NO a su seguridad, eficacia o aptitud para uso humano, los cuales no han sido evaluados ni aprobados.
            </p>
          </section>

          <hr style={{ borderColor: '#1E1E1E' }} />

          {/* Section 6 */}
          <section>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', color: '#E6E2D3', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              6. Marco normativo aplicable
            </h2>
            <ul style={{ paddingLeft: 24, color: '#AAAAAA', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Código Sanitario chileno y modificaciones (Ley Nº 20.724).</li>
              <li>D.S. Nº 3/2010 — Reglamento del Sistema Nacional de Control de Productos Farmacéuticos.</li>
              <li>D.S. Nº 239/2002 — Reglamento de Productos Cosméticos.</li>
              <li>Ley Nº 19.496 — Sobre Protección de los Derechos del Consumidor.</li>
              <li>Ley Nº 19.628 — Sobre Protección de la Vida Privada.</li>
            </ul>
          </section>

          <hr style={{ borderColor: '#1E1E1E' }} />

          {/* Section 7 */}
          <section>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', color: '#E6E2D3', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              7. Contacto
            </h2>
            <p style={{ color: '#CCCCCC', fontSize: '0.95rem' }}>
              Para consultas formales sobre el marco regulatorio: <a href="mailto:Cnovoadrust@gmail.com" style={{ color: '#E6E2D3', textDecoration: 'underline' }}>Cnovoadrust@gmail.com</a>
            </p>
          </section>

        </div>

        {/* Footer Note */}
        <div style={{ textAlign: 'center', marginTop: 40, color: '#666666', fontSize: '0.8rem' }}>
          Documento de carácter informativo. No constituye asesoría legal. Última actualización: mayo de 2026.
        </div>

      </div>
    </main>
  );
}
