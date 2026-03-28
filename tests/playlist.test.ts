import request from 'supertest';
import { app } from '../src/app';

describe('Playlist Module Integration', () => {
  let token: string;
  let playlistId: string;

  const testUser = {
    email: 'playlist-user@example.com',
    username: 'playlistuser',
    password: 'Password123!',
    displayName: 'Playlist User',
  };

  const spotifyTrack = {
    spotifyTrackId: 'spotify:track:4cOdzhRmdXvSqbxeMv73o3',
    trackName: 'Never Gonna Give You Up',
    artistName: 'Rick Astley',
    albumArt: 'https://example.com/art.jpg',
    durationMs: 213000,
  };

  beforeEach(async () => {
    // 1. Register and Login (Cleaned by global beforeEach)
    await request(app).post('/api/v1/auth/register').send(testUser);
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    token = loginRes.body.data.tokens.accessToken;

    // 2. Create a base playlist for subsequent tests if needed
    // But we'll let individual tests create their own if they need it for the ID
    const res = await request(app)
      .post('/api/v1/playlists')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Initial Playlist' });

    if (res.status === 201) {
      playlistId = res.body.data.id;
    }
  });

  describe('POST /api/v1/playlists', () => {
    it('should create a new playlist', async () => {
      const res = await request(app)
        .post('/api/v1/playlists')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'My Test Playlist' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('My Test Playlist');
    });

    it('should fail if name is missing', async () => {
      const res = await request(app)
        .post('/api/v1/playlists')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/v1/playlists', () => {
    it('should list user playlists', async () => {
      const res = await request(app)
        .get('/api/v1/playlists')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/playlists/:id', () => {
    it('should get playlist details', async () => {
      const res = await request(app)
        .get(`/api/v1/playlists/${playlistId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(playlistId);
      expect(res.body.data.tracks).toEqual([]);
    });

    it('should return 404 for non-existent playlist', async () => {
      const res = await request(app)
        .get('/api/v1/playlists/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/playlists/:id', () => {
    it('should update playlist name', async () => {
      const res = await request(app)
        .patch(`/api/v1/playlists/${playlistId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
    });
  });

  describe('POST /api/v1/playlists/:id/tracks', () => {
    it('should add a track to playlist', async () => {
      const res = await request(app)
        .post(`/api/v1/playlists/${playlistId}/tracks`)
        .set('Authorization', `Bearer ${token}`)
        .send(spotifyTrack);

      expect(res.status).toBe(201);
      expect(res.body.data.tracks.length).toBe(1);
      expect(res.body.data.tracks[0].spotifyTrackId).toBe(spotifyTrack.spotifyTrackId);
    });

    it('should fail when adding duplicate track', async () => {
      await request(app)
        .post(`/api/v1/playlists/${playlistId}/tracks`)
        .set('Authorization', `Bearer ${token}`)
        .send(spotifyTrack);

      const res = await request(app)
        .post(`/api/v1/playlists/${playlistId}/tracks`)
        .set('Authorization', `Bearer ${token}`)
        .send(spotifyTrack);

      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/v1/playlists/:id/tracks/:trackId', () => {
    it('should remove track from playlist', async () => {
      await request(app)
        .post(`/api/v1/playlists/${playlistId}/tracks`)
        .set('Authorization', `Bearer ${token}`)
        .send(spotifyTrack);

      const res = await request(app)
        .delete(`/api/v1/playlists/${playlistId}/tracks/${spotifyTrack.spotifyTrackId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tracks.length).toBe(0);
    });
  });

  describe('DELETE /api/v1/playlists/:id', () => {
    it('should delete playlist', async () => {
      const res = await request(app)
        .delete(`/api/v1/playlists/${playlistId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(204);

      // Verify it's gone
      const checkRes = await request(app)
        .get(`/api/v1/playlists/${playlistId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(checkRes.status).toBe(404);
    });
  });
});
