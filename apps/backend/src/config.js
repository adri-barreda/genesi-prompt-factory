import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  host: process.env.HOST || '0.0.0.0',
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    modelExtractor: process.env.OPENAI_MODEL_EXTRACTOR || 'gpt-4o-mini',
    modelPromptBuilder: process.env.OPENAI_MODEL_PROMPT_BUILDER || 'gpt-4o-mini'
  }
};

export default config;
