import { z } from 'zod';
import config from '../config.js';
import { createJsonCompletion } from '../utils/openai.js';

function extractPlaceholderSnippets(email) {
  const placeholders = [];
  const seen = new Set();
  const regex = /\{([^{}]+)\}/g;
  let match;

  while ((match = regex.exec(email)) !== null) {
    const fullPlaceholder = match[0];
    const inner = match[1].trim();
    if (!inner || seen.has(fullPlaceholder)) {
      continue;
    }

    const lineStartIndex = email.lastIndexOf('\n', match.index);
    const lineEndIndex = email.indexOf('\n', regex.lastIndex);
    const snippet = email
      .slice(lineStartIndex === -1 ? 0 : lineStartIndex + 1, lineEndIndex === -1 ? email.length : lineEndIndex)
      .trim();

    placeholders.push({ placeholder: fullPlaceholder, inner, snippet });
    seen.add(fullPlaceholder);
  }

  return placeholders;
}

const variableSchema = z.object({
  variable_name: z.string().min(1),
  placeholder: z.string().min(1),
  source_snippet: z.string().min(1),
  goal: z.string().min(1),
  mission: z.string().min(1),
  instructions: z.string().min(1),
  conditions: z.array(z.string().min(1)).min(2),
  output: z.string().min(1),
  sample_outputs: z.array(z.string().min(1)).min(1)
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

  const placeholders = extractPlaceholderSnippets(normalizedEmail);
  if (placeholders.length === 0) {
    throw new Error('No se detectaron variables entre llaves en el email.');
  }

  const placeholderList = placeholders
    .map((item, index) => {
      const header = `${index + 1}. placeholder: ${item.placeholder}`;
      const snippetLine = item.snippet ? `   snippet: "${item.snippet}"` : '   snippet: ""';
      return `${header}\n${snippetLine}`;
    })
    .join('\n');

  const placeholderSet = new Set(placeholders.map((item) => item.placeholder));
  const snippetMap = new Map(placeholders.map((item) => [item.placeholder, item.snippet]));

  const system =
    'Eres estratega de copywriting especializado en emails de prospección B2B. Devuelves JSON válido, en castellano, sin inventar datos.';

  const user = `Misión
Analizar el siguiente email base y convertir cada marcador entre llaves ({}) en un bloque de prompt con la estructura solicitada.

Email base
"""${normalizedEmail}"""

Instrucciones
- Identifica todos los marcadores envueltos entre llaves {}. Cada marcador representa una variable independiente.
- Procesa EXCLUSIVAMENTE los placeholders listados en la sección "Placeholders detectados". No combines marcadores ni inventes placeholders adicionales.
- Para cada marcador detectado:
  • Localiza la frase completa donde aparece y úsala como fuente.
  • Explica el objetivo del marcador (para qué sirve en el email) en la clave "goal".
  • Genera una "mission" redactada en castellano que describa qué debe conseguir la frase. Debe terminar literalmente con: "La información debe ser obtenida en {análisis}."
  • En la clave "instructions" incluye un texto en tres párrafos breves: primero presenta la frase exacta con la variable (prefijo "Usa la plantilla exacta:"), después explica cómo sustituir la variable describiendo qué representa, y finalmente detalla orientaciones adicionales necesarias.
  • La clave "conditions" debe contener al menos dos reglas concretas sobre estilo, tono, extensión máxima de palabras o restricciones similares.
  • La clave "output" debe indicar siempre cómo debe entregarse el resultado. Usa literalmente "Solo frase final" salvo que el contexto exija matizarlo.
  • Proporciona exactamente tres ejemplos plausibles en "sample_outputs" que sigan las instrucciones y la frase original sin inventar datos ajenos al email.
- Mantén todo en castellano neutral, sin tecnicismos innecesarios y sin añadir comentarios extra.

Placeholders detectados
${placeholderList}

Formato de salida JSON
{
  "variables": [
    {
      "variable_name": "...",
      "placeholder": "...",
      "source_snippet": "...",
      "goal": "...",
      "mission": "...",
      "instructions": "...",
      "conditions": ["..."],
      "output": "...",
      "sample_outputs": ["..."]
    }
  ]
}

Devuelve solo el JSON solicitado.`;

  const rawResult = await createJsonCompletion({ system, user });
  const parsed = reverseEngineeringSchema.parse(rawResult);

  const parsedByPlaceholder = new Map();
  parsed.variables.forEach((variable) => {
    if (placeholderSet.has(variable.placeholder)) {
      parsedByPlaceholder.set(variable.placeholder, variable);
    }
  });

  const orderedVariables = placeholders
    .map((item) => {
      const variable = parsedByPlaceholder.get(item.placeholder);
      if (!variable) {
        return null;
      }

      const mission = variable.mission.trim();
      const instructions = variable.instructions.trim();
      const conditions = variable.conditions.map((req) => req.trim());
      const output = variable.output.trim();
      const samples = variable.sample_outputs.map((sample) => sample.trim());

      const promptSections = [
        'Misión',
        mission,
        '',
        'Instrucciones',
        instructions,
        '',
        'Condiciones',
        conditions.map((cond) => `- ${cond}`).join('\n'),
        '',
        'Output',
        output,
        '',
        'Ejemplos',
        samples.map((sample, index) => `${index + 1}. ${sample}`).join('\n')
      ];

      return {
        variable_name: variable.variable_name,
        placeholder: variable.placeholder,
        source_snippet: variable.source_snippet?.trim() || snippetMap.get(item.placeholder) || '',
        goal: variable.goal,
        mission,
        instructions,
        conditions,
        output,
        prompt_text: promptSections.join('\n'),
        sample_outputs: samples
      };
    })
    .filter(Boolean);

  return {
    variables: orderedVariables
  };
}
