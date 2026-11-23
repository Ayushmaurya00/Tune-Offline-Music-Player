import { Song, SpotifyTrack } from '@/types/music';

export interface MatchResult {
  spotifyTrack: SpotifyTrack;
  matchedSong: Song | null;
  confidence: number;
  isMatched: boolean;
}

function cleanString(str: string): string {
  return str
    .toLowerCase()
    .replace(/\(.*?\)/g, '') // remove parenthesized content like (feat. ...)
    .replace(/\[.*?\]/g, '') // remove bracketed content like [Official Video]
    .replace(/[^a-z0-9\s]/gi, '') // remove special characters
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (!str1 || !str2) return 0.0;

  const words1 = new Set(str1.split(' ').filter(Boolean));
  const words2 = new Set(str2.split(' ').filter(Boolean));

  let intersection = 0;
  for (const w of words1) {
    if (words2.has(w)) intersection++;
  }

  const union = new Set([...words1, ...words2]).size;
  return union === 0 ? 0 : intersection / union;
}

export function matchSingleTrack(track: SpotifyTrack, localSongs: Song[]): MatchResult {
  const cleanTrackTitle = cleanString(track.title);
  const cleanTrackArtist = cleanString(track.artist);

  let bestMatch: Song | null = null;
  let highestScore = 0;

  for (const song of localSongs) {
    const cleanSongTitle = cleanString(song.title);
    const cleanSongArtist = cleanString(song.artist);
    const cleanFileName = cleanString(song.fileName);

    const titleSim = calculateSimilarity(cleanTrackTitle, cleanSongTitle);
    const artistSim = calculateSimilarity(cleanTrackArtist, cleanSongArtist);
    const fileSim = calculateSimilarity(cleanTrackTitle, cleanFileName);

    // Composite score weighted towards title similarity
    let score = titleSim * 0.7 + artistSim * 0.3;

    // Check if filename directly includes the track title
    if (fileSim > 0.6) {
      score = Math.max(score, fileSim * 0.85);
    }

    // Direct substring bonus
    if (
      cleanSongTitle.includes(cleanTrackTitle) ||
      cleanTrackTitle.includes(cleanSongTitle) ||
      cleanFileName.includes(cleanTrackTitle)
    ) {
      score = Math.max(score, 0.85);
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = song;
    }
  }

  const isMatched = highestScore >= 0.65;

  return {
    spotifyTrack: track,
    matchedSong: isMatched ? bestMatch : null,
    confidence: highestScore,
    isMatched
  };
}

export function matchSpotifyTracks(
  spotifyTracks: SpotifyTrack[],
  localSongs: Song[]
): MatchResult[] {
  return spotifyTracks.map((track) => matchSingleTrack(track, localSongs));
}
