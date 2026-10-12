export interface LandingPageContent {
  topBar: {
    announcement: string;
    poweredBy: string;
    emailLiveText: string;
  };
  hero: {
    badge: string;
    poweredBy: string;
    headlinePrefix: string;
    headlineHighlight: string;
    headlineSuffix: string;
    subtitle: string;
    searchPlaceholder: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
    metric1_value: string;
    metric1_label: string;
    metric2_value: string;
    metric2_label: string;
    metric3_value: string;
    metric3_label: string;
    metric4_value: string;
    metric4_label: string;
  };
  portalsHub: {
    badge: string;
    title: string;
    subtitle: string;
    candidateTag: string;
    candidateTitle: string;
    candidateDescription: string;
    candidateBullet1: string;
    candidateBullet2: string;
    candidateBullet3: string;
    candidateBullet4: string;
    candidateBullet5: string;
    candidateCtaText: string;
    employerTag: string;
    employerTitle: string;
    employerDescription: string;
    employerBullet1: string;
    employerBullet2: string;
    employerBullet3: string;
    employerBullet4: string;
    employerBullet5: string;
    employerCtaText: string;
  };
  nigeriaEcosystem: {
    badge: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    card1_title: string;
    card1_desc: string;
    card2_title: string;
    card2_desc: string;
    card3_title: string;
    card3_desc: string;
  };
  featuredJobs: {
    badge: string;
    title: string;
    subtitle: string;
    viewAllText: string;
  };
  footer: {
    brandName: string;
    brandPoweredBy: string;
    tagline: string;
    copyright: string;
    badge1: string;
    badge2: string;
    badge3: string;
  };
}

export const DEFAULT_LANDING_CONTENT: LandingPageContent = {
  topBar: {
    announcement: 'JOBHUB • Nigeria & Global Tech Talent Infrastructure',
    poweredBy: 'powered by genesix initiate group ltd',
    emailLiveText: 'Email Automation Live',
  },
  hero: {
    badge: 'JOBHUB Nigeria & Global Talent Network',
    poweredBy: 'powered by genesix initiate group ltd',
    headlinePrefix: 'Connecting ',
    headlineHighlight: 'Top African & Global Talent',
    headlineSuffix: ' with High-Growth Tech Teams',
    subtitle:
      'Discover verified software engineering, product, and leadership vacancies across Lagos, Abuja, African tech hubs, and global remote organizations. Verified candidates, ATS resumes, and real-time application pipelines.',
    searchPlaceholder: 'Job title, skills (e.g. React, Flutter, Go, Python, NYSC)...',
    primaryCtaText: 'Browse Verified Vacancies',
    primaryCtaLink: '/jobs',
    secondaryCtaText: 'Post a Job for Employers',
    secondaryCtaLink: '/employer/jobs/create',
    metric1_value: '14,200+',
    metric1_label: 'Verified Positions',
    metric2_value: '850+',
    metric2_label: 'Vetted Organizations',
    metric3_value: '₦120M+',
    metric3_label: 'Talent Placed',
    metric4_value: '99.4%',
    metric4_label: 'Match Accuracy',
  },
  portalsHub: {
    badge: 'JOBHUB Portal Ecosystem',
    title: 'Dedicated Workspaces for Candidates & Employers',
    subtitle:
      'Streamlined, specialized workflows for talent seeking career growth and employers scaling elite engineering teams.',
    candidateTag: 'PORTAL 01',
    candidateTitle: 'Candidate & Job Seeker Portal',
    candidateDescription:
      'Explore verified engineering roles, build ATS-ready CVs, apply with 1 click, take technical assessments, and attend live interviews.',
    candidateBullet1: 'Browse Verified Jobs (Nigeria & Global)',
    candidateBullet2: 'Top Hiring Tech Companies',
    candidateBullet3: 'Free ATS Resume & CV Builder',
    candidateBullet4: 'Live Application Tracker',
    candidateBullet5: 'Tech Interview Playbooks & Salary Guides',
    candidateCtaText: 'Sign In to Candidate Portal',
    employerTag: 'PORTAL 02',
    employerTitle: 'Employer & Recruiter Suite',
    employerDescription:
      'Post verified jobs, filter pre-screened Nigerian and international developers, manage Kanban recruitment stages, and schedule interviews.',
    employerBullet1: 'Post a Verified Opening',
    employerBullet2: 'Candidate Application Review',
    employerBullet3: 'Automated Recruitment Pipeline',
    employerBullet4: 'Video Technical Screening Rooms',
    employerBullet5: 'Company KYC & Verification Badges',
    employerCtaText: 'Employer & Recruiter Sign In',
  },
  nigeriaEcosystem: {
    badge: 'AFRICA & NIGERIA TECH CORRIDOR',
    title: 'Built for Nigerian Tech Professionals & Global Employers',
    subtitle:
      'JOBHUB connects tech talent from Lagos, Abuja, Yaba, Port Harcourt, and remote Nigeria with leading African unicorns (Paystack, Moniepoint, Interswitch) and international remote technology companies.',
    ctaText: 'Explore Nigeria Jobs (₦ Naira)',
    ctaLink: '/jobs?location=Nigeria',
    card1_title: 'Naira (₦) & Multi-Currency Salaries',
    card1_desc:
      'Clear salary disclosures formatted in Nigerian Naira (₦ NGN) alongside USD options, with transparent monthly and annual compensation benchmarking.',
    card2_title: 'NYSC & Graduate Trainee Support',
    card2_desc:
      'Dedicated category for fresh university graduates and National Youth Service Corps (NYSC) members with mentorship and primary assignment opportunities.',
    card3_title: 'Verified Tech Unicorns',
    card3_desc:
      'Direct connections to verified engineering departments at Paystack, Moniepoint, Interswitch, and venture-backed African startups.',
  },
  featuredJobs: {
    badge: 'LATEST OPPORTUNITIES',
    title: 'Verified Vacancies on JOBHUB',
    subtitle: 'Hand-vetted engineering, fintech, product, and leadership positions.',
    viewAllText: 'Explore All Jobs',
  },
  footer: {
    brandName: 'JOBHUB',
    brandPoweredBy: 'powered by genesix initiate group ltd',
    tagline:
      'JOBHUB connects tech talent with high-growth organizations across Nigeria, Africa, and global tech centers.',
    copyright: 'JOBHUB powered by genesix initiate group ltd. All rights reserved.',
    badge1: 'Verified Tech Rails',
    badge2: 'Lagos • Abuja • Global Remote',
    badge3: 'NDPR & GDPR Compliant',
  },
};

const STORAGE_KEY = 'jobhub_landing_page_content';

export const landingContentService = {
  getLandingContent(): LandingPageContent {
    if (typeof window === 'undefined') return DEFAULT_LANDING_CONTENT;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Deep merge with DEFAULT_LANDING_CONTENT to ensure new fields are populated
        return {
          topBar: { ...DEFAULT_LANDING_CONTENT.topBar, ...(parsed.topBar || {}) },
          hero: { ...DEFAULT_LANDING_CONTENT.hero, ...(parsed.hero || {}) },
          portalsHub: { ...DEFAULT_LANDING_CONTENT.portalsHub, ...(parsed.portalsHub || {}) },
          nigeriaEcosystem: {
            ...DEFAULT_LANDING_CONTENT.nigeriaEcosystem,
            ...(parsed.nigeriaEcosystem || {}),
          },
          featuredJobs: {
            ...DEFAULT_LANDING_CONTENT.featuredJobs,
            ...(parsed.featuredJobs || {}),
          },
          footer: { ...DEFAULT_LANDING_CONTENT.footer, ...(parsed.footer || {}) },
        };
      }
    } catch (e) {
      console.warn('Failed to parse landing page content', e);
    }
    return DEFAULT_LANDING_CONTENT;
  },

  saveLandingContent(content: LandingPageContent): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
      window.dispatchEvent(new CustomEvent('jobhub_landing_content_updated', { detail: content }));
    } catch (e) {
      console.error('Failed to save landing page content', e);
    }
  },

  resetLandingContent(): LandingPageContent {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(
        new CustomEvent('jobhub_landing_content_updated', { detail: DEFAULT_LANDING_CONTENT })
      );
    }
    return DEFAULT_LANDING_CONTENT;
  },
};
