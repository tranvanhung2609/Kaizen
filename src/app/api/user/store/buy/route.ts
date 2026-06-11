import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

const ITEM_PRICES: Record<string, number> = {
  skin_hanoi: 50,
  skin_tokyo: 100,
  skin_danang: 150,
  title_runner: 20,
  title_hunter: 40,
  title_hacker: 70,
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 419 });
    }

    const { itemId, cost } = await request.json();

    if (!itemId) {
      return NextResponse.json({ error: 'Thiếu ID vật phẩm' }, { status: 400 });
    }

    // Validate expected price matches request cost
    const expectedCost = ITEM_PRICES[itemId];
    if (expectedCost === undefined || expectedCost !== cost) {
      return NextResponse.json({ error: 'Giá vật phẩm không khớp hoặc không tồn tại' }, { status: 400 });
    }

    // Fetch user profile
    const [profile] = await db
      .select({
        flasks: profiles.flasks,
        ownedSkins: profiles.ownedSkins,
      })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: 'Không tìm thấy thông tin người chơi' }, { status: 404 });
    }

    const currentFlasks = profile.flasks || 0;
    const owned = profile.ownedSkins || [];

    // Check if user already owns it
    if (owned.includes(itemId)) {
      return NextResponse.json({ error: 'Bạn đã sở hữu vật phẩm này rồi' }, { status: 400 });
    }

    // Check if user has enough flasks
    if (currentFlasks < cost) {
      return NextResponse.json({ error: 'Không đủ bình nước để thanh toán' }, { status: 400 });
    }

    const newFlasks = currentFlasks - cost;
    const updatedOwned = [...owned, itemId];

    // Update database
    await db
      .update(profiles)
      .set({
        flasks: newFlasks,
        ownedSkins: updatedOwned,
      })
      .where(eq(profiles.id, user.id));

    return NextResponse.json({
      success: true,
      flasks: newFlasks,
      ownedSkins: updatedOwned,
    });
  } catch (err: any) {
    console.error('Error buying store item:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi xử lý giao dịch mua hàng' },
      { status: 500 }
    );
  }
}
