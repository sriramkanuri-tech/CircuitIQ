import { COURSE_ANALOG, MODULES_ANALOG } from '@/lib/seed/courseData';
import { getQuestionsForModule, getFinalAssessmentQuestions } from '@/lib/seed/questionsData';
import { generateCertificatePDF, generateCertificateNumber } from '@/lib/certificates/generator';
import { sendCertificateEmail } from '@/lib/email/service';
import {
  UserProfile,
  UserRole,
  Course,
  CourseModule,
  Question,
  CourseProgress,
  QuizAttempt,
  FinalAssessment,
  Certificate,
  EmailLog,
  AuditLog,
} from '@/types';

export const PERMANENT_OWNER_EMAIL = 'sriramkanuri4@gmail.com';

// Server-side persistent memory store for CircuitIQ
class CircuitMemoryStore {
  profiles: Map<string, UserProfile> = new Map();
  courses: Map<string, Course> = new Map();
  modules: Map<string, CourseModule> = new Map();
  questions: Map<string, Question[]> = new Map();
  progress: Map<string, CourseProgress> = new Map(); // key: `${userId}_${moduleId}`
  quizAttempts: QuizAttempt[] = [];
  finalAssessments: FinalAssessment[] = [];
  certificates: Map<string, Certificate> = new Map(); // key: certificate_number
  emailLogs: EmailLog[] = [];
  auditLogs: AuditLog[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    // Seed Course: Analog Electronic Circuits
    this.courses.set(COURSE_ANALOG.id, { ...COURSE_ANALOG });

    // Seed Modules
    MODULES_ANALOG.forEach((mod) => {
      this.modules.set(mod.id, { ...mod });
      const qList = getQuestionsForModule(mod.id);
      this.questions.set(mod.id, qList);
    });

    // Seed Permanent Platform Owner (sriramkanuri4@gmail.com as SUPER_ADMIN)
    const ownerUser: UserProfile = {
      id: 'usr-owner-001',
      email: PERMANENT_OWNER_EMAIL,
      full_name: 'Platform Owner',
      college: 'CircuitIQ Academic Directorate',
      student_id: 'OWNER-001',
      role: 'SUPER_ADMIN',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: new Date().toISOString(),
    };
    this.profiles.set(ownerUser.id, ownerUser);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __circuitStore: CircuitMemoryStore | undefined;
}

const globalStore: CircuitMemoryStore = globalThis.__circuitStore || new CircuitMemoryStore();
globalThis.__circuitStore = globalStore;

export const circuitService = {
  // --- Profiles & Role Management ---
  async getProfile(userId: string): Promise<UserProfile | null> {
    return globalStore.profiles.get(userId) || null;
  },

  async getProfileByEmail(email: string): Promise<UserProfile | null> {
    const normalized = email.toLowerCase().trim();
    return Array.from(globalStore.profiles.values()).find((p) => p.email.toLowerCase() === normalized) || null;
  },

  async upsertProfile(profile: UserProfile): Promise<UserProfile> {
    const isOwner = profile.email.toLowerCase() === PERMANENT_OWNER_EMAIL.toLowerCase();

    // Prevent anyone from changing owner role away from SUPER_ADMIN
    const role: UserRole = isOwner ? 'SUPER_ADMIN' : profile.role || 'STUDENT';

    const updatedProfile: UserProfile = {
      ...profile,
      role,
      updated_at: new Date().toISOString(),
    };

    globalStore.profiles.set(profile.id, updatedProfile);
    return updatedProfile;
  },

  async getAllUsers(): Promise<UserProfile[]> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.users)) {
            data.users.forEach((prof: UserProfile) => {
              if (prof.email.toLowerCase() === PERMANENT_OWNER_EMAIL.toLowerCase()) {
                prof.role = 'SUPER_ADMIN';
              }
              globalStore.profiles.set(prof.id, prof);
            });
          }
        }
      } catch (err) {
        // Fallback to local store
      }

      try {
        const storedUsersRaw = localStorage.getItem('circuitiq_registered_users');
        if (storedUsersRaw) {
          const storedUsers = JSON.parse(storedUsersRaw);
          Object.values(storedUsers).forEach((entry: any) => {
            if (entry.profile && entry.profile.id) {
              const prof = { ...entry.profile } as UserProfile;
              if (prof.email.toLowerCase() === PERMANENT_OWNER_EMAIL.toLowerCase()) {
                prof.role = 'SUPER_ADMIN';
              }
              if (!globalStore.profiles.has(prof.id)) {
                globalStore.profiles.set(prof.id, prof);
              }
            }
          });
        }
      } catch (e) {}
    } else {
      // Server-side fallback
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fs = require('fs');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const path = require('path');
        const filePath = path.join(process.cwd(), 'data', 'users.json');
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(content || '{}');
          Object.values(data).forEach((entry: any) => {
            if (entry.profile && entry.profile.id) {
              const prof = { ...entry.profile } as UserProfile;
              if (prof.email.toLowerCase() === PERMANENT_OWNER_EMAIL.toLowerCase()) {
                prof.role = 'SUPER_ADMIN';
              }
              globalStore.profiles.set(prof.id, prof);
            }
          });
        }
      } catch (e) {}
    }
    return Array.from(globalStore.profiles.values());
  },

  async getAllStudents(): Promise<UserProfile[]> {
    const all = await this.getAllUsers();
    return all.filter((p) => p.role === 'STUDENT');
  },

  // Role Promotion: SUPER_ADMIN promotes STUDENT -> ADMIN
  async promoteToAdmin(adminUserId: string, targetUserId: string): Promise<{ success: boolean; error?: string }> {
    const adminUser = globalStore.profiles.get(adminUserId) || Array.from(globalStore.profiles.values()).find(p => p.email.toLowerCase() === PERMANENT_OWNER_EMAIL.toLowerCase());
    if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized. Only the SUPER_ADMIN can promote users to administrators.' };
    }

    const target = globalStore.profiles.get(targetUserId);
    if (!target) return { success: false, error: 'Target user not found.' };

    if (target.email.toLowerCase() === PERMANENT_OWNER_EMAIL.toLowerCase()) {
      return { success: false, error: 'Permanent platform owner is already SUPER_ADMIN.' };
    }

    const prevRole = target.role;
    target.role = 'ADMIN';
    target.updated_at = new Date().toISOString();
    globalStore.profiles.set(target.id, target);

    // Sync to localStorage
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('circuitiq_registered_users');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed[target.email.toLowerCase()]) {
            parsed[target.email.toLowerCase()].profile.role = 'ADMIN';
            localStorage.setItem('circuitiq_registered_users', JSON.stringify(parsed));
          }
        }
      } catch {}

      try {
        await fetch('/api/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: target.id, email: target.email, role: 'ADMIN' }),
        });
      } catch (e) {}
    }

    // Record Audit Log
    await this.recordAuditLog({
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      adminName: adminUser.full_name,
      action: 'ADMIN_PROMOTION',
      targetUserId: target.id,
      targetUserEmail: target.email,
      previousValue: prevRole,
      newValue: 'ADMIN',
      details: `SUPER_ADMIN promoted ${target.full_name} (${target.email}) to ADMIN.`,
    });

    return { success: true };
  },

  // Role Demotion: SUPER_ADMIN demotes ADMIN -> STUDENT
  async demoteAdminToStudent(adminUserId: string, targetUserId: string): Promise<{ success: boolean; error?: string }> {
    const adminUser = globalStore.profiles.get(adminUserId) || Array.from(globalStore.profiles.values()).find(p => p.email.toLowerCase() === PERMANENT_OWNER_EMAIL.toLowerCase());
    if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized. Only the SUPER_ADMIN can demote administrators.' };
    }

    const target = globalStore.profiles.get(targetUserId);
    if (!target) return { success: false, error: 'Target user not found.' };

    // Block any attempt to demote permanent owner
    if (target.email.toLowerCase() === PERMANENT_OWNER_EMAIL.toLowerCase()) {
      return { success: false, error: 'Permanent platform owner sriramkanuri4@gmail.com can NEVER be demoted.' };
    }

    const prevRole = target.role;
    target.role = 'STUDENT';
    target.updated_at = new Date().toISOString();
    globalStore.profiles.set(target.id, target);

    // Sync to localStorage
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('circuitiq_registered_users');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed[target.email.toLowerCase()]) {
            parsed[target.email.toLowerCase()].profile.role = 'STUDENT';
            localStorage.setItem('circuitiq_registered_users', JSON.stringify(parsed));
          }
        }
      } catch {}

      try {
        await fetch('/api/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: target.id, email: target.email, role: 'STUDENT' }),
        });
      } catch (e) {}
    }

    // Record Audit Log
    await this.recordAuditLog({
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      adminName: adminUser.full_name,
      action: 'ADMIN_DEMOTION',
      targetUserId: target.id,
      targetUserEmail: target.email,
      previousValue: prevRole,
      newValue: 'STUDENT',
      details: `SUPER_ADMIN demoted ${target.full_name} (${target.email}) from ADMIN to STUDENT.`,
    });

    return { success: true };
  },

  // --- Courses & Modules ---
  async getCourses(): Promise<Course[]> {
    return Array.from(globalStore.courses.values());
  },

  async getCourseBySlug(slug: string): Promise<Course | null> {
    return Array.from(globalStore.courses.values()).find((c) => c.slug === slug) || null;
  },

  async getCourseById(courseId: string): Promise<Course | null> {
    return globalStore.courses.get(courseId) || null;
  },

  async getModules(courseId: string): Promise<CourseModule[]> {
    return Array.from(globalStore.modules.values())
      .filter((m) => m.course_id === courseId)
      .sort((a, b) => a.order_number - b.order_number);
  },

  async getModuleBySlug(courseId: string, moduleSlug: string): Promise<CourseModule | null> {
    return (
      Array.from(globalStore.modules.values()).find(
        (m) => m.course_id === courseId && m.slug === moduleSlug
      ) || null
    );
  },

  async getModuleById(moduleId: string): Promise<CourseModule | null> {
    return globalStore.modules.get(moduleId) || null;
  },

  // --- Questions ---
  async getQuestions(moduleId: string): Promise<Question[]> {
    let list = globalStore.questions.get(moduleId);
    if (!list || list.length === 0) {
      list = getQuestionsForModule(moduleId);
      globalStore.questions.set(moduleId, list);
    }
    return list;
  },

  async saveQuestion(question: Question): Promise<Question> {
    const list = globalStore.questions.get(question.module_id) || [];
    const idx = list.findIndex((q) => q.id === question.id);
    if (idx >= 0) {
      list[idx] = question;
    } else {
      list.push(question);
    }
    globalStore.questions.set(question.module_id, list);
    return question;
  },

  async deleteQuestion(moduleId: string, questionId: string): Promise<boolean> {
    const list = globalStore.questions.get(moduleId) || [];
    const filtered = list.filter((q) => q.id !== questionId);
    globalStore.questions.set(moduleId, filtered);
    return true;
  },

  // --- Progress & Quizzes ---
  async getCourseProgress(userId: string, courseId: string): Promise<CourseProgress[]> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/progress?userId=${encodeURIComponent(userId)}&courseId=${encodeURIComponent(courseId)}&type=progress`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.progress)) {
            data.progress.forEach((p: CourseProgress) => {
              globalStore.progress.set(`${p.user_id}_${p.module_id}`, p);
            });
          }
        }
      } catch (e) {
        console.warn('Could not sync progress from server:', e);
      }
    }
    return Array.from(globalStore.progress.values()).filter(
      (p) => p.user_id === userId && p.course_id === courseId
    );
  },

  async markModuleComplete(userId: string, courseId: string, moduleId: string): Promise<{ success: boolean; error?: string }> {
    const attempts = globalStore.quizAttempts.filter(
      (qa) => qa.user_id === userId && qa.module_id === moduleId && qa.passed
    );

    if (attempts.length === 0) {
      return {
        success: false,
        error: 'Cannot mark module complete before passing the module quiz with at least 70%.',
      };
    }

    const key = `${userId}_${moduleId}`;
    const existing = globalStore.progress.get(key);
    const progressItem: CourseProgress = {
      id: existing ? existing.id : `prog-${Date.now()}`,
      user_id: userId,
      course_id: courseId,
      module_id: moduleId,
      completed: true,
      quiz_passed: true,
      completed_at: new Date().toISOString(),
    };
    globalStore.progress.set(key, progressItem);

    if (typeof window !== 'undefined') {
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_progress', progressItem }),
      }).catch(console.error);
    }

    return { success: true };
  },

  async submitQuiz(params: {
    userId: string;
    moduleId: string;
    courseId: string;
    answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  }): Promise<{
    score: number;
    total: number;
    percentage: number;
    passed: boolean;
    attempt: QuizAttempt;
  }> {
    const questions = await this.getQuestions(params.moduleId);
    let correctCount = 0;

    questions.forEach((q) => {
      const selected = params.answers[q.id];
      if (selected && selected === q.correct_option) {
        correctCount++;
      }
    });

    const total = questions.length;
    const percentage = total > 0 ? Number(((correctCount / total) * 100).toFixed(1)) : 0;
    const passed = percentage >= 70.0;

    const moduleObj = globalStore.modules.get(params.moduleId);
    const prevAttempts = globalStore.quizAttempts.filter(
      (qa) => qa.user_id === params.userId && qa.module_id === params.moduleId
    );

    const attempt: QuizAttempt = {
      id: `qa-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      user_id: params.userId,
      module_id: params.moduleId,
      score: correctCount,
      total_questions: total,
      percentage,
      passed,
      attempt_number: prevAttempts.length + 1,
      attempted_at: new Date().toISOString(),
      module_title: moduleObj?.title || 'Module Quiz',
    };

    globalStore.quizAttempts.push(attempt);

    if (typeof window !== 'undefined') {
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_attempt', attemptItem: attempt }),
      }).catch(console.error);
    }

    if (passed) {
      const key = `${params.userId}_${params.moduleId}`;
      const existing = globalStore.progress.get(key);
      const progItem: CourseProgress = {
        id: existing ? existing.id : `prog-${Date.now()}`,
        user_id: params.userId,
        course_id: params.courseId,
        module_id: params.moduleId,
        completed: true,
        quiz_passed: true,
        completed_at: new Date().toISOString(),
      };
      globalStore.progress.set(key, progItem);

      if (typeof window !== 'undefined') {
        fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'save_progress', progressItem: progItem }),
        }).catch(console.error);
      }
    }

    return {
      score: correctCount,
      total,
      percentage,
      passed,
      attempt,
    };
  },

  async getQuizAttempts(userId: string, moduleId?: string): Promise<QuizAttempt[]> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/progress?userId=${encodeURIComponent(userId)}&type=attempts`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.attempts)) {
            data.attempts.forEach((a: QuizAttempt) => {
              if (!globalStore.quizAttempts.some((existing) => existing.id === a.id)) {
                globalStore.quizAttempts.push(a);
              }
            });
          }
        }
      } catch (e) {
        console.warn('Could not sync quiz attempts from server:', e);
      }
    }
    return globalStore.quizAttempts
      .filter((qa) => qa.user_id === userId && (!moduleId || qa.module_id === moduleId))
      .sort((a, b) => new Date(b.attempted_at).getTime() - new Date(a.attempted_at).getTime());
  },

  // --- Final Assessment ---
  async getFinalAssessmentQuestions(): Promise<Question[]> {
    return getFinalAssessmentQuestions();
  },

  async submitFinalAssessment(params: {
    userId: string;
    courseId: string;
    answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  }): Promise<{
    score: number;
    total: number;
    percentage: number;
    passed: boolean;
    certificate?: Certificate;
    error?: string;
  }> {
    const questions = getFinalAssessmentQuestions();
    let correctCount = 0;

    questions.forEach((q) => {
      const selected = params.answers[q.id];
      if (selected && selected === q.correct_option) {
        correctCount++;
      }
    });

    const total = questions.length;
    const percentage = Number(((correctCount / total) * 100).toFixed(1));
    const passed = percentage >= 70.0;

    const prevFinals = globalStore.finalAssessments.filter(
      (fa) => fa.user_id === params.userId && fa.course_id === params.courseId
    );

    const assessment: FinalAssessment = {
      id: `fa-${Date.now()}`,
      user_id: params.userId,
      course_id: params.courseId,
      score: correctCount,
      total_questions: total,
      percentage,
      passed,
      attempt_number: prevFinals.length + 1,
      started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      submitted_at: new Date().toISOString(),
    };

    globalStore.finalAssessments.push(assessment);

    let cert: Certificate | undefined;

    if (passed) {
      const genResult = await this.generateCertificateForUser({
        userId: params.userId,
        courseId: params.courseId,
        score: percentage,
      });

      if (genResult.certificate) {
        cert = genResult.certificate;
      }
    }

    return {
      score: correctCount,
      total,
      percentage,
      passed,
      certificate: cert,
    };
  },

  // --- Certificates ---
  async generateCertificateForUser(params: {
    userId: string;
    courseId: string;
    score: number;
    generatedBy?: string;
  }): Promise<{ certificate?: Certificate; error?: string }> {
    const user = globalStore.profiles.get(params.userId);
    const course = globalStore.courses.get(params.courseId);

    if (!user || !course) {
      return { error: 'User or Course not found.' };
    }

    // Check if valid certificate already exists
    const existing = Array.from(globalStore.certificates.values()).find(
      (c) => c.user_id === params.userId && c.course_id === params.courseId && c.status === 'VALID'
    );

    if (existing) {
      return { certificate: existing };
    }

    const certNum = generateCertificateNumber();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyUrl = `${appUrl}/verify/${certNum}`;
    const issueDateStr = '29 September 2026';

    const { pdfBuffer, pdfBase64 } = await generateCertificatePDF({
      studentName: user.full_name,
      courseTitle: course.title,
      score: params.score,
      issueDate: issueDateStr,
      certificateNumber: certNum,
      verificationUrl: verifyUrl,
    });

    const newCert: Certificate = {
      id: `cert-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      user_id: user.id,
      course_id: course.id,
      certificate_number: certNum,
      verification_token: `vtoken-${Math.random().toString(36).substring(2, 15)}`,
      score: params.score,
      issue_date: new Date().toISOString(),
      pdf_path: pdfBase64,
      status: 'VALID',
      generated_by: params.generatedBy || 'SYSTEM',
      generated_by_name: params.generatedBy ? (globalStore.profiles.get(params.generatedBy)?.full_name || 'Admin') : 'System (Examination)',
      created_at: new Date().toISOString(),
      student_name: user.full_name,
      student_email: user.email,
      student_college: user.college,
      course_title: course.title,
    };

    globalStore.certificates.set(newCert.certificate_number, newCert);

    if (typeof window !== 'undefined') {
      fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCert),
      }).catch(console.error);
    }

    // Send email asynchronously
    sendCertificateEmail({
      studentName: user.full_name,
      studentEmail: user.email,
      certificateNumber: certNum,
      score: params.score,
      verificationUrl: verifyUrl,
      pdfBuffer,
      userId: user.id,
      certificateId: newCert.id,
    })
      .then((res) => {
        globalStore.emailLogs.push({
          id: `el-${Date.now()}`,
          user_id: user.id,
          certificate_id: newCert.id,
          recipient_email: user.email,
          email_type: 'CERTIFICATE_ISSUED',
          subject: 'Congratulations! Your CircuitIQ Certificate is Ready',
          status: res.success ? 'SENT' : 'FAILED',
          error_message: res.error,
          sent_at: new Date().toISOString(),
        });
      })
      .catch((err) => {
        console.error('Email sending error:', err);
      });

    return { certificate: newCert };
  },

  // Manual Certificate Generation by Admin (Requirements 14, 15, 16)
  async generateCertificateManual(params: {
    adminUserId: string;
    studentId: string;
    courseId: string;
    score: number;
    issueDate?: string;
    sendEmail?: boolean;
  }): Promise<{ certificate?: Certificate; error?: string }> {
    const admin = globalStore.profiles.get(params.adminUserId);
    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      return { error: 'Unauthorized. Only administrators can issue manual certificates.' };
    }

    const student = globalStore.profiles.get(params.studentId);
    const course = globalStore.courses.get(params.courseId);

    if (!student || !course) {
      return { error: 'Student or Course not found.' };
    }

    const certNum = generateCertificateNumber();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyUrl = `${appUrl}/verify/${certNum}`;
    const issueDateStr = params.issueDate || '29 September 2026';

    const { pdfBuffer, pdfBase64 } = await generateCertificatePDF({
      studentName: student.full_name,
      courseTitle: course.title,
      score: params.score,
      issueDate: issueDateStr,
      certificateNumber: certNum,
      verificationUrl: verifyUrl,
    });

    const newCert: Certificate = {
      id: `cert-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      user_id: student.id,
      course_id: course.id,
      certificate_number: certNum,
      verification_token: `vtoken-${Math.random().toString(36).substring(2, 15)}`,
      score: params.score,
      issue_date: new Date().toISOString(),
      pdf_path: pdfBase64,
      status: 'VALID',
      generated_by: admin.id,
      generated_by_name: `${admin.full_name} (${admin.role})`,
      created_at: new Date().toISOString(),
      student_name: student.full_name,
      student_email: student.email,
      student_college: student.college,
      course_title: course.title,
    };

    globalStore.certificates.set(newCert.certificate_number, newCert);

    if (typeof window !== 'undefined') {
      fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCert),
      }).catch(console.error);
    }

    // Record Audit Log (Requirement 28)
    await this.recordAuditLog({
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.full_name,
      action: 'CERTIFICATE_GENERATED_MANUAL',
      targetUserId: student.id,
      targetUserEmail: student.email,
      targetCertId: newCert.id,
      details: `${admin.role} ${admin.full_name} manually generated certificate ${newCert.certificate_number} with score ${params.score}% for ${student.full_name}.`,
    });

    // Send email if requested
    if (params.sendEmail !== false) {
      sendCertificateEmail({
        studentName: student.full_name,
        studentEmail: student.email,
        certificateNumber: certNum,
        score: params.score,
        verificationUrl: verifyUrl,
        pdfBuffer,
        userId: student.id,
        certificateId: newCert.id,
      })
        .then((res) => {
          globalStore.emailLogs.push({
            id: `el-${Date.now()}`,
            user_id: student.id,
            certificate_id: newCert.id,
            recipient_email: student.email,
            email_type: 'CERTIFICATE_ISSUED',
            subject: 'Congratulations! Your CircuitIQ Certificate is Ready',
            status: res.success ? 'SENT' : 'FAILED',
            error_message: res.error,
            sent_at: new Date().toISOString(),
          });
        })
        .catch(console.error);
    }

    return { certificate: newCert };
  },

  async getCertificates(userId?: string): Promise<Certificate[]> {
    if (typeof window !== 'undefined') {
      try {
        const url = `/api/certificates${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.certificates)) {
            data.certificates.forEach((c: Certificate) => {
              globalStore.certificates.set(c.certificate_number, c);
            });
          }
        }
      } catch (e) {
        console.warn('Could not sync certificates from server:', e);
      }
    }

    const list = Array.from(globalStore.certificates.values());
    if (userId) {
      return list.filter((c) => c.user_id === userId);
    }
    return list;
  },

  async getCertificateByNumber(certNum: string): Promise<Certificate | null> {
    if (globalStore.certificates.has(certNum)) {
      return globalStore.certificates.get(certNum) || null;
    }
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/certificates?number=${encodeURIComponent(certNum)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.certificate) {
            globalStore.certificates.set(data.certificate.certificate_number, data.certificate);
            return data.certificate;
          }
        }
      } catch (e) {
        console.warn('Could not sync certificate by number:', e);
      }
    }
    return null;
  },

  // Certificate Revocation (Requirement 23)
  async revokeCertificate(adminUserId: string, certId: string): Promise<{ success: boolean; error?: string }> {
    const admin = globalStore.profiles.get(adminUserId);
    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      return { success: false, error: 'Unauthorized. Only administrators can revoke certificates.' };
    }

    const entry = Array.from(globalStore.certificates.entries()).find(([_, cert]) => cert.id === certId);
    if (!entry) return { success: false, error: 'Certificate not found.' };

    const [key, cert] = entry;
    const prevStatus = cert.status;
    cert.status = 'REVOKED';
    cert.updated_at = new Date().toISOString();
    globalStore.certificates.set(key, cert);

    // Record Audit Log (Requirement 28)
    await this.recordAuditLog({
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.full_name,
      action: 'CERTIFICATE_REVOKED',
      targetCertId: cert.id,
      targetUserId: cert.user_id,
      targetUserEmail: cert.student_email,
      previousValue: prevStatus,
      newValue: 'REVOKED',
      details: `${admin.role} ${admin.full_name} revoked certificate ${cert.certificate_number} for ${cert.student_name}.`,
    });

    return { success: true };
  },

  // Certificate Regeneration (Requirement 24)
  async regenerateCertificate(
    adminUserId: string,
    certId: string,
    updates?: { studentName?: string; issueDate?: string }
  ): Promise<{ success: boolean; certificate?: Certificate; error?: string }> {
    const admin = globalStore.profiles.get(adminUserId) || Array.from(globalStore.profiles.values()).find(p => p.role === 'SUPER_ADMIN' || p.role === 'ADMIN');
    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      return { success: false, error: 'Unauthorized. Only administrators can regenerate certificates.' };
    }

    const targetCert = Array.from(globalStore.certificates.values()).find((c) => c.id === certId);
    if (!targetCert) return { success: false, error: 'Certificate not found.' };

    if (updates?.studentName) {
      targetCert.student_name = updates.studentName.trim();
    }
    if (updates?.issueDate) {
      targetCert.issue_date = updates.issueDate;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyUrl = `${appUrl}/verify/${targetCert.certificate_number}`;

    const { pdfBase64 } = await generateCertificatePDF({
      studentName: targetCert.student_name || 'Student',
      courseTitle: targetCert.course_title || 'Analog Electronic Circuits',
      score: targetCert.score,
      issueDate: targetCert.issue_date || '29 September 2026',
      certificateNumber: targetCert.certificate_number,
      verificationUrl: verifyUrl,
    });

    targetCert.pdf_path = pdfBase64;
    targetCert.updated_at = new Date().toISOString();
    globalStore.certificates.set(targetCert.certificate_number, targetCert);

    // Audit log
    await this.recordAuditLog({
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.full_name,
      action: 'CERTIFICATE_REGENERATED',
      targetCertId: targetCert.id,
      targetUserId: targetCert.user_id,
      targetUserEmail: targetCert.student_email,
      details: `${admin.role} ${admin.full_name} regenerated certificate ${targetCert.certificate_number} (Recipient: ${targetCert.student_name}). Verification identity preserved.`,
    });

    return { success: true, certificate: targetCert };
  },

  async resendCertificateEmail(adminUserId: string, certId: string): Promise<{ success: boolean; error?: string }> {
    const admin = globalStore.profiles.get(adminUserId) || Array.from(globalStore.profiles.values()).find(p => p.role === 'SUPER_ADMIN' || p.role === 'ADMIN');
    const targetCert = Array.from(globalStore.certificates.values()).find((c) => c.id === certId);

    if (!targetCert) return { success: false, error: 'Certificate not found.' };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyUrl = `${appUrl}/verify/${targetCert.certificate_number}`;

    const { pdfBuffer } = await generateCertificatePDF({
      studentName: targetCert.student_name || 'Student',
      courseTitle: targetCert.course_title || 'Analog Electronic Circuits',
      score: targetCert.score,
      issueDate: '29 September 2026',
      certificateNumber: targetCert.certificate_number,
      verificationUrl: verifyUrl,
    });

    const recipientEmail = targetCert.student_email || 'student@institution.edu';

    const emailRes = await sendCertificateEmail({
      studentName: targetCert.student_name || 'Student',
      studentEmail: recipientEmail,
      certificateNumber: targetCert.certificate_number,
      score: targetCert.score,
      verificationUrl: verifyUrl,
      pdfBuffer,
      userId: targetCert.user_id,
      certificateId: targetCert.id,
      isResend: true,
    });

    globalStore.emailLogs.push({
      id: `el-${Date.now()}`,
      user_id: targetCert.user_id,
      certificate_id: targetCert.id,
      recipient_email: recipientEmail,
      email_type: 'CERTIFICATE_RESEND',
      subject: `[Resend] CircuitIQ Certificate: ${targetCert.certificate_number}`,
      status: emailRes.success ? 'SENT' : 'FAILED',
      error_message: emailRes.error,
      sent_at: new Date().toISOString(),
    });

    if (admin) {
      await this.recordAuditLog({
        adminId: admin.id,
        adminEmail: admin.email,
        adminName: admin.full_name,
        action: 'EMAIL_RESENT',
        targetCertId: targetCert.id,
        targetUserId: targetCert.user_id,
        targetUserEmail: targetCert.student_email,
        details: `${admin.role} ${admin.full_name} resent certificate email for ${targetCert.certificate_number}.`,
      });
    }

    return emailRes;
  },

  // --- Email Logs ---
  async getEmailLogs(): Promise<EmailLog[]> {
    return [...globalStore.emailLogs].reverse();
  },

  // --- Audit Logs (Requirement 28) ---
  async recordAuditLog(params: {
    adminId: string;
    adminEmail: string;
    adminName: string;
    action: string;
    targetUserId?: string;
    targetUserEmail?: string;
    targetCertId?: string;
    previousValue?: string;
    newValue?: string;
    details: string;
  }): Promise<AuditLog> {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      admin_id: params.adminId,
      admin_email: params.adminEmail,
      admin_name: params.adminName,
      action: params.action,
      target_user_id: params.targetUserId,
      target_user_email: params.targetUserEmail,
      target_cert_id: params.targetCertId,
      previous_value: params.previousValue,
      new_value: params.newValue,
      details: params.details,
      created_at: new Date().toISOString(),
    };
    globalStore.auditLogs.unshift(log);
    return log;
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return [...globalStore.auditLogs];
  },

  // --- Admin Analytics ---
  async getAdminStats() {
    const allUsers = await this.getAllUsers();
    const students = allUsers.filter((p) => p.role === 'STUDENT');
    const courses = Array.from(globalStore.courses.values());
    const modules = Array.from(globalStore.modules.values());
    const attempts = globalStore.quizAttempts;
    const certs = Array.from(globalStore.certificates.values());

    const totalQuizScore = attempts.reduce((acc, curr) => acc + curr.percentage, 0);
    const avgQuizScore = attempts.length > 0 ? Number((totalQuizScore / attempts.length).toFixed(1)) : 0;

    return {
      totalStudents: students.length,
      activeStudents: students.length,
      totalUsers: allUsers.length,
      totalAdmins: allUsers.filter((p) => p.role === 'ADMIN' || p.role === 'SUPER_ADMIN').length,
      recentUsers: [...allUsers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10),
      totalCourses: courses.length,
      totalModules: modules.length,
      totalQuizAttempts: attempts.length,
      totalCertificates: certs.length,
      averageQuizScore: avgQuizScore,
    };
  },
};
