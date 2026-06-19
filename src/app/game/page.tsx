import { requireAuth } from '@/lib/auth';
import { db } from '@/db';
import { profiles, journeyScores } from '@/db/schema';
import { eq, desc, ne, sql } from 'drizzle-orm';
import Navbar from '@/components/Navbar';
import GameClientWrapper from './GameClientWrapper';
import { ensureProfileExists } from '@/lib/profile';
import { extractDeptFromName } from '@/lib/profile-utils';

export default async function GamePage() {
  // Guard the page and get the authenticated VTI user
  const user = await requireAuth();

  // Đảm bảo profile và journey_score tồn tại trong DB để tránh lỗi FK khi chơi/submit điểm
  let profile = null;
  try {
    profile = await ensureProfileExists(
      user.id,
      user.email || '',
      user.user_metadata?.full_name || '',
      user.user_metadata?.avatar_url || ''
    );
  } catch (err) {
    console.error('Failed to ensure profile exists:', err);
  }

  // Load the user's profile to extract details
  let dbProfile = {
    id: user.id,
    email: user.email || '',
    fullName: user.user_metadata?.full_name || '',
    avatarUrl: user.user_metadata?.avatar_url || '',
    role: 'user',
  };
  let department = '';

  if (profile) {
    dbProfile = {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName || '',
      avatarUrl: profile.avatarUrl || '',
      role: profile.role || 'user',
    };
    department = profile.department || extractDeptFromName(profile.fullName);
  } else {
    department = extractDeptFromName(dbProfile.fullName);
  }


  // Fetch top 5 players for the quick mini-leaderboard
  let topPlayers: any[] = [];
  try {
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

    topPlayers = records.map((r, idx) => ({
      rank: idx + 1,
      name: r.fullName || r.email.split('@')[0],
      dept: r.department || extractDeptFromName(r.fullName) || 'VTI',
      score: r.totalScore,
      avatar: r.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${r.id}`,
    }));
  } catch (err) {
    console.error('Failed to load top players for mini-leaderboard:', err);
  }

  // Pass user details to the Client component which handles the Phaser lifecycle
  const userDetails = {
    id: user.id,
    email: user.email,
  };

  return (
    <div className="flex flex-col min-h-screen bg-navy-dark text-slate-100">
      <Navbar user={dbProfile} department={department} />
      
      <main className="flex-1 flex flex-col items-stretch justify-start p-2 md:p-3 relative overflow-x-hidden">
        <GameClientWrapper userDetails={userDetails} topPlayers={topPlayers} />
      </main>
    </div>
  );
}

