// Simplified security utilities that work without external dependencies
// This will be replaced with the full version after npm install

// Rate limiting configurations (simplified for testing)
export const rateLimiters = {
  auth: { tokensPerInterval: 5, interval: 'minute' },
  api: { tokensPerInterval: 100, interval: 'minute' },
  upload: { tokensPerInterval: 10, interval: 'minute' },
  admin: { tokensPerInterval: 200, interval: 'minute' },
};

// Security headers
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' ws: wss:;",
};

// Input validation and sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .substring(0, 1000); // Limit length
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// CSRF protection
export function generateCSRFToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function validateCSRFToken(
  token: string,
  sessionToken: string
): boolean {
  return token === sessionToken;
}

// IP whitelist for admin access
export const adminIPWhitelist = new Set([
  '127.0.0.1',
  '::1',
  // Add your admin IPs here
]);

export function isAdminIP(ip: string): boolean {
  return adminIPWhitelist.has(ip);
}

// Request logging for security monitoring
export function logSecurityEvent(event: string, details: any, request: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    ip: request?.ip || request?.headers?.get?.('x-forwarded-for'),
    userAgent: request?.headers?.get?.('user-agent'),
    url: request?.url,
  };

  console.log(`[SECURITY] ${JSON.stringify(logEntry)}`);
}

// SQL injection prevention
export function escapeSQL(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
}

// XSS prevention
export function escapeHTML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// File upload security
export function validateFileUpload(file: File): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (file.size > maxSize) {
    errors.push('File size must be less than 10MB');
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push(
      'File type not allowed. Only JPEG, PNG, GIF, and WebP are allowed'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Session security
export function generateSecureSessionId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// API key generation
export function generateAPIKey(): string {
  const prefix = 'epg_';
  const randomPart =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  return `${prefix}${randomPart}`;
}

// Audit trail
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  ip: string;
  userAgent: string;
  timestamp: Date;
}

export function createAuditLog(
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  details: any,
  request: any
): AuditLog {
  return {
    id: generateSecureSessionId(),
    userId,
    action,
    resource,
    resourceId,
    details,
    ip: request?.ip || request?.headers?.get?.('x-forwarded-for') || 'unknown',
    userAgent: request?.headers?.get?.('user-agent') || 'unknown',
    timestamp: new Date(),
  };
}
