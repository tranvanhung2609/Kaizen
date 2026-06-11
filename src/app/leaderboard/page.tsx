import { requireAuth } from '@/lib/auth';
import { db } from '@/db';
import { journeyScores, profiles, mapRuns } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import Navbar from '@/components/Navbar';
import LeaderboardClient from '@/components/leaderboard/LeaderboardClient';

export const revalidate = 0;

interface LeaderboardPageProps {
  searchParams: Promise<{ tab?: string; scope?: string }>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

/** Dùng cho scope Phòng Ban + VTI Tổng: mỗi row là 1 user với điểm cao nhất */
export interface PlayerRow {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  department: string;
  hanoiScore: number;
  tokyoScore: number;
  danangScore: number;
  totalScore: number;
  hasPlayed: boolean; // true nếu đã từng chơi (score > 0)
  isCurrentUser: boolean;
}

/** Dùng cho scope VTI Tổng: mỗi row là 1 phòng ban */
export interface DeptRow {
  rank: number;
  deptName: string;
  memberCount: number;
  hanoiBest: number;
  tokyoBest: number;
  danangBest: number;
  avgTotal: number;
  maxTotal: number;
  hasPlayed: boolean;
  isCurrentDept: boolean;
}

/** Dùng cho scope Cá Nhân: mỗi row là 1 lượt chơi của user hiện tại */
export interface RunRow {
  id: string;
  mapKey: string;
  mapName: string;
  score: number;
  flasksCollected: number;
  heartsRemaining: number;
  completionTime: number;
  bossCleared: boolean;
  playedAt: string; // ISO string
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const currentTab   = (params.tab   || 'overall') as 'overall' | 'hanoi' | 'tokyo' | 'danang';
  const currentScope = (params.scope || 'personal') as 'personal' | 'department' | 'vti';

  // ── 1. Load current user's profile ──────────────────────────────────────────
  let dbProfile = {
    id: user.id,
    email: user.email ?? '',
    fullName: user.user_metadata?.full_name || '',
    avatarUrl: user.user_metadata?.avatar_url || '',
    age: undefined as number | undefined,
    role: 'user',
  };
  let myDept = '';

  try {
    const [profile] = await db
      .select({ id: profiles.id, email: profiles.email, fullName: profiles.fullName,
                avatarUrl: profiles.avatarUrl, department: profiles.department,
                age: profiles.age, role: profiles.role })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (profile) {
      dbProfile = {
        id: profile.id, email: profile.email,
        fullName: profile.fullName || '', avatarUrl: profile.avatarUrl || '',
        age: profile.age ?? undefined, role: profile.role || 'user',
      };
      myDept = profile.department || '';
    }
  } catch (err) {
    console.error('[Leaderboard] profile load error:', err);
  }

  // ── 2. Query data ────────────────────────────────────────────────────────────

  let runRows:      RunRow[]    = [];
  let playerRows:   PlayerRow[] = [];
  let deptRows:     DeptRow[]   = [];
  let myRank = 0;
  let myRunCount = 0;

  try {
    // ── Scope: CÁ NHÂN — lịch sử chơi của user hiện tại ──────────────────────
    if (currentScope === 'personal') {
      const mapNameMap: Record<string, string> = {
        hanoi: 'Hà Nội', tokyo: 'Tokyo', danang: 'Đà Nẵng',
      };

      const runs = await db
        .select({
          id: mapRuns.id,
          mapKey: mapRuns.mapKey,
          score: mapRuns.score,
          flasksCollected: mapRuns.flasksCollected,
          heartsRemaining: mapRuns.heartsRemaining,
          completionTime: mapRuns.completionTime,
          bossCleared: mapRuns.bossCleared,
          createdAt: mapRuns.createdAt,
        })
        .from(mapRuns)
        .where(eq(mapRuns.userId, user.id))
        .orderBy(desc(mapRuns.createdAt))
        .limit(100);

      runRows = runs.map((r) => ({
        id: r.id,
        mapKey: r.mapKey,
        mapName: mapNameMap[r.mapKey] || r.mapKey,
        score: r.score,
        flasksCollected: r.flasksCollected,
        heartsRemaining: r.heartsRemaining,
        completionTime: r.completionTime,
        bossCleared: r.bossCleared,
        playedAt: r.createdAt.toISOString(),
      }));

      myRunCount = runRows.length;

    // ── Scope: PHÒNG BAN — tất cả user cùng dept, điểm cao nhất ──────────────
    } else if (currentScope === 'department') {
      // Lấy TẤT CẢ users cùng phòng ban từ profiles (LEFT JOIN journeyScores)
      // Kể cả user chưa chơi (score = 0)
      const records = await db
        .select({
          id: profiles.id,
          fullName: profiles.fullName,
          avatarUrl: profiles.avatarUrl,
          department: profiles.department,
          email: profiles.email,
          totalScore:      sql<number>`COALESCE(${journeyScores.totalScore}, 0)`,
          hanoiBestScore:  sql<number>`COALESCE(${journeyScores.hanoiBestScore}, 0)`,
          tokyoBestScore:  sql<number>`COALESCE(${journeyScores.tokyoBestScore}, 0)`,
          danangBestScore: sql<number>`COALESCE(${journeyScores.danangBestScore}, 0)`,
        })
        .from(profiles)
        .leftJoin(journeyScores, eq(profiles.id, journeyScores.userId))
        .where(myDept ? eq(profiles.department, myDept) : sql`1=1`)
        .orderBy(
          currentTab === 'hanoi'  ? desc(sql`COALESCE(${journeyScores.hanoiBestScore}, 0)`) :
          currentTab === 'tokyo'  ? desc(sql`COALESCE(${journeyScores.tokyoBestScore}, 0)`) :
          currentTab === 'danang' ? desc(sql`COALESCE(${journeyScores.danangBestScore}, 0)`) :
                                    desc(sql`COALESCE(${journeyScores.totalScore}, 0)`)
        )
        .limit(200);

      playerRows = records.map((r, idx) => ({
        rank: idx + 1,
        userId: r.id,
        name: r.fullName || r.email.split('@')[0],
        avatar: r.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${r.id}`,
        department: r.department || myDept,
        hanoiScore:  Number(r.hanoiBestScore),
        tokyoScore:  Number(r.tokyoBestScore),
        danangScore: Number(r.danangBestScore),
        totalScore:  Number(r.totalScore),
        hasPlayed:   Number(r.totalScore) > 0,
        isCurrentUser: r.id === user.id,
      }));

      myRank = playerRows.find((r) => r.isCurrentUser)?.rank ?? 0;

    // ── Scope: VTI TỔNG — tất cả users, group theo phòng ban ─────────────────
    } else {
      // Lấy TẤT CẢ users (LEFT JOIN) để kể cả người chưa chơi
      const records = await db
        .select({
          id: profiles.id,
          department: profiles.department,
          totalScore:      sql<number>`COALESCE(${journeyScores.totalScore}, 0)`,
          hanoiBestScore:  sql<number>`COALESCE(${journeyScores.hanoiBestScore}, 0)`,
          tokyoBestScore:  sql<number>`COALESCE(${journeyScores.tokyoBestScore}, 0)`,
          danangBestScore: sql<number>`COALESCE(${journeyScores.danangBestScore}, 0)`,
        })
        .from(profiles)
        .leftJoin(journeyScores, eq(profiles.id, journeyScores.userId))
        .limit(500);

      // Aggregate by department
      const deptMap: Record<string, {
        count: number; playedCount: number;
        totalSum: number;
        hanoiBest: number; tokyoBest: number; danangBest: number; maxTotal: number;
      }> = {};

      for (const r of records) {
        const key = r.department || 'Chưa cập nhật';
        if (!deptMap[key]) {
          deptMap[key] = { count: 0, playedCount: 0, totalSum: 0,
                           hanoiBest: 0, tokyoBest: 0, danangBest: 0, maxTotal: 0 };
        }
        const d = deptMap[key];
        const total = Number(r.totalScore);
        d.count++;
        if (total > 0) d.playedCount++;
        d.totalSum   += total;
        d.hanoiBest   = Math.max(d.hanoiBest,  Number(r.hanoiBestScore));
        d.tokyoBest   = Math.max(d.tokyoBest,  Number(r.tokyoBestScore));
        d.danangBest  = Math.max(d.danangBest, Number(r.danangBestScore));
        d.maxTotal    = Math.max(d.maxTotal,   total);
      }

      // Sort by chosen metric
      const sorted = Object.entries(deptMap).sort(([, a], [, b]) => {
        const av = currentTab === 'hanoi' ? a.hanoiBest :
                   currentTab === 'tokyo' ? a.tokyoBest :
                   currentTab === 'danang' ? a.danangBest :
                   (a.playedCount > 0 ? Math.round(a.totalSum / a.playedCount) : 0);
        const bv = currentTab === 'hanoi' ? b.hanoiBest :
                   currentTab === 'tokyo' ? b.tokyoBest :
                   currentTab === 'danang' ? b.danangBest :
                   (b.playedCount > 0 ? Math.round(b.totalSum / b.playedCount) : 0);
        return bv - av;
      });

      deptRows = sorted.map(([deptName, s], idx) => ({
        rank: idx + 1,
        deptName,
        memberCount: s.count,
        hanoiBest:  s.hanoiBest,
        tokyoBest:  s.tokyoBest,
        danangBest: s.danangBest,
        avgTotal:   s.playedCount > 0 ? Math.round(s.totalSum / s.playedCount) : 0,
        maxTotal:   s.maxTotal,
        hasPlayed:  s.playedCount > 0,
        isCurrentDept: deptName === myDept,
      }));

      myRank = deptRows.find((r) => r.isCurrentDept)?.rank ?? 0;
    }
  } catch (err) {
    console.error('[Leaderboard] query error:', err);
  }

  return (
    <div className="flex flex-col min-h-screen bg-navy-dark text-slate-100">
      <Navbar user={dbProfile} department={myDept} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6 relative">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-brand-cyan/4 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-brand-red/4 blur-[100px] pointer-events-none" />

        <LeaderboardClient
          currentTab={currentTab}
          currentScope={currentScope}
          myDept={myDept}
          myRank={myRank}
          myRunCount={myRunCount}
          runRows={runRows}
          playerRows={playerRows}
          deptRows={deptRows}
          userId={user.id}
        />
      </main>
    </div>
  );
}
