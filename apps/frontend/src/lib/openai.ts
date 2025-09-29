import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function createJsonCompletion({ system, user }: { system: string; user: string }) {
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL_EXTRACTOR || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
    max_tokens: 2000
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content received from OpenAI');
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${content}`);
  }
}

export async function createTextCompletion({ system, user }: { system: string; user: string }) {
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL_PROMPT_BUILDER || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    temperature: 0.3,
    max_tokens: 1500
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content received from OpenAI');
  }

  return content;
}
