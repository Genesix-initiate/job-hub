import { supabase, getSupabaseCredentials } from './supabase';
import {
  Company,
  EmployerProfile,
  CompanyVerification,
  CompanyDocument,
  CompanyInvitation,
  Job,
  Skill,
  Application,
  ApplicationQuestion,
  ApplicationAnswer,
  CandidateNote,
  Interview,
  InterviewEvaluation,
  Assessment,
  AssessmentAttempt,
  Subscription,
  SubscriptionPlan,
  AuditLog,
  Profile,
  Resume,
  ApplicationStatus,
} from '../types/database';
import { SEED_COMPANIES, SEED_JOBS } from './dataService';
import { billingPricingService } from './billingPricingService';

// Seed sample applicants for demo and local test state
export const SEED_PROFILES: Profile[] = [
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
    id: '00000000-0000-0000-0000-000000000102',
    auth_user_id: 'auth-user-dev-elena',
    role: 'job_seeker',
    first_name: 'Elena',
    last_name: 'Rostova',
    display_name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    phone: '+1 (555) 345-6789',
    profile_photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    address: '789 Market Street',
    account_status: 'active',
    email_verified: true,
    phone_verified: true,
    last_login_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000103',
    auth_user_id: 'auth-user-dev-marcus',
    role: 'job_seeker',
    first_name: 'David',
    last_name: 'Kim',
    display_name: 'David Kim',
    email: 'david.kim@example.com',
    phone: '+1 (555) 456-7890',
    profile_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    country: 'United States',
    state: 'Washington',
    city: 'Seattle',
    address: '1201 3rd Ave',
    account_status: 'active',
    email_verified: true,
    phone_verified: true,
    last_login_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000104',
    auth_user_id: 'auth-user-dev-sarah',
    role: 'job_seeker',
    first_name: 'Sarah',
    last_name: 'Lin',
    display_name: 'Sarah Lin',
    email: 'sarah.lin@example.com',
    phone: '+1 (555) 567-8901',
    profile_photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    country: 'United States',
    state: 'New York',
    city: 'New York',
    address: '350 5th Avenue',
    account_status: 'active',
    email_verified: true,
    phone_verified: true,
    last_login_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000105',
    auth_user_id: 'auth-user-dev-james',
    role: 'job_seeker',
    first_name: 'James',
    last_name: 'O\'Connor',
    display_name: 'James O\'Connor',
    email: 'james.oconnor@example.com',
    phone: '+1 (555) 678-9012',
    profile_photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    country: 'United States',
    state: 'Texas',
    city: 'Austin',
    address: '500 W 2nd St',
    account_status: 'active',
    email_verified: true,
    phone_verified: true,
    last_login_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const SEED_RESUMES: Resume[] = [
  {
    id: 'res-001',
    profile_id: '00000000-0000-0000-0000-000000000101',
    title: 'Senior Frontend & React Specialist Resume',
    summary: '6+ years in frontend architecture, React, TypeScript, Next.js, and cloud application design.',
    template_name: 'Modern Executive',
    file_url: 'https://jobhub.example.com/resumes/alex-morgan-cv.pdf',
    is_primary: true,
    is_public: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'res-002',
    profile_id: '00000000-0000-0000-0000-000000000102',
    title: 'Cloud Infrastructure & Kubernetes CV',
    summary: 'Senior DevOps & SRE engineer with AWS, Docker, Kubernetes, and Terraform expertise.',
    template_name: 'Technical Minimal',
    file_url: 'https://jobhub.example.com/resumes/elena-rostova-cv.pdf',
    is_primary: true,
    is_public: true,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'res-003',
    profile_id: '00000000-0000-0000-0000-000000000103',
    title: 'Product Design & UX Systems CV',
    summary: 'Principal designer specializing in design systems, high-density SaaS tools, and Figma.',
    template_name: 'Creative Portfolio',
    file_url: 'https://jobhub.example.com/resumes/david-kim-cv.pdf',
    is_primary: true,
    is_public: true,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'res-004',
    profile_id: '00000000-0000-0000-0000-000000000104',
    title: 'Data & Analytics Lead Resume',
    summary: 'Analytics engineer fluent in PostgreSQL, BigQuery, dbt, Python, and data warehousing.',
    template_name: 'Executive Clean',
    file_url: 'https://jobhub.example.com/resumes/sarah-lin-cv.pdf',
    is_primary: true,
    is_public: true,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'res-005',
    profile_id: '00000000-0000-0000-0000-000000000105',
    title: 'Full Stack Engineer Resume',
    summary: 'Versatile builder skilled in Node.js, Express, React, PostgreSQL, and GraphQL.',
    template_name: 'Clean Standard',
    file_url: 'https://jobhub.example.com/resumes/james-oconnor-cv.pdf',
    is_primary: true,
    is_public: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_EMPLOYER_APPLICATIONS: Array<Application & { applicant: Profile; job: Job; resume?: Resume; matchPercentage?: number }> = [
  {
    id: 'app-001',
    job_id: SEED_JOBS[0].id, // Principal Cloud Solutions Architect
    applicant_id: '00000000-0000-0000-0000-000000000101',
    resume_id: 'res-001',
    cover_letter: 'I have spent the last 6 years leading distributed web platforms and cloud interfaces. I have deep experience designing fault-tolerant systems in production and mentoring engineering squads. I would be thrilled to bring my passion for scalable architectures to Apex Cloud Solutions.',
    expected_salary: 160000,
    status: 'shortlisted',
    is_starred: true,
    application_reference: 'APP-2026-90412',
    applied_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    withdrawn_at: null,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    applicant: SEED_PROFILES[0],
    job: SEED_JOBS[0],
    resume: SEED_RESUMES[0],
    matchPercentage: 94,
  },
  {
    id: 'app-002',
    job_id: SEED_JOBS[0].id,
    applicant_id: '00000000-0000-0000-0000-000000000102',
    resume_id: 'res-002',
    cover_letter: 'As an experienced DevOps & Cloud Infrastructure engineer, I specialize in container orchestration, infrastructure as code, and site reliability. I would love to contribute to Apex Cloud Solutions enterprise infrastructure.',
    expected_salary: 175000,
    status: 'interview',
    is_starred: true,
    application_reference: 'APP-2026-90413',
    applied_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    withdrawn_at: null,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    applicant: SEED_PROFILES[1],
    job: SEED_JOBS[0],
    resume: SEED_RESUMES[1],
    matchPercentage: 98,
  },
  {
    id: 'app-003',
    job_id: SEED_JOBS[0].id,
    applicant_id: '00000000-0000-0000-0000-000000000103',
    resume_id: 'res-003',
    cover_letter: 'Applying with a background in digital platforms, user experience architecture, and collaborative technical team leadership.',
    expected_salary: 145000,
    status: 'applied',
    is_starred: false,
    application_reference: 'APP-2026-90414',
    applied_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    withdrawn_at: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    applicant: SEED_PROFILES[2],
    job: SEED_JOBS[0],
    resume: SEED_RESUMES[2],
    matchPercentage: 72,
  },
  {
    id: 'app-004',
    job_id: SEED_JOBS[0].id,
    applicant_id: '00000000-0000-0000-0000-000000000104',
    resume_id: 'res-004',
    cover_letter: 'Strong quantitative background and experience handling large-scale analytics data pipelines on AWS and GCP.',
    expected_salary: 155000,
    status: 'assessment',
    is_starred: false,
    application_reference: 'APP-2026-90415',
    applied_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    withdrawn_at: null,
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    applicant: SEED_PROFILES[3],
    job: SEED_JOBS[0],
    resume: SEED_RESUMES[3],
    matchPercentage: 86,
  },
  {
    id: 'app-005',
    job_id: SEED_JOBS[0].id,
    applicant_id: '00000000-0000-0000-0000-000000000105',
    resume_id: 'res-005',
    cover_letter: 'Full-stack developer with 5 years experience building modern cloud web applications with Node, React, and TypeScript.',
    expected_salary: 135000,
    status: 'under_review',
    is_starred: false,
    application_reference: 'APP-2026-90416',
    applied_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    withdrawn_at: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    applicant: SEED_PROFILES[4],
    job: SEED_JOBS[0],
    resume: SEED_RESUMES[4],
    matchPercentage: 81,
  },
];

export const INITIAL_COMPANY_DOCUMENTS: CompanyDocument[] = [
  {
    id: 'doc-001',
    company_id: '30000000-0000-0000-0000-000000000001',
    uploaded_by: '00000000-0000-0000-0000-000000000201',
    document_type: 'Certificate of Incorporation',
    file_name: 'apex_cloud_incorporation_2019.pdf',
    storage_path: 'company-documents/30000000-0000-0000-0000-000000000001/incorporation.pdf',
    mime_type: 'application/pdf',
    file_size: 1420500,
    verification_status: 'verified',
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: 'doc-002',
    company_id: '30000000-0000-0000-0000-000000000001',
    uploaded_by: '00000000-0000-0000-0000-000000000201',
    document_type: 'Tax Identification & EIN Certificate',
    file_name: 'irs_ein_confirmation.pdf',
    storage_path: 'company-documents/30000000-0000-0000-0000-000000000001/ein_cert.pdf',
    mime_type: 'application/pdf',
    file_size: 890300,
    verification_status: 'verified',
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
];

export const INITIAL_INTERVIEWS: Array<Interview & { application: Application; applicant: Profile; job: Job }> = [
  {
    id: 'int-001',
    application_id: 'app-002',
    scheduled_by: '00000000-0000-0000-0000-000000000201',
    interview_type: 'technical',
    title: 'Cloud Architecture & Systems Design Deep-Dive',
    description: '45-minute technical discussion covering AWS, Kubernetes orchestration, and multi-tenant observability.',
    scheduled_at: new Date(Date.now() + 2 * 86400000 + 3600000 * 4).toISOString(),
    duration_minutes: 45,
    location: 'Google Meet',
    meeting_url: 'https://meet.google.com/apx-cld-eng',
    status: 'scheduled',
    cancellation_reason: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    application: INITIAL_EMPLOYER_APPLICATIONS[1],
    applicant: SEED_PROFILES[1],
    job: SEED_JOBS[0],
  },
  {
    id: 'int-002',
    application_id: 'app-001',
    scheduled_by: '00000000-0000-0000-0000-000000000201',
    interview_type: 'screening',
    title: 'Initial Talent Discovery & Culture Match',
    description: 'Initial 30-minute screening conversation regarding career trajectory and values alignment.',
    scheduled_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    duration_minutes: 30,
    location: 'Zoom',
    meeting_url: 'https://zoom.us/j/9082341908',
    status: 'completed',
    cancellation_reason: null,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    application: INITIAL_EMPLOYER_APPLICATIONS[0],
    applicant: SEED_PROFILES[0],
    job: SEED_JOBS[0],
  },
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-free',
    name: 'Starter / Free',
    description: 'Perfect for small teams hiring occasionally.',
    price: 0,
    currency: 'USD',
    billing_interval: 'month',
    features: ['Up to 2 active jobs', 'Basic applicant search', '1 team member', 'Email notifications'],
    max_active_jobs: 2,
    max_applications: 50,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'plan-basic',
    name: 'Growth',
    description: 'Designed for fast-growing startups scaling their teams.',
    price: 99,
    currency: 'USD',
    billing_interval: 'month',
    features: ['Up to 10 active jobs', 'Candidate resume database', '3 team seats', 'Custom screening questions', 'Priority support'],
    max_active_jobs: 10,
    max_applications: 500,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'plan-pro',
    name: 'Professional',
    description: 'Full-featured recruitment platform with advanced screening & assessments.',
    price: 249,
    currency: 'USD',
    billing_interval: 'month',
    features: ['Unlimited active jobs', 'Candidate video interviews', 'Unlimited team members', 'Automated assessments', 'Custom branding', 'Recruitment analytics'],
    max_active_jobs: 100,
    max_applications: 5000,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    description: 'Custom compliance, dedicated account manager, and SLA guarantees.',
    price: 799,
    currency: 'USD',
    billing_interval: 'month',
    features: ['Dedicated talent advisor', 'Custom ATS webhooks', 'SSO & Audit logging', 'Multi-entity billing', 'Bespoke contracts'],
    max_active_jobs: 999,
    max_applications: 99999,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

class EmployerService {
  private get isConnected() {
    const creds = getSupabaseCredentials();
    return Boolean(creds.url && creds.anonKey && !creds.url.includes('placeholder'));
  }

  // --- LOCAL CACHE / FALLBACK HELPERS ---
  private getStorageKey(key: string) {
    return `tf_emp_${key}`;
  }

  private getStored<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(this.getStorageKey(key));
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setStored<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.getStorageKey(key), JSON.stringify(value));
    } catch {}
  }

  // ==========================================
  // 1. COMPANY MANAGEMENT & VERIFICATION
  // ==========================================
  async getCompany(companyId: string): Promise<Company | null> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase.from('companies').select('*').eq('id', companyId).maybeSingle();
        if (!error && data) return data as Company;
      } catch {}
    }
    const companies = this.getStored<Company[]>('companies', SEED_COMPANIES);
    return companies.find((c) => c.id === companyId) || SEED_COMPANIES[0];
  }

  async updateCompany(companyId: string, updates: Partial<Company>): Promise<{ company: Company | null; error: string | null }> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase.from('companies').update(updates).eq('id', companyId).select().single();
        if (error) return { company: null, error: error.message };
        return { company: data as Company, error: null };
      } catch (err: any) {
        return { company: null, error: err.message };
      }
    }
    const companies = this.getStored<Company[]>('companies', SEED_COMPANIES);
    const updatedList = companies.map((c) => (c.id === companyId ? { ...c, ...updates, updated_at: new Date().toISOString() } : c));
    this.setStored('companies', updatedList);
    const found = updatedList.find((c) => c.id === companyId) || null;
    return { company: found, error: null };
  }

  async getCompanyDocuments(companyId: string): Promise<CompanyDocument[]> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase.from('company_documents').select('*').eq('company_id', companyId).order('created_at', { ascending: false });
        if (!error && data) return data as CompanyDocument[];
      } catch {}
    }
    return this.getStored<CompanyDocument[]>(`docs_${companyId}`, INITIAL_COMPANY_DOCUMENTS);
  }

  async uploadCompanyDocument(
    companyId: string,
    uploadedBy: string,
    documentType: string,
    file: File
  ): Promise<{ document: CompanyDocument | null; error: string | null }> {
    let storagePath = `company-documents/${companyId}/${Date.now()}_${file.name}`;
    if (this.isConnected) {
      try {
        const { error: uploadErr } = await supabase.storage.from('company-documents').upload(storagePath, file);
        if (uploadErr) return { document: null, error: uploadErr.message };

        const { data, error } = await supabase
          .from('company_documents')
          .insert({
            company_id: companyId,
            uploaded_by: uploadedBy,
            document_type: documentType,
            file_name: file.name,
            storage_path: storagePath,
            mime_type: file.type,
            file_size: file.size,
            verification_status: 'pending',
          })
          .select()
          .single();

        if (error) return { document: null, error: error.message };
        return { document: data as CompanyDocument, error: null };
      } catch (err: any) {
        return { document: null, error: err.message };
      }
    }

    const newDoc: CompanyDocument = {
      id: `doc-${Date.now()}`,
      company_id: companyId,
      uploaded_by: uploadedBy,
      document_type: documentType,
      file_name: file.name,
      storage_path: URL.createObjectURL(file),
      mime_type: file.type,
      file_size: file.size,
      verification_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const current = this.getStored<CompanyDocument[]>(`docs_${companyId}`, INITIAL_COMPANY_DOCUMENTS);
    this.setStored(`docs_${companyId}`, [newDoc, ...current]);
    return { document: newDoc, error: null };
  }

  async submitCompanyVerification(
    companyId: string,
    submittedBy: string,
    registrationNumber: string,
    registrationType: string,
    reviewerNotes?: string
  ): Promise<{ verification: CompanyVerification | null; error: string | null }> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase
          .from('company_verifications')
          .insert({
            company_id: companyId,
            submitted_by: submittedBy,
            registration_number: registrationNumber,
            registration_type: registrationType,
            verification_status: 'under_review',
            reviewer_notes: reviewerNotes || null,
          })
          .select()
          .single();

        if (error) return { verification: null, error: error.message };
        // Update company status to under_review
        await supabase.from('companies').update({ verification_status: 'under_review' }).eq('id', companyId);
        return { verification: data as CompanyVerification, error: null };
      } catch (err: any) {
        return { verification: null, error: err.message };
      }
    }

    const verification: CompanyVerification = {
      id: `verif-${Date.now()}`,
      company_id: companyId,
      submitted_by: submittedBy,
      registration_number: registrationNumber,
      registration_type: registrationType,
      verification_status: 'under_review',
      reviewer_notes: reviewerNotes,
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.setStored(`verif_${companyId}`, verification);
    await this.updateCompany(companyId, { verification_status: 'under_review' });
    return { verification, error: null };
  }

  // ==========================================
  // 2. TEAM & INVITATIONS
  // ==========================================
  async getCompanyTeam(companyId: string): Promise<Array<{ profile: Profile; employerProfile: EmployerProfile }>> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase
          .from('employer_profiles')
          .select('*, profile:profiles(*)')
          .eq('company_id', companyId);
        if (!error && data) {
          return data.map((item: any) => ({
            profile: item.profile,
            employerProfile: item,
          }));
        }
      } catch {}
    }

    const localTeam = this.getStored<Array<{ profile: Profile; employerProfile: EmployerProfile }>>(`team_${companyId}`, [
      {
        profile: {
          id: '00000000-0000-0000-0000-000000000201',
          auth_user_id: 'auth-user-demo-employer',
          role: 'employer',
          first_name: 'Marcus',
          last_name: 'Vance',
          display_name: 'Marcus Vance',
          email: 'marcus.vance@apexcloud.example.com',
          phone: '+1 (555) 890-1234',
          profile_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
          country: 'United States',
          state: 'California',
          city: 'San Francisco',
          address: '100 Pine Street',
          account_status: 'active',
          email_verified: true,
          phone_verified: true,
          last_login_at: new Date().toISOString(),
          created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        employerProfile: {
          id: '00000000-0000-0000-0000-000000000202',
          profile_id: '00000000-0000-0000-0000-000000000201',
          company_id: companyId,
          job_title: 'Head of Talent Acquisition',
          department: 'People & Engineering',
          company_role: 'employer_owner',
          employer_status: 'active',
          created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
      {
        profile: {
          id: '00000000-0000-0000-0000-000000000203',
          auth_user_id: 'auth-user-demo-claire',
          role: 'employer',
          first_name: 'Claire',
          last_name: 'Dupont',
          display_name: 'Claire Dupont',
          email: 'claire.dupont@apexcloud.example.com',
          phone: '+1 (555) 789-0123',
          profile_photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
          country: 'United States',
          state: 'California',
          city: 'San Francisco',
          address: '100 Pine Street',
          account_status: 'active',
          email_verified: true,
          phone_verified: true,
          last_login_at: new Date(Date.now() - 2 * 3600000).toISOString(),
          created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        employerProfile: {
          id: '00000000-0000-0000-0000-000000000204',
          profile_id: '00000000-0000-0000-0000-000000000203',
          company_id: companyId,
          job_title: 'Senior Technical Recruiter',
          department: 'People & Engineering',
          company_role: 'recruiter',
          employer_status: 'active',
          created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
      {
        profile: {
          id: '00000000-0000-0000-0000-000000000205',
          auth_user_id: 'auth-user-demo-eric',
          role: 'employer',
          first_name: 'Eric',
          last_name: 'Thornton',
          display_name: 'Eric Thornton',
          email: 'eric.thornton@apexcloud.example.com',
          phone: '+1 (555) 456-1122',
          profile_photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
          country: 'United States',
          state: 'California',
          city: 'San Francisco',
          address: '100 Pine Street',
          account_status: 'active',
          email_verified: true,
          phone_verified: true,
          last_login_at: new Date(Date.now() - 24 * 3600000).toISOString(),
          created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        employerProfile: {
          id: '00000000-0000-0000-0000-000000000206',
          profile_id: '00000000-0000-0000-0000-000000000205',
          company_id: companyId,
          job_title: 'Engineering Director / Hiring Manager',
          department: 'Cloud Systems',
          company_role: 'hiring_manager',
          employer_status: 'active',
          created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
    ]);
    return localTeam;
  }

  async getCompanyInvitations(companyId: string): Promise<CompanyInvitation[]> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase
          .from('company_invitations')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });
        if (!error && data) return data as CompanyInvitation[];
      } catch {}
    }
    return this.getStored<CompanyInvitation[]>(`invites_${companyId}`, [
      {
        id: 'inv-001',
        company_id: companyId,
        invited_by: '00000000-0000-0000-0000-000000000201',
        email: 'lisa.patel@apexcloud.example.com',
        name: 'Lisa Patel',
        role: 'recruiter',
        status: 'pending',
        expires_at: new Date(Date.now() + 5 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  }

  async inviteTeamMember(
    companyId: string,
    invitedBy: string,
    email: string,
    name: string,
    role: 'employer_owner' | 'employer_admin' | 'recruiter' | 'hiring_manager'
  ): Promise<{ invitation: CompanyInvitation | null; error: string | null }> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase
          .from('company_invitations')
          .insert({
            company_id: companyId,
            invited_by: invitedBy,
            email,
            name,
            role,
            status: 'pending',
          })
          .select()
          .single();

        if (error) return { invitation: null, error: error.message };
        return { invitation: data as CompanyInvitation, error: null };
      } catch (err: any) {
        return { invitation: null, error: err.message };
      }
    }

    const invitation: CompanyInvitation = {
      id: `inv-${Date.now()}`,
      company_id: companyId,
      invited_by: invitedBy,
      email,
      name,
      role,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const current = this.getStored<CompanyInvitation[]>(`invites_${companyId}`, []);
    this.setStored(`invites_${companyId}`, [invitation, ...current]);
    return { invitation, error: null };
  }

  async cancelInvitation(companyId: string, invitationId: string): Promise<void> {
    if (this.isConnected) {
      try {
        await supabase.from('company_invitations').update({ status: 'cancelled' }).eq('id', invitationId);
      } catch {}
    }
    const current = this.getStored<CompanyInvitation[]>(`invites_${companyId}`, []);
    this.setStored(
      `invites_${companyId}`,
      current.map((inv) => (inv.id === invitationId ? { ...inv, status: 'cancelled' } : inv))
    );
  }

  // ==========================================
  // 3. EMPLOYER JOBS MANAGEMENT
  // ==========================================
  async getEmployerJobs(companyId: string, filter?: { status?: string; query?: string }): Promise<Job[]> {
    if (this.isConnected) {
      try {
        let query = supabase.from('jobs').select('*').eq('company_id', companyId).order('created_at', { ascending: false });
        if (filter?.status && filter.status !== 'all') {
          query = query.eq('status', filter.status);
        }
        if (filter?.query) {
          query = query.ilike('title', `%${filter.query}%`);
        }
        const { data, error } = await query;
        if (!error && data) return data as Job[];
      } catch {}
    }

    let jobs = this.getStored<Job[]>('employer_jobs', SEED_JOBS);
    if (companyId) {
      jobs = jobs.filter((j) => j.company_id === companyId);
    }
    if (filter?.status && filter.status !== 'all') {
      jobs = jobs.filter((j) => j.status === filter.status);
    }
    if (filter?.query) {
      const q = filter.query.toLowerCase();
      jobs = jobs.filter((j) => j.title.toLowerCase().includes(q) || j.reference_number.toLowerCase().includes(q));
    }
    return jobs;
  }

  async getJobById(jobId: string): Promise<Job | null> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase.from('jobs').select('*').eq('id', jobId).maybeSingle();
        if (!error && data) return data as Job;
      } catch {}
    }
    const jobs = this.getStored<Job[]>('employer_jobs', SEED_JOBS);
    return jobs.find((j) => j.id === jobId) || null;
  }

  async createJob(
    jobData: Partial<Job>,
    skills: string[] = [],
    benefits: string[] = [],
    questions: Partial<ApplicationQuestion>[] = []
  ): Promise<{ job: Job | null; error: string | null }> {
    const slug = (jobData.title || 'job')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + `-${Date.now().toString().slice(-4)}`;

    const refNumber = `REF-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const payload = {
      ...jobData,
      slug,
      reference_number: jobData.reference_number || refNumber,
      status: jobData.status || 'draft',
      vacancies: jobData.vacancies || 1,
      experience_min: jobData.experience_min || 0,
      salary_currency: jobData.salary_currency || 'USD',
      salary_period: jobData.salary_period || 'year',
      salary_visibility: jobData.salary_visibility || 'visible',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isConnected) {
      try {
        const { data, error } = await supabase.from('jobs').insert(payload).select().single();
        if (error) return { job: null, error: error.message };

        const newJob = data as Job;

        // Insert questions if provided
        if (questions.length > 0) {
          const formattedQuestions = questions.map((q, idx) => ({
            job_id: newJob.id,
            question_text: q.question_text || '',
            question_type: q.question_type || 'text',
            is_required: q.is_required ?? true,
            sort_order: idx + 1,
          }));
          await supabase.from('application_questions').insert(formattedQuestions);
        }

        // Insert benefits
        if (benefits.length > 0) {
          const benefitRows = benefits.map((b) => ({ job_id: newJob.id, benefit: b }));
          await supabase.from('job_benefits').insert(benefitRows);
        }

        return { job: newJob, error: null };
      } catch (err: any) {
        return { job: null, error: err.message };
      }
    }

    const createdJob: Job = {
      id: `job-${Date.now()}`,
      company_id: payload.company_id || '30000000-0000-0000-0000-000000000001',
      created_by: payload.created_by || '00000000-0000-0000-0000-000000000201',
      category_id: payload.category_id || 'cat-01',
      title: payload.title || 'Untitled Job',
      slug,
      reference_number: refNumber,
      description: payload.description || '',
      responsibilities: payload.responsibilities || '',
      requirements: payload.requirements || '',
      education_requirement: payload.education_requirement || 'Bachelor\'s Degree',
      experience_min: payload.experience_min || 0,
      experience_max: payload.experience_max || null,
      salary_min: payload.salary_min || null,
      salary_max: payload.salary_max || null,
      salary_currency: payload.salary_currency || 'USD',
      salary_period: payload.salary_period || 'year',
      salary_visibility: payload.salary_visibility || 'visible',
      employment_type: payload.employment_type || 'full_time',
      work_mode: payload.work_mode || 'remote',
      country: payload.country || 'United States',
      state: payload.state || 'California',
      city: payload.city || 'San Francisco',
      address: payload.address || null,
      vacancies: payload.vacancies || 1,
      application_deadline: payload.application_deadline || new Date(Date.now() + 30 * 86400000).toISOString(),
      status: payload.status as any,
      is_featured: payload.is_featured || false,
      is_sponsored: payload.is_sponsored || false,
      published_at: payload.status === 'published' ? new Date().toISOString() : null,
      closed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const currentJobs = this.getStored<Job[]>('employer_jobs', SEED_JOBS);
    this.setStored('employer_jobs', [createdJob, ...currentJobs]);
    return { job: createdJob, error: null };
  }

  async updateJob(jobId: string, updates: Partial<Job>): Promise<{ job: Job | null; error: string | null }> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase.from('jobs').update(updates).eq('id', jobId).select().single();
        if (error) return { job: null, error: error.message };
        return { job: data as Job, error: null };
      } catch (err: any) {
        return { job: null, error: err.message };
      }
    }

    const currentJobs = this.getStored<Job[]>('employer_jobs', SEED_JOBS);
    const updated = currentJobs.map((j) => (j.id === jobId ? { ...j, ...updates, updated_at: new Date().toISOString() } : j));
    this.setStored('employer_jobs', updated);
    const found = updated.find((j) => j.id === jobId) || null;
    return { job: found, error: null };
  }

  async publishJob(jobId: string, companyId: string): Promise<{ success: boolean; error: string | null }> {
    // Check verification requirement (Section 12)
    const company = await this.getCompany(companyId);
    if (!company || company.verification_status !== 'verified') {
      return {
        success: false,
        error: 'Your company must be verified before you can publish a job. Please submit your business verification documents.',
      };
    }

    const res = await this.updateJob(jobId, {
      status: 'published',
      published_at: new Date().toISOString(),
    });

    if (res.error) return { success: false, error: res.error };
    return { success: true, error: null };
  }

  async pauseJob(jobId: string): Promise<{ success: boolean; error: string | null }> {
    const res = await this.updateJob(jobId, { status: 'paused' });
    return { success: !res.error, error: res.error };
  }

  async resumeJob(jobId: string): Promise<{ success: boolean; error: string | null }> {
    const res = await this.updateJob(jobId, { status: 'published' });
    return { success: !res.error, error: res.error };
  }

  async closeJob(jobId: string): Promise<{ success: boolean; error: string | null }> {
    const res = await this.updateJob(jobId, {
      status: 'closed',
      closed_at: new Date().toISOString(),
    });
    return { success: !res.error, error: res.error };
  }

  async duplicateJob(jobId: string, createdBy: string): Promise<Job | null> {
    const original = await this.getJobById(jobId);
    if (!original) return null;

    const duplicateData: Partial<Job> = {
      ...original,
      title: `${original.title} (Copy)`,
      status: 'draft',
      created_by: createdBy,
      published_at: null,
      closed_at: null,
    };
    const res = await this.createJob(duplicateData);
    return res.job;
  }

  // ==========================================
  // 4. APPLICANT MANAGEMENT & PIPELINE
  // ==========================================
  async getEmployerApplicants(
    companyId: string,
    filters?: {
      jobId?: string;
      stage?: string;
      query?: string;
      isStarred?: boolean;
    }
  ): Promise<Array<Application & { applicant: Profile; job: Job; resume?: Resume; matchPercentage?: number }>> {
    if (this.isConnected) {
      try {
        let query = supabase
          .from('applications')
          .select('*, applicant:profiles(*), job:jobs(*), resume:resumes(*)')
          .order('applied_at', { ascending: false });

        if (filters?.jobId && filters.jobId !== 'all') {
          query = query.eq('job_id', filters.jobId);
        }
        if (filters?.stage && filters.stage !== 'all') {
          query = query.eq('status', filters.stage);
        }
        if (filters?.isStarred) {
          query = query.eq('is_starred', true);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data as any;
        }
      } catch {}
    }

    let applicants = this.getStored('employer_applications', INITIAL_EMPLOYER_APPLICATIONS);
    if (filters?.jobId && filters.jobId !== 'all') {
      applicants = applicants.filter((a) => a.job_id === filters.jobId);
    }
    if (filters?.stage && filters.stage !== 'all') {
      applicants = applicants.filter((a) => a.status === filters.stage);
    }
    if (filters?.isStarred) {
      applicants = applicants.filter((a) => a.is_starred);
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      applicants = applicants.filter(
        (a) =>
          a.applicant.first_name.toLowerCase().includes(q) ||
          a.applicant.last_name.toLowerCase().includes(q) ||
          a.applicant.email.toLowerCase().includes(q) ||
          a.job.title.toLowerCase().includes(q) ||
          a.application_reference.toLowerCase().includes(q)
      );
    }
    return applicants;
  }

  async getApplicationById(applicationId: string): Promise<(Application & { applicant: Profile; job: Job; resume?: Resume }) | null> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*, applicant:profiles(*), job:jobs(*), resume:resumes(*)')
          .eq('id', applicationId)
          .maybeSingle();
        if (!error && data) return data as any;
      } catch {}
    }
    const applicants = this.getStored('employer_applications', INITIAL_EMPLOYER_APPLICATIONS);
    return applicants.find((a) => a.id === applicationId) || null;
  }

  async updateApplicationStage(
    applicationId: string,
    newStage: ApplicationStatus,
    actorId: string,
    note?: string
  ): Promise<{ success: boolean; error: string | null }> {
    if (this.isConnected) {
      try {
        const { error } = await supabase.from('applications').update({ status: newStage }).eq('id', applicationId);
        if (error) return { success: false, error: error.message };

        // Insert into audit status history
        await supabase.from('application_status_history').insert({
          application_id: applicationId,
          status: newStage,
          changed_by: actorId,
          notes: note || `Stage updated to ${newStage}`,
        });

        return { success: true, error: null };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    const applicants = this.getStored('employer_applications', INITIAL_EMPLOYER_APPLICATIONS);
    const updated = applicants.map((a) => (a.id === applicationId ? { ...a, status: newStage, updated_at: new Date().toISOString() } : a));
    this.setStored('employer_applications', updated);
    return { success: true, error: null };
  }

  async toggleStarApplicant(applicationId: string): Promise<boolean> {
    const applicants = this.getStored('employer_applications', INITIAL_EMPLOYER_APPLICATIONS);
    let newStarred = true;
    const updated = applicants.map((a) => {
      if (a.id === applicationId) {
        newStarred = !a.is_starred;
        return { ...a, is_starred: newStarred };
      }
      return a;
    });
    this.setStored('employer_applications', updated);

    if (this.isConnected) {
      try {
        await supabase.from('applications').update({ is_starred: newStarred }).eq('id', applicationId);
      } catch {}
    }
    return newStarred;
  }

  async getCandidateNotes(applicationId: string): Promise<CandidateNote[]> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase
          .from('candidate_notes')
          .select('*, author:profiles(first_name, last_name, display_name)')
          .eq('application_id', applicationId)
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((item: any) => ({
            ...item,
            author_name: item.author?.display_name || `${item.author?.first_name} ${item.author?.last_name}`,
          }));
        }
      } catch {}
    }
    return this.getStored<CandidateNote[]>(`notes_${applicationId}`, [
      {
        id: 'note-01',
        application_id: applicationId,
        employer_id: '30000000-0000-0000-0000-000000000001',
        author_id: '00000000-0000-0000-0000-000000000201',
        author_name: 'Marcus Vance',
        note: 'Candidate demonstrated exemplary system design depth during initial resume review. Ready to advance to technical panel.',
        created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  }

  async addCandidateNote(
    applicationId: string,
    companyId: string,
    authorId: string,
    authorName: string,
    noteText: string
  ): Promise<CandidateNote> {
    const newNote: CandidateNote = {
      id: `note-${Date.now()}`,
      application_id: applicationId,
      employer_id: companyId,
      author_id: authorId,
      author_name: authorName,
      note: noteText,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isConnected) {
      try {
        await supabase.from('candidate_notes').insert({
          application_id: applicationId,
          employer_id: companyId,
          author_id: authorId,
          note: noteText,
        });
      } catch {}
    }

    const current = this.getStored<CandidateNote[]>(`notes_${applicationId}`, []);
    this.setStored(`notes_${applicationId}`, [newNote, ...current]);
    return newNote;
  }

  // ==========================================
  // 5. INTERVIEWS
  // ==========================================
  async getEmployerInterviews(companyId: string): Promise<Array<Interview & { application: Application; applicant: Profile; job: Job }>> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase
          .from('interviews')
          .select('*, application:applications(*, applicant:profiles(*), job:jobs(*))')
          .order('scheduled_at', { ascending: true });
        if (!error && data) {
          return data.map((item: any) => ({
            ...item,
            application: item.application,
            applicant: item.application?.applicant,
            job: item.application?.job,
          }));
        }
      } catch {}
    }
    return this.getStored('employer_interviews', INITIAL_INTERVIEWS);
  }

  async scheduleInterview(
    data: Partial<Interview> & { application_id: string; scheduled_by: string; title: string; scheduled_at: string }
  ): Promise<{ interview: Interview | null; error: string | null }> {
    const newInterview: Interview = {
      id: `int-${Date.now()}`,
      application_id: data.application_id,
      scheduled_by: data.scheduled_by,
      interview_type: data.interview_type || 'technical',
      title: data.title,
      description: data.description || null,
      scheduled_at: data.scheduled_at,
      duration_minutes: data.duration_minutes || 45,
      location: data.location || 'Google Meet',
      meeting_url: data.meeting_url || 'https://meet.google.com/apx-new-call',
      status: 'scheduled',
      cancellation_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isConnected) {
      try {
        const { data: dbData, error } = await supabase.from('interviews').insert(newInterview).select().single();
        if (error) return { interview: null, error: error.message };

        // Move applicant to interview stage automatically
        await this.updateApplicationStage(data.application_id, 'interview', data.scheduled_by, 'Interview scheduled');
        return { interview: dbData as Interview, error: null };
      } catch (err: any) {
        return { interview: null, error: err.message };
      }
    }

    // Attach details for display
    const app = await this.getApplicationById(data.application_id);
    const enriched = {
      ...newInterview,
      application: app as any,
      applicant: app?.applicant as any,
      job: app?.job as any,
    };

    const current = this.getStored<any[]>('employer_interviews', INITIAL_INTERVIEWS);
    this.setStored('employer_interviews', [enriched, ...current]);
    await this.updateApplicationStage(data.application_id, 'interview', data.scheduled_by, 'Interview scheduled');
    return { interview: newInterview, error: null };
  }

  async rescheduleInterview(interviewId: string, newScheduledAt: string, reason?: string): Promise<void> {
    if (this.isConnected) {
      try {
        await supabase
          .from('interviews')
          .update({
            scheduled_at: newScheduledAt,
            status: 'rescheduled',
            description: reason ? `Rescheduled: ${reason}` : undefined,
          })
          .eq('id', interviewId);
      } catch {}
    }
    const current = this.getStored<any[]>('employer_interviews', INITIAL_INTERVIEWS);
    const updated = current.map((i) =>
      i.id === interviewId ? { ...i, scheduled_at: newScheduledAt, status: 'rescheduled' } : i
    );
    this.setStored('employer_interviews', updated);
  }

  async cancelInterview(interviewId: string, cancellationReason: string): Promise<void> {
    if (this.isConnected) {
      try {
        await supabase
          .from('interviews')
          .update({ status: 'cancelled', cancellation_reason: cancellationReason })
          .eq('id', interviewId);
      } catch {}
    }
    const current = this.getStored<any[]>('employer_interviews', INITIAL_INTERVIEWS);
    const updated = current.map((i) =>
      i.id === interviewId ? { ...i, status: 'cancelled', cancellation_reason: cancellationReason } : i
    );
    this.setStored('employer_interviews', updated);
  }

  async submitInterviewEvaluation(
    data: Partial<InterviewEvaluation> & { interview_id: string; evaluator_id: string; rating: number }
  ): Promise<{ evaluation: InterviewEvaluation | null; error: string | null }> {
    const evaluation: InterviewEvaluation = {
      id: `eval-${Date.now()}`,
      interview_id: data.interview_id,
      evaluator_id: data.evaluator_id,
      rating: data.rating,
      strengths: data.strengths || null,
      weaknesses: data.weaknesses || null,
      notes: data.notes || null,
      recommendation: data.recommendation || 'hire',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isConnected) {
      try {
        const { data: dbData, error } = await supabase.from('interview_evaluations').insert(evaluation).select().single();
        if (error) return { evaluation: null, error: error.message };

        // Mark interview completed
        await supabase.from('interviews').update({ status: 'completed' }).eq('id', data.interview_id);
        return { evaluation: dbData as InterviewEvaluation, error: null };
      } catch (err: any) {
        return { evaluation: null, error: err.message };
      }
    }

    const currentEvals = this.getStored<InterviewEvaluation[]>(`evals_${data.interview_id}`, []);
    this.setStored(`evals_${data.interview_id}`, [evaluation, ...currentEvals]);

    // Update interview status locally
    const current = this.getStored<any[]>('employer_interviews', INITIAL_INTERVIEWS);
    this.setStored(
      'employer_interviews',
      current.map((i) => (i.id === data.interview_id ? { ...i, status: 'completed' } : i))
    );

    return { evaluation, error: null };
  }

  // ==========================================
  // 6. ASSESSMENTS
  // ==========================================
  async getEmployerAssessments(companyId?: string): Promise<Assessment[]> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase.from('assessments').select('*').order('created_at', { ascending: false });
        if (!error && data) return data as Assessment[];
      } catch {}
    }
    return this.getStored<Assessment[]>('employer_assessments', [
      {
        id: 'asm-001',
        created_by: '00000000-0000-0000-0000-000000000201',
        title: 'Cloud Infrastructure & High-Concurrency Systems',
        description: 'Comprehensive 40-minute engineering assessment testing distributed computing, microservices, and AWS infrastructure fundamentals.',
        duration_minutes: 40,
        passing_score: 75,
        status: 'published',
        questions_count: 15,
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'asm-002',
        created_by: '00000000-0000-0000-0000-000000000201',
        title: 'Modern Frontend & TypeScript Architecture Challenge',
        description: 'Assesses state management patterns, React performance optimization, and TypeScript typing mastery.',
        duration_minutes: 30,
        passing_score: 80,
        status: 'published',
        questions_count: 12,
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'asm-003',
        created_by: '00000000-0000-0000-0000-000000000201',
        title: 'DevOps & CI/CD Pipeline Automation Test',
        description: 'Evaluates Docker, Kubernetes manifests, GitHub Actions pipelines, and secret management.',
        duration_minutes: 45,
        passing_score: 70,
        status: 'published',
        questions_count: 10,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  }

  async createAssessment(
    data: Partial<Assessment> & { title: string; duration_minutes: number; passing_score: number; created_by: string }
  ): Promise<Assessment> {
    const newAsm: Assessment = {
      id: `asm-${Date.now()}`,
      created_by: data.created_by,
      job_id: data.job_id || null,
      title: data.title,
      description: data.description || '',
      duration_minutes: data.duration_minutes,
      passing_score: data.passing_score,
      status: 'published',
      questions_count: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isConnected) {
      try {
        const { data: dbData } = await supabase.from('assessments').insert(newAsm).select().single();
        if (dbData) return dbData as Assessment;
      } catch {}
    }

    const current = this.getStored<Assessment[]>('employer_assessments', []);
    this.setStored('employer_assessments', [newAsm, ...current]);
    return newAsm;
  }

  async getAssessmentAttempts(assessmentId: string): Promise<AssessmentAttempt[]> {
    if (this.isConnected) {
      try {
        const { data, error } = await supabase
          .from('assessment_attempts')
          .select('*, applicant:profiles(first_name, last_name)')
          .eq('assessment_id', assessmentId);
        if (!error && data) {
          return data.map((item: any) => ({
            ...item,
            applicant_name: `${item.applicant?.first_name} ${item.applicant?.last_name}`,
          }));
        }
      } catch {}
    }

    return [
      {
        id: 'att-001',
        assessment_id: assessmentId,
        applicant_id: '00000000-0000-0000-0000-000000000102',
        applicant_name: 'Elena Rostova',
        started_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        submitted_at: new Date(Date.now() - 3 * 86400000 + 35 * 60000).toISOString(),
        score: 92,
        percentage: 92,
        status: 'completed',
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'att-002',
        assessment_id: assessmentId,
        applicant_id: '00000000-0000-0000-0000-000000000104',
        applicant_name: 'Sarah Lin',
        started_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        submitted_at: new Date(Date.now() - 4 * 86400000 + 28 * 60000).toISOString(),
        score: 84,
        percentage: 84,
        status: 'completed',
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  // ==========================================
  // 7. ANALYTICS
  // ==========================================
  async getEmployerAnalytics(companyId: string, jobId?: string) {
    const jobs = await this.getEmployerJobs(companyId);
    const applicants = await this.getEmployerApplicants(companyId, jobId ? { jobId } : undefined);

    const activeJobs = jobs.filter((j) => j.status === 'published').length;
    const totalJobs = jobs.length;
    const totalApplications = applicants.length;

    const stageBreakdown: Record<string, number> = {
      applied: 0,
      under_review: 0,
      shortlisted: 0,
      assessment: 0,
      interview: 0,
      selected: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
    };

    applicants.forEach((a) => {
      if (stageBreakdown[a.status] !== undefined) {
        stageBreakdown[a.status] += 1;
      }
    });

    const newApplicants = stageBreakdown.applied;
    const shortlisted = stageBreakdown.shortlisted;
    const interviews = stageBreakdown.interview;
    const offers = stageBreakdown.offer;
    const hired = stageBreakdown.hired;
    const rejected = stageBreakdown.rejected;

    // Funnel conversion calculation
    const funnel = [
      { stage: 'Applied', count: totalApplications, percentage: 100 },
      { stage: 'Shortlisted', count: shortlisted + interviews + offers + hired, percentage: totalApplications ? Math.round(((shortlisted + interviews + offers + hired) / totalApplications) * 100) : 0 },
      { stage: 'Interview', count: interviews + offers + hired, percentage: totalApplications ? Math.round(((interviews + offers + hired) / totalApplications) * 100) : 0 },
      { stage: 'Offer Made', count: offers + hired, percentage: totalApplications ? Math.round(((offers + hired) / totalApplications) * 100) : 0 },
      { stage: 'Hired', count: hired, percentage: totalApplications ? Math.round((hired / totalApplications) * 100) : 0 },
    ];

    return {
      activeJobs,
      totalJobs,
      totalApplications,
      newApplicants,
      shortlisted,
      interviews,
      offers,
      hired,
      rejected,
      views: totalJobs * 184 + totalApplications * 12,
      stageBreakdown,
      funnel,
    };
  }

  // ==========================================
  // 8. BILLING & SUBSCRIPTIONS
  // ==========================================
  async getEmployerSubscription(companyId: string): Promise<{
    subscription: Subscription | null;
    plans: SubscriptionPlan[];
    usage: { activeJobs: number; maxJobs: number; applicants: number; maxApplicants: number };
  }> {
    const plans = billingPricingService.getPlans();
    const jobs = await this.getEmployerJobs(companyId);
    const applicants = await this.getEmployerApplicants(companyId);

    const activeJobsCount = jobs.filter((j) => j.status === 'published').length;

    const mockSub: Subscription = {
      id: 'sub-001',
      employer_id: companyId,
      plan_id: 'plan-pro',
      plan: plans[2], // Pro plan
      status: 'active',
      start_date: new Date(Date.now() - 45 * 86400000).toISOString(),
      end_date: new Date(Date.now() + 320 * 86400000).toISOString(),
      auto_renew: true,
      created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };

    return {
      subscription: mockSub,
      plans,
      usage: {
        activeJobs: activeJobsCount,
        maxJobs: mockSub.plan?.max_active_jobs || 100,
        applicants: applicants.length,
        maxApplicants: mockSub.plan?.max_applications || 5000,
      },
    };
  }
}

export const employerService = new EmployerService();
