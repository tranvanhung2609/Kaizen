import { requireAuth } from '@/lib/auth';
import { db } from '@/db';
import { journeyScores, profiles, mapRuns } from '@/db/schema';
import { and, desc, eq, ne, sql } from 'drizzle-orm';
import Navbar from '@/components/Navbar';
import LeaderboardClient from '@/components/leaderboard/LeaderboardClient';
import { extractDeptFromName } from '@/lib/profile-utils';

export const revalidate = 0;

interface LeaderboardPageProps {
  searchParams: Promise<{ tab?: string; scope?: string; highlight?: string }>;
}

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
  hasPlayed: boolean;
  isCurrentUser: boolean;
}

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

export interface RunRow {
  id: string;
  mapKey: string;
  mapName: string;
  score: number;
  completionTime: number;
  bossCleared: boolean;
  playedAt: string;
}

function getDisplayDepartment(
  department: string | null | undefined,
  fullName: string | null | undefined,
) {
  return department || extractDeptFromName(fullName) || '';
}

function getScoreOrderBy(tab: 'overall' | 'hanoi' | 'tokyo' | 'danang') {
  if (tab === 'hanoi') {
    return desc(sql`COALESCE(${journeyScores.hanoiBestScore}, 0)`);
  }

  if (tab === 'tokyo') {
    return desc(sql`COALESCE(${journeyScores.tokyoBestScore}, 0)`);
  }

  if (tab === 'danang') {
    return desc(sql`COALESCE(${journeyScores.danangBestScore}, 0)`);
  }

  return desc(sql`COALESCE(${journeyScores.totalScore}, 0)`);
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const currentTab = (params.tab || 'overall') as 'overall' | 'hanoi' | 'tokyo' | 'danang';
  const currentScope = (params.scope || 'personal') as 'personal' | 'department' | 'vti';
  const highlightUserId = params.highlight || '';

  let dbProfile = {
    id: user.id,
    email: user.email,
    fullName: user.user_metadata?.full_name || '',
    avatarUrl: user.user_metadata?.avatar_url || '',
    role: 'user',
  };
  let myDept = '';

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
      myDept = getDisplayDepartment(profile.department, profile.fullName);
    }
  } catch (err) {
    console.error('[Leaderboard] profile load error:', err);
  }

  let runRows: RunRow[] = [];
  let playerRows: PlayerRow[] = [];
  const deptRows: DeptRow[] = [];
  let myRank = 0;
  let myRunCount = 0;

  try {
    if (currentScope === 'personal') {
      const mapNameMap: Record<string, string> = {
        hanoi: 'Hà Nội',
        tokyo: 'Tokyo',
        danang: 'Đà Nẵng',
      };

      const runs = await db
        .select({
          id: mapRuns.id,
          mapKey: mapRuns.mapKey,
          score: mapRuns.score,
          completionTime: mapRuns.completionTime,
          bossCleared: mapRuns.bossCleared,
          createdAt: mapRuns.createdAt,
        })
        .from(mapRuns)
        .where(eq(mapRuns.userId, user.id))
        .orderBy(desc(mapRuns.createdAt))
        .limit(100);

      runRows = runs.map((run) => ({
        id: run.id,
        mapKey: run.mapKey,
        mapName: mapNameMap[run.mapKey] || run.mapKey,
        score: run.score,
        completionTime: run.completionTime,
        bossCleared: run.bossCleared,
        playedAt: run.createdAt.toISOString(),
      }));

      myRunCount = runRows.length;
    } else {
      const baseQuery = db
        .select({
          id: profiles.id,
          fullName: profiles.fullName,
          avatarUrl: profiles.avatarUrl,
          department: profiles.department,
          email: profiles.email,
          totalScore: sql<number>`COALESCE(${journeyScores.totalScore}, 0)`,
          hanoiBestScore: sql<number>`COALESCE(${journeyScores.hanoiBestScore}, 0)`,
          tokyoBestScore: sql<number>`COALESCE(${journeyScores.tokyoBestScore}, 0)`,
          danangBestScore: sql<number>`COALESCE(${journeyScores.danangBestScore}, 0)`,
        })
        .from(profiles)
        .leftJoin(journeyScores, eq(profiles.id, journeyScores.userId));

      let records:
        | Awaited<ReturnType<typeof baseQuery.limit>>
        | Array<{
            id: string;
            fullName: string | null;
            avatarUrl: string | null;
            department: string;
            email: string;
            totalScore: number;
            hanoiBestScore: number;
            tokyoBestScore: number;
            danangBestScore: number;
          }> = [];

      if (currentScope === 'department') {
        if (myDept) {
          records = await baseQuery
            .where(
              and(
                ne(profiles.role, 'admin'),
                sql`(
                  ${profiles.department} = ${myDept}
                  OR (
                    ${profiles.department} = ''
                    AND ${profiles.fullName} LIKE ${'%(' + myDept + ')'}
                  )
                )`,
              ),
            )
            .orderBy(getScoreOrderBy(currentTab))
            .limit(200);
        }
      } else {
        records = await baseQuery
          .where(ne(profiles.role, 'admin'))
          .orderBy(getScoreOrderBy(currentTab))
          .limit(500);
      }

      playerRows = records.map((record, idx) => ({
        rank: idx + 1,
        userId: record.id,
        name: record.fullName || record.email.split('@')[0],
        avatar: record.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${record.id}`,
        department: getDisplayDepartment(record.department, record.fullName) || 'Chưa cập nhật',
        hanoiScore: Number(record.hanoiBestScore),
        tokyoScore: Number(record.tokyoBestScore),
        danangScore: Number(record.danangBestScore),
        totalScore: Number(record.totalScore),
        hasPlayed: Number(record.totalScore) > 0,
        isCurrentUser: record.id === user.id,
      }));

      myRank = playerRows.find((row) => row.isCurrentUser)?.rank ?? 0;
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
          highlightUserId={highlightUserId}
        />
      </main>
    </div>
  );
}
