import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 419 });
    }

    const { itemId, itemType } = await request.json();

    if (itemType !== 'skin' && itemType !== 'title') {
      return NextResponse.json({ error: 'Loại vật phẩm không hợp lệ' }, { status: 400 });
    }

    // Fetch user profile
    const [profile] = await db
      .select({
        ownedSkins: profiles.ownedSkins,
      })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: 'Không tìm thấy người chơi' }, { status: 404 });
    }

    const owned = profile.ownedSkins || [];

    // Verify ownership
    const isDefaultSkin = itemType === 'skin' && itemId === 'skin_default';
    const isEmptyTitle = itemType === 'title' && itemId === '';
    
    if (!isDefaultSkin && !isEmptyTitle && !owned.includes(itemId)) {
      return NextResponse.json({ error: 'Bạn chưa sở hữu vật phẩm này' }, { status: 400 });
    }

    // Perform update
    const updateData: any = {};
    if (itemType === 'skin') {
      updateData.activeSkin = itemId;
    } else {
      updateData.activeTitle = itemId;
    }

    await db
      .update(profiles)
      .set(updateData)
      .where(eq(profiles.id, user.id));

    return NextResponse.json({
      success: true,
      itemId,
      itemType,
    });
  } catch (err: any) {
    console.error('Error equipping item:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi trang bị vật phẩm' },
      { status: 500 }
    );
  }
}
