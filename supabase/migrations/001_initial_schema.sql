-- ============================================================================
-- CIRCUITIQ: Complete Database Schema & Migration v2.0
-- Roles: STUDENT, ADMIN, SUPER_ADMIN
-- Permanent Owner: sriramkanuri4@gmail.com
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean / create types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('STUDENT', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE cert_status AS ENUM ('VALID', 'REVOKED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE email_status AS ENUM ('PENDING', 'SENT', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- 1. Profiles Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT,
    college TEXT,
    student_id TEXT,
    role user_role NOT NULL DEFAULT 'STUDENT',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. Courses Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    level TEXT DEFAULT 'Undergraduate / Professional',
    estimated_hours INTEGER DEFAULT 48,
    thumbnail_url TEXT,
    status TEXT NOT NULL DEFAULT 'PUBLISHED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. Modules Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    order_number INTEGER NOT NULL,
    estimated_minutes INTEGER NOT NULL DEFAULT 45,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(course_id, slug),
    UNIQUE(course_id, order_number)
);

-- ----------------------------------------------------------------------------
-- 4. Questions Table (MCQs)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option VARCHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. Course Progress Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    quiz_passed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- ----------------------------------------------------------------------------
-- 6. Quiz Attempts Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage NUMERIC(5,2) NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. Quiz Answers Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option VARCHAR(1) NOT NULL CHECK (selected_option IN ('A', 'B', 'C', 'D')),
    is_correct BOOLEAN NOT NULL
);

-- ----------------------------------------------------------------------------
-- 8. Final Assessments Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.final_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL DEFAULT 30,
    percentage NUMERIC(5,2) NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. Final Assessment Answers Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.final_assessment_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.final_assessments(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option VARCHAR(1) NOT NULL CHECK (selected_option IN ('A', 'B', 'C', 'D')),
    is_correct BOOLEAN NOT NULL
);

-- ----------------------------------------------------------------------------
-- 10. Certificates Table (Includes generated_by & audit references)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    certificate_number TEXT NOT NULL UNIQUE,
    verification_token TEXT NOT NULL UNIQUE,
    score NUMERIC(5,2) NOT NULL,
    issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    pdf_path TEXT,
    status cert_status NOT NULL DEFAULT 'VALID',
    generated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 11. Email Logs Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    certificate_id UUID REFERENCES public.certificates(id) ON DELETE SET NULL,
    recipient_email TEXT NOT NULL,
    email_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    status email_status NOT NULL DEFAULT 'PENDING',
    error_message TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 12. Audit Logs Table (Requirement 28)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    target_cert_id UUID REFERENCES public.certificates(id) ON DELETE SET NULL,
    previous_value TEXT,
    new_value TEXT,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_modules_course ON public.modules(course_id, order_number);
CREATE INDEX IF NOT EXISTS idx_questions_module ON public.questions(module_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_course ON public.course_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_cert_num ON public.certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- ----------------------------------------------------------------------------
-- SECURITY & AUTHORIZATION FUNCTIONS
-- ----------------------------------------------------------------------------

-- Check if current authenticated user is ADMIN or SUPER_ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current authenticated user is permanent SUPER_ADMIN
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- PERMANENT OWNER SECURITY TRIGGER (Requirements 1, 2, 13, 31)
-- Protects sriramkanuri4@gmail.com from being deleted, demoted, or altered
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_owner_protection()
RETURNS TRIGGER AS $$
BEGIN
    -- If modifying the permanent owner profile:
    IF OLD.email = 'sriramkanuri4@gmail.com' THEN
        -- Prevent changing role away from SUPER_ADMIN
        IF NEW.role != 'SUPER_ADMIN' THEN
            RAISE EXCEPTION 'Permanent platform owner sriramkanuri4@gmail.com cannot be demoted or have their role altered.';
        END IF;
    END IF;

    -- Only SUPER_ADMIN can promote to ADMIN or demote to STUDENT
    IF OLD.role != NEW.role THEN
        IF NOT public.is_super_admin() THEN
            RAISE EXCEPTION 'Only the SUPER_ADMIN can modify user administrator roles.';
        END IF;
        -- Block anyone from promoting anyone to SUPER_ADMIN
        IF NEW.role = 'SUPER_ADMIN' AND NEW.email != 'sriramkanuri4@gmail.com' THEN
            RAISE EXCEPTION 'Only sriramkanuri4@gmail.com can hold the SUPER_ADMIN role.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_owner_protection ON public.profiles;
CREATE TRIGGER trg_enforce_owner_protection
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.enforce_owner_protection();

-- Prevent deletion of owner profile
CREATE OR REPLACE FUNCTION public.prevent_owner_deletion()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.email = 'sriramkanuri4@gmail.com' THEN
        RAISE EXCEPTION 'The permanent platform owner account sriramkanuri4@gmail.com cannot be deleted.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_owner_deletion ON public.profiles;
CREATE TRIGGER trg_prevent_owner_deletion
    BEFORE DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_owner_deletion();

-- ----------------------------------------------------------------------------
-- AUTOMATIC PROFILE TRIGGER ON SIGNUP (Requirement 12, 13)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    initial_role user_role := 'STUDENT';
BEGIN
    -- If registering user is the permanent owner, immediately set SUPER_ADMIN
    IF LOWER(NEW.email) = 'sriramkanuri4@gmail.com' THEN
        initial_role := 'SUPER_ADMIN';
    END IF;

    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        mobile,
        college,
        student_id,
        role
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'CircuitIQ Student'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'mobile', ''),
        COALESCE(NEW.raw_user_meta_data->>'college', ''),
        COALESCE(NEW.raw_user_meta_data->>'student_id', ''),
        initial_role
    )
    ON CONFLICT (id) DO UPDATE SET
        role = CASE WHEN LOWER(NEW.email) = 'sriramkanuri4@gmail.com' THEN 'SUPER_ADMIN' ELSE profiles.role END,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Public select, Users update own profile (cannot change role), Admins full
CREATE POLICY "Public profiles are viewable by authenticated users" 
    ON public.profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can update their own personal info except role" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Super Admins can manage all profiles" 
    ON public.profiles FOR ALL 
    USING (public.is_super_admin());

-- Certificates: Public can view for verification, Admins can manage
CREATE POLICY "Public can view certificates for verification" 
    ON public.certificates FOR SELECT 
    USING (true);

CREATE POLICY "Admins can manage certificates" 
    ON public.certificates FOR ALL 
    USING (public.is_admin());

-- Audit logs: Admins can view and insert
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (public.is_admin());

-- Storage Bucket Configuration
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for certificates"
ON storage.objects FOR SELECT
USING (bucket_id = 'certificates');

CREATE POLICY "Admins upload access for certificates"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'certificates' AND public.is_admin());
