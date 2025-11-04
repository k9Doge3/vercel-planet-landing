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
- Planet links: edit the `addPlanet` calls in `main.js` to change positions, colors, and target URLs
- Redirect timing: change the 1800ms timeout in `explode()`
- Explosion look: tweak fragment count, size, and colors (MAX_PARTS, geometry)
- Audio: adjust synth in `playLaunch()` and `playExplosion()` (WebAudio, no assets)
