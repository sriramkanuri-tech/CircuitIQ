import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { CourseProgress, QuizAttempt } from '@/types';
import { createAdminClient } from '@/lib/supabase/admin';

const PROGRESS_FILE_PATH = path.join(process.cwd(), 'data', 'progress.json');

interface ProgressStore {
  progress: CourseProgress[];
  attempts: QuizAttempt[];
}

function getStoredProgress(): ProgressStore {
  try {
    if (!fs.existsSync(PROGRESS_FILE_PATH)) {
      return { progress: [], attempts: [] };
    }
    const raw = fs.readFileSync(PROGRESS_FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading progress.json:', e);
    return { progress: [], attempts: [] };
  }
}

function saveStoredProgress(data: ProgressStore) {
  try {
    const dir = path.dirname(PROGRESS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PROGRESS_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving progress.json:', e);
  }
}

// GET /api/progress?userId=...&courseId=...&type=progress|attempts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const type = searchParams.get('type');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const stored = getStoredProgress();

    // Sync from Supabase if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isRealSupabase = supabaseUrl && !supabaseUrl.includes('placeholder');
    if (isRealSupabase) {
      try {
        const supabase = createAdminClient();
        if (type === 'progress' || !type) {
          const { data: rows } = await supabase
            .from('course_progress')
            .select('*')
            .eq('user_id', userId);
          if (Array.isArray(rows) && rows.length > 0) {
            rows.forEach((r: any) => {
              const idx = stored.progress.findIndex(
                (p) => p.user_id === r.user_id && p.module_id === r.module_id
              );
              if (idx >= 0) {
                stored.progress[idx] = r;
              } else {
                stored.progress.push(r);
              }
            });
          }
        }
      } catch (err) {
        console.warn('Supabase progress fetch warning:', err);
      }
    }

    if (type === 'attempts') {
      const userAttempts = stored.attempts.filter((a) => a.user_id === userId);
      return NextResponse.json({ attempts: userAttempts });
    }

    let userProgress = stored.progress.filter((p) => p.user_id === userId);
    if (courseId) {
      userProgress = userProgress.filter((p) => p.course_id === courseId);
    }

    return NextResponse.json({
      progress: userProgress,
      attempts: stored.attempts.filter((a) => a.user_id === userId),
    });
  } catch (error: any) {
    console.error('GET /api/progress error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/progress - Save progress or quiz attempt
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, progressItem, attemptItem } = body;

    const stored = getStoredProgress();

    if (action === 'save_progress' && progressItem) {
      const idx = stored.progress.findIndex(
        (p) => p.user_id === progressItem.user_id && p.module_id === progressItem.module_id
      );
      if (idx >= 0) {
        stored.progress[idx] = progressItem;
      } else {
        stored.progress.push(progressItem);
      }
      saveStoredProgress(stored);

      // Supabase sync
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isRealSupabase = supabaseUrl && !supabaseUrl.includes('placeholder');
      if (isRealSupabase) {
        try {
          const supabase = createAdminClient();
          await supabase.from('course_progress').upsert(progressItem);
        } catch (err) {
          console.warn('Supabase progress upsert warning:', err);
        }
      }

      return NextResponse.json({ success: true, progress: progressItem });
    }

    if (action === 'save_attempt' && attemptItem) {
      stored.attempts.push(attemptItem);
      saveStoredProgress(stored);

      // Supabase sync
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isRealSupabase = supabaseUrl && !supabaseUrl.includes('placeholder');
      if (isRealSupabase) {
        try {
          const supabase = createAdminClient();
          await supabase.from('quiz_attempts').upsert(attemptItem);
        } catch (err) {
          console.warn('Supabase attempt upsert warning:', err);
        }
      }

      return NextResponse.json({ success: true, attempt: attemptItem });
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (error: any) {
    console.error('POST /api/progress error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
