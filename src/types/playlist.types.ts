import { Playlist, PlaylistTrack } from '@prisma/client';

export interface CreatePlaylistInput {
  name: string;
}

export interface UpdatePlaylistInput {
  name: string;
}

export interface AddTrackInput {
  spotifyTrackId: string;
  trackName: string;
  artistName: string;
  albumArt?: string | null;
  durationMs: number;
}

export interface PlaylistWithTracks extends Playlist {
  tracks: PlaylistTrack[];
}

export interface PlaylistDetails {
  id: string;
  name: string;
  userId: string;
  tracks: {
    id: string;
    spotifyTrackId: string;
    trackName: string;
    artistName: string;
    albumArt: string | null;
    durationMs: number;
    addedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
