# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Audio enthusiasts managing and listening to personal music collections across desktop and Android.

## Product Purpose

Tune helps people find, organize, and play locally stored music, with controls for shaping playback and maintaining a personal library.

## Positioning

Core library and playback workflows work with local files without requiring an account or a streaming subscription. The project states that it has no telemetry.

## Operating Context

Listeners scan local folders or select audio files, browse and search their collections, manage playlists and liked tracks, and control playback. Desktop ships in Electron; Android is delivered through Capacitor.

## Capabilities and Constraints

- The app supports common local audio formats including MP3, M4A, WAV, FLAC, OGG, AAC, and OPUS.
- Existing workflows include library, folder, playlist, liked-song, queue, equalizer, and lyrics views.
- Preserve desktop keyboard and pointer interactions while providing touch-appropriate controls on Android.
- The renderer is shared between Electron and Capacitor; layouts must adapt to available window size.

## Brand Commitments

Keep the Tune name and existing Tune logo.

## Evidence on Hand

- Product description and capability inventory: `README.md`.
- Existing Tune logo and application implementation: `public/`, `src/renderer/`.
- No customer testimonials or third-party benchmark evidence is provided.

## Product Principles

- Personal music stays under the listener's control.
- Make library and playback tasks easy to scan and operate.
- Keep core listening useful without a network connection.
