-- ====================================================================
-- TalentForge: Recruitment & Application Platform Database Foundation
-- Consolidated Complete Setup Migration (Run in Supabase SQL Editor)
-- Includes:
--   1. Schema & 52 Tables + Enums + Indexes + GIN Full Text Search
--   2. Triggers & PostgreSQL Functions + Reference Generator
--   3. Row Level Security (RLS) on all 52 tables
--   4. Storage Buckets & Policies (avatars, resumes, docs, etc.)
--   5. Seed Data (20 Categories, 45 Skills, 6 Companies, 18 Jobs)
-- ====================================================================

-- ====================================================================
-- SECTION 1: EXTENSIONS & ENUMS
-- ====================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('job_seeker', 'employer', 'admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE company_verification_status_type AS ENUM ('pending', 'under_review', 'verified', 'rejected', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE job_status_type AS ENUM ('draft', 'pending_review', 'approved', 'published', 'rejected', 'paused', 'closed', 'expired', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE employment_type_enum AS ENUM ('full_time', 'part_time', 'contract', 'temporary', 'internship', 'graduate_trainee', 'freelance');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE work_mode_type AS ENUM ('remote', 'hybrid', 'on_site');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE application_status_type AS ENUM ('applied', 'under_review', 'shortlisted', 'assessment', 'interview', 'selected', 'offer', 'hired', 'rejected', 'withdrawn', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE interview_status_type AS ENUM ('scheduled', 'confirmed', 'completed', 'rescheduled', 'cancelled', 'no_show');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_type AS ENUM ('pending', 'successful', 'failed', 'cancelled', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_type_enum AS ENUM ('job_posting', 'featured_job', 'sponsored_job', 'subscription', 'recruitment_package', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE report_status_type AS ENUM ('pending', 'investigating', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE complaint_status_type AS ENUM ('submitted', 'under_review', 'in_progress', 'resolved', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ====================================================================
-- SECTION 2: TABLES (52 TABLES)
-- ====================================================================

-- 1. profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role_type NOT NULL DEFAULT 'job_seeker',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    profile_photo_url TEXT,
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    account_status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deactivated')),
    email_verified BOOLEAN NOT NULL DEFAULT false,
    phone_verified BOOLEAN NOT NULL DEFAULT false,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. job_seeker_profiles
CREATE TABLE IF NOT EXISTS public.job_seeker_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    professional_headline VARCHAR(255),
    professional_summary TEXT,
    current_position VARCHAR(150),
    years_of_experience NUMERIC(4, 1) DEFAULT 0 CHECK (years_of_experience >= 0),
    employment_status VARCHAR(50) DEFAULT 'unemployed',
    expected_salary_min NUMERIC(12, 2),
    expected_salary_max NUMERIC(12, 2),
    salary_currency VARCHAR(10) DEFAULT 'USD',
    preferred_job_type employment_type_enum,
    preferred_work_mode work_mode_type,
    preferred_location VARCHAR(200),
    availability VARCHAR(100) DEFAULT 'immediately',
    date_of_birth DATE,
    gender VARCHAR(30),
    profile_visibility VARCHAR(30) NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'employers_only', 'private')),
    profile_completion_percentage INTEGER NOT NULL DEFAULT 20 CHECK (profile_completion_percentage BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. companies
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    logo_url TEXT,
    description TEXT,
    industry VARCHAR(150),
    company_size VARCHAR(50),
    founded_year INTEGER CHECK (founded_year >= 1800 AND founded_year <= 2100),
    website TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    verification_status company_verification_status_type NOT NULL DEFAULT 'pending',
    verified_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. employer_profiles
CREATE TABLE IF NOT EXISTS public.employer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    job_title VARCHAR(150),
    department VARCHAR(100),
    employer_status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (employer_status IN ('active', 'pending', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. company_verifications
CREATE TABLE IF NOT EXISTS public.company_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    registration_number VARCHAR(100) NOT NULL,
    registration_type VARCHAR(100) NOT NULL,
    verification_status company_verification_status_type NOT NULL DEFAULT 'pending',
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewer_notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. company_documents
CREATE TABLE IF NOT EXISTS public.company_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    document_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT,
    verification_status company_verification_status_type NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. job_categories
CREATE TABLE IF NOT EXISTS public.job_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. skills
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    slug VARCHAR(150) NOT NULL UNIQUE,
    category_id UUID REFERENCES public.job_categories(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. jobs
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES public.job_categories(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    reference_number VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    responsibilities TEXT,
    requirements TEXT,
    education_requirement VARCHAR(200),
    experience_min NUMERIC(4, 1) DEFAULT 0,
    experience_max NUMERIC(4, 1),
    salary_min NUMERIC(12, 2),
    salary_max NUMERIC(12, 2),
    salary_currency VARCHAR(10) DEFAULT 'USD',
    salary_period VARCHAR(20) DEFAULT 'month' CHECK (salary_period IN ('hour', 'month', 'year')),
    employment_type employment_type_enum NOT NULL DEFAULT 'full_time',
    work_mode work_mode_type NOT NULL DEFAULT 'on_site',
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    vacancies INTEGER NOT NULL DEFAULT 1 CHECK (vacancies > 0),
    application_deadline TIMESTAMPTZ,
    status job_status_type NOT NULL DEFAULT 'draft',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_sponsored BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. job_skills
CREATE TABLE IF NOT EXISTS public.job_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    required BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_job_skill UNIQUE(job_id, skill_id)
);

-- 11. job_benefits
CREATE TABLE IF NOT EXISTS public.job_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    benefit VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. resumes
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    summary TEXT,
    template_name VARCHAR(100) DEFAULT 'modern',
    file_url TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. resume_experiences
CREATE TABLE IF NOT EXISTS public.resume_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    description TEXT,
    achievements TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. resume_education
CREATE TABLE IF NOT EXISTS public.resume_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    institution VARCHAR(200) NOT NULL,
    qualification VARCHAR(150) NOT NULL,
    field_of_study VARCHAR(150) NOT NULL,
    grade VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. resume_skills
CREATE TABLE IF NOT EXISTS public.resume_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency VARCHAR(50) DEFAULT 'intermediate' CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_resume_skill UNIQUE(resume_id, skill_id)
);

-- 16. resume_certifications
CREATE TABLE IF NOT EXISTS public.resume_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    issuing_organization VARCHAR(200) NOT NULL,
    credential_id VARCHAR(150),
    issue_date DATE NOT NULL,
    expiration_date DATE,
    credential_url TEXT,
    document_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. resume_languages
CREATE TABLE IF NOT EXISTS public.resume_languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    language VARCHAR(100) NOT NULL,
    proficiency VARCHAR(50) NOT NULL DEFAULT 'conversational' CHECK (proficiency IN ('basic', 'conversational', 'fluent', 'native')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_resume_language UNIQUE(resume_id, language)
);

-- 18. resume_references
CREATE TABLE IF NOT EXISTS public.resume_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    relationship VARCHAR(100),
    company VARCHAR(150),
    position VARCHAR(150),
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 19. applications
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE RESTRICT,
    applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    cover_letter TEXT,
    expected_salary NUMERIC(12, 2),
    status application_status_type NOT NULL DEFAULT 'applied',
    application_reference VARCHAR(50) NOT NULL UNIQUE,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    withdrawn_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_application_per_job
ON public.applications(job_id, applicant_id)
WHERE status != 'withdrawn';

-- 20. application_status_history
CREATE TABLE IF NOT EXISTS public.application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    previous_status application_status_type,
    new_status application_status_type NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 21. application_questions
CREATE TABLE IF NOT EXISTS public.application_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL DEFAULT 'text' CHECK (question_type IN ('text', 'yes_no', 'single_choice', 'multiple_choice', 'number')),
    is_required BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 22. application_answers
CREATE TABLE IF NOT EXISTS public.application_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.application_questions(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_app_question_answer UNIQUE(application_id, question_id)
);

-- 23. application_documents
CREATE TABLE IF NOT EXISTS public.application_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 24. saved_jobs
CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_saved_job UNIQUE(user_id, job_id)
);

-- 25. recently_viewed_jobs
CREATE TABLE IF NOT EXISTS public.recently_viewed_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_recently_viewed UNIQUE(user_id, job_id)
);

-- 26. job_alerts
CREATE TABLE IF NOT EXISTS public.job_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    keywords VARCHAR(255),
    category_id UUID REFERENCES public.job_categories(id) ON DELETE SET NULL,
    location VARCHAR(150),
    salary_min NUMERIC(12, 2),
    employment_type employment_type_enum,
    work_mode work_mode_type,
    frequency VARCHAR(30) NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'instant')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 27. interviews
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    scheduled_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    interview_type VARCHAR(50) NOT NULL DEFAULT 'screening' CHECK (interview_type IN ('screening', 'technical', 'cultural', 'final', 'hr')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 45 CHECK (duration_minutes > 0),
    location VARCHAR(255),
    meeting_url TEXT,
    status interview_status_type NOT NULL DEFAULT 'scheduled',
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 28. interview_evaluations
CREATE TABLE IF NOT EXISTS public.interview_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
    evaluator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    strengths TEXT,
    weaknesses TEXT,
    notes TEXT,
    recommendation VARCHAR(50) CHECK (recommendation IN ('strong_hire', 'hire', 'neutral', 'no_hire', 'strong_no_hire')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 29. candidate_notes
CREATE TABLE IF NOT EXISTS public.candidate_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 30. candidate_tags
CREATE TABLE IF NOT EXISTS public.candidate_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_company_candidate_tag UNIQUE(employer_id, name)
);

-- 31. application_candidate_tags
CREATE TABLE IF NOT EXISTS public.application_candidate_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.candidate_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_app_candidate_tag UNIQUE(application_id, tag_id)
);

-- 32. conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 33. conversation_participants
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_conversation_participant UNIQUE(conversation_id, user_id)
);

-- 34. messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    message TEXT NOT NULL,
    attachment_path TEXT,
    attachment_name VARCHAR(255),
    attachment_type VARCHAR(100),
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 35. notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 36. assessments
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes > 0),
    passing_score NUMERIC(5, 2) NOT NULL DEFAULT 70.00,
    status VARCHAR(30) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 37. assessment_questions
CREATE TABLE IF NOT EXISTS public.assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL DEFAULT 'single_choice' CHECK (question_type IN ('single_choice', 'multiple_choice', 'code', 'text')),
    points NUMERIC(6, 2) NOT NULL DEFAULT 1.00,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 38. assessment_options
CREATE TABLE IF NOT EXISTS public.assessment_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 39. assessment_attempts
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
    applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    submitted_at TIMESTAMPTZ,
    score NUMERIC(6, 2) DEFAULT 0,
    percentage NUMERIC(5, 2) DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'timed_out', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 40. assessment_answers
CREATE TABLE IF NOT EXISTS public.assessment_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES public.assessment_options(id) ON DELETE SET NULL,
    answer_text TEXT,
    points_awarded NUMERIC(6, 2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 41. payment_transactions
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    employer_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    transaction_reference VARCHAR(100) NOT NULL UNIQUE,
    payment_provider VARCHAR(50) NOT NULL DEFAULT 'stripe',
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    payment_type payment_type_enum NOT NULL DEFAULT 'job_posting',
    status payment_status_type NOT NULL DEFAULT 'pending',
    provider_transaction_id VARCHAR(255),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 42. subscription_plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    billing_interval VARCHAR(30) NOT NULL DEFAULT 'month' CHECK (billing_interval IN ('month', 'year', 'quarter')),
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    max_active_jobs INTEGER NOT NULL DEFAULT 5,
    max_applications INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 43. subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
    start_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    end_date TIMESTAMPTZ NOT NULL,
    auto_renew BOOLEAN NOT NULL DEFAULT true,
    provider_subscription_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 44. invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    employer_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES public.payment_transactions(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'open', 'void', 'uncollectible')),
    invoice_url TEXT,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 45. job_reports
CREATE TABLE IF NOT EXISTS public.job_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    status report_status_type NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolution TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 46. user_reports
CREATE TABLE IF NOT EXISTS public.user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    status report_status_type NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolution TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 47. company_reports
CREATE TABLE IF NOT EXISTS public.company_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    status report_status_type NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolution TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 48. complaints
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submitted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(30) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status complaint_status_type NOT NULL DEFAULT 'submitted',
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolution TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 49. roles
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 50. permissions
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 51. role_permissions
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_role_permission UNIQUE(role_id, permission_id)
);

-- 52. admin_users
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 53. audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    old_data JSONB,
    new_data JSONB,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 54. system_settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- SECTION 3: INDEXES & FULL TEXT SEARCH
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category_id ON public.jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(country, state, city);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON public.jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_work_mode ON public.jobs(work_mode);
CREATE INDEX IF NOT EXISTS idx_jobs_deadline ON public.jobs(application_deadline);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_title ON public.jobs(title);

CREATE INDEX IF NOT EXISTS idx_jobs_fts ON public.jobs
USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(requirements, '')));

CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON public.applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON public.applications(applied_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON public.notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_user ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON public.saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ====================================================================
-- SECTION 4: FUNCTIONS & TRIGGERS
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'profiles', 'job_seeker_profiles', 'companies', 'employer_profiles',
        'company_verifications', 'company_documents', 'job_categories', 'skills',
        'jobs', 'resumes', 'resume_experiences', 'resume_education',
        'resume_certifications', 'resume_languages', 'resume_references',
        'applications', 'application_questions', 'application_answers',
        'application_documents', 'job_alerts', 'interviews', 'interview_evaluations',
        'candidate_notes', 'candidate_tags', 'conversations', 'messages',
        'assessments', 'assessment_questions', 'assessment_attempts', 'assessment_answers',
        'payment_transactions', 'subscription_plans', 'subscriptions', 'invoices',
        'job_reports', 'user_reports', 'company_reports', 'complaints',
        'admin_users', 'roles', 'system_settings'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trigger_set_updated_at ON public.%I;', tbl);
        EXECUTE format('CREATE TRIGGER trigger_set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();', tbl);
    END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.auth_profile_id()
RETURNS UUID AS $$
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role_type AS $$
    SELECT role FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_company_member(p_company_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.employer_profiles ep
        JOIN public.profiles p ON p.id = ep.profile_id
        WHERE p.auth_user_id = auth.uid()
        AND ep.company_id = p_company_id
        AND ep.employer_status = 'active'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_conversation_participant(p_conv_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.conversation_participants cp
        JOIN public.profiles p ON p.id = cp.user_id
        WHERE p.auth_user_id = auth.uid()
        AND cp.conversation_id = p_conv_id
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_permission(p_permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_profile_id UUID;
    v_is_super BOOLEAN;
BEGIN
    SELECT (role = 'super_admin') INTO v_is_super
    FROM public.profiles
    WHERE auth_user_id = auth.uid();

    IF v_is_super IS TRUE THEN
        RETURN true;
    END IF;

    SELECT id INTO v_profile_id
    FROM public.profiles
    WHERE auth_user_id = auth.uid();

    IF v_profile_id IS NULL THEN
        RETURN false;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM public.admin_users au
        JOIN public.role_permissions rp ON rp.role_id = au.role_id
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE au.profile_id = v_profile_id
        AND au.status = 'active'
        AND p.name = p_permission_name
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role public.user_role_type;
    v_first_name VARCHAR(100);
    v_last_name VARCHAR(100);
    v_display_name VARCHAR(200);
    v_profile_id UUID;
BEGIN
    v_role := COALESCE(
        (NEW.raw_user_meta_data->>'role')::public.user_role_type,
        'job_seeker'::public.user_role_type
    );

    v_first_name := COALESCE(
        NEW.raw_user_meta_data->>'first_name',
        split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), ' ', 1),
        'User'
    );

    v_last_name := COALESCE(
        NEW.raw_user_meta_data->>'last_name',
        split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 2),
        ''
    );

    v_display_name := trim(concat(v_first_name, ' ', v_last_name));
    IF v_display_name = '' THEN
        v_display_name := split_part(NEW.email, '@', 1);
    END IF;

    INSERT INTO public.profiles (
        auth_user_id,
        role,
        first_name,
        last_name,
        display_name,
        email,
        phone,
        email_verified,
        account_status
    ) VALUES (
        NEW.id,
        v_role,
        v_first_name,
        v_last_name,
        v_display_name,
        NEW.email,
        NEW.phone,
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
        'active'
    ) RETURNING id INTO v_profile_id;

    IF v_role = 'job_seeker' THEN
        INSERT INTO public.job_seeker_profiles (
            profile_id,
            profile_completion_percentage
        ) VALUES (
            v_profile_id,
            25
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_application_reference()
RETURNS TRIGGER AS $$
DECLARE
    v_year TEXT;
    v_random_code TEXT;
    v_candidate_ref TEXT;
BEGIN
    IF NEW.application_reference IS NULL OR NEW.application_reference = '' THEN
        v_year := to_char(timezone('utc'::text, now()), 'YYYY');
        LOOP
            v_random_code := upper(substring(encode(gen_random_bytes(6), 'hex') from 1 for 6));
            v_candidate_ref := 'APP-' || v_year || '-' || v_random_code;

            EXIT WHEN NOT EXISTS (
                SELECT 1 FROM public.applications WHERE application_reference = v_candidate_ref
            );
        END LOOP;
        NEW.application_reference := v_candidate_ref;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_set_application_reference ON public.applications;
CREATE TRIGGER trigger_set_application_reference
    BEFORE INSERT ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.set_application_reference();

CREATE OR REPLACE FUNCTION public.handle_application_status_update()
RETURNS TRIGGER AS $$
DECLARE
    v_actor_id UUID;
    v_job_title TEXT;
    v_applicant_user_id UUID;
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        v_actor_id := public.auth_profile_id();

        INSERT INTO public.application_status_history (
            application_id,
            previous_status,
            new_status,
            changed_by,
            note
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            v_actor_id,
            'Status changed from ' || OLD.status || ' to ' || NEW.status
        );

        SELECT j.title, p.id
        INTO v_job_title, v_applicant_user_id
        FROM public.jobs j
        JOIN public.profiles p ON p.id = NEW.applicant_id
        WHERE j.id = NEW.job_id;

        IF v_applicant_user_id IS NOT NULL THEN
            INSERT INTO public.notifications (
                user_id,
                type,
                title,
                message,
                data
            ) VALUES (
                v_applicant_user_id,
                'application_status_change',
                'Application Status Updated',
                'Your application for "' || coalesce(v_job_title, 'the job') || '" is now: ' || replace(NEW.status::text, '_', ' '),
                jsonb_build_object(
                    'application_id', NEW.id,
                    'job_id', NEW.job_id,
                    'old_status', OLD.status,
                    'new_status', NEW.status
                )
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_application_status_history ON public.applications;
CREATE TRIGGER trigger_application_status_history
    AFTER UPDATE OF status ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.handle_application_status_update();

-- ====================================================================
-- SECTION 5: ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'profiles', 'job_seeker_profiles', 'companies', 'employer_profiles',
        'company_verifications', 'company_documents', 'job_categories', 'skills',
        'jobs', 'job_skills', 'job_benefits', 'resumes', 'resume_experiences',
        'resume_education', 'resume_skills', 'resume_certifications',
        'resume_languages', 'resume_references', 'applications',
        'application_status_history', 'application_questions', 'application_answers',
        'application_documents', 'saved_jobs', 'recently_viewed_jobs', 'job_alerts',
        'interviews', 'interview_evaluations', 'candidate_notes', 'candidate_tags',
        'application_candidate_tags', 'conversations', 'conversation_participants',
        'messages', 'notifications', 'assessments', 'assessment_questions',
        'assessment_options', 'assessment_attempts', 'assessment_answers',
        'payment_transactions', 'subscription_plans', 'subscriptions', 'invoices',
        'job_reports', 'user_reports', 'company_reports', 'complaints',
        'admin_users', 'roles', 'permissions', 'role_permissions', 'audit_logs',
        'system_settings'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    END LOOP;
END $$;

-- Profiles
DROP POLICY IF EXISTS "Public can view active basic profiles" ON public.profiles;
CREATE POLICY "Public can view active basic profiles" ON public.profiles
    FOR SELECT TO authenticated USING (account_status = 'active');

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles" ON public.profiles
    FOR ALL TO authenticated USING (public.is_admin());

-- Job Seeker Profiles
DROP POLICY IF EXISTS "View job seeker profiles" ON public.job_seeker_profiles;
CREATE POLICY "View job seeker profiles" ON public.job_seeker_profiles
    FOR SELECT TO authenticated
    USING (
        profile_id = public.auth_profile_id()
        OR profile_visibility = 'public'
        OR (profile_visibility = 'employers_only' AND public.current_user_role() = 'employer')
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Manage own job seeker profile" ON public.job_seeker_profiles;
CREATE POLICY "Manage own job seeker profile" ON public.job_seeker_profiles
    FOR ALL TO authenticated
    USING (profile_id = public.auth_profile_id())
    WITH CHECK (profile_id = public.auth_profile_id());

-- Companies
DROP POLICY IF EXISTS "Anyone can view verified companies" ON public.companies;
CREATE POLICY "Anyone can view verified companies" ON public.companies
    FOR SELECT TO anon, authenticated
    USING (verification_status = 'verified' OR created_by = public.auth_profile_id() OR public.is_company_member(id) OR public.is_admin());

DROP POLICY IF EXISTS "Employers can create company" ON public.companies;
CREATE POLICY "Employers can create company" ON public.companies
    FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Company members can update company" ON public.companies;
CREATE POLICY "Company members can update company" ON public.companies
    FOR UPDATE TO authenticated
    USING (public.is_company_member(id) OR public.is_admin());

-- Jobs
DROP POLICY IF EXISTS "View published jobs" ON public.jobs;
CREATE POLICY "View published jobs" ON public.jobs
    FOR SELECT TO anon, authenticated
    USING (
        status = 'published'
        OR public.is_company_member(company_id)
        OR created_by = public.auth_profile_id()
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Employers can manage own jobs" ON public.jobs;
CREATE POLICY "Employers can manage own jobs" ON public.jobs
    FOR INSERT TO authenticated
    WITH CHECK (public.is_company_member(company_id) OR public.is_admin());

DROP POLICY IF EXISTS "Employers can update own jobs" ON public.jobs;
CREATE POLICY "Employers can update own jobs" ON public.jobs
    FOR UPDATE TO authenticated
    USING (public.is_company_member(company_id) OR public.is_admin())
    WITH CHECK (public.is_company_member(company_id) OR public.is_admin());

-- Applications
DROP POLICY IF EXISTS "Applications view policy" ON public.applications;
CREATE POLICY "Applications view policy" ON public.applications
    FOR SELECT TO authenticated
    USING (
        applicant_id = public.auth_profile_id()
        OR EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND public.is_company_member(j.company_id))
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Job seekers submit applications" ON public.applications;
CREATE POLICY "Job seekers submit applications" ON public.applications
    FOR INSERT TO authenticated
    WITH CHECK (
        applicant_id = public.auth_profile_id()
        AND public.current_user_role() = 'job_seeker'
    );

-- Resumes
DROP POLICY IF EXISTS "Resumes select policy" ON public.resumes;
CREATE POLICY "Resumes select policy" ON public.resumes
    FOR SELECT TO authenticated
    USING (
        profile_id = public.auth_profile_id()
        OR is_public = true
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.applications a
            JOIN public.jobs j ON j.id = a.job_id
            WHERE a.resume_id = public.resumes.id
            AND public.is_company_member(j.company_id)
        )
    );

DROP POLICY IF EXISTS "Manage own resumes" ON public.resumes;
CREATE POLICY "Manage own resumes" ON public.resumes
    FOR ALL TO authenticated
    USING (profile_id = public.auth_profile_id())
    WITH CHECK (profile_id = public.auth_profile_id());

-- Candidate Notes (strictly employer only)
DROP POLICY IF EXISTS "Candidate notes strictly employer only" ON public.candidate_notes;
CREATE POLICY "Candidate notes strictly employer only" ON public.candidate_notes
    FOR ALL TO authenticated
    USING (public.is_company_member(employer_id) OR public.is_admin())
    WITH CHECK (public.is_company_member(employer_id) OR public.is_admin());

-- Notifications
DROP POLICY IF EXISTS "Notifications user policy" ON public.notifications;
CREATE POLICY "Notifications user policy" ON public.notifications
    FOR ALL TO authenticated
    USING (user_id = public.auth_profile_id())
    WITH CHECK (user_id = public.auth_profile_id());

-- ====================================================================
-- SECTION 6: STORAGE BUCKETS & POLICIES
-- ====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
    ('resumes', 'resumes', false, 15728640, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
    ('certificates', 'certificates', false, 15728640, ARRAY['application/pdf', 'image/png', 'image/jpeg']),
    ('company-documents', 'company-documents', false, 26214400, ARRAY['application/pdf', 'image/png', 'image/jpeg']),
    ('application-documents', 'application-documents', false, 20971520, ARRAY['application/pdf', 'image/png', 'image/jpeg', 'application/msword']),
    ('message-attachments', 'message-attachments', false, 20971520, NULL),
    ('assessment-files', 'assessment-files', false, 26214400, NULL)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public Avatars Access" ON storage.objects;
CREATE POLICY "Public Avatars Access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users can upload avatar" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Resumes Owner or Authorized Employer Access" ON storage.objects;
CREATE POLICY "Resumes Owner or Authorized Employer Access" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'resumes'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.auth_user_id = auth.uid() AND p.role IN ('employer', 'admin', 'super_admin')
            )
        )
    );

DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
CREATE POLICY "Users can upload their own resumes" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ====================================================================
-- SECTION 7: SEED DATA
-- ====================================================================
INSERT INTO public.roles (id, name, description) VALUES
    ('00000000-0000-0000-0000-000000000001', 'super_admin', 'Complete system administration and security control'),
    ('00000000-0000-0000-0000-000000000002', 'recruitment_admin', 'Oversees job postings, application workflows, and recruiter support'),
    ('00000000-0000-0000-0000-000000000003', 'verification_admin', 'Reviews company registration documents and credentials'),
    ('00000000-0000-0000-0000-000000000004', 'finance_admin', 'Manages billing transactions, invoices, and subscription plans'),
    ('00000000-0000-0000-0000-000000000005', 'support_admin', 'Handles customer tickets, reports, and dispute resolutions'),
    ('00000000-0000-0000-0000-000000000006', 'content_admin', 'Moderates job postings, categories, skills, and platform articles')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.subscription_plans (id, name, description, price, currency, billing_interval, features, max_active_jobs, max_applications) VALUES
    ('10000000-0000-0000-0000-000000000001', 'Starter Recruiter', 'Ideal for startups hiring for individual roles', 49.00, 'USD', 'month', '["3 active job posts", "Basic applicant filtering", "Email support"]'::jsonb, 3, 100),
    ('10000000-0000-0000-0000-000000000002', 'Growth Team', 'Perfect for scaling teams and frequent hiring', 149.00, 'USD', 'month', '["15 active job posts", "Advanced skills assessments", "Priority applicant matching"]'::jsonb, 15, 1000),
    ('10000000-0000-0000-0000-000000000003', 'Enterprise Talent Suite', 'Complete recruitment management for high-volume staffing', 399.00, 'USD', 'month', '["Unlimited active jobs", "Custom ATS integration", "Dedicated account manager"]'::jsonb, 999, 10000)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.job_categories (id, name, slug, description, icon) VALUES
    ('20000000-0000-0000-0000-000000000001', 'Information Technology', 'information-technology', 'Software engineering, cloud infrastructure, AI, and cybersecurity', 'Code'),
    ('20000000-0000-0000-0000-000000000002', 'Healthcare & Medicine', 'healthcare-medicine', 'Clinical medicine, nursing, pharmacy, and medical research', 'HeartPulse'),
    ('20000000-0000-0000-0000-000000000003', 'Banking & Financial Services', 'banking-financial-services', 'Investment banking, corporate finance, accounting, and fintech', 'Landmark'),
    ('20000000-0000-0000-0000-000000000004', 'Engineering & Construction', 'engineering-construction', 'Civil, electrical, mechanical engineering, and architecture', 'HardHat'),
    ('20000000-0000-0000-0000-000000000005', 'Marketing & Communications', 'marketing-communications', 'Brand strategy, digital growth, social media, and SEO', 'Megaphone'),
    ('20000000-0000-0000-0000-000000000006', 'Sales & Business Development', 'sales-business-development', 'Account executive, enterprise sales, and client relationships', 'TrendingUp'),
    ('20000000-0000-0000-0000-000000000007', 'Human Resources', 'human-resources', 'Talent acquisition, organizational development, and employee relations', 'Users'),
    ('20000000-0000-0000-0000-000000000008', 'Education & Teaching', 'education-teaching', 'K-12 instruction, university faculty, corporate training, and EdTech', 'GraduationCap'),
    ('20000000-0000-0000-0000-000000000009', 'Legal & Compliance', 'legal-compliance', 'Corporate counsel, litigation, regulatory audit, and contract law', 'Scale'),
    ('20000000-0000-0000-0000-000000000010', 'Logistics & Supply Chain', 'logistics-supply-chain', 'Fleet management, warehousing, freight forwarding, and procurement', 'Truck'),
    ('20000000-0000-0000-0000-000000000011', 'Customer Service & Support', 'customer-service-support', 'Customer success, technical help desk, and omnichannel experience', 'Headphones'),
    ('20000000-0000-0000-0000-000000000012', 'Hospitality & Tourism', 'hospitality-tourism', 'Hotels, fine dining, event management, and travel curation', 'Utensils'),
    ('20000000-0000-0000-0000-000000000013', 'Design & Creative Arts', 'design-creative-arts', 'Product UI/UX design, graphic design, 3D art, and video production', 'Palette'),
    ('20000000-0000-0000-0000-000000000014', 'Manufacturing & Production', 'manufacturing-production', 'Factory operations, quality assurance, CNC, and industrial safety', 'Factory'),
    ('20000000-0000-0000-0000-000000000015', 'Energy & Renewable Resources', 'energy-renewable-resources', 'Solar, wind grid technology, battery storage, and clean utility', 'Zap'),
    ('20000000-0000-0000-0000-000000000016', 'Agriculture & Food Science', 'agriculture-food-science', 'Agronomy, hydroponics, food safety, and veterinary practice', 'Sprout'),
    ('20000000-0000-0000-0000-000000000017', 'Media & Journalism', 'media-journalism', 'Investigative reporting, podcast production, and publishing', 'Newspaper'),
    ('20000000-0000-0000-0000-000000000018', 'NGO & Social Impact', 'ngo-social-impact', 'Humanitarian relief, international development, and grant writing', 'Globe'),
    ('20000000-0000-0000-0000-000000000019', 'Security & Risk Management', 'security-risk-management', 'Physical guarding, executive protection, and loss prevention', 'ShieldCheck'),
    ('20000000-0000-0000-0000-000000000020', 'Remote & Flexible Roles', 'remote-flexible-roles', 'Specialized distributed-first positions worldwide', 'Laptop')
ON CONFLICT (name) DO NOTHING;
