import { creativeIdeasLineSpecs } from '../specs/creativeIdeas';
import { generateLinePrompt } from './generator';

export async function buildCreativeIdeasPrompts(clientProfile: any) {
  const results = [];

  for (const spec of creativeIdeasLineSpecs) {
    const promptText = await generateLinePrompt(clientProfile, spec);
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
