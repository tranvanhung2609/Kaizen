'use client';

import { useEffect, useState, useRef } from 'react';

interface RankResult {
  rank: number;
  totalPlayers: number;
  totalScore: number;
}

interface CutsceneOverlayProps {
  bossIntroData: any;
  mapClearData: any;
  isGameOver: boolean;
  isPaused: boolean;
  onCloseBossIntro: () => void;
  onRestartGame: () => void;
  onNextMap: () => void;
  onResumeGame: () => void;
  onRestartFromBeginning: () => void;
  deathCount?: number;
  rankResult?: RankResult | null;
  isSubmitting?: boolean;
  isSaved?: boolean;
  userId?: string;
  currentMapKey?: string;
}

// Số đếm ngược animated
function useCountUp(target: number, duration = 1800, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active || target === 0) { setCount(target); return; }
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, active]);
  return count;
}

// Map config
const MAP_META: Record<string, { label: string; emoji: string; color: string; glow: string; nextLabel: string }> = {
  hanoi:  { label: 'Hà Nội',  emoji: '🏙️', color: '#00e5ff', glow: 'rgba(0,229,255,0.35)', nextLabel: 'Tiến tới Tokyo' },
  tokyo:  { label: 'Tokyo',   emoji: '⛩️', color: '#ff55bb', glow: 'rgba(255,85,187,0.35)', nextLabel: 'Tiến tới Đà Nẵng' },
  danang: { label: 'Đà Nẵng', emoji: '🌊', color: '#00ff87', glow: 'rgba(0,255,135,0.35)', nextLabel: 'Xem Bảng Xếp Hạng' },
};

const VTI_MESSAGES: Record<string, string> = {
  hanoi:  'VTI khởi nguồn từ Hà Nội với tinh thần Tôn trọng (Respect) đồng nghiệp, khách hàng và đối tác. Sự tôn trọng này tạo nên mối quan hệ bền vững, đoàn kết để chinh phục những cột mốc vĩ đại tiếp theo.',
  tokyo:  'Từ Hà Nội vươn tới Tokyo — VTI mang tinh thần Trách nhiệm (Responsibility) vào từng dòng code, từng cam kết với khách hàng Nhật Bản. Trách nhiệm là nền tảng để xây dựng niềm tin lâu dài.',
  danang: 'Hành trình VTI 9 năm kết thúc tại Đà Nẵng — nơi biển và núi gặp nhau như Công nghệ và Con người gặp nhau. Kaizen (改善) không có điểm dừng; mỗi ngày là một cơ hội để trở nên tốt hơn. Cảm ơn bạn đã đồng hành cùng VTI!',
};

export default function CutsceneOverlay({
  bossIntroData,
  mapClearData,
  isGameOver,
  isPaused,
  onCloseBossIntro,
  onRestartGame,
  onNextMap,
  onResumeGame,
  onRestartFromBeginning,
  deathCount = 0,
  rankResult,
  isSubmitting = false,
  isSaved = false,
  userId,
  currentMapKey = 'hanoi',
}: CutsceneOverlayProps) {
  const [animIn, setAnimIn] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  // Trigger animation khi Victory screen mount
  useEffect(() => {
    if (mapClearData) {
      const t1 = setTimeout(() => setAnimIn(true), 100);
      const t2 = setTimeout(() => setConfettiActive(true), 400);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setAnimIn(false);
      setConfettiActive(false);
    }
  }, [mapClearData]);

  // Handle ENTER key confirmation for active overlays (Game Over, Paused, Boss Intro, Map Clear)
  useEffect(() => {
    const isOverlayActive = isGameOver || isPaused || !!bossIntroData || !!mapClearData;
    if (!isOverlayActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();

        if (isGameOver) {
          const revivesLeft = Math.max(0, 3 - deathCount);
          const hasRevives = revivesLeft > 0;
          if (hasRevives) {
            onRestartGame();
          } else if (!(isSubmitting && !isSaved)) {
            onRestartFromBeginning();
          }
        } else if (isPaused) {
          onResumeGame();
        } else if (bossIntroData) {
          onCloseBossIntro();
        } else if (mapClearData) {
          if (!(isSubmitting && !isSaved)) {
            onNextMap();
          }
        }
      }
    };

    // Listen in the capture phase to intercept before other handlers
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [
    isGameOver,
    isPaused,
    bossIntroData,
    mapClearData,
    deathCount,
    isSubmitting,
    isSaved,
    onRestartGame,
    onRestartFromBeginning,
    onResumeGame,
    onCloseBossIntro,
    onNextMap
  ]);

  // ─── 1. GAME OVER ─────────────────────────────────────────────────────────
  if (isGameOver) {
    const revivesLeft = Math.max(0, 3 - deathCount);
    const hasRevives = revivesLeft > 0;

    return (
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center font-mono animate-fadeIn">
        <div className="max-w-md w-full" style={{
          background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0a0a 100%)',
          border: `1px solid ${hasRevives ? 'rgba(255,59,48,0.4)' : 'rgba(255,165,0,0.4)'}`,
          borderRadius: '24px',
          padding: '32px',
          boxShadow: hasRevives 
            ? '0 0 60px rgba(255,59,48,0.2), inset 0 0 40px rgba(255,59,48,0.05)'
            : '0 0 60px rgba(255,165,0,0.2), inset 0 0 40px rgba(255,165,0,0.05)',
        }}>
          {/* Skull / Warning icon */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: hasRevives ? 'rgba(255,59,48,0.12)' : 'rgba(255,165,0,0.12)', 
            border: `1px solid ${hasRevives ? 'rgba(255,59,48,0.4)' : 'rgba(255,165,0,0.4)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: 32,
            animation: 'pulse 2s ease-in-out infinite',
          }}>{hasRevives ? '💀' : '⚠️'}</div>

          <h2 style={{ fontSize: 28, fontWeight: 900, color: hasRevives ? '#ff3b30' : '#ff9500', letterSpacing: 2, marginBottom: 8, fontFamily: '"Orbitron", monospace' }}>
            {hasRevives ? 'BẢN GHI LỖI' : 'HỆ THỐNG CRASH'}
          </h2>
          <div style={{ fontSize: 10, color: hasRevives ? 'rgba(255,59,48,0.7)' : 'rgba(255,165,0,0.7)', letterSpacing: 3, marginBottom: 20, fontFamily: 'monospace' }}>
            {hasRevives ? 'FATAL: NULL_POINTER_EXCEPTION' : 'CRITICAL: RECOVERY_FAILED'}
          </div>

          <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
            {hasRevives 
              ? `Hệ thống gặp sự cố nghiêm trọng! Bạn còn ${revivesLeft} lượt hồi sinh tại Checkpoint để tiếp tục hành trình.`
              : 'Bạn đã thất bại 3 lần liên tiếp! Không thể tiếp tục phục hồi từ checkpoint và bắt buộc phải re-build từ điểm xuất phát.'}
          </p>

          {/* Nếu hết lượt, hiển thị điểm số tích lũy và xếp hạng */}
          {!hasRevives && (
            <div style={{ marginBottom: 24 }}>
              {isSubmitting && !rankResult && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  marginBottom: 14,
                }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #ff9500', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                  <span style={{ color: '#64748b', fontSize: 11, fontFamily: 'monospace' }}>Đang ghi nhận điểm số...</span>
                </div>
              )}

              {rankResult && (
                <RankBadge rank={rankResult.rank} totalPlayers={rankResult.totalPlayers} totalScore={rankResult.totalScore} color="#ff9500" />
              )}
            </div>
          )}

          {hasRevives ? (
            <button
              onClick={onRestartGame}
              style={{
                width: '100%', background: 'linear-gradient(135deg, #ff3b30, #c0392b)',
                color: '#fff', border: 'none', borderRadius: 12, padding: '14px 24px',
                fontWeight: 800, fontSize: 14, cursor: 'pointer', letterSpacing: 1,
                transition: 'transform 0.15s, box-shadow 0.15s',
                boxShadow: '0 4px 24px rgba(255,59,48,0.4)',
              }}
              onMouseEnter={e => { (e.currentTarget as any).style.transform = 'scale(1.03)'; }}
              onMouseLeave={e => { (e.currentTarget as any).style.transform = 'scale(1)'; }}
            >
              🔄 HỒI SINH TẠI CHECKPOINT ({revivesLeft})
            </button>
          ) : (
            <button
              onClick={onRestartFromBeginning}
              disabled={isSubmitting && !isSaved}
              style={{
                width: '100%', background: (isSubmitting && !isSaved) 
                  ? 'rgba(255,255,255,0.06)' 
                  : 'linear-gradient(135deg, #ff9500, #ff8500)',
                color: (isSubmitting && !isSaved) ? '#475569' : '#070913', 
                border: 'none', borderRadius: 12, padding: '14px 24px',
                fontWeight: 800, fontSize: 14, cursor: (isSubmitting && !isSaved) ? 'not-allowed' : 'pointer', letterSpacing: 1,
                transition: 'transform 0.15s, box-shadow 0.15s',
                boxShadow: (isSubmitting && !isSaved) ? 'none' : '0 4px 24px rgba(255,149,0,0.4)',
              }}
              onMouseEnter={e => { if (isSaved || (!isSubmitting)) (e.currentTarget as any).style.transform = 'scale(1.03)'; }}
              onMouseLeave={e => { if (isSaved || (!isSubmitting)) (e.currentTarget as any).style.transform = 'scale(1)'; }}
            >
              {isSubmitting && !isSaved ? 'ĐANG LƯU ĐIỂM...' : '⚠️ BẮT ĐẦU LẠI TỪ ĐẦU'}
            </button>
          )}
        </div>

        <style>{`
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
          @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
          .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        `}</style>
      </div>
    );
  }

  // ─── 1.5. GAME PAUSED ─────────────────────────────────────────────────────
  if (isPaused) {
    return (
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center font-mono animate-fadeIn">
        <div className="max-w-md w-full" style={{
          background: 'linear-gradient(135deg, #070913 0%, #0b0e26 100%)',
          border: '1px solid rgba(0,229,255,0.4)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 0 60px rgba(0,229,255,0.2), inset 0 0 40px rgba(0,229,255,0.05)',
        }}>
          {/* Pause Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: 32,
            color: '#00e5ff',
          }}>⏸️</div>

          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#00e5ff', letterSpacing: 2, marginBottom: 8, fontFamily: '"Orbitron", monospace' }}>
            TẠM DỪNG CHƠI
          </h2>
          <div style={{ fontSize: 10, color: 'rgba(0,229,255,0.7)', letterSpacing: 3, marginBottom: 20 }}>
            KAIZEN JOURNEY IS ON HOLD
          </div>

          <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.7, marginBottom: 28 }}>
            Hành trình đang được tạm dừng. Bạn muốn tiếp tục thử thách hay bắt đầu lại chặng đua?
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={onResumeGame}
              style={{
                width: '100%', background: 'linear-gradient(135deg, #00ff87, #00b359)',
                color: '#070913', border: 'none', borderRadius: 12, padding: '12px 24px',
                fontWeight: 800, fontSize: 13, cursor: 'pointer', letterSpacing: 1,
                boxShadow: '0 4px 20px rgba(0,255,135,0.3)', marginBottom: 8,
                transition: 'transform 0.1s',
              }}
              onMouseEnter={e => { (e.currentTarget as any).style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { (e.currentTarget as any).style.transform = 'scale(1)'; }}
            >
              ▶️ TIẾP TỤC CHẠY
            </button>
            
            <button
              onClick={onRestartGame}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)',
                color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px 24px',
                fontWeight: 800, fontSize: 13, cursor: 'pointer', letterSpacing: 1,
                marginBottom: 8, transition: 'background 0.2s, transform 0.1s',
              }}
              onMouseEnter={e => { (e.currentTarget as any).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as any).style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { (e.currentTarget as any).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as any).style.transform = 'scale(1)'; }}
            >
              🔄 CHƠI LẠI TỪ CHECKPOINT
            </button>

            <button
              onClick={onRestartFromBeginning}
              style={{
                width: '100%', background: 'rgba(255,59,48,0.1)',
                color: '#ff3b30', border: '1px solid rgba(255,59,48,0.3)', borderRadius: 12, padding: '12px 24px',
                fontWeight: 800, fontSize: 13, cursor: 'pointer', letterSpacing: 1,
                transition: 'background 0.2s, transform 0.1s',
              }}
              onMouseEnter={e => { (e.currentTarget as any).style.background = 'rgba(255,59,48,0.18)'; (e.currentTarget as any).style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { (e.currentTarget as any).style.background = 'rgba(255,59,48,0.1)'; (e.currentTarget as any).style.transform = 'scale(1)'; }}
            >
              ⏮️ CHƠI LẠI TỪ ĐẦU
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── 2. BOSS INTRO ────────────────────────────────────────────────────────
  if (bossIntroData) {
    return (
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-35 flex flex-col items-center justify-center p-6 text-center font-mono">
        <div style={{
          maxWidth: 480, width: '100%',
          background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0606 100%)',
          border: '1px solid rgba(255,59,48,0.5)', borderRadius: 24, padding: 32,
          boxShadow: '0 0 80px rgba(255,59,48,0.25)',
          animation: 'bossAlert 0.5s ease-out',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '4px 14px', borderRadius: 999,
            background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.4)',
            color: '#ff3b30', fontSize: 10, fontWeight: 700, letterSpacing: 3,
            marginBottom: 20, textTransform: 'uppercase',
          }}>
            ⚠️ WARNING: PRODUCTION ERROR ⚠️
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 12, lineHeight: 1.2 }}>
            {bossIntroData.title}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
            {bossIntroData.body}
          </p>

          {/* Boss threat card */}
          <div style={{
            width: '100%', padding: '16px', borderRadius: 16,
            background: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255,59,48,0.2)',
            marginBottom: 24, textAlign: 'left', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: 'radial-gradient(circle, rgba(255,59,48,0.15) 0%, transparent 70%)' }} />
            <div style={{ fontSize: 10, color: 'rgba(255,59,48,0.6)', letterSpacing: 3, marginBottom: 8, fontFamily: 'monospace' }}>
              THREAT PROFILE DETECTED
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              {bossIntroData.bossName || 'Deadline Cổ Phố'}
            </div>
            <div style={{ fontSize: 10, color: '#64748b', letterSpacing: 2, fontFamily: 'monospace' }}>
              TYPE: CLOCK_DEADLINE_MACHINE · TIER: PRODUCTION_CRITICAL
            </div>
          </div>

          <button
            onClick={onCloseBossIntro}
            style={{
              width: '100%', background: 'linear-gradient(135deg, #ff3b30, #ff6b00)',
              color: '#fff', border: 'none', borderRadius: 12, padding: '14px 24px',
              fontWeight: 800, fontSize: 14, cursor: 'pointer', letterSpacing: 1,
              boxShadow: '0 4px 24px rgba(255,59,48,0.4)', transition: 'transform 0.15s',
            }}
            onMouseEnter={e => { (e.target as any).style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { (e.target as any).style.transform = 'scale(1)'; }}
          >
            ⚔️ VÀO TRẬN — SỬA LỖI NGAY
          </button>
        </div>
        <style>{`@keyframes bossAlert { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }`}</style>
      </div>
    );
  }

  // ─── 3. MAP CLEAR — VICTORY SCREEN ───────────────────────────────────────
  if (mapClearData) {
    const { score, flasksCollected, heartsRemaining, gameTime } = mapClearData.stats;
    const cutscene = mapClearData.cutscene;
    const meta = MAP_META[currentMapKey] || MAP_META.hanoi;
    const vtiMsg = VTI_MESSAGES[currentMapKey] || VTI_MESSAGES.hanoi;
    const isFinalMap = currentMapKey === 'danang';

    return (
      <div style={{
        position: 'absolute', inset: 0, zIndex: 30,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.95) 70%)',
        backdropFilter: 'blur(12px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 16, overflow: 'hidden',
      }}>
        {/* Confetti particles */}
        {confettiActive && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                top: '-5%',
                left: `${(i * 4.2) % 100}%`,
                width: i % 3 === 0 ? 8 : 5,
                height: i % 3 === 0 ? 8 : 5,
                borderRadius: i % 2 === 0 ? '50%' : 2,
                background: i % 4 === 0 ? meta.color : i % 4 === 1 ? '#ff8500' : i % 4 === 2 ? '#fff' : '#00ff87',
                opacity: 0.85,
                animation: `confettiFall ${1.8 + (i % 5) * 0.4}s ${(i * 0.12) % 1.5}s linear infinite`,
              }} />
            ))}
          </div>
        )}

        {/* Main card */}
        <div style={{
          maxWidth: 560, width: '100%', position: 'relative',
          background: 'linear-gradient(160deg, rgba(11,14,38,0.97) 0%, rgba(7,9,19,0.99) 100%)',
          border: `1px solid ${meta.color}33`,
          borderRadius: 28,
          padding: '28px 32px',
          boxShadow: `0 0 80px ${meta.glow}, 0 40px 80px rgba(0,0,0,0.6), inset 0 0 60px rgba(0,0,0,0.3)`,
          transform: animIn ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
          opacity: animIn ? 1 : 0,
          transition: 'transform 0.55s cubic-bezier(0.175,0.885,0.32,1.275), opacity 0.4s ease',
          overflow: 'hidden',
        }}>
          {/* Glow orb top */}
          <div style={{
            position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
            width: 200, height: 120, borderRadius: '50%',
            background: `radial-gradient(ellipse, ${meta.glow} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          {/* Header badge */}
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px',
              borderRadius: 999, background: 'rgba(255,215,0,0.15)', border: '1px solid #ffd700',
              color: '#ffd700', fontSize: 11, fontWeight: 800, letterSpacing: 3,
              textTransform: 'uppercase', fontFamily: 'monospace',
              marginBottom: 14,
              boxShadow: '0 0 15px rgba(255,215,0,0.3)',
            }}>
              🎉 TIÊU DIỆT BOSS THÀNH CÔNG 🎉
            </div>

            <div style={{
              fontSize: 10, color: meta.color, letterSpacing: 2, fontWeight: 700,
              textTransform: 'uppercase', marginBottom: 10, fontFamily: 'monospace'
            }}>
              {meta.emoji} CHẶNG ĐƯỜNG {meta.label.toUpperCase()} HOÀN TẤT {meta.emoji}
            </div>

            <h2 style={{
              fontSize: 28, fontWeight: 900, color: '#fff',
              textShadow: `0 0 30px ${meta.glow}`,
              marginBottom: 8, lineHeight: 1.2,
              fontFamily: '"Orbitron", "Rajdhani", monospace',
            }}>
              {cutscene?.title || `${meta.label} — Đã Hoàn Thành!`}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6, maxWidth: 420, margin: '0 auto' }}>
              {cutscene?.body || vtiMsg}
            </p>
          </div>

          {/* Stats grid */}
          <ScoreDisplay score={score} isActive={animIn} metaColor={meta.color} />

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18,
          }}>
            <StatCard label="XP Flasks" value={`+${flasksCollected || 0}`} icon="🧪" color="#00e5ff" />
            <StatCard label="Máu còn lại" value={`${heartsRemaining || 0}/3`} icon="❤️" color="#ff3b30" />
            <StatCard label="Thời gian" value={`${gameTime || 0}s`} icon="⏱️" color="#ff8500" />
          </div>

          {/* Rank badge */}
          {isSubmitting && !rankResult && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
              borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: 18,
            }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${meta.color}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ color: '#64748b', fontSize: 12, fontFamily: 'monospace' }}>Đang lưu điểm lên bảng xếp hạng...</span>
            </div>
          )}

          {rankResult && (
            <RankBadge rank={rankResult.rank} totalPlayers={rankResult.totalPlayers} totalScore={rankResult.totalScore} color={meta.color} />
          )}

          {/* VTI Cultural message */}
          <div style={{
            padding: '12px 16px', borderRadius: 14,
            background: `${meta.color}08`, border: `1px solid ${meta.color}20`,
            marginBottom: 18,
          }}>
            <div style={{ fontSize: 10, color: meta.color, letterSpacing: 2, fontWeight: 700, marginBottom: 6, fontFamily: 'monospace' }}>
              💡 THÔNG ĐIỆP KAIZEN VTI
            </div>
            <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>{vtiMsg}</p>
          </div>

          {/* Hướng dẫn và Nút lựa chọn */}
          <div style={{
            fontSize: 11,
            color: '#64748b',
            lineHeight: 1.6,
            textAlign: 'center',
            marginBottom: 18,
            fontStyle: 'italic',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: 12
          }}>
            ℹ️ <strong>Hướng dẫn:</strong> Chọn <strong>TIẾP TỤC HÀNH TRÌNH</strong> để mở khóa map tiếp theo, hoặc chọn <strong>CHƠI LẠI MAP</strong> để vượt qua kỷ lục điểm số hiện tại của bạn.
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {/* Chơi lại Map */}
            <button
              onClick={onRestartFromBeginning}
              disabled={isSubmitting && !isSaved}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 14,
                padding: '14px 16px',
                fontWeight: 800,
                fontSize: 13,
                cursor: (isSubmitting && !isSaved) ? 'not-allowed' : 'pointer',
                letterSpacing: 0.5,
                transition: 'background 0.2s, transform 0.1s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
              onMouseEnter={e => { if (isSaved || !isSubmitting) { (e.currentTarget as any).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as any).style.transform = 'scale(1.02)'; } }}
              onMouseLeave={e => { if (isSaved || !isSubmitting) { (e.currentTarget as any).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as any).style.transform = 'scale(1)'; } }}
            >
              🔄 CHƠI LẠI MAP
            </button>

            {/* Đi tiếp */}
            <button
              onClick={onNextMap}
              disabled={isSubmitting && !isSaved}
              style={{
                flex: 1.2,
                background: (isSubmitting && !isSaved)
                  ? 'rgba(255,255,255,0.06)'
                  : `linear-gradient(135deg, ${meta.color}, ${currentMapKey === 'danang' ? '#00c9ff' : '#0054a6'})`,
                color: (isSubmitting && !isSaved) ? '#475569' : (currentMapKey === 'danang' ? '#001a10' : '#fff'),
                border: `1px solid ${(isSubmitting && !isSaved) ? 'rgba(255,255,255,0.08)' : meta.color + '60'}`,
                borderRadius: 14,
                padding: '14px 16px',
                fontWeight: 800,
                fontSize: 13,
                cursor: (isSubmitting && !isSaved) ? 'not-allowed' : 'pointer',
                letterSpacing: 0.5,
                transition: 'transform 0.15s, box-shadow 0.15s',
                boxShadow: (isSubmitting && !isSaved) ? 'none' : `0 4px 28px ${meta.glow}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
              onMouseEnter={e => { if (isSaved || !isSubmitting) (e.currentTarget as any).style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { if (isSaved || !isSubmitting) (e.currentTarget as any).style.transform = 'scale(1)'; }}
            >
              {isSubmitting && !isSaved ? (
                <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #475569', borderTopColor: '#94a3b8', animation: 'spin 0.8s linear infinite' }} /> Lưu điểm...</>
              ) : isFinalMap ? (
                <>🏆 XẾP HẠNG</>
              ) : (
                <>{currentMapKey === 'hanoi' ? '🇯🇵 TOKYO →' : '🌊 ĐÀ NẴNG →'}</>
              )}
            </button>
          </div>
        </div>

        <style>{`
          @keyframes confettiFall {
            0%   { transform: translateY(-10px) rotate(0deg);   opacity: 0.9; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes countUp { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
          @keyframes rankReveal {
            0%   { opacity: 0; transform: translateY(12px) scale(0.9); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    );
  }

  return null;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ScoreDisplay({ score, isActive, metaColor }: { score: number; isActive: boolean; metaColor: string }) {
  const displayScore = useCountUp(score, 2000, isActive);
  return (
    <div style={{
      textAlign: 'center', padding: '18px', borderRadius: 16,
      background: `linear-gradient(135deg, ${metaColor}10 0%, rgba(0,0,0,0) 100%)`,
      border: `1px solid ${metaColor}25`, marginBottom: 14,
    }}>
      <div style={{ fontSize: 10, color: metaColor, letterSpacing: 3, fontFamily: 'monospace', marginBottom: 4 }}>
        TỔNG ĐIỂM
      </div>
      <div style={{
        fontSize: 48, fontWeight: 900, color: '#fff',
        fontFamily: '"Orbitron", monospace',
        textShadow: `0 0 30px ${metaColor}`,
        animation: isActive ? 'countUp 0.6s ease-out' : 'none',
      }}>
        {displayScore.toLocaleString('vi-VN')}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div style={{
      padding: '12px 10px', borderRadius: 12, textAlign: 'center',
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color, fontFamily: 'monospace' }}>{value}</div>
      <div style={{ fontSize: 9, color: '#475569', letterSpacing: 1, marginTop: 2, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

function RankBadge({ rank, totalPlayers, totalScore, color }: { rank: number; totalPlayers: number; totalScore: number; color: string }) {
  const isTop3 = rank <= 3;
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏅';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
      borderRadius: 14, marginBottom: 18,
      background: isTop3
        ? `linear-gradient(135deg, ${color}18 0%, rgba(0,0,0,0) 100%)`
        : 'rgba(255,255,255,0.04)',
      border: `1px solid ${isTop3 ? color + '50' : 'rgba(255,255,255,0.1)'}`,
      boxShadow: isTop3 ? `0 0 20px ${color}20` : 'none',
      animation: 'rankReveal 0.6s ease-out',
    }}>
      <div style={{ fontSize: 32 }}>{medal}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, color: '#64748b', letterSpacing: 2, fontFamily: 'monospace', marginBottom: 3 }}>
          XẾP HẠNG TOÀN VTI
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: isTop3 ? color : '#fff', fontFamily: '"Orbitron", monospace' }}>
          #{rank} <span style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>/ {totalPlayers} người</span>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 9, color: '#64748b', marginBottom: 2, letterSpacing: 1 }}>TỔNG ĐIỂM</div>
        <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: 'monospace' }}>
          {totalScore.toLocaleString('vi-VN')}
        </div>
      </div>
    </div>
  );
}
