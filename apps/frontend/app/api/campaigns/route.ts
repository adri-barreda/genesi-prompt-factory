import { NextResponse } from 'next/server';

const supportedCampaigns = {
  'creative-ideas': {
    id: 'creative-ideas',
    name: 'Creative Ideas'
  }
};

export async function GET() {
  return NextResponse.json({
    campaigns: Object.values(supportedCampaigns).map(({ id, name }) => ({ id, name }))
  });
}
