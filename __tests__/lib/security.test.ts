import { describe, it, expect } from '@jest/globals';
import {
  sanitizeInput,
  validateEmail,
  validatePassword,
  generateCSRFToken,
  validateCSRFToken,
  escapeSQL,
  escapeHTML,
  validateFileUpload,
} from '@/lib/security';

describe('Security Utils', () => {
  describe('sanitizeInput', () => {
    it('should remove HTML tags and quotes', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeInput(input);
      expect(result).toBe('scriptalertxssscript');
    });

    it('should limit input length', () => {
      const longInput = 'a'.repeat(2000);
      const result = sanitizeInput(longInput);
      expect(result.length).toBe(1000);
    });

    it('should trim whitespace', () => {
      const input = '  test input  ';
      const result = sanitizeInput(input);
      expect(result).toBe('test input');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    it('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(validateEmail(longEmail)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should require uppercase letter', () => {
      const result = validatePassword('lowercase123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one uppercase letter'
      );
    });

    it('should require lowercase letter', () => {
      const result = validatePassword('UPPERCASE123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one lowercase letter'
      );
    });

    it('should require number', () => {
      const result = validatePassword('NoNumbers!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one number'
      );
    });

    it('should require special character', () => {
      const result = validatePassword('NoSpecial123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one special character'
      );
    });

    it('should require minimum length', () => {
      const result = validatePassword('Short1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Password must be at least 8 characters long'
      );
    });
  });

  describe('CSRF Protection', () => {
    it('should generate valid CSRF tokens', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it('should validate CSRF tokens correctly', () => {
      const token = generateCSRFToken();
      expect(validateCSRFToken(token, token)).toBe(true);
      expect(validateCSRFToken(token, 'different-token')).toBe(false);
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should escape SQL special characters', () => {
      const input = "'; DROP TABLE users; --";
      const result = escapeSQL(input);
      expect(result).toBe("''; DROP TABLE users; --");
    });

    it('should remove SQL comments', () => {
      const input = 'test /* comment */ value';
      const result = escapeSQL(input);
      expect(result).toBe('test  value');
    });
  });

  describe('XSS Prevention', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("xss")</script>';
      const result = escapeHTML(input);
      expect(result).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('should escape all dangerous characters', () => {
      const input = '&<>"\'/';
      const result = escapeHTML(input);
      expect(result).toBe('&amp;&lt;&gt;&quot;&#x27;&#x2F;');
    });
  });

  describe('File Upload Validation', () => {
    it('should validate allowed file types', () => {
      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = validateFileUpload(validFile);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject disallowed file types', () => {
      const invalidFile = new File(['test'], 'test.exe', {
        type: 'application/x-executable',
      });
      const result = validateFileUpload(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'File type not allowed. Only JPEG, PNG, GIF, and WebP are allowed'
      );
    });

    it('should reject files that are too large', () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });
      const result = validateFileUpload(largeFile);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('File size must be less than 10MB');
    });
  });
});
