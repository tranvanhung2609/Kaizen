'use server';

import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { ensureProfileExists } from '@/lib/profile';

export async function updateProfile(data: {
  fullName?: string;
  department?: string;
}) {
  // Enforce authentication
  const user = await requireAuth();

  // Đảm bảo profile và journey_score tồn tại trong database trước khi cập nhật
  try {
    await ensureProfileExists(
      user.id,
      user.email || '',
      user.user_metadata?.full_name || '',
      user.user_metadata?.avatar_url || ''
    );
  } catch (profileErr) {
    console.error('[updateProfile] Failed to ensure profile exists:', profileErr);
  }

  try {
    const updateData: Partial<typeof profiles.$inferInsert> = {};


    if (data.fullName !== undefined) updateData.fullName = data.fullName.trim();
    if (data.department !== undefined) updateData.department = data.department.trim();

    // Perform database update
    await db
      .update(profiles)
      .set(updateData)
      .where(eq(profiles.id, user.id));

    // Revalidate paths to refresh cached UI
    revalidatePath('/game');
    revalidatePath('/leaderboard');
    revalidatePath('/admin');

    return { success: true };
  } catch (error: any) {
    console.error('Failed to update user profile:', error);
    return { success: false, error: error.message || 'Có lỗi xảy ra khi cập nhật thông tin.' };
  }
}
