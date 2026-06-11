'use client';

import { useEffect, useRef } from 'react';
import { gameConfig } from './config';

interface PhaserGameProps {
  onHudUpdate: (hudState: any) => void;
  onBossIntro: (bossConfig: any) => void;
  onMapClear: (clearData: any) => void;
  onGameOver: () => void;
  gameRef: React.MutableRefObject<any>;
  activeSkin?: string;
  activeTitle?: string;
  activeGender?: string;
}

export default function PhaserGame({
  onHudUpdate,
  onBossIntro,
  onMapClear,
  onGameOver,
  gameRef,
  activeSkin,
  activeTitle,
  activeGender,
}: PhaserGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let gameInstance: any = null;
    let isUnmounted = false;

    async function initPhaser() {
      // Dynamically import Phaser to bypass SSR window checks
      const Phaser = (await import('phaser')).default;
      
      if (isUnmounted) return;
      
      const config = {
        ...gameConfig,
        parent: containerRef.current || 'game-canvas-container',
      };

      gameInstance = new Phaser.Game(config);
      gameRef.current = gameInstance;
      if (typeof window !== 'undefined') {
        (window as any).activeGame = gameInstance;
      }

      // Initialize Registry stats
      gameInstance.registry.set('activeSkin', activeSkin || 'skin_default');
      gameInstance.registry.set('activeTitle', activeTitle || '');
      gameInstance.registry.set('activeGender', activeGender || 'male');

      // Register Event Listeners
      gameInstance.events.on('hud-update', (state: any) => {
        onHudUpdate(state);
      });

      gameInstance.events.on('boss-intro-trigger', (config: any) => {
        onBossIntro(config);
      });

      gameInstance.events.on('map-clear-trigger', (data: any) => {
        onMapClear(data);
      });

      gameInstance.events.on('game-over-trigger', () => {
        onGameOver();
      });
    }

    initPhaser();

    return () => {
      isUnmounted = true;
      if (gameInstance) {
        gameInstance.events.off('hud-update');
        gameInstance.events.off('boss-intro-trigger');
        gameInstance.events.off('map-clear-trigger');
        gameInstance.events.off('game-over-trigger');
        gameInstance.destroy(true);
        gameRef.current = null;
      }
      // Ensure container is empty of any stray canvas elements
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [onHudUpdate, onBossIntro, onMapClear, onGameOver, gameRef]);

  // Synchronize dynamic store updates on-the-fly
  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.registry.set('activeSkin', activeSkin || 'skin_default');
      gameRef.current.registry.set('activeTitle', activeTitle || '');
      gameRef.current.registry.set('activeGender', activeGender || 'male');
      gameRef.current.events.emit('skin-update', activeSkin || 'skin_default');
      gameRef.current.events.emit('title-update', activeTitle || '');
      gameRef.current.events.emit('gender-update', activeGender || 'male');
    }
  }, [activeSkin, activeTitle, activeGender, gameRef]);

  return (
    <div 
      id="game-canvas-container" 
      ref={containerRef} 
      className="w-full aspect-[16/9] overflow-hidden rounded-xl border border-slate-700/40 shadow-2xl relative bg-navy-dark [&>canvas]:!w-full [&>canvas]:!h-full"
    />
  );
}

