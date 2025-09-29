import { creativeIdeasLineSpecs } from '../../specs/creativeIdeas.js';
import { generateLinePrompt } from '../generator.js';
import { withClientContext } from './utils.js';

export async function buildCreativeIdeasPrompts(clientProfile) {
  const results = [];

  for (const spec of creativeIdeasLineSpecs) {
    const specWithContext = withClientContext(spec, clientProfile);
    const promptText = await generateLinePrompt(clientProfile, specWithContext, 'Creative Ideas');
    results.push({
      id: spec.line_id,
      name: spec.name,
      target_variable: spec.target_variable,
      prompt_text: promptText,
      depends_on: spec.depends_on || []
    });
  }

  return {
    campaign: 'Creative Ideas',
    prompts: results
  };
}
