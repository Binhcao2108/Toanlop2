import React from 'react';
import { Volume2, VolumeX, Printer, Sparkles, Keyboard, UserCircle2, LogOut } from 'lucide-react';
import { TopicTab, StudentAccount } from '../types/math';
import { ScoreSyncStatus } from '../utils/scoreSync';
import { getCurrentRankInfo } from '../utils/mathGenerators';
import { RankIcon } from './RankIcon';
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
  currentAccount?: StudentAccount | null;
  onLogout?: () => void;
  scoreSyncStatus?: ScoreSyncStatus;
  pendingStarsCount?: number;
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
  currentAccount,
  onLogout,
  scoreSyncStatus = 'saved',
  pendingStarsCount = 0,
}) => {
  const { virtualKeypadEnabled, toggleVirtualKeypad } = useVirtualKeypad();
  const rankInfo = getCurrentRankInfo(stars);
  const currentRankBadge = rankInfo.currentBadge;
  const activeBadgeId = currentAccount?.isAdmin ? 'b21' : currentRankBadge?.id || 'b0';

  const navItems: { id: TopicTab; label: string }[] = [
    ...(currentAccount?.isAdmin
      ? [{ id: 'quan-tri' as TopicTab, label: '👑 Quản Trị' }]
      : []),
    { id: 'tach-gop', label: 'Tách Gộp Số' },
    { id: 'cong-tru', label: 'Cộng Trừ Có Nhớ' },
    { id: 'lien-truoc-sau', label: 'Liền Trước & Sau' },
    { id: 'so-sanh', label: 'So Sánh Dãy Số' },
    { id: 'toan-do', label: 'Toán Đố Lớp 2' },
    { id: 'on-tap', label: 'Ôn Tập' },
    { id: 'kiem-tra', label: 'Kiểm Tra' },
    { id: 'xep-hang', label: '🏆 Xếp Hạng' },
    { id: 'tai-khoan', label: 'Tài Khoản' },
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
        <nav className="hidden xl:flex items-center gap-1">
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
                className={`min-h-[44px] px-2.5 py-2 text-sm font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
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
          {/* Account & Rank Emblem button */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectTab(currentAccount?.isAdmin ? 'quan-tri' : 'tai-khoan');
            }}
            className={`min-h-[44px] px-2.5 py-1.5 text-sm font-bold rounded-xl border flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all shadow-2xs ${
              currentAccount?.isAdmin
                ? 'bg-gradient-to-r from-indigo-100 via-purple-100 to-amber-100 hover:from-indigo-200 hover:to-amber-200 text-indigo-950 border-indigo-300'
                : currentAccount
                  ? 'bg-gradient-to-r from-emerald-50 to-amber-50/80 hover:from-emerald-100 hover:to-amber-100 text-emerald-950 border-emerald-300'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-300'
            }`}
            title={
              currentAccount
                ? `Tài khoản: ${currentAccount.id}${
                    currentAccount.isAdmin
                      ? ' (ADMIN Tối Thượng)'
                      : ` • Cấp bậc: ${currentRankBadge?.title || 'Bé Tập Sự'}`
                  }`
                : 'Đăng nhập tài khoản'
            }
          >
            {currentAccount ? (
              <RankIcon badgeId={activeBadgeId} size="sm" />
            ) : (
              <UserCircle2 className="w-4 h-4 shrink-0" />
            )}
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="font-black text-sm">
                {currentAccount
                  ? `${currentAccount.id}${currentAccount.isAdmin ? ' (Admin)' : ''}`
                  : 'Đăng nhập'}
              </span>
              {currentAccount && (
                <span className="hidden lg:inline text-sm font-extrabold text-amber-800">
                  • {currentAccount.isAdmin ? 'Tối Thượng' : currentRankBadge?.tier || 'Tập Sự'}
                </span>
              )}
            </div>
          </button>

          {/* Direct Logout Button when logged in */}
          {currentAccount && onLogout && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onLogout();
              }}
              className="min-h-[44px] min-w-[44px] px-2.5 py-2 text-sm font-bold rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors active:scale-95"
              title="Đăng xuất tài khoản"
              aria-label="Đăng xuất tài khoản"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Đăng xuất</span>
            </button>
          )}

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

          {/* Badges Trophy & Rank Crest Button */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenBadges();
            }}
            className="min-h-[44px] px-2.5 py-1.5 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-950 border-2 border-amber-300 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all text-sm font-extrabold whitespace-nowrap shadow-xs active:scale-95"
            title={
              currentRankBadge
                ? `Cấp bậc: ${currentRankBadge.title} (${stars} ★) - Bấm để xem 21 icon cấp bậc ngầu đến 2000 ★`
                : `Xem bảng cấp bậc & huy hiệu của bé (${stars} ★)`
            }
          >
            <RankIcon badgeId={currentRankBadge?.id || 'b0'} size="sm" />
            <span className="tabular-nums font-black">{stars}</span>
            <span className="text-amber-500">★</span>
          </button>

          {/* Score Sync Status Chip (text-sm >= 14px) */}
          {currentAccount && (
            <span
              className={`hidden md:inline-flex items-center px-2.5 py-1.5 rounded-xl text-sm font-bold border whitespace-nowrap ${
                scoreSyncStatus === 'saving'
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : scoreSyncStatus === 'pending'
                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
            >
              {scoreSyncStatus === 'saving'
                ? 'Đang lưu…'
                : scoreSyncStatus === 'pending'
                  ? `Chờ có mạng để lưu (${pendingStarsCount} sao)`
                  : 'Đã lưu điểm ☁✓'}
            </span>
          )}

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
      <div className="flex xl:hidden items-center overflow-x-auto pt-2 pb-1 gap-2 scrollbar-none border-t border-amber-100 mt-1.5">
        {currentAccount && (
          <span
            className={`md:hidden inline-flex items-center px-2.5 py-1.5 rounded-xl text-sm font-bold border whitespace-nowrap shrink-0 ${
              scoreSyncStatus === 'saving'
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : scoreSyncStatus === 'pending'
                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}
          >
            {scoreSyncStatus === 'saving'
              ? 'Đang lưu…'
              : scoreSyncStatus === 'pending'
                ? `Chờ có mạng để lưu (${pendingStarsCount} sao)`
                : 'Đã lưu điểm ☁✓'}
          </span>
        )}
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
