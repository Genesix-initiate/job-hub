import { supabase, getSupabaseCredentials } from './supabase';
import { getAllRegisteredAccounts } from './authAccounts';
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

// Production administration records (No demo accounts)
const FALLBACK_ADMINS: AdminUser[] = [
  {
    id: 'adm-001',
    profile_id: '00000000-0000-0000-0000-000000000300',
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
      id: '00000000-0000-0000-0000-000000000300',
      auth_user_id: 'auth-admin-genesix-01',
      role: 'super_admin',
      first_name: 'Genesix',
      last_name: 'Super Admin',
      display_name: 'Super Admin',
      email: 'genesixinitiate@gmail.com',
      phone: '+234 800 000 0000',
      profile_photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      country: 'Nigeria',
      state: 'Lagos',
      city: 'Lagos',
      address: 'Victoria Island / Lekki',
      account_status: 'active',
      email_verified: true,
      phone_verified: true,
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const FALLBACK_AUDIT_LOGS: AuditLog[] = [];

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

const FALLBACK_BROADCASTS: BroadcastNotification[] = [];

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

const FALLBACK_REPORTS: FallbackReportItem[] = [];

const FALLBACK_COMPLAINTS: Complaint[] = [];

const FALLBACK_PAYMENTS: PaymentTransaction[] = [];

const FALLBACK_INVOICES: Invoice[] = [];

const FALLBACK_SUBSCRIPTIONS: Subscription[] = [];

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
          totalUsers: users.length,
          totalJobSeekers: users.filter((u) => u.role === 'job_seeker').length,
          totalEmployers: users.filter((u) => u.role === 'employer').length,
          totalCompanies: companies.length,
          verifiedCompanies: companies.filter((c) => c.verification_status === 'verified').length,
          pendingVerifications: companies.filter((c) => c.verification_status === 'pending' || c.verification_status === 'under_review').length,
          totalJobs: jobs.length,
          publishedJobs: jobs.filter((j) => j.status === 'published').length,
          pendingJobs: jobs.filter((j) => j.status === 'pending_review').length,
          expiredJobs: jobs.filter((j) => j.status === 'expired' || j.status === 'closed').length,
          totalApplications: apps.length,
          applicationsToday: appsToday,
          interviewsCount: interviews.length,
          hiresCount: apps.filter((a) => a.status === 'hired').length,
          pendingReports: reports.filter((r) => r.status === 'pending' || r.status === 'investigating').length,
          activeSubscriptions: 0,
          totalRevenue: totalRevenue,
          pendingPayments: payments.filter((p) => p.status === 'pending').length,
        };
      } catch (err) {
        console.warn('Real Supabase query failed for Admin KPIs, using fallback metrics', err);
      }
    }

    const registered = getAllRegisteredAccounts();
    const localPayments = (() => {
      try {
        const raw = localStorage.getItem('jobhub_local_payments') || localStorage.getItem('talentforge_local_payments');
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    })();
    const totalRev = localPayments
      .filter((p: any) => p.status === 'successful')
      .reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);

    return {
      totalUsers: registered.length,
      totalJobSeekers: registered.filter((u) => u.role === 'job_seeker').length,
      totalEmployers: registered.filter((u) => u.role === 'employer').length,
      totalCompanies: registered.filter((u) => Boolean(u.company)).length,
      verifiedCompanies: registered.filter((u) => u.company?.verification_status === 'verified').length,
      pendingVerifications: registered.filter((u) => u.company?.verification_status === 'pending' || u.company?.verification_status === 'under_review').length,
      totalJobs: 0,
      publishedJobs: 0,
      pendingJobs: 0,
      expiredJobs: 0,
      totalApplications: 0,
      applicationsToday: 0,
      interviewsCount: 0,
      hiresCount: 0,
      pendingReports: 0,
      activeSubscriptions: 0,
      totalRevenue: totalRev,
      pendingPayments: localPayments.filter((p: any) => p.status === 'pending').length,
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

    // Real registered profiles only (no demo accounts)
    const registered = getAllRegisteredAccounts();
    const sampleUsers: Profile[] = registered.map((r) => r.profile);
    if (sampleUsers.length === 0 && FALLBACK_ADMINS[0]?.profile) {
      sampleUsers.push(FALLBACK_ADMINS[0].profile);
    }

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

    const registered = getAllRegisteredAccounts();
    const fallbackCompanies: Company[] = registered
      .filter((r) => r.company)
      .map((r) => r.company!);

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

    let localJobs: (Job & { company?: Company })[] = [];
    try {
      const raw = localStorage.getItem('tf_emp_employer_jobs') || localStorage.getItem('jobhub_employer_jobs');
      if (raw) localJobs = JSON.parse(raw);
    } catch {}
    const fallbackJobs: (Job & { company?: Company })[] = localJobs;

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
