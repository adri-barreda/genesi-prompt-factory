import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { extractClientProfile } from '../services/extractor.js';
import { saveClientProfile } from '../utils/memoryStore.js';

const ingestSchema = z.object({
  transcript: z.string().min(10, 'transcript must contain at least 10 characters'),
  client_name: z.string().optional(),
  website: z.string().url().optional(),
  notes: z.string().optional()
});

export default async function ingestRoutes(fastify) {
  fastify.post('/ingest', async (request, reply) => {
    const parseResult = ingestSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.code(400).send({
        error: 'invalid_request',
        details: parseResult.error.format()
      });
    }

    const payload = parseResult.data;
    const id = randomUUID();

    const profile = await extractClientProfile({
      id,
      transcript: payload.transcript,
      client_name: payload.client_name,
      website: payload.website,
      notes: payload.notes
    });

    const stored = saveClientProfile(id, profile);

    return reply.send({
      profile_id: stored.id,
      client_profile: stored
    });
  });
}
