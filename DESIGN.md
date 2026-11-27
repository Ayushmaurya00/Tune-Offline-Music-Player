# Tune App Design

<!-- impeccable:design-schema 1 -->

## Surface

`src/renderer/` is an adaptive **Operate** surface shared by Electron desktop and Capacitor Android. Its job is to make personal music collections easy to scan, organize, and play.

## Visual World

Tune is a local-first music player with a familiar, Spotify-inspired interface grammar. Keep Tune's own name, logo, and local-file workflows; do not use Spotify marks or imply Tune is Spotify. Use black navigation, charcoal content surfaces, bright green playback actions, pill-shaped search and primary controls, and artwork-led collection tiles. The result should feel direct and energetic while remaining easy to scan.

## Tokens

| Role | Token | Value |
|---|---|---|
| App canvas | `tune.bg` | `#121212` |
| Main surface | `tune.surface` | `#181818` |
| Raised surface | `tune.elevated` | `#242424` |
| Card surface | `tune.card` | `#282828` |
| Card hover | `tune.cardHover` | `#333333` |
| Rule / border | `tune.border` | `#3e3e3e` |
| Playback and selection accent | `tune.accent` | `#1ed760` |
| Accent hover | `tune.accentHover` | `#3be477` |
| Primary text | `tune.textPrimary` | `#ffffff` |
| Secondary text | `tune.textSecondary` | `#b3b3b3` |
| Muted text | `tune.textMuted` | `#8a8a8a` |

The bright green is Tune's app-wide playback accent; Spotify importer controls may retain Spotify's own branded green treatment.

## Layout and Interaction

- Desktop keeps the collection navigation, catalog, and persistent transport in view together.
- Android gives the collection full width, uses a five-destination thumb bar, and keeps only queue/play/next in the compact transport. Lyrics, equalizer, and other secondary controls stay in the expanded player.
- Use a black desktop navigation rail, charcoal cards, softly rounded song tiles, pill-shaped search and prominent actions, and clear current-track highlighting.
- Album artwork carries the collection's color; use vivid green consistently for primary play actions, seek progress, and active playback.
- Preserve the existing library, folder, playlist, liked-song, queue, lyrics, equalizer, and local-import workflows.
- Touch actions should remain comfortably reachable without hover. Keep keyboard focus visible on desktop and honor reduced-motion preferences.
