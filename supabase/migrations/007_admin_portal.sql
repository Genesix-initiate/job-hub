-- ====================================================================
-- TalentForge: Recruitment & Application Platform Database Foundation
-- Migration 007: Admin / Super Admin Portal Infrastructure
-- PostgreSQL 15+ / Supabase
-- ====================================================================

-- 1. Create career_resources table for Content Management
CREATE TABLE IF NOT EXISTS public.career_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    read_time VARCHAR(50) DEFAULT '5 min read',
    author VARCHAR(150) DEFAULT 'TalentForge Editorial',
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT true,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for career resources
CREATE INDEX IF NOT EXISTS idx_career_resources_slug ON public.career_resources(slug);
CREATE INDEX IF NOT EXISTS idx_career_resources_category ON public.career_resources(category);
CREATE INDEX IF NOT EXISTS idx_career_resources_published ON public.career_resources(is_published);

-- Trigger for career_resources updated_at
DROP TRIGGER IF EXISTS trigger_set_updated_at ON public.career_resources;
CREATE TRIGGER trigger_set_updated_at
BEFORE UPDATE ON public.career_resources
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Create broadcasts table for administrative announcements
CREATE TABLE IF NOT EXISTS public.broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target_audience VARCHAR(50) NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'job_seekers', 'employers', 'admins')),
    priority VARCHAR(30) NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
    status VARCHAR(30) NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    recipient_count INTEGER DEFAULT 0,
    sent_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger for broadcasts updated_at
DROP TRIGGER IF EXISTS trigger_set_updated_at ON public.broadcasts;
CREATE TRIGGER trigger_set_updated_at
BEFORE UPDATE ON public.broadcasts
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Ensure all administrative roles exist in public.roles
INSERT INTO public.roles (name, description) VALUES
    ('super_admin', 'Complete system administration and security control'),
    ('admin', 'General platform administration and oversight'),
    ('recruitment_admin', 'Oversees job postings, application workflows, and recruiter support'),
    ('moderator', 'Job and user moderation, content verification, and flagged reports'),
    ('verification_admin', 'Reviews company registration documents and credentials'),
    ('finance_admin', 'Manages billing transactions, invoices, and subscription plans'),
    ('support', 'Handles customer tickets, reports, and dispute resolutions'),
    ('support_admin', 'Support management and escalation responses'),
    ('content_manager', 'Moderates job postings, categories, skills, and platform articles'),
    ('content_admin', 'Manages career resources, FAQs, and educational materials')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- 4. Ensure additional permissions exist
INSERT INTO public.permissions (name, description) VALUES
    ('view_dashboard', 'Access platform analytics and dashboard KPIs'),
    ('manage_users', 'Suspend, reactivate, or edit platform users'),
    ('view_job_seekers', 'Access candidate profiles and application history'),
    ('manage_employers', 'Manage employer company profiles and credentials'),
    ('view_applications', 'Oversight across all candidates and job applications'),
    ('send_broadcasts', 'Dispatch platform-wide alerts and announcements'),
    ('manage_content', 'Manage categories, skills, and career resources'),
    ('manage_feature_flags', 'Enable or disable operational system feature flags'),
    ('export_data', 'Export authorized datasets into CSV/Excel format')
ON CONFLICT (name) DO NOTHING;

-- Map permissions for super_admin
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Map permissions for admin
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'admin' AND p.name IN (
    'view_dashboard', 'manage_users', 'view_job_seekers', 'manage_employers',
    'verify_companies', 'moderate_jobs', 'manage_categories', 'resolve_complaints',
    'view_applications', 'send_broadcasts', 'manage_content', 'export_data'
)
ON CONFLICT DO NOTHING;

-- Map permissions for moderator
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'moderator' AND p.name IN ('moderate_jobs', 'resolve_complaints')
ON CONFLICT DO NOTHING;

-- Map permissions for support
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'support' AND p.name IN ('resolve_complaints', 'view_job_seekers')
ON CONFLICT DO NOTHING;

-- Map permissions for content_manager
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'content_manager' AND p.name IN ('manage_categories', 'manage_content')
ON CONFLICT DO NOTHING;

-- 5. RLS Policies on new tables
ALTER TABLE public.career_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

-- Career resources: public can read published; admins can manage all
DROP POLICY IF EXISTS "Public can view published career resources" ON public.career_resources;
CREATE POLICY "Public can view published career resources" ON public.career_resources
    FOR SELECT TO public
    USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage career resources" ON public.career_resources;
CREATE POLICY "Admins can manage career resources" ON public.career_resources
    FOR ALL TO authenticated
    USING (public.is_admin() OR public.has_permission('manage_content'));

-- Broadcasts: Admins can manage broadcasts; Authenticated users can view targeted broadcasts
DROP POLICY IF EXISTS "Admins can manage broadcasts" ON public.broadcasts;
CREATE POLICY "Admins can manage broadcasts" ON public.broadcasts
    FOR ALL TO authenticated
    USING (public.is_admin() OR public.has_permission('send_broadcasts'));

DROP POLICY IF EXISTS "Users can view broadcasts targeted to them" ON public.broadcasts;
CREATE POLICY "Users can view broadcasts targeted to them" ON public.broadcasts
    FOR SELECT TO authenticated
    USING (
        status = 'sent' AND (
            target_audience = 'all'
            OR (target_audience = 'job_seekers' AND public.current_user_role() = 'job_seeker')
            OR (target_audience = 'employers' AND public.current_user_role() = 'employer')
            OR (target_audience = 'admins' AND public.is_admin())
        )
    );
