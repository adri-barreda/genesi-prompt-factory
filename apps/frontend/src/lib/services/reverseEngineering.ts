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

  const user = `Paso 1. Identificación de variables
Lee el correo recibido como input. Detecta todas las frases que contengan { }. Cada frase con { } se considera una variable independiente.

Email a analizar
"""
${emailBody}
"""

Placeholders detectados
${placeholderList}

Paso 2. Generación de prompts
Por cada variable identificada, genera un prompt completo con la siguiente estructura:

Estructura del prompt

Misión
Explica cuál es el objetivo de la frase donde está la variable. Siempre termina la misión con: "La información debe ser obtenida en {análisis}".

Instrucciones
Incluye siempre la plantilla exacta de la frase que contiene la variable. Después, indica cómo debe sustituirse la variable, explicando con claridad qué representa en el contexto de la frase. Para ello, debes basarte en la lógica de los ejemplos.

Ejemplo de explicación
Frase con variable: "Vi en vuestra web que {x} y me recordó a uno de nuestros clientes, líder en gases industriales y medicinales."
En este caso, {x} corresponde a una breve propuesta de valor de la empresa. Las instrucciones quedarían así:
Usa la plantilla exacta: "Vi en vuestra web que {x} y me recordó a uno de nuestros clientes, líder en gases industriales y medicinales."
Sustituye {x}: por una frase que describa lo que hace la empresa, tal como se identifica en {análisis}.

En cada caso, identifica primero qué significa la variable y, con esa interpretación, construye las instrucciones siguiendo este mismo esquema.

Condiciones
Define reglas de estilo, tono y límite de palabras en base a los ejemplos dados para esa variable. Cuenta las palabras de los ejemplos y define un máximo coherente (nunca más de 28). Ajusta el tono según el estilo de los ejemplos (ej. cercano, natural, directo, etc.). Ajusta el tipo de frase (ej. simple, sin tecnicismos innecesarios). Siempre añade: No inventar datos.

Output
"Solo frase final".

Ejemplos
Proporciona tres ejemplos de cómo quedaría esa frase correctamente construida.

Formato de salida requerido
Devuelve un JSON con la siguiente estructura exacta:
{
  "variables": [
    {
      "variable_name": "Nombre descriptivo del placeholder",
      "placeholder": "{Placeholder original}",
      "source_snippet": "Línea completa donde aparece el placeholder",
      "goal": "Qué debe lograr este placeholder en el email",
      "mission": "Descripción concisa de la misión del prompt terminando con 'La información debe ser obtenida en {análisis}'",
      "instructions": "Instrucciones paso a paso siguiendo el esquema de plantilla exacta y sustitución de variable",
      "conditions": ["Condición 1", "Condición 2", "No inventar datos", "etc."],
      "output": "Solo frase final",
      "sample_outputs": ["Ejemplo 1", "Ejemplo 2", "Ejemplo 3"]
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
