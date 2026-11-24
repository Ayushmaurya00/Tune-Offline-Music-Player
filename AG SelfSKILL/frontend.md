# frontend.md: UI rules for coding agents

## 1. How to use this file
Read this file and `tokens.css` before writing any UI code. Do the §2 plan in writing first. Every color, size, space and radius must come from `tokens.css`; never write raw hex or arbitrary pixel values in components. Run the §9 audit before you say you are done. Nothing in this file is a default to copy. Fonts, hues and layout must be chosen for this project.

## 2. Plan before code (write it down)
1. **User and tone.** One sentence: who uses this, what they are trying to do, how the product should sound (clinical, warm, blunt, playful).
2. **Source material.** Name the real artifact of this domain (a ledger, a field guide, a cockpit panel, a recipe card, a timetable). Take texture, structure and vocabulary from it.
3. **Type pair.** Choose from §4 by personality, not by habit. One body face, at most one display face, one mono if needed.
4. **Hue.** Pick `--hue` and `--accent-hue` from the domain (sea, soil, signal, ink, rust), then set them in `tokens.css`.
5. **Layout thesis.** One sentence, plus a table of page sections and which §6 pattern each uses. Body text is left-aligned.
6. **Default check.** For each choice ask: "Would I pick this for any generic SaaS prompt?" If yes, change it. Also reject the second-order defaults: cream and terracotta, a lone italic serif word in a sans H1, Space Grotesk with Instrument Serif.

Light mode is the default. Use dark only when asked, or for developer tools, monitoring and media editing.

## 3. Anti-slop blacklist
| Never | Do instead |
|---|---|
| Inter, Roboto or Arial as the visible font by habit | A §4 pair chosen for the domain. Inter is fine only if an existing brand requires it. |
| Purple-indigo gradients, gradient text, glowing blobs | Flat surfaces. If a gradient is justified, keep it within one hue and under an 8% lightness shift. |
| Centered hero, pill badge above the H1, three identical icon cards | A left-aligned headline next to the real product (table, chart, diff, photo). Vary section geometry. |
| Colored left or top stripe on ordinary cards | Tonal surface step or a 1px border. Stripes only on callouts and alerts. |
| Cards inside cards | One level only. Separate groups with space or a hairline. |
| Border and large soft shadow on the same card | One boundary per surface: border (apps, dark mode) or tinted shadow (light marketing). |
| Radius above 24px on content cards | Use the radius tokens. 9999px only for pills and avatars. |
| Emoji as icons | One SVG set (Lucide, Phosphor, Tabler, SF Symbols), one stroke width. |
| Big tinted icon tile above every feature | A small inline icon, or none. |
| `01 02 03` on non-sequential items; an eyebrow above every heading | Number real steps only. Put the category word in the heading. |
| Stat banners with unsourced big numbers | Proof next to the feature it supports, with unit and period. |
| Glassmorphism, marquees, pulsing dots, blinking cursors | Blur only on floating chrome with an 80%+ opaque fallback. Static logo rows. |
| Hand-drawn SVG mascots, geometric filler art | Real UI crops, real photos, or empty space. |
| Lorem ipsum, "John Doe", "Acme" | Realistic domain data. |

## 4. Typography
- Body 16px minimum on web (17pt iOS, 16sp Android). Dense UI and table cells 13–14px. Nothing under 12px.
- Measure 45–75ch for prose (`max-width: 65ch`).
- Line height: display 1.05–1.15, headings 1.2, UI 1.35, body 1.55–1.7.
- Tracking: display −0.02 to −0.03em, body 0. All-caps only for one-line labels, with +0.05 to +0.10em.
- `text-wrap: balance` on headings, `pretty` on paragraphs. `tabular-nums` on every number column, price and timer. Use curly quotes, real apostrophes and ellipses.
- Self-host fonts. Match fallback metrics (`size-adjust`, `ascent-override`) so the swap causes no layout shift.
- Google fonts ship through `@fontsource-variable/<name>`. Fontshare fonts (Satoshi, Switzer, Cabinet Grotesk, Boska, Gambetta, Sentient) are **not** on Fontsource: download the files from fontshare.com, put them in `/public/fonts`, and declare `@font-face` yourself. Check the licence for each family.

Candidates by personality (starting list, pick from it only after the §2 check):
| Personality | Display | Body | Mono |
|---|---|---|---|
| Editorial, research | Newsreader, Source Serif 4, Sentient | Source Sans 3, DM Sans | IBM Plex Mono |
| Technical, devtools | Cabinet Grotesk, IBM Plex Sans | Switzer, IBM Plex Sans | JetBrains Mono |
| Regulated, finance | IBM Plex Sans 600 | IBM Plex Sans 400/500 | IBM Plex Mono |
| Playful, consumer | Bricolage Grotesque | Figtree, Manrope | Recursive |
| Luxury, hospitality | Boska, Gambetta | Switzer, Satoshi | IBM Plex Mono |
| Industrial, brutalist | Big Shoulders Display, Syne | Spline Sans, IBM Plex Sans | IBM Plex Mono |

Two projects in a row must not share the same pair.

## 5. Color
- Set `--hue` and `--accent-hue` in `tokens.css`; the lightness and chroma steps are already checked for AA across hues. Do not change the L values without re-checking contrast.
- Tint neutrals toward the brand hue (chroma 0.003–0.015). Never use pure black or pure white as dark-mode surfaces.
- 90% of pixels are canvas, surface and ink. Accent goes on the primary action, active state, focus ring and key data marks.
- Status colors always come with text or an icon.
- Charts get their own colorblind-safe series palette, separate from UI accent. Label series directly.
- Needs ≥ 4.5:1 for text and ≥ 3:1 for UI borders and icons. For dark mode, also confirm APCA Lc ≥ 75 for body text.
- Light accents with L above ~0.50 (orange, amber, mint) pass only as large text, icons and button fills. Do not use them for small links.

## 6. Layout
- Gaps between sections are at least 2–3× the gaps inside them (64–128px vs 8–16px). A heading sits closer to its own content than to the block above.
- Pick one structural motif and repeat it. Patterns to choose from:
  - **Product-artifact hero:** headline ≤ 10 words and one CTA beside a cropped real artifact.
  - **40/60 split:** sticky left rail for the thesis, scrolling proof on the right.
  - **Hairline grid:** cells divided by 1px borders, uneven spans, no shadows.
  - **Ledger / spec sheet:** label column (about 28%) and evidence column, with horizontal rules.
  - **Weighted bento:** one large cell and 2–3 smaller ones of unequal size. Never six equal tiles.
  - **App shell:** collapsible left sidebar (220–260px), 48–52px top bar, one quiet workspace.
- Use container queries and intrinsic layouts (flex-wrap, `minmax`, `clamp`) over device breakpoints.

## 7. Motion
- Move things only to show continuity, confirm a press, or connect two states.
- Durations: 100–150ms press and toggles, 150–200ms menus and tabs, 220–280ms dialogs and drawers. Zero for high-frequency actions (command palette filtering, list stepping).
- `--ease-out` for entrances and exits. Never `ease-in` on UI.
- Buttons press to `scale(0.97)`. Popovers start from `scale(0.95)` and `opacity 0`, never `scale(0)`, and open from their trigger (`transform-origin`).
- Animate only `transform`, `opacity`, `clip-path`. Never `width`, `height` or `margin`.
- Content is visible by default. If JS fails, nothing stays hidden.
- Honor `prefers-reduced-motion` (already in `tokens.css`).

## 8. Components and copy
**Components**
- Nav: 4–6 top-level items, active state shown by more than color.
- Buttons: one primary per screen. Labels are verb plus noun ("Export CSV"). Height 36px desktop, 44px touch. While loading, keep the width fixed and set `aria-busy`.
- Forms: visible label above the input, never placeholder-as-label. Inputs 40px desktop, 44px mobile, font ≥ 16px on mobile. Validate on blur or submit, tie errors with `aria-describedby`, allow paste.
- Tables: text left, numbers right with `tabular-nums`, sticky header, `aria-sort`, scroll wrapper on narrow screens.
- Dialogs and menus: use Radix, Base UI or React Aria for focus trap, Escape and focus return.
- Toasts for transient confirmations only. Errors that need action stay inline with `role="alert"`.
- Empty state: one sentence on what goes here and one action. Loading: skeletons that match final geometry. Errors: say what failed and how to fix it, keep user input, no "Oops".
- Icons: one set, one stroke (1.5 or 1.75px), 16px inline, 20px standalone. `aria-label` on icon-only buttons.

**Copy**
- Banned words: unleash, elevate, seamless, supercharge, empower, next-generation, world-class, cutting-edge, revolutionize, transform, game-changer, unlock, dive in, delve.
- No "Not X. Y." slogans. Short, plain sentences. Name features in the user's words.
- Sentence case everywhere. CTAs say the action and object ("Delete 3 files"), never "Submit" or "Learn more". One verb and noun per action across button, dialog and toast.

## 9. Per-surface rules
**Marketing site.** The first viewport holds the headline, one sentence, one CTA and real product proof. Alternate dense proof with whitespace. One `<h1>`, unique `<title>` (≤ 60 chars) and meta description (≤ 155), Open Graph tags, landmarks.

**Web app.** Chrome is quiet so data leads. Use 13–14px UI text, 32–36px controls. Ship Cmd/Ctrl+K, Escape to close, arrow-key navigation in lists. Put filters, sort and tabs in the URL. Update optimistically and roll back with an inline error.

**Native mobile (SwiftUI, Compose, Flutter, React Native).** Keep the same role names as `tokens.css` (`bgCanvas`, `bgSurface`, `text`, `accent`, `accentFg`, and so on) and map them to the platform's theme: asset-catalog colors in SwiftUI, `ColorScheme` / `ThemeExtension` in Compose and Flutter. Use the platform's type scale and Dynamic Type or `sp`, and test at 200%. Touch targets ≥ 44pt (iOS) or 48dp (Android), 8px apart. Primary navigation is a 3–5 item bottom bar. Respect safe-area insets. No hover-only controls. Every swipe has a tap alternative. Use tonal surface layers instead of shadows.

## 10. Accessibility, responsive, performance
- Visible `:focus-visible` ring (2px, 2px offset), never hidden behind sticky headers (`scroll-margin-top`). Targets ≥ 24px (WCAG 2.5.8). Native `<button>` and `<a>`, sequential headings, `alt` text, `lang` set.
- No horizontal scroll at 320, 375, 768, 1024, 1440px. Usable at 200% zoom. 16px side padding on mobile.
- LCP ≤ 2.5s: hero is an `<img>` with `fetchpriority="high"`, AVIF or WebP, with `srcset`. INP ≤ 200ms: keep client JS lean, render marketing pages on the server. CLS ≤ 0.1: set width and height or `aspect-ratio` on all media; lazy-load below the fold only.

## 11. Pre-delivery audit
Render the UI and screenshot it if you can. Mark each gate PASS or FAIL, then fix every FAIL and re-check.
1. **Identity.** In grayscale wireframe, does this look like this product and not any SaaS template?
2. **Blacklist.** Zero §3 violations.
3. **Token purity.** No raw hex or off-scale values in components.
4. **Type and spacing.** 65ch prose, balanced headings, tabular numbers, no clipped text.
5. **Contrast and dark mode.** All pairs pass in both themes; no stray white boxes in dark.
6. **States.** Hover, focus, active, disabled, loading, empty and error are built.
7. **Access and motion.** Full keyboard pass, reduced motion works, content visible without JS.
8. **Vitals.** No console errors, hero image eager, other media lazy, no layout shift.
