-- ====================================================================
-- TalentForge: Recruitment & Application Platform Database Foundation
-- Migration 003: Row Level Security (RLS) Policies
-- ====================================================================

-- 1. Enable RLS on all tables
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

-- ====================================================================
-- POLICIES: PROFILES & JOB SEEKER PROFILES
-- ====================================================================
-- Profiles: Any authenticated user can view public display info; only owner or admin can update
DROP POLICY IF EXISTS "Public can view active basic profiles" ON public.profiles;
CREATE POLICY "Public can view active basic profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING (account_status = 'active');

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles" ON public.profiles
    FOR ALL TO authenticated
    USING (public.is_admin());

-- Job Seeker Profiles:
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

-- ====================================================================
-- POLICIES: COMPANIES & EMPLOYER PROFILES
-- ====================================================================
DROP POLICY IF EXISTS "Anyone can view verified companies" ON public.companies;
CREATE POLICY "Anyone can view verified companies" ON public.companies
    FOR SELECT TO anon, authenticated
    USING (verification_status = 'verified' OR created_by = public.auth_profile_id() OR public.is_company_member(id) OR public.is_admin());

DROP POLICY IF EXISTS "Employers can create company" ON public.companies;
CREATE POLICY "Employers can create company" ON public.companies
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Company members can update company" ON public.companies;
CREATE POLICY "Company members can update company" ON public.companies
    FOR UPDATE TO authenticated
    USING (public.is_company_member(id) OR public.is_admin());

-- Employer Profiles:
DROP POLICY IF EXISTS "View employer profiles" ON public.employer_profiles;
CREATE POLICY "View employer profiles" ON public.employer_profiles
    FOR SELECT TO authenticated
    USING (
        profile_id = public.auth_profile_id()
        OR public.is_company_member(company_id)
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Manage own employer profile" ON public.employer_profiles;
CREATE POLICY "Manage own employer profile" ON public.employer_profiles
    FOR ALL TO authenticated
    USING (profile_id = public.auth_profile_id() OR public.is_admin());

-- Company Documents & Verifications:
DROP POLICY IF EXISTS "Company documents view" ON public.company_documents;
CREATE POLICY "Company documents view" ON public.company_documents
    FOR SELECT TO authenticated
    USING (public.is_company_member(company_id) OR public.is_admin());

DROP POLICY IF EXISTS "Company documents manage" ON public.company_documents;
CREATE POLICY "Company documents manage" ON public.company_documents
    FOR ALL TO authenticated
    USING (public.is_company_member(company_id) OR public.is_admin());

DROP POLICY IF EXISTS "Company verifications view" ON public.company_verifications;
CREATE POLICY "Company verifications view" ON public.company_verifications
    FOR SELECT TO authenticated
    USING (public.is_company_member(company_id) OR public.is_admin());

DROP POLICY IF EXISTS "Company verifications submit" ON public.company_verifications;
CREATE POLICY "Company verifications submit" ON public.company_verifications
    FOR INSERT TO authenticated
    WITH CHECK (public.is_company_member(company_id) OR public.is_admin());

-- ====================================================================
-- POLICIES: JOBS, SKILLS & CATEGORIES
-- ====================================================================
-- Categories: Read-only for public, manage for admin
DROP POLICY IF EXISTS "Categories are readable by everyone" ON public.job_categories;
CREATE POLICY "Categories are readable by everyone" ON public.job_categories
    FOR SELECT TO anon, authenticated
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage categories" ON public.job_categories;
CREATE POLICY "Admins can manage categories" ON public.job_categories
    FOR ALL TO authenticated
    USING (public.is_admin());

-- Skills: Read-only for public, manage for admin
DROP POLICY IF EXISTS "Skills are readable by everyone" ON public.skills;
CREATE POLICY "Skills are readable by everyone" ON public.skills
    FOR SELECT TO anon, authenticated
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage skills" ON public.skills;
CREATE POLICY "Admins can manage skills" ON public.skills
    FOR ALL TO authenticated
    USING (public.is_admin());

-- Jobs:
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

DROP POLICY IF EXISTS "Employers can delete own jobs" ON public.jobs;
CREATE POLICY "Employers can delete own jobs" ON public.jobs
    FOR DELETE TO authenticated
    USING (public.is_company_member(company_id) OR public.is_admin());

-- Job skills & benefits:
DROP POLICY IF EXISTS "Job skills read" ON public.job_skills;
CREATE POLICY "Job skills read" ON public.job_skills FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Job skills manage" ON public.job_skills;
CREATE POLICY "Job skills manage" ON public.job_skills FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND (public.is_company_member(j.company_id) OR public.is_admin())));

DROP POLICY IF EXISTS "Job benefits read" ON public.job_benefits;
CREATE POLICY "Job benefits read" ON public.job_benefits FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Job benefits manage" ON public.job_benefits;
CREATE POLICY "Job benefits manage" ON public.job_benefits FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND (public.is_company_member(j.company_id) OR public.is_admin())));

-- ====================================================================
-- POLICIES: RESUMES & SUB-TABLES (CANDIDATE PRIVACY)
-- ====================================================================
DROP POLICY IF EXISTS "Resumes select policy" ON public.resumes;
CREATE POLICY "Resumes select policy" ON public.resumes
    FOR SELECT TO authenticated
    USING (
        profile_id = public.auth_profile_id()
        OR is_public = true
        OR public.is_admin()
        OR EXISTS (
            -- Employer whose job this candidate applied to
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

-- Resume sub-tables (experiences, education, skills, certifications, languages, references)
-- All bound strictly to resume owner or allowed resume viewer
DO $$
DECLARE
    sub_tbl text;
    sub_tables text[] := ARRAY[
        'resume_experiences', 'resume_education', 'resume_skills',
        'resume_certifications', 'resume_languages', 'resume_references'
    ];
BEGIN
    FOREACH sub_tbl IN ARRAY sub_tables LOOP
        EXECUTE format('
            DROP POLICY IF EXISTS "Select %1$s" ON public.%1$I;
            CREATE POLICY "Select %1$s" ON public.%1$I FOR SELECT TO authenticated
            USING (EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = resume_id AND (r.profile_id = public.auth_profile_id() OR r.is_public = true OR public.is_admin())));
            
            DROP POLICY IF EXISTS "Manage %1$s" ON public.%1$I;
            CREATE POLICY "Manage %1$s" ON public.%1$I FOR ALL TO authenticated
            USING (EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = resume_id AND r.profile_id = public.auth_profile_id()))
            WITH CHECK (EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = resume_id AND r.profile_id = public.auth_profile_id()));
        ', sub_tbl);
    END LOOP;
END $$;

-- ====================================================================
-- POLICIES: APPLICATIONS & APPLICATION DATA
-- ====================================================================
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

DROP POLICY IF EXISTS "Update applications" ON public.applications;
CREATE POLICY "Update applications" ON public.applications
    FOR UPDATE TO authenticated
    USING (
        -- Applicant can withdraw
        applicant_id = public.auth_profile_id()
        -- Employer can change hiring status
        OR EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND public.is_company_member(j.company_id))
        OR public.is_admin()
    );

-- Application history & documents:
DROP POLICY IF EXISTS "Application history view" ON public.application_status_history;
CREATE POLICY "Application history view" ON public.application_status_history
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.id = application_id
            AND (a.applicant_id = public.auth_profile_id() OR public.is_admin() OR EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = a.job_id AND public.is_company_member(j.company_id)))
        )
    );

DROP POLICY IF EXISTS "Application documents view" ON public.application_documents;
CREATE POLICY "Application documents view" ON public.application_documents
    FOR SELECT TO authenticated
    USING (
        uploaded_by = public.auth_profile_id()
        OR EXISTS (
            SELECT 1 FROM public.applications a
            JOIN public.jobs j ON j.id = a.job_id
            WHERE a.id = application_id
            AND public.is_company_member(j.company_id)
        )
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Application documents manage" ON public.application_documents;
CREATE POLICY "Application documents manage" ON public.application_documents
    FOR ALL TO authenticated
    USING (uploaded_by = public.auth_profile_id() OR public.is_admin());

-- Application questions & answers:
DROP POLICY IF EXISTS "Application questions view" ON public.application_questions;
CREATE POLICY "Application questions view" ON public.application_questions
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Application questions manage" ON public.application_questions;
CREATE POLICY "Application questions manage" ON public.application_questions
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND (public.is_company_member(j.company_id) OR public.is_admin())));

DROP POLICY IF EXISTS "Application answers view" ON public.application_answers;
CREATE POLICY "Application answers view" ON public.application_answers
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.id = application_id
            AND (a.applicant_id = public.auth_profile_id() OR public.is_admin() OR EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = a.job_id AND public.is_company_member(j.company_id)))
        )
    );

DROP POLICY IF EXISTS "Application answers insert" ON public.application_answers;
CREATE POLICY "Application answers insert" ON public.application_answers
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.id = application_id
            AND a.applicant_id = public.auth_profile_id()
        )
    );

-- ====================================================================
-- POLICIES: SAVED JOBS & ALERTS
-- ====================================================================
DROP POLICY IF EXISTS "Saved jobs user policy" ON public.saved_jobs;
CREATE POLICY "Saved jobs user policy" ON public.saved_jobs
    FOR ALL TO authenticated
    USING (user_id = public.auth_profile_id())
    WITH CHECK (user_id = public.auth_profile_id());

DROP POLICY IF EXISTS "Recently viewed jobs policy" ON public.recently_viewed_jobs;
CREATE POLICY "Recently viewed jobs policy" ON public.recently_viewed_jobs
    FOR ALL TO authenticated
    USING (user_id = public.auth_profile_id())
    WITH CHECK (user_id = public.auth_profile_id());

DROP POLICY IF EXISTS "Job alerts policy" ON public.job_alerts;
CREATE POLICY "Job alerts policy" ON public.job_alerts
    FOR ALL TO authenticated
    USING (user_id = public.auth_profile_id())
    WITH CHECK (user_id = public.auth_profile_id());

-- ====================================================================
-- POLICIES: INTERVIEWS, EVALUATIONS, CANDIDATE NOTES & TAGS
-- ====================================================================
DROP POLICY IF EXISTS "Interviews view policy" ON public.interviews;
CREATE POLICY "Interviews view policy" ON public.interviews
    FOR SELECT TO authenticated
    USING (
        scheduled_by = public.auth_profile_id()
        OR EXISTS (
            SELECT 1 FROM public.applications a
            JOIN public.jobs j ON j.id = a.job_id
            WHERE a.id = application_id
            AND (a.applicant_id = public.auth_profile_id() OR public.is_company_member(j.company_id))
        )
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Interviews manage policy" ON public.interviews;
CREATE POLICY "Interviews manage policy" ON public.interviews
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.applications a
            JOIN public.jobs j ON j.id = a.job_id
            WHERE a.id = application_id
            AND (public.is_company_member(j.company_id) OR scheduled_by = public.auth_profile_id())
        )
        OR public.is_admin()
    );

-- Interview evaluations & candidate notes: CANDIDATES NEVER SEE THESE!
DROP POLICY IF EXISTS "Interview evaluations view" ON public.interview_evaluations;
CREATE POLICY "Interview evaluations view" ON public.interview_evaluations
    FOR SELECT TO authenticated
    USING (
        evaluator_id = public.auth_profile_id()
        OR EXISTS (
            SELECT 1 FROM public.interviews i
            JOIN public.applications a ON a.id = i.application_id
            JOIN public.jobs j ON j.id = a.job_id
            WHERE i.id = interview_id
            AND public.is_company_member(j.company_id)
        )
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Interview evaluations manage" ON public.interview_evaluations;
CREATE POLICY "Interview evaluations manage" ON public.interview_evaluations
    FOR ALL TO authenticated
    USING (evaluator_id = public.auth_profile_id() OR public.is_admin());

DROP POLICY IF EXISTS "Candidate notes strictly employer only" ON public.candidate_notes;
CREATE POLICY "Candidate notes strictly employer only" ON public.candidate_notes
    FOR ALL TO authenticated
    USING (public.is_company_member(employer_id) OR public.is_admin())
    WITH CHECK (public.is_company_member(employer_id) OR public.is_admin());

DROP POLICY IF EXISTS "Candidate tags employer policy" ON public.candidate_tags;
CREATE POLICY "Candidate tags employer policy" ON public.candidate_tags
    FOR ALL TO authenticated
    USING (public.is_company_member(employer_id) OR public.is_admin())
    WITH CHECK (public.is_company_member(employer_id) OR public.is_admin());

DROP POLICY IF EXISTS "Application candidate tags policy" ON public.application_candidate_tags;
CREATE POLICY "Application candidate tags policy" ON public.application_candidate_tags
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.candidate_tags ct WHERE ct.id = tag_id AND (public.is_company_member(ct.employer_id) OR public.is_admin()))
    );

-- ====================================================================
-- POLICIES: CONVERSATIONS & MESSAGES
-- ====================================================================
DROP POLICY IF EXISTS "Conversation view policy" ON public.conversations;
CREATE POLICY "Conversation view policy" ON public.conversations
    FOR SELECT TO authenticated
    USING (public.is_conversation_participant(id) OR public.is_admin());

DROP POLICY IF EXISTS "Conversation participant policy" ON public.conversation_participants;
CREATE POLICY "Conversation participant policy" ON public.conversation_participants
    FOR ALL TO authenticated
    USING (user_id = public.auth_profile_id() OR public.is_conversation_participant(conversation_id) OR public.is_admin());

DROP POLICY IF EXISTS "Messages participant policy" ON public.messages;
CREATE POLICY "Messages participant policy" ON public.messages
    FOR SELECT TO authenticated
    USING (public.is_conversation_participant(conversation_id) OR public.is_admin());

DROP POLICY IF EXISTS "Messages send policy" ON public.messages;
CREATE POLICY "Messages send policy" ON public.messages
    FOR INSERT TO authenticated
    WITH CHECK (
        sender_id = public.auth_profile_id()
        AND public.is_conversation_participant(conversation_id)
    );

-- Notifications:
DROP POLICY IF EXISTS "Notifications user policy" ON public.notifications;
CREATE POLICY "Notifications user policy" ON public.notifications
    FOR ALL TO authenticated
    USING (user_id = public.auth_profile_id())
    WITH CHECK (user_id = public.auth_profile_id());

-- ====================================================================
-- POLICIES: ASSESSMENTS (ANSWER KEY PROTECTION)
-- ====================================================================
DROP POLICY IF EXISTS "Assessments view" ON public.assessments;
CREATE POLICY "Assessments view" ON public.assessments
    FOR SELECT TO authenticated
    USING (status = 'published' OR created_by = public.auth_profile_id() OR public.is_admin());

DROP POLICY IF EXISTS "Assessments manage" ON public.assessments;
CREATE POLICY "Assessments manage" ON public.assessments
    FOR ALL TO authenticated
    USING (created_by = public.auth_profile_id() OR public.is_admin());

DROP POLICY IF EXISTS "Assessment questions view" ON public.assessment_questions;
CREATE POLICY "Assessment questions view" ON public.assessment_questions
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Assessment questions manage" ON public.assessment_questions;
CREATE POLICY "Assessment questions manage" ON public.assessment_questions
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND (a.created_by = public.auth_profile_id() OR public.is_admin())));

-- Assessment Options: Hide is_correct from examinees
DROP POLICY IF EXISTS "Assessment options view" ON public.assessment_options;
CREATE POLICY "Assessment options view" ON public.assessment_options
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Assessment options manage" ON public.assessment_options;
CREATE POLICY "Assessment options manage" ON public.assessment_options
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.assessment_questions q
            JOIN public.assessments a ON a.id = q.assessment_id
            WHERE q.id = question_id
            AND (a.created_by = public.auth_profile_id() OR public.is_admin())
        )
    );

DROP POLICY IF EXISTS "Assessment attempts applicant policy" ON public.assessment_attempts;
CREATE POLICY "Assessment attempts applicant policy" ON public.assessment_attempts
    FOR ALL TO authenticated
    USING (
        applicant_id = public.auth_profile_id()
        OR EXISTS (
            SELECT 1 FROM public.assessments a
            WHERE a.id = assessment_id
            AND (a.created_by = public.auth_profile_id() OR public.is_admin())
        )
    );

DROP POLICY IF EXISTS "Assessment answers policy" ON public.assessment_answers;
CREATE POLICY "Assessment answers policy" ON public.assessment_answers
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.assessment_attempts att
            WHERE att.id = attempt_id
            AND (att.applicant_id = public.auth_profile_id() OR public.is_admin())
        )
    );

-- ====================================================================
-- POLICIES: PAYMENTS, SUBSCRIPTIONS & INVOICES
-- ====================================================================
DROP POLICY IF EXISTS "Payment transactions access" ON public.payment_transactions;
CREATE POLICY "Payment transactions access" ON public.payment_transactions
    FOR ALL TO authenticated
    USING (
        user_id = public.auth_profile_id()
        OR (employer_id IS NOT NULL AND public.is_company_member(employer_id))
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Subscription plans viewable by all" ON public.subscription_plans;
CREATE POLICY "Subscription plans viewable by all" ON public.subscription_plans
    FOR SELECT TO anon, authenticated
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Subscription plans admin manage" ON public.subscription_plans;
CREATE POLICY "Subscription plans admin manage" ON public.subscription_plans
    FOR ALL TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Subscriptions company access" ON public.subscriptions;
CREATE POLICY "Subscriptions company access" ON public.subscriptions
    FOR SELECT TO authenticated
    USING (public.is_company_member(employer_id) OR public.is_admin());

DROP POLICY IF EXISTS "Invoices access" ON public.invoices;
CREATE POLICY "Invoices access" ON public.invoices
    FOR SELECT TO authenticated
    USING (
        user_id = public.auth_profile_id()
        OR (employer_id IS NOT NULL AND public.is_company_member(employer_id))
        OR public.is_admin()
    );

-- ====================================================================
-- POLICIES: REPORTS & COMPLAINTS
-- ====================================================================
DROP POLICY IF EXISTS "Job reports submit" ON public.job_reports;
CREATE POLICY "Job reports submit" ON public.job_reports
    FOR INSERT TO authenticated
    WITH CHECK (reported_by = public.auth_profile_id());

DROP POLICY IF EXISTS "Job reports admin review" ON public.job_reports;
CREATE POLICY "Job reports admin review" ON public.job_reports
    FOR SELECT TO authenticated
    USING (reported_by = public.auth_profile_id() OR public.is_admin());

DROP POLICY IF EXISTS "User reports policy" ON public.user_reports;
CREATE POLICY "User reports policy" ON public.user_reports
    FOR ALL TO authenticated
    USING (reported_by = public.auth_profile_id() OR public.is_admin())
    WITH CHECK (reported_by = public.auth_profile_id());

DROP POLICY IF EXISTS "Company reports policy" ON public.company_reports;
CREATE POLICY "Company reports policy" ON public.company_reports
    FOR ALL TO authenticated
    USING (reported_by = public.auth_profile_id() OR public.is_admin())
    WITH CHECK (reported_by = public.auth_profile_id());

DROP POLICY IF EXISTS "Complaints submit & view" ON public.complaints;
CREATE POLICY "Complaints submit & view" ON public.complaints
    FOR ALL TO authenticated
    USING (submitted_by = public.auth_profile_id() OR public.is_admin())
    WITH CHECK (submitted_by = public.auth_profile_id());

-- ====================================================================
-- POLICIES: ADMIN USERS, ROLES, PERMISSIONS, AUDIT LOGS & SETTINGS
-- ====================================================================
DROP POLICY IF EXISTS "Admin users view" ON public.admin_users;
CREATE POLICY "Admin users view" ON public.admin_users
    FOR SELECT TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admin users manage" ON public.admin_users;
CREATE POLICY "Admin users manage" ON public.admin_users
    FOR ALL TO authenticated
    USING (public.has_permission('manage_admins'));

DROP POLICY IF EXISTS "Roles view" ON public.roles;
CREATE POLICY "Roles view" ON public.roles FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Roles manage" ON public.roles;
CREATE POLICY "Roles manage" ON public.roles FOR ALL TO authenticated USING (public.has_permission('manage_roles'));

DROP POLICY IF EXISTS "Permissions view" ON public.permissions;
CREATE POLICY "Permissions view" ON public.permissions FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Role permissions view" ON public.role_permissions;
CREATE POLICY "Role permissions view" ON public.role_permissions FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Audit logs view strictly admin" ON public.audit_logs;
CREATE POLICY "Audit logs view strictly admin" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (public.has_permission('view_audit_logs'));

DROP POLICY IF EXISTS "System settings view" ON public.system_settings;
CREATE POLICY "System settings view" ON public.system_settings
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "System settings manage" ON public.system_settings;
CREATE POLICY "System settings manage" ON public.system_settings
    FOR ALL TO authenticated
    USING (public.has_permission('manage_system_settings'));
