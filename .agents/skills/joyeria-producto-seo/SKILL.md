---
name: joyeria-producto-seo
description: Guía y estándar para la optimización de imágenes, fichas técnicas y títulos SEO para el catálogo de productos de Amora Jewelry.
---

# Skill: Optimización de Productos e Imágenes de Amora Jewelry

Esta Skill define los estándares de diseño, SEO y optimización técnica para el ingreso de nuevos productos y procesamiento de imágenes en el e-commerce de **Amora Jewelry**.

---

## 1. Reglas de Presentación de Productos (Títulos y Fichas Técnicas)

Cada vez que el usuario suba la fotografía de un producto para catálogo, se debe responder con el siguiente formato exacto:

### 📌 Nombre del Producto (Optimizado para Google / SEO)
- **Nombre Principal (Google):** `[Tipo de Joya] + [Material/Acabado] - [Diseño/Características]`
- **Nombre Corto (Tienda):** Versión concisa para la cuadrícula del catálogo.

### 📐 Ficha Técnica / Especificaciones
- **Producto:** Categoría exacta (Cadena / Collar / Anillo / Pulsera / Aros).
- **Material:** Especificación del material noble (Plata, Acero Inoxidable, Baño de Oro 18K, etc.).
- **Diseño / Piedras:** Detalles del tejido o grabado (ej: *Paperclip*, *Rolo*, *Cuban*, *Girasol Escultórico*, etc.).
- **Acabado:** Pulido espejo, satinado, brillante.
- **Tipo de Cierre:** Mosquetón reforzado, cierre mariposa, etc.
- **Talla:** 
  - **Para Anillos:** `Talla Única (Ajustables)`
  - **Para Cadenas, Pulseras y Aros:** `Talla Única`
- **Género:** Unisex / Femenino.
- **Estilo:** Estilo de moda (Chunky, Atemporal, Minimalista, Layering).

---

## 🚨 REGLAS MANDATORIAS
1. **PROHIBIDO poner precios** en las respuestas de fichas técnicas o sugerencias a menos que el usuario lo solicite explícitamente.
2. **PROHIBIDO incluir dimensiones o medidas numéricas en mm/cm** (diámetros, grosores o largos en milímetros). Utilizar siempre **Talla Única**.

---

## 2. Estándares Técnicos para Imágenes y Responsive Web

1. **Auto-Compresión en Cliente:**
   - Toda imagen subida desde el modal de administración debe ser comprimida en el navegador usando Canvas a formato `image/webp` con calidad `0.85` y tamaño máximo de `1400px`.
   - Garantiza payloads `< 300KB` para evitar el error `HTTP 413 Payload Too Large` de Vercel.

2. **Containment Responsive (object-fit: contain):**
   - En vistas de detalle de producto (`/product/[id]`) y tarjetas de catálogo (`ProductCard`), las imágenes deben usar `object-fit: contain` dentro de contenedores con `min-width: 0` y `width: 100%`.
   - Esto evita recortes indeseados en cadenas largas, aros o pulseras, y previene cualquier solapamiento de la imagen sobre los textos.

3. **Navegación Móvil y Viewport Overflow:**
   - La propiedad `html, body` debe mantener `max-width: 100vw` y `overflow-x: hidden` para evitar desplazamientos horizontales y espacios en blanco en dispositivos móviles.
   - En pantallas reducidas (`< 900px`), el encabezado debe colapsar en un **Menú Hamburguesa (Drawer Off-Canvas)** con acceso rápido al catálogo, bolsa de compras y sesión de usuario.
