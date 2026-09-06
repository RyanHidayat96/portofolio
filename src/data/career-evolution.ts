export const publicCareerEvolution = {
  kicker: 'career.evolution',
  title: 'Career shape, not resume detail.',
  summary: 'Public portfolio keeps the path simple. Exact companies, dates, and responsibilities stay in the CV.',
  badge: 'Full Stack x SDET',
  thesis: {
    build: {
      title: 'Build foundation',
      summary: 'Application engineering, API thinking, backend work, and data flow.'
    },
    quality: {
      title: 'Quality instinct',
      summary: 'Automation, release confidence, failure analysis, and delivery gates.'
    }
  },
  milestones: [
    {
      label: '01',
      stage: 'Software Engineering Foundation',
      domains: ['Build', 'Backend', 'Data'],
      story: 'Application development foundation across backend, APIs, data, and production-minded troubleshooting.'
    },
    {
      label: '02',
      stage: 'Quality Engineering Depth',
      domains: ['Automation', 'API', 'Performance'],
      story: 'Testing discipline evolved into automation, failure analysis, reporting, and release confidence.'
    },
    {
      label: '03',
      stage: 'Full-Cycle Ownership',
      domains: ['Full Stack', 'Quality', 'Delivery'],
      story: 'This layer combines product build, data integrity, automation mindset, and delivery discipline.'
    }
  ]
} as const;
