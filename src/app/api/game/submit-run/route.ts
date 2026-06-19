import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { mapRuns, journeyScores, profiles } from '@/db/schema';
import { desc, eq, ne } from 'drizzle-orm';
import { ensureProfileExists } from '@/lib/profile';

type BestByMap = {
  hanoi: number;
  tokyo: number;
  danang: number;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await ensureProfileExists(
        user.id,
        user.email || '',
        user.user_metadata?.full_name || '',
        user.user_metadata?.avatar_url || '',
      );
    } catch (profileErr) {
      console.error('[submit-run] Failed to ensure profile exists:', profileErr);
    }

    const body = await request.json();
    const mapKey = body.mapKey || 'hanoi';
    const score = body.score || 0;
    const completionTime = body.completionTime || 0;
    const bossCleared = body.bossCleared ?? true;

    const [insertedRun] = await db
      .insert(mapRuns)
      .values({
        userId: user.id,
        mapKey,
        score,
        completionTime,
        bossCleared,
      })
      .returning();

    let personalBestByMap: BestByMap = {
      hanoi: 0,
      tokyo: 0,
      danang: 0,
    };

    try {
      const [existingScores] = await db
        .select()
        .from(journeyScores)
        .where(eq(journeyScores.userId, user.id))
        .limit(1);

      if (existingScores) {
        const hanoiBest =
          mapKey === 'hanoi' ? Math.max(existingScores.hanoiBestScore, score) : existingScores.hanoiBestScore;
        const tokyoBest =
          mapKey === 'tokyo' ? Math.max(existingScores.tokyoBestScore, score) : existingScores.tokyoBestScore;
        const danangBest =
          mapKey === 'danang' ? Math.max(existingScores.danangBestScore, score) : existingScores.danangBestScore;
        const totalScore = hanoiBest + tokyoBest + danangBest;

        await db
          .update(journeyScores)
          .set({
            hanoiBestScore: hanoiBest,
            tokyoBestScore: tokyoBest,
            danangBestScore: danangBest,
            totalScore,
            updatedAt: new Date(),
          })
          .where(eq(journeyScores.userId, user.id));

        personalBestByMap = {
          hanoi: hanoiBest,
          tokyo: tokyoBest,
          danang: danangBest,
        };
      } else {
        const hanoiBest = mapKey === 'hanoi' ? score : 0;
        const tokyoBest = mapKey === 'tokyo' ? score : 0;
        const danangBest = mapKey === 'danang' ? score : 0;
        const totalScore = hanoiBest + tokyoBest + danangBest;

        await db
          .insert(journeyScores)
          .values({
            userId: user.id,
            hanoiBestScore: hanoiBest,
            tokyoBestScore: tokyoBest,
            danangBestScore: danangBest,
            totalScore,
            updatedAt: new Date(),
          })
          .onConflictDoNothing();

        personalBestByMap = {
          hanoi: hanoiBest,
          tokyo: tokyoBest,
          danang: danangBest,
        };
      }
    } catch (dbErr) {
      console.error('[submit-run] Failed to update journey_scores programmatically:', dbErr);
    }

    let rank = 0;
    let totalPlayers = 0;
    let myTotalScore = score;

    try {
      const allScores = await db
        .select({
          userId: journeyScores.userId,
          totalScore: journeyScores.totalScore,
        })
        .from(journeyScores)
        .innerJoin(profiles, eq(profiles.id, journeyScores.userId))
        .where(ne(profiles.role, 'admin'))
        .orderBy(desc(journeyScores.totalScore));

      totalPlayers = allScores.length;
      const myIndex = allScores.findIndex((item) => item.userId === user.id);
      rank = myIndex >= 0 ? myIndex + 1 : 0;

      const myScore = allScores.find((item) => item.userId === user.id);
      myTotalScore = myScore?.totalScore ?? score;
    } catch (rankErr) {
      console.error('[submit-run] rank query failed (non-fatal):', rankErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Lượt chơi đã được lưu thành công!',
      savedRun: insertedRun,
      data: insertedRun,
      personalBestByMap,
      overallRank: rank,
      totalRankedUsers: totalPlayers,
      rank,
      totalPlayers,
      totalScore: myTotalScore,
    });
  } catch (err: unknown) {
    console.error('Error submitting map run:', err);
    const message = err instanceof Error ? err.message : 'Lỗi lưu thông số lượt chơi';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
