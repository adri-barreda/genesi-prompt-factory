import { z } from 'zod';
import { createJsonCompletion } from '../openai';

function extractPlaceholderSnippets(email: string) {
  const placeholders: Array<{placeholder: string, inner: string, snippet: string}> = [];
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

export async function reverseEngineerEmailVariables(emailBody: string, { language = 'es-ES' } = {}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const placeholders = extractPlaceholderSnippets(emailBody);

  if (placeholders.length === 0) {
    return {
      email: emailBody,
      language,
      placeholders: [],
      variables: []
    };
  }

  const system = 'Eres un especialista en ingeniería de prompts para campañas de email marketing, diseñando prompts de Genesi.';

  const placeholderList = placeholders
    .map((p, idx) => `${idx + 1}. Placeholder: ${p.placeholder}\n   Contexto: "${p.snippet}"`)
    .join('\n\n');

  const user = `Misión
Analizar un email template y generar prompts específicos para cada placeholder dinámico detectado.

Email a analizar
"""
${emailBody}
"""

Placeholders detectados
${placeholderList}

Instrucciones
Para cada placeholder detectado:
1. Crear un prompt específico que genere contenido para ese placeholder
2. El prompt debe incluir: misión, instrucciones paso a paso, condiciones específicas, formato de salida
3. Incluir 1-3 ejemplos realistas de salidas válidas
4. El prompt debe estar en ${language === 'es-ES' ? 'español' : 'inglés'} y ser ejecutable directamente

Formato de salida requerido
Devuelve un JSON con la siguiente estructura exacta:
{
  "variables": [
    {
      "variable_name": "Nombre descriptivo del placeholder",
      "placeholder": "{Placeholder original}",
      "source_snippet": "Línea completa donde aparece el placeholder",
      "goal": "Qué debe lograr este placeholder en el email",
      "mission": "Descripción concisa de la misión del prompt",
      "instructions": "Instrucciones paso a paso para generar el contenido",
      "conditions": ["Condición 1", "Condición 2", "etc."],
      "output": "Descripción del formato esperado de salida",
      "sample_outputs": ["Ejemplo 1", "Ejemplo 2", "etc."]
    }
  ]
}

Devuelve solo el JSON solicitado.`;

  const rawResult = await createJsonCompletion({ system, user });
  const validatedResult = reverseEngineeringSchema.parse(rawResult);

  // Add prompt_text to each variable
  const variablesWithPrompts = validatedResult.variables.map(variable => ({
    ...variable,
    prompt_text: `Misión: ${variable.mission}\n\nInstrucciones:\n${variable.instructions}\n\nCondiciones:\n${variable.conditions.map(c => `- ${c}`).join('\n')}\n\nFormato de salida:\n${variable.output}\n\nEjemplos:\n${variable.sample_outputs.map((ex, i) => `${i + 1}. ${ex}`).join('\n')}`
  }));

  return {
    email: emailBody,
    language,
    placeholders,
    variables: variablesWithPrompts
  };
}
