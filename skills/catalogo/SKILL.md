---
name: /catalogo
description: Habilidad que automatiza la extracción de datos de productos a partir de imágenes PNG del catálogo, genera un JSON estructurado y crea una web full‑stack (HTML/CSS/JS) usando las skills /dev y /diseño.
---

# 📦 Skill: Extracción y Visualización de Catálogo (/catalogo)

Esta skill se activa cuando el usuario necesita transformar el contenido visual del **Catálogo Productos del Alma** (archivos PNG en `D:\joyeria\Catalogo`) en datos estructurados y una interfaz web premium.

## Flujo de Trabajo
1. **Escaneo de imágenes** – Recorre todos los `*.PNG` del directorio.
2. **OCR** – Ejecuta Tesseract (o cualquier OCR disponible) para extraer texto.
3. **Parseo** – Busca en el texto los campos habituales:
   - `title` (línea 1)
   - `code` (líneas que contengan "Código" o similar)
   - `price` (líneas que contengan símbolos de moneda `$`, `CLP`, `USD`)
   - `material`, `category`, `description` (búsqueda por palabras clave).
4. **Generación de JSON** – Crea `catalog.json` con la estructura:
```json
[
  {
    "title": "",
    "code": "",
    "price": "",
    "material": "",
    "category": "",
    "description": "",
    "imagePath": "artifacts/<nombre>.png"
  }
]
```
5. **Frontend** – Usa la skill **/dev** para crear los archivos `index.html`, `styles.css` y `app.js`.
   - Aplica los lineamientos de **/diseño** (paleta dorado‑negro, tipografía Inter/Playfair, glassmorphism, animaciones suaves).
6. **Entrega** – Los artefactos resultantes quedan en `artifacts/` listos para servir.

## Parámetros opcionales (cuando se invoque la skill)
- `batchSize` – Número de imágenes a procesar por ejecución (default = 10).  
- `ocrLang` – Idioma del OCR (default = spa).

## Uso
```
/catalogo batchSize=10 ocrLang=spa
```
El agente ejecutará los pasos anteriores y, al finalizar, mostrará un resumen con:
- Cantidad de productos extraídos.
- Ruta del `catalog.json`.
- Enlaces a los archivos web generados.

---
**Nota:** Si el entorno no tiene Tesseract instalado, la skill avisará y ofrecerá descargar el instalador oficial.
