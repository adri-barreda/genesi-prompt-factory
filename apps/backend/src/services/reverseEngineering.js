import { z } from 'zod';
import config from '../config.js';
import { createJsonCompletion } from '../utils/openai.js';

const variableSchema = z.object({
  variable_name: z.string().min(1),
  placeholder: z.string().min(1),
  source_snippet: z.string().min(1),
  goal: z.string().min(1),
  prompt_instructions: z.string().min(1),
  sample_outputs: z.array(z.string().min(1)).optional()
});

const reverseEngineeringSchema = z.object({
  variables: z.array(variableSchema).default([])
});

export async function reverseEngineerEmailVariables(emailBody, { language = 'es-ES' } = {}) {
  if (!config.openai.apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const normalizedEmail = emailBody?.trim();
  if (!normalizedEmail) {
    throw new Error('Email body is required');
  }

  const system =
    'Eres estratega de copywriting especializado en emails de prospección B2B. Devuelves JSON válido, en castellano, sin inventar datos.';

  const user = `Misión
Analizar el siguiente email base y deducir las variables dinámicas para construir prompts de Genesy.

Email base
"""${normalizedEmail}"""

Instrucciones
- Detecta cada variable expresada con llaves {}, por ejemplo {variable}.
- Para cada variable, crea un bloque que explique cómo generar su contenido.
- Usa nombres en snake_case para variable_name.
- Describe con precisión qué debe producirse en goal y en prompt_instructions. Incluye tono, fuentes permitidas (Industrial Data, contexto del cliente, notas internas) y límites relevantes.
- Crea sample_outputs con 3 ejemplos realistas, sin inventar datos que contradigan el email. Mantén el idioma ${language}.
- Si una variable es puramente técnica (ej. {simplified_name}), limita el goal a describir el dato y deja sample_outputs vacío.
- No repitas bloques ni omitas variables.

Formato de salida JSON
{
  "variables": [
    {
      "variable_name": "...",
      "placeholder": "...",
      "source_snippet": "...",
      "goal": "...",
      "prompt_instructions": "...",
      "sample_outputs": ["..."]
    }
  ]
}

Devuelve solo el JSON solicitado.`;

  const rawResult = await createJsonCompletion({ system, user });
  const parsed = reverseEngineeringSchema.parse(rawResult);

  return {
    variables: parsed.variables.map((variable) => ({
      ...variable,
      sample_outputs: variable.sample_outputs ?? []
    }))
  };
}
