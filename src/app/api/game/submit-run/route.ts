import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { mapRuns, profiles } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 419 });
    }

    // 2. Parse request payload
    const body = await request.json();
    const {
      mapKey,
      score,
      completionTime,
      bossCleared,
    } = body;

    // 3. Insert map run to Supabase DB via Drizzle
    // The Supabase trigger 'trigger_on_map_run_insert' will automatically update journey_scores
    const [insertedRun] = await db.insert(mapRuns).values({
      userId: user.id,
      mapKey,
      score,
      completionTime,
      bossCleared,
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Lượt chơi đã được lưu thành công!',
      data: insertedRun
    });
  } catch (err: any) {
    console.error('Error submitting map run:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi lưu thông số lượt chơi' },
      { status: 500 }
    );
  }
}
