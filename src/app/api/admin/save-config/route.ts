import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { gameConfig } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 419 });
    }

    // 2. Parse request payload
    const body = await request.json();
    const {
      mapKey,
      scoringRules,
      difficultyConfig,
      cutsceneConfig,
      culturalMessage,
    } = body;

    if (!mapKey || !scoringRules || !difficultyConfig || !cutsceneConfig || !culturalMessage) {
      return NextResponse.json({ error: 'Missing required configuration fields' }, { status: 400 });
    }

    // Create default audio config for the map if not exists
    const audioConfig = {
      runnerBgm: `audio/bgm/${mapKey}-runner.mp3`,
      bossBgm: `audio/bgm/${mapKey}-boss.mp3`
    };

    // 3. Upsert game config
    const [savedConfig] = await db
      .insert(gameConfig)
      .values({
        mapKey,
        scoringRules,
        difficultyConfig,
        audioConfig,
        cutsceneConfig,
        culturalMessage,
      })
      .onConflictDoUpdate({
        target: gameConfig.mapKey,
        set: {
          scoringRules,
          difficultyConfig,
          cutsceneConfig,
          culturalMessage,
          updatedAt: new Date(),
        },
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Cấu hình màn chơi đã được cập nhật thành công!',
      data: savedConfig,
    });
  } catch (err: any) {
    console.error('Error saving game config:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi cập nhật cấu hình màn chơi' },
      { status: 500 }
    );
  }
}
