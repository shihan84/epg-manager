import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { securityHeaders, isAdminIP, logSecurityEvent } from './security';
import { rateLimit } from './rate-limit';
import { withMonitoring } from './monitoring';

type HandlerFunction = (
  request: NextRequest,
  ...args: any[]
) => Promise<NextResponse>;

export function withEnterpriseSecurity(handler: HandlerFunction) {
  return withMonitoring(async function (request: NextRequest, ...args: any[]) {
    // Add security headers
    const response = await handler(request, ...args);

    // Apply security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  });
}

export function withAdminProtection(handler: HandlerFunction) {
  return async function (request: NextRequest, ...args: any[]) {
    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Check IP whitelist for admin access
    if (!isAdminIP(clientIP)) {
      logSecurityEvent(
        'admin_access_denied',
        {
          ip: clientIP,
          url: request.url,
          userAgent: request.headers.get('user-agent'),
        },
        request
      );

      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return handler(request, ...args);
  };
}

export function withRateLimiting(type: 'auth' | 'api' | 'upload' | 'admin') {
  return function (handler: HandlerFunction) {
    return async function (request: NextRequest, ...args: any[]) {
      const rateLimitResponse = await rateLimit(request, type);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
      return handler(request, ...args);
    };
  };
}

export function withInputValidation(schema: any) {
  return function (handler: HandlerFunction) {
    return async function (request: NextRequest, ...args: any[]) {
      try {
        // Validate request body if it's a POST/PUT/PATCH request
        if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
          const body = await request.json();
          const validation = schema.safeParse(body);

          if (!validation.success) {
            return NextResponse.json(
              {
                error: 'Invalid input',
                details: validation.error.errors,
              },
              { status: 400 }
            );
          }
        }

        return handler(request, ...args);
      } catch (error) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
      }
    };
  };
}

export function withCORS(handler: HandlerFunction) {
  return async function (request: NextRequest, ...args: any[]) {
    const response = await handler(request, ...args);

    // Add CORS headers
    response.headers.set(
      'Access-Control-Allow-Origin',
      process.env.ALLOWED_ORIGINS || '*'
    );
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-API-Key'
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }

    return response;
  };
}

export function withAPIKeyAuth(handler: HandlerFunction) {
  return async function (request: NextRequest, ...args: any[]) {
    const apiKey = request.headers.get('x-api-key');

    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    // In a real implementation, you'd validate the API key against the database
    // For now, we'll just check if it exists
    if (apiKey.length < 32) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    return handler(request, ...args);
  };
}

export function withRequestLogging(handler: HandlerFunction) {
  return async function (request: NextRequest, ...args: any[]) {
    const startTime = Date.now();

    console.log(
      `[${new Date().toISOString()}] ${request.method} ${request.url}`
    );

    const response = await handler(request, ...args);

    const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] ${request.method} ${request.url} - ${response.status} (${duration}ms)`
    );

    return response;
  };
}
