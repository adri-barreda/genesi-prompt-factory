import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildCreativeIdeasPrompts } from '@/lib/services/creativeIdeas';
import { getClientProfile, savePromptPackage } from '@/lib/memoryStore';

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
        .optional(),
      data_sources: z
        .object({
          industrial_data: z.string().optional()
        })
        .optional()
    })
    .optional()
});

const supportedCampaigns = {
  'creative-ideas': {
    id: 'creative-ideas',
    name: 'Creative Ideas',
    builder: buildCreativeIdeasPrompts
  }
};

export async function POST(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const campaignId = params.campaignId;
    const campaign = supportedCampaigns[campaignId as keyof typeof supportedCampaigns];

    if (!campaign) {
      return NextResponse.json({ 
        error: 'campaign_not_found', 
        campaignId 
      }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = generateBodySchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'invalid_request',
        details: parseResult.error.format()
      }, { status: 400 });
    }

    const { profile_id: profileId, client_profile: clientProfileOverride } = parseResult.data;

    let clientProfile = clientProfileOverride;

    if (!clientProfile && profileId) {
      clientProfile = getClientProfile(profileId);
    }

    if (!clientProfile) {
      return NextResponse.json({
        error: 'profile_not_found',
        message: 'Provide a valid profile_id or inline client_profile'
      }, { status: 400 });
    }

    const packageData = await campaign.builder(clientProfile);
    
    if (profileId) {
      savePromptPackage(profileId, campaign.id, packageData);
    }

    return NextResponse.json({
      campaign: campaign.id,
      prompt_package: packageData
    });
  } catch (error) {
    console.error('Error in /campaigns/[campaignId]/generate:', error);
    return NextResponse.json({
      error: 'internal_error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
