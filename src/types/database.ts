export type UserRole = 'job_seeker' | 'employer' | 'admin' | 'super_admin';

export type AdminRoleName =
  | 'super_admin'
  | 'admin'
  | 'recruitment_admin'
  | 'moderator'
  | 'verification_admin'
  | 'finance_admin'
  | 'support'
  | 'support_admin'
  | 'content_manager'
  | 'content_admin';

export type CompanyVerificationStatus =
  | 'pending'
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'suspended';

export type JobStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'paused'
  | 'closed'
  | 'expired'
  | 'suspended';

export type EmploymentType =
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'temporary'
  | 'internship'
  | 'graduate_trainee'
  | 'freelance';

export type WorkMode = 'remote' | 'hybrid' | 'on_site';

export type ApplicationStatus =
  | 'applied'
  | 'under_review'
  | 'shortlisted'
  | 'assessment'
  | 'interview'
  | 'selected'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn'
  | 'expired';

export type InterviewStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'rescheduled'
  | 'cancelled'
  | 'no_show';

export type PaymentStatus =
  | 'pending'
  | 'successful'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type PaymentType =
  | 'job_posting'
  | 'featured_job'
  | 'sponsored_job'
  | 'subscription'
  | 'recruitment_package'
  | 'other';

export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';

export interface Profile {
  id: string;
  auth_user_id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  display_name: string | null;
  email: string;
  phone?: string | null;
  profile_photo_url?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  address?: string | null;
  account_status: 'active' | 'suspended' | 'deactivated';
  email_verified: boolean;
  phone_verified: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobSeekerProfile {
  id: string;
  profile_id: string;
  professional_headline: string | null;
  professional_summary: string | null;
  current_position: string | null;
  years_of_experience: number;
  employment_status: string | null;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  salary_currency: string;
  preferred_job_type: EmploymentType | null;
  preferred_work_mode: WorkMode | null;
  preferred_location: string | null;
  availability: string | null;
  date_of_birth: string | null;
  gender: string | null;
  profile_visibility: 'public' | 'employers_only' | 'private';
  profile_completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  company_name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  industry: string | null;
  company_size: string | null;
  founded_year: number | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  verification_status: CompanyVerificationStatus;
  verified_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmployerProfile {
  id: string;
  profile_id: string;
  company_id: string;
  job_title: string | null;
  department: string | null;
  company_role?: 'employer_owner' | 'employer_admin' | 'recruiter' | 'hiring_manager';
  employer_status: 'active' | 'pending' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CompanyVerification {
  id: string;
  company_id: string;
  submitted_by: string;
  registration_number: string;
  registration_type: string;
  verification_status: CompanyVerificationStatus;
  reviewer_id?: string | null;
  reviewer_notes?: string | null;
  submitted_at: string;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyDocument {
  id: string;
  company_id: string;
  uploaded_by: string;
  document_type: string;
  file_name: string;
  storage_path: string;
  mime_type?: string | null;
  file_size?: number | null;
  verification_status: CompanyVerificationStatus;
  created_at: string;
  updated_at: string;
}

export interface CompanyInvitation {
  id: string;
  company_id: string;
  invited_by: string;
  email: string;
  name?: string;
  role: 'employer_owner' | 'employer_admin' | 'recruiter' | 'hiring_manager';
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  token?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CandidateNote {
  id: string;
  application_id: string;
  employer_id: string;
  author_id: string;
  author_name?: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface InterviewEvaluation {
  id: string;
  interview_id: string;
  evaluator_id: string;
  rating: number; // 1 to 5
  strengths?: string | null;
  weaknesses?: string | null;
  notes?: string | null;
  recommendation?: 'strong_hire' | 'hire' | 'neutral' | 'no_hire' | 'strong_no_hire';
  created_at: string;
  updated_at: string;
}

export interface ApplicationQuestion {
  id: string;
  job_id: string;
  question_text: string;
  question_type: 'text' | 'yes_no' | 'single_choice' | 'multiple_choice' | 'number';
  is_required: boolean;
  sort_order: number;
  options?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ApplicationAnswer {
  id: string;
  application_id: string;
  question_id: string;
  answer: string;
  question?: ApplicationQuestion;
  created_at?: string;
  updated_at?: string;
}

export interface Assessment {
  id: string;
  created_by: string;
  job_id?: string | null;
  title: string;
  description?: string | null;
  duration_minutes: number;
  passing_score: number;
  status: 'draft' | 'published' | 'archived';
  questions_count?: number;
  created_at: string;
  updated_at: string;
}

export interface AssessmentQuestion {
  id: string;
  assessment_id: string;
  question: string;
  question_type: 'single_choice' | 'multiple_choice' | 'code' | 'text';
  points: number;
  sort_order: number;
  options?: AssessmentOption[];
  created_at?: string;
  updated_at?: string;
}

export interface AssessmentOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
}

export interface AssessmentAttempt {
  id: string;
  assessment_id: string;
  application_id?: string | null;
  applicant_id: string;
  applicant_name?: string;
  started_at: string;
  submitted_at?: string | null;
  score: number;
  percentage: number;
  status: 'in_progress' | 'completed' | 'timed_out' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  billing_interval: 'month' | 'year' | 'quarter';
  features: string[];
  max_active_jobs: number;
  max_applications: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  employer_id: string;
  company_name?: string;
  plan_id: string;
  plan?: SubscriptionPlan;
  status: 'active' | 'trial' | 'cancelled' | 'canceled' | 'expired' | 'past_due' | 'trialing';
  start_date?: string;
  end_date?: string;
  auto_renew?: boolean;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  actor?: Profile | null;
  actor_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  old_data?: Record<string, unknown> | null;
  new_data?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface JobCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  created_by: string;
  category_id: string;
  title: string;
  slug: string;
  reference_number: string;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  education_requirement: string | null;
  experience_min: number;
  experience_max: number | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  salary_period: 'hour' | 'month' | 'year';
  salary_visibility?: 'visible' | 'hidden' | 'negotiable';
  employment_type: EmploymentType;
  work_mode: WorkMode;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  vacancies: number;
  application_deadline: string | null;
  status: JobStatus;
  is_featured: boolean;
  is_sponsored: boolean;
  published_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  profile_id: string;
  title: string;
  summary: string | null;
  template_name: string | null;
  file_url: string | null;
  is_primary: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  resume_id: string | null;
  cover_letter: string | null;
  expected_salary: number | null;
  status: ApplicationStatus;
  is_starred?: boolean;
  application_reference: string;
  applied_at: string;
  withdrawn_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  application_id: string;
  scheduled_by: string;
  interview_type: 'screening' | 'technical' | 'cultural' | 'final';
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  meeting_url: string | null;
  status: InterviewStatus;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  attachment_path: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

// ====================================================================
// ADMIN & GOVERNANCE TYPES (PROMPT 4)
// ====================================================================

export interface Role {
  id: string;
  name: AdminRoleName | string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  profile_id: string;
  role_id: string;
  status: 'active' | 'suspended' | 'revoked';
  role?: Role;
  profile?: Profile;
  created_at: string;
  updated_at: string;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: unknown;
  description: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobReport {
  id: string;
  job_id: string;
  reported_by: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  reviewed_by: string | null;
  resolution: string | null;
  job?: Job;
  reporter?: Profile;
  reviewer?: Profile;
  created_at: string;
  updated_at: string;
}

export interface UserReport {
  id: string;
  reported_user_id: string;
  reported_by: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  reviewed_by: string | null;
  resolution: string | null;
  user?: Profile;
  reporter?: Profile;
  reviewer?: Profile;
  created_at: string;
  updated_at: string;
}

export interface CompanyReport {
  id: string;
  company_id: string;
  reported_by: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  reviewed_by: string | null;
  resolution: string | null;
  company?: Company;
  reporter?: Profile;
  reviewer?: Profile;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: string;
  submitted_by: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'submitted' | 'under_review' | 'in_progress' | 'resolved' | 'closed';
  assigned_to: string | null;
  resolution: string | null;
  submitter?: Profile;
  assignee?: Profile;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  transaction_reference: string;
  user_id: string | null;
  employer_id: string | null;
  amount: number;
  currency: string;
  payment_method: string | null;
  payment_type: 'job_posting' | 'featured_job' | 'sponsored_job' | 'subscription' | 'recruitment_package' | 'other';
  status: 'pending' | 'successful' | 'failed' | 'cancelled' | 'refunded';
  metadata: Record<string, unknown>;
  paid_at: string | null;
  payer_name?: string;
  company_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string | null;
  employer_id: string | null;
  transaction_id: string | null;
  amount: number;
  currency: string;
  status: 'draft' | 'issued' | 'paid' | 'void';
  invoice_url: string | null;
  issued_at: string;
  customer_name?: string;
  company_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CareerResource {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  image_url: string | null;
  read_time: string | null;
  author: string | null;
  author_id?: string | null;
  is_published: boolean;
  tags: string[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  target_audience: 'all' | 'job_seekers' | 'employers' | 'admins';
  priority: 'normal' | 'important' | 'urgent';
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  created_by: string | null;
  recipient_count: number;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  category: 'general' | 'recruitment' | 'billing' | 'security';
  is_enabled: boolean;
  updated_by?: string;
  updated_at: string;
}

