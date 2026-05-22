import welcomeMd from './welcome.md?raw'
import serverlessMd from './serverless-cold-starts.md?raw'

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
  {
    slug: 'serverless-cold-starts',
    title: 'Notes on Serverless Cold Starts',
    type: 'thought',
    date: '2026-05-18',
    excerpt:
      'What actually causes a cold start, what you can control, and when it doesn\'t matter.',
    tags: ['serverless', 'aws', 'lambda'],
    body: serverlessMd,
  },
]

export function getLabEntry(slug: string): LabEntry | undefined {
  return labEntries.find((e) => e.slug === slug)
}
