import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { profile } from '@/data/resume'

export function ContactCTA() {
  return (
    <section className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl bg-zinc-950 text-zinc-50 p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
      >
        <div>
          <h3 className="font-serif text-2xl md:text-3xl font-medium leading-tight">
            Let's build something scalable.
          </h3>
          <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-md">
            Available for discussions regarding full-stack engineering and cloud architecture.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="bg-white text-zinc-950 hover:bg-zinc-200 shrink-0"
        >
          <a href={`mailto:${profile.email}`}>Send Message</a>
        </Button>
      </motion.div>
    </section>
  )
}
