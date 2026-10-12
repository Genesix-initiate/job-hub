-- ====================================================================
-- TalentForge: Recruitment & Application Platform Database Foundation
-- Migration 002: PostgreSQL Functions & Triggers
-- ====================================================================

-- 1. Generic updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply updated_at triggers across all tables with updated_at column
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

-- 2. Helper Security Functions for Row Level Security (RLS)
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
    -- Super admin has all permissions unconditionally
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

-- 3. Automatic Profile Creation on Supabase Auth Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role public.user_role_type;
    v_first_name VARCHAR(100);
    v_last_name VARCHAR(100);
    v_display_name VARCHAR(200);
    v_profile_id UUID;
BEGIN
    -- Extract role from metadata or default to job_seeker
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

    -- Insert into public.profiles
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

    -- If registered as job_seeker, initialize default job_seeker_profiles record
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

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Generate Unique Application Reference (e.g., APP-2026-X8Y7Z2)
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
            -- Generate a 6-character uppercase alphanumeric code
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

-- 5. Automatically Record Application Status History & Notifications
CREATE OR REPLACE FUNCTION public.handle_application_status_update()
RETURNS TRIGGER AS $$
DECLARE
    v_actor_id UUID;
    v_job_title TEXT;
    v_applicant_user_id UUID;
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        v_actor_id := public.auth_profile_id();

        -- Record in application_status_history
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

        -- Fetch job title & applicant details for notification
        SELECT j.title, p.id
        INTO v_job_title, v_applicant_user_id
        FROM public.jobs j
        JOIN public.profiles p ON p.id = NEW.applicant_id
        WHERE j.id = NEW.job_id;

        -- Create notification for applicant
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

-- 6. Recalculate Job Seeker Profile Completion Percentage
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(p_profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_score INTEGER := 20; -- Base score for registration
    v_has_headline BOOLEAN;
    v_has_summary BOOLEAN;
    v_has_experience BOOLEAN;
    v_has_education BOOLEAN;
    v_has_skills BOOLEAN;
    v_has_resume BOOLEAN;
BEGIN
    SELECT
        (professional_headline IS NOT NULL AND professional_headline <> ''),
        (professional_summary IS NOT NULL AND professional_summary <> '')
    INTO v_has_headline, v_has_summary
    FROM public.job_seeker_profiles
    WHERE profile_id = p_profile_id;

    IF v_has_headline THEN v_score := v_score + 15; END IF;
    IF v_has_summary THEN v_score := v_score + 15; END IF;

    -- Check experiences
    SELECT EXISTS (
        SELECT 1 FROM public.resume_experiences re
        JOIN public.resumes r ON r.id = re.resume_id
        WHERE r.profile_id = p_profile_id
    ) INTO v_has_experience;
    IF v_has_experience THEN v_score := v_score + 15; END IF;

    -- Check education
    SELECT EXISTS (
        SELECT 1 FROM public.resume_education re
        JOIN public.resumes r ON r.id = re.resume_id
        WHERE r.profile_id = p_profile_id
    ) INTO v_has_education;
    IF v_has_education THEN v_score := v_score + 15; END IF;

    -- Check skills
    SELECT EXISTS (
        SELECT 1 FROM public.resume_skills rs
        JOIN public.resumes r ON r.id = rs.resume_id
        WHERE r.profile_id = p_profile_id
    ) INTO v_has_skills;
    IF v_has_skills THEN v_score := v_score + 10; END IF;

    -- Check uploaded CV
    SELECT EXISTS (
        SELECT 1 FROM public.resumes WHERE profile_id = p_profile_id
    ) INTO v_has_resume;
    IF v_has_resume THEN v_score := v_score + 10; END IF;

    IF v_score > 100 THEN v_score := 100; END IF;

    UPDATE public.job_seeker_profiles
    SET profile_completion_percentage = v_score
    WHERE profile_id = p_profile_id;

    RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
