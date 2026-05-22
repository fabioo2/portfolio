import { Hero } from '@/components/home/Hero'
import { Summary } from '@/components/home/Summary'
import { Projects } from '@/components/home/Projects'
import { Skills } from '@/components/home/Skills'
import { Background } from '@/components/home/Background'
import { Personal } from '@/components/home/Personal'
import { ContactCTA } from '@/components/home/ContactCTA'

export default function Home() {
  return (
    <>
      <Hero />
      <Summary />
      <Projects />
      <Skills />
      <Background />
      <Personal />
      <ContactCTA />
    </>
  )
}
