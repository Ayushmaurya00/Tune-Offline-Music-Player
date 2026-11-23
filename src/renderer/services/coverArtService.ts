/**
 * Service to automatically resolve, fetch, and cache high-resolution album posters and artwork
 * for offline songs using iTunes Music Search API.
 */

const CACHE_PREFIX = 'tune_art_v2_';

class CoverArtService {
  private inFlightRequests = new Map<string, Promise<string | null>>();
  private memoryCache = new Map<string, string | null>();

  public cleanTrackQuery(title: string, artist?: string): { query: string; cleanTitle: string; cleanArtist: string } {
    let cleanTitle = (title || '')
      .replace(/\.[^/.]+$/, '') // remove file extension
      .replace(/^[0-9]+[\s._-]+/, '') // remove leading track numbers e.g. "01. "
      .replace(/\s*[([{\b](official\s*(music\s*)?video|video|audio|lyrics|hd|hq|1080p|720p|4k|320\s*kbps|remastered)[)\]}\b]/gi, '')
      .trim();

    let cleanArtist = (artist || '').trim();
    if (cleanArtist.toLowerCase() === 'local artist' || cleanArtist.toLowerCase() === 'unknown artist') {
      cleanArtist = '';
    }

    // If title has "Artist - Title" format, split them
    const dashMatch = cleanTitle.split(/\s*[-–—]\s*/);
    if (!cleanArtist && dashMatch.length >= 2) {
      cleanArtist = dashMatch[0].trim();
      cleanTitle = dashMatch.slice(1).join(' - ').trim();
    }

    const query = [cleanArtist, cleanTitle].filter(Boolean).join(' ');
    return { query, cleanTitle, cleanArtist };
  }

  public async getCoverArt(title: string, artist?: string): Promise<string | null> {
    if (!title || title.trim().length === 0) return null;

    const { query, cleanTitle, cleanArtist } = this.cleanTrackQuery(title, artist);
    const cacheKey = `${cleanArtist.toLowerCase()}__${cleanTitle.toLowerCase()}`;

    // 1. Check memory cache
    if (this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey) || null;
    }

    // 2. Check localStorage cache
    try {
      const stored = localStorage.getItem(CACHE_PREFIX + cacheKey);
      if (stored) {
        const val = stored === '__none__' ? null : stored;
        this.memoryCache.set(cacheKey, val);
        return val;
      }
    } catch {
      // ignore
    }

    // 3. Deduplicate in-flight network requests
    if (this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey)!;
    }

    const fetchPromise = (async () => {
      try {
        let posterUrl = await this.queryItunes(query);

        // Fallback: If artist + title returned 0 results, try with clean title only
        if (!posterUrl && cleanArtist && cleanTitle) {
          posterUrl = await this.queryItunes(cleanTitle);
        }

        // Cache result (store '__none__' for not found to avoid repeat queries)
        try {
          localStorage.setItem(CACHE_PREFIX + cacheKey, posterUrl || '__none__');
        } catch {
          // ignore storage limit
        }

        this.memoryCache.set(cacheKey, posterUrl);
        return posterUrl;
      } catch (err) {
        console.debug('Cover art fetch failed for', title, err);
        return null;
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
    })();

    this.inFlightRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  private async queryItunes(term: string): Promise<string | null> {
    if (!term || term.trim().length < 2) return null;

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const item = data.results[0];
      const rawArt = item.artworkUrl100 || item.artworkUrl60;
      if (rawArt) {
        // Upgrade 100x100 thumbnail to 600x600 high-resolution poster
        return rawArt.replace('100x100bb', '600x600bb').replace('60x60bb', '600x600bb');
      }
    }

    return null;
  }
}

export const coverArtService = new CoverArtService();

