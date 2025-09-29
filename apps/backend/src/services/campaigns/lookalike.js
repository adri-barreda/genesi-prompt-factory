import { lookalikeLineSpecs } from '../../specs/lookalike.js';
import { generateLinePrompt } from '../generator.js';
import { withClientContext } from './utils.js';

export async function buildLookalikePrompts(clientProfile) {
  const prompts = [];
  const proofPoints = Array.isArray(clientProfile.proof_points)
    ? clientProfile.proof_points.filter((item) => typeof item === 'string' && item.trim().length > 0)
    : [];

  for (const spec of lookalikeLineSpecs) {
    let overrides = {};

    if (spec.line_id === 'LL_E1_L4_resultados') {
      const proofPointsBlock = proofPoints.length
        ? `Trabaja específicamente con estos resultados reales del cliente:\n${proofPoints
            .map((point) => `- ${point}`)
            .join('\n')}`
        : 'No se detectaron métricas concretas en los proof points; redacta un resultado cualitativo convincente alineado con el client_summary.';

      overrides = {
        instructions: [
          'Revisa los datos proporcionados en el contexto del cliente para mantener el tono y el contenido correctos.',
          proofPointsBlock,
          'Redacta una frase positiva y tangible que resuma los resultados conseguidos, utilizando cifras exactas si existen.',
          'Mantén un lenguaje sencillo y directo, evitando superlativos vacíos.',
          'Limita el texto a un máximo de 26 palabras.',
          'Asegúrate de que el tono sea natural y directo, siguiendo el tono indicado en el contexto del cliente.'
        ]
      };
    }

    const specWithContext = withClientContext(spec, clientProfile, overrides);
    const promptText = await generateLinePrompt(clientProfile, specWithContext, 'Lookalike');
    prompts.push({
      id: spec.line_id,
      name: spec.name,
      target_variable: spec.target_variable,
      prompt_text: promptText,
      depends_on: spec.depends_on || []
    });
  }

  return {
    campaign: 'Lookalike',
    prompts
  };
}
