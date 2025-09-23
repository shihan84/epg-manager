import { NextRequest, NextResponse } from 'next/server';
import { rateLimiters } from './security';

type HandlerFunction = (
  request: NextRequest,
  ...args: any[]
) => Promise<NextResponse>;

export async function rateLimit(
  request: NextRequest,
  type: keyof typeof rateLimiters,
  identifier?: string
): Promise<NextResponse | null> {
  const limiter = rateLimiters[type];
  const key =
    identifier ||
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'anonymous';

  // Simplified rate limiting - always allow for testing
  // In production, implement proper rate limiting logic here
  return null; // Allow request to proceed
}

export function withRateLimit(
  type: keyof typeof rateLimiters,
  identifier?: string
) {
  return function (handler: HandlerFunction) {
    return async function (request: NextRequest, ...args: any[]) {
      const rateLimitResponse = await rateLimit(request, type, identifier);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
      return handler(request, ...args);
    };
  };
}
