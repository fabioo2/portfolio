# Skeleton Loaders That Don't Lie

Skeleton loaders are the default UX pattern for "content is coming." But almost every implementation lies — the skeleton is a guess (usually 3 gray bars), and when the real content arrives, the layout shifts.

I've been wanting to try [chenglou/pretext](https://github.com/chenglou/pretext), a JavaScript text-measurement library that side-steps the DOM. Its pitch: compute line counts and exact text height using pure arithmetic, no `getBoundingClientRect`, no reflow. This means you can pre-render a skeleton that matches the eventual content **exactly**.

## The problem with naive skeletons

Every UI framework has a `<Skeleton />` component that looks like this:

```tsx
<Skeleton lines={3} />
```

It renders 3 gray bars regardless of what's coming. When the real content lands, three things might happen:

1. **Content is shorter than 3 lines** → empty space below it for a moment, then collapses → jump
2. **Content matches 3 lines** → great, no shift (you got lucky)
3. **Content is longer** → page below it gets pushed down → jump

The third case is the worst — anything below the skeleton (a "Read more" button, the next card, a comments section) physically moves on the page right as the user is reading.

## What pretext lets you do

Two function calls:

```ts
import { prepare, layout } from '@chenglou/pretext'

const prepared = prepare(text, '16px Inter')
const { lineCount, height } = layout(prepared, containerWidth, lineHeight)
```

`prepare()` does the heavy work once (segment the text, measure with canvas, cache the segments). `layout()` is pure arithmetic on top of that cache — call it on every resize without paying for reflow.

Now render `lineCount` skeleton bars, sized to total `height`px. When the real text lands and replaces the skeleton, the container's height **doesn't change**. Zero shift.

## Why this matters

Layout shift is one of the [Core Web Vitals](https://web.dev/articles/cls) Google tracks. Most "loading state" code on the web fails this benchmark in a small, constant way that adds up over a session. Pretext makes the fix free: it's the same five lines whether your content is a tweet, a 2000-word article, or mixed-language UGC with emoji.

The bigger idea: any time you'd reach for `getBoundingClientRect` to measure text, you can probably do it with pretext instead. Virtualized lists, masonry layouts, shrinkwrap text bubbles, server-side rendered cards — same trick.

## Caveats

- Requires `Intl.Segmenter` (modern browsers only — pretty universal now)
- You have to pass the same font string to pretext as your CSS uses (a small lie here breaks accuracy)
- Doesn't handle `font-variation-settings` or `font-feature-settings` outside the canvas font shorthand

For my use case (skeleton sizing for content cards), none of these matter.

## Try it

Edit the content or drag the width slider, then hit **Simulate Load**. Both columns render a skeleton for 2 seconds before the real text appears. The naive column always renders 3 fake lines; the pretext column reads the content and renders the right number of bars at the right height. When the load completes, the marker below each column tells you whether anything jumped.
