import type { ComponentType } from 'react'
import welcomeMd from './welcome.md?raw'
import pretextSkeletonMd from './pretext-skeleton-poc.md?raw'
import htmlInCanvasMd from './html-in-canvas-a11y.md?raw'
import SkeletonPretextDemo from '@/components/lab/demos/SkeletonPretextDemo'

export type LabEntryType = 'thought' | 'poc' | 'random'

export type LabEntry = {
  slug: string
  title: string
  type: LabEntryType
  date: string // ISO
  excerpt: string
  tags?: string[]
  body: string
  demo?: ComponentType
}

export const labEntries: LabEntry[] = [
  {
    slug: 'html-in-canvas-a11y',
    title: 'Canvas Charts Have an Accessibility Problem',
    type: 'thought',
    date: '2026-06-12',
    excerpt:
      'A new Chrome flag (canvas-draw-element) lets you draw HTML into canvas while keeping the accessibility tree intact. Promising path for genuinely accessible dataviz — thinking through the implications for my analytics work.',
    tags: ['accessibility', 'canvas', 'charts', 'analytics', 'dataviz'],
    body: htmlInCanvasMd,
  },
  {
    slug: 'pretext-skeleton-poc',
    title: 'Skeleton Loaders That Don\'t Lie',
    type: 'poc',
    date: '2026-05-23',
    excerpt:
      'Using @chenglou/pretext to pre-calculate skeleton placeholders that match the eventual content exactly — zero layout shift when the real text lands.',
    tags: ['pretext', 'layout', 'performance', 'cls'],
    body: pretextSkeletonMd,
    demo: SkeletonPretextDemo,
  },
  {
    slug: 'welcome',
    title: 'Welcome to the Lab',
    type: 'random',
    date: '2026-05-22',
    excerpt:
      'A space for half-baked ideas, proof-of-concept experiments, and notes I want to keep public-ish.',
    tags: ['meta'],
    body: welcomeMd,
  },
]

export function getLabEntry(slug: string): LabEntry | undefined {
  return labEntries.find((e) => e.slug === slug)
}
