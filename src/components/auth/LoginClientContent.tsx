'use client';

import { useState, useEffect } from 'react';
import GoogleLoginButton from './GoogleLoginButton';

interface LoginClientContentProps {
  redirectTo?: string;
  errorMessage?: string;
}

const SLIDES = [
  {
    id: 'hanoi',
    title: 'Chặng 1: Hà Nội',
    subtitle: 'Tôn trọng Khởi nguồn',
    bgGradient: 'from-brand-red/10 via-red-950/5 to-navy-dark',
    accentColor: 'text-brand-red',
    glowColor: 'text-glow-red',
    icon: '🏯',
    description: 'Vượt qua những Bug Tắc Đường ngột ngạt và chinh phục Boss Deadline Cổ Phố trên chiếc xe chạy deadline cổ kính.',
    flavor: 'VTI khởi nguồn từ Hà Nội với tinh thần Tôn trọng.',
    themeBg: 'rgba(255, 59, 48, 0.03)',
  },
  {
    id: 'tokyo',
    title: 'Chặng 2: Tokyo',
    subtitle: 'Kaizen liên tục',
    bgGradient: 'from-gold/10 via-yellow-950/5 to-navy-dark',
    accentColor: 'text-gold',
    glowColor: 'text-glow-gold',
    icon: '🗼',
    description: 'Chiến đấu với Language Barrier Bug và đối mặt Boss Kaizen Breaker giữa lòng đường Shibuya ngập ánh đèn Neon.',
    flavor: 'Chinh phục thị trường Nhật Bản bằng sự Kaizen.',
    themeBg: 'rgba(255, 215, 0, 0.03)',
  },
  {
    id: 'danang',
    title: 'Chặng 3: Đà Nẵng',
    subtitle: 'Trách nhiệm bứt phá',
    bgGradient: 'from-brand-cyan/15 via-blue-950/5 to-navy-dark',
    accentColor: 'text-brand-cyan',
    glowColor: 'text-glow-cyan',
    icon: '🌉',
    description: 'Chặng cuối đầy thử thách! Đối đầu Cơn bão dữ liệu Sông Hàn và hạ gục Boss Data Storm Dragon hung hãn.',
    flavor: 'Nhận trách nhiệm chủ động bứt phá công nghệ toàn cầu.',
    themeBg: 'rgba(0, 229, 255, 0.03)',
  },
];

export default function LoginClientContent({ redirectTo, errorMessage }: LoginClientContentProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  // Cycle slides every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = SLIDES[activeSlide];

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-navy-dark overflow-hidden scanlines">
      {/* Background Decorative Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-cyan-glow blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-brand-red-glow blur-[140px] pointer-events-none" />

      {/* Main Glassy Card Container */}
      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-12 gap-8 md:gap-0 items-stretch game-container rounded-3xl overflow-hidden border-glow-cycle">
        
        {/* Left Side: Game Branding & Slideshow Preview */}
        <div className={`md:col-span-7 flex flex-col justify-between p-8 md:p-12 transition-all duration-1000 bg-gradient-to-br ${currentSlide.bgGradient}`} style={{ backgroundColor: currentSlide.themeBg }}>
          
          {/* Top Logo */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-navy-light/60 border border-slate-700/60 w-fit">
            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
            <span className="text-[10px] font-mono font-black text-slate-300 uppercase tracking-widest">
              VTI 9-YEAR ADVENTURE RUNNER
            </span>
          </div>

          {/* Dynamic Content Slideshow */}
          <div className="my-8 space-y-5">
            <div className="flex items-center gap-3">
              <span className="text-4xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] animate-bounce">{currentSlide.icon}</span>
              <div className="flex flex-col">
                <h2 className={`text-2xl font-extrabold font-display leading-none ${currentSlide.accentColor} ${currentSlide.glowColor}`}>
                  {currentSlide.title}
                </h2>
                <span className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-widest font-black">
                  {currentSlide.subtitle}
                </span>
              </div>
            </div>

            {/* Redesigned Title Heading */}
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-white">
              KAIZEN
              <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-red text-glow-cyan">
                JOURNEY
              </span>
            </h1>

            <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-lg transition-all duration-500">
              {currentSlide.description}
            </p>

            <div className="p-3 rounded-xl bg-navy-dark/40 border border-slate-800/60 text-[11px] text-slate-400 font-mono italic">
              📢 {currentSlide.flavor}
            </div>
          </div>

          {/* Slider Dots */}
          <div className="flex items-center gap-2 mt-4">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeSlide === idx ? 'w-8 bg-brand-cyan shadow-[0_0_8px_rgba(0,229,255,0.6)]' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

        </div>

        {/* Right Side: Login Panel */}
        <div className="md:col-span-5 flex flex-col justify-center glass-panel p-8 md:p-12 border-l border-slate-700/20">
          
          <div className="flex flex-col items-center text-center">
            {/* Cyber Logo Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-red to-brand-cyan p-0.5 shadow-lg mb-6 flex items-center justify-center animate-pulse">
              <div className="w-full h-full bg-navy-dark rounded-[14px] flex items-center justify-center">
                <span className="font-extrabold text-2xl tracking-tighter text-white font-mono">
                  VJ
                </span>
              </div>
            </div>

            <h3 className="text-xl font-bold font-display text-white mb-2">
              Bắt đầu Cuộc phiêu lưu
            </h3>
            <p className="text-sm text-slate-400 mb-8 max-w-[260px] leading-relaxed">
              Hãy đăng nhập bằng tài khoản Google công ty để ghi nhận thành tích chạy deadline của bạn.
            </p>

            {/* Custom Google SSO button wrapper */}
            <div className="w-full relative group">
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-red opacity-30 blur-sm group-hover:opacity-100 transition duration-300" />
              <div className="relative">
                <GoogleLoginButton redirectTo={redirectTo} />
              </div>
            </div>

            {errorMessage && (
              <div className="mt-6 p-3 rounded-xl bg-brand-red/10 border border-brand-red/30 text-center w-full">
                <p className="text-xs text-brand-red font-semibold leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            )}

            <div className="mt-8 text-center text-[10px] text-slate-500 max-w-[240px] leading-relaxed font-mono">
              Bằng việc đăng nhập, bạn đồng ý sử dụng địa chỉ email <strong className="text-slate-400">VTI</strong> phục vụ cho cuộc thi.
            </div>
          </div>

        </div>
      </div>

      {/* Footer copyright */}
      <div className="relative z-10 mt-8 text-center text-[10px] text-slate-600 font-mono tracking-widest uppercase">
        &copy; {new Date().getFullYear()} VTI Group. Developed by Kaizen Delivery Squad.
      </div>
    </main>
  );
}
