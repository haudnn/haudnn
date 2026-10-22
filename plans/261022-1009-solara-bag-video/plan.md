# SOLARA bag promo video (9:16, ~12 s)

Status: v1 delivered — `output/solara-bag-12s-9x16.mp4` (720x1280, 25 fps, 12.0 s, AAC).

Built via OpenRouter (`OPENROUTER_API_KEY`): keyframes with `google/gemini-3-pro-image`
using `assets/` as references (`pipeline/keyframe.py`, `pipeline/prompts/`), motion with
`google/veo-3.1-fast` 720p 9:16 4 s, no audio (`pipeline/img2video.py`, `pipeline/video-prompts/`).
R3 = `r3` (lock turn) + `r3b` (flap opening, started from a frame of `r3`).
R5b is a real stop-motion: props revealed one by one from a bag-only frame to an edited
frame with props (same bag position). Text overlays rendered with Cormorant Garamond.
Music is a synthesized 128 BPM loop (no music provider key configured).
Placeholder tagline in R6: "Thanh lịch trong từng chi tiết".

## Outcome

A 720x1280 (or 1080x1920), ~12 s vertical ad for the black SOLARA bag that remakes the
reference video's shot order, fast cutting, camera angles and mood. Only composition and
motion come from the reference — never its green tote, heart charm, logo or props.

## Product (source of truth: `assets/`)

- `1-front.jpg`, `2-three-quarter.jpg`, `3-back-strap.jpg`, `4-logo-closeup.jpg`, `5-interior.jpg`
- Small plain black leather top-handle bag, trapezoid body, flap with V-angled lower edge.
- Fixed curved top handle; thin detachable shoulder strap with gold snap hooks and gold buckle.
- Gold eye-shaped turn-lock centred on the flap; gold "SOLARA" lettering below the lock.
- Interior: brown twill lining, black leather tag, small gold-zip pocket.
- No bag charm, not a tote. Add no detail that is not in the photos.

## Global look

Studio, pale mint gradient backdrop, cream floor. Even softbox light, soft shadows.
Minimal Korean/Japanese style, photoreal. Only female hands in long-sleeve white shirt, no face.
Props (no logos/brand text, sized for a small bag; cream/beige/black/pale gold): cream-case
phone, gold-case lipstick, black-frame sunglasses, beige leather card holder, round pocket
mirror, white wireless earbuds case, small key bunch.

## Shot list (timings from the reference cuts: 1.56, 2.92, 4.00, 5.44, 7.56, 10.52 s)

| # | Time (s) | Shot |
|---|----------|------|
| R1 | 0.00–0.60 | Bag slides into frame centre on mint backdrop. |
| R2 | 0.60–1.56 | Hand grips top handle and lifts bag off the floor. |
| R3 | 1.56–4.00 | Close-up of flap: finger turns the gold eye lock, then lifts the flap open (cut at 2.92). |
| R4 | 4.00–5.44 | Top-down into the brown-lined interior; hand pulls the small inner zip pocket. |
| R5a | 5.44–7.56 | Open bag centred; props float up one by one and hover around it. Text "TRONG TÚI CÓ GÌ?" thin serif, arched, in empty space above. |
| R5b | 7.56–10.52 | Flat lay, straight top-down: bag centred on cream; props appear one at a time, stop-motion, arranged around it. |
| R6 | 10.52–12.00 | Packshot: bag centred on mint, lipstick, mirror and card holder peeking out of the opening, strap draped beside. "SOLARA" + short tagline above the bag. |

Text only in R5a and R6, never over bag or props. Hard cuts only, no fades.
Light upbeat music, no voice-over.

## Steps

1. Generate a consistent first frame per shot with an image model, using `assets/` as product
   reference (image edit/reference mode). Check the lock, the SOLARA lettering and the black
   colour against the photos.
2. Image-to-video per shot (Veo / Hailuo), 9:16, with the motion above.
3. Overlay R5a/R6 text with ffmpeg (exact Vietnamese diacritics — do not let the model render text).
4. Trim to the timings, concatenate with hard cuts, add a royalty-free light track, export H.264 MP4.

## Avoid

Visible faces, warped hands or extra fingers, distorted SOLARA lettering, misspelled text,
bag colour shift, props with real brand logos, oversized props.
