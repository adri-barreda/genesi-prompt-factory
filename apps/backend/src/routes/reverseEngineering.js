import { z } from 'zod';
import { reverseEngineerEmailVariables } from '../services/reverseEngineering.js';

const bodySchema = z.object({
  email_body: z.string().min(10, 'email_body must contain at least 10 characters'),
  language: z.string().optional()
});

export default async function reverseEngineeringRoutes(fastify) {
  fastify.post('/reverse-engineering/analyze', async (request, reply) => {
    const parseResult = bodySchema.safeParse(request.body ?? {});

    if (!parseResult.success) {
      return reply.code(400).send({
        error: 'invalid_request',
        details: parseResult.error.format()
      });
    }

    const { email_body: emailBody, language } = parseResult.data;

    const result = await reverseEngineerEmailVariables(emailBody, { language });

    return reply.send(result);
  });
}
