import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST as registerHandler } from '@/app/api/auth/register/route';
import { POST as signinHandler } from '@/app/api/auth/[...nextauth]/route';
import { setupTestDatabase, cleanupTestDatabase, prisma } from '../setup';

describe('Authentication API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // Clean up users before each test
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test@example.com', 'test2@example.com'],
        },
      },
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Test User',
            email: 'test@example.com',
            password: 'TestPassword123!',
            companyName: 'Test Company',
          }),
        }
      );

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('User created successfully');
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('test@example.com');
    });

    it('should reject registration with invalid email', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Test User',
            email: 'invalid-email',
            password: 'TestPassword123!',
            companyName: 'Test Company',
          }),
        }
      );

      const response = await registerHandler(request);
      expect(response.status).toBe(400);
    });

    it('should reject registration with weak password', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Test User',
            email: 'test@example.com',
            password: 'weak',
            companyName: 'Test Company',
          }),
        }
      );

      const response = await registerHandler(request);
      expect(response.status).toBe(400);
    });

    it('should reject duplicate email registration', async () => {
      // First registration
      const request1 = new NextRequest(
        'http://localhost:3000/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Test User',
            email: 'test@example.com',
            password: 'TestPassword123!',
            companyName: 'Test Company',
          }),
        }
      );

      await registerHandler(request1);

      // Second registration with same email
      const request2 = new NextRequest(
        'http://localhost:3000/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Test User 2',
            email: 'test@example.com',
            password: 'TestPassword123!',
            companyName: 'Test Company 2',
          }),
        }
      );

      const response = await registerHandler(request2);
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/signin', () => {
    beforeEach(async () => {
      // Create a test user
      await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password:
            '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.5.6.7.8.9.0',
          role: 'CLIENT',
          companyName: 'Test Company',
        },
      });
    });

    it('should sign in with valid credentials', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPassword123!',
        }),
      });

      const response = await signinHandler(request);
      expect(response.status).toBe(200);
    });

    it('should reject sign in with invalid credentials', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'WrongPassword',
        }),
      });

      const response = await signinHandler(request);
      expect(response.status).toBe(401);
    });

    it('should reject sign in with non-existent email', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!',
        }),
      });

      const response = await signinHandler(request);
      expect(response.status).toBe(401);
    });
  });
});
