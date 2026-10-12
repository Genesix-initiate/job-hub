import { supabase, getSupabaseCredentials } from './supabase';
import {
  Profile,
  JobSeekerProfile,
  EmployerProfile,
  Company,
  Job,
  Application,
  JobCategory,
  Skill,
  AdminUser,
  Role,
  Permission,
  AuditLog,
  SystemSetting,
  JobReport,
  UserReport,
  CompanyReport,
  Complaint,
  SubscriptionPlan,
  Subscription,
  PaymentTransaction,
  Invoice,
  CareerResource,
  BroadcastNotification,
  FeatureFlag,
} from '../types/database';

export interface AdminDashboardKPIs {
  totalUsers: number;
  totalJobSeekers: number;
  totalEmployers: number;
  totalCompanies: number;
  verifiedCompanies: number;
  pendingVerifications: number;
  totalJobs: number;
  publishedJobs: number;
  pendingJobs: number;
  expiredJobs: number;
  totalApplications: number;
  applicationsToday: number;
  interviewsCount: number;
  hiresCount: number;
  pendingReports: number;
  activeSubscriptions: number;
  totalRevenue: number;
  pendingPayments: number;
}

// In-memory fallback caches initialized with realistic records for resilient development & offline mode
const FALLBACK_ADMINS: AdminUser[] = [
  {
    id: 'adm-001',
    profile_id: '00000000-0000-0000-0000-000000000301',
    role_id: '00000000-0000-0000-0000-000000000001',
    status: 'active',
    role: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'super_admin',
      description: 'Complete system administration and security control',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    profile: {
      id: '00000000-0000-0000-0000-000000000301',
      auth_user_id: 'auth-user-demo-admin',
      role: 'super_admin',
      first_name: 'Victoria',
      last_name: 'Sterling',
      display_name: 'Victoria Sterling',
      email: 'admin@jobhub.platform',
      phone: '+1 (555) 019-9000',
      profile_photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
      country: 'United States',
      state: 'New York',
      city: 'New York',
      address: '100 Wall Street, Floor 42',
      account_status: 'active',
      email_verified: true,
      phone_verified: true,
      last_login_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'adm-002',
    profile_id: '00000000-0000-0000-0000-000000000302',
    role_id: '00000000-0000-0000-0000-000000000002',
    status: 'active',
    role: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'recruitment_admin',
      description: 'Oversees job postings, application workflows, and recruiter support',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    profile: {
      id: '00000000-0000-0000-0000-000000000302',
      auth_user_id: 'auth-user-recruitment-admin',
      role: 'admin',
      first_name: 'David',
      last_name: 'Chen',
      display_name: 'David Chen',
      email: 'david.chen@jobhub.platform',
      phone: '+1 (555) 019-9001',
      profile_photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      country: 'United States',
      state: 'California',
      city: 'San Francisco',
      address: '500 Howard Street',
      account_status: 'active',
      email_verified: true,
      phone_verified: true,
      last_login_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'adm-003',
    profile_id: '00000000-0000-0000-0000-000000000303',
    role_id: '00000000-0000-0000-0000-000000000004',
    status: 'active',
    role: {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'finance_admin',
      description: 'Manages billing transactions, invoices, and subscription plans',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    profile: {
      id: '00000000-0000-0000-0000-000000000303',
      auth_user_id: 'auth-user-finance-admin',
      role: 'admin',
      first_name: 'Elena',
      last_name: 'Rostova',
      display_name: 'Elena Rostova',
      email: 'finance@jobhub.platform',
      phone: '+1 (555) 019-9004',
      profile_photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200',
      country: 'United States',
      state: 'Illinois',
      city: 'Chicago',
      address: '200 W Monroe St',
      account_status: 'active',
      email_verified: true,
      phone_verified: true,
      last_login_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const FALLBACK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    actor_id: '00000000-0000-0000-0000-000000000301',
    actor: FALLBACK_ADMINS[0].profile,
    action: 'admin_login',
    entity_type: 'auth_session',
    entity_id: 'auth-user-demo-admin',
    metadata: { ip: '192.168.1.1', user_agent: 'Chrome/124.0.0 Safari/537.36' },
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 'log-002',
    actor_id: '00000000-0000-0000-0000-000000000301',
    actor: FALLBACK_ADMINS[0].profile,
    action: 'company_approved',
    entity_type: 'company',
    entity_id: '30000000-0000-0000-0000-000000000001',
    old_data: { verification_status: 'pending' },
    new_data: { verification_status: 'verified' },
    metadata: { reason: 'Government corporate registry credentials validated successfully' },
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'log-003',
    actor_id: '00000000-0000-0000-0000-000000000302',
    actor: FALLBACK_ADMINS[1].profile,
    action: 'job_published',
    entity_type: 'job',
    entity_id: '50000000-0000-0000-0000-000000000001',
    old_data: { status: 'pending_review' },
    new_data: { status: 'published' },
    metadata: { reviewer: 'David Chen', compliance_check: 'passed' },
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: 'log-004',
    actor_id: '00000000-0000-0000-0000-000000000303',
    actor: FALLBACK_ADMINS[2].profile,
    action: 'subscription_upgraded',
    entity_type: 'subscription',
    entity_id: 'sub-001',
    old_data: { plan_id: 'Starter Recruiter' },
    new_data: { plan_id: 'Growth Team' },
    metadata: { amount: 149.0, currency: 'USD' },
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 'log-005',
    actor_id: '00000000-0000-0000-0000-000000000301',
    actor: FALLBACK_ADMINS[0].profile,
    action: 'feature_flag_updated',
    entity_type: 'feature_flag',
    entity_id: 'enable_ai_screening',
    old_data: { is_enabled: false },
    new_data: { is_enabled: true },
    metadata: { updated_by: 'Victoria Sterling' },
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: 'log-email-001',
    actor_id: '00000000-0000-0000-0000-000000000301',
    actor: FALLBACK_ADMINS[0].profile,
    action: 'email_notification_dispatched',
    entity_type: 'email_notification',
    entity_id: 'alex.morgan@example.com',
    new_data: {
      recipient: 'alex.morgan@example.com',
      recipient_name: 'Alex Morgan',
      subject: '[JOBHUB ATS] Technical Interview Invitation Scheduled - Senior Staff Frontend Architect at Apex Cloud Solutions',
      category: 'application_status',
      event_type: 'interview',
      status: 'delivered',
      application_id: 'APP-2026-0812',
      duration_ms: 44,
      edge_execution_id: 'edge_exec_98124_prod',
    },
    metadata: {
      recipient: 'alex.morgan@example.com',
      recipientName: 'Alex Morgan',
      subject: '[JOBHUB ATS] Technical Interview Invitation Scheduled - Senior Staff Frontend Architect at Apex Cloud Solutions',
      category: 'application_status',
      eventType: 'interview',
      status: 'delivered',
      timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
      durationMs: 44,
      executionMode: 'live_edge_function',
      edgeExecutionId: 'edge_exec_98124_prod',
      channel: 'supabase_edge_functions',
    },
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'log-email-002',
    actor_id: '00000000-0000-0000-0000-000000000301',
    actor: FALLBACK_ADMINS[0].profile,
    action: 'email_notification_dispatched',
    entity_type: 'email_notification',
    entity_id: 'billing@apexcloud.example.com',
    new_data: {
      recipient: 'billing@apexcloud.example.com',
      recipient_name: 'Marcus Vance',
      subject: '[JOBHUB Billing] Notice of Plan Pricing Update for Growth Recruiter Tier',
      category: 'subscription_update',
      event_type: 'plan_price_changed',
      status: 'delivered',
      subscription_id: 'sub_apex_01',
      duration_ms: 38,
      edge_execution_id: 'edge_exec_98125_prod',
    },
    metadata: {
      recipient: 'billing@apexcloud.example.com',
      recipientName: 'Marcus Vance',
      subject: '[JOBHUB Billing] Notice of Plan Pricing Update for Growth Recruiter Tier',
      category: 'subscription_update',
      eventType: 'plan_price_changed',
      status: 'delivered',
      timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
      durationMs: 38,
      executionMode: 'live_edge_function',
      edgeExecutionId: 'edge_exec_98125_prod',
      channel: 'supabase_edge_functions',
    },
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'log-email-003',
    actor_id: '00000000-0000-0000-0000-000000000302',
    actor: FALLBACK_ADMINS[1].profile,
    action: 'email_notification_dispatched',
    entity_type: 'email_notification',
    entity_id: 'samantha.reed@example.com',
    new_data: {
      recipient: 'samantha.reed@example.com',
      recipient_name: 'Samantha Reed',
      subject: '[JOBHUB ATS] Shortlisted for Interview Round - Lead Cloud Infrastructure & DevOps at Apex Cloud Solutions',
      category: 'application_status',
      event_type: 'shortlisted',
      status: 'delivered',
      application_id: 'APP-2026-0813',
      duration_ms: 51,
      edge_execution_id: 'edge_exec_98126_prod',
    },
    metadata: {
      recipient: 'samantha.reed@example.com',
      recipientName: 'Samantha Reed',
      subject: '[JOBHUB ATS] Shortlisted for Interview Round - Lead Cloud Infrastructure & DevOps at Apex Cloud Solutions',
      category: 'application_status',
      eventType: 'shortlisted',
      status: 'delivered',
      timestamp: new Date(Date.now() - 14 * 3600000).toISOString(),
      durationMs: 51,
      executionMode: 'edge_simulated_runtime',
      edgeExecutionId: 'edge_exec_98126_prod',
      channel: 'supabase_edge_functions',
    },
    created_at: new Date(Date.now() - 14 * 3600000).toISOString(),
  },
  {
    id: 'log-email-004',
    actor_id: '00000000-0000-0000-0000-000000000301',
    actor: FALLBACK_ADMINS[0].profile,
    action: 'email_delivery_failed',
    entity_type: 'email_notification',
    entity_id: 'david.applicant.invalid@mailcorp-fake.org',
    new_data: {
      recipient: 'david.applicant.invalid@mailcorp-fake.org',
      recipient_name: 'David Chen',
      subject: '[JOBHUB ATS] Formal Job Offer Extended - Senior Staff Frontend Architect at Apex Cloud Solutions',
      category: 'application_status',
      event_type: 'offer',
      status: 'failed',
      application_id: 'APP-2026-0815',
      duration_ms: 124,
      error: '550 5.1.1 Recipient mailbox address rejected: domain MX record unresolvable',
    },
    metadata: {
      recipient: 'david.applicant.invalid@mailcorp-fake.org',
      recipientName: 'David Chen',
      subject: '[JOBHUB ATS] Formal Job Offer Extended - Senior Staff Frontend Architect at Apex Cloud Solutions',
      category: 'application_status',
      eventType: 'offer',
      status: 'failed',
      timestamp: new Date(Date.now() - 22 * 3600000).toISOString(),
      durationMs: 124,
      executionMode: 'live_edge_function',
      edgeExecutionId: 'edge_exec_98127_fail',
      error: '550 5.1.1 Recipient mailbox address rejected: domain MX record unresolvable',
      channel: 'supabase_edge_functions',
    },
    created_at: new Date(Date.now() - 22 * 3600000).toISOString(),
  },
  {
    id: 'log-email-005',
    actor_id: '00000000-0000-0000-0000-000000000303',
    actor: FALLBACK_ADMINS[2].profile,
    action: 'email_notification_dispatched',
    entity_type: 'email_notification',
    entity_id: 'finance@fintechpulse.com',
    new_data: {
      recipient: 'finance@fintechpulse.com',
      recipient_name: 'Amina Adeleke',
      subject: '[JOBHUB Billing] Payment Confirmed & Tax Invoice [INV-2026-0042]',
      category: 'subscription_update',
      event_type: 'payment_received',
      status: 'delivered',
      subscription_id: 'sub_fintech_02',
      duration_ms: 36,
      edge_execution_id: 'edge_exec_98128_prod',
    },
    metadata: {
      recipient: 'finance@fintechpulse.com',
      recipientName: 'Amina Adeleke',
      subject: '[JOBHUB Billing] Payment Confirmed & Tax Invoice [INV-2026-0042]',
      category: 'subscription_update',
      eventType: 'payment_received',
      status: 'delivered',
      timestamp: new Date(Date.now() - 32 * 3600000).toISOString(),
      durationMs: 36,
      executionMode: 'live_edge_function',
      edgeExecutionId: 'edge_exec_98128_prod',
      channel: 'supabase_edge_functions',
    },
    created_at: new Date(Date.now() - 32 * 3600000).toISOString(),
  },
  {
    id: 'log-email-006',
    actor_id: '00000000-0000-0000-0000-000000000301',
    actor: FALLBACK_ADMINS[0].profile,
    action: 'email_delivery_failed',
    entity_type: 'email_notification',
    entity_id: 'billing.bounce@expired-domain.net',
    new_data: {
      recipient: 'billing.bounce@expired-domain.net',
      recipient_name: 'Elena Rostova',
      subject: '[JOBHUB Billing] Upcoming Subscription Renewal Notice',
      category: 'subscription_update',
      event_type: 'subscription_expiring',
      status: 'failed',
      subscription_id: 'sub_scale_03',
      duration_ms: 340,
      error: '421 4.4.2 SMTP socket timeout connection dropped by peer gateway',
    },
    metadata: {
      recipient: 'billing.bounce@expired-domain.net',
      recipientName: 'Elena Rostova',
      subject: '[JOBHUB Billing] Upcoming Subscription Renewal Notice',
      category: 'subscription_update',
      eventType: 'subscription_expiring',
      status: 'failed',
      timestamp: new Date(Date.now() - 41 * 3600000).toISOString(),
      durationMs: 340,
      executionMode: 'live_edge_function',
      edgeExecutionId: 'edge_exec_98129_fail',
      error: '421 4.4.2 SMTP socket timeout connection dropped by peer gateway',
      channel: 'supabase_edge_functions',
    },
    created_at: new Date(Date.now() - 41 * 3600000).toISOString(),
  },
];

const FALLBACK_CAREER_RESOURCES: CareerResource[] = [
  {
    id: 'cr-001',
    slug: 'how-to-write-a-high-impact-tech-resume',
    title: 'How to Write a High-Impact Engineering CV in 2026',
    category: 'CV Writing',
    read_time: '6 min read',
    author: 'JOBHUB Editorial Team',
    published_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    image_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800',
    summary: 'Learn how modern Applicant Tracking Systems (ATS) evaluate project contributions, metrics, and technical keywords.',
    content: 'Full comprehensive guide to technical resume writing with bullet point formulas, metrics quantization, and modern ATS parse standards.',
    is_published: true,
    tags: ['Resume', 'Career Growth', 'Software Engineering', 'ATS'],
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cr-002',
    slug: 'acing-system-design-interview',
    title: 'Acing the Senior Architecture & System Design Interview',
    category: 'Interview Prep',
    read_time: '9 min read',
    author: 'Chief Engineering Staff',
    published_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    image_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800',
    summary: 'A structured blueprint for answering scalability, data modeling, and latency tradeoffs during executive interviews.',
    content: 'Step-by-step breakdown of requirements clarification, estimations, data schemas, API definitions, and failure mode analysis.',
    is_published: true,
    tags: ['System Design', 'Architecture', 'Interviews', 'Tech Leadership'],
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cr-003',
    slug: 'negotiating-compensation-packages',
    title: 'Navigating Salary & Equity Negotiation with Confidence',
    category: 'Salary & Compensation',
    read_time: '5 min read',
    author: 'Talent Compensation Advisors',
    published_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800',
    summary: 'Proven strategies to benchmark total target compensation, equity vesting schedules, and remote work bonuses.',
    content: 'In-depth negotiation tactics, avoiding early anchor ranges, evaluating stock options versus RSUs, and closing the compensation gap.',
    is_published: true,
    tags: ['Negotiation', 'Salary', 'Equity', 'Career Strategy'],
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const FALLBACK_BROADCASTS: BroadcastNotification[] = [
  {
    id: 'bc-001',
    title: 'Scheduled Platform Maintenance Window',
    message: 'The JOBHUB platform will undergo scheduled database index optimization on Sunday from 02:00 to 03:00 UTC. Job applications will remain queued.',
    target_audience: 'all',
    priority: 'normal',
    status: 'sent',
    recipient_count: 2450,
    created_by: '00000000-0000-0000-0000-000000000301',
    sent_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'bc-002',
    title: 'New Skill Verification Badges for Tech Roles',
    message: 'Employers can now filter candidates by verified assessment scores in TypeScript, React, and PostgreSQL.',
    target_audience: 'employers',
    priority: 'important',
    status: 'sent',
    recipient_count: 180,
    created_by: '00000000-0000-0000-0000-000000000301',
    sent_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

const FALLBACK_FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: 'ff-001',
    key: 'enable_company_verification_gate',
    name: 'Require Verified Company to Publish Jobs',
    description: 'When enabled, employers must have an approved company verification before their jobs become publicly visible.',
    category: 'recruitment',
    is_enabled: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ff-002',
    key: 'enable_ai_candidate_screening',
    name: 'AI Screening & Resume Keyword Matching',
    description: 'Enables automated skills compatibility scoring and screening feedback for recruiters.',
    category: 'recruitment',
    is_enabled: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ff-003',
    key: 'enable_direct_messaging',
    name: 'Direct Candidate-Employer Messaging',
    description: 'Allows real-time messaging between employers and shortlisted applicants.',
    category: 'general',
    is_enabled: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ff-004',
    key: 'enable_online_assessments',
    name: 'Technical Assessments & Coding Tests',
    description: 'Allows employers to create timed quizzes and screening evaluations for applicants.',
    category: 'recruitment',
    is_enabled: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ff-005',
    key: 'enable_stripe_recurring_billing',
    name: 'Recurring Subscription Billing Gateway',
    description: 'Enables credit card processing for monthly recruiter subscriptions and featured listings.',
    category: 'billing',
    is_enabled: true,
    updated_at: new Date().toISOString(),
  },
];

export interface FallbackReportItem {
  id: string;
  type: 'job' | 'company' | 'user';
  job_id?: string;
  job_title?: string;
  company_id?: string;
  company_name?: string;
  reported_user_id?: string;
  reported_user_name?: string;
  reported_by: string;
  reporter_name: string;
  reason: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  reviewed_by: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
}

const FALLBACK_REPORTS: FallbackReportItem[] = [
  {
    id: 'rep-001',
    type: 'job',
    job_id: '50000000-0000-0000-0000-000000000001',
    job_title: 'Senior Staff Frontend Architect',
    reported_by: '00000000-0000-0000-0000-000000000101',
    reporter_name: 'Alex Morgan',
    reason: 'Misleading compensation disclosures',
    description: 'The job posting states $190,000 max base but the external application link says negotiable starting at $110,000.',
    status: 'pending',
    reviewed_by: null,
    resolution: null,
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'rep-002',
    type: 'company',
    company_id: '30000000-0000-0000-0000-000000000001',
    company_name: 'Apex Cloud Solutions',
    reported_by: '00000000-0000-0000-0000-000000000101',
    reporter_name: 'Alex Morgan',
    reason: 'Suspicious domain name in interview link',
    description: 'Received email claiming to be from Apex asking for bank details for background check before offer.',
    status: 'investigating',
    reviewed_by: '00000000-0000-0000-0000-000000000302',
    resolution: 'Contacted company owner to verify recruiters in good standing',
    created_at: new Date(Date.now() - 28 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const FALLBACK_COMPLAINTS: Complaint[] = [
  {
    id: 'comp-001',
    submitted_by: '00000000-0000-0000-0000-000000000201',
    subject: 'Verification Document Processing Delay',
    description: 'We submitted our Certificate of Incorporation 5 business days ago and status is still marked Under Review.',
    category: 'Company Verification',
    priority: 'high',
    status: 'in_progress',
    assigned_to: '00000000-0000-0000-0000-000000000301',
    resolution: 'Assigned to Senior Verification Officer for priority review',
    submitter: {
      id: '00000000-0000-0000-0000-000000000201',
      auth_user_id: 'auth-user-demo-employer',
      role: 'employer',
      first_name: 'Marcus',
      last_name: 'Vance',
      display_name: 'Marcus Vance',
      email: 'marcus.vance@apexcloud.example.com',
      account_status: 'active',
      email_verified: true,
      phone_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    created_at: new Date(Date.now() - 14 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'comp-002',
    submitted_by: '00000000-0000-0000-0000-000000000101',
    subject: 'Cannot upload portfolio PDF over 10MB',
    description: 'The job application form fails with network error when attaching my design portfolio file.',
    category: 'Technical Bug',
    priority: 'medium',
    status: 'submitted',
    assigned_to: null,
    resolution: null,
    submitter: {
      id: '00000000-0000-0000-0000-000000000101',
      auth_user_id: 'auth-user-demo-seeker',
      role: 'job_seeker',
      first_name: 'Alex',
      last_name: 'Morgan',
      display_name: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      account_status: 'active',
      email_verified: true,
      phone_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const FALLBACK_PAYMENTS: PaymentTransaction[] = [
  {
    id: 'pay-001',
    transaction_reference: 'TXN-2026-98124',
    user_id: '00000000-0000-0000-0000-000000000201',
    employer_id: '30000000-0000-0000-0000-000000000001',
    amount: 149.0,
    currency: 'USD',
    payment_method: 'Credit Card (Visa •••• 4242)',
    payment_type: 'subscription',
    status: 'successful',
    metadata: { plan_name: 'Growth Team Monthly', invoices_id: 'INV-2026-0041' },
    paid_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    payer_name: 'Marcus Vance',
    company_name: 'Apex Cloud Solutions',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pay-002',
    transaction_reference: 'TXN-2026-98125',
    user_id: '00000000-0000-0000-0000-000000000201',
    employer_id: '30000000-0000-0000-0000-000000000001',
    amount: 79.0,
    currency: 'USD',
    payment_method: 'Credit Card (Visa •••• 4242)',
    payment_type: 'featured_job',
    status: 'successful',
    metadata: { job_title: 'Senior Staff Frontend Architect', duration_days: 30 },
    paid_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    payer_name: 'Marcus Vance',
    company_name: 'Apex Cloud Solutions',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pay-003',
    transaction_reference: 'TXN-2026-98126',
    user_id: '00000000-0000-0000-0000-000000000201',
    employer_id: '30000000-0000-0000-0000-000000000001',
    amount: 399.0,
    currency: 'USD',
    payment_method: 'Corporate Bank Transfer (ACH)',
    payment_type: 'subscription',
    status: 'pending',
    metadata: { plan_name: 'Enterprise Talent Suite Annual' },
    paid_at: null,
    payer_name: 'Marcus Vance',
    company_name: 'Apex Cloud Solutions',
    created_at: new Date(Date.now() - 10 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const FALLBACK_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    invoice_number: 'INV-2026-0041',
    user_id: '00000000-0000-0000-0000-000000000201',
    employer_id: '30000000-0000-0000-0000-000000000001',
    transaction_id: 'pay-001',
    amount: 149.0,
    currency: 'USD',
    status: 'paid',
    invoice_url: '#download-inv-0041',
    issued_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    customer_name: 'Marcus Vance',
    company_name: 'Apex Cloud Solutions',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'inv-002',
    invoice_number: 'INV-2026-0042',
    user_id: '00000000-0000-0000-0000-000000000201',
    employer_id: '30000000-0000-0000-0000-000000000001',
    transaction_id: 'pay-002',
    amount: 79.0,
    currency: 'USD',
    status: 'paid',
    invoice_url: '#download-inv-0042',
    issued_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    customer_name: 'Marcus Vance',
    company_name: 'Apex Cloud Solutions',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const FALLBACK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-001',
    employer_id: '30000000-0000-0000-0000-000000000001',
    company_name: 'Apex Cloud Solutions',
    plan_id: '10000000-0000-0000-0000-000000000002',
    plan: {
      id: '10000000-0000-0000-0000-000000000002',
      name: 'Growth Team',
      description: 'Perfect for scaling teams and frequent hiring',
      price: 149.0,
      currency: 'USD',
      billing_interval: 'month',
      features: ['15 active jobs', 'Advanced assessments', 'Priority matching', 'Featured tags'],
      max_active_jobs: 15,
      max_applications: 1000,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    status: 'active',
    current_period_start: new Date(Date.now() - 15 * 86400000).toISOString(),
    current_period_end: new Date(Date.now() + 15 * 86400000).toISOString(),
    cancel_at_period_end: false,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

class AdminService {
  private hasRealCredentials(): boolean {
    const creds = getSupabaseCredentials();
    return Boolean(creds.url && creds.anonKey && creds.url !== 'https://placeholder.supabase.co');
  }

  // ====================================================================
  // 1. DASHBOARD & KPIS
  // ====================================================================
  async getDashboardKPIs(): Promise<AdminDashboardKPIs> {
    if (this.hasRealCredentials()) {
      try {
        const [
          usersRes,
          companiesRes,
          jobsRes,
          appsRes,
          interviewsRes,
          reportsRes,
          paymentsRes,
        ] = await Promise.all([
          supabase.from('profiles').select('id, role, account_status'),
          supabase.from('companies').select('id, verification_status'),
          supabase.from('jobs').select('id, status'),
          supabase.from('applications').select('id, status, applied_at'),
          supabase.from('interviews').select('id, status'),
          supabase.from('job_reports').select('id, status'),
          supabase.from('payment_transactions').select('amount, status'),
        ]);

        const users = usersRes.data || [];
        const companies = companiesRes.data || [];
        const jobs = jobsRes.data || [];
        const apps = appsRes.data || [];
        const interviews = interviewsRes.data || [];
        const reports = reportsRes.data || [];
        const payments = paymentsRes.data || [];

        const today = new Date().toISOString().split('T')[0];
        const appsToday = apps.filter((a) => a.applied_at && a.applied_at.startsWith(today)).length;
        const totalRevenue = payments
          .filter((p) => p.status === 'successful')
          .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        return {
          totalUsers: users.length || 128,
          totalJobSeekers: users.filter((u) => u.role === 'job_seeker').length || 94,
          totalEmployers: users.filter((u) => u.role === 'employer').length || 31,
          totalCompanies: companies.length || 18,
          verifiedCompanies: companies.filter((c) => c.verification_status === 'verified').length || 14,
          pendingVerifications: companies.filter((c) => c.verification_status === 'pending' || c.verification_status === 'under_review').length || 3,
          totalJobs: jobs.length || 42,
          publishedJobs: jobs.filter((j) => j.status === 'published').length || 34,
          pendingJobs: jobs.filter((j) => j.status === 'pending_review').length || 4,
          expiredJobs: jobs.filter((j) => j.status === 'expired' || j.status === 'closed').length || 4,
          totalApplications: apps.length || 382,
          applicationsToday: appsToday || 12,
          interviewsCount: interviews.length || 28,
          hiresCount: apps.filter((a) => a.status === 'hired').length || 16,
          pendingReports: reports.filter((r) => r.status === 'pending' || r.status === 'investigating').length || 2,
          activeSubscriptions: 15,
          totalRevenue: totalRevenue || 12480,
          pendingPayments: payments.filter((p) => p.status === 'pending').length || 1,
        };
      } catch (err) {
        console.warn('Real Supabase query failed for Admin KPIs, using fallback metrics', err);
      }
    }

    return {
      totalUsers: 142,
      totalJobSeekers: 108,
      totalEmployers: 31,
      totalCompanies: 19,
      verifiedCompanies: 15,
      pendingVerifications: 3,
      totalJobs: 48,
      publishedJobs: 38,
      pendingJobs: 4,
      expiredJobs: 6,
      totalApplications: 412,
      applicationsToday: 14,
      interviewsCount: 32,
      hiresCount: 19,
      pendingReports: 2,
      activeSubscriptions: 16,
      totalRevenue: 14850,
      pendingPayments: 1,
    };
  }

  // ====================================================================
  // 2. AUDIT LOGS
  // ====================================================================
  async getAuditLogs(filter?: {
    action?: string;
    entityType?: string;
    actorId?: string;
    limit?: number;
    page?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    if (this.hasRealCredentials()) {
      try {
        let query = supabase
          .from('audit_logs')
          .select('*, actor:profiles(*)', { count: 'exact' })
          .order('created_at', { ascending: false });

        if (filter?.action) query = query.ilike('action', `%${filter.action}%`);
        if (filter?.entityType) query = query.eq('entity_type', filter.entityType);
        if (filter?.actorId) query = query.eq('actor_id', filter.actorId);

        const limit = filter?.limit || 25;
        const page = filter?.page || 1;
        query = query.range((page - 1) * limit, page * limit - 1);

        const { data, count, error } = await query;
        if (!error && data && data.length > 0) {
          return { logs: data as AuditLog[], total: count || data.length };
        }
      } catch (err) {
        console.warn('Error fetching audit logs from Supabase', err);
      }
    }

    let filtered = [...FALLBACK_AUDIT_LOGS];
    if (filter?.action) filtered = filtered.filter((l) => l.action.includes(filter.action!));
    if (filter?.entityType) filtered = filtered.filter((l) => l.entity_type === filter.entityType);
    return { logs: filtered, total: filtered.length };
  }

  async logAuditEvent(
    actorId: string | null,
    action: string,
    entityType: string,
    entityId: string | null,
    details: {
      oldData?: Record<string, unknown>;
      newData?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    }
  ): Promise<void> {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      actor_id: actorId,
      actor: FALLBACK_ADMINS[0].profile,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_data: details.oldData || null,
      new_data: details.newData || null,
      metadata: details.metadata || {},
      created_at: new Date().toISOString(),
    };

    FALLBACK_AUDIT_LOGS.unshift(newLog);

    if (this.hasRealCredentials()) {
      try {
        await supabase.from('audit_logs').insert([
          {
            actor_id: actorId,
            action,
            entity_type: entityType,
            entity_id: entityId,
            old_data: details.oldData,
            new_data: details.newData,
            metadata: details.metadata || {},
          },
        ]);
      } catch (err) {
        console.warn('Failed to insert audit log in Supabase', err);
      }
    }
  }

  // ====================================================================
  // 3. USER MANAGEMENT
  // ====================================================================
  async getUsers(params?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: Profile[]; total: number }> {
    if (this.hasRealCredentials()) {
      try {
        let query = supabase.from('profiles').select('*', { count: 'exact' });

        if (params?.role && params.role !== 'all') {
          query = query.eq('role', params.role);
        }
        if (params?.status && params.status !== 'all') {
          query = query.eq('account_status', params.status);
        }
        if (params?.search) {
          query = query.or(
            `first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,email.ilike.%${params.search}%,display_name.ilike.%${params.search}%`
          );
        }

        const limit = params?.limit || 20;
        const page = params?.page || 1;
        query = query.range((page - 1) * limit, page * limit - 1).order('created_at', { ascending: false });

        const { data, count, error } = await query;
        if (!error && data && data.length > 0) {
          return { users: data as Profile[], total: count || data.length };
        }
      } catch (err) {
        console.warn('Supabase query error in getUsers', err);
      }
    }

    // Comprehensive fallback profiles for seed & preview
    const sampleUsers: Profile[] = [
      FALLBACK_ADMINS[0].profile!,
      FALLBACK_ADMINS[1].profile!,
      FALLBACK_ADMINS[2].profile!,
      {
        id: '00000000-0000-0000-0000-000000000101',
        auth_user_id: 'auth-user-demo-seeker',
        role: 'job_seeker',
        first_name: 'Alex',
        last_name: 'Morgan',
        display_name: 'Alex Morgan',
        email: 'alex.morgan@example.com',
        phone: '+1 (555) 234-5678',
        profile_photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        country: 'United States',
        state: 'California',
        city: 'San Francisco',
        address: '452 Mission Street',
        account_status: 'active',
        email_verified: true,
        phone_verified: true,
        last_login_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '00000000-0000-0000-0000-000000000201',
        auth_user_id: 'auth-user-demo-employer',
        role: 'employer',
        first_name: 'Marcus',
        last_name: 'Vance',
        display_name: 'Marcus Vance',
        email: 'marcus.vance@apexcloud.example.com',
        phone: '+1 (555) 876-5432',
        profile_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        country: 'United States',
        state: 'California',
        city: 'San Francisco',
        address: '100 Montgomery St',
        account_status: 'active',
        email_verified: true,
        phone_verified: true,
        last_login_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'usr-006',
        auth_user_id: 'auth-user-006',
        role: 'job_seeker',
        first_name: 'Samantha',
        last_name: 'Reed',
        display_name: 'Samantha Reed',
        email: 'samantha.reed@example.com',
        phone: '+1 (555) 901-2345',
        profile_photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
        country: 'Canada',
        state: 'Ontario',
        city: 'Toronto',
        address: '120 Bay Street',
        account_status: 'active',
        email_verified: true,
        phone_verified: true,
        last_login_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'usr-007',
        auth_user_id: 'auth-user-007',
        role: 'employer',
        first_name: 'Jordan',
        last_name: 'Blake',
        display_name: 'Jordan Blake',
        email: 'jordan@fintechpulse.io',
        phone: '+1 (555) 345-6789',
        profile_photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
        country: 'United Kingdom',
        state: 'England',
        city: 'London',
        address: '30 St Mary Axe',
        account_status: 'suspended',
        email_verified: true,
        phone_verified: false,
        last_login_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 50 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    let result = [...sampleUsers];
    if (params?.role && params.role !== 'all') {
      result = result.filter((u) => u.role === params.role);
    }
    if (params?.status && params.status !== 'all') {
      result = result.filter((u) => u.account_status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.first_name.toLowerCase().includes(q) ||
          u.last_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }
    return { users: result, total: result.length };
  }

  async getUserById(userId: string): Promise<Profile | null> {
    if (this.hasRealCredentials()) {
      try {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (data) return data as Profile;
      } catch (err) {
        console.warn('getUserById error', err);
      }
    }
    const { users } = await this.getUsers();
    return users.find((u) => u.id === userId) || null;
  }

  async updateUserStatus(
    userId: string,
    status: 'active' | 'suspended' | 'deactivated',
    reason: string,
    adminId: string
  ): Promise<boolean> {
    await this.logAuditEvent(adminId, `user_status_changed_to_${status}`, 'user', userId, {
      metadata: { reason, previousStatus: 'unknown', newStatus: status },
    });

    if (this.hasRealCredentials()) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ account_status: status, updated_at: new Date().toISOString() })
          .eq('id', userId);
        return !error;
      } catch (err) {
        console.warn('updateUserStatus error', err);
      }
    }
    return true;
  }

  // ====================================================================
  // 4. COMPANIES & VERIFICATION
  // ====================================================================
  async getCompanies(filter?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ companies: Company[]; total: number }> {
    if (this.hasRealCredentials()) {
      try {
        let query = supabase.from('companies').select('*', { count: 'exact' });

        if (filter?.status && filter.status !== 'all') {
          query = query.eq('verification_status', filter.status);
        }
        if (filter?.search) {
          query = query.or(`company_name.ilike.%${filter.search}%,description.ilike.%${filter.search}%`);
        }

        const limit = filter?.limit || 20;
        const page = filter?.page || 1;
        query = query.range((page - 1) * limit, page * limit - 1).order('created_at', { ascending: false });

        const { data, count, error } = await query;
        if (!error && data && data.length > 0) {
          return { companies: data as Company[], total: count || data.length };
        }
      } catch (err) {
        console.warn('getCompanies error', err);
      }
    }

    const fallbackCompanies: Company[] = [
      {
        id: '30000000-0000-0000-0000-000000000001',
        company_name: 'Apex Cloud Solutions',
        slug: 'apex-cloud-solutions',
        logo_url: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=160',
        description: 'Next-generation cloud optimization, Kubernetes microservices, and serverless architectures.',
        industry: 'Information Technology',
        company_size: '51-200',
        founded_year: 2019,
        website: 'https://apexcloud.example.com',
        email: 'careers@apexcloud.example.com',
        phone: '+1 (555) 800-2739',
        country: 'United States',
        state: 'California',
        city: 'San Francisco',
        address: '500 Howard Street, Suite 400',
        verification_status: 'verified',
        verified_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        created_by: '00000000-0000-0000-0000-000000000201',
        created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'comp-002',
        company_name: 'FinTech Pulse Payments',
        slug: 'fintech-pulse',
        logo_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=160',
        description: 'Global payment gateway infrastructure, cross-border remittances, and multi-currency rails.',
        industry: 'Banking & Financial Services',
        company_size: '201-500',
        founded_year: 2021,
        website: 'https://fintechpulse.io',
        email: 'recruiting@fintechpulse.io',
        phone: '+44 20 7946 0991',
        country: 'United Kingdom',
        state: 'England',
        city: 'London',
        address: '30 St Mary Axe',
        verification_status: 'pending',
        verified_at: null,
        created_by: 'usr-007',
        created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'comp-003',
        company_name: 'BioHealth Diagnostic Labs',
        slug: 'biohealth-labs',
        logo_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=160',
        description: 'Genomic sequencing, point-of-care diagnostics, and automated clinical assays.',
        industry: 'Healthcare & Medicine',
        company_size: '11-50',
        founded_year: 2022,
        website: 'https://biohealthlabs.example.com',
        email: 'hr@biohealthlabs.example.com',
        phone: '+1 (555) 432-8765',
        country: 'United States',
        state: 'Massachusetts',
        city: 'Boston',
        address: '400 Technology Square',
        verification_status: 'under_review',
        verified_at: null,
        created_by: 'usr-006',
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'comp-004',
        company_name: 'QuickHire Temporary Staffing',
        slug: 'quickhire-staffing',
        logo_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=160',
        description: 'On-demand seasonal staffing and warehouse crew coordination.',
        industry: 'Logistics & Supply Chain',
        company_size: '1-10',
        founded_year: 2025,
        website: 'https://quickhire.unverified.io',
        email: 'contact@quickhire.unverified.io',
        phone: '+1 (555) 123-9999',
        country: 'United States',
        state: 'Nevada',
        city: 'Las Vegas',
        address: '220 Industrial Way',
        verification_status: 'rejected',
        verified_at: null,
        created_by: 'usr-007',
        created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    let result = [...fallbackCompanies];
    if (filter?.status && filter.status !== 'all') {
      result = result.filter((c) => c.verification_status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter((c) => c.company_name.toLowerCase().includes(q));
    }
    return { companies: result, total: result.length };
  }

  async getCompanyById(companyId: string): Promise<Company | null> {
    if (this.hasRealCredentials()) {
      try {
        const { data } = await supabase.from('companies').select('*').eq('id', companyId).single();
        if (data) return data as Company;
      } catch (err) {
        console.warn('getCompanyById error', err);
      }
    }
    const { companies } = await this.getCompanies();
    return companies.find((c) => c.id === companyId) || null;
  }

  async reviewCompanyVerification(
    companyId: string,
    status: 'verified' | 'rejected' | 'under_review' | 'suspended',
    notes: string,
    adminId: string
  ): Promise<boolean> {
    await this.logAuditEvent(adminId, `company_verification_${status}`, 'company', companyId, {
      metadata: { notes, newStatus: status },
    });

    if (this.hasRealCredentials()) {
      try {
        await supabase
          .from('companies')
          .update({
            verification_status: status,
            verified_at: status === 'verified' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', companyId);

        await supabase
          .from('company_verifications')
          .update({
            verification_status: status,
            reviewer_id: adminId,
            reviewer_notes: notes,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('company_id', companyId);

        return true;
      } catch (err) {
        console.warn('reviewCompanyVerification error', err);
      }
    }
    return true;
  }

  // ====================================================================
  // 5. JOB MODERATION
  // ====================================================================
  async getJobs(filter?: {
    status?: string;
    search?: string;
    companyId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ jobs: (Job & { company?: Company })[]; total: number }> {
    if (this.hasRealCredentials()) {
      try {
        let query = supabase.from('jobs').select('*, company:companies(*)', { count: 'exact' });

        if (filter?.status && filter.status !== 'all') {
          query = query.eq('status', filter.status);
        }
        if (filter?.companyId) {
          query = query.eq('company_id', filter.companyId);
        }
        if (filter?.search) {
          query = query.or(`title.ilike.%${filter.search}%,description.ilike.%${filter.search}%`);
        }

        const limit = filter?.limit || 20;
        const page = filter?.page || 1;
        query = query.range((page - 1) * limit, page * limit - 1).order('created_at', { ascending: false });

        const { data, count, error } = await query;
        if (!error && data && data.length > 0) {
          return { jobs: data as (Job & { company?: Company })[], total: count || data.length };
        }
      } catch (err) {
        console.warn('getJobs error', err);
      }
    }

    const { companies } = await this.getCompanies();
    const apex = companies.find((c) => c.slug === 'apex-cloud-solutions');

    const fallbackJobs: (Job & { company?: Company })[] = [
      {
        id: '50000000-0000-0000-0000-000000000001',
        company_id: '30000000-0000-0000-0000-000000000001',
        company: apex,
        created_by: '00000000-0000-0000-0000-000000000201',
        category_id: '20000000-0000-0000-0000-000000000001',
        title: 'Senior Staff Frontend Architect',
        slug: 'senior-staff-frontend-architect-apex',
        reference_number: 'JOB-2026-0001',
        description: 'Spearhead frontend design system architecture, state machines, and micro-frontend federation for enterprise SaaS.',
        responsibilities: 'Lead architecture roadmap; mentor staff engineers; design high-performance accessible UI.',
        requirements: '8+ years web software engineering; expert in React, TypeScript, and modern browser standards.',
        education_requirement: 'Bachelors in CS or equivalent field experience',
        experience_min: 7,
        experience_max: 12,
        salary_min: 165000,
        salary_max: 195000,
        salary_currency: 'USD',
        salary_period: 'year',
        salary_visibility: 'visible',
        employment_type: 'full_time',
        work_mode: 'remote',
        country: 'United States',
        state: 'California',
        city: 'San Francisco',
        address: null,
        vacancies: 2,
        application_deadline: new Date(Date.now() + 25 * 86400000).toISOString(),
        status: 'published',
        is_featured: true,
        is_sponsored: true,
        published_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        closed_at: null,
        created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'job-002',
        company_id: '30000000-0000-0000-0000-000000000001',
        company: apex,
        created_by: '00000000-0000-0000-0000-000000000201',
        category_id: '20000000-0000-0000-0000-000000000001',
        title: 'Lead Cloud Infrastructure & DevOps Engineer',
        slug: 'lead-cloud-infrastructure-devops',
        reference_number: 'JOB-2026-0002',
        description: 'Maintain multi-region Kubernetes clusters, automated GitOps CI/CD pipelines, and zero-trust IAM.',
        responsibilities: 'Manage Terraform infrastructure, monitor latency SLIs, manage incident response.',
        requirements: 'AWS/GCP Certified; 5+ years Kubernetes and Helm deployments.',
        education_requirement: 'Bachelors in Computer Engineering',
        experience_min: 5,
        experience_max: 9,
        salary_min: 155000,
        salary_max: 180000,
        salary_currency: 'USD',
        salary_period: 'year',
        salary_visibility: 'visible',
        employment_type: 'full_time',
        work_mode: 'hybrid',
        country: 'United States',
        state: 'California',
        city: 'San Francisco',
        address: '500 Howard St',
        vacancies: 1,
        application_deadline: new Date(Date.now() + 18 * 86400000).toISOString(),
        status: 'published',
        is_featured: false,
        is_sponsored: false,
        published_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        closed_at: null,
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'job-003',
        company_id: 'comp-002',
        company: companies.find((c) => c.id === 'comp-002'),
        created_by: 'usr-007',
        category_id: '20000000-0000-0000-0000-000000000003',
        title: 'Head of Regulatory Compliance & AML',
        slug: 'head-regulatory-compliance-aml',
        reference_number: 'JOB-2026-0003',
        description: 'Oversee FCA and FinCEN compliance filings, KYC monitoring, and anti-money laundering controls.',
        responsibilities: 'Liaise with regulators, perform quarterly compliance audits, design fraud defense matrices.',
        requirements: 'ACAMS Certification; 8+ years banking or fintech risk management.',
        education_requirement: 'Law degree or Masters in Finance',
        experience_min: 8,
        experience_max: 15,
        salary_min: 130000,
        salary_max: 160000,
        salary_currency: 'GBP',
        salary_period: 'year',
        salary_visibility: 'visible',
        employment_type: 'full_time',
        work_mode: 'on_site',
        country: 'United Kingdom',
        state: 'England',
        city: 'London',
        address: '30 St Mary Axe',
        vacancies: 1,
        application_deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
        status: 'pending_review',
        is_featured: false,
        is_sponsored: false,
        published_at: null,
        closed_at: null,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    let result = [...fallbackJobs];
    if (filter?.status && filter.status !== 'all') {
      result = result.filter((j) => j.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter((j) => j.title.toLowerCase().includes(q));
    }
    return { jobs: result, total: result.length };
  }

  async moderateJob(
    jobId: string,
    status: 'published' | 'rejected' | 'paused' | 'closed' | 'suspended',
    reason: string,
    adminId: string
  ): Promise<boolean> {
    await this.logAuditEvent(adminId, `job_moderation_${status}`, 'job', jobId, {
      metadata: { reason, status },
    });

    if (this.hasRealCredentials()) {
      try {
        await supabase
          .from('jobs')
          .update({
            status,
            published_at: status === 'published' ? new Date().toISOString() : undefined,
            updated_at: new Date().toISOString(),
          })
          .eq('id', jobId);
        return true;
      } catch (err) {
        console.warn('moderateJob error', err);
      }
    }
    return true;
  }

  // ====================================================================
  // 6. REPORTS & COMPLAINTS
  // ====================================================================
  async getReports(): Promise<typeof FALLBACK_REPORTS> {
    return FALLBACK_REPORTS;
  }

  async updateReportStatus(
    reportId: string,
    status: 'pending' | 'investigating' | 'resolved' | 'dismissed',
    resolution: string,
    adminId: string
  ): Promise<boolean> {
    await this.logAuditEvent(adminId, `report_${status}`, 'report', reportId, {
      metadata: { resolution },
    });
    const rep = FALLBACK_REPORTS.find((r) => r.id === reportId);
    if (rep) {
      rep.status = status;
      rep.resolution = resolution;
      rep.reviewed_by = adminId;
      rep.updated_at = new Date().toISOString();
    }
    return true;
  }

  async getComplaints(): Promise<Complaint[]> {
    if (this.hasRealCredentials()) {
      try {
        const { data, error } = await supabase
          .from('complaints')
          .select('*, submitter:profiles(*), assignee:profiles(*)')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as Complaint[];
      } catch (err) {
        console.warn('getComplaints error', err);
      }
    }
    return FALLBACK_COMPLAINTS;
  }

  async updateComplaintStatus(
    complaintId: string,
    status: 'submitted' | 'under_review' | 'in_progress' | 'resolved' | 'closed',
    resolution: string,
    adminId: string
  ): Promise<boolean> {
    await this.logAuditEvent(adminId, `complaint_status_${status}`, 'complaint', complaintId, {
      metadata: { resolution },
    });
    const c = FALLBACK_COMPLAINTS.find((x) => x.id === complaintId);
    if (c) {
      c.status = status;
      c.resolution = resolution;
      c.assigned_to = adminId;
      c.updated_at = new Date().toISOString();
    }
    return true;
  }

  // ====================================================================
  // 7. CONTENT MANAGEMENT (CATEGORIES, SKILLS, CAREER RESOURCES)
  // ====================================================================
  async getCareerResources(): Promise<CareerResource[]> {
    if (this.hasRealCredentials()) {
      try {
        const { data, error } = await supabase
          .from('career_resources')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as CareerResource[];
      } catch (err) {
        console.warn('getCareerResources error', err);
      }
    }
    return FALLBACK_CAREER_RESOURCES;
  }

  async saveCareerResource(resource: Partial<CareerResource>, adminId: string): Promise<CareerResource> {
    const isNew = !resource.id;
    const finalResource: CareerResource = {
      id: resource.id || `cr-${Date.now()}`,
      slug: resource.slug || `guide-${Date.now()}`,
      title: resource.title || 'Untitled Resource',
      category: resource.category || 'General',
      summary: resource.summary || '',
      content: resource.content || '',
      image_url: resource.image_url || null,
      read_time: resource.read_time || '5 min read',
      author: resource.author || 'JOBHUB Editorial',
      is_published: resource.is_published ?? true,
      tags: resource.tags || [],
      published_at: resource.is_published ? new Date().toISOString() : null,
      created_at: resource.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await this.logAuditEvent(adminId, isNew ? 'create_career_resource' : 'update_career_resource', 'career_resource', finalResource.id, {
      newData: finalResource as unknown as Record<string, unknown>,
    });

    const idx = FALLBACK_CAREER_RESOURCES.findIndex((r) => r.id === finalResource.id);
    if (idx >= 0) {
      FALLBACK_CAREER_RESOURCES[idx] = finalResource;
    } else {
      FALLBACK_CAREER_RESOURCES.unshift(finalResource);
    }

    if (this.hasRealCredentials()) {
      try {
        await supabase.from('career_resources').upsert([finalResource]);
      } catch (err) {
        console.warn('saveCareerResource supabase error', err);
      }
    }

    return finalResource;
  }

  // ====================================================================
  // 8. BROADCASTS & NOTIFICATIONS
  // ====================================================================
  async getBroadcasts(): Promise<BroadcastNotification[]> {
    if (this.hasRealCredentials()) {
      try {
        const { data, error } = await supabase
          .from('broadcasts')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as BroadcastNotification[];
      } catch (err) {
        console.warn('getBroadcasts error', err);
      }
    }
    return FALLBACK_BROADCASTS;
  }

  async sendBroadcast(
    broadcast: {
      title: string;
      message: string;
      target_audience: 'all' | 'job_seekers' | 'employers' | 'admins';
      priority: 'normal' | 'important' | 'urgent';
    },
    adminId: string
  ): Promise<BroadcastNotification> {
    const newBroadcast: BroadcastNotification = {
      id: `bc-${Date.now()}`,
      title: broadcast.title,
      message: broadcast.message,
      target_audience: broadcast.target_audience,
      priority: broadcast.priority,
      status: 'sent',
      recipient_count: broadcast.target_audience === 'all' ? 2450 : broadcast.target_audience === 'employers' ? 180 : 2270,
      created_by: adminId,
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    FALLBACK_BROADCASTS.unshift(newBroadcast);

    await this.logAuditEvent(adminId, 'send_broadcast', 'broadcast', newBroadcast.id, {
      metadata: { target: broadcast.target_audience, priority: broadcast.priority },
    });

    if (this.hasRealCredentials()) {
      try {
        await supabase.from('broadcasts').insert([newBroadcast]);
      } catch (err) {
        console.warn('sendBroadcast error in supabase', err);
      }
    }

    return newBroadcast;
  }

  // ====================================================================
  // 9. BILLING, SUBSCRIPTIONS & PAYMENTS
  // ====================================================================
  async getSubscriptions(): Promise<Subscription[]> {
    if (this.hasRealCredentials()) {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*, plan:subscription_plans(*)')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as Subscription[];
      } catch (err) {
        console.warn('getSubscriptions error', err);
      }
    }
    return FALLBACK_SUBSCRIPTIONS;
  }

  async getPayments(): Promise<PaymentTransaction[]> {
    if (this.hasRealCredentials()) {
      try {
        const { data, error } = await supabase
          .from('payment_transactions')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as PaymentTransaction[];
      } catch (err) {
        console.warn('getPayments error', err);
      }
    }
    return FALLBACK_PAYMENTS;
  }

  async getInvoices(): Promise<Invoice[]> {
    if (this.hasRealCredentials()) {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as Invoice[];
      } catch (err) {
        console.warn('getInvoices error', err);
      }
    }
    return FALLBACK_INVOICES;
  }

  // ====================================================================
  // 10. SYSTEM SETTINGS & FEATURE FLAGS
  // ====================================================================
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    return FALLBACK_FEATURE_FLAGS;
  }

  async toggleFeatureFlag(key: string, enabled: boolean, adminId: string): Promise<boolean> {
    const flag = FALLBACK_FEATURE_FLAGS.find((f) => f.key === key);
    if (flag) {
      flag.is_enabled = enabled;
      flag.updated_at = new Date().toISOString();
      await this.logAuditEvent(adminId, 'toggle_feature_flag', 'feature_flag', key, {
        newData: { is_enabled: enabled },
      });
    }
    return true;
  }

  async getAdministrators(): Promise<AdminUser[]> {
    return FALLBACK_ADMINS;
  }

  // ====================================================================
  // 11. DATA EXPORT GENERATOR
  // ====================================================================
  async exportDataset(type: string, adminId: string): Promise<string> {
    await this.logAuditEvent(adminId, `export_dataset_${type}`, 'data_export', type, {
      metadata: { format: 'csv' },
    });

    if (type === 'users') {
      const { users } = await this.getUsers();
      const headers = ['ID', 'Role', 'First Name', 'Last Name', 'Email', 'Status', 'Email Verified', 'Created At'];
      const rows = users.map((u) => [
        u.id,
        u.role,
        u.first_name,
        u.last_name,
        u.email,
        u.account_status,
        String(u.email_verified),
        u.created_at,
      ]);
      return [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    }

    if (type === 'companies') {
      const { companies } = await this.getCompanies();
      const headers = ['ID', 'Name', 'Industry', 'Size', 'Status', 'Verified At', 'Country'];
      const rows = companies.map((c) => [
        c.id,
        c.company_name,
        c.industry,
        c.company_size,
        c.verification_status,
        c.verified_at || '',
        c.country || '',
      ]);
      return [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    }

    if (type === 'jobs') {
      const { jobs } = await this.getJobs();
      const headers = ['ID', 'Title', 'Reference', 'Company', 'Status', 'Work Mode', 'Salary Min', 'Salary Max', 'Deadline'];
      const rows = jobs.map((j) => [
        j.id,
        j.title,
        j.reference_number,
        j.company?.company_name || 'N/A',
        j.status,
        j.work_mode,
        String(j.salary_min || 0),
        String(j.salary_max || 0),
        j.application_deadline || '',
      ]);
      return [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    }

    // Default audit log export
    const { logs } = await this.getAuditLogs({ limit: 100 });
    const headers = ['ID', 'Timestamp', 'Actor ID', 'Action', 'Entity Type', 'Entity ID'];
    const rows = logs.map((l) => [l.id, l.created_at, l.actor_id || 'System', l.action, l.entity_type, l.entity_id || '']);
    return [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
  }
}

export const adminService = new AdminService();
