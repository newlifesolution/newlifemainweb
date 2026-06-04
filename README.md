# newlifesolutions.dev

Single-file static landing — `index.html` with a Three.js wireframe-geometry background.

- **No build step.** Vercel serves the file as-is.
- Three.js loaded from CDN (jsdelivr, pinned to 0.160.0).
- Respects `prefers-reduced-motion` (static render, no loop).

## Previous site

The full Astro "grimorio" site (content collections, glosario, papiro components) is preserved in the **`astro-grimorio`** branch.

```bash
git checkout astro-grimorio   # restore the old site
```
