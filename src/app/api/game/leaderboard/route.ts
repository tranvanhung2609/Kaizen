import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { profiles, journeyScores } from '@/db/schema';
import { eq, desc, ne, sql } from 'drizzle-orm';
import { ensureProfileExists } from '@/lib/profile';
import { extractDeptFromName } from '@/lib/profile-utils';

export async function GET(request: NextRequest) {
  try {
    // 1. Xác thực session người dùng
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Đảm bảo profile & journey_scores tồn tại
    try {
      await ensureProfileExists(
        user.id,
        user.email || '',
        user.user_metadata?.full_name || '',
        user.user_metadata?.avatar_url || ''
      );
    } catch (profileErr) {
      console.error('[leaderboard-api] Failed to ensure profile exists:', profileErr);
    }

    // 2. Lấy top 5 người chơi cho BXH nhanh (loại bỏ admin)
    const records = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        email: profiles.email,
        department: profiles.department,
        avatarUrl: profiles.avatarUrl,
        totalScore: sql<number>`COALESCE(${journeyScores.totalScore}, 0)`,
      })
      .from(profiles)
      .leftJoin(journeyScores, eq(profiles.id, journeyScores.userId))
      .where(ne(profiles.role, 'admin'))
      .orderBy(desc(sql`COALESCE(${journeyScores.totalScore}, 0)`))
      .limit(5);

    const topPlayers = records.map((r, idx) => ({
      rank: idx + 1,
      name: r.fullName || r.email.split('@')[0],
      dept: r.department || extractDeptFromName(r.fullName) || 'VTI',
      score: r.totalScore,
      avatar: r.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${r.id}`,
    }));

    // 3. Lấy kỷ lục cá nhân của người chơi hiện tại
    const [myScore] = await db
      .select({
        totalScore: journeyScores.totalScore,
        hanoiBestScore: journeyScores.hanoiBestScore,
        tokyoBestScore: journeyScores.tokyoBestScore,
        danangBestScore: journeyScores.danangBestScore,
      })
      .from(journeyScores)
      .where(eq(journeyScores.userId, user.id))
      .limit(1);

    const personalBest = myScore || {
      totalScore: 0,
      hanoiBestScore: 0,
      tokyoBestScore: 0,
      danangBestScore: 0,
    };

    return NextResponse.json({
      success: true,
      topPlayers,
      personalBest,
    });
  } catch (err: any) {
    console.error('Error fetching leaderboard/personal stats:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi lấy thông tin bảng xếp hạng' },
      { status: 500 }
    );
  }
}
