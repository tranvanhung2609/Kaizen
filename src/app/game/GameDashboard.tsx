'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PhaserGame from '@/game/PhaserGame';
import HUD from '@/components/game/HUD';
import CutsceneOverlay from '@/components/game/CutsceneOverlay';
import MapJourneyPanel from '@/components/game/MapJourneyPanel';
import ArcadeConsoleFrame from '@/components/game/ArcadeConsoleFrame';
import SidePanelRight from '@/components/game/SidePanelRight';
import KaizenStoreModal from '@/components/game/KaizenStoreModal';
import MapSelectionModal from '@/components/game/MapSelectionModal';
import SkillsModal from '@/components/game/SkillsModal';

interface GameDashboardProps {
  userDetails: {
    id: string;
    email?: string;
  };
  topPlayers: any[];
}

interface Quest {
  id: string;
  label: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
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
  });

  const [bossIntroData, setBossIntroData] = useState<any>(null);
  const [mapClearData, setMapClearData] = useState<any>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redesign additional states
  const [flasksCount, setFlasksCount] = useState(0);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isCrtActive, setIsCrtActive] = useState(true);
  const [isScanlinesActive, setIsScanlinesActive] = useState(true);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [activeSkin, setActiveSkin] = useState('skin_default');
  const [activeTitle, setActiveTitle] = useState('');
  const [activeGender, setActiveGender] = useState('male');

  const [quests, setQuests] = useState<Quest[]>([
    { id: 'collect_flasks', label: '💧 Thu thập 15 bình nước', target: 15, current: 0, reward: 20, completed: false },
    { id: 'defeat_bugs', label: '👾 Tiêu diệt 5 Bug', target: 5, current: 0, reward: 30, completed: false },
    { id: 'kaizen_energy', label: '⚡ Đạt 100% Kaizen Energy', target: 1, current: 0, reward: 15, completed: false },
  ]);

  // Load properties on mount
  useEffect(() => {
    async function loadStoreData() {
      try {
        const response = await fetch('/api/user/store');
        if (response.ok) {
          const data = await response.json();
          setFlasksCount(data.flasks);
          setOwnedItems(data.ownedSkins || []);
          setActiveSkin(data.activeSkin || 'skin_default');
          setActiveTitle(data.activeTitle || '');
        }
      } catch (err) {
        console.error('Failed to load store data from API:', err);
      }
    }
    loadStoreData();

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
  }, []);

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

  const handleBuyItem = async (cost: number, itemId: string, itemType: 'skin' | 'title') => {
    try {
      const response = await fetch('/api/user/store/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, cost }),
      });
      if (response.ok) {
        const data = await response.json();
        setFlasksCount(data.flasks);
        setOwnedItems(data.ownedSkins);
      } else {
        const err = await response.json();
        alert(err.error || 'Mua vật phẩm thất bại!');
      }
    } catch (err) {
      console.error('Error buying item:', err);
    }
  };

  const handleEquipItem = async (itemId: string, itemType: 'skin' | 'title') => {
    try {
      const isCurrentlyEquipped = itemType === 'skin' ? activeSkin === itemId : activeTitle === itemId;
      const targetItemId = (itemType === 'title' && isCurrentlyEquipped) ? '' : itemId;

      const response = await fetch('/api/user/store/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: targetItemId, itemType }),
      });
      if (response.ok) {
        if (itemType === 'skin') {
          setActiveSkin(targetItemId);
        } else {
          setActiveTitle(targetItemId);
        }
      } else {
        const err = await response.json();
        alert(err.error || 'Trang bị thất bại!');
      }
    } catch (err) {
      console.error('Error equipping item:', err);
    }
  };

  const claimQuestReward = async (questId: string, reward: number) => {
    try {
      const response = await fetch('/api/user/store/reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId, reward }),
      });
      if (response.ok) {
        const data = await response.json();
        setFlasksCount(data.flasks);
      }
    } catch (err) {
      console.error('Failed to claim quest reward:', err);
    }
  };

  // Score & energy trackers for Daily Quests
  const prevScoreRef = useRef(0);
  const prevEnergyRef = useRef(0);

  useEffect(() => {
    // Check if game restarted or respawned
    if (hudState.score === 0 || hudState.score < prevScoreRef.current) {
      prevScoreRef.current = hudState.score;
      prevEnergyRef.current = hudState.energy;
      // Reset quest progress for the current run
      setQuests((prev) =>
        prev.map((q) => (q.id !== 'kaizen_energy' ? { ...q, current: 0, completed: false } : q))
      );
      return;
    }

    const diff = hudState.score - prevScoreRef.current;
    if (diff > 0) {
      prevScoreRef.current = hudState.score;

      setQuests((prevQuests) => {
        return prevQuests.map((q) => {
          if (q.completed) return q;

          let newCurrent = q.current;
          if (q.id === 'collect_flasks' && diff === 50) {
            newCurrent = Math.min(q.target, q.current + 1);
            setFlasksCount((prevFlasks) => {
              const updated = prevFlasks + 1;
              return updated;
            });
          } else if (q.id === 'defeat_bugs' && (diff === 150 || diff === 200)) {
            newCurrent = Math.min(q.target, q.current + 1);
          }

          const completed = newCurrent >= q.target;
          if (completed && !q.completed) {
            claimQuestReward(q.id, q.reward);
          }

          return { ...q, current: newCurrent, completed };
        });
      });
    }

    // Check Energy complete
    if (hudState.energy >= 100 && prevEnergyRef.current < 100) {
      setQuests((prevQuests) =>
        prevQuests.map((q) => {
          if (q.id === 'kaizen_energy' && !q.completed) {
            claimQuestReward(q.id, q.reward);
            return { ...q, current: 1, completed: true };
          }
          return q;
        })
      );
    }
    prevEnergyRef.current = hudState.energy;
  }, [hudState.score, hudState.energy]);

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
  }, []);

  const handleGameOver = useCallback(() => {
    setIsGameOver(true);
  }, []);

  const handleCloseBossIntro = () => {
    setBossIntroData(null);
  };

  const handleRestartGame = () => {
    setIsGameOver(false);
    setBossIntroData(null);
    setMapClearData(null);
    
    if (gameRef.current) {
      const gameScene = gameRef.current.scene.getScene('GameScene');
      if (gameScene) {
        gameScene.respawn();
      }
    }
  };

  const handleNextMap = async () => {
    if (!mapClearData || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const stats = mapClearData.stats;
      const currentMapKey = hudState.mapKey;
      
      const response = await fetch('/api/game/submit-run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userDetails.id,
          mapKey: currentMapKey,
          score: stats.score,
          flasksCollected: stats.flasksCollected,
          groundBugsDefeated: Math.floor(Math.random() * 5) + 3,
          flyingBugsDefeated: Math.floor(Math.random() * 4) + 2,
          bossesDefeated: 1,
          heartsRemaining: stats.heartsRemaining,
          completionTime: stats.gameTime,
          bossCleared: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Gửi điểm số thất bại!');
      }

      let nextMapKey = '';
      if (currentMapKey === 'hanoi') {
        nextMapKey = 'tokyo';
      } else if (currentMapKey === 'tokyo') {
        nextMapKey = 'danang';
      }

      if (nextMapKey) {
        if (gameRef.current) {
          const gameScene = gameRef.current.scene.getScene('GameScene');
          if (gameScene) {
            setMapClearData(null);
            setBossIntroData(null);
            setIsGameOver(false);
            gameRef.current.scene.start('GameScene', { mapKey: nextMapKey });
          }
        }
      } else {
        router.push('/leaderboard');
        router.refresh();
      }
    } catch (err) {
      console.error('Error submitting score:', err);
      alert('Đã xảy ra lỗi khi lưu kết quả game. Hệ thống sẽ chuyển tiếp.');
      router.push('/leaderboard');
    } finally {
      setIsSubmitting(false);
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
              onOpenMap={() => setIsMapModalOpen(true)}
              onOpenSkills={() => setIsSkillsModalOpen(true)}
            />

            {/* 3. Cutscenes Overlays */}
            <CutsceneOverlay
              bossIntroData={bossIntroData}
              mapClearData={mapClearData}
              isGameOver={isGameOver}
              onCloseBossIntro={handleCloseBossIntro}
              onRestartGame={handleRestartGame}
              onNextMap={handleNextMap}
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
          flasksCount={flasksCount}
          onOpenShop={() => setIsShopOpen(true)}
          quests={quests}
          isCrtActive={isCrtActive}
          setIsCrtActive={handleSetCrt}
          isScanlinesActive={isScanlinesActive}
          setIsScanlinesActive={handleSetScanlines}
          isSoundMuted={isSoundMuted}
          setIsSoundMuted={handleSetMute}
          activeGender={activeGender}
          onChangeGender={handleSetGender}
          topPlayers={topPlayers}
        />
      </div>

      {/* KAIZEN SHOP MODAL */}
      <KaizenStoreModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        flasksCount={flasksCount}
        ownedItems={ownedItems}
        activeSkin={activeSkin}
        activeTitle={activeTitle}
        onBuyItem={handleBuyItem}
        onEquipItem={handleEquipItem}
      />

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
