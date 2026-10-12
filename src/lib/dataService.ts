import { supabase, getSupabaseCredentials } from './supabase';
import {
  Job,
  Company,
  JobCategory,
  Skill,
  Application,
  Interview,
  Resume,
  Notification,
  Message,
} from '../types/database';

export interface JobFilterParams {
  query?: string;
  category?: string;
  location?: string;
  workMode?: string;
  employmentType?: string;
  salaryMin?: number;
  sortBy?: 'newest' | 'oldest' | 'salary_high' | 'salary_low' | 'relevance';
  page?: number;
  limit?: number;
}

export interface JobWithCompany extends Job {
  company: Company;
  skills?: Skill[];
  benefits?: string[];
  is_saved?: boolean;
}

// Fallback seed data in case Supabase is waiting for connection or SQL run
export const SEED_COMPANIES: Company[] = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    company_name: 'Apex Cloud Solutions',
    slug: 'apex-cloud-solutions',
    logo_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=150',
    description: 'Next-generation cloud infrastructure orchestration and developer toolchain.',
    industry: 'Information Technology',
    company_size: '51-200',
    founded_year: 2019,
    website: 'https://apexcloud.example.com',
    email: 'careers@apexcloud.example.com',
    phone: '+1 (555) 123-4567',
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    address: '100 Pine Street, Suite 1200',
    verification_status: 'verified',
    verified_at: new Date().toISOString(),
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    company_name: 'Vanguard Health Systems',
    slug: 'vanguard-health-systems',
    logo_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150',
    description: 'Premier regional hospital network delivering compassionate patient-first medical care.',
    industry: 'Healthcare & Medicine',
    company_size: '500-1000',
    founded_year: 2008,
    website: 'https://vanguardhealth.example.com',
    email: 'jobs@vanguardhealth.example.com',
    phone: '+1 (555) 234-8901',
    country: 'United States',
    state: 'Massachusetts',
    city: 'Boston',
    address: '75 Francis Street',
    verification_status: 'verified',
    verified_at: new Date().toISOString(),
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    company_name: 'Meridian Capital Partners',
    slug: 'meridian-capital-partners',
    logo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150',
    description: 'Global investment banking, asset management, and fintech advisory advisory firm.',
    industry: 'Banking & Financial Services',
    company_size: '201-500',
    founded_year: 2012,
    website: 'https://meridiancap.example.com',
    email: 'recruitment@meridiancap.example.com',
    phone: '+44 20 7946 0921',
    country: 'United Kingdom',
    state: 'Greater London',
    city: 'London',
    address: '25 Bank Street, Canary Wharf',
    verification_status: 'verified',
    verified_at: new Date().toISOString(),
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '30000000-0000-0000-0000-000000000004',
    company_name: 'Solaris Green Power',
    slug: 'solaris-green-power',
    logo_url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=150',
    description: 'Building utility-scale clean solar arrays and grid energy storage systems.',
    industry: 'Energy & Renewable Resources',
    company_size: '51-200',
    founded_year: 2021,
    website: 'https://solarisgreen.example.com',
    email: 'talent@solarisgreen.example.com',
    phone: '+49 30 1234567',
    country: 'Germany',
    state: 'Berlin',
    city: 'Berlin',
    address: 'Potsdamer Platz 1',
    verification_status: 'verified',
    verified_at: new Date().toISOString(),
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '30000000-0000-0000-0000-000000000005',
    company_name: 'Kinetix Global Logistics',
    slug: 'kinetix-global-logistics',
    logo_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150',
    description: 'Automated supply chain forwarding and smart cold-chain distribution network.',
    industry: 'Logistics & Supply Chain',
    company_size: '1000+',
    founded_year: 2014,
    website: 'https://kinetixlogistics.example.com',
    email: 'hr@kinetixlogistics.example.com',
    phone: '+1 (416) 555-0199',
    country: 'Canada',
    state: 'Ontario',
    city: 'Toronto',
    address: '400 Bay Street, Floor 14',
    verification_status: 'verified',
    verified_at: new Date().toISOString(),
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '30000000-0000-0000-0000-000000000006',
    company_name: 'Paystack Payments Nigeria',
    slug: 'paystack-nigeria',
    logo_url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=150',
    description: 'Modern payment infrastructure powering payments and commerce across Nigeria and Africa.',
    industry: 'Banking & Financial Services',
    company_size: '201-500',
    founded_year: 2016,
    website: 'https://paystack.com',
    email: 'careers@paystack.com',
    phone: '+234 1 888 8124',
    country: 'Nigeria',
    state: 'Lagos',
    city: 'Lagos (Victoria Island)',
    address: '1265 Commercial Avenue, Victoria Island',
    verification_status: 'verified',
    verified_at: new Date().toISOString(),
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '30000000-0000-0000-0000-000000000007',
    company_name: 'Moniepoint Financial Group',
    slug: 'moniepoint-financial',
    logo_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150',
    description: 'All-in-one financial ecosystem and digital banking rails powering 1M+ African businesses.',
    industry: 'Information Technology',
    company_size: '500-1000',
    founded_year: 2015,
    website: 'https://moniepoint.com',
    email: 'talent@moniepoint.com',
    phone: '+234 1 900 9021',
    country: 'Nigeria',
    state: 'Lagos',
    city: 'Lagos (Lekki Phase 1)',
    address: 'Plot 12 Admiralty Way, Lekki',
    verification_status: 'verified',
    verified_at: new Date().toISOString(),
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '30000000-0000-0000-0000-000000000008',
    company_name: 'Interswitch Group Africa',
    slug: 'interswitch-group',
    logo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150',
    description: 'Pioneering electronic transaction switching, digital payment cards, and payment gateway network.',
    industry: 'Banking & Financial Services',
    company_size: '1000+',
    founded_year: 2002,
    website: 'https://interswitchgroup.com',
    email: 'recruitment@interswitchgroup.com',
    phone: '+234 1 628 3888',
    country: 'Nigeria',
    state: 'Lagos',
    city: 'Lagos (Oko Awo)',
    address: '1644 Oko Awo Street, Victoria Island',
    verification_status: 'verified',
    verified_at: new Date().toISOString(),
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const SEED_JOBS: JobWithCompany[] = [
  {
    id: '40000000-0000-0000-0000-000000000001',
    company_id: '30000000-0000-0000-0000-000000000001',
    created_by: '00000000-0000-0000-0000-000000000001',
    category_id: '20000000-0000-0000-0000-000000000001',
    title: 'Senior Full-Stack TypeScript Engineer',
    slug: 'senior-full-stack-typescript-engineer',
    reference_number: 'JOB-2026-0001',
    description: 'Join our core cloud infrastructure team building high-performance web APIs and real-time distributed dashboards. You will work on low-latency data ingestion systems, collaborative web interfaces, and modern microfrontends.',
    responsibilities: 'Architect scalable microservices in Node.js and React; implement resilient PostgreSQL schemas and real-time WebSocket feeds; lead technical design reviews and mentor junior developers.',
    requirements: 'At least 5 years of professional TypeScript experience, strong proficiency in modern React, and deep knowledge of relational SQL databases.',
    education_requirement: 'Bachelor in Computer Science or equivalent practical experience',
    experience_min: 5,
    experience_max: 9,
    salary_min: 140000,
    salary_max: 180000,
    salary_currency: 'USD',
    salary_period: 'year',
    employment_type: 'full_time',
    work_mode: 'remote',
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    address: '100 Pine Street',
    vacancies: 2,
    application_deadline: new Date(Date.now() + 25 * 86400000).toISOString(),
    status: 'published',
    is_featured: true,
    is_sponsored: true,
    published_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    closed_at: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    company: SEED_COMPANIES[0],
    benefits: ['Comprehensive Medical, Dental & Vision', 'Unlimited Paid Time Off', '$3,000 Annual Learning Stipend', '401(k) Match up to 5%', 'Home Office Setup Budget'],
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    company_id: '30000000-0000-0000-0000-000000000001',
    created_by: '00000000-0000-0000-0000-000000000001',
    category_id: '20000000-0000-0000-0000-000000000001',
    title: 'DevOps & Kubernetes Specialist',
    slug: 'devops-kubernetes-specialist',
    reference_number: 'JOB-2026-0002',
    description: 'Manage high-availability multi-region Kubernetes clusters on AWS and Google Cloud Platform. You will streamline container lifecycles, enforce zero-trust security postures, and automate blue-green deployments.',
    responsibilities: 'Build automated CI/CD pipelines with GitHub Actions; maintain Terraform infrastructure as code; lead incident post-mortems and site reliability engineering.',
    requirements: 'Hands-on expertise with Docker, Kubernetes, Helm, Terraform, Prometheus, and Grafana. 4+ years in cloud ops.',
    education_requirement: 'Certifications like CKA or AWS Solutions Architect preferred',
    experience_min: 4,
    experience_max: 8,
    salary_min: 130000,
    salary_max: 165000,
    salary_currency: 'USD',
    salary_period: 'year',
    employment_type: 'full_time',
    work_mode: 'hybrid',
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    address: '100 Pine Street',
    vacancies: 1,
    application_deadline: new Date(Date.now() + 20 * 86400000).toISOString(),
    status: 'published',
    is_featured: false,
    is_sponsored: false,
    published_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    closed_at: null,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    company: SEED_COMPANIES[0],
    benefits: ['Health & Dental Coverage', 'Flexible Work Schedule', 'Relocation Assistance', 'Stock Options Grant'],
  },
  {
    id: '40000000-0000-0000-0000-000000000003',
    company_id: '30000000-0000-0000-0000-000000000002',
    created_by: '00000000-0000-0000-0000-000000000001',
    category_id: '20000000-0000-0000-0000-000000000002',
    title: 'Registered Nurse (ICU Critical Care)',
    slug: 'registered-nurse-icu-critical-care',
    reference_number: 'JOB-2026-0003',
    description: 'Deliver round-the-clock intensive critical patient care within a state-of-the-art cardiovascular ICU. Work closely with cardiothoracic surgeons, intensivists, and pharmacists.',
    responsibilities: 'Monitor vital telemetry and hemodynamic monitors; administer acute therapeutics; collaborate with multidisciplinary clinical teams.',
    requirements: 'Active RN license, BLS and ACLS certifications required, minimum 2 years intensive care nursing experience.',
    education_requirement: 'Bachelor of Science in Nursing (BSN)',
    experience_min: 2,
    experience_max: 6,
    salary_min: 85000,
    salary_max: 115000,
    salary_currency: 'USD',
    salary_period: 'year',
    employment_type: 'full_time',
    work_mode: 'on_site',
    country: 'United States',
    state: 'Massachusetts',
    city: 'Boston',
    address: '75 Francis Street',
    vacancies: 4,
    application_deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
    status: 'published',
    is_featured: true,
    is_sponsored: false,
    published_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    closed_at: null,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    company: SEED_COMPANIES[1],
    benefits: ['Full Medical, Dental, Vision & Life', 'Sign-on Bonus $10,000', 'Tuition Reimbursement', 'Retirement Pension Plan'],
  },
  {
    id: '40000000-0000-0000-0000-000000000004',
    company_id: '30000000-0000-0000-0000-000000000003',
    created_by: '00000000-0000-0000-0000-000000000001',
    category_id: '20000000-0000-0000-0000-000000000003',
    title: 'Senior Quantitative Financial Analyst',
    slug: 'senior-quantitative-financial-analyst',
    reference_number: 'JOB-2026-0004',
    description: 'Conduct deep valuation modeling, capital allocation reviews, and private debt risk assessment for European mid-market investments.',
    responsibilities: 'Construct multi-scenario DCF and LBO financial models; produce investment committee presentations; track portfolio metrics.',
    requirements: 'CFA designation or MBA, advanced Excel modeling and Python data processing skills. 3+ years in private equity or IB.',
    education_requirement: 'Master in Finance, Economics, or Mathematics',
    experience_min: 3,
    experience_max: 7,
    salary_min: 95000,
    salary_max: 130000,
    salary_currency: 'GBP',
    salary_period: 'year',
    employment_type: 'full_time',
    work_mode: 'hybrid',
    country: 'United Kingdom',
    state: 'Greater London',
    city: 'London',
    address: '25 Bank Street',
    vacancies: 2,
    application_deadline: new Date(Date.now() + 18 * 86400000).toISOString(),
    status: 'published',
    is_featured: true,
    is_sponsored: true,
    published_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    closed_at: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    company: SEED_COMPANIES[2],
    benefits: ['Competitive Performance Bonus', 'Private Healthcare', 'Executive Wellness Allowance', 'Central London Gym Membership'],
  },
  {
    id: '40000000-0000-0000-0000-000000000005',
    company_id: '30000000-0000-0000-0000-000000000004',
    created_by: '00000000-0000-0000-0000-000000000001',
    category_id: '20000000-0000-0000-0000-000000000015',
    title: 'Lead Renewable Energy Project Engineer',
    slug: 'lead-renewable-energy-project-engineer',
    reference_number: 'JOB-2026-0005',
    description: 'Oversee engineering, procurement, and construction of commercial 50MW solar energy installations across northern Germany.',
    responsibilities: 'Perform grid interconnection simulations; supervise site contractor safety and timeline compliance; review EPC contracts.',
    requirements: 'BS in Electrical Engineering, minimum 4 years in PV solar project engineering, knowledge of PVSyst and German grid codes.',
    education_requirement: 'Bachelor of Science in Electrical or Energy Engineering',
    experience_min: 4,
    experience_max: 10,
    salary_min: 75000,
    salary_max: 95000,
    salary_currency: 'EUR',
    salary_period: 'year',
    employment_type: 'full_time',
    work_mode: 'hybrid',
    country: 'Germany',
    state: 'Berlin',
    city: 'Berlin',
    address: 'Potsdamer Platz 1',
    vacancies: 1,
    application_deadline: new Date(Date.now() + 45 * 86400000).toISOString(),
    status: 'published',
    is_featured: false,
    is_sponsored: false,
    published_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    closed_at: null,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    company: SEED_COMPANIES[3],
    benefits: ['Company EV Car', 'JobTicket Public Transit', '30 Days Annual Leave', 'Green Energy Home Discount'],
  },
  {
    id: '40000000-0000-0000-0000-000000000006',
    company_id: '30000000-0000-0000-0000-000000000005',
    created_by: '00000000-0000-0000-0000-000000000001',
    category_id: '20000000-0000-0000-0000-000000000010',
    title: 'Logistics Operations & Route Coordinator',
    slug: 'logistics-operations-route-coordinator',
    reference_number: 'JOB-2026-0006',
    description: 'Optimize multi-stop cross-border trucking freight routes and carrier capacity utilization across North America.',
    responsibilities: 'Track active shipments; resolve customs clearance delays; audit fuel and driver safety logs in TMS software.',
    requirements: 'Familiarity with modern Transportation Management Systems (TMS) and freight billing compliance. 2+ years experience.',
    education_requirement: 'Diploma or Degree in Supply Chain or Logistics Management',
    experience_min: 2,
    experience_max: 5,
    salary_min: 65000,
    salary_max: 80000,
    salary_currency: 'CAD',
    salary_period: 'year',
    employment_type: 'full_time',
    work_mode: 'on_site',
    country: 'Canada',
    state: 'Ontario',
    city: 'Toronto',
    address: '400 Bay Street',
    vacancies: 3,
    application_deadline: new Date(Date.now() + 15 * 86400000).toISOString(),
    status: 'published',
    is_featured: false,
    is_sponsored: false,
    published_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    closed_at: null,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    company: SEED_COMPANIES[4],
    benefits: ['Full Dental & Extended Health', 'RRSP Matching', 'Subsidized Commuter Pass', 'Paid Overtime'],
  },
  {
    id: '40000000-0000-0000-0000-000000000007',
    company_id: '30000000-0000-0000-0000-000000000006',
    created_by: '00000000-0000-0000-0000-000000000001',
    category_id: '20000000-0000-0000-0000-000000000001',
    title: 'Senior Backend Engineer (Go / Node.js Payments)',
    slug: 'senior-backend-engineer-payments-nigeria',
    reference_number: 'JOB-2026-NG01',
    description: 'Build ultra-resilient distributed payment settlement engines and microservices handling millions of transactions daily across Nigerian banking switches and NIP rails.',
    responsibilities: 'Design low-latency idempotent payment webhooks; optimize PostgreSQL database queries; build fault-tolerant bank integration adapters; participate in high-availability on-call rotations.',
    requirements: 'Strong proficiency in Go or TypeScript/Node.js; deep experience with distributed transactions, Redis caching, and SQL; 4+ years software engineering.',
    education_requirement: 'BSc in Computer Science, Software Engineering or related field',
    experience_min: 4,
    experience_max: 9,
    salary_min: 1400000,
    salary_max: 2200000,
    salary_currency: 'NGN',
    salary_period: 'month',
    employment_type: 'full_time',
    work_mode: 'hybrid',
    country: 'Nigeria',
    state: 'Lagos',
    city: 'Lagos (Victoria Island)',
    address: '1265 Commercial Avenue, Victoria Island',
    vacancies: 3,
    application_deadline: new Date(Date.now() + 28 * 86400000).toISOString(),
    status: 'published',
    is_featured: true,
    is_sponsored: true,
    published_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    closed_at: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    company: SEED_COMPANIES[5],
    benefits: ['Comprehensive HMO Health Insurance (Family Cover)', 'Annual Performance Bonus in NGN/USD', 'Work-from-Home Tech Allowance', 'Gym & Wellness Membership (Lagos)', 'Pension Reform Act 10% Contribution'],
  },
  {
    id: '40000000-0000-0000-0000-000000000008',
    company_id: '30000000-0000-0000-0000-000000000007',
    created_by: '00000000-0000-0000-0000-000000000001',
    category_id: '20000000-0000-0000-0000-000000000001',
    title: 'Lead Mobile Flutter Engineer (Fintech App)',
    slug: 'lead-mobile-flutter-engineer-nigeria',
    reference_number: 'JOB-2026-NG02',
    description: 'Lead mobile development for our consumer banking application used by millions of Nigerian merchants and cardholders. Deliver smooth 60fps biometric authentication, offline sync, and real-time push feeds.',
    responsibilities: 'Architect modular Flutter application architecture; maintain CI/CD pipelines for Google Play Store and Apple App Store; optimize app bundle size and battery usage.',
    requirements: 'At least 4 years of production Flutter/Dart experience with state management (BLoC/Riverpod); experience with mobile encryption and secure enclave APIs.',
    education_requirement: 'BSc in Computer Science or demonstrable portfolio apps on Play Store',
    experience_min: 4,
    experience_max: 8,
    salary_min: 1500000,
    salary_max: 2400000,
    salary_currency: 'NGN',
    salary_period: 'month',
    employment_type: 'full_time',
    work_mode: 'remote',
    country: 'Nigeria',
    state: 'Lagos',
    city: 'Lagos / Remote Nigeria',
    address: 'Admiralty Way, Lekki',
    vacancies: 2,
    application_deadline: new Date(Date.now() + 35 * 86400000).toISOString(),
    status: 'published',
    is_featured: true,
    is_sponsored: false,
    published_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    closed_at: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    company: SEED_COMPANIES[6],
    benefits: ['Full Remote Flexibility across Nigeria', 'Top-tier HMO Medical Cover', 'High-end MacBook Pro M3 Provision', 'Dedicated Internet Stipend (₦50,000/mo)', 'Annual Team Retreat'],
  },
  {
    id: '40000000-0000-0000-0000-000000000009',
    company_id: '30000000-0000-0000-0000-000000000008',
    created_by: '00000000-0000-0000-0000-000000000001',
    category_id: '20000000-0000-0000-0000-000000000001',
    title: 'Graduate Trainee Software Engineer (2026 Cohort / NYSC)',
    slug: 'graduate-trainee-software-engineer-nysc-nigeria',
    reference_number: 'JOB-2026-NG03',
    description: 'Accelerate your engineering career through our intensive 12-month engineering fellowship. Open to recent graduates and corps members (NYSC) with strong algorithmic foundations and passion for fintech.',
    responsibilities: 'Participate in rotation across Core Switching, Cloud Infrastructure, and Merchant POS platforms; write clean unit-tested code; shadow senior engineering staff.',
    requirements: 'First Class or Second Class Upper in Computer Science, Electrical/Electronic Engineering, Mathematics, or Physics; familiarity with Python, Java, or JavaScript.',
    education_requirement: 'BSc / BEng with completion of or current deployment in NYSC',
    experience_min: 0,
    experience_max: 1,
    salary_min: 450000,
    salary_max: 750000,
    salary_currency: 'NGN',
    salary_period: 'month',
    employment_type: 'graduate_trainee',
    work_mode: 'hybrid',
    country: 'Nigeria',
    state: 'Lagos',
    city: 'Lagos (Victoria Island)',
    address: '1644 Oko Awo Street, Victoria Island',
    vacancies: 10,
    application_deadline: new Date(Date.now() + 40 * 86400000).toISOString(),
    status: 'published',
    is_featured: true,
    is_sponsored: false,
    published_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    closed_at: null,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    company: SEED_COMPANIES[7],
    benefits: ['Full Mentorship & Certification Sponsorship', 'Breakfast & Lunch Provided at Campus', 'HMO Health Insurance', 'Official NYSC Acceptance & Primary Assignment Support'],
  },
];

export const SEED_CATEGORIES: JobCategory[] = [
  { id: '20000000-0000-0000-0000-000000000001', name: 'Information Technology', slug: 'information-technology', description: 'Software engineering, cloud infrastructure, AI, and cybersecurity', icon: 'Code', is_active: true, created_at: '', updated_at: '' },
  { id: '20000000-0000-0000-0000-000000000002', name: 'Healthcare & Medicine', slug: 'healthcare-medicine', description: 'Clinical medicine, nursing, pharmacy, and medical research', icon: 'HeartPulse', is_active: true, created_at: '', updated_at: '' },
  { id: '20000000-0000-0000-0000-000000000003', name: 'Banking & Financial Services', slug: 'banking-financial-services', description: 'Investment banking, corporate finance, accounting, and fintech', icon: 'Landmark', is_active: true, created_at: '', updated_at: '' },
  { id: '20000000-0000-0000-0000-000000000004', name: 'Engineering & Construction', slug: 'engineering-construction', description: 'Civil, electrical, mechanical engineering, and architecture', icon: 'HardHat', is_active: true, created_at: '', updated_at: '' },
  { id: '20000000-0000-0000-0000-000000000005', name: 'Marketing & Communications', slug: 'marketing-communications', description: 'Brand strategy, digital growth, social media, and SEO', icon: 'Megaphone', is_active: true, created_at: '', updated_at: '' },
  { id: '20000000-0000-0000-0000-000000000006', name: 'Sales & Business Development', slug: 'sales-business-development', description: 'Account executive, enterprise sales, and client relationships', icon: 'TrendingUp', is_active: true, created_at: '', updated_at: '' },
  { id: '20000000-0000-0000-0000-000000000007', name: 'Human Resources', slug: 'human-resources', description: 'Talent acquisition, organizational development, and employee relations', icon: 'Users', is_active: true, created_at: '', updated_at: '' },
  { id: '20000000-0000-0000-0000-000000000010', name: 'Logistics & Supply Chain', slug: 'logistics-supply-chain', description: 'Fleet management, warehousing, freight forwarding, and procurement', icon: 'Truck', is_active: true, created_at: '', updated_at: '' },
  { id: '20000000-0000-0000-0000-000000000013', name: 'Design & Creative Arts', slug: 'design-creative-arts', description: 'Product UI/UX design, graphic design, 3D art, and video production', icon: 'Palette', is_active: true, created_at: '', updated_at: '' },
  { id: '20000000-0000-0000-0000-000000000015', name: 'Energy & Renewable Resources', slug: 'energy-renewable-resources', description: 'Solar, wind grid technology, battery storage, and clean utility', icon: 'Zap', is_active: true, created_at: '', updated_at: '' },
];

export const SEED_SKILLS: Skill[] = [
  { id: 's1', name: 'TypeScript', slug: 'typescript', category_id: '20000000-0000-0000-0000-000000000001', is_active: true, created_at: '', updated_at: '' },
  { id: 's2', name: 'React', slug: 'react', category_id: '20000000-0000-0000-0000-000000000001', is_active: true, created_at: '', updated_at: '' },
  { id: 's3', name: 'Node.js', slug: 'nodejs', category_id: '20000000-0000-0000-0000-000000000001', is_active: true, created_at: '', updated_at: '' },
  { id: 's4', name: 'PostgreSQL', slug: 'postgresql', category_id: '20000000-0000-0000-0000-000000000001', is_active: true, created_at: '', updated_at: '' },
  { id: 's5', name: 'Docker & Kubernetes', slug: 'docker-kubernetes', category_id: '20000000-0000-0000-0000-000000000001', is_active: true, created_at: '', updated_at: '' },
  { id: 's6', name: 'UI/UX Prototyping (Figma)', slug: 'figma-ui-ux', category_id: '20000000-0000-0000-0000-000000000013', is_active: true, created_at: '', updated_at: '' },
  { id: 's7', name: 'Financial Modeling', slug: 'financial-modeling', category_id: '20000000-0000-0000-0000-000000000003', is_active: true, created_at: '', updated_at: '' },
  { id: 's8', name: 'Clinical Patient Care', slug: 'clinical-patient-care', category_id: '20000000-0000-0000-0000-000000000002', is_active: true, created_at: '', updated_at: '' },
];

class DataService {
  private get isConnected(): boolean {
    const creds = getSupabaseCredentials();
    return Boolean(creds.url && creds.anonKey && !creds.url.includes('placeholder'));
  }

  // ---- JOBS ----
  async getJobs(filters: JobFilterParams = {}): Promise<{ jobs: JobWithCompany[]; total: number }> {
    if (this.isConnected) {
      try {
        let query = supabase
          .from('jobs')
          .select('*, company:companies(*)', { count: 'exact' })
          .eq('status', 'published');

        if (filters.query) {
          query = query.ilike('title', `%${filters.query}%`);
        }
        if (filters.category) {
          query = query.eq('category_id', filters.category);
        }
        if (filters.workMode) {
          query = query.eq('work_mode', filters.workMode);
        }
        if (filters.employmentType) {
          query = query.eq('employment_type', filters.employmentType);
        }
        if (filters.location) {
          query = query.or(`city.ilike.%${filters.location}%,state.ilike.%${filters.location}%,country.ilike.%${filters.location}%`);
        }

        if (filters.sortBy === 'salary_high') {
          query = query.order('salary_max', { ascending: false });
        } else if (filters.sortBy === 'salary_low') {
          query = query.order('salary_min', { ascending: true });
        } else if (filters.sortBy === 'oldest') {
          query = query.order('created_at', { ascending: true });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;
        if (!error && data && data.length > 0) {
          return { jobs: data as JobWithCompany[], total: count || data.length };
        }
      } catch (e) {
        console.warn('Falling back to local jobs catalog:', e);
      }
    }

    // Fallback in-memory filtered search
    let list = [...SEED_JOBS];
    if (filters.query) {
      const q = filters.query.toLowerCase();
      list = list.filter((j) => j.title.toLowerCase().includes(q) || j.company.company_name.toLowerCase().includes(q) || j.description.toLowerCase().includes(q));
    }
    if (filters.category) {
      list = list.filter((j) => j.category_id === filters.category);
    }
    if (filters.workMode) {
      list = list.filter((j) => j.work_mode === filters.workMode);
    }
    if (filters.employmentType) {
      list = list.filter((j) => j.employment_type === filters.employmentType);
    }
    if (filters.location) {
      const loc = filters.location.toLowerCase();
      list = list.filter((j) => (j.city && j.city.toLowerCase().includes(loc)) || (j.country && j.country.toLowerCase().includes(loc)));
    }

    if (filters.sortBy === 'salary_high') {
      list.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0));
    } else if (filters.sortBy === 'salary_low') {
      list.sort((a, b) => (a.salary_min || 0) - (b.salary_min || 0));
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return { jobs: list, total: list.length };
  }

  async getJobById(jobId: string): Promise<JobWithCompany | null> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*, company:companies(*)')
          .eq('id', jobId)
          .maybeSingle();

        if (!error && data) {
          return data as JobWithCompany;
        }
      } catch {
        // Fallback below
      }
    }

    const found = SEED_JOBS.find((j) => j.id === jobId);
    return found || null;
  }

  async getCategories(): Promise<JobCategory[]> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase
          .from('job_categories')
          .select('*')
          .eq('is_active', true)
          .order('name');
        if (!error && data && data.length > 0) return data as JobCategory[];
      } catch {}
    }
    return SEED_CATEGORIES;
  }

  async getSkills(): Promise<Skill[]> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .eq('is_active', true)
          .order('name');
        if (!error && data && data.length > 0) return data as Skill[];
      } catch {}
    }
    return SEED_SKILLS;
  }

  async getCompanies(): Promise<Company[]> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('company_name');
        if (!error && data && data.length > 0) return data as Company[];
      } catch {}
    }
    return SEED_COMPANIES;
  }

  async getCompanyById(id: string): Promise<Company | null> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return data as Company;
      } catch {}
    }
    return SEED_COMPANIES.find((c) => c.id === id) || null;
  }

  // ---- SAVED JOBS ----
  async getSavedJobs(userId: string): Promise<JobWithCompany[]> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase
          .from('saved_jobs')
          .select('job_id, job:jobs(*, company:companies(*))')
          .eq('user_id', userId);

        if (!error && data) {
          return data.map((d: any) => d.job).filter(Boolean) as JobWithCompany[];
        }
      } catch {}
    }

    const savedIds = JSON.parse(
      localStorage.getItem(`jobhub_saved_jobs_${userId}`) ||
        localStorage.getItem(`talentforge_saved_jobs_${userId}`) ||
        '["40000000-0000-0000-0000-000000000001"]'
    );
    return SEED_JOBS.filter((j) => savedIds.includes(j.id));
  }

  async toggleSaveJob(userId: string, jobId: string): Promise<boolean> {
    if (this.isConnected) {
      try {
        const { data: existing } = await supabase
          .from('saved_jobs')
          .select('id')
          .eq('user_id', userId)
          .eq('job_id', jobId)
          .maybeSingle();

        if (existing) {
          await supabase.from('saved_jobs').delete().eq('id', existing.id);
          return false;
        } else {
          await supabase.from('saved_jobs').insert({ user_id: userId, job_id: jobId });
          return true;
        }
      } catch {}
    }

    // Local storage toggle
    const key = `jobhub_saved_jobs_${userId}`;
    const legacyKey = `talentforge_saved_jobs_${userId}`;
    const saved = new Set<string>(
      JSON.parse(localStorage.getItem(key) || localStorage.getItem(legacyKey) || '["40000000-0000-0000-0000-000000000001"]')
    );
    let nowSaved = false;
    if (saved.has(jobId)) {
      saved.delete(jobId);
      nowSaved = false;
    } else {
      saved.add(jobId);
      nowSaved = true;
    }
    localStorage.setItem(key, JSON.stringify(Array.from(saved)));
    return nowSaved;
  }

  // ---- APPLICATIONS ----
  async getApplications(applicantId: string): Promise<any[]> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*, job:jobs(*, company:companies(*)), resume:resumes(*)')
          .eq('applicant_id', applicantId)
          .order('applied_at', { ascending: false });

        if (!error && data) return data;
      } catch {}
    }

    const stored = JSON.parse(
      localStorage.getItem(`jobhub_apps_${applicantId}`) ||
        localStorage.getItem(`talentforge_apps_${applicantId}`) ||
        '[]'
    );
    if (stored.length > 0) return stored;

    // Default sample applications for rich immediate dashboard view
    const initialApps = [
      {
        id: 'app-001',
        job_id: SEED_JOBS[0].id,
        applicant_id: applicantId,
        resume_id: 'resume-001',
        application_reference: 'APP-2026-X8Y7Z2',
        status: 'under_review',
        applied_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        job: SEED_JOBS[0],
        cover_letter: 'I have spent the last 6 years building cloud interfaces in React and TypeScript. Apex Cloud Solutions matches my engineering passion.',
      },
      {
        id: 'app-002',
        job_id: SEED_JOBS[1].id,
        applicant_id: applicantId,
        resume_id: 'resume-001',
        application_reference: 'APP-2026-K9M2L4',
        status: 'shortlisted',
        applied_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        job: SEED_JOBS[1],
        cover_letter: 'Experienced in Kubernetes microservices and container continuous delivery pipelines.',
      },
      {
        id: 'app-003',
        job_id: SEED_JOBS[3].id,
        applicant_id: applicantId,
        resume_id: 'resume-001',
        application_reference: 'APP-2026-F4N8T1',
        status: 'interview',
        applied_at: new Date(Date.now() - 12 * 86400000).toISOString(),
        job: SEED_JOBS[3],
        cover_letter: 'Excited to apply my analytical modeling and automated reporting skills to global fintech.',
      },
    ];
    localStorage.setItem(`jobhub_apps_${applicantId}`, JSON.stringify(initialApps));
    return initialApps;
  }

  async getApplicationById(id: string): Promise<any | null> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*, job:jobs(*, company:companies(*)), resume:resumes(*), answers:application_answers(*, question:application_questions(*)), history:application_status_history(*)')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) return data;
      } catch {}
    }

    const allApps = JSON.parse(
      localStorage.getItem('jobhub_apps_00000000-0000-0000-0000-0000000101') ||
        localStorage.getItem('talentforge_apps_00000000-0000-0000-0000-0000000101') ||
        '[]'
    );
    return allApps.find((a: any) => a.id === id) || null;
  }

  async submitApplication(params: {
    jobId: string;
    applicantId: string;
    resumeId?: string;
    coverLetter?: string;
    expectedSalary?: number;
    answers?: { questionId: string; answer: string }[];
  }): Promise<{ success: boolean; application?: any; error?: string }> {
    const year = new Date().getFullYear();
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const reference = `APP-${year}-${randomCode}`;

    if (this.isConnected) {
      try {
        const { data: appData, error: appError } = await supabase
          .from('applications')
          .insert({
            job_id: params.jobId,
            applicant_id: params.applicantId,
            resume_id: params.resumeId || null,
            cover_letter: params.coverLetter || null,
            expected_salary: params.expectedSalary || null,
            status: 'applied',
            application_reference: reference,
            applied_at: new Date().toISOString(),
          })
          .select('*, job:jobs(*, company:companies(*))')
          .single();

        if (appError) return { success: false, error: appError.message };

        // Save screening answers if provided
        if (params.answers && params.answers.length > 0 && appData) {
          await supabase.from('application_answers').insert(
            params.answers.map((a) => ({
              application_id: appData.id,
              question_id: a.questionId,
              answer: a.answer,
            }))
          );
        }

        return { success: true, application: appData };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    // Local state fallback
    const job = SEED_JOBS.find((j) => j.id === params.jobId) || SEED_JOBS[0];
    const newApp = {
      id: `app-${Date.now()}`,
      job_id: params.jobId,
      applicant_id: params.applicantId,
      resume_id: params.resumeId,
      cover_letter: params.coverLetter,
      expected_salary: params.expectedSalary,
      status: 'applied',
      application_reference: reference,
      applied_at: new Date().toISOString(),
      job,
    };

    const key = `jobhub_apps_${params.applicantId}`;
    const legacyKey = `talentforge_apps_${params.applicantId}`;
    const existing = JSON.parse(localStorage.getItem(key) || localStorage.getItem(legacyKey) || '[]');
    localStorage.setItem(key, JSON.stringify([newApp, ...existing]));

    return { success: true, application: newApp };
  }

  async withdrawApplication(appId: string, applicantId: string): Promise<boolean> {
    if (this.isConnected) {
      try {
        await supabase
          .from('applications')
          .update({ status: 'withdrawn', withdrawn_at: new Date().toISOString() })
          .eq('id', appId);
        return true;
      } catch {}
    }

    const key = `jobhub_apps_${applicantId}`;
    const legacyKey = `talentforge_apps_${applicantId}`;
    const apps = JSON.parse(localStorage.getItem(key) || localStorage.getItem(legacyKey) || '[]');
    const updated = apps.map((a: any) => (a.id === appId ? { ...a, status: 'withdrawn', withdrawn_at: new Date().toISOString() } : a));
    localStorage.setItem(key, JSON.stringify(updated));
    return true;
  }

  // ---- CV & RESUMES ----
  async getResumes(profileId: string): Promise<Resume[]> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('profile_id', profileId)
          .order('created_at', { ascending: false });

        if (!error && data) return data as Resume[];
      } catch {}
    }

    const key = `jobhub_resumes_${profileId}`;
    const legacyKey = `talentforge_resumes_${profileId}`;
    const saved = JSON.parse(localStorage.getItem(key) || localStorage.getItem(legacyKey) || '[]');
    if (saved.length > 0) return saved;

    const defaultResume: Resume = {
      id: 'resume-001',
      profile_id: profileId,
      title: 'Senior Frontend & React Resume (2026)',
      summary: 'Passionate software engineer with 6+ years designing accessible, high-performance web applications and design systems.',
      template_name: 'modern',
      file_url: null,
      is_primary: true,
      is_public: false,
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify([defaultResume]));
    return [defaultResume];
  }

  async createResume(profileId: string, resumeData: Partial<Resume>): Promise<Resume> {
    const newResume: Resume = {
      id: `resume-${Date.now()}`,
      profile_id: profileId,
      title: resumeData.title || 'Untitled CV',
      summary: resumeData.summary || '',
      template_name: resumeData.template_name || 'modern',
      file_url: resumeData.file_url || null,
      is_primary: resumeData.is_primary || false,
      is_public: resumeData.is_public || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isConnected) {
      try {
        const { data } = await supabase.from('resumes').insert(newResume).select().single();
        if (data) return data as Resume;
      } catch {}
    }

    const key = `jobhub_resumes_${profileId}`;
    const legacyKey = `talentforge_resumes_${profileId}`;
    const list = JSON.parse(localStorage.getItem(key) || localStorage.getItem(legacyKey) || '[]');
    localStorage.setItem(key, JSON.stringify([newResume, ...list]));
    return newResume;
  }

  async deleteResume(profileId: string, resumeId: string): Promise<void> {
    if (this.isConnected) {
      try {
        await supabase.from('resumes').delete().eq('id', resumeId);
      } catch {}
    }
    const key = `jobhub_resumes_${profileId}`;
    const legacyKey = `talentforge_resumes_${profileId}`;
    const list = JSON.parse(localStorage.getItem(key) || localStorage.getItem(legacyKey) || '[]');
    localStorage.setItem(key, JSON.stringify(list.filter((r: Resume) => r.id !== resumeId)));
  }

  // ---- INTERVIEWS ----
  async getInterviews(applicantId: string): Promise<any[]> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase
          .from('interviews')
          .select('*, application:applications(*, job:jobs(*, company:companies(*)))')
          .order('scheduled_at', { ascending: true });

        if (!error && data) return data;
      } catch {}
    }

    const sampleInterviews = [
      {
        id: 'interview-101',
        application_id: 'app-003',
        interview_type: 'technical',
        title: 'Technical Architectural Discussion',
        description: 'System design overview and frontend architecture deep-dive with VP of Engineering.',
        scheduled_at: new Date(Date.now() + 2 * 86400000 + 4 * 3600000).toISOString(),
        duration_minutes: 60,
        location: 'Virtual Google Meet',
        meeting_url: 'https://meet.google.com/xyz-talent-forge',
        status: 'confirmed',
        job: SEED_JOBS[0],
        company: SEED_COMPANIES[0],
      },
      {
        id: 'interview-102',
        application_id: 'app-002',
        interview_type: 'cultural',
        title: 'Team Values & Culture Conversation',
        description: 'Discussion on team collaboration and career goals with Engineering Manager.',
        scheduled_at: new Date(Date.now() + 5 * 86400000 + 2 * 3600000).toISOString(),
        duration_minutes: 45,
        location: 'Virtual Room',
        meeting_url: 'https://meet.google.com/abc-values-team',
        status: 'scheduled',
        job: SEED_JOBS[1],
        company: SEED_COMPANIES[0],
      },
    ];
    return sampleInterviews;
  }

  // ---- NOTIFICATIONS ----
  async getNotifications(userId: string): Promise<Notification[]> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) return data as Notification[];
      } catch {}
    }

    const key = `jobhub_notifs_${userId}`;
    const legacyKey = `talentforge_notifs_${userId}`;
    const saved = JSON.parse(localStorage.getItem(key) || localStorage.getItem(legacyKey) || '[]');
    if (saved.length > 0) return saved;

    const samples: Notification[] = [
      {
        id: 'notif-1',
        user_id: userId,
        type: 'application_status_change',
        title: 'Application Shortlisted! 🎉',
        message: 'Your application for Senior Full-Stack Engineer at Apex Cloud Solutions has been moved to Shortlisted.',
        data: { job_id: SEED_JOBS[0].id },
        read_at: null,
        created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
      },
      {
        id: 'notif-2',
        user_id: userId,
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        message: 'Apex Cloud Solutions scheduled a Technical Architectural Discussion for Thursday at 2:00 PM.',
        data: { interview_id: 'interview-101' },
        read_at: null,
        created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      },
      {
        id: 'notif-3',
        user_id: userId,
        type: 'job_alert',
        title: 'New Matching Job Found',
        message: 'A new role matching your "TypeScript" alert was just published by Solaris Green Power.',
        data: { job_id: SEED_JOBS[4].id },
        read_at: new Date(Date.now() - 48 * 3600000).toISOString(),
        created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
      },
    ];
    localStorage.setItem(key, JSON.stringify(samples));
    return samples;
  }

  async markNotificationRead(notifId: string, userId: string): Promise<void> {
    if (this.isConnected) {
      try {
        await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', notifId);
      } catch {}
    }
    const key = `jobhub_notifs_${userId}`;
    const legacyKey = `talentforge_notifs_${userId}`;
    const list = JSON.parse(localStorage.getItem(key) || localStorage.getItem(legacyKey) || '[]');
    const updated = list.map((n: Notification) => (n.id === notifId ? { ...n, read_at: new Date().toISOString() } : n));
    localStorage.setItem(key, JSON.stringify(updated));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    if (this.isConnected) {
      try {
        await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', userId);
      } catch {}
    }
    const key = `jobhub_notifs_${userId}`;
    const legacyKey = `talentforge_notifs_${userId}`;
    const list = JSON.parse(localStorage.getItem(key) || localStorage.getItem(legacyKey) || '[]');
    const updated = list.map((n: Notification) => ({ ...n, read_at: new Date().toISOString() }));
    localStorage.setItem(key, JSON.stringify(updated));
  }

  // ---- MESSAGES ----
  async getConversations(userId: string): Promise<any[]> {
    if (this.isConnected) {
      try {
        const { data } = await supabase
          .from('conversations')
          .select('*, participants:conversation_participants(*), messages:messages(*)');
        if (data) return data;
      } catch {}
    }

    return [
      {
        id: 'conv-001',
        partner: {
          name: 'Sarah Jenkins',
          title: 'Senior Recruiter at Apex Cloud Solutions',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
          online: true,
        },
        lastMessage: 'Hi Alex, the team reviewed your portfolio and we are eager to speak with you tomorrow!',
        lastTime: '10:45 AM',
        unread: 1,
      },
      {
        id: 'conv-002',
        partner: {
          name: 'David Keller',
          title: 'Talent Lead at Meridian Capital',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
          online: false,
        },
        lastMessage: 'Thank you for submitting your screening answers. We will be in touch shortly.',
        lastTime: 'Yesterday',
        unread: 0,
      },
    ];
  }

  // ---- STORAGE UPLOAD HELPER ----
  async uploadFile(bucket: string, path: string, file: File): Promise<{ url: string | null; error: string | null }> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
          cacheControl: '3600',
          upsert: true,
        });

        if (error) return { url: null, error: error.message };

        const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(path);
        return { url: pubData.publicUrl, error: null };
      } catch (err: any) {
        return { url: null, error: err.message };
      }
    }

    // Local object URL fallback
    const simulatedUrl = URL.createObjectURL(file);
    return { url: simulatedUrl, error: null };
  }
}

export const dataService = new DataService();
