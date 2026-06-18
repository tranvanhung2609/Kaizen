import { requireAuth } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import AdminScoreManager from '@/components/admin/AdminScoreManager';
import { db } from '@/db';
import { profiles, journeyScores } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { extractDeptFromName } from '@/lib/profile-utils';

export const revalidate = 0; // Dynamic rendering

export default async function AdminPage() {
  const user = await requireAuth();

  // Load the current user's profile to check their role
  let dbProfile = {
    id: user.id,
    email: user.email,
    fullName: user.user_metadata?.full_name || '',
    avatarUrl: user.user_metadata?.avatar_url || '',
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
        role: profile.role || 'user',
      };
      department = profile.department || extractDeptFromName(profile.fullName);
    }
  } catch (err) {
    console.error('Failed to load profile for admin page checking:', err);
  }

  // Security guard: Only role === 'admin' can access
  if (dbProfile.role !== 'admin') {
    redirect('/game');
  }

  // Fetch all user scores & profiles (including admins so we can manage all accounts, but mostly normal users)
  let userScores: any[] = [];
  try {
    const records = await db
      .select({
        id: profiles.id,
        email: profiles.email,
        fullName: profiles.fullName,
        department: profiles.department,
        role: profiles.role,
        totalScore: journeyScores.totalScore,
        hanoiBestScore: journeyScores.hanoiBestScore,
        tokyoBestScore: journeyScores.tokyoBestScore,
        danangBestScore: journeyScores.danangBestScore,
      })
      .from(profiles)
      .leftJoin(journeyScores, eq(profiles.id, journeyScores.userId))
      .orderBy(desc(journeyScores.totalScore));

    userScores = records.map((u) => ({
      ...u,
      department: u.department || extractDeptFromName(u.fullName) || '',
    }));
  } catch (err) {
    console.error('Failed to query user scores for admin panel:', err);
  }

  return (
    <div className="flex flex-col min-h-screen bg-navy-dark text-slate-100 font-sans">
      <Navbar user={dbProfile} department={department || 'Admin Panel'} />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6 relative">
        {/* Background glowing orb */}
        <div className="absolute top-1/4 right-1/4 translate-x-1/2 w-[350px] h-[350px] rounded-full bg-brand-cyan/5 blur-[100px] pointer-events-none" />

        <div className="flex flex-col gap-1.5 z-10">
          <h1 className="text-3xl font-extrabold font-display text-white tracking-wide uppercase">
            HỆ THỐNG QUẢN TRỊ KAIZEN JOURNEY
          </h1>
          <p className="text-sm text-slate-400">
            Xem, tìm kiếm và điều chỉnh trực tiếp điểm số của các chiến binh VTI chặng đường 9 năm Adventure.
          </p>
        </div>

        <div className="z-10">
          <AdminScoreManager initialUserScores={userScores} />
        </div>
      </main>
    </div>
  );
}
