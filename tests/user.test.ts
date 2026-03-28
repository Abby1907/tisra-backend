import request from 'supertest';
import { app } from '../src/app';

describe('User Profile Module', () => {
  const testUser = {
    email: 'profile@example.com',
    username: 'profileuser',
    password: 'Password123!',
    displayName: 'Profile User',
  };

  let accessToken: string;

  beforeEach(async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(testUser);
    accessToken = regRes.body.data?.tokens?.accessToken || '';
  });

  describe('GET /api/v1/users/profile', () => {
    it('should retrieve profile with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(testUser.email);
    });

    it('should fail without token', async () => {
      const res = await request(app).get('/api/v1/users/profile');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/users/profile', () => {
    it('should update profile successfully', async () => {
      const res = await request(app)
        .patch('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ displayName: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.displayName).toBe('Updated Name');
    });

    it('should fail with invalid avatar URL', async () => {
      const res = await request(app)
        .patch('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ avatarUrl: 'not-a-url' });

      expect(res.status).toBe(422);
    });
  });
});
