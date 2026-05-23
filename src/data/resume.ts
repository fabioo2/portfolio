export const profile = {
  name: 'Fabio Kim',
  title: 'Software Developer',
  titles: [
    'Software Developer',
    'Terraformer',
    'AI-Native Builder',
    'Design-Conscious Engineer',
  ],
  tagline:
    'Building scalable, cloud-native web applications with a focus on serverless architectures and accessible UI development.',
  location: 'Toronto, ON, Canada',
  email: 'fabio.kim@skillswave.com',
  links: {
    github: 'https://github.com/fabioo2',
    linkedin: 'https://www.linkedin.com/in/fabio-kim',
    resume: '/portfolio/Fabio_Kim_Resume.pdf',
  },
  summary: {
    intro:
      'Full-stack software developer with 5+ years of experience building cloud-native web applications in the EdTech industry. Specialized in serverless architectures on AWS, modern frontend frameworks (Lit, React), and accessible, internationalized UI development.',
    current:
      'Currently building SkillsWave, a corporate learning platform that helps employees leverage employer-sponsored education benefits.',
  },
}

export type HobbyIcon = 'gamepad' | 'cpu' | 'fish' | 'coffee'

export const personal = {
  intro:
    "Off the clock, I'm in Windsor, Ontario with my wife and our two cats, Blanket and Buttons. A few things I get into when I'm not working:",
  hobbies: [
    {
      icon: 'gamepad' as HobbyIcon,
      label: 'Gaming',
      detail: 'Diablo 4 and Old School RuneScape',
    },
    {
      icon: 'cpu' as HobbyIcon,
      label: 'IoT & Home Lab',
      detail: 'smart-home experiments and home-server automation — my GitHub is mostly Discord bots',
    },
    {
      icon: 'fish' as HobbyIcon,
      label: 'Fishing',
      detail: 'still chasing my first walleye',
    },
    {
      icon: 'coffee' as HobbyIcon,
      label: 'Espresso',
      detail: 'an ongoing hyperfixation',
    },
  ],
}

export type ProjectCard = {
  name: string
  period: string
  description: string
  tags: string[]
  url?: string
  external?: boolean
}

export const workProjects: ProjectCard[] = [
  {
    name: 'Analytics Dashboard',
    period: '2026 — Present',
    description:
      'Utilization, engagement, and investment dashboards for L&D admins. Designed the OpenSearch index mappings and aggregation queries that power them. Built generic chart and widget components on top of Apache ECharts, wrapped in Lit, so the team can compose new dashboards without re-implementing chart plumbing.',
    tags: ['Lit', 'OpenSearch', 'ECharts', 'Analytics'],
  },
  {
    name: 'Career Microservice',
    period: '2025 — 2026',
    description:
      'An AI/LLM-driven career recommendation engine, deployed as a standalone microservice. Normalizes and maps tenant-specific skill labels against the Lightcast taxonomy, then layers LLM-generated career-path suggestions on top. Node.js on AWS Lambda + DynamoDB, exposed via REST API to the main Nova platform.',
    tags: ['Microservice', 'AWS Lambda', 'Lightcast', 'LLM'],
  },
  {
    name: 'SkillsWave Core (Nova)',
    period: '2024 — Present',
    description:
      'The platform foundation. Lit Element components with MobX state on the frontend; Koa.js APIs on a serverless AWS stack (Lambda, DynamoDB, OpenSearch) on the backend. Infra via Terraform modules and GitHub Actions CI/CD. Stripe billing, multi-tenant SSO, persona management, and accessible internationalized (EN/FR/ES) flows on top.',
    tags: ['Lit', 'AWS', 'Terraform', 'CI/CD'],
  },
  {
    name: 'D2L Wave Spinout',
    period: '2024',
    description:
      'The technical spinout of D2L Wave into SkillsWave. Migrated AWS resources between organizations and re-homed static marketing sites and applications onto new accounts. Handled domain transfers, DNS cutovers, and CDN/SSL provisioning so customers saw no downtime.',
    tags: ['AWS', 'Route53', 'CloudFront', 'Migration'],
  },
]

export const personalProjects: ProjectCard[] = [
  {
    name: 'smartthings-discord-bot',
    period: 'Python · Docker',
    description:
      'A bridge between Samsung SmartThings and Discord for real-time IoT alerts. Monitors stove/oven states and sends smart notifications with configurable snooze controls.',
    tags: ['Python', 'Docker', 'IoT'],
    url: 'https://github.com/fabioo2/smartthings-discord-bot',
    external: true,
  },
  {
    name: 'tapo-catfood-monitor',
    period: 'Python · Gemini AI',
    description:
      'Computer vision system using a Tapo camera and Google Gemini AI to monitor cat food levels. Detects feeding events and provides automated tracking via Discord.',
    tags: ['Python', 'Gemini AI', 'Docker'],
    url: 'https://github.com/fabioo2/tapo-catfood-monitor',
    external: true,
  },
]

export const skills = {
  Languages: ['JavaScript', 'TypeScript', 'Python', 'SQL', 'C#', 'HTML', 'CSS'],
  Frameworks: ['Lit', 'Node.js', 'Koa.js', 'React', 'MobX', 'Serverless'],
  'Cloud / Infra': ['AWS', 'Terraform', 'Docker', 'CloudFront'],
  Tools: ['Git', 'GitHub Actions', 'Stripe', 'Auth0', 'Playwright', 'Mocha'],
}

export type Role = { title: string; dates: string }
export type ExperienceCompany = {
  company: string
  location: string
  roles: Role[]
}

export const experience: ExperienceCompany[] = [
  {
    company: 'SkillsWave',
    location: 'Remote',
    roles: [
      { title: 'Software Developer II', dates: 'May 2025 — Present' },
      { title: 'Software Developer', dates: 'Jul 2024 — May 2025' },
    ],
  },
  {
    company: 'D2L',
    location: 'Kitchener, ON / Remote',
    roles: [
      { title: 'Software Developer — Wave Engineering', dates: 'Jun 2024 — Jul 2024' },
      { title: 'Web Developer II', dates: 'Nov 2021 — Jun 2024' },
      { title: 'Courseware Developer', dates: 'Sep 2020 — Nov 2021' },
    ],
  },
  {
    company: 'CHUNGDAHM Learning',
    location: 'Seoul, South Korea',
    roles: [
      {
        title: 'Manager / Curriculum Developer / Instructor',
        dates: 'Jan 2015 — May 2019',
      },
    ],
  },
]

export type Education = { school: string; credential: string }

export const education: Education[] = [
  {
    school: 'York University',
    credential: 'Certificate in DevOps (2023)',
  },
  {
    school: 'University of Toronto',
    credential: 'Bachelor of Arts, Philosophy',
  },
]
