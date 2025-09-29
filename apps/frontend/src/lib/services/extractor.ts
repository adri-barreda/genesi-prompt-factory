import { z } from 'zod';
import { createJsonCompletion } from '../openai';

const clientProfileSchema = z.object({
  offer: z.string().trim().optional(),
  value_props: z.array(z.string()).optional(),
  icp: z
    .object({
      company_types: z.array(z.string()).optional(),
      buyer_roles: z.array(z.string()).optional()
    })
    .optional(),
  proof_points: z.array(z.string()).optional(),
  constraints: z
    .object({
      tone: z.string().trim().optional(),
      language: z.string().trim().optional()
    })
    .optional(),
  data_sources: z
    .object({
      industrial_data: z.string().trim().optional()
    })
    .optional()
});

export async function extractClientProfile(packet: {
  id: string;
  transcript: string;
  client_name?: string;
  website?: string;
  notes?: string;
}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const system = 'Eres un asistente que extrae perfiles de cliente en formato JSON exacto.';

  const transcriptBlock = packet.transcript?.trim() ? packet.transcript.trim() : 'NO TRANSCRIPT PROVIDED';
  const notesBlock = packet.notes?.trim() ? packet.notes.trim() : 'NO NOTES PROVIDED';
  const websiteBlock = packet.website?.trim() ? packet.website.trim() : 'NO WEBSITE PROVIDED';

  const user = `Misión
Extraer de la transcripción de una reunión comercial la información necesaria para construir campañas de prospección (Creative Ideas) en Genesi.

Instrucciones
- Lee la transcripción completa (entre comillas triples).
- Devuelve un JSON con las claves exactas: offer, value_props[], icp{company_types[], buyer_roles[]}, proof_points[], constraints{tone, language}, data_sources{industrial_data}.
- industrial_data: redacta un resumen operativo de qué hace el prospecto, sectores clave, procesos, productos/servicios y señales relevantes (máx. 120 palabras, frases simples).
- No inventes. Si falta algún dato, deja array vacío o null.

Contexto adicional
Sitio web: ${websiteBlock}
Notas internas: ${notesBlock}

Transcripción
"""${transcriptBlock}"""

Output
Solo el JSON solicitado, sin comentarios.`;

  const rawProfile = await createJsonCompletion({ system, user });
  const parsed = clientProfileSchema.parse(rawProfile);

  return {
    id: packet.id,
    offer: parsed.offer || null,
    value_props: parsed.value_props || [],
    icp: {
      company_types: parsed.icp?.company_types || [],
      buyer_roles: parsed.icp?.buyer_roles || []
    },
    proof_points: parsed.proof_points || [],
    constraints: {
      tone: parsed.constraints?.tone || 'natural, directo, sin corporativismo',
      language: parsed.constraints?.language || 'es-ES'
    },
    data_sources: {
      industrial_data: parsed.data_sources?.industrial_data || ''
    }
  };
}
