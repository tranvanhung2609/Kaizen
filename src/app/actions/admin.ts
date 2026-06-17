'use server';

import { db } from '@/db';
import { journeyScores, mapRuns, profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Kiểm tra xem người dùng hiện tại có phải là Admin hay không
 */
async function assertAdmin() {
  const user = await requireAuth();
  
  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (!profile || profile.role !== 'admin') {
    throw new Error('Bạn không có quyền thực hiện hành động này.');
  }

  return user;
}

/**
 * Reset toàn bộ điểm số của người chơi
 */
export async function resetUserScoreAction(userId: string) {
  await assertAdmin();

  try {
    // 1. Reset journey scores
    await db
      .update(journeyScores)
      .set({
        totalScore: 0,
        hanoiBestScore: 0,
        tokyoBestScore: 0,
        danangBestScore: 0,
        updatedAt: new Date(),
      })
      .where(eq(journeyScores.userId, userId));

    // 2. Xóa các lượt chơi trong mapRuns
    await db
      .delete(mapRuns)
      .where(eq(mapRuns.userId, userId));

    revalidatePath('/leaderboard');
    revalidatePath('/admin');
    revalidatePath('/game');

    return { success: true };
  } catch (error: any) {
    console.error('Failed to reset user scores:', error);
    return { success: false, error: error.message || 'Lỗi hệ thống khi reset điểm.' };
  }
}

/**
 * Cập nhật trực tiếp điểm số của người chơi
 */
export async function updateUserScoreAction(
  userId: string,
  scores: { hanoi: number; tokyo: number; danang: number }
) {
  await assertAdmin();

  try {
    const total = scores.hanoi + scores.tokyo + scores.danang;

    // 1. Cập nhật journey_scores
    await db
      .update(journeyScores)
      .set({
        hanoiBestScore: scores.hanoi,
        tokyoBestScore: scores.tokyo,
        danangBestScore: scores.danang,
        totalScore: total,
        updatedAt: new Date(),
      })
      .where(eq(journeyScores.userId, userId));

    revalidatePath('/leaderboard');
    revalidatePath('/admin');
    revalidatePath('/game');

    return { success: true };
  } catch (error: any) {
    console.error('Failed to update user scores:', error);
    return { success: false, error: error.message || 'Lỗi hệ thống khi cập nhật điểm.' };
  }
}
