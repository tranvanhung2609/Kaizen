import { db } from '@/db';
import { profiles, journeyScores } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { extractDeptFromName } from './profile-utils';

/**
 * Đảm bảo người dùng tồn tại trong bảng profiles và journey_scores để tránh lỗi khoá ngoại (FK).
 */
export async function ensureProfileExists(
  userId: string,
  email: string,
  fullName?: string | null,
  avatarUrl?: string | null
) {
  try {
    // 1. Kiểm tra xem profile đã tồn tại chưa
    const [existing] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (existing) {
      return existing;
    }

    // 2. Trích xuất phòng ban từ full_name hoặc email
    const name = fullName || email.split('@')[0];
    const dept = extractDeptFromName(name);

    // 3. Chèn profile (sử dụng onConflictDoNothing đề phòng xung đột ghi song song)
    await db
      .insert(profiles)
      .values({
        id: userId,
        email: email.trim(),
        fullName: name.trim(),
        avatarUrl: avatarUrl || '',
        department: dept,
        role: 'user',
      })
      .onConflictDoNothing();

    // Lấy lại record sau khi chèn hoặc nếu đã được chèn bởi tiến trình khác
    const [newProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    // 4. Đảm bảo bản ghi điểm journey_scores cũng tồn tại
    await db
      .insert(journeyScores)
      .values({
        userId,
        totalScore: 0,
        hanoiBestScore: 0,
        tokyoBestScore: 0,
        danangBestScore: 0,
      })
      .onConflictDoNothing();

    return newProfile;
  } catch (err) {
    console.error('[ensureProfileExists] Error:', err);
    throw err;
  }
}

