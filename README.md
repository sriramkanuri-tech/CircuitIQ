# CircuitIQ: Analog Electronics Learning, Assessment & Certification Platform

> **"Learn Circuits. Build Intelligence. Earn Certification."**  
> *Alternative Tagline: Understand. Analyze. Master.*

CircuitIQ is an engineering-grade, production-quality educational technology platform specifically tailored for mastering **Analog Electronic Circuits**. The platform empowers students, engineering candidates, and practicing hardware professionals to study structured lessons, engage with interactive circuit schematics, test competency via 15-question module quizzes, complete a timed 30-minute final assessment, and earn a tamper-evident, cryptographically verified digital PDF certificate equipped with a public QR code.

---

## 1. System Architecture & Tech Stack

```
                          [ Client Browser ]
                                  │
                                  ▼
                     [ Next.js 14 App Router ]
           (TypeScript, Tailwind CSS, Lucide Icons, jsPDF, QRCode)
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
   [ Server Actions & Services ]          [ Transactional Email ]
                 │                             (Resend API)
                 ▼                                 │
     [ Supabase PostgreSQL DB ]                    ▼
    ├── Authentication (Profiles)          [ Student Mailbox ]
    ├── Courses, Modules, Questions         (PDF Certificate)
    ├── Course Progress & Quiz Attempts
    ├── Final Assessments & Certificates
    └── Storage Bucket (certificates)
```

- **Frontend & App Framework**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Circuit Visualization**: Interactive SVG schematic CAD viewer with active test point analysis (TP1, TP2, TP3) and real-time AC sine wave oscilloscope reticles.
- **Database & Auth**: Supabase PostgreSQL with strict Row Level Security (RLS) policies, triggers, and foreign keys. (Integrated zero-config persistent memory-fallback for immediate local testing).
- **Certificate Engine**: Server-side landscape PDF generator built on `jspdf` and `qrcode` delivering vector borders, IC graphics, signatures, and verifiable QR codes.
- **Email Delivery**: Modular Resend integration dispatching HTML credentials with PDF attachments and logging to `email_logs`.

---

## 2. Platform Authentication & Administrative Architecture

CircuitIQ uses a secure role-based hierarchy enforced via Supabase Auth and database RLS triggers:

- **Permanent Platform Owner / Super Admin**:
  - **Account**: `sriramkanuri4@gmail.com`
  - **Privileges**: Irrevocable platform ownership. Server-side triggers and application guards prohibit demotion, suspension, or deletion of this account by any party.
  - **Super Admin Capabilities**: Full administrative rights plus exclusive access to the **Admin Management** directory (`/admin/admins`) to promote students to administrators and demote administrators back to students.
- **Administrator Role (`ADMIN`)**:
  - Promoted by the Super Admin.
  - Access to course management, question banks, student registry, manual certificate generation (`AE-2026-XXXXXXXX`), certificate revocation, certificate regeneration, and transactional email logs.
- **Student Role (`STUDENT`)**:
  - Registered via the standard onboarding portal (`/register`) with full institutional credentials (Full Name, College / University, Student ID, Mobile, Password).
  - Access to coursework, interactive quizzes, final assessment, progress tracking, and digital certificate downloads.

---

## 3. Platform Routes & Sitemap

### Public Pages
- `/` — Modern engineering landing page with interactive schematic CAD analyzer and live certificate lookup.
- `/about` — Platform mission, academic scope, and educational provisions.
- `/courses` — Course catalog.
- `/courses/analog-electronic-circuits` — Complete 15-module curriculum with progress tracking and exam unlock status.
- `/courses/analog-electronic-circuits/modules/[moduleId]` — In-depth technical theory, governing equations, SVG circuit diagrams, working principles, practical notes, and quiz launching.
- `/verify` — Public certificate search and credential registry.
- `/verify/[certificateId]` — Zero-login public verification endpoint displaying student name, course, score, date, and status (`VALID` or `REVOKED`).
- `/contact` — Academic support and partnership inquiry form.
- `/login` — Secure student & administrator sign-in.
- `/register` — Student onboarding with academic ID and password strength validation.
- `/forgot-password` & `/reset-password` — Credential recovery workflow.

### Student Portal
- `/dashboard` — Course progress bar, continuing learning banner, recent quiz scorecards, and issued certificate cards.
- `/my-courses` — Enrolled curriculum management.
- `/quiz/[moduleId]` — 15-question MCQ interface with question navigation, progress bar, instant grading, 70% passing threshold, and technical explanations.
- `/final-assessment/[courseId]` — 30-question synthesis examination with 30-minute countdown timer, automated PDF generation, and confetti celebration.
- `/results` — Complete transcript of quiz attempts and performance percentages.
- `/certificates` — Digital credentials with direct PDF download and shareable verification links.
- `/profile` — Student dossier management.
- `/settings` — Notification preferences and session security.

### Executive Administration
- `/admin` — Top-line metrics (Total Students, Active Students, Courses, Modules, Quiz Attempts, Certificates, Class Average) and cohort progress charts.
- `/admin/courses` — Course publishing and parameter configuration.
- `/admin/modules` — Module reordering, sequencing, and content editing.
- `/admin/questions` — Question bank management with module filtering, distractor authoring, and answer keys.
- `/admin/students` — Student registry auditing without password exposure.
- `/admin/certificates` — Certificate registry with PDF inspection, email re-dispatch, and cryptographic revocation.
- `/admin/email-logs` — Outbound dispatch audit log.

---

## 4. Course Curriculum: Analog Electronic Circuits

1. **Introduction to Analog Electronics** — Continuous signals, SNR, dynamic range, thermal noise, Thevenin equivalents.
2. **Semiconductor Fundamentals** — Energy band theory, silicon/GaAs bandgap, mass-action law, Einstein relation.
3. **PN Junction Diode** — Depletion region, built-in barrier potential, Shockley equation, dynamic resistance.
4. **Rectifiers and Filters** — Half-wave, full-wave center-tapped, bridge rectifiers, ripple factor, TUF, capacitor smoothing.
5. **Zener Diode** — Quantum tunneling vs avalanche breakdown, line/load regulation, zero-tempco reference at 5.6V.
6. **BJT Fundamentals** — NPN/PNP physics, active/cutoff/saturation regions, alpha/beta gains, Early effect.
7. **BJT Biasing** — Q-point design, DC load line, voltage divider bias with emitter degeneration, stability factor S.
8. **BJT Amplifiers** — Hybrid-pi small-signal models, Common Emitter (CE), Common Collector (CC buffer), Common Base (CB).
9. **FET and MOSFET** — JFET pinch-off, enhancement/depletion MOSFETs, threshold voltage Vth, square-law saturation.
10. **Operational Amplifiers** — Ideal op-amp rules, virtual short, CMRR, slew rate, gain-bandwidth product (GBW).
11. **Op-Amp Applications** — Inverting/non-inverting amplifiers, virtual ground summing, integrators, instrumentation amplifiers.
12. **Feedback Amplifiers** — Negative feedback, Black model, 4 topologies (voltage/current series/shunt), stability.
13. **Oscillators** — Barkhausen criteria, RC phase shift, Wien bridge, Colpitts LC, quartz crystal resonators.
14. **Power Amplifiers** — Classes A, B, AB, C, D, crossover distortion, push-pull stages, heatsink thermal resistance.
15. **Final Assessment** — 30-item cumulative examination (30 minutes, 70% passing grade for certification).

---

## 5. Database Schema & Migration

The complete database migration script is located at:
[`supabase/migrations/001_initial_schema.sql`](file:///c:/Users/srira/OneDrive/Desktop/CircuitQ/supabase/migrations/001_initial_schema.sql)

It configures:
- Tables: `profiles`, `courses`, `modules`, `questions`, `course_progress`, `quiz_attempts`, `quiz_answers`, `final_assessments`, `final_assessment_answers`, `certificates`, `email_logs`.
- Row Level Security (RLS) policies on all tables ensuring students can only access their own data, while administrators have full management access.
- Automatic profile provisioning triggers upon auth user registration.
- Storage bucket configuration (`certificates`) with public read access.

---

## 6. How to Run Locally

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server on port 3000
npm run start
```
Open **`http://localhost:3000`** in your browser to explore CircuitIQ.
#   C i r c u i t I Q  
 #   C i r c u i t I Q  
 #   C i r c u i t I Q  
 