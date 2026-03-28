export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  duration_ms: number;
  preview_url: string | null;
}

export interface TrackDetails {
  id: string;
  name: string;
  artistName: string;
  albumName: string;
  albumArt: string | null;
  durationMs: number;
  spotifyUrl: string;
  previewUrl: string | null;
}

export interface SpotifySearchResult {
  tracks: {
    items: SpotifyTrack[];
    total: number;
  };
}

export interface SearchQueryParams {
  q: string;
  limit?: number;
  offset?: number;
}

export interface SpotifyFeaturedResponse {
  message: string;
  playlists: {
    items: {
      id: string;
      name: string;
      images: { url: string }[];
      description: string;
    }[];
  };
}

export interface SpotifyNewReleasesResponse {
  albums: {
    items: {
      id: string;
      name: string;
      images: { url: string }[];
      artists: { name: string }[];
    }[];
  };
}
