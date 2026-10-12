-- ====================================================================
-- TalentForge: Recruitment & Application Platform Database Foundation
-- Migration 004: Supabase Storage Buckets & Storage RLS Policies
-- ====================================================================

-- 1. Create Buckets
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

-- 2. Storage Policies for Avatars (Public Read, Owner Manage)
DROP POLICY IF EXISTS "Public Avatars Access" ON storage.objects;
CREATE POLICY "Public Avatars Access" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users can upload avatar" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatar" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Storage Policies for Resumes (Private)
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

DROP POLICY IF EXISTS "Users can manage own resumes storage" ON storage.objects;
CREATE POLICY "Users can manage own resumes storage" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 4. Storage Policies for Company Documents
DROP POLICY IF EXISTS "Company documents storage access" ON storage.objects;
CREATE POLICY "Company documents storage access" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'company-documents'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.auth_user_id = auth.uid() AND p.role IN ('admin', 'super_admin')
            )
        )
    );

DROP POLICY IF EXISTS "Employers can upload company documents" ON storage.objects;
CREATE POLICY "Employers can upload company documents" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'company-documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 5. Storage Policies for Application Documents
DROP POLICY IF EXISTS "Application documents storage access" ON storage.objects;
CREATE POLICY "Application documents storage access" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'application-documents'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.auth_user_id = auth.uid() AND p.role IN ('employer', 'admin', 'super_admin')
            )
        )
    );

DROP POLICY IF EXISTS "Applicants can upload application documents" ON storage.objects;
CREATE POLICY "Applicants can upload application documents" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'application-documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 6. Storage Policies for Message Attachments
DROP POLICY IF EXISTS "Message attachments access" ON storage.objects;
CREATE POLICY "Message attachments access" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'message-attachments')
    WITH CHECK (bucket_id = 'message-attachments');

-- 7. Storage Policies for Assessment Files
DROP POLICY IF EXISTS "Assessment files access" ON storage.objects;
CREATE POLICY "Assessment files access" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'assessment-files')
    WITH CHECK (bucket_id = 'assessment-files');
