# Canvas Charts Have an Accessibility Problem

I've been heads-down on the SkillsWave Analytics Dashboard lately — utilization, engagement, and investment data rendered through Apache ECharts. The user-facing result is good. The screen-reader experience is not.

This isn't a SkillsWave problem. It's a **canvas problem**. Almost every charting library you'd reach for in 2026 — ECharts, Chart.js, D3 with `<canvas>`, Highcharts — ends up rendering pixels into a `<canvas>`. The DOM gets one element. The accessibility tree gets zero structural information about what's inside it. Screen readers see an unlabeled rectangle.

## The current workarounds, all bad

The standard mitigations all feel like patches:

- **Hidden data tables** rendered next to the chart with the same data
- **`aria-label`** stuffed with a long verbal description of what's in the canvas
- **SVG fallbacks** where possible (loses some performance and features)
- **Sonification** (rare; cool when Apple does it for Health, but few libraries support it)

Tables decouple from visual context. ARIA labels go stale and read like data dumps. SVG is slower at scale. Sonification is niche.

## Enter HTML-in-Canvas

There's a new Chrome flag (`canvas-draw-element`) being prototyped at [html-in-canvas.dev](https://html-in-canvas.dev/). It's in Chrome Canary and Brave Stable (Chromium 147+), behind a flag for now. The spec introduces three primitives:

1. **`layoutsubtree`** — an attribute marking canvas children for layout and hit testing
2. **`drawElementImage()`** — a canvas method that draws a child HTML element with transforms applied
3. **A `paint` event** — fires when the drawn element re-renders, so canvas can redraw efficiently

The key bit: **the HTML you draw stays in the accessibility tree.** Drawn elements are the fallback content. Screen readers, focus, and keyboard navigation all see what's actually on screen.

Here's why that's the whole ballgame: **the visual element and the accessible element become the same node.** Today, every workaround maintains two parallel realities — the canvas pixels over here, a hidden table or stuffed `aria-label` over there — and they drift. Someone updates the chart, forgets the table, and the screen-reader experience silently rots. With this spec there's one source of truth. The `<button>` a screen reader announces is the exact same `<button>` the canvas paints. Update one, both change. No duplication, nothing to keep in sync, nothing to go stale.

## Why I'm excited

I could build a bar chart where each bar is a real `<button>`. The canvas renders the bar visually (via WebGL or 2D), but the accessibility tree sees a list of focusable, labeled buttons. Tab through them. Screen reader reads *"Q1 2026 utilization: 4,200 users."* Hit Enter on one and trigger a drill-down. Tooltips become real popovers, not canvas-drawn boxes. Selection and zoom work via standard keyboard shortcuts.

That's a different category of UX from "the chart is over here and the parallel a11y table is over there."

## Building a POC

I built a small NFC-East-themed bar chart in the Lab to feel the shape of the API — Super Bowl wins per franchise, each bar a 3D cylinder in the team's colors. The [accessible-charts demo](https://html-in-canvas.dev/demos/accessible-charts/) on html-in-canvas.dev was a useful reference for the patterns.

The canvas paints the cylinder bars to a 2D context. Each row is a real `<button>` — focusable, Tab-navigable, with a full `aria-label` a screen reader announces and a live region that echoes the focused bar. When the flag is on, focusing a bar composites the team logo into the canvas via `drawElement()`, so the same DOM node that's in the accessibility tree is also a canvas-painted asset; without the flag it falls back to `drawImage` and the chart still works the same.

It's a "demonstrate one primitive cleanly" version rather than a full `layoutsubtree`-driven recreation. Putting the buttons inside `<canvas>` via `layoutsubtree` turned out brittle across the Chromium builds I tested — children either flicker or refuse to render — so I went with the more reliable architecture and used `drawElement()` as the showcased primitive.

Open questions I'm sitting with:

- How does this play with library-rendered canvases like ECharts, where the library owns the draw cycle and the canvas children?
- Does hit-testing for `layoutsubtree` children work for sub-rectangular shapes (a pie slice, a curved area)?
- What's the performance cost of keeping the accessibility tree in sync with thousands of drawn data points?
- Browser-only: with Chromium-only support today, what's the polyfill story? Is there a graceful degradation path other than "render a fallback table for non-Chromium"?

## The catch

It's behind a flag. It's experimental. Standards take time, and Safari + Firefox would need to follow. We're probably years away from "build for this in production" — but it's the first credible path I've seen toward accessible canvas dataviz that doesn't compromise on either visual quality or screen-reader fidelity.

## Got opinions?

If you've played with the flag, have thoughts on the spec, or know a different angle on accessible canvas charts I should be looking at — I'd love to hear it. Reach me at [fabio.kim@skillswave.com](mailto:fabio.kim@skillswave.com).
