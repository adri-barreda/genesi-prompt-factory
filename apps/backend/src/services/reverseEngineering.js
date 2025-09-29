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

  const user = `Paso 1. Identificación de variables 
Lee el correo recibido como input. Detecta todas las frases que contengan { }. Cada frase con { } se considera una variable independiente. 

Email base
"""${normalizedEmail}"""

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
Define reglas de estilo, tono y límite de palabras en base a los ejemplos dados para esa variable. Cuenta las palabras de los ejemplos y define un máximo coherente (nunca más de 28). Ajusta el tono según el estilo de los ejemplos (ej. cercano, natural, directo, etc.). Ajusta el tipo de frase (ej. simple, sin tecnicismos innecesarios). Siempre añade: No inventar datos. Output "Solo frase final". 

Ejemplos 
Proporciona tres ejemplos de cómo quedaría esa frase correctamente construida. 

Ejemplo de un prompt bien hecho 
Misión 
Generar una frase personalizada usando la información de Análisis Clarbi. Instrucciones Si hay al menos un caso de éxito, usa el primero con la estructura: Vi que trabajasteis con (caso de éxito), ayudándoles en (breve logro), y me pregunté si hacéis campañas outbound para conseguir más clientes como ellos. Sustituye (caso de éxito): por el nombre del caso de éxito. Sustituye (breve logro): por lo que consiguieron hacer con ese caso de éxito. La frase final debe tener entre 22 y 28 palabras máximo. En caso de que se trate de un testimonio y no de un caso de éxito, debes siempre mencionar el nombre de pila y la empresa. Ejemplo: Ignacio de Alonso & Lledó. Si no hay caso de éxito pero sí un competidor con puntuación igual o mayor a 8/10, usa: He visto que os comparan con (competidor) y me preguntaba cómo estáis logrando captar clientes con menor coste que ellos. Sustituye (competidor): por el nombre del competidor con mayor puntuación. La frase final debe tener entre 22 y 28 palabras máximo. Si no hay caso de éxito ni competidor con puntuación ≥ 8/10, usa: De qué forma estáis generando nuevas oportunidades con (target principal) interesados en (lo que hace la empresa de forma breve)? Sustituye (target principal): por el target principal de la empresa. Sustituye (lo que hace la empresa de forma breve): por su propuesta de valor breve. La frase final debe tener entre 22 y 28 palabras máximo. Condiciones Estilo conversacional y natural. Solo una frase entre 22 y 28 palabras. No inventar datos. Output La frase final, sin explicaciones adicionales. Ejemplos Caso de éxito: Vi que trabajasteis con Cemex, ayudándoles a simplificar productos complejos y aumentar ventas, y me pregunté si hacéis campañas outbound para conseguir más clientes como ellos. Caso de éxito (testimonio): Vi que trabajasteis con Ignacio de Alonso & Lledó para ahorrar tiempo y evitar errores, y me pregunté si hacéis outbound para captar más clientes como ellos. Competidor: He visto que os comparan con Holded y me preguntaba cómo estáis logrando captar clientes con menor coste que ellos. Fallback: De qué forma estáis generando nuevas oportunidades con autónomos interesados en simplificar su gestión fiscal y ahorrar tiempo en el papeleo administrativo? 

Ejemplo de otro prompt bien hecho 
Misión 
Generar una frase personalizada en base a la información en Análisis de seguros. Instrucciones Usa siempre esta plantilla: "Revisando vuestra web me encontré con (producto) dirigido al público adulto, y me pregunté qué estrategia de marketing estáis utilizando para captar estos clientes." Sustituye (producto): por el nombre del seguro con mayor puntuación de Análisis de seguros. Si el seguro tiene un nombre propio oficial (ejemplo: "GesSalud", "VidaGes"), usa ese nombre tal cual. Si no tiene nombre propio, escribe: vuestro seguro de [tipo de seguro]. Condiciones La frase final debe tener entre 20 y 25 palabras máximo. No inventar información, usa solo lo que aparezca en la página de la empresa. La salida debe ser únicamente la frase final, sin comentarios adicionales. Output Una sola frase siguiendo la plantilla anterior. Ejemplo Revisando vuestra web me encontré con GaesVida dirigido al público adulto, y me pregunté qué estrategia de marketing estáis utilizando para captar estos clientes.

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
