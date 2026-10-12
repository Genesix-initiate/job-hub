import { Profile, JobSeekerProfile, EmployerProfile, Company, UserRole, AdminRoleName } from '../types/database';

export interface RegisteredAccount {
  email: string;
  password: string;
  role: UserRole;
  adminRole?: AdminRoleName;
  profile: Profile;
  jobSeekerProfile?: JobSeekerProfile;
  employerProfile?: EmployerProfile;
  company?: Company;
  createdAt: string;
}

const REGISTERED_USERS_KEY = 'jobhub_registered_users';

export const SEED_ACCOUNTS: RegisteredAccount[] = [
  // Super Admin
  {
    email: 'admin@jobhub.platform',
    password: 'password123',
    role: 'super_admin',
    adminRole: 'super_admin',
    createdAt: new Date().toISOString(),
    profile: {
      id: '00000000-0000-0000-0000-000000000301',
      auth_user_id: 'auth-admin-root-01',
      role: 'super_admin',
      first_name: 'Victoria',
      last_name: 'Sterling',
      display_name: 'Victoria Sterling',
      email: 'admin@jobhub.platform',
      phone: '+234 800 000 0001',
      profile_photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      country: 'Nigeria',
      state: 'Lagos',
      city: 'Lagos',
      address: 'Victoria Island',
      account_status: 'active',
      email_verified: true,
      phone_verified: true,
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  // Genesix Initiate Super Admin (both spellings for full resilience)
  {
    email: 'genesixintiate@gmail.com',
    password: '',
    role: 'super_admin',
    adminRole: 'super_admin',
    createdAt: new Date().toISOString(),
    profile: {
      id: '00000000-0000-0000-0000-000000000300',
      auth_user_id: 'auth-admin-genesix-direct',
      role: 'super_admin',
      first_name: 'Genesix',
      last_name: 'Initiate Group',
      display_name: 'Genesix Super Admin',
      email: 'genesixintiate@gmail.com',
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
  },
  {
    email: 'genesixinitiate@gmail.com',
    password: '',
    role: 'super_admin',
    adminRole: 'super_admin',
    createdAt: new Date().toISOString(),
    profile: {
      id: '00000000-0000-0000-0000-000000000302',
      auth_user_id: 'auth-admin-genesix-01',
      role: 'super_admin',
      first_name: 'Genesix',
      last_name: 'Director',
      display_name: 'Genesix Admin',
      email: 'genesixinitiate@gmail.com',
      phone: '+234 800 000 0002',
      profile_photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      country: 'Nigeria',
      state: 'Lagos',
      city: 'Lagos',
      address: 'Lekki Phase 1',
      account_status: 'active',
      email_verified: true,
      phone_verified: true,
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  // Content Admin (Can edit landing page details!)
  {
    email: 'content@jobhub.platform',
    password: 'password123',
    role: 'admin',
    adminRole: 'content_admin',
    createdAt: new Date().toISOString(),
    profile: {
      id: '00000000-0000-0000-0000-000000000303',
      auth_user_id: 'auth-admin-content-01',
      role: 'admin',
      first_name: 'Chioma',
      last_name: 'Adeyemi',
      display_name: 'Chioma Adeyemi',
      email: 'content@jobhub.platform',
      phone: '+234 803 123 4567',
      profile_photo_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80',
      country: 'Nigeria',
      state: 'Lagos',
      city: 'Lagos',
      address: 'Yaba Tech Corridor',
      account_status: 'active',
      email_verified: true,
      phone_verified: true,
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  // Candidate / Job Seeker
  {
    email: 'alex.morgan@example.com',
    password: 'password123',
    role: 'job_seeker',
    createdAt: new Date().toISOString(),
    profile: {
      id: '00000000-0000-0000-0000-000000000101',
      auth_user_id: 'auth-user-demo-seeker',
      role: 'job_seeker',
      first_name: 'Alex',
      last_name: 'Morgan',
      display_name: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      phone: '+234 802 345 6789',
      profile_photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      country: 'Nigeria',
      state: 'Lagos',
      city: 'Lagos',
      address: 'Lekki Phase 1',
      account_status: 'active',
      email_verified: true,
      phone_verified: true,
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    jobSeekerProfile: {
      id: '00000000-0000-0000-0000-000000000102',
      profile_id: '00000000-0000-0000-0000-000000000101',
      professional_headline: 'Senior Full Stack Engineer (React, Node, Go)',
      professional_summary:
        'Passionate software engineer with 6+ years designing accessible, high-performance web applications and design systems. Experienced with TypeScript, React, Vite, and cloud architecture.',
      current_position: 'Senior Software Engineer',
      years_of_experience: 6,
      employment_status: 'Employed (Open to offers)',
      expected_salary_min: 1500000,
      expected_salary_max: 2500000,
      salary_currency: 'NGN',
      preferred_job_type: 'full_time',
      preferred_work_mode: 'remote',
      preferred_location: 'Lagos, Nigeria or Remote',
      availability: '2 weeks notice',
      date_of_birth: '1995-04-12',
      gender: 'Prefer not to say',
      profile_visibility: 'public',
      profile_completion_percentage: 85,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  // Employer / Recruiter
  {
    email: 'recruiter@company.com',
    password: 'password123',
    role: 'employer',
    createdAt: new Date().toISOString(),
    profile: {
      id: '00000000-0000-0000-0000-000000000201',
      auth_user_id: 'auth-user-demo-employer',
      role: 'employer',
      first_name: 'Marcus',
      last_name: 'Vance',
      display_name: 'Marcus Vance',
      email: 'recruiter@company.com',
      phone: '+234 809 890 1234',
      profile_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      country: 'Nigeria',
      state: 'Lagos',
      city: 'Lagos',
      address: 'Victoria Island, Lagos',
      account_status: 'active',
      email_verified: true,
      phone_verified: true,
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    company: {
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
      phone: '+234 809 123 4567',
      country: 'Nigeria',
      state: 'Lagos',
      city: 'Lagos',
      address: 'Victoria Island, Lagos',
      verification_status: 'verified',
      verified_at: new Date().toISOString(),
      created_by: '00000000-0000-0000-0000-000000000201',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    employerProfile: {
      id: '00000000-0000-0000-0000-000000000202',
      profile_id: '00000000-0000-0000-0000-000000000201',
      company_id: '30000000-0000-0000-0000-000000000001',
      job_title: 'Head of Talent Acquisition',
      department: 'People & Engineering',
      company_role: 'employer_owner',
      employer_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    email: 'marcus.vance@apexcloud.example.com',
    password: 'password123',
    role: 'employer',
    createdAt: new Date().toISOString(),
    profile: {
      id: '00000000-0000-0000-0000-000000000201',
      auth_user_id: 'auth-user-demo-employer',
      role: 'employer',
      first_name: 'Marcus',
      last_name: 'Vance',
      display_name: 'Marcus Vance',
      email: 'marcus.vance@apexcloud.example.com',
      phone: '+234 809 890 1234',
      profile_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      country: 'Nigeria',
      state: 'Lagos',
      city: 'Lagos',
      address: 'Victoria Island, Lagos',
      account_status: 'active',
      email_verified: true,
      phone_verified: true,
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    company: {
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
      phone: '+234 809 123 4567',
      country: 'Nigeria',
      state: 'Lagos',
      city: 'Lagos',
      address: 'Victoria Island, Lagos',
      verification_status: 'verified',
      verified_at: new Date().toISOString(),
      created_by: '00000000-0000-0000-0000-000000000201',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    employerProfile: {
      id: '00000000-0000-0000-0000-000000000202',
      profile_id: '00000000-0000-0000-0000-000000000201',
      company_id: '30000000-0000-0000-0000-000000000001',
      job_title: 'Head of Talent Acquisition',
      department: 'People & Engineering',
      company_role: 'employer_owner',
      employer_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

export function getAllRegisteredAccounts(): RegisteredAccount[] {
  if (typeof window === 'undefined') return SEED_ACCOUNTS;
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    const custom: RegisteredAccount[] = raw ? JSON.parse(raw) : [];
    // Combine SEED_ACCOUNTS and custom registered accounts (custom takes precedence on email match)
    const seedFiltered = SEED_ACCOUNTS.filter(
      (s) => !custom.some((c) => c.email.toLowerCase() === s.email.toLowerCase())
    );
    return [...seedFiltered, ...custom];
  } catch {
    return SEED_ACCOUNTS;
  }
}

export function saveRegisteredAccount(account: RegisteredAccount): void {
  if (typeof window === 'undefined') return;
  try {
    const accounts = getAllRegisteredAccounts();
    const filtered = accounts.filter(
      (a) => a.email.toLowerCase() !== account.email.toLowerCase()
    );
    const updated = [account, ...filtered];
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save registered account', e);
  }
}

export function findAccountByEmail(email: string): RegisteredAccount | undefined {
  const accounts = getAllRegisteredAccounts();
  const normalized = email.trim().toLowerCase();
  return accounts.find((a) => a.email.toLowerCase() === normalized);
}
