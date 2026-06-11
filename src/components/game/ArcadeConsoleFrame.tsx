'use client';

import React, { useState, useEffect } from 'react';

interface ArcadeConsoleFrameProps {
  children: React.ReactNode;
  isCrtActive: boolean;
  isScanlinesActive: boolean;
  kaizenEnergy: number;
}

export default function ArcadeConsoleFrame({
  children,
  isCrtActive,
  isScanlinesActive,
  kaizenEnergy,
}: ArcadeConsoleFrameProps) {
  // Key press states for visual feedback
  const [keysPressed, setKeysPressed] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
    space: false,
    enter: false,
    shift: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (e.key === 'ArrowUp' || key === 'w') {
        setKeysPressed((prev) => ({ ...prev, up: true }));
      } else if (e.key === 'ArrowDown' || key === 's') {
        setKeysPressed((prev) => ({ ...prev, down: true }));
      } else if (e.key === 'ArrowLeft' || key === 'a') {
        setKeysPressed((prev) => ({ ...prev, left: true }));
      } else if (e.key === 'ArrowRight' || key === 'd') {
        setKeysPressed((prev) => ({ ...prev, right: true }));
      } else if (e.key === ' ') {
        setKeysPressed((prev) => ({ ...prev, space: true }));
      } else if (e.key === 'Enter') {
        setKeysPressed((prev) => ({ ...prev, enter: true }));
      } else if (e.key === 'Shift') {
        setKeysPressed((prev) => ({ ...prev, shift: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (e.key === 'ArrowUp' || key === 'w') {
        setKeysPressed((prev) => ({ ...prev, up: false }));
      } else if (e.key === 'ArrowDown' || key === 's') {
        setKeysPressed((prev) => ({ ...prev, down: false }));
      } else if (e.key === 'ArrowLeft' || key === 'a') {
        setKeysPressed((prev) => ({ ...prev, left: false }));
      } else if (e.key === 'ArrowRight' || key === 'd') {
        setKeysPressed((prev) => ({ ...prev, right: false }));
      } else if (e.key === ' ') {
        setKeysPressed((prev) => ({ ...prev, space: false }));
      } else if (e.key === 'Enter') {
        setKeysPressed((prev) => ({ ...prev, enter: false }));
      } else if (e.key === 'Shift') {
        setKeysPressed((prev) => ({ ...prev, shift: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Determine joystick tilt class
  let joystickTilt = '';
  if (keysPressed.up && keysPressed.left) joystickTilt = 'tilt-up-left';
  else if (keysPressed.up && keysPressed.right) joystickTilt = 'tilt-up-right';
  else if (keysPressed.down && keysPressed.left) joystickTilt = 'tilt-down-left';
  else if (keysPressed.down && keysPressed.right) joystickTilt = 'tilt-down-right';
  else if (keysPressed.up) joystickTilt = 'tilt-up';
  else if (keysPressed.down) joystickTilt = 'tilt-down';
  else if (keysPressed.left) joystickTilt = 'tilt-left';
  else if (keysPressed.right) joystickTilt = 'tilt-right';

  const isKaizenReady = kaizenEnergy >= 100;

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Cabinet Bezel Wrapper */}
      <div className="w-full arcade-cabinet-bezel p-2 md:p-3 rounded-2xl relative">
        
        {/* Top Header Marquee */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-slate-900 border border-brand-cyan/60 shadow-[0_0_12px_rgba(0,229,255,0.35)] z-30">
          <div className="flex items-center gap-2">
            <span className="led-indicator led-green animate-pulse" />
            <span className="text-[9px] font-mono font-black text-brand-cyan uppercase tracking-widest text-glow-cyan">
              VTI ARCADE CABINET v4.0
            </span>
          </div>
        </div>

        {/* CRT Screen Glass */}
        <div
          className={`w-full relative rounded-xl overflow-hidden shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] border border-slate-900 bg-black crt-overlay ${
            isScanlinesActive ? 'crt-overlay-active' : ''
          } ${isCrtActive ? 'crt-screen crt-screen-active crt-flicker' : ''}`}
        >
          {children}
        </div>

        {/* Slim Status Bar */}
        <div className="w-full grid grid-cols-3 gap-2 mt-2 px-2 py-1.5 rounded-lg bg-navy-dark/95 border border-slate-800/60 font-mono text-[8px]">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="led-indicator led-green shrink-0" />
            <span className="text-white font-bold">SYSTEM ACTIVE</span>
            <span className="text-slate-600 hidden sm:inline">· 60 FPS</span>
          </div>
          <div className="flex items-center justify-center border-x border-slate-800/60 text-center">
            <span className="text-brand-cyan font-bold text-glow-cyan">PHASER 4.1</span>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <span className={isKaizenReady ? 'text-brand-red font-bold animate-pulse' : 'text-slate-400'}>
              {isKaizenReady ? 'KAIZEN READY!' : `ENERGY: ${Math.floor(kaizenEnergy)}%`}
            </span>
            <span className={`led-indicator shrink-0 ${isKaizenReady ? 'led-red-blink' : 'bg-slate-700'}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
