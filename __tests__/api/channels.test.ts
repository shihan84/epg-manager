import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/channels/route';
import { PUT, DELETE } from '@/app/api/channels/[id]/route';
import { setupTestDatabase, cleanupTestDatabase, prisma } from '../setup';

describe('Channels API', () => {
  let testUser: any;
  let testChannel: any;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password:
          '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.5.6.7.8.9.0',
        role: 'CLIENT',
        companyName: 'Test Company',
      },
    });

    // Create test channel
    testChannel = await prisma.channel.create({
      data: {
        name: 'test-channel',
        displayName: 'Test Channel',
        description: 'Test Channel Description',
        userId: testUser.id,
      },
    });
  });

  describe('GET /api/channels', () => {
    it('should get channels for authenticated user', async () => {
      const request = new NextRequest('http://localhost:3000/api/channels', {
        method: 'GET',
        headers: {
          'x-user-id': testUser.id,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('name');
      expect(data[0]).toHaveProperty('displayName');
    });

    it('should return 401 for unauthenticated request', async () => {
      const request = new NextRequest('http://localhost:3000/api/channels', {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/channels', () => {
    it('should create a new channel', async () => {
      const request = new NextRequest('http://localhost:3000/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': testUser.id,
        },
        body: JSON.stringify({
          name: 'new-channel',
          displayName: 'New Channel',
          description: 'New Channel Description',
          number: 1,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id');
      expect(data.name).toBe('new-channel');
      expect(data.displayName).toBe('New Channel');
    });

    it('should reject channel creation with invalid data', async () => {
      const request = new NextRequest('http://localhost:3000/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': testUser.id,
        },
        body: JSON.stringify({
          // Missing required name field
          displayName: 'New Channel',
          description: 'New Channel Description',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should reject duplicate channel name', async () => {
      const request = new NextRequest('http://localhost:3000/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': testUser.id,
        },
        body: JSON.stringify({
          name: 'test-channel', // Same as existing channel
          displayName: 'Duplicate Channel',
          description: 'Duplicate Channel Description',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/channels/{id}', () => {
    it('should update channel information', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/channels/${testChannel.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': testUser.id,
          },
          body: JSON.stringify({
            displayName: 'Updated Channel Name',
            description: 'Updated description',
          }),
        }
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: testChannel.id }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.displayName).toBe('Updated Channel Name');
      expect(data.description).toBe('Updated description');
    });

    it('should return 404 for non-existent channel', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/channels/non-existent-id',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': testUser.id,
          },
          body: JSON.stringify({
            displayName: 'Updated Channel Name',
          }),
        }
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: testChannel.id }),
      });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/channels/{id}', () => {
    it('should delete channel', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/channels/${testChannel.id}`,
        {
          method: 'DELETE',
          headers: {
            'x-user-id': testUser.id,
          },
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: testChannel.id }),
      });
      expect(response.status).toBe(200);

      // Verify channel is deleted
      const deletedChannel = await prisma.channel.findUnique({
        where: { id: testChannel.id },
      });
      expect(deletedChannel).toBeNull();
    });

    it('should return 404 for non-existent channel', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/channels/non-existent-id',
        {
          method: 'DELETE',
          headers: {
            'x-user-id': testUser.id,
          },
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: testChannel.id }),
      });
      expect(response.status).toBe(404);
    });
  });
});
