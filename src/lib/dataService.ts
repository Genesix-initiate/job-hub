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

export const SEED_COMPANIES: Company[] = [];

export const SEED_JOBS: JobWithCompany[] = [];

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
        '[]'
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
      JSON.parse(localStorage.getItem(key) || localStorage.getItem(legacyKey) || '[]')
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

    return [];
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
    const localJobs = (() => {
      try {
        const raw = localStorage.getItem('tf_emp_employer_jobs') || localStorage.getItem('jobhub_employer_jobs');
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    })();
    const job = localJobs.find((j: any) => j.id === params.jobId) || SEED_JOBS.find((j) => j.id === params.jobId) || null;
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

    return [];
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

    const key = `jobhub_interviews_${applicantId}`;
    const legacyKey = `talentforge_interviews_${applicantId}`;
    const saved = localStorage.getItem(key) || localStorage.getItem(legacyKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
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

    return [];
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

    const key = `jobhub_conversations_${userId}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
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
