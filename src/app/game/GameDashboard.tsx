'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PhaserGame from '@/game/PhaserGame';
import HUD from '@/components/game/HUD';
import CutsceneOverlay from '@/components/game/CutsceneOverlay';
import MapJourneyPanel from '@/components/game/MapJourneyPanel';
import ArcadeConsoleFrame from '@/components/game/ArcadeConsoleFrame';
import SidePanelRight from '@/components/game/SidePanelRight';
import MapSelectionModal from '@/components/game/MapSelectionModal';
import SkillsModal from '@/components/game/SkillsModal';

interface GameDashboardProps {
  userDetails: {
    id: string;
    email?: string;
  };
  topPlayers: any[];
}

export default function GameDashboard({ userDetails, topPlayers }: GameDashboardProps) {
  const router = useRouter();
  const gameRef = useRef<any>(null);
  
  // Game HUD states
  const [hudState, setHudState] = useState({
    score: 0,
    hearts: 3,
    energy: 0,
    bossHp: 0,
    maxBossHp: 0,
    phase: 'runner',
    timeElapsed: 0,
    mapKey: 'hanoi',
    mapName: 'Hà Nội',
    bossName: 'Boss Deadline Cổ Phố',
    playerName: '',
    isKaizenMode: false,
    cooldownRemaining: 0,
    shieldRemaining: 0,
    wingsRemaining: 0,
    deathCount: 0,
    groundBugsDefeated: 0,
    flyingBugsDefeated: 0,
    flasksCollected: 0,
    bossTriggerDelaySec: 60,
  });

  const [isPaused, setIsPaused] = useState(false);

  const [bossIntroData, setBossIntroData] = useState<any>(null);
  const [mapClearData, setMapClearData] = useState<any>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Rank result sau khi lưu điểm — trả về từ API
  const [rankResult, setRankResult] = useState<{ rank: number; totalPlayers: number; totalScore: number } | null>(null);
  // Flag: đã lưu xong chưa
  const [isSaved, setIsSaved] = useState(false);

  const quests: any[] = [];
  const activeSkin = 'skin_default';
  const activeTitle = '';
  
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isCrtActive, setIsCrtActive] = useState(true);
  const [isScanlinesActive, setIsScanlinesActive] = useState(true);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [activeGender, setActiveGender] = useState('male');

  // Live leaderboard and personal stats states
  const [topPlayersList, setTopPlayersList] = useState<any[]>(topPlayers);
  const [personalBest, setPersonalBest] = useState<any>(null);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  const fetchLeaderboardData = useCallback(async () => {
    setIsLoadingLeaderboard(true);
    try {
      const response = await fetch('/api/game/leaderboard');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTopPlayersList(data.topPlayers || []);
          setPersonalBest(data.personalBest || null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard/personal scores:', err);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, []);

  // Load properties on mount & fetch live leaderboard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCrt = localStorage.getItem('vj_settings_crt');
      if (storedCrt !== null) setIsCrtActive(storedCrt === 'true');

      const storedScan = localStorage.getItem('vj_settings_scan');
      if (storedScan !== null) setIsScanlinesActive(storedScan === 'true');

      const storedMute = localStorage.getItem('vj_settings_mute');
      if (storedMute !== null) setIsSoundMuted(storedMute === 'true');

      const storedGender = localStorage.getItem('vj_settings_gender');
      if (storedGender !== null) setActiveGender(storedGender);
    }
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  // Sync settings helper
  const handleSetCrt = (val: boolean) => {
    setIsCrtActive(val);
    localStorage.setItem('vj_settings_crt', String(val));
  };
  const handleSetScanlines = (val: boolean) => {
    setIsScanlinesActive(val);
    localStorage.setItem('vj_settings_scan', String(val));
  };
  const handleSetMute = (val: boolean) => {
    setIsSoundMuted(val);
    localStorage.setItem('vj_settings_mute', String(val));
    if (gameRef.current) {
      gameRef.current.sound.mute = val;
    }
  };
  const handleSetGender = (val: string) => {
    setActiveGender(val);
    localStorage.setItem('vj_settings_gender', val);
  };

  const handleSelectMap = useCallback((mapKey: string) => {
    if (gameRef.current) {
      const gameScene = gameRef.current.scene.getScene('GameScene');
      if (gameScene) {
        setMapClearData(null);
        setBossIntroData(null);
        setIsGameOver(false);
        gameRef.current.scene.start('GameScene', { mapKey });
      }
    }
  }, [gameRef]);

  // Callbacks from Phaser events
  const handleHudUpdate = useCallback((state: any) => {
    setHudState((prev) => ({ ...prev, ...state }));
  }, []);

  const handleBossIntro = useCallback((config: any) => {
    setBossIntroData(config);
  }, []);

  const handleMapClear = useCallback((data: any) => {
    setMapClearData(data);
    setRankResult(null);
    setIsSaved(false);
  }, []);

  // ── Tự động lưu điểm ngay khi boss bị hạ ──────────────────────────────
  useEffect(() => {
    if (!mapClearData || isSaved || isSubmitting) return;

    const autoSave = async () => {
      setIsSubmitting(true);
      try {
        const stats = mapClearData.stats;
        const currentMapKey = hudState.mapKey;

        const response = await fetch('/api/game/submit-run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userDetails.id,
            mapKey: currentMapKey,
            score: stats.score,
            completionTime: stats.gameTime,
            bossCleared: true,
            flasksCollected: stats.flasksCollected,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setRankResult({
            rank: result.rank || 0,
            totalPlayers: result.totalPlayers || 0,
            totalScore: result.totalScore || stats.score,
          });
          setIsSaved(true);
          fetchLeaderboardData();
        } else {
          // Làm nổi bật lỗi nhưng không block UI
          console.error('[GameDashboard] Auto-save failed:', await response.text());
          setIsSaved(true); // Vẫn cho tiếp tục
        }
      } catch (err) {
        console.error('[GameDashboard] Auto-save error:', err);
        setIsSaved(true);
      } finally {
        setIsSubmitting(false);
      }
    };

    autoSave();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapClearData]);

  // ── Tự động lưu điểm khi Game Over thực sự (Hết lượt) ────────────────
  useEffect(() => {
    if (!isGameOver || hudState.deathCount < 3 || isSaved || isSubmitting) return;

    const autoSaveGameOver = async () => {
      setIsSubmitting(true);
      try {
        const currentMapKey = hudState.mapKey;

        const response = await fetch('/api/game/submit-run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userDetails.id,
            mapKey: currentMapKey,
            score: hudState.score,
            completionTime: hudState.timeElapsed,
            bossCleared: false, // Thua cuộc nên bossCleared = false
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setRankResult({
            rank: result.rank || 0,
            totalPlayers: result.totalPlayers || 0,
            totalScore: result.totalScore || hudState.score,
          });
          setIsSaved(true);
          fetchLeaderboardData();
        } else {
          console.error('[GameDashboard] Auto-save Game Over failed:', await response.text());
          setIsSaved(true); // Cho tiếp tục
        }
      } catch (err) {
        console.error('[GameDashboard] Auto-save Game Over error:', err);
        setIsSaved(true);
      } finally {
        setIsSubmitting(false);
      }
    };

    autoSaveGameOver();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameOver, hudState.deathCount]);

  const handleGameOver = useCallback(() => {
    setIsGameOver(true);
  }, []);

  const handlePauseToggle = useCallback(() => {
    if (isGameOver || mapClearData || bossIntroData) return;
    setIsPaused((prev) => {
      const next = !prev;
      if (gameRef.current) {
        const gameScene = gameRef.current.scene.getScene('GameScene');
        if (gameScene) {
          if (next) {
            gameScene.scene.pause();
          } else {
            gameScene.scene.resume();
          }
        }
      }
      return next;
    });
  }, [isGameOver, mapClearData, bossIntroData]);

  // Listen to keyboard Esc and P keys to toggle pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handlePauseToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePauseToggle]);

  const handleCloseBossIntro = () => {
    setBossIntroData(null);
  };

  const handleRestartGame = () => {
    setIsGameOver(false);
    setIsPaused(false);
    setBossIntroData(null);
    setMapClearData(null);
    setRankResult(null);
    setIsSaved(false);
    
    if (gameRef.current) {
      const gameScene = gameRef.current.scene.getScene('GameScene');
      if (gameScene) {
        // Bắt buộc resume scene trước khi respawn — tránh lỗi scene vẫn bị pause
        gameScene.scene.resume();
        gameScene.respawn(false);
      }
    }
  };

  const handleRestartFromBeginning = () => {
    setIsGameOver(false);
    setIsPaused(false);
    setBossIntroData(null);
    setMapClearData(null);
    setRankResult(null);
    setIsSaved(false);
    
    if (gameRef.current) {
      const gameScene = gameRef.current.scene.getScene('GameScene');
      if (gameScene) {
        // Bắt buộc resume scene trước khi respawn — tránh lỗi scene vẫn bị pause
        gameScene.scene.resume();
        gameScene.respawn(true);
      }
    }
  };

  const handleNextMap = async () => {
    if (!mapClearData) return;

    const currentMapKey = hudState.mapKey;
    let nextMapKey = '';
    if (currentMapKey === 'hanoi') nextMapKey = 'tokyo';
    else if (currentMapKey === 'tokyo') nextMapKey = 'danang';

    if (nextMapKey) {
      // Tiếp tục map tiếp theo
      if (gameRef.current) {
        const gameScene = gameRef.current.scene.getScene('GameScene');
        if (gameScene) {
          setMapClearData(null);
          setBossIntroData(null);
          setIsGameOver(false);
          setRankResult(null);
          setIsSaved(false);
          gameRef.current.scene.start('GameScene', { mapKey: nextMapKey });
        }
      }
    } else {
      // Map cuối (danang) — chuyển sang leaderboard với highlight
      router.push(`/leaderboard?highlight=${userDetails.id}&tab=overall&scope=vti`);
      router.refresh();
    }
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-3 items-start justify-center relative">
      {/* COLUMN 1 (LEFT): USER PROFILE & MAP JOURNEY - hidden on small screens */}
      <div className="hidden xl:flex w-56 2xl:w-64 shrink-0 flex-col gap-3">
        <MapJourneyPanel
          currentMapKey={hudState.mapKey}
          score={hudState.score}
          energy={hudState.energy}
          onSelectMap={handleSelectMap}
        />
      </div>

      {/* COLUMN 2 (CENTER): GAME CANVAS - takes all available space */}
      <div className="flex-1 min-w-0 flex flex-col items-stretch w-full">
        <ArcadeConsoleFrame
          isCrtActive={isCrtActive}
          isScanlinesActive={isScanlinesActive}
          kaizenEnergy={hudState.energy}
        >
          <div className="relative w-full aspect-[16/9] select-none">
            {/* 1. Phaser Game Mount */}
            <PhaserGame
              onHudUpdate={handleHudUpdate}
              onBossIntro={handleBossIntro}
              onMapClear={handleMapClear}
              onGameOver={handleGameOver}
              gameRef={gameRef}
              activeSkin={activeSkin}
              activeTitle={activeTitle}
              activeGender={activeGender}
              playerName={userDetails.email ? userDetails.email.split('@')[0] : 'Player'}
            />

            {/* 2. HUD Overlay */}
            <HUD
              score={hudState.score}
              hearts={hudState.hearts}
              energy={hudState.energy}
              bossHp={hudState.bossHp}
              maxBossHp={hudState.maxBossHp}
              phase={hudState.phase}
              timeElapsed={hudState.timeElapsed}
              mapName={hudState.mapName}
              bossName={hudState.bossName}
              playerName={hudState.playerName}
              onOpenMap={() => setIsMapModalOpen(true)}
              onOpenSkills={() => setIsSkillsModalOpen(true)}
              isKaizenMode={hudState.isKaizenMode}
              cooldownRemaining={hudState.cooldownRemaining}
              shieldRemaining={hudState.shieldRemaining}
              wingsRemaining={hudState.wingsRemaining}
              onPauseToggle={handlePauseToggle}
              groundBugsDefeated={hudState.groundBugsDefeated}
              flyingBugsDefeated={hudState.flyingBugsDefeated}
              flasks={hudState.flasksCollected}
              bossTriggerDelaySec={hudState.bossTriggerDelaySec}
            />

            {/* 3. Cutscenes Overlays */}
            <CutsceneOverlay
              bossIntroData={bossIntroData}
              mapClearData={mapClearData}
              isGameOver={isGameOver}
              isPaused={isPaused}
              onCloseBossIntro={handleCloseBossIntro}
              onRestartGame={handleRestartGame}
              onNextMap={handleNextMap}
              onResumeGame={handlePauseToggle}
              onRestartFromBeginning={handleRestartFromBeginning}
              deathCount={hudState.deathCount}
              rankResult={rankResult}
              isSubmitting={isSubmitting}
              isSaved={isSaved}
              userId={userDetails.id}
              currentMapKey={hudState.mapKey}
            />
          </div>
        </ArcadeConsoleFrame>

        {/* Mobile-only: compact controls bar below canvas */}
        <div className="xl:hidden flex items-center justify-between gap-2 mt-2 px-2 py-2 rounded-xl bg-navy-medium/80 border border-slate-800/60 text-xs font-mono">
          <button
            onClick={() => setIsMapModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-navy-light/80 border border-slate-700 text-brand-cyan text-[10px] font-bold hover:bg-brand-cyan/10 transition-colors"
          >
            🗺️ BẢN ĐỒ
          </button>
          <div className="flex items-center gap-1 text-slate-400 text-[10px]">
            <span>W/↑ Nhảy</span>
            <span className="text-slate-600">·</span>
            <span>S/↓ Cúi</span>
            <span className="text-slate-600">·</span>
            <span>SPACE Kaizen</span>
          </div>
          <button
            onClick={() => setIsSkillsModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-navy-light/80 border border-slate-700 text-brand-cyan text-[10px] font-bold hover:bg-brand-cyan/10 transition-colors"
          >
            ⚡ KỸ NĂNG
          </button>
        </div>
      </div>

      {/* COLUMN 3 (RIGHT): CABINET CONFIG, QUESTS & SHOP - hidden on small screens */}
      <div className="hidden xl:flex w-56 2xl:w-64 shrink-0 flex-col gap-3">
        <SidePanelRight
          flasksCount={hudState.flasksCollected}
          onOpenShop={() => {}}
          quests={quests}
          isCrtActive={isCrtActive}
          setIsCrtActive={handleSetCrt}
          isScanlinesActive={isScanlinesActive}
          setIsScanlinesActive={handleSetScanlines}
          isSoundMuted={isSoundMuted}
          setIsSoundMuted={handleSetMute}
          activeGender={activeGender}
          onChangeGender={handleSetGender}
          topPlayers={topPlayersList}
          personalBest={personalBest}
          isLoadingLeaderboard={isLoadingLeaderboard}
          onRefreshLeaderboard={fetchLeaderboardData}
        />
      </div>

      {/* MAP SELECTION MODAL */}
      <MapSelectionModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        currentMapKey={hudState.mapKey}
        onSelectMap={handleSelectMap}
      />

      {/* SKILLS MODAL */}
      <SkillsModal
        isOpen={isSkillsModalOpen}
        onClose={() => setIsSkillsModalOpen(false)}
      />
    </div>
  );
}
