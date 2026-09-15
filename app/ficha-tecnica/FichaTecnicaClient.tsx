"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const productos = [
  { ficha: "01", sku: "RT10", nombre: "Retatrutide 10mg", categoria: "Péptidos GLP-1 / Triagonistas", especificacion: "10mg × 1 Vial liofilizado", clase: "Péptido Triagonista (GLP-1 / GIP / Glucagón)", evidencia: "Alta (Fase III)", fichaImg: "/fichas/RT10.jpeg" },
  { ficha: "02", sku: "RT20", nombre: "Retatrutide 20mg", categoria: "Péptidos GLP-1 / Triagonistas", especificacion: "20mg × 1 Vial liofilizado", clase: "Péptido Triagonista (GLP-1 / GIP / Glucagón)", evidencia: "Alta (Fase III)", fichaImg: "/fichas/RT20.jpeg" },
  { ficha: "03", sku: "CU100", nombre: "GHK-Cu 100mg", categoria: "Péptidos Regenerativos & Anti-Aging", especificacion: "100mg × 1 Vial liofilizado", clase: "Tripéptido de Cobre (Cu²⁺)", evidencia: "Alta (Dermatología / Tisular)", fichaImg: "/fichas/CU100.jpeg" },
  { ficha: "04", sku: "BC10", nombre: "BPC-157 10mg", categoria: "Péptidos Regenerativos", especificacion: "10mg × 1 Vial liofilizado", clase: "Pentadecapéptido de Protección Gástrica", evidencia: "Alta (Extensa Literatura Preclínica)", fichaImg: "/fichas/BC10.jpeg" },
  { ficha: "05", sku: "MS10", nombre: "MOTS-c 10mg", categoria: "Péptidos Mitocondriales", especificacion: "10mg × 1 Vial liofilizado", clase: "Péptido Mitocondrial (ADNmt)", evidencia: "Alta (Metabolismo / Longevidad)", fichaImg: "/fichas/MS10.jpeg" },
  { ficha: "06", sku: "TSM10", nombre: "Tesamorelin 10mg", categoria: "Péptidos GHRH", especificacion: "10mg × 1 Vial liofilizado", clase: "Análogo Sintético GHRH", evidencia: "Alta (FDA Aprobado HIV-LD)", fichaImg: "/fichas/TSM10.jpeg" },
  { ficha: "07", sku: "TSM20", nombre: "Tesamorelin 20mg", categoria: "Péptidos GHRH", especificacion: "20mg × 1 Vial liofilizado", clase: "Análogo Sintético GHRH — Alto Rendimiento", evidencia: "Alta (FDA Aprobado HIV-LD)", fichaImg: "/fichas/TSM20.jpeg" },
  { ficha: "08", sku: "CJCIP", nombre: "CJC-1295 sin DAC + Ipamorelin 10mg", categoria: "Péptidos GHRH / GHRP", especificacion: "10mg × 1 Vial liofilizado (Blend Sinérgico)", clase: "Stack GHRH + GHRP (Secretagogo Dual GH)", evidencia: "Alta (Literatura Clínica Combinada)", fichaImg: "/fichas/CJCIP.jpeg" },
  { ficha: "09", sku: "BAC10", nombre: "Agua Bacteriostática 3ml", categoria: "Accesorios / Solventes", especificacion: "3ml × 1 Vial estéril", clase: "Solvente Estéril (Alcohol Bencílico 0.9%)", evidencia: "Grado Farmacéutico USP", fichaImg: "/fichas/BAC10.jpeg" },
];

const categorias = [
  {
    label: "Péptidos GLP-1 / Triagonistas",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
      </svg>
    ),
  },
  {
    label: "Péptidos Regenerativos & Anti-Aging",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
    ),
  },
  {
    label: "Péptidos Mitocondriales",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
  {
    label: "Péptidos GHRH / GHRP",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
      </svg>
    ),
  },
  {
    label: "Accesorios / Solventes",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
      </svg>
    ),
  },
];

type Producto = typeof productos[number];

export default function FichaTecnicaClient() {
  const [modalProducto, setModalProducto] = useState<Producto | null>(null);

  const openModal = useCallback((p: Producto) => {
    setModalProducto(p);
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setModalProducto(null);
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeModal]);

  return (
    <>
      <style>{`
        .ft-hero-vid { display: block; }
        .ft-hero-vid-mobile { display: none; }

        /* ── Mobile ─────────────────── */
        @media (max-width: 768px) {
          .ft-hero-vid { display: none !important; }
          .ft-hero-vid-mobile { display: block !important; }
          .ft-hero-section { min-height: 56vh !important; padding: 48px 16px 40px !important; }
          .ft-hero-title { font-size: 2rem !important; }
          .ft-download-btn { font-size: 0.72rem !important; padding: 12px 18px !important; gap: 7px !important; }

          /* Categorías: scroll horizontal en mobile */
          .ft-categorias-wrap {
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            justify-content: flex-start !important;
            padding-bottom: 4px;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .ft-categorias-wrap::-webkit-scrollbar { display: none; }
          .ft-categoria-chip { flex-shrink: 0 !important; padding: 6px 12px !important; font-size: 0.72rem !important; }

          .ft-intro-text { font-size: 0.88rem !important; padding: 0 16px !important; }
          .ft-listado-section { padding: 0 12px !important; margin-top: 28px !important; }

          /* Producto row — en mobile se convierte en tarjeta vertical */
          .ft-producto-row {
            grid-template-columns: 44px 1fr auto !important;
            grid-template-rows: auto auto !important;
            gap: 10px 12px !important;
            padding: 14px 14px !important;
          }
          /* Ocultar columnas no esenciales en mobile */
          .ft-col-especificacion { display: none !important; }
          .ft-col-sku { display: none !important; }

          /* Botón Ver Ficha */
          .ft-btn-ficha {
            font-size: 0.66rem !important;
            padding: 8px 10px !important;
            gap: 5px !important;
            white-space: nowrap !important;
          }

          /* Modal mobile */
          .ft-modal-inner {
            max-width: 96vw !important;
            border-radius: 10px !important;
          }
          .ft-modal-img-wrap {
            max-height: 62vh !important;
          }
        }

        /* ── Extra pequeño (< 400px) ── */
        @media (max-width: 400px) {
          .ft-producto-row {
            grid-template-columns: 40px 1fr !important;
            grid-template-rows: auto auto !important;
          }
          .ft-btn-col {
            grid-column: 1 / -1 !important;
            text-align: left !important;
          }
          .ft-btn-ficha { width: 100% !important; justify-content: center !important; }
        }

        /* ── Hover / interacciones ─── */
        .ft-producto-row:hover { border-color: #374151 !important; box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important; }
        .ft-download-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .ft-btn-ficha:hover { background: #1F2937 !important; }
        @keyframes ftFadeIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }

        /* ── Tap targets touch ──────── */
        @media (hover: none) and (pointer: coarse) {
          .ft-btn-ficha { min-height: 40px; }
          .ft-download-btn { min-height: 48px; }
        }
      `}</style>

      {/* ── HERO CON FONDO VIDEO ────────────────────────── */}
      <section className="ft-hero-section" style={{
        position: "relative", minHeight: "72vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "80px 20px 70px", textAlign: "center",
        overflow: "hidden", background: "#0D0D0D",
      }}>
        {/* Video desktop */}
        <video
          className="ft-hero-vid"
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center",
          }}
        >
          <source src="https://res.cloudinary.com/ddqx435i5/video/upload/v1788647706/fondo_escritorio_tvgcjl.mp4" type="video/mp4" />
        </video>
        {/* Video mobile */}
        <video
          className="ft-hero-vid-mobile"
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center top",
          }}
        >
          <source src="https://res.cloudinary.com/ddqx435i5/video/upload/v1788647706/movil_nfhejf.mp4" type="video/mp4" />
        </video>
        {/* Overlay oscuro sobre el video */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.68) 60%, rgba(0,0,0,0.82) 100%)",
        }} />

        {/* Contenido */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, width: "100%" }}>
          <div style={{ marginBottom: 28 }}>
            <Link href="/" style={{
              color: "#9CA3AF", textDecoration: "none",
              fontFamily: "Outfit, sans-serif", fontSize: "0.75rem",
              fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Volver al sitio
            </Link>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <Image src="/logo-nova-white.png" alt="NOVA Performance" width={210} height={46} style={{ objectFit: "contain" }} priority />
          </div>

          <p style={{
            color: "#9CA3AF", fontFamily: "Outfit, sans-serif",
            fontSize: "0.72rem", letterSpacing: "0.32em",
            textTransform: "uppercase", fontWeight: 700, marginBottom: 10,
          }}>Documentación Técnica Oficial</p>

          <h1 className="ft-hero-title" style={{
            fontFamily: "Outfit, sans-serif", fontWeight: 900,
            fontSize: "clamp(2.4rem, 7vw, 4rem)", color: "#FFFFFF",
            textTransform: "uppercase", letterSpacing: "0.06em",
            lineHeight: 1.05, marginBottom: 8,
          }}>
            Ficha Técnica
          </h1>
          <p style={{
            color: "#9CA3AF", fontFamily: "Outfit, sans-serif",
            fontWeight: 300, fontSize: "clamp(0.85rem, 2vw, 1.05rem)",
            letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 28,
          }}>
            de Productos
          </p>

          {/* Badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
            {[
              { label: "Péptidos de Alta Pureza", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg> },
              { label: "Uso Exclusivo Investigación (RUO)", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
              { label: "9 Productos Documentados", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
            ].map(b => (
              <span key={b.label} style={{
                background: "rgba(156,163,175,0.12)", border: "1px solid rgba(156,163,175,0.28)",
                color: "#D1D5DB", fontFamily: "Inter, sans-serif",
                fontSize: "0.71rem", padding: "5px 14px", borderRadius: 4,
                letterSpacing: "0.05em", fontWeight: 500,
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                {b.icon}{b.label}
              </span>
            ))}
          </div>

          {/* Botón Descarga PDF */}
          <a
            className="ft-download-btn"
            href="/fichas/ficha-tecnica-nova.pdf"
            download="Ficha_Tecnica_NOVA_Performance.pdf"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "#FFFFFF", color: "#0D0D0D",
              fontFamily: "Outfit, sans-serif", fontWeight: 800,
              fontSize: "0.82rem", letterSpacing: "0.12em",
              textTransform: "uppercase", textDecoration: "none",
              padding: "15px 34px", borderRadius: 6,
              boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
              transition: "all 0.25s ease",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Descargar Ficha Técnica NOVA Performance®
          </a>
          <p style={{ color: "#6B7280", fontFamily: "Inter, sans-serif", fontSize: "0.68rem", marginTop: 10 }}>
            PDF completo con todas las fichas técnicas
          </p>
        </div>
      </section>

      {/* ── CATEGORÍAS ─────────────────────────────────── */}
      <section style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E7EB", padding: "24px 20px" }}>
        <div className="ft-categorias-wrap" style={{ maxWidth: 1000, margin: "0 auto", display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {categorias.map(c => (
            <div key={c.label} className="ft-categoria-chip" style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#F3F4F6", border: "1px solid #E5E7EB",
              borderRadius: 6, padding: "8px 16px",
              fontFamily: "Inter, sans-serif", fontSize: "0.78rem",
              fontWeight: 600, color: "#374151",
            }}>
              <span style={{ color: "#1F2937", display: "flex" }}>{c.icon}</span>
              <span>{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTRO ──────────────────────────────────────── */}
      <section style={{ maxWidth: 800, margin: "48px auto 0", textAlign: "center" }}>
        <p className="ft-intro-text" style={{ fontFamily: "Inter, sans-serif", fontSize: "0.97rem", lineHeight: 1.85, color: "#4B5563" }}>
          Documentación técnica oficial de los productos del catálogo de{" "}
          <strong style={{ color: "#0D0D0D" }}>NOVA Performance®</strong>.
          Haz clic en <strong style={{ color: "#0D0D0D" }}>"Ver Ficha"</strong> para revisar
          la especificación completa de cada producto directamente en el sitio.
        </p>
      </section>

      {/* ── LISTADO ─────────────────────────────────────── */}
      <section className="ft-listado-section" style={{ maxWidth: 1040, margin: "40px auto 64px", padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 10, borderBottom: "2px solid #E5E7EB" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
          </svg>
          <h2 style={{
            fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1rem",
            textTransform: "uppercase", letterSpacing: "0.18em", color: "#1F2937", margin: 0,
          }}>Listado Oficial de Productos</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {productos.map((p) => (
            <div key={p.sku} className="ft-producto-row" style={{
              background: "#FFFFFF", border: "1px solid #E5E7EB",
              borderRadius: 10, padding: "16px 22px",
              display: "grid",
              gridTemplateColumns: "52px 1fr 1fr 120px 160px",
              alignItems: "center", gap: 16,
              boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}>
              {/* Badge ficha */}
              <div style={{
                background: "#0D0D0D", color: "#FFFFFF",
                fontFamily: "Outfit, sans-serif", fontWeight: 900,
                fontSize: "0.65rem", letterSpacing: "0.12em",
                textAlign: "center", borderRadius: 6,
                padding: "8px 4px", lineHeight: 1.3,
              }}>
                FICHA<br />{p.ficha}
              </div>

              {/* Nombre + clase */}
              <div>
                <p style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "0.97rem", color: "#0D0D0D", margin: "0 0 3px" }}>
                  {p.nombre}
                </p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.74rem", color: "#6B7280", margin: 0 }}>
                  {p.clase}
                </p>
              </div>

              {/* Especificación */}
              <div className="ft-col-especificacion">
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.8rem", color: "#374151", fontWeight: 600, margin: "0 0 3px" }}>
                  {p.especificacion}
                </p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem", color: "#9CA3AF", margin: 0 }}>
                  {p.categoria}
                </p>
              </div>

              {/* SKU + evidencia */}
              <div className="ft-col-sku" style={{ textAlign: "center" }}>
                <span style={{
                  background: "#F3F4F6", border: "1px solid #E5E7EB",
                  borderRadius: 4, padding: "4px 10px",
                  fontFamily: "Outfit, sans-serif", fontWeight: 800,
                  fontSize: "0.74rem", color: "#1F2937",
                  letterSpacing: "0.1em", display: "block", marginBottom: 5,
                }}>{p.sku}</span>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.63rem", color: "#059669", fontWeight: 600 }}>
                  {p.evidencia}
                </span>
              </div>

              {/* Botón */}
              <div style={{ textAlign: "right" }}>
                <button
                  className="ft-btn-ficha"
                  onClick={() => openModal(p)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    background: "#0D0D0D", color: "#FFFFFF",
                    fontFamily: "Outfit, sans-serif", fontWeight: 700,
                    fontSize: "0.71rem", letterSpacing: "0.08em",
                    textTransform: "uppercase", border: "none", cursor: "pointer",
                    padding: "9px 14px", borderRadius: 6,
                    whiteSpace: "nowrap", transition: "background 0.2s",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  Ver Ficha
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <section style={{ background: "#0D0D0D", color: "#9CA3AF", padding: "44px 20px", textAlign: "center" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <Image src="/logo-nova-white.png" alt="NOVA Performance" width={150} height={34}
            style={{ objectFit: "contain", opacity: 0.55, marginBottom: 20 }} />
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.77rem", lineHeight: 1.75, marginBottom: 20 }}>
            Todos los productos NOVA Performance® son de uso exclusivo en investigación científica
            (RUO — Research Use Only). No destinados al consumo humano directo ni uso terapéutico.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
            {[
              { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>, label: "www.novaperformance.cl" },
              { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>, label: "@nova.performance.cl" },
              { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/></svg>, label: "Despacho a todo Chile" },
            ].map(i => (
              <span key={i.label} style={{ fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ display: "flex" }}>{i.icon}</span>{i.label}
              </span>
            ))}
          </div>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.66rem", marginTop: 28, color: "#374151" }}>
            © 2025 NOVA Performance® — Todos los derechos reservados.
          </p>
        </div>
      </section>

      {/* ── MODAL LIGHTBOX ──────────────────────────────── */}
      {modalProducto && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.90)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px", backdropFilter: "blur(8px)",
            animation: "ftFadeIn 0.2s ease",
          }}
        >
          <div
            className="ft-modal-inner"
            onClick={e => e.stopPropagation()}
            style={{
              position: "relative", maxWidth: 500, width: "100%",
              borderRadius: 12, overflow: "hidden",
              boxShadow: "0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.07)",
            }}
          >
            {/* Header */}
            <div style={{
              background: "#0D0D0D", padding: "13px 18px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: "1px solid #1F2937",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  background: "#1F2937", color: "#9CA3AF",
                  fontFamily: "Outfit, sans-serif", fontWeight: 900,
                  fontSize: "0.6rem", letterSpacing: "0.12em",
                  borderRadius: 4, padding: "5px 7px", lineHeight: 1.3, textAlign: "center",
                }}>FICHA<br />{modalProducto.ficha}</div>
                <div>
                  <p style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "0.92rem", color: "#FFFFFF", margin: 0 }}>
                    {modalProducto.nombre}
                  </p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.68rem", color: "#6B7280", margin: 0 }}>
                    {modalProducto.sku} · {modalProducto.categoria}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                title="Cerrar (ESC)"
                style={{
                  background: "#1F2937", border: "1px solid #374151",
                  color: "#9CA3AF", borderRadius: 6, width: 32, height: 32,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Imagen */}
            <div style={{ background: "#111", position: "relative", maxHeight: "72vh", overflowY: "auto" }}>
              <img
                src={modalProducto.fichaImg}
                alt={`Ficha Técnica ${modalProducto.nombre}`}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>

            {/* Footer modal */}
            <div style={{
              background: "#0D0D0D", padding: "11px 18px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderTop: "1px solid #1F2937",
            }}>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.66rem", color: "#4B5563", margin: 0, display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Uso exclusivo en investigación (RUO)
              </p>
              <a
                href={modalProducto.fichaImg}
                download={`Ficha_${modalProducto.sku}_NOVA.jpeg`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "#FFFFFF", color: "#0D0D0D",
                  fontFamily: "Outfit, sans-serif", fontWeight: 700,
                  fontSize: "0.66rem", letterSpacing: "0.08em",
                  textTransform: "uppercase", textDecoration: "none",
                  padding: "7px 14px", borderRadius: 5,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Descargar
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
