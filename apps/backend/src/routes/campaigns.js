import { z } from 'zod';
import { buildCreativeIdeasPrompts } from '../services/campaigns/creativeIdeas.js';
import { buildLookalikePrompts } from '../services/campaigns/lookalike.js';
import { getClientProfile, savePromptPackage, getPromptPackage } from '../utils/memoryStore.js';

const generateBodySchema = z.object({
  profile_id: z.string().uuid().optional(),
  client_profile: z
    .object({
      offer: z.string().nullable().optional(),
      value_props: z.array(z.string()).optional(),
      icp: z
        .object({
          company_types: z.array(z.string()).optional(),
          buyer_roles: z.array(z.string()).optional()
        })
        .optional(),
      proof_points: z.array(z.string()).optional(),
      constraints: z
        .object({
          tone: z.string().optional(),
          language: z.string().optional()
        })
        .optional()
        .default({}),
      client_summary: z.string().optional()
    })
    .optional()
});

const supportedCampaigns = {
  lookalike: {
    id: 'lookalike',
    name: 'Lookalike',
    builder: buildLookalikePrompts
  },
  'creative-ideas': {
    id: 'creative-ideas',
    name: 'Creative Ideas',
    builder: buildCreativeIdeasPrompts
  }
};

export default async function campaignRoutes(fastify) {
  fastify.get('/campaigns', async (_request, reply) => {
    return reply.send({
      campaigns: Object.values(supportedCampaigns).map(({ id, name }) => ({ id, name }))
    });
  });

  fastify.post('/campaigns/:campaignId/generate', async (request, reply) => {
    const { campaignId } = request.params;
    const campaign = supportedCampaigns[campaignId];

    if (!campaign) {
      return reply.code(404).send({ error: 'campaign_not_found', campaignId });
    }

    const parseResult = generateBodySchema.safeParse(request.body ?? {});
    if (!parseResult.success) {
      return reply.code(400).send({
        error: 'invalid_request',
        details: parseResult.error.format()
      });
    }

    const { profile_id: profileId, client_profile: clientProfileOverride } = parseResult.data;

    let clientProfile = clientProfileOverride;

    if (!clientProfile && profileId) {
      clientProfile = getClientProfile(profileId);
    }

    if (!clientProfile) {
      return reply.code(400).send({
        error: 'profile_not_found',
        message: 'Provide a valid profile_id or inline client_profile'
      });
    }

    const packageData = await campaign.builder(clientProfile);
    if (profileId) {
      savePromptPackage(profileId, campaign.id, packageData);
    }

    return reply.send({
      campaign: campaign.id,
      prompt_package: packageData
    });
  });

  fastify.get('/campaigns/:campaignId/prompts', async (request, reply) => {
    const { campaignId } = request.params;
    const campaign = supportedCampaigns[campaignId];

    if (!campaign) {
      return reply.code(404).send({ error: 'campaign_not_found', campaignId });
    }

    const profileId = request.query?.profile_id;
    if (!profileId) {
      return reply.code(400).send({ error: 'profile_id_required' });
    }

    const packageData = getPromptPackage(profileId, campaign.id);
    if (!packageData) {
      return reply.code(404).send({ error: 'prompt_package_not_found', profile_id: profileId });
    }

    return reply.send({
      campaign: campaign.id,
      prompt_package: packageData
    });
  });
}
