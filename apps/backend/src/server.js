import Fastify from 'fastify';
import cors from '@fastify/cors';
import config from './config.js';
import ingestRoutes from './routes/ingest.js';
import campaignRoutes from './routes/campaigns.js';
import reverseEngineeringRoutes from './routes/reverseEngineering.js';

const fastify = Fastify({
  logger: true
});

await fastify.register(cors, {
  origin: true
});

await fastify.register(async (instance) => {
  await ingestRoutes(instance);
  await campaignRoutes(instance);
  await reverseEngineeringRoutes(instance);
});

fastify.get('/health', async () => ({ status: 'ok' }));

fastify.ready().then(() => {
  fastify.log.info('Routes registered:', fastify.printRoutes());
});

fastify.listen({ port: config.port, host: config.host }).catch((err) => {
  fastify.log.error(err, 'Failed to start server');
  process.exit(1);
});
