import { z } from 'zod';
import config from '../config.js';
import { createJsonCompletion } from '../utils/openai.js';

const clientProfileSchema = z.object({
  offer: z.string().trim().optional(),
  value_props: z.array(z.string()).optional(),
  icp: z
    .object({
      company_types: z.array(z.string()).optional(),
      buyer_roles: z.array(z.string()).optional()
    })
    .optional(),
  case_study: z
    .object({
      name: z.string().trim().optional(),
      industry: z.string().trim().optional(),
      company_size: z.string().trim().optional(),
      similar_companies: z.array(z.string()).optional(),
      problem: z.string().trim().optional(),
      solution: z.string().trim().optional(),
      phases: z.array(z.string()).optional(),
      results: z
        .object({
          general: z.array(z.string()).optional(),
          numeric: z.array(z.string()).optional()
        })
        .optional()
    })
    .optional(),
  proof_points: z.array(z.string()).optional(),
  constraints: z
    .object({
      tone: z.string().trim().optional(),
      language: z.string().trim().optional()
    })
    .optional(),
  client_summary: z.string().trim().optional(),
  buyer_persona: z.string().trim().optional()
});

export async function extractClientProfile(packet) {
  if (!config.openai.apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const system = 'Eres un asistente que extrae perfiles de cliente en formato JSON exacto.';

  const transcriptBlock = packet.transcript?.trim() ? packet.transcript.trim() : 'NO TRANSCRIPT PROVIDED';
  const notesBlock = packet.notes?.trim() ? packet.notes.trim() : 'NO NOTES PROVIDED';
  const websiteBlock = packet.website?.trim() ? packet.website.trim() : 'NO WEBSITE PROVIDED';

  const user = `Misión
Extraer de la transcripción de una reunión comercial la información necesaria para construir campañas de prospección (Lookalike, Creative Ideas) en Genesy.

Instrucciones
- Lee la transcripción completa (entre comillas triples) y cruza con las notas/contexto.
- Devuelve un JSON con las claves exactas:
  - offer: cadena.
  - value_props: array de cadenas (propuestas de valor clave).
  - icp: objeto con company_types[] y buyer_roles[].
  - case_study: objeto con
      name,
      industry,
      company_size,
      similar_companies[] (empresas parecidas),
      problem (reto detectado),
      solution (cómo lo resolvimos),
      phases[] (pasos o etapas relevantes),
      results: { general[] (logros cualitativos), numeric[] (métricas o cifras importantes) }.
  - proof_points: array de frases resumidas (opcional, puedes dejarlo vacío si no aporta valor adicional).
  - constraints: { tone, language }.
  - client_summary: resumen operativo amplio (máximo 150 palabras, frases simples).
  - buyer_persona: descripción breve del buyer persona principal (rol, sector, pains).
- Cuando un dato no exista, devuelve null (para cadenas) o array vacío.
- No inventes: solo usa información presente en la transcripción, notas o web.

Contexto adicional
Sitio web: ${websiteBlock}
Notas internas: ${notesBlock}

Transcripción
"""${transcriptBlock}"""

Output
Solo el JSON solicitado, sin comentarios.`;

  const rawProfile = await createJsonCompletion({ system, user });
  const parsed = clientProfileSchema.parse(rawProfile);

  const caseStudy = parsed.case_study ?? {};
  const caseStudyResults = caseStudy.results ?? {};

  const normalizeArray = (value) =>
    Array.isArray(value)
      ? value
          .filter((item) => typeof item === 'string')
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      : [];

  const proofPointsFromCaseStudy = [
    ...normalizeArray(caseStudyResults.general),
    ...normalizeArray(caseStudyResults.numeric)
  ];

  return {
    id: packet.id,
    offer: parsed.offer || null,
    value_props: normalizeArray(parsed.value_props),
    icp: {
      company_types: normalizeArray(parsed.icp?.company_types),
      buyer_roles: normalizeArray(parsed.icp?.buyer_roles)
    },
    case_study: {
      name: caseStudy.name?.trim() || null,
      industry: caseStudy.industry?.trim() || null,
      company_size: caseStudy.company_size?.trim() || null,
      similar_companies: normalizeArray(caseStudy.similar_companies),
      problem: caseStudy.problem?.trim() || null,
      solution: caseStudy.solution?.trim() || null,
      phases: normalizeArray(caseStudy.phases),
      results: {
        general: normalizeArray(caseStudyResults.general),
        numeric: normalizeArray(caseStudyResults.numeric)
      }
    },
    proof_points: normalizeArray(parsed.proof_points).length
      ? normalizeArray(parsed.proof_points)
      : proofPointsFromCaseStudy,
    constraints: {
      tone: parsed.constraints?.tone || 'natural, directo, sin corporativismo',
      language: parsed.constraints?.language || 'es-ES'
    },
    client_summary: parsed.client_summary || '',
    buyer_persona: parsed.buyer_persona?.trim() || null
  };
}
