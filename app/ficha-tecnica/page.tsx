import type { Metadata } from "next";
import FichaTecnicaClient from "./FichaTecnicaClient";

export const metadata: Metadata = {
  title: "Ficha Técnica de Productos | NOVA Performance®",
  description: "Documentación técnica oficial de los péptidos liofilizados de alta pureza de NOVA Performance®. Uso exclusivo en investigación científica (RUO).",
};

export default function FichaTecnicaPage() {
  return (
    <main style={{ background: "#F9FAFB", color: "#0D0D0D", minHeight: "100vh" }}>
      <FichaTecnicaClient />
    </main>
  );
}
