import { createTextCompletion } from '../openai';

export async function generateLinePrompt(clientProfile: any, lineSpec: any, campaignName = 'Creative Ideas') {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const system = 'Eres ingeniero de prompts. Devuelves un PROMPT en español listo para pegar en Genesy.';

  const exampleBlock = lineSpec.examples?.length
    ? `Ejemplos de salidas válidas\n${lineSpec.examples.map((ex: string, idx: number) => `${idx + 1}. ${ex}`).join('\n')}`
    : '';

  const dependenciesBlock = lineSpec.depends_on?.length
    ? lineSpec.depends_on.map((dep: string) => `- ${dep}`).join('\n')
    : '- Industrial Data (fuente obligatoria en Genesy)';

  const user = `Misión
Construir un PROMPT para Genesy que genere una línea dinámica del email de la campaña "${campaignName}".

Inputs fijos (JSON)
CLIENT_PROFILE:
${JSON.stringify(clientProfile, null, 2)}

LINE_SPEC:
${JSON.stringify(lineSpec, null, 2)}

Instrucciones
- Usa los datos de CLIENT_PROFILE para tono, pruebas sociales y alineación con la oferta.
- Respeta exactamente la estructura fija, las reglas y los límites de palabras definidos en LINE_SPEC.
- El prompt debe incluir: misión, instrucciones paso a paso, fuentes autorizadas (siempre citar "Industrial Data"), formato de salida y un ejemplo correcto.
- El prompt resultante debe estar en castellano, listo para pegar en Genesy, y debe prohibir inventar información.
- Devuelve SOLO el texto del prompt final, sin comentarios adicionales.

Fuentes que puede usar la persona que ejecuta el prompt
${dependenciesBlock}

${exampleBlock}`;

  return await createTextCompletion({ system, user });
}
