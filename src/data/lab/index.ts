import welcomeMd from './welcome.md?raw'

export type LabEntryType = 'thought' | 'poc' | 'random'

export type LabEntry = {
  slug: string
  title: string
  type: LabEntryType
  date: string // ISO
  excerpt: string
  tags?: string[]
  body: string
}

export const labEntries: LabEntry[] = [
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
