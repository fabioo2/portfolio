export const profile = {
  name: 'Fabio Kim',
  title: 'Software Developer',
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

export type ProjectCard = {
  name: string
  period: string
  description: string
  tags: string[]
  url?: string
  external?: boolean
}

export const projects: ProjectCard[] = [
  {
    name: 'SkillsWave',
    period: '2024 — Present',
    description:
      'A corporate learning platform built on a serverless AWS stack (Lambda, DynamoDB, OpenSearch). Implemented Stripe payment processing, multi-tenant SSO, and accessible, internationalized UI components in Lit Element.',
    tags: ['AWS', 'Lit', 'Terraform', 'Stripe'],
  },
  {
    name: 'D2L Wave',
    period: '2021 — 2024',
    description:
      'Led platform migration for the D2L Wave spinout. Built reusable web components integrated across the Brightspace learning ecosystem and deployed full-stack serverless cloud applications.',
    tags: ['Web Components', 'Node.js', 'Cloud Native'],
  },
  {
    name: 'IoT Notification Bridge',
    period: 'smartthings-discord-bot',
    description:
      'A bridge between Samsung SmartThings and Discord for real-time IoT alerts. Monitors stove/oven states and sends smart notifications with configurable snooze controls.',
    tags: ['Python', 'Docker', 'IoT'],
    url: 'https://github.com/fabioo2/smartthings-discord-bot',
    external: true,
  },
  {
    name: 'AI-Powered Vision System',
    period: 'tapo-catfood-monitor',
    description:
      'Computer vision system using a Tapo camera and Google Gemini AI to monitor cat food levels. Detects feeding events and provides automated tracking via Discord.',
    tags: ['Python', 'Gemini AI', 'Docker'],
    url: 'https://github.com/fabioo2/tapo-catfood-monitor',
    external: true,
  },
]

export const skills = {
  Languages: ['JavaScript', 'TypeScript', 'Python', 'SQL', 'C#', 'HTML', 'CSS'],
  Frameworks: ['Lit', 'Node.js', 'Koa.js', 'React', 'ASP.NET Core', 'MobX', 'Serverless'],
  'Cloud / Infra': ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'Ansible', 'CloudFront'],
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
