# Merret design (as shipped)

The world is the Maastricht Friday market itself: paper price cards, a green
market awning, handwritten yellow price tags, stall photos from the Markt.
Keep it. New pages reuse these tokens and pieces, not new ones.

## Tokens (`app/globals.css`)

| Token | Value | Use |
|---|---|---|
| `paper` | `#fbf8f1` | page background |
| `ink` | `#161616` | text; muted text is `ink/55` to `ink/70` |
| `awning` | `#1e5b3f` | primary actions, active nav, links |
| `price-yellow` | `#f7e84b` | price tags and the market clock only |
| `maastricht-red` | `#c8102e` | deal notes, errors |
| `cobble` | `#e6e3dc` | borders, dividers, skeleton/empty fills |
| `--radius` | `6px` | buttons `rounded-md`; price tags `2px` |

Type: Instrument Serif for headings (`display-xl`, `display-lg`, `display-md`),
Instrument Sans for interface text (`text-lede`, `text-meta`), Permanent Marker
for prices only (`font-price`).

Layout: `page-wide` (1200px) for the market and stalls, `page-narrow` for
reading and forms. Header and hero photos stay full-bleed.

## Rules

- Buttons: `h-12`, `bg-awning text-paper` for the main action, `ring-1 ring-cobble`
  for the secondary one. Tap targets are at least 44px (`min-h-11`).
- Product tiles use the studio photos in `public/produce/<key>.webp`; stalls use
  the market scenes in `assets/`. Never mix them, never use stock photos.
- Motion: one 180ms page enter (`.page-enter`), the cart bump and the cart bar.
  All of it is off under `prefers-reduced-motion`. No view transitions.
- The global `:focus-visible` ring is unlayered and beats utilities; override
  inline only where focus is moved by script.
- Demo mode shows one ink bar above the header. No other banners.
