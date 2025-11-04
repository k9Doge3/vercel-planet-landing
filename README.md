# Vercel Planet Landing (Mercury → Gallery)

A lightweight Three.js demo that launches a rocket at Mercury, shatters it on impact, and then redirects to your gallery.

- Click Mercury to launch the rocket
- Impact triggers a simple fragment explosion
- Redirects to https://gallery.kylife.ca after ~1.8s

No build step required — static files only.

## Files
- `index.html` — Document and canvas
- `styles.css` — Minimal space-themed styling
- `main.js` — Three.js scene, rocket animation, explosion, and redirect

## Run locally
Open `index.html` directly, or serve the folder with any static server.

## Deploy on Vercel
- Create a new project pointing at this folder (framework: Other)
- Output directory: `.` (root)
- Attach `www.kylife.ca` (and `kylife.ca` if desired)

## Customization
- Redirect target: change the URL in `main.js` inside `setTimeout(() => window.location.href = 'https://gallery.kylife.ca', 1800)`
- Explosion look: tweak fragment count, size, and colors
- Add audio: play a short sound on click/impact (user gesture required)
