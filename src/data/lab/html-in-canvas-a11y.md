# Canvas Charts Have an Accessibility Problem

I've been heads-down on the SkillsWave Analytics Dashboard lately, building out utilization, engagement, and investment data with Apache ECharts. We did get it accessible, to be clear. But getting there meant a pile of workarounds: off-screen elements mirroring the chart data, hijacking keyboard events to fake focus management, wiring up live regions by hand. It works, it just took a lot more effort than it should have, and it's fragile every time the chart changes.

That's not something I can pin on ECharts, though. It's a canvas problem, and it shows up in pretty much every charting library you'd reach for in 2026, whether that's Chart.js, D3 drawing to `<canvas>`, or Highcharts. They all rasterize to a single `<canvas>` element, and as far as the accessibility tree is concerned, that element is just an opaque rectangle with nothing inside it. Everything you do to make it accessible is bolted on from the outside.

## The current workarounds, all bad

There are a handful of standard ways to paper over this, and none of them are great:

- **Hidden data tables** rendered next to the chart with the same numbers. These drift out of sync with the visual and lose all the spatial context.
- **A stuffed `aria-label`** describing the whole chart in one long sentence. Reads like a data dump, and goes stale the moment the data changes.
- **An SVG fallback** where the library supports it. Slower once you're plotting a lot of points, and you give up some features.
- **Sonification**, which is genuinely cool when Apple does it in the Health app, but almost nothing supports it.

So you end up maintaining two versions of the same chart and hoping they stay in agreement. They don't.

## Enter HTML-in-Canvas

There's a new Chrome flag (`canvas-draw-element`) being prototyped at [html-in-canvas.dev](https://html-in-canvas.dev/). It's in Chrome Canary and Brave Stable (Chromium 147+), behind a flag for now. The spec introduces three primitives:

1. **`layoutsubtree`**, an attribute marking canvas children for layout and hit testing
2. **`drawElementImage()`**, a canvas method that draws a child HTML element with transforms applied
3. **A `paint` event** that fires when the drawn element re-renders, so canvas can redraw efficiently

The important part is that the HTML you draw stays in the accessibility tree. The drawn elements act as the fallback content, so screen readers, focus, and keyboard navigation all see what's genuinely on screen.

What makes that click for me is that the thing you see and the thing assistive tech reads stop being two separate objects. They're the same node. The `<button>` a screen reader announces is the same `<button>` the canvas paints, so there's no second copy to forget about and no table quietly going out of date behind your back.

## Why I'm excited

Picture a bar chart where every bar is an actual `<button>`. The canvas still does the visual rendering through WebGL or 2D, but the accessibility tree sees a list of focusable, labeled buttons. You can tab across them and hear *"Q1 2026 utilization: 4,200 users,"* press Enter to drill down, get real popovers instead of canvas-drawn tooltip boxes, and zoom or select with the keyboard shortcuts people already expect.

That's a world away from "here's the chart, and over there is the accessibility table that mostly matches it."

## Building a POC

To get a feel for the API I put together a small NFC East bar chart in the Lab: Super Bowl wins per franchise, each bar a 3D cylinder in the team's colors. The [accessible-charts demo](https://html-in-canvas.dev/demos/accessible-charts/) on html-in-canvas.dev was a handy reference while I figured out the patterns.

The cylinders are painted to a 2D context. Each row is a real `<button>` with a full `aria-label`, keyboard focus, and a live region that echoes whichever bar you're on. With the flag enabled, focusing a bar also composites the team logo into the canvas through `drawElement()`, which means the node sitting in the accessibility tree is doubling as a canvas-painted asset. Turn the flag off and it falls back to `drawImage`, and the chart behaves the same.

I'll be honest that this is a "show one primitive cleanly" demo rather than a faithful `layoutsubtree` recreation. I tried the version where the buttons live inside the `<canvas>` and it was flaky across the Chromium builds I tested, with children flickering or just not rendering. Rather than fight it, I leaned on the more reliable setup and let `drawElement()` carry the demo.

A few things I'm still chewing on:

- How does this work with library-rendered canvases like ECharts, where the library owns the draw cycle and the canvas children?
- Does hit-testing for `layoutsubtree` children hold up for non-rectangular shapes like a pie slice or a curved area?
- What does it cost to keep the accessibility tree synced when you're drawing thousands of data points?
- It's Chromium-only right now, so is there any polyfill story, or is the degradation path just "render a fallback table for everyone else"?

## The catch

It's behind a flag, it's experimental, and Safari and Firefox would both have to come along before any of this is real. Standards move slowly, so production use is probably years out. Even with all that, it's the first approach I've seen that points at accessible canvas dataviz without asking you to trade away either the visuals or the screen-reader experience.

## Got opinions?

If you've poked at the flag, have a take on the spec, or know an angle on accessible canvas charts I'm missing, I'd genuinely like to hear it. You can reach me at [fabio.kim@skillswave.com](mailto:fabio.kim@skillswave.com).
