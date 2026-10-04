import React from 'react';
import { Volume2, VolumeX, Award, Printer, Sparkles, BookOpen } from 'lucide-react';
import { TopicTab } from '../types/math';
import { sound } from '../utils/audio';

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
  const navItems: { id: TopicTab; label: string }[] = [
    { id: 'tach-gop', label: 'Tách Gộp Số' },
    { id: 'cong-tru', label: 'Cộng Trừ Có Nhớ' },
    { id: 'lien-truoc-sau', label: 'Liền Trước & Sau' },
    { id: 'so-sanh', label: 'So Sánh Dãy Số' },
    { id: 'toan-do', label: 'Toán Đố Lớp 2' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-amber-200/80 shadow-xs px-3 sm:px-6 py-2.5 sm:py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectTab('tach-gop')}
            className="flex items-center gap-2 text-left cursor-pointer group"
          >
            <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              2
            </span>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-amber-950 whitespace-nowrap">
              Toán Lớp 2 Vui Học
            </span>
          </button>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-1 sm:gap-2">
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
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'text-slate-600 hover:text-amber-900 hover:bg-amber-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions & kid utility */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Quiz CTA */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenQuiz();
            }}
            className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-transform"
            title="Thử thách 10 câu ôn tập"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Thử Thách</span>
            <span className="sm:hidden">Thi Đấu</span>
          </button>

          {/* Badges Trophy */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenBadges();
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors text-xs sm:text-sm font-semibold whitespace-nowrap"
            title="Xem huy hiệu của bé"
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span className="text-amber-900 font-bold tabular-nums">{stars}</span>
            <span className="text-amber-500">★</span>
          </button>

          {/* Print Worksheet */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenPrint();
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
            title="In phiếu bài tập cho con viết tay"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden md:inline">In Phiếu</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className={`p-1.5 sm:p-2 rounded-lg border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="flex lg:hidden overflow-x-auto py-2 gap-1.5 scrollbar-none border-t border-amber-100 mt-2">
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
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-slate-700 border border-amber-200/70'
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
