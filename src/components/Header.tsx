import React from 'react';
import { Volume2, VolumeX, Award, Printer, Sparkles, Keyboard } from 'lucide-react';
import { TopicTab } from '../types/math';
import { sound } from '../utils/audio';
import { useVirtualKeypad } from '../context/VirtualKeypadContext';

interface HeaderProps {
  currentTab: TopicTab;
  onSelectTab: (tab: TopicTab) => void;
  stars: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenBadges: () => void;
  onOpenPrint: () => void;
  onOpenQuiz: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  stars,
  soundEnabled,
  onToggleSound,
  onOpenBadges,
  onOpenPrint,
  onOpenQuiz,
}) => {
  const { virtualKeypadEnabled, toggleVirtualKeypad } = useVirtualKeypad();
  const navItems: { id: TopicTab; label: string }[] = [
    { id: 'tach-gop', label: 'Tách Gộp Số' },
    { id: 'cong-tru', label: 'Cộng Trừ Có Nhớ' },
    { id: 'lien-truoc-sau', label: 'Liền Trước & Sau' },
    { id: 'so-sanh', label: 'So Sánh Dãy Số' },
    { id: 'toan-do', label: 'Toán Đố Lớp 2' },
    { id: 'on-tap', label: 'Ôn Tập' },
    { id: 'kiem-tra', label: 'Kiểm Tra' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-amber-200/80 shadow-xs px-2.5 sm:px-6 py-2 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('tach-gop')}
          className="min-h-[44px] flex items-center gap-1.5 sm:gap-2 text-left cursor-pointer group shrink-0"
        >
          <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-sm group-hover:scale-105 transition-transform shrink-0">
            2
          </span>
          <span className="text-base sm:text-xl font-extrabold tracking-tight text-amber-950 whitespace-nowrap">
            Bé Học Toán 2
          </span>
        </button>

        {/* Zone 2: Desktop navigation links */}
        <nav className="hidden xl:flex items-center gap-1.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSelectTab(item.id);
                }}
                className={`min-h-[44px] px-3 py-2 text-sm font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-100 text-amber-950 border border-amber-300'
                    : 'text-slate-700 hover:text-amber-900 hover:bg-amber-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary actions & kid utilities (all min-h-[44px] & text-sm) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Quick Quiz CTA */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenQuiz();
            }}
            className="min-h-[44px] px-2.5 sm:px-3 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm flex items-center gap-1 cursor-pointer whitespace-nowrap transition-transform"
            title="Thử thách 10 câu ôn tập"
          >
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="hidden sm:inline">Thử Thách</span>
          </button>

          {/* Badges Trophy */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenBadges();
            }}
            className="min-h-[44px] px-2.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl flex items-center gap-1 cursor-pointer transition-colors text-sm font-bold whitespace-nowrap"
            title="Xem huy hiệu của bé"
          >
            <Award className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="tabular-nums">{stars}</span>
            <span className="text-amber-500">★</span>
          </button>

          {/* Print Worksheet */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenPrint();
            }}
            className="hidden sm:flex min-h-[44px] px-2.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl items-center gap-1 cursor-pointer transition-colors text-sm font-semibold whitespace-nowrap"
            title="In phiếu bài tập cho con viết tay"
          >
            <Printer className="w-4 h-4 text-slate-600 shrink-0" />
            <span className="hidden md:inline">In Phiếu</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className={`min-h-[44px] min-w-[44px] p-2 rounded-xl border transition-colors cursor-pointer flex items-center justify-center ${
              soundEnabled
                ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Virtual Keypad Toggle Button */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              toggleVirtualKeypad();
            }}
            className={`min-h-[44px] px-2.5 py-2 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-colors text-sm font-bold whitespace-nowrap ${
              virtualKeypadEnabled
                ? 'bg-amber-100 border-amber-300 text-amber-950 shadow-2xs'
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700'
            }`}
            title={
              virtualKeypadEnabled
                ? 'Bàn phím ảo đang BẬT (bấm để tắt)'
                : 'Bàn phím ảo đang TẮT (bấm để bật)'
            }
          >
            <Keyboard className={`w-4 h-4 shrink-0 ${virtualKeypadEnabled ? 'text-amber-700' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Phím ảo</span>
            <span
              className={`w-2 h-2 rounded-full ${
                virtualKeypadEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile & Tablet sticky navigation tab strip (min-h-[44px], text-sm) */}
      <div className="flex xl:hidden overflow-x-auto pt-2 pb-1 gap-2 scrollbar-none border-t border-amber-100 mt-1.5">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                sound.playClick();
                onSelectTab(item.id);
              }}
              className={`min-h-[44px] px-3.5 py-2 text-sm font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer shrink-0 flex items-center justify-center ${
                isActive
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-slate-800 border border-amber-200/80'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
