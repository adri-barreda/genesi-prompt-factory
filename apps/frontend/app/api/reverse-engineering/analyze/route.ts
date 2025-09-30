import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { reverseEngineerEmailVariables } from '@/lib/services/reverseEngineering';

const analyzeSchema = z.object({
  email_body: z.string().min(1, 'Email body is required'),
  language: z.string().optional().default('es-ES'),
  mode: z.enum(['variables', 'analysis']).optional().default('variables')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = analyzeSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        error: 'invalid_request',
        details: parseResult.error.format()
      }, { status: 400 });
    }

    const { email_body, language, mode } = parseResult.data;

    const result = await reverseEngineerEmailVariables(email_body, { language, mode });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in /reverse-engineering/analyze:', error);
    return NextResponse.json({
      error: 'internal_error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
