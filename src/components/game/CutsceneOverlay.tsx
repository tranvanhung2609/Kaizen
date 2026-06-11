'use client';

interface CutsceneOverlayProps {
  bossIntroData: any; // { title: string, body: string, imageAsset: string } or null
  mapClearData: any;  // { stats: { score, flasksCollected, heartsRemaining, gameTime } } or null
  isGameOver: boolean;
  onCloseBossIntro: () => void;
  onRestartGame: () => void;
  onNextMap: () => void;
}

export default function CutsceneOverlay({
  bossIntroData,
  mapClearData,
  isGameOver,
  onCloseBossIntro,
  onRestartGame,
  onNextMap,
}: CutsceneOverlayProps) {
  // 1. GAME OVER OVERLAY
  if (isGameOver) {
    return (
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center font-mono">
        <div className="max-w-md w-full glass-panel border-brand-red p-8 rounded-3xl glow-red border-glow-cycle">
          <div className="w-16 h-16 rounded-full bg-brand-red/10 border border-brand-red/40 flex items-center justify-center mx-auto mb-6 text-brand-red animate-pulse">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h2 className="text-3xl font-extrabold text-brand-red text-glow-red tracking-wider font-display mb-4 uppercase">
            BẢN GHI LỖI (GAME OVER)
          </h2>
          
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Hệ thống gặp sự cố nghiêm trọng (NullPointerException)! Trở về Checkpoint gần nhất để sửa đổi mã nguồn và tiếp tục hành trình Kaizen.
          </p>

          <button
            onClick={onRestartGame}
            className="w-full bg-brand-red text-white hover:bg-red-600 transition-all duration-300 font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-brand-red/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            HỒI SINH & RE-DEPLOY
          </button>
        </div>
      </div>
    );
  }

  // 2. BOSS INTRO OVERLAY
  if (bossIntroData) {
    return (
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-35 flex flex-col items-center justify-center p-6 text-center font-mono">
        <div className="max-w-lg w-full bg-slate-950/90 border border-brand-red/40 p-8 rounded-3xl glow-red animate-pulse-slow">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-red/15 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-widest mb-4">
            ⚠️ WARNING: PRODUCTION ERROR ⚠️
          </div>

          <h2 className="text-3xl font-black text-white font-display uppercase mb-4 tracking-tight">
            {bossIntroData.title}
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed mb-6 font-sans">
            {bossIntroData.body}
          </p>

          {/* Dummy Boss image display area */}
          <div className="w-full h-40 bg-navy-medium/60 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
            <span className="text-xs text-brand-red/60 uppercase font-mono absolute top-2 left-2">
              Threat profile detected
            </span>
            <div className="text-center z-15">
              <div className="text-lg font-bold text-white font-display">Deadline Cổ Phố</div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">TYPE: CLOCK_DEADLINE_MACHINE</div>
            </div>
          </div>

          <button
            onClick={onCloseBossIntro}
            className="w-full bg-gradient-to-r from-brand-red to-orange-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            XÁC NHẬN SỬA LỖI (VÀO TRẬN)
          </button>
        </div>
      </div>
    );
  }

  // 3. MAP CLEAR OVERLAY
  if (mapClearData) {
    const { score, flasksCollected, heartsRemaining, gameTime } = mapClearData.stats;
    const cutscene = mapClearData.cutscene;

    return (
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center font-mono">
        <div className="max-w-2xl w-full glass-panel border-brand-cyan p-8 md:p-12 rounded-3xl glow-cyan animate-pulse-slow">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/15 border border-brand-cyan/35 text-brand-cyan text-xs font-bold uppercase tracking-widest mb-6">
            🎉 MISSION ACCOMPLISHED 🎉
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-cyan text-glow-cyan font-display mb-4">
            {cutscene.title}
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed mb-8 max-w-md mx-auto font-sans">
            {cutscene.body}
          </p>

          {/* Stats details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-navy-medium/60 rounded-2xl border border-slate-800 mb-8 text-left">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Tổng điểm</span>
              <span className="text-brand-cyan text-xl font-bold">{score}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Flasks nhặt</span>
              <span className="text-white text-xl font-bold">+{flasksCollected}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Máu còn lại</span>
              <span className="text-brand-red text-xl font-bold">{heartsRemaining} / 3</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Thời gian</span>
              <span className="text-gold text-xl font-bold">{gameTime}s</span>
            </div>
          </div>

          {/* VTI Cultural message info board */}
          <div className="p-4 rounded-xl bg-brand-cyan/5 border border-brand-cyan/20 text-left mb-8">
            <span className="text-[10px] text-brand-cyan uppercase tracking-wider block font-bold mb-1">
              💡 THÔNG ĐIỆP VĂN HÓA KAIZEN
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
              VTI khởi nguồn từ Hà Nội với tinh thần <strong className="text-white">Tôn trọng (Respect)</strong> đồng nghiệp, khách hàng và đối tác. Sự tôn trọng này tạo nên mối quan hệ bền vững, đoàn kết để chinh phục những cột mốc vĩ đại tiếp theo.
            </p>
          </div>

          <button
            onClick={onNextMap}
            className="w-full bg-brand-cyan text-gray-900 hover:bg-cyan-400 transition-all duration-300 font-bold py-4 px-6 rounded-xl shadow-lg shadow-brand-cyan/25 hover:scale-[1.02] active:scale-[0.98] uppercase"
          >
            Lưu Điểm & Hoàn Thành Chặng
          </button>
        </div>
      </div>
    );
  }

  // Not active
  return null;
}
