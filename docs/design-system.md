# Design System Architecture

This project adopts the **Evil Martians (`evilmartians.com`)** design philosophy from [OpenDesignMD](https://opendesignmd.com/designs/evilmartians/), fused with OpenBSD's UNIX heritage and macOS desktop ergonomics.

See the root [`/DESIGN.md`](../DESIGN.md) for complete token definitions, color hierarchies, component geometry, and typography specs.

---

## Key Highlights

1. **Severe Developer Identity**:
   - High-contrast black and near-black surfaces (`#080c14` / `#000000`).
   - Content and code take precedence over decorative chrome.
2. **Figtree Typography System**:
   - Single sans-serif family (`var(--font-figtree)`) with weights 300 to 900.
   - Monospace used strictly for terminal output, virtual filesystem paths, and code blocks.
3. **Dynamic Pywal Theme Extraction**:
   - Wallpapers dynamically generate a 16-color ANSI palette and primary/secondary accents via HTML5 Canvas quantization.
4. **Local Frosted Liquid Glass**:
   - Blur and saturation (`blur(28px) saturate(160%)`) are strictly contained inside floating cards, topbar, and dock. Full-screen background blur is avoided.
5. **3-Tier Spacing System**:
   - `--space-outer-*`, `--space-inner-*`, and `--space-gap-*` variables standardizing margin, padding, and gap throughout the desktop.
