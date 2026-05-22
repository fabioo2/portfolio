import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EntryCard } from '@/components/lab/EntryCard'
import { labEntries, type LabEntryType } from '@/data/lab'
import { markLabSeen } from '@/lib/labNotification'

type Filter = 'all' | LabEntryType

export default function Lab() {
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    markLabSeen()
  }, [])

  const filtered = useMemo(() => {
    const sorted = [...labEntries].sort((a, b) => b.date.localeCompare(a.date))
    return filter === 'all' ? sorted : sorted.filter((e) => e.type === filter)
  }, [filter])

  return (
    <section>
      <div className="container py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight">Lab</h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Notes, demos, and half-finished thoughts. Updated when I have something to say.
          </p>
        </motion.div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} className="w-full">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="thought">Thoughts</TabsTrigger>
            <TabsTrigger value="poc">POCs</TabsTrigger>
            <TabsTrigger value="random">Random</TabsTrigger>
          </TabsList>
          <TabsContent value={filter}>
            {filtered.length === 0 ? (
              <p className="text-muted-foreground py-12 text-center">
                Nothing here yet — check back soon.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-5 auto-rows-fr">
                {filtered.map((entry) => (
                  <EntryCard key={entry.slug} entry={entry} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
