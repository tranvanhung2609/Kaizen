'use client';

import React, { useState } from 'react';

interface ShopItem {
  id: string;
  name: string;
  type: 'skin' | 'title';
  cost: number;
  description: string;
  preview: string; // Emoji or visual representation
}

interface KaizenStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  flasksCount: number;
  ownedItems: string[];
  activeSkin: string;
  activeTitle: string;
  onBuyItem: (cost: number, itemId: string, itemType: 'skin' | 'title') => void;
  onEquipItem: (itemId: string, itemType: 'skin' | 'title') => void;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'skin_hanoi', name: 'Hà Nội Traditional', type: 'skin', cost: 50, description: 'Áo dài cách tân đỏ/vàng cổ kính và năng động.', preview: '👘' },
  { id: 'skin_tokyo', name: 'Tokyo Cyber High-Tech', type: 'skin', cost: 100, description: 'Kimono cơ khí tương lai kết hợp tai nghe Neon.', preview: '🤖' },
  { id: 'skin_danang', name: 'Đà Nẵng Sport Athlete', type: 'skin', cost: 150, description: 'Áo polo VTI và kính thông minh visor siêu ngầu.', preview: '🏃‍♂️' },
  { id: 'title_runner', name: 'Thợ Chạy Deadline', type: 'title', cost: 20, description: 'Gắn mác thợ chạy deadline chuyên nghiệp.', preview: '⚡' },
  { id: 'title_hunter', name: 'Chiến Sĩ Diệt Bug', type: 'title', cost: 40, description: 'Hiển thị danh hiệu thợ săn bug chính hiệu.', preview: '⚔️' },
  { id: 'title_hacker', name: 'Siêu Cấp Hacker', type: 'title', cost: 70, description: 'Danh hiệu cao quý nhất dành cho lập trình viên.', preview: '💻' },
];

export default function KaizenStoreModal({
  isOpen,
  onClose,
  flasksCount,
  ownedItems,
  activeSkin,
  activeTitle,
  onBuyItem,
  onEquipItem,
}: KaizenStoreModalProps) {
  const [activeTab, setActiveTab] = useState<'skin' | 'title'>('skin');

  if (!isOpen) return null;

  const handlePurchase = (item: ShopItem) => {
    if (flasksCount < item.cost) {
      alert('Không đủ bình nước! Hãy chơi game để thu thập thêm.');
      return;
    }
    onBuyItem(item.cost, item.id, item.type);
  };

  const filteredItems = SHOP_ITEMS.filter((item) => item.type === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-navy-medium border border-slate-700/60 rounded-3xl overflow-hidden shadow-2xl p-6 flex flex-col gap-5 border-glow-cycle">
        
        {/* Modal Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h2 className="text-xl font-extrabold font-display text-white uppercase tracking-wider">
              Cửa Hàng Vật Phẩm Kaizen
            </h2>
            <p className="text-xs text-slate-400">
              Sử dụng bình nước (Flasks) nhặt được để mở khóa Mascot Skins & Danh hiệu
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-navy-dark text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* User Balance */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-navy-dark/60 border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-300">Tài sản của bạn:</span>
            <span className="font-display font-black text-brand-cyan text-glow-cyan text-base">
              {flasksCount} 💧
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono italic">
            * Nhặt bình nước khi chạy trên map để tăng điểm số này
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('skin')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
              activeTab === 'skin'
                ? 'border-brand-cyan text-brand-cyan font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🥋 MASCOT SKINS
          </button>
          <button
            onClick={() => setActiveTab('title')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
              activeTab === 'title'
                ? 'border-brand-cyan text-brand-cyan font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🏷️ DANH HIỆU LẬP TRÌNH
          </button>
        </div>

        {/* Items Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-1">
          {activeTab === 'skin' && (
            <div className="p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all bg-navy-dark/40 border-brand-cyan/20">
              <div className="text-4xl">🤖</div>
              <span className="font-bold text-slate-200 text-xs">Mascot Mặc Định</span>
              <span className="text-[9px] text-slate-500 leading-tight">Mascot VTI nguyên bản đồng hành từ chặng đầu.</span>
              <button
                disabled={activeSkin === 'skin_default'}
                onClick={() => onEquipItem('skin_default', 'skin')}
                className={`w-full py-1.5 rounded-lg text-[10px] font-bold mt-2 transition-all ${
                  activeSkin === 'skin_default'
                    ? 'bg-slate-800 text-slate-500 cursor-default'
                    : 'bg-brand-cyan text-navy-dark hover:bg-cyan-400'
                }`}
              >
                {activeSkin === 'skin_default' ? 'Đang Sử Dụng' : 'Trang Bị'}
              </button>
            </div>
          )}

          {filteredItems.map((item) => {
            const isOwned = ownedItems.includes(item.id);
            const isEquipped = item.type === 'skin' ? activeSkin === item.id : activeTitle === item.id;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                  isEquipped
                    ? 'bg-brand-cyan/5 border-brand-cyan shadow-[0_0_8px_rgba(0,229,255,0.2)]'
                    : isOwned
                    ? 'bg-navy-dark/40 border-slate-700/60'
                    : 'bg-navy-dark/20 border-slate-800/80 opacity-90'
                }`}
              >
                <div className="text-4xl relative">
                  {item.preview}
                  {!isOwned && (
                    <div className="absolute -bottom-1 -right-1 bg-navy-medium text-slate-400 border border-slate-700 text-[8px] font-mono px-1 rounded">
                      🔒
                    </div>
                  )}
                </div>
                
                <span className="font-bold text-slate-200 text-xs">{item.name}</span>
                <span className="text-[9px] text-slate-400 leading-tight h-10 flex items-center justify-center">
                  {item.description}
                </span>

                {isOwned ? (
                  <button
                    disabled={isEquipped && item.type === 'skin'}
                    onClick={() => onEquipItem(item.id, item.type)}
                    className={`w-full py-1.5 rounded-lg text-[10px] font-bold mt-2 transition-all ${
                      isEquipped
                        ? item.type === 'skin'
                          ? 'bg-slate-800 text-slate-500 cursor-default'
                          : 'bg-brand-red text-white hover:bg-red-600'
                        : 'bg-brand-cyan text-navy-dark hover:bg-cyan-400'
                    }`}
                  >
                    {isEquipped ? item.type === 'skin' ? 'Đang Sử Dụng' : 'Hủy Trang Bị' : 'Trang Bị'}
                  </button>
                ) : (
                  <button
                    onClick={() => handlePurchase(item)}
                    className="w-full py-1.5 rounded-lg text-[10px] font-black mt-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:opacity-90 transition-all flex items-center justify-center gap-1"
                  >
                    Mở Khóa: {item.cost} 💧
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
