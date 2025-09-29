# Clarbi · Campaigns Workspace

Clarbi es una aplicación full-stack pensada para partners de Genesy. A partir de la transcripción de la discovery call con
el cliente, genera un perfil canónico estructurado y los paquetes de prompts dinámicos necesarios para campañas de
prospección como **Lookalike** (email 1 basado en casos de éxito) y **Creative Ideas** (secuencia de 3 emails). El resultado
se entrega como JSON y como interfaz visual en un dashboard inspirado en Canva.

## Estructura

- `apps/backend`: API Fastify.
  - `POST /ingest` → extrae el `client_profile` canónico usando el meta-prompt extractor.
  - `GET /campaigns` → devuelve las campañas soportadas y su identificador.
  - `POST /campaigns/:campaignId/generate` → genera los prompts por línea para la campaña seleccionada (Lookalike, Creative Ideas, ...).
  - `GET /campaigns/:id/prompts?profile_id=` → recupera el último paquete guardado.
- `apps/frontend`: Next.js (App Router). Dashboard Clarbi con navegación lateral, cards y flujos por pasos.

## Puesta en marcha

1. Instala dependencias
   ```bash
   npm install
   npm install --prefix apps/backend
   npm install --prefix apps/frontend
   ```

2. Configura variables de entorno
   Crea `apps/backend/.env` con:
   ```env
   OPENAI_API_KEY=sk-...
   PORT=4000
   HOST=0.0.0.0
   OPENAI_MODEL_EXTRACTOR=gpt-4o-mini
   OPENAI_MODEL_PROMPT_BUILDER=gpt-4o-mini
   ```

3. Arranca el backend (Fastify)
   ```bash
   npm run dev --prefix apps/backend
   ```

4. Arranca el frontend (Next.js)
   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:4000 npm run dev --prefix apps/frontend
   ```

El frontend se sirve en `http://localhost:3000` (o el puerto disponible) y consume la API local.

## Flujo de uso

1. En el módulo **Discovery Transcript** pega la conversación, notas y contexto. Pulsa “Generar perfil Clarbi”.
2. Revisa el **Perfil Clarbi** (oferta, value props, ICP, pruebas, client_summary). Ajusta si es necesario.
3. Selecciona la campaña que quieras ejecutar (por defecto **Lookalike**) y pulsa “Generar prompts ...”. Revisa el módulo **Prompts listos para Genesy**.
4. Copia cada prompt individual o el JSON completo y pégalo en Genesy.

El perfil Clarbi extrae además:

- Caso de éxito principal (nombre, industria, tamaño, empresas similares).
- Problema detectado, solución aplicada y fases clave del proyecto.
- Resultados generales y métricos del caso de éxito.
- Buyer persona resumido, oferta, value props e ICP estructurado.

## Especificación Lookalike (resumen)

Primer email orientado a activar conversación a través de un caso de éxito relevante:

- `Lookalike | E1.1` → Conexión “Vi en vuestra web…” + cliente parecido.
- `Lookalike | E1.2` → Problema resuelto y cómo lo solucionamos.
- `Lookalike | E1.3` → Resultados generales y métricos.
- `Lookalike | E1.4` → CTA “Si te cuento…” con el mensaje a testear.
- `Lookalike | E2.1` → Gancho “He visto que…” conectando caso de éxito o competencia.
- `Lookalike | E2.2` → Aporte clave #1 en lista (acción concreta).
- `Lookalike | E2.3` → Aporte clave #2 en lista (acción complementaria).
- `Lookalike | E2.4` → Aporte clave #3 en lista (beneficio operativo).
- `Lookalike | E2.5` → CTA “Si te cuento…” orientada a mostrar el proceso.
- `Lookalike | E3.1` → Recordatorio con variación del cierre “pensé / creí que podía ser útil”.
- `Lookalike | E3.2` → Pregunta de seguimiento (“¿Has leído…?” / “¿Has visto…?”).

## Especificación Creative Ideas (resumen)

Cada prompt generado incluye misión, instrucciones, fuente (Industrial Data) y formato de salida. Variables cubiertas:

- `HR-Industriales | Creative Ideas E1.1` → Apertura “Viendo vuestra web…”
- `HR-Industriales | Creative Ideas E1.2` → Idea formativa 1
- `HR-Industriales | Creative Ideas E1.3` → Idea formativa 2
- `HR-Industriales | Creative Ideas E1.4` → Idea formativa 3
- `HR Industriales | E2` → Comparación sectorial
- `HR Industriales | E3` → Routing por rol

El `client_profile` incorpora `client_summary`: un resumen extendido de lo que ofrece nuestro cliente (no confundir con
`Industrial Data`, que Genesy aporta sobre el prospecto durante la ejecución). Las líneas estáticas y variables estándar
(ej. `{Simplified First Name}`) no se tocan desde la aplicación.

## Testing manual recomendado

- Endpoint `/health` responde `{ status: 'ok' }`.
- `POST /ingest` con la transcripción de ejemplo en `specs/` devuelve JSON válido y establece valores por defecto de tono.
- `POST /campaigns/lookalike/generate` con el `profile_id` devuelto entrega 11 prompts.
- `POST /campaigns/creative-ideas/generate` con el `profile_id` devuelto entrega 6 prompts.
- La UI muestra el perfil, permite copiar el JSON completo y cada prompt individual.

## Extensiones futuras

- Añadir otras campañas (Standard, Follow-ups) creando nuevos specs en `apps/backend/src/specs` y registrando su builder.
- Persistencia real (SQLite/Postgres) o colas si se procesan lotes grandes.
- Validadores adicionales (lint de palabras prohibidas, recuento de tokens) antes de entregar el paquete.
- Vista de previsualización del email ensamblado con líneas estáticas + placeholders Genesy.
