import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { extractClientProfile } from '@/lib/services/extractor';
import { saveClientProfile } from '@/lib/memoryStore';

const ingestSchema = z.object({
  transcript: z.string().min(10, 'transcript must contain at least 10 characters'),
  client_name: z.string().optional(),
  website: z.string().url().optional(),
  notes: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = ingestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        error: 'invalid_request',
        details: parseResult.error.format()
      }, { status: 400 });
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

    return NextResponse.json({
      profile_id: stored.id,
      client_profile: stored
    });
  } catch (error) {
    console.error('Error in /ingest:', error);
    return NextResponse.json({
      error: 'internal_error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
