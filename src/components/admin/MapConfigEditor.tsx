'use client';

import { useState, useEffect } from 'react';

interface MapConfigEditorProps {
  initialConfigs: any[];
}

export default function MapConfigEditor({ initialConfigs }: MapConfigEditorProps) {
  const [selectedMap, setSelectedMap] = useState<'hanoi' | 'tokyo' | 'danang'>('hanoi');
  const [configs, setConfigs] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Load configuration based on selection
  useEffect(() => {
    // 1. Check if DB has configuration first
    const dbConfig = initialConfigs.find((c) => c.mapKey === selectedMap);
    if (dbConfig) {
      setConfigs(dbConfig);
      return;
    }

    // 2. Default configuration values if not found in database
    const defaultData = {
      mapKey: selectedMap,
      scoringRules: {
        experienceFlask: 50,
        groundBugDefeated: 150,
        flyingBugDefeated: 200,
        bossDefeated: 2000,
        mapClearBonus: 1000,
        remainingHeartBonus: 300,
      },
      difficultyConfig: {
        baseSpeed: selectedMap === 'hanoi' ? 5.5 : selectedMap === 'tokyo' ? 6.5 : 7.5,
        spawnRate: selectedMap === 'hanoi' ? 0.5 : selectedMap === 'tokyo' ? 0.7 : 0.9,
        bossHp: selectedMap === 'hanoi' ? 6 : selectedMap === 'tokyo' ? 8 : 12,
      },
      culturalMessage: selectedMap === 'hanoi' 
        ? 'VTI khởi nguồn từ Hà Nội với tinh thần Tôn trọng.' 
        : selectedMap === 'tokyo' 
        ? 'Chinh phục thị trường Nhật Bản bằng sự Kaizen.' 
        : 'Nhận trách nhiệm chủ động bứt phá công nghệ toàn cầu.',
      cutsceneConfig: {
        boss_intro: {
          title: 'Cảnh báo Deadline!',
          body: 'Boss Deadline đã xuất hiện chặn cổng Staging!',
        },
        map_clear: {
          title: 'Hoàn thành chặng!',
          body: 'Chúc mừng bạn đã vượt qua thử thách!',
        },
      },
    };
    setConfigs(defaultData);
  }, [selectedMap, initialConfigs]);

  const handleScoringChange = (key: string, val: number) => {
    setConfigs((prev: any) => ({
      ...prev,
      scoringRules: {
        ...prev.scoringRules,
        [key]: val,
      },
    }));
  };

  const handleDifficultyChange = (key: string, val: number) => {
    setConfigs((prev: any) => ({
      ...prev,
      difficultyConfig: {
        ...prev.difficultyConfig,
        [key]: val,
      },
    }));
  };

  const handleCutsceneChange = (phase: 'boss_intro' | 'map_clear', field: 'title' | 'body', val: string) => {
    setConfigs((prev: any) => ({
      ...prev,
      cutsceneConfig: {
        ...prev.cutsceneConfig,
        [phase]: {
          ...prev.cutsceneConfig[phase],
          [field]: val,
        },
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const response = await fetch('/api/admin/save-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mapKey: configs.mapKey,
          scoringRules: configs.scoringRules,
          difficultyConfig: configs.difficultyConfig,
          cutsceneConfig: configs.cutsceneConfig,
          culturalMessage: configs.culturalMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error('Error saving config:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!configs.scoringRules) {
    return <div className="text-slate-400 text-xs font-mono animate-pulse">Đang tải cấu hình màn chơi...</div>;
  }

  // Calculate difficulty labels
  const speed = configs.difficultyConfig.baseSpeed || 5.5;
  let speedBadge = { label: 'Vừa', cls: 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/30' };
  if (speed < 5.0) speedBadge = { label: 'Dễ', cls: 'bg-green-500/20 text-green-400 border-green-500/30' };
  else if (speed > 7.5 && speed <= 10.0) speedBadge = { label: 'Khó', cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
  else if (speed > 10.0) speedBadge = { label: 'Cực Hạn ⚡', cls: 'bg-brand-red/20 text-brand-red border-brand-red/30 animate-pulse' };

  const bossHp = configs.difficultyConfig.bossHp || 6;

  return (
    <div className="flex flex-col gap-6 text-xs font-sans">
      
      {/* Map selectors */}
      <div className="flex bg-navy-medium p-1 rounded-xl w-fit border border-slate-800">
        {(['hanoi', 'tokyo', 'danang'] as const).map((map) => (
          <button
            key={map}
            onClick={() => setSelectedMap(map)}
            className={`px-5 py-2 rounded-lg font-bold text-[10px] uppercase transition-all tracking-wider ${
              selectedMap === map
                ? 'bg-brand-cyan text-gray-900 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {map === 'hanoi' ? '⛩️ Hà Nội' : map === 'tokyo' ? '🌸 Tokyo' : '🏖️ Đà Nẵng'}
          </button>
        ))}
      </div>

      {/* Editor Panels Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Panel 1: Scoring Rules */}
        <div className="p-5 rounded-xl bg-navy-medium/60 border border-slate-800/80 flex flex-col gap-4">
          <h3 className="font-bold text-brand-cyan text-[10px] uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center justify-between">
            <span>📊 Quy tắc tính điểm (Scoring)</span>
            <span className="text-[8px] font-mono text-slate-500 font-normal">Cấu hình điểm số thực tế</span>
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'experienceFlask', label: 'Bình kinh nghiệm', step: 10, min: 10, max: 200, tooltip: 'Điểm cộng khi nhặt bình nước' },
              { key: 'groundBugDefeated', label: 'Diệt Bug đất (stomp)', step: 50, min: 50, max: 500, tooltip: 'Điểm khi dậm chết Bug bò dưới đất' },
              { key: 'flyingBugDefeated', label: 'Diệt Bug bay (bắn)', step: 50, min: 50, max: 500, tooltip: 'Điểm khi bắn chết Bug bay' },
              { key: 'bossDefeated', label: 'Tiêu diệt Boss', step: 500, min: 500, max: 5000, tooltip: 'Điểm thưởng khi tiêu diệt Boss' },
              { key: 'mapClearBonus', label: 'Thưởng qua màn', step: 200, min: 200, max: 3000, tooltip: 'Cộng thêm khi hoàn thành chặng chạy' },
              { key: 'remainingHeartBonus', label: 'Thưởng 1 máu còn', step: 50, min: 50, max: 1000, tooltip: 'Điểm thưởng cho mỗi trái tim còn lại' },
            ].map((item) => (
              <div key={item.key} className="flex flex-col gap-1 relative group">
                <label className="text-[10px] text-slate-400 font-sans flex items-center justify-between">
                  <span>{item.label}</span>
                  <span className="font-mono text-brand-cyan font-bold">{configs.scoringRules[item.key] || 0}</span>
                </label>
                
                {/* Visual Range Slider */}
                <input
                  type="range"
                  min={item.min}
                  max={item.max}
                  step={item.step}
                  value={configs.scoringRules[item.key] || item.min}
                  onChange={(e) => handleScoringChange(item.key, parseInt(e.target.value) || item.min)}
                  className="w-full accent-brand-cyan bg-navy-dark h-1.5 rounded-lg appearance-none cursor-pointer border border-slate-800"
                />
                
                {/* Description helper tooltip */}
                <span className="text-[8px] text-slate-500 font-mono italic mt-0.5">
                  {item.tooltip}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Physics Difficulty */}
        <div className="p-5 rounded-xl bg-navy-medium/60 border border-slate-800/80 flex flex-col gap-4">
          <h3 className="font-bold text-brand-cyan text-[10px] uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center justify-between">
            <span>⚡ Thông số chuyển động (Difficulty)</span>
            <span className="text-[8px] font-mono text-slate-500 font-normal">Điều phối nhịp độ game</span>
          </h3>

          <div className="flex flex-col gap-4">
            {/* Speed slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Tốc độ chạy cơ bản (multiplier)</span>
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${speedBadge.cls}`}>
                    {speedBadge.label}
                  </span>
                  <span className="font-mono text-brand-cyan font-bold">{speed.toFixed(1)}x</span>
                </div>
              </div>
              <input
                type="range"
                min="2.0"
                max="15.0"
                step="0.1"
                value={speed}
                onChange={(e) => handleDifficultyChange('baseSpeed', parseFloat(e.target.value))}
                className="w-full accent-brand-cyan bg-navy-dark h-1.5 rounded-lg appearance-none cursor-pointer border border-slate-800"
              />
              <span className="text-[8px] text-slate-500 font-mono italic">
                * Tăng tốc độ khiến nhân vật chạy nhanh hơn, đòi hỏi phản xạ nhảy né hố nhanh hơn.
              </span>
            </div>

            {/* Boss HP slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Máu của Boss (Boss HP)</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <div className="flex text-brand-red text-[11px] tracking-tighter">
                    {Array.from({ length: Math.min(6, bossHp) }).map((_, i) => '♥')}
                    {bossHp > 6 && `+${bossHp - 6}`}
                  </div>
                  <span className="text-brand-cyan font-bold ml-1">{bossHp} HP</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={bossHp}
                onChange={(e) => handleDifficultyChange('bossHp', parseInt(e.target.value))}
                className="w-full accent-brand-cyan bg-navy-dark h-1.5 rounded-lg appearance-none cursor-pointer border border-slate-800"
              />
              <span className="text-[8px] text-slate-500 font-mono italic">
                * Số phát bắn cần thiết (Tab/Enter keycaps) trúng Boss để vượt qua chặng.
              </span>
            </div>

            {/* Cultural message input */}
            <div className="flex flex-col gap-1 mt-1">
              <label className="text-[10px] text-slate-400">Thông điệp văn hóa địa phương (Cultural Message)</label>
              <textarea
                rows={2}
                value={configs.culturalMessage || ''}
                onChange={(e) => setConfigs((prev: any) => ({ ...prev, culturalMessage: e.target.value }))}
                className="bg-navy-dark border border-slate-800 px-3 py-2 rounded-lg text-white font-sans text-xs focus:border-brand-cyan focus:outline-none resize-none leading-relaxed"
                placeholder="Nhập thông điệp hiển thị khi qua màn..."
              />
            </div>
          </div>
        </div>

        {/* Panel 3: Cutscenes Dialogue Config */}
        <div className="md:col-span-2 p-5 rounded-xl bg-navy-medium/60 border border-slate-800/80 flex flex-col gap-4">
          <h3 className="font-bold text-brand-cyan text-[10px] uppercase tracking-widest border-b border-slate-800 pb-2">
            🎬 Cấu hình hội thoại cốt truyện (Cutscenes & Dialogue)
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Boss Intro Dialogue */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold text-brand-red uppercase tracking-wider">
                ⚔️ Cảnh báo Boss Xuất Hiện (Boss Intro)
              </span>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-500">Tiêu đề hội thoại</label>
                <input
                  type="text"
                  value={configs.cutsceneConfig.boss_intro?.title || ''}
                  onChange={(e) => handleCutsceneChange('boss_intro', 'title', e.target.value)}
                  className="bg-navy-dark border border-slate-800 px-3 py-2 rounded-lg text-white text-[11px] focus:border-brand-cyan focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-500">Nội dung thoại</label>
                <textarea
                  rows={2}
                  value={configs.cutsceneConfig.boss_intro?.body || ''}
                  onChange={(e) => handleCutsceneChange('boss_intro', 'body', e.target.value)}
                  className="bg-navy-dark border border-slate-800 px-3 py-2 rounded-lg text-white text-[11px] focus:border-brand-cyan focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Map Clear Dialogue */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-wider">
                🌟 Hoàn thành chặng đường (Map Clear)
              </span>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-500">Tiêu đề hội thoại</label>
                <input
                  type="text"
                  value={configs.cutsceneConfig.map_clear?.title || ''}
                  onChange={(e) => handleCutsceneChange('map_clear', 'title', e.target.value)}
                  className="bg-navy-dark border border-slate-800 px-3 py-2 rounded-lg text-white text-[11px] focus:border-brand-cyan focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-500">Nội dung thoại chúc mừng</label>
                <textarea
                  rows={2}
                  value={configs.cutsceneConfig.map_clear?.body || ''}
                  onChange={(e) => handleCutsceneChange('map_clear', 'body', e.target.value)}
                  className="bg-navy-dark border border-slate-800 px-3 py-2 rounded-lg text-white text-[11px] focus:border-brand-cyan focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Actions */}
      <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-2">
        <span className="text-[10px] text-slate-500 font-mono">
          * Các thay đổi được lưu trực tiếp vào cơ sở dữ liệu và áp dụng cho phiên chơi tiếp theo.
        </span>

        <div className="flex items-center gap-3">
          {saveStatus === 'success' && (
            <span className="text-[10px] text-brand-cyan font-bold animate-pulse-slow">
              ✓ Lưu cấu hình thành công!
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-[10px] text-brand-red font-bold animate-pulse-slow">
              ✗ Lỗi kết nối khi lưu!
            </span>
          )}
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-brand-cyan text-gray-900 hover:bg-cyan-400 font-extrabold px-6 py-2.5 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase text-[10px] tracking-wider"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </button>
        </div>
      </div>
      
    </div>
  );
}
