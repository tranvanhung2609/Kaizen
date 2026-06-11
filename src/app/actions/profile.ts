'use server';

import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateProfile(data: {
  fullName?: string;
  nickname?: string;
  age?: number;
  department?: string;
}) {
  // Enforce authentication
  const user = await requireAuth();

  try {
    const updateData: Partial<typeof profiles.$inferInsert> = {};

    if (data.fullName !== undefined) updateData.fullName = data.fullName.trim();
    if (data.nickname !== undefined) updateData.nickname = data.nickname.trim();
    if (data.age !== undefined) updateData.age = data.age;
    if (data.department !== undefined) updateData.department = data.department.trim();

    // Perform database update
    await db
      .update(profiles)
      .set(updateData)
      .where(eq(profiles.id, user.id));

    // Revalidate paths to refresh cached UI
    revalidatePath('/game');
    revalidatePath('/leaderboard');

    return { success: true };
  } catch (error: any) {
    console.error('Failed to update user profile:', error);
    return { success: false, error: error.message || 'Có lỗi xảy ra khi cập nhật thông tin.' };
  }
}
