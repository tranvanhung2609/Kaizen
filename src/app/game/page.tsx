import { requireAuth } from '@/lib/auth';
import { db } from '@/db';
import { profiles, journeyScores } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import Navbar from '@/components/Navbar';
import GameClientWrapper from './GameClientWrapper';

export default async function GamePage() {
  // Guard the page and get the authenticated VTI user
  const user = await requireAuth();

  // Try to load the user's profile to extract details
  let dbProfile = {
    id: user.id,
    email: user.email,
    fullName: user.user_metadata?.full_name || '',
    avatarUrl: user.user_metadata?.avatar_url || '',
    nickname: '',
    age: undefined as number | undefined,
    role: 'user',
  };
  let department = '';

  try {
    const [profile] = await db
      .select({
        id: profiles.id,
        email: profiles.email,
        fullName: profiles.fullName,
        avatarUrl: profiles.avatarUrl,
        department: profiles.department,
        nickname: profiles.nickname,
        age: profiles.age,
        role: profiles.role,
      })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (profile) {
      dbProfile = {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName || '',
        avatarUrl: profile.avatarUrl || '',
        nickname: profile.nickname || '',
        age: profile.age ?? undefined,
        role: profile.role || 'user',
      };
      department = profile.department;
    }
  } catch (err) {
    console.error('Failed to load profile from DB, falling back:', err);
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
        totalScore: journeyScores.totalScore,
      })
      .from(profiles)
      .innerJoin(journeyScores, eq(profiles.id, journeyScores.userId))
      .orderBy(desc(journeyScores.totalScore))
      .limit(5);

    topPlayers = records.map((r, idx) => ({
      rank: idx + 1,
      name: r.fullName || r.email.split('@')[0],
      dept: r.department || 'VTI',
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

