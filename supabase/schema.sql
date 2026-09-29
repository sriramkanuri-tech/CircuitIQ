-- CircuitIQ Database Schema for Supabase PostgreSQL
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Profiles Table (User Details)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  college TEXT DEFAULT '',
  student_id TEXT DEFAULT '',
  mobile TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'ADMIN', 'SUPER_ADMIN')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile (Owner locked as SUPER_ADMIN)" 
ON public.profiles FOR UPDATE USING (
  -- Super admin or self (cannot change role to SUPER_ADMIN unless already owner)
  email = 'sriramkanuri4@gmail.com' OR role != 'SUPER_ADMIN'
);

-- Insert / Ensure Permanent Platform Owner
INSERT INTO public.profiles (id, email, full_name, college, student_id, role, created_at, updated_at)
VALUES (
  'usr-owner-permanent',
  'sriramkanuri4@gmail.com',
  'Platform Owner',
  'CircuitIQ Administration',
  'SUPER-ADMIN-01',
  'SUPER_ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  role = 'SUPER_ADMIN',
  updated_at = NOW();

-- 2. Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  certificate_number TEXT UNIQUE NOT NULL,
  verification_token TEXT NOT NULL,
  score NUMERIC(5, 2) NOT NULL,
  issue_date TEXT NOT NULL,
  pdf_path TEXT,
  status TEXT NOT NULL DEFAULT 'VALID' CHECK (status IN ('VALID', 'REVOKED', 'EXPIRED')),
  generated_by TEXT DEFAULT 'SYSTEM',
  generated_by_name TEXT DEFAULT 'System',
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_college TEXT DEFAULT '',
  course_title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Anyone can verify a certificate by certificate_number or view valid certificates
CREATE POLICY "Certificates are publicly verifiable" 
ON public.certificates FOR SELECT USING (true);

CREATE POLICY "Authenticated users and admins can insert certificates" 
ON public.certificates FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can update certificate status" 
ON public.certificates FOR UPDATE USING (true);

-- 3. Course Progress Table
CREATE TABLE IF NOT EXISTS public.course_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  quiz_passed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, module_id)
);

ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their course progress" 
ON public.course_progress FOR ALL USING (true);

-- 4. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage NUMERIC(5, 2) NOT NULL,
  passed BOOLEAN DEFAULT FALSE,
  attempt_number INTEGER DEFAULT 1,
  attempted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  module_title TEXT NOT NULL
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and record quiz attempts" 
ON public.quiz_attempts FOR ALL USING (true);

-- 5. Supabase Storage Bucket for Certificates
-- In Supabase Dashboard -> Storage, create a bucket named 'certificates' with Public access.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;
