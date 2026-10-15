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
    email: 'genesixinitiate@gmail.com',
    password: '',
    role: 'super_admin',
    adminRole: 'super_admin',
    createdAt: new Date().toISOString(),
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
  },
  {
    email: 'genesixintiate@gmail.com',
    password: '',
    role: 'super_admin',
    adminRole: 'super_admin',
    createdAt: new Date().toISOString(),
    profile: {
      id: '00000000-0000-0000-0000-000000000302',
      auth_user_id: 'auth-admin-genesix-direct',
      role: 'super_admin',
      first_name: 'Genesix',
      last_name: 'Super Admin',
      display_name: 'Super Admin',
      email: 'genesixintiate@gmail.com',
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
