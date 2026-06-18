import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { mapRuns, journeyScores } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request payload
    const body = await request.json();
    const {
      mapKey,
      score,
      completionTime,
      bossCleared,
      // flasksCollected nhận từ client — dùng trong response, không lưu DB (schema chưa có column này)
    } = body;

    // 3. Insert map run — Supabase trigger `trigger_on_map_run_insert` sẽ tự cập nhật journey_scores
    const [insertedRun] = await db.insert(mapRuns).values({
      userId: user.id,
      mapKey: mapKey || 'hanoi',
      score: score || 0,
      completionTime: completionTime || 0,
      bossCleared: bossCleared ?? true,
    }).returning();

    // 4. Query rank player sau khi trigger chạy (trigger sync trong same txn)
    let rank = 0;
    let totalPlayers = 0;
    let myTotalScore = score;

    try {
      // Lấy tất cả journey_scores, sort theo totalScore để tính rank
      const allScores = await db
        .select({ userId: journeyScores.userId, totalScore: journeyScores.totalScore })
        .from(journeyScores)
        .orderBy(desc(journeyScores.totalScore));

      totalPlayers = allScores.length;
      const myIdx = allScores.findIndex((s) => s.userId === user.id);
      rank = myIdx >= 0 ? myIdx + 1 : totalPlayers;

      // Lấy tổng điểm mới nhất của user (sau khi trigger update)
      const myScore = allScores.find((s) => s.userId === user.id);
      myTotalScore = myScore?.totalScore ?? score;
    } catch (rankErr) {
      console.error('[submit-run] rank query failed (non-fatal):', rankErr);
      // Không fail toàn bộ request nếu rank query lỗi
    }

    return NextResponse.json({
      success: true,
      message: 'Lượt chơi đã được lưu thành công!',
      data: insertedRun,
      rank,
      totalPlayers,
      totalScore: myTotalScore,
    });
  } catch (err: any) {
    console.error('Error submitting map run:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi lưu thông số lượt chơi' },
      { status: 500 }
    );
  }
}
