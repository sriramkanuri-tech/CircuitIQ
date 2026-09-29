export type UserRole = 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  mobile?: string;
  college?: string;
  student_id?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  estimated_hours: number;
  thumbnail_url?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}

export interface ModuleContent {
  learning_objectives: string[];
  theory: string[];
  circuit_diagram_svg?: string;
  circuit_description?: string;
  working_principle: string[];
  equations: {
    title: string;
    formula: string;
    description: string;
  }[];
  characteristics: {
    title: string;
    points: string[];
  }[];
  applications: string[];
  advantages: string[];
  limitations: string[];
  practical_notes: string[];
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  description: string;
  order_number: number;
  estimated_minutes: number;
  content: ModuleContent;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  module_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  module_id: string;
  completed: boolean;
  quiz_passed: boolean;
  completed_at?: string;
  updated_at?: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  module_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  attempt_number: number;
  attempted_at: string;
  module_title?: string;
}

export interface QuizAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option: 'A' | 'B' | 'C' | 'D';
  is_correct: boolean;
}

export interface FinalAssessment {
  id: string;
  user_id: string;
  course_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  attempt_number: number;
  started_at: string;
  submitted_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  verification_token: string;
  score: number;
  issue_date: string;
  pdf_path?: string;
  status: 'VALID' | 'REVOKED';
  generated_by?: string; // Admin user ID or 'SYSTEM'
  generated_by_name?: string;
  generated_at?: string;
  updated_at?: string;
  created_at: string;
  student_name?: string;
  student_email?: string;
  student_college?: string;
  course_title?: string;
}

export interface EmailLog {
  id: string;
  user_id?: string;
  certificate_id?: string;
  recipient_email: string;
  email_type: 'VERIFICATION' | 'PASSWORD_RESET' | 'CERTIFICATE_ISSUED' | 'CERTIFICATE_RESEND';
  subject: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  error_message?: string;
  sent_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_email: string;
  admin_name: string;
  action: string;
  target_user_id?: string;
  target_user_email?: string;
  target_cert_id?: string;
  previous_value?: string;
  new_value?: string;
  details: string;
  created_at: string;
}
