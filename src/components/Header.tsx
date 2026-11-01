import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Printer,
  Sparkles,
  Keyboard,
  UserCircle2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  X,
  Layers,
  Calculator,
  Train,
  Scale,
  BookOpen,
  BookOpenText,
  ClipboardCheck,
  GraduationCap,
  Trophy,
  ShieldCheck,
  Tags,
} from 'lucide-react';
import { TopicTab, StudentAccount, SubjectMode } from '../types/math';
import { ScoreSyncStatus } from '../utils/scoreSync';
import { getCurrentRankInfo } from '../utils/mathGenerators';
import { RankIcon } from './RankIcon';
import { sound } from '../utils/audio';
import { useVirtualKeypad } from '../context/VirtualKeypadContext';
import { TIENG_VIET_WORKSHEETS } from './TiengVietSection';

interface HeaderProps {
  activeSubject: SubjectMode;
  onSelectSubject: (subject: SubjectMode) => void;
  currentTab: TopicTab;
  onSelectTab: (tab: TopicTab) => void;
  selectedTvWorksheetId: string;
  onSelectTvWorksheet: (worksheetId: string) => void;
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

interface NavStripItem {
  key: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  badgeColor: string;
  isActive: boolean;
  onClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSubject,
  onSelectSubject,
  currentTab,
  onSelectTab,
  selectedTvWorksheetId,
  onSelectTvWorksheet,
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

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Mouse drag-to-scroll state for the horizontal bar
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const adminItems: NavStripItem[] = currentAccount?.isAdmin
    ? [
        {
          key: 'quan-tri',
          label: 'Quản Trị Admin',
          desc: 'Quản lý tài khoản & link đăng ký',
          icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
          isActive: currentTab === 'quan-tri',
          onClick: () => onSelectTab('quan-tri'),
        },
      ]
    : [];

  const mathSubjectItems: NavStripItem[] = [
    {
      key: 'tach-gop',
      label: 'Tách Gộp Số',
      desc: 'Sơ đồ tách gộp chuẩn SGK',
      icon: <Layers className="w-4 h-4 shrink-0" />,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      isActive: currentTab === 'tach-gop',
      onClick: () => onSelectTab('tach-gop'),
    },
    {
      key: 'cong-tru',
      label: 'Cộng Trừ Có Nhớ',
      desc: 'Đặt tính cột dọc phạm vi 100',
      icon: <Calculator className="w-4 h-4 shrink-0" />,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      isActive: currentTab === 'cong-tru',
      onClick: () => onSelectTab('cong-tru'),
    },
    {
      key: 'lien-truoc-sau',
      label: 'Liền Trước & Sau',
      desc: 'Đoàn tàu toán học & tia số',
      icon: <Train className="w-4 h-4 shrink-0" />,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      isActive: currentTab === 'lien-truoc-sau',
      onClick: () => onSelectTab('lien-truoc-sau'),
    },
    {
      key: 'so-sanh',
      label: 'So Sánh Dãy Số',
      desc: 'Cân bập bênh & sắp xếp số',
      icon: <Scale className="w-4 h-4 shrink-0" />,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      isActive: currentTab === 'so-sanh',
      onClick: () => onSelectTab('so-sanh'),
    },
    {
      key: 'toan-do',
      label: 'Toán Đố Lớp 2',
      desc: 'Bài toán có lời văn & sơ đồ',
      icon: <BookOpen className="w-4 h-4 shrink-0" />,
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
      isActive: currentTab === 'toan-do',
      onClick: () => onSelectTab('toan-do'),
    },
    {
      key: 'on-tap',
      label: 'Ôn Tập Toán',
      desc: 'Đề trắc nghiệm 10 câu tự sinh',
      icon: <ClipboardCheck className="w-4 h-4 shrink-0" />,
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
      isActive: currentTab === 'on-tap',
      onClick: () => onSelectTab('on-tap'),
    },
    {
      key: 'kiem-tra',
      label: 'Kiểm Tra Toán',
      desc: 'Đề thi tổng hợp 10 - 15 câu',
      icon: <GraduationCap className="w-4 h-4 shrink-0" />,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      isActive: currentTab === 'kiem-tra',
      onClick: () => onSelectTab('kiem-tra'),
    },
  ];

  const tiengVietSubjectItems: NavStripItem[] = [
    {
      key: 'phan-loai-tu',
      label: 'Sự Vật • Đặc Điểm • Hành Động',
      desc: 'Phân biệt 3 nhóm từ qua câu văn & cụm từ (+1 ★/câu)',
      icon: <Tags className="w-4 h-4 shrink-0" />,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      isActive: currentTab === 'phan-loai-tu',
      onClick: () => onSelectTab('phan-loai-tu'),
    },
    ...TIENG_VIET_WORKSHEETS.map((ws, idx) => ({
      key: `tv-${ws.id}`,
      label: ws.shortTitle,
      desc: `${ws.readingTitle} (${ws.author}) • 10 câu`,
      icon: <BookOpenText className="w-4 h-4 shrink-0" />,
      badgeColor:
        idx % 3 === 0
          ? 'bg-rose-100 text-rose-800 border-rose-300'
          : idx % 3 === 1
            ? 'bg-amber-100 text-amber-800 border-amber-300'
            : 'bg-emerald-100 text-emerald-800 border-emerald-300',
      isActive: currentTab === 'tieng-viet' && selectedTvWorksheetId === ws.id,
      onClick: () => {
        onSelectTvWorksheet(ws.id);
        onSelectTab('tieng-viet');
      },
    })),
  ];

  const utilityItems: NavStripItem[] = [
    {
      key: 'xep-hang',
      label: 'Bảng Xếp Hạng',
      desc: 'Top các siêu sao điểm cao nhất',
      icon: <Trophy className="w-4 h-4 shrink-0" />,
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
      isActive: currentTab === 'xep-hang',
      onClick: () => onSelectTab('xep-hang'),
    },
    {
      key: 'tai-khoan',
      label: 'Tài Khoản',
      desc: 'Quản lý tài khoản & thành tích',
      icon: <UserCircle2 className="w-4 h-4 shrink-0" />,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      isActive: currentTab === 'tai-khoan',
      onClick: () => onSelectTab('tai-khoan'),
    },
  ];

  const navItems: NavStripItem[] = [
    ...adminItems,
    ...(activeSubject === 'toan' ? mathSubjectItems : tiengVietSubjectItems),
    ...utilityItems,
  ];

  const activeNavItem = navItems.find((item) => item.isActive);

  const updateScrollButtons = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [currentAccount, activeSubject]);

  // Auto-scroll active item into view smoothly when currentTab or worksheet changes
  useEffect(() => {
    const activeKey = activeNavItem?.key;
    if (!activeKey) return;
    const btn = tabRefs.current[activeKey];
    if (btn && scrollContainerRef.current) {
      btn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      window.setTimeout(updateScrollButtons, 350);
    }
  }, [currentTab, selectedTvWorksheetId, activeSubject, activeNavItem?.key]);

  const handleScrollBy = (offset: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    sound.playClick();
    el.scrollBy({ left: offset, behavior: 'smooth' });
    window.setTimeout(updateScrollButtons, 350);
  };

  // Mouse drag handlers so user can click-and-drag the bar left/right on desktop
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 6) {
      hasDraggedRef.current = true;
      if (!isGrabbing) setIsGrabbing(true);
      e.preventDefault();
      el.scrollLeft = scrollLeftRef.current - walk * 1.4;
      updateScrollButtons();
    }
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    if (isGrabbing) setIsGrabbing(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-amber-200/90 shadow-xs transition-colors">
      <div className="max-w-6xl mx-auto px-2.5 sm:px-6 pt-2 pb-1.5">
        {/* ROW 1: Brand + Subject Switcher + Quick Menu Button on Left | User Account & Tools on Right */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-amber-100/90">
          {/* Left: Brand Wordmark + Subject Switcher (Môn Toán / Môn Tiếng Việt) + Quick Grid Menu Toggle */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                if (activeSubject === 'tieng-viet') {
                  onSelectTab('tieng-viet');
                } else {
                  onSelectTab('tach-gop');
                }
              }}
              className="min-h-[44px] flex items-center gap-2 text-left cursor-pointer group shrink-0 pr-1"
            >
              <span
                className={`w-9 h-9 rounded-xl text-white flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-105 transition-transform shrink-0 ${
                  activeSubject === 'tieng-viet'
                    ? 'bg-gradient-to-br from-rose-500 to-amber-500'
                    : 'bg-gradient-to-br from-amber-500 to-orange-500'
                }`}
              >
                2
              </span>
              <div className="leading-tight">
                <span className="block text-base sm:text-lg font-black tracking-tight text-amber-950 whitespace-nowrap">
                  {activeSubject === 'tieng-viet' ? 'Bé Học Tiếng Việt 2' : 'Bé Học Toán 2'}
                </span>
                <span className="hidden sm:block text-xs font-semibold text-amber-700 truncate max-w-[180px]">
                  Đang mở: {activeNavItem?.label || (activeSubject === 'tieng-viet' ? 'Đề 1' : 'Tách Gộp Số')}
                </span>
              </div>
            </button>

            {/* SUBJECT SWITCHER: Môn Toán vs Môn Tiếng Việt */}
            <div className="flex items-center p-1 rounded-2xl bg-amber-100/90 border border-amber-300 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSelectSubject('toan');
                }}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap ${
                  activeSubject === 'toan'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                    : 'text-amber-950 hover:bg-white/70'
                }`}
                title="Chuyển sang Môn Toán Lớp 2"
              >
                <Calculator className="w-4 h-4 shrink-0" />
                <span>Môn Toán</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSelectSubject('tieng-viet');
                }}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap ${
                  activeSubject === 'tieng-viet'
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs'
                    : 'text-amber-950 hover:bg-white/70'
                }`}
                title="Chuyển sang Môn Tiếng Việt Lớp 2"
              >
                <BookOpenText className="w-4 h-4 shrink-0" />
                <span>Môn Tiếng Việt</span>
              </button>
            </div>

            {/* Quick All-Topics Menu Button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsMenuOpen((prev) => !prev);
              }}
              className={`min-h-[44px] px-3 py-2 rounded-xl border font-extrabold text-sm flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs whitespace-nowrap ${
                isMenuOpen
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
              }`}
              title="Mở bảng chọn nhanh tất cả chủ đề"
            >
              {isMenuOpen ? (
                <X className="w-4 h-4 shrink-0" />
              ) : (
                <LayoutGrid className="w-4 h-4 shrink-0 text-amber-700" />
              )}
              <span className="hidden md:inline">
                {activeSubject === 'tieng-viet' ? 'Menu Tiếng Việt' : 'Menu Chủ Đề'}
              </span>
            </button>
          </div>

          {/* Right: Account, Stars, Sync Status & Utility Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full py-0.5">
            {/* Account & Rank Emblem button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onSelectTab(currentAccount?.isAdmin ? 'quan-tri' : 'tai-khoan');
              }}
              className={`min-h-[44px] px-3 py-1.5 text-sm font-bold rounded-xl border flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-all shadow-2xs ${
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
                  <span className="hidden md:inline text-sm font-extrabold text-amber-800">
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
                className="min-h-[44px] px-3 py-2 text-sm font-bold rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors active:scale-95"
                title="Đăng xuất tài khoản"
                aria-label="Đăng xuất tài khoản"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            )}

            {/* Quick Quiz CTA (Math 10-question challenge) */}
            {activeSubject === 'toan' && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenQuiz();
                }}
                className="min-h-[44px] px-3 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-transform"
                title="Thử thách 10 câu ôn tập Toán"
              >
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="hidden sm:inline">Thử Thách</span>
              </button>
            )}

            {/* Badges Trophy & Rank Crest Button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenBadges();
              }}
              className="min-h-[44px] px-3 py-1.5 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-950 border-2 border-amber-300 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all text-sm font-extrabold whitespace-nowrap shrink-0 shadow-xs active:scale-95"
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
                className={`hidden lg:inline-flex min-h-[44px] items-center px-3 py-1.5 rounded-xl text-sm font-bold border whitespace-nowrap shrink-0 ${
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

            {/* Print Worksheet (Math) */}
            {activeSubject === 'toan' && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenPrint();
                }}
                className="hidden md:flex min-h-[44px] px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl items-center gap-1.5 cursor-pointer transition-colors text-sm font-bold whitespace-nowrap shrink-0"
                title="In phiếu bài tập Toán cho con viết tay"
              >
                <Printer className="w-4 h-4 text-slate-600 shrink-0" />
                <span>In Phiếu</span>
              </button>
            )}

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={onToggleSound}
              className={`min-h-[44px] min-w-[44px] p-2 rounded-xl border transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                soundEnabled
                  ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                  : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Virtual Keypad Toggle Button (Math only) */}
            {activeSubject === 'toan' && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  toggleVirtualKeypad();
                }}
                className={`min-h-[44px] px-3 py-2 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-colors text-sm font-bold whitespace-nowrap shrink-0 ${
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
                <Keyboard
                  className={`w-4 h-4 shrink-0 ${
                    virtualKeypadEnabled ? 'text-amber-700' : 'text-slate-400'
                  }`}
                />
                <span className="hidden sm:inline">Phím ảo</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    virtualKeypadEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
              </button>
            )}
          </div>
        </div>

        {/* ROW 2: Spacious Draggable / Scrollable Topic Navigation Strip for Current Subject */}
        <div className="relative flex items-center gap-1.5 pt-2">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => handleScrollBy(-260)}
            disabled={!canScrollLeft}
            aria-label="Kéo thanh chủ đề sang trái"
            title="Cuộn sang trái"
            className={`min-h-[44px] min-w-[40px] px-2 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
              canScrollLeft
                ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 cursor-pointer shadow-2xs active:scale-95'
                : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Horizontal Scrollable & Mouse-Draggable Container */}
          <div
            ref={scrollContainerRef}
            onScroll={updateScrollButtons}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={`flex-1 flex items-center gap-2 overflow-x-auto py-1 px-1 select-none ${
              isGrabbing ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {/* Mobile/Tablet Score Sync Status Chip */}
            {currentAccount && (
              <span
                className={`lg:hidden inline-flex min-h-[44px] items-center px-3 py-2 rounded-xl text-sm font-bold border whitespace-nowrap shrink-0 ${
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
              return (
                <button
                  key={item.key}
                  ref={(el) => {
                    tabRefs.current[item.key] = el;
                  }}
                  type="button"
                  onClick={() => {
                    if (hasDraggedRef.current) {
                      hasDraggedRef.current = false;
                      return;
                    }
                    sound.playClick();
                    item.onClick();
                    setIsMenuOpen(false);
                  }}
                  className={`min-h-[44px] px-4 py-2 text-sm sm:text-base font-extrabold rounded-xl border transition-all whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ${
                    item.isActive
                      ? activeSubject === 'tieng-viet'
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white border-rose-600 shadow-sm scale-[1.02]'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-600 shadow-sm scale-[1.02]'
                      : 'bg-amber-50/70 hover:bg-amber-100/90 text-slate-800 border-amber-200/90 hover:border-amber-300'
                  }`}
                >
                  <span
                    className={`p-1 rounded-lg ${
                      item.isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => handleScrollBy(260)}
            disabled={!canScrollRight}
            aria-label="Kéo thanh chủ đề sang phải"
            title="Cuộn sang phải"
            className={`min-h-[44px] min-w-[40px] px-2 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
              canScrollRight
                ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 cursor-pointer shadow-2xs active:scale-95'
                : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* POPOVER / DRAWER GRID MENU: Opens when clicking "Menu Chủ Đề" */}
        {isMenuOpen && (
          <div className="mt-2 pt-3 pb-2 px-3 bg-amber-50/90 border-2 border-amber-300 rounded-2xl shadow-lg animate-pop">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-black text-amber-950 uppercase tracking-wide">
                  {activeSubject === 'tieng-viet'
                    ? '📖 Môn Tiếng Việt Lớp 2 (Phân loại 3 nhóm từ & 10 Đề Đọc hiểu)'
                    : '🔢 Môn Toán Lớp 2 (Chủ đề bài học & tiện ích)'}
                </span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-amber-200">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onSelectSubject('toan');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer ${
                      activeSubject === 'toan'
                        ? 'bg-amber-500 text-white'
                        : 'text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    Môn Toán
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onSelectSubject('tieng-viet');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer ${
                      activeSubject === 'tieng-viet'
                        ? 'bg-rose-500 text-white'
                        : 'text-slate-700 hover:bg-rose-50'
                    }`}
                  >
                    Môn Tiếng Việt
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="min-h-[36px] px-3 py-1 rounded-lg bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-bold cursor-pointer"
              >
                Đóng menu ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {navItems.map((item) => {
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      item.onClick();
                      setIsMenuOpen(false);
                    }}
                    className={`min-h-[52px] p-3 rounded-xl border text-left flex items-center gap-3 cursor-pointer transition-all ${
                      item.isActive
                        ? activeSubject === 'tieng-viet'
                          ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                          : 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-white hover:bg-amber-100/60 text-slate-800 border-amber-200'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl border shrink-0 ${
                        item.isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-sm sm:text-base truncate">
                        {item.label}
                      </div>
                      <div
                        className={`text-xs truncate ${
                          item.isActive ? 'text-amber-50' : 'text-slate-500'
                        }`}
                      >
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 pt-2.5 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {activeSubject === 'toan' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setIsMenuOpen(false);
                        onOpenQuiz();
                      }}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Thử Thách 10 Câu Toán</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setIsMenuOpen(false);
                        onOpenPrint();
                      }}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-slate-600" />
                      <span>In Phiếu Bài Tập Toán A4</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsMenuOpen(false);
                    onOpenBadges();
                  }}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <span>Tủ Huy Hiệu ({stars} ★)</span>
                </button>
              </div>
              <span className="text-xs font-semibold text-amber-800">
                💡 Mẹo: Có thể giữ chuột kéo ngang thanh chủ đề hoặc bấm nút ◀ ▶
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

