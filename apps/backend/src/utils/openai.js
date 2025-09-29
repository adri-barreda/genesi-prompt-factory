import OpenAI from 'openai';
import config from '../config.js';

const openaiClient = new OpenAI({
  apiKey: config.openai.apiKey
});

export async function createJsonCompletion({ system, user, model = config.openai.modelExtractor }) {
  const response = await openaiClient.chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  });

  const [{ message }] = response.choices;
  return JSON.parse(message.content);
}

export async function createTextCompletion({ system, user, model = config.openai.modelPromptBuilder }) {
  const response = await openaiClient.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  });

  const [{ message }] = response.choices;
  return message.content.trim();
}
