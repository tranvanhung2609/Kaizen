import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 419 });
    }

    const [profile] = await db
      .select({
        flasks: profiles.flasks,
        ownedSkins: profiles.ownedSkins,
        activeSkin: profiles.activeSkin,
        activeTitle: profiles.activeTitle,
      })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (!profile) {
      return NextResponse.json({
        flasks: 0,
        ownedSkins: [],
        activeSkin: 'skin_default',
        activeTitle: '',
      });
    }

    return NextResponse.json({
      flasks: profile.flasks,
      ownedSkins: profile.ownedSkins || [],
      activeSkin: profile.activeSkin || 'skin_default',
      activeTitle: profile.activeTitle || '',
    });
  } catch (err: any) {
    console.error('Error fetching store stats:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi lấy dữ liệu cửa hàng' },
      { status: 500 }
    );
  }
}
