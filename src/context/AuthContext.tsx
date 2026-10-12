import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, getSupabaseCredentials } from '../lib/supabase';
import { Profile, JobSeekerProfile, EmployerProfile, Company, UserRole, AdminRoleName } from '../types/database';
import {
  findAccountByEmail,
  saveRegisteredAccount,
  SEED_ACCOUNTS,
  RegisteredAccount,
} from '../lib/authAccounts';
import { adminApprovalService } from '../lib/adminApprovalService';

interface AuthSessionState {
  user: User;
  profile: Profile;
  activeRole: 'job_seeker' | 'employer' | 'admin';
  adminRole?: AdminRoleName;
  jobSeekerProfile?: JobSeekerProfile | null;
  employerProfile?: EmployerProfile | null;
  company?: Company | null;
}

const AUTH_STORAGE_KEY = 'jobhub_auth_session';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  jobSeekerProfile: JobSeekerProfile | null;
  employerProfile: EmployerProfile | null;
  company: Company | null;
  userRole: UserRole;
  adminRole: AdminRoleName;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  updateJobSeekerProfile: (updates: Partial<JobSeekerProfile>) => Promise<{ error: Error | null }>;
  updateEmployerProfile: (updates: Partial<EmployerProfile>) => Promise<{ error: Error | null }>;
  updateCompany: (updates: Partial<Company>) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInCandidate: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signInEmployer: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signInAdmin: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  demoLoginAsJobSeeker: (customEmail?: string, customName?: string) => void;
  demoLoginAsEmployer: (role?: 'employer_owner' | 'employer_admin' | 'recruiter' | 'hiring_manager', customEmail?: string, companyName?: string) => void;
  demoLoginAsAdmin: (role?: AdminRoleName, customEmail?: string) => void;
  switchRole: (role: 'job_seeker' | 'employer' | 'admin') => void;
  hasAdminPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobSeekerProfile, setJobSeekerProfile] = useState<JobSeekerProfile | null>(null);
  const [employerProfile, setEmployerProfile] = useState<EmployerProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [activeRole, setActiveRole] = useState<'job_seeker' | 'employer' | 'admin'>('job_seeker');
  const [adminRole, setAdminRole] = useState<AdminRoleName>('super_admin');
  const [isLoading, setIsLoading] = useState(true);

  const creds = getSupabaseCredentials();
  const isSupabaseConnected = Boolean(creds.url && creds.anonKey && !creds.url.includes('placeholder'));

  const saveLocalSession = (data: AuthSessionState) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem('jobhub_active_role', data.activeRole);
    } catch (e) {
      console.warn('Failed to save auth session', e);
    }
  };

  const clearLocalSession = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('jobhub_demo_active');
      localStorage.removeItem('talentforge_demo_active');
    } catch (e) {
      console.warn('Failed to clear auth session', e);
    }
  };

  const fetchFullProfile = async (authUserId: string) => {
    try {
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      if (profError || !profData) {
        return;
      }

      setProfile(profData as Profile);

      if (profData.role === 'employer') {
        const { data: empData } = await supabase
          .from('employer_profiles')
          .select('*')
          .eq('profile_id', profData.id)
          .maybeSingle();

        if (empData) {
          setEmployerProfile(empData as EmployerProfile);
          const { data: compData } = await supabase
            .from('companies')
            .select('*')
            .eq('id', empData.company_id)
            .maybeSingle();
          if (compData) setCompany(compData as Company);
        }
      } else if (profData.role === 'job_seeker') {
        const { data: jsData } = await supabase
          .from('job_seeker_profiles')
          .select('*')
          .eq('profile_id', profData.id)
          .maybeSingle();

        if (jsData) {
          setJobSeekerProfile(jsData as JobSeekerProfile);
        }
      }
    } catch (err) {
      console.warn('Error fetching Supabase profile', err);
    }
  };

  // Initial Session Loading
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      // 1. First check if Supabase has an active session
      if (isSupabaseConnected) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession?.user && isMounted) {
            setSession(currentSession);
            setUser(currentSession.user);
            await fetchFullProfile(currentSession.user.id);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase session load error', e);
        }
      }

      // 2. Check local authenticated session
      const savedRaw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedRaw && isMounted) {
        try {
          const saved: AuthSessionState = JSON.parse(savedRaw);
          if (saved && saved.user && saved.profile) {
            setUser(saved.user);
            setProfile(saved.profile);
            setActiveRole(saved.activeRole);
            if (saved.adminRole) setAdminRole(saved.adminRole);
            if (saved.jobSeekerProfile) setJobSeekerProfile(saved.jobSeekerProfile);
            if (saved.employerProfile) setEmployerProfile(saved.employerProfile);
            if (saved.company) setCompany(saved.company);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          clearLocalSession();
        }
      }

      // 3. User is NOT logged in: clear state and finish loading. NO auto-demo!
      if (isMounted) {
        setUser(null);
        setSession(null);
        setProfile(null);
        setJobSeekerProfile(null);
        setEmployerProfile(null);
        setCompany(null);
        setIsLoading(false);
      }
    };

    restoreSession();

    // Listen to Supabase auth changes if connected
    if (isSupabaseConnected) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!isMounted) return;
        if (event === 'SIGNED_IN' && newSession) {
          setSession(newSession);
          setUser(newSession.user);
          await fetchFullProfile(newSession.user.id);
        } else if (event === 'SIGNED_OUT') {
          // If explicitly signed out from Supabase
          setSession(null);
          // Only clear if not using local session
          const localSaved = localStorage.getItem(AUTH_STORAGE_KEY);
          if (!localSaved) {
            setUser(null);
            setProfile(null);
            setJobSeekerProfile(null);
            setEmployerProfile(null);
            setCompany(null);
          }
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [isSupabaseConnected]);

  const refreshProfile = async () => {
    if (user?.id && isSupabaseConnected) {
      await fetchFullProfile(user.id);
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<{ error: Error | null }> => {
    try {
      if (profile?.id && isSupabaseConnected) {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', profile.id);
        if (error) return { error: new Error(error.message) };
      }
      setProfile((prev) => {
        if (!prev) return null;
        const updated = { ...prev, ...updates };
        // Sync to local session
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            parsed.profile = updated;
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
          } catch {
            // ignore
          }
        }
        return updated;
      });
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const updateJobSeekerProfile = async (updates: Partial<JobSeekerProfile>): Promise<{ error: Error | null }> => {
    try {
      if (jobSeekerProfile?.id && isSupabaseConnected) {
        const { error } = await supabase
          .from('job_seeker_profiles')
          .update(updates)
          .eq('id', jobSeekerProfile.id);
        if (error) return { error: new Error(error.message) };
      }
      setJobSeekerProfile((prev) => {
        if (!prev) return null;
        const updated = { ...prev, ...updates };
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            parsed.jobSeekerProfile = updated;
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
          } catch {
            // ignore
          }
        }
        return updated;
      });
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const updateEmployerProfile = async (updates: Partial<EmployerProfile>): Promise<{ error: Error | null }> => {
    try {
      if (employerProfile?.id && isSupabaseConnected) {
        const { error } = await supabase
          .from('employer_profiles')
          .update(updates)
          .eq('id', employerProfile.id);
        if (error) return { error: new Error(error.message) };
      }
      setEmployerProfile((prev) => (prev ? { ...prev, ...updates } : null));
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const updateCompany = async (updates: Partial<Company>): Promise<{ error: Error | null }> => {
    try {
      if (company?.id && isSupabaseConnected) {
        const { error } = await supabase
          .from('companies')
          .update(updates)
          .eq('id', company.id);
        if (error) return { error: new Error(error.message) };
      }
      setCompany((prev) => (prev ? { ...prev, ...updates } : null));
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const signOut = async () => {
    if (isSupabaseConnected) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error', e);
      }
    }
    clearLocalSession();
    setUser(null);
    setSession(null);
    setProfile(null);
    setJobSeekerProfile(null);
    setEmployerProfile(null);
    setCompany(null);
  };

  // CANDIDATE AUTHENTICATION
  const signInCandidate = async (email: string, password = ''): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Try Supabase if connected
    if (isSupabaseConnected) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (!error && data?.user) {
          setUser(data.user);
          setSession(data.session);
          setActiveRole('job_seeker');
          await fetchFullProfile(data.user.id);
          return { success: true };
        }
      } catch (e) {
        console.warn('Supabase candidate login notice', e);
      }
    }

    // 2. Check local registered/seed accounts
    const account = findAccountByEmail(trimmedEmail);
    if (account) {
      if (account.password && password && account.password !== password) {
        return { success: false, error: 'Incorrect password. Please verify and try again.' };
      }
      const authUser = { id: account.profile.auth_user_id, email: account.email } as User;
      setUser(authUser);
      setProfile(account.profile);
      setJobSeekerProfile(account.jobSeekerProfile || null);
      setActiveRole('job_seeker');

      saveLocalSession({
        user: authUser,
        profile: account.profile,
        activeRole: 'job_seeker',
        jobSeekerProfile: account.jobSeekerProfile,
      });
      return { success: true };
    }

    // 3. If valid email format, authenticate new candidate session
    if (trimmedEmail.includes('@')) {
      const defaultName = trimmedEmail.split('@')[0].replace(/[._-]/g, ' ');
      const capitalized = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
      const newProfile: Profile = {
        id: `candidate-${Date.now()}`,
        auth_user_id: `auth-${Date.now()}`,
        role: 'job_seeker',
        first_name: capitalized.split(' ')[0] || 'Candidate',
        last_name: capitalized.split(' ')[1] || 'User',
        display_name: capitalized,
        email: trimmedEmail,
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Lagos',
        account_status: 'active',
        email_verified: true,
        phone_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const newDetails: JobSeekerProfile = {
        id: `details-${Date.now()}`,
        profile_id: newProfile.id,
        professional_headline: 'Software Engineer',
        professional_summary: 'Passionate developer building high-performance tech solutions.',
        current_position: 'Software Developer',
        years_of_experience: 3,
        employment_status: 'Open to offers',
        expected_salary_min: 1500000,
        expected_salary_max: 2500000,
        salary_currency: 'NGN',
        preferred_job_type: 'full_time',
        preferred_work_mode: 'remote',
        preferred_location: 'Lagos, Nigeria',
        availability: 'Immediate',
        date_of_birth: null,
        gender: null,
        profile_visibility: 'public',
        profile_completion_percentage: 80,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const authUser = { id: newProfile.auth_user_id, email: trimmedEmail } as User;
      saveRegisteredAccount({
        email: trimmedEmail,
        password: password || 'password123',
        role: 'job_seeker',
        profile: newProfile,
        jobSeekerProfile: newDetails,
        createdAt: new Date().toISOString(),
      });

      setUser(authUser);
      setProfile(newProfile);
      setJobSeekerProfile(newDetails);
      setActiveRole('job_seeker');

      saveLocalSession({
        user: authUser,
        profile: newProfile,
        activeRole: 'job_seeker',
        jobSeekerProfile: newDetails,
      });
      return { success: true };
    }

    return { success: false, error: 'Please enter a valid email address.' };
  };

  // EMPLOYER AUTHENTICATION
  const signInEmployer = async (email: string, password = ''): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Try Supabase if connected
    if (isSupabaseConnected) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (!error && data?.user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('role')
            .eq('auth_user_id', data.user.id)
            .maybeSingle();
          if (prof && prof.role !== 'employer' && prof.role !== 'admin' && prof.role !== 'super_admin') {
            await supabase.auth.signOut();
            return { success: false, error: 'Access denied: This login is exclusively for authorized employers.' };
          }
          setUser(data.user);
          setSession(data.session);
          setActiveRole('employer');
          await fetchFullProfile(data.user.id);
          return { success: true };
        }
      } catch (e) {
        console.warn('Supabase employer login notice', e);
      }
    }

    // 2. Check local registered/seed accounts
    const account = findAccountByEmail(trimmedEmail);
    if (account) {
      if (account.password && password && account.password !== password) {
        return { success: false, error: 'Incorrect work password. Please verify your credentials.' };
      }
      const authUser = { id: account.profile.auth_user_id, email: account.email } as User;
      setUser(authUser);
      setProfile(account.profile);
      setEmployerProfile(account.employerProfile || null);
      setCompany(account.company || null);
      setActiveRole('employer');

      saveLocalSession({
        user: authUser,
        profile: account.profile,
        activeRole: 'employer',
        employerProfile: account.employerProfile,
        company: account.company,
      });
      return { success: true };
    }

    // 3. If valid email format, authenticate new employer session
    if (trimmedEmail.includes('@')) {
      const companyDomain = trimmedEmail.split('@')[1].split('.')[0];
      const compName =
        companyDomain.charAt(0).toUpperCase() + companyDomain.slice(1) + ' Technologies';
      const defaultName = trimmedEmail.split('@')[0].replace(/[._-]/g, ' ');
      const capitalized = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);

      const newCompany: Company = {
        id: `comp-${Date.now()}`,
        company_name: compName,
        slug: companyDomain.toLowerCase(),
        logo_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=150',
        description: `${compName} hiring on JOBHUB.`,
        industry: 'Information Technology',
        company_size: '11-50',
        founded_year: 2020,
        website: `https://${companyDomain}.example.com`,
        email: trimmedEmail,
        phone: '+234 800 000 0000',
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Lagos',
        address: 'Victoria Island, Lagos',
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
        created_by: `emp-prof-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const newProfile: Profile = {
        id: `emp-prof-${Date.now()}`,
        auth_user_id: `auth-emp-${Date.now()}`,
        role: 'employer',
        first_name: capitalized.split(' ')[0] || 'Recruiter',
        last_name: capitalized.split(' ')[1] || 'Lead',
        display_name: capitalized,
        email: trimmedEmail,
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Lagos',
        account_status: 'active',
        email_verified: true,
        phone_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const newEmpProfile: EmployerProfile = {
        id: `emp-details-${Date.now()}`,
        profile_id: newProfile.id,
        company_id: newCompany.id,
        job_title: 'Talent Acquisition Lead',
        department: 'People & Engineering',
        company_role: 'employer_owner',
        employer_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const authUser = { id: newProfile.auth_user_id, email: trimmedEmail } as User;
      saveRegisteredAccount({
        email: trimmedEmail,
        password: password || 'password123',
        role: 'employer',
        profile: newProfile,
        company: newCompany,
        employerProfile: newEmpProfile,
        createdAt: new Date().toISOString(),
      });

      setUser(authUser);
      setProfile(newProfile);
      setEmployerProfile(newEmpProfile);
      setCompany(newCompany);
      setActiveRole('employer');

      saveLocalSession({
        user: authUser,
        profile: newProfile,
        activeRole: 'employer',
        employerProfile: newEmpProfile,
        company: newCompany,
      });
      return { success: true };
    }

    return { success: false, error: 'Please enter a valid work email address.' };
  };

  // ADMIN AUTHENTICATION (SUPER ADMIN & APPROVED ADMINS)
  const signInAdmin = async (email: string, password = ''): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      return { success: false, error: 'Please enter your administrator email.' };
    }

    // 1. SUPER ADMIN SPECIAL ACCESS (genesixintiate@gmail.com & genesixinitiate@gmail.com)
    // Authenticates strictly with password: Ayomhi000
    if (adminApprovalService.isSuperAdmin(trimmedEmail)) {
      if (password !== 'Ayomhi000') {
        return {
          success: false,
          error: 'Access Denied: Invalid Super Admin password. Please check your credentials.',
        };
      }

      const account = findAccountByEmail(trimmedEmail);
      let adminProfile: Profile;
      const authUserId = account?.profile.auth_user_id || `auth-admin-genesix-${Date.now()}`;

      if (account) {
        adminProfile = account.profile;
      } else {
        adminProfile = {
          id: '00000000-0000-0000-0000-000000000300',
          auth_user_id: authUserId,
          role: 'super_admin',
          first_name: 'Genesix',
          last_name: 'Super Admin',
          display_name: 'Genesix Super Admin',
          email: trimmedEmail,
          country: 'Nigeria',
          state: 'Lagos',
          city: 'Lagos',
          account_status: 'active',
          email_verified: true,
          phone_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      const authUser = { id: authUserId, email: trimmedEmail } as User;
      setUser(authUser);
      setProfile(adminProfile);
      setActiveRole('admin');
      setAdminRole('super_admin');

      saveLocalSession({
        user: authUser,
        profile: adminProfile,
        activeRole: 'admin',
        adminRole: 'super_admin',
      });

      return { success: true };
    }

    // 2. FOR ALL OTHER ADMIN EMAILS:
    // Only the Super Admin should give approval to other admin email requests!
    const approvalStatus = adminApprovalService.checkApprovalStatus(trimmedEmail);

    if (!approvalStatus.isApproved) {
      if (approvalStatus.status === 'pending') {
        return {
          success: false,
          error: 'Access Pending: Your request has been sent and is awaiting approval by the Super Admin (genesixintiate@gmail.com).',
        };
      }
      if (approvalStatus.status === 'rejected') {
        return {
          success: false,
          error: 'Access Denied: Your administrative request was declined or revoked by the Super Admin (genesixintiate@gmail.com).',
        };
      }
      return {
        success: false,
        error: 'Access Denied: Administrative access is restricted. Only the Super Admin (genesixintiate@gmail.com) can give approval to admin email requests. Please submit an access request.',
      };
    }

    // 3. IF APPROVED BY SUPER ADMIN:
    const assignedRole: AdminRoleName = approvalStatus.role || 'content_admin';
    const account = findAccountByEmail(trimmedEmail);

    // If a password was specified for this approved admin, verify it
    if (account && account.password && password && account.password !== password) {
      return { success: false, error: 'Invalid administrator password.' };
    }

    const authUserId = account?.profile.auth_user_id || `auth-admin-${Date.now()}`;
    const nameFromEmail = trimmedEmail.split('@')[0].replace(/[._-]/g, ' ');
    const displayName = approvalStatus.request?.name || (nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1));

    const approvedProfile: Profile = account?.profile || {
      id: `admin-${Date.now()}`,
      auth_user_id: authUserId,
      role: 'admin',
      first_name: displayName.split(' ')[0] || 'Staff',
      last_name: displayName.split(' ')[1] || 'Admin',
      display_name: displayName,
      email: trimmedEmail,
      country: 'Nigeria',
      state: 'Lagos',
      city: 'Lagos',
      account_status: 'active',
      email_verified: true,
      phone_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const authUser = { id: authUserId, email: trimmedEmail } as User;
    setUser(authUser);
    setProfile(approvedProfile);
    setActiveRole('admin');
    setAdminRole(assignedRole);

    saveLocalSession({
      user: authUser,
      profile: approvedProfile,
      activeRole: 'admin',
      adminRole: assignedRole,
    });

    return { success: true };
  };

  // Backward compatibility methods
  const demoLoginAsJobSeeker = (customEmail?: string, customName?: string) => {
    const emailToUse = customEmail?.trim() || 'alex.morgan@example.com';
    signInCandidate(emailToUse, 'password123');
  };

  const demoLoginAsEmployer = (
    _role: 'employer_owner' | 'employer_admin' | 'recruiter' | 'hiring_manager' = 'employer_owner',
    customEmail?: string,
    _companyName?: string
  ) => {
    const emailToUse = customEmail?.trim() || 'recruiter@company.com';
    signInEmployer(emailToUse, 'password123');
  };

  const demoLoginAsAdmin = (role: AdminRoleName = 'super_admin', customEmail?: string) => {
    const emailToUse = customEmail?.trim() || (role === 'content_admin' ? 'content@jobhub.platform' : 'admin@jobhub.platform');
    signInAdmin(emailToUse, 'password123');
  };

  const switchRole = (role: 'job_seeker' | 'employer' | 'admin') => {
    if (role === 'admin') {
      signInAdmin('admin@jobhub.platform', 'password123');
    } else if (role === 'employer') {
      signInEmployer('recruiter@company.com', 'password123');
    } else {
      signInCandidate('alex.morgan@example.com', 'password123');
    }
  };

  const hasAdminPermission = (permission: string): boolean => {
    if (adminRole === 'super_admin' || profile?.role === 'super_admin') return true;
    if (adminRole === 'admin') {
      return permission !== 'manage_admins';
    }
    if (adminRole === 'content_manager' || adminRole === 'content_admin') {
      return ['manage_categories', 'manage_content', 'view_dashboard'].includes(permission);
    }
    if (adminRole === 'moderator') {
      return ['moderate_jobs', 'resolve_complaints', 'view_dashboard', 'manage_content'].includes(permission);
    }
    if (adminRole === 'support' || adminRole === 'support_admin') {
      return ['resolve_complaints', 'view_job_seekers', 'view_dashboard'].includes(permission);
    }
    if (adminRole === 'finance_admin') {
      return ['manage_finance', 'view_payments', 'view_invoices', 'view_subscriptions', 'view_dashboard'].includes(permission);
    }
    if (adminRole === 'verification_admin') {
      return ['verify_companies', 'manage_employers', 'view_dashboard'].includes(permission);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        jobSeekerProfile,
        employerProfile,
        company,
        userRole: profile?.role || (activeRole === 'admin' ? 'super_admin' : activeRole === 'employer' ? 'employer' : 'job_seeker'),
        adminRole,
        isLoading,
        isSupabaseConnected,
        refreshProfile,
        updateProfile,
        updateJobSeekerProfile,
        updateEmployerProfile,
        updateCompany,
        signOut,
        signInCandidate,
        signInEmployer,
        signInAdmin,
        demoLoginAsJobSeeker,
        demoLoginAsEmployer,
        demoLoginAsAdmin,
        switchRole,
        hasAdminPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
