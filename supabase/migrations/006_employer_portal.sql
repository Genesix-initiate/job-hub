-- ====================================================================
-- TalentForge: Recruitment & Application Platform Database Foundation
-- Migration 006: Employer / Recruiter Portal Enhancements
-- PostgreSQL 15+ / Supabase
-- ====================================================================

-- 1. Add company_role to employer_profiles to distinguish owner, admin, recruiter, hiring manager
ALTER TABLE public.employer_profiles 
ADD COLUMN IF NOT EXISTS company_role VARCHAR(50) DEFAULT 'employer_admin' 
CHECK (company_role IN ('employer_owner', 'employer_admin', 'recruiter', 'hiring_manager'));

-- 2. Add salary_visibility to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS salary_visibility VARCHAR(30) DEFAULT 'visible' 
CHECK (salary_visibility IN ('visible', 'hidden', 'negotiable'));

-- 3. Add is_starred to applications for internal candidate bookmarking
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT false;

-- 4. Create company_invitations table for team member invites
CREATE TABLE IF NOT EXISTS public.company_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(150),
    role VARCHAR(50) NOT NULL DEFAULT 'recruiter' CHECK (role IN ('employer_owner', 'employer_admin', 'recruiter', 'hiring_manager')),
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    token VARCHAR(255) NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + INTERVAL '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on company_invitations
ALTER TABLE public.company_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for company_invitations
DROP POLICY IF EXISTS "Company members can view invitations" ON public.company_invitations;
CREATE POLICY "Company members can view invitations" ON public.company_invitations
    FOR SELECT TO authenticated
    USING (public.is_company_member(company_id) OR public.is_admin());

DROP POLICY IF EXISTS "Company admins can manage invitations" ON public.company_invitations;
CREATE POLICY "Company admins can manage invitations" ON public.company_invitations
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employer_profiles ep
            JOIN public.profiles p ON p.id = ep.profile_id
            WHERE p.auth_user_id = auth.uid()
            AND ep.company_id = company_invitations.company_id
            AND ep.company_role IN ('employer_owner', 'employer_admin')
            AND ep.employer_status = 'active'
        ) OR public.is_admin()
    );

-- Index for invitations
CREATE INDEX IF NOT EXISTS idx_company_invitations_company ON public.company_invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_company_invitations_email ON public.company_invitations(email);

-- Trigger for updated_at on company_invitations
DROP TRIGGER IF EXISTS trigger_set_updated_at ON public.company_invitations;
CREATE TRIGGER trigger_set_updated_at 
BEFORE UPDATE ON public.company_invitations 
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
