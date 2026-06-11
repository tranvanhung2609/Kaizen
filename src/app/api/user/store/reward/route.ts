import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 419 });
    }

    const { reward, questId } = await request.json();

    if (reward === undefined || typeof reward !== 'number' || reward <= 0) {
      return NextResponse.json({ error: 'Số tiền thưởng không hợp lệ' }, { status: 400 });
    }

    // Increment flasks in the database
    await db
      .update(profiles)
      .set({
        flasks: sql`${profiles.flasks} + ${reward}`,
      })
      .where(eq(profiles.id, user.id));

    // Fetch new flasks balance
    const [profile] = await db
      .select({
        flasks: profiles.flasks,
      })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    return NextResponse.json({
      success: true,
      flasks: profile?.flasks || 0,
      message: `Đã nhận ${reward} bình nước cho nhiệm vụ ${questId}`,
    });
  } catch (err: any) {
    console.error('Error rewarding flasks:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi nhận thưởng nhiệm vụ' },
      { status: 500 }
    );
  }
}
