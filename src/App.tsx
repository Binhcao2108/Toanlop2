import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { TachGopSection } from './components/TachGopSection';
import { CongTruCoNhoSection } from './components/CongTruCoNhoSection';
import { LienTruocLienSauSection } from './components/LienTruocLienSauSection';
import { SoSanhDaySoSection } from './components/SoSanhDaySoSection';
import { ToanDoSection } from './components/ToanDoSection';
import { TiengVietSection, TIENG_VIET_WORKSHEETS } from './components/TiengVietSection';
import { PhanLoaiTuSection } from './components/PhanLoaiTuSection';
import { OnTapSection } from './components/OnTapSection';
import { KiemTraSection } from './components/KiemTraSection';
import { TaiKhoanSection } from './components/TaiKhoanSection';
import { AdminSection } from './components/AdminSection';
import { XepHangSection } from './components/XepHangSection';
import { RankIcon } from './components/RankIcon';
import { QuizModal } from './components/QuizModal';
import { BadgesModal } from './components/BadgesModal';
import { PrintWorksheetModal } from './components/PrintWorksheetModal';
import { TopicTab, Badge, StudentAccount, SubjectMode } from './types/math';
import { INITIAL_BADGES } from './utils/mathGenerators';
import {
  getSavedAccounts,
  getLastSyncTime,
  getCurrentLoggedInAccount,
  saveCurrentLoggedInAccount,
  getAccountStars,
  saveAccountStars,
  syncAccountsFromGoogleDrive,
} from './utils/driveAccounts';
import {
  ScoreSyncStatus,
  getPendingStars,
  addPendingStars,
  hasMigratedInitialStars,
  markMigratedInitialStars,
  fetchStarsFromServer,
  flushPendingStars,
  flushPendingStarsWithTimeout,
  isCurrentlyFlushing,
} from './utils/scoreSync';
import { sound } from './utils/audio';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  BookOpenText,
  Calculator,
  Sparkles,
  Train,
  Scale,
  Layers,
  GraduationCap,
  ClipboardCheck,
  UserCircle2,
  LogOut,
  ShieldCheck,
  Trophy,
  Tags,
} from 'lucide-react';
import { VirtualKeypadProvider } from './context/VirtualKeypadContext';
import { FloatingVirtualKeypad } from './components/FloatingVirtualKeypad';

export default function App() {
  const [currentAccount, setCurrentAccount] = useState<StudentAccount | null>(() =>
    getCurrentLoggedInAccount()
  );
  const [accounts, setAccounts] = useState<StudentAccount[]>(() => getSavedAccounts());
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => getLastSyncTime());
  const [isSyncingDrive, setIsSyncingDrive] = useState<boolean>(false);

  const [activeSubject, setActiveSubject] = useState<SubjectMode>('toan');
  const [selectedTvWorksheetId, setSelectedTvWorksheetId] = useState<string>(
    TIENG_VIET_WORKSHEETS[0].id
  );
  const [currentTab, setCurrentTab] = useState<TopicTab>(() =>
    getCurrentLoggedInAccount()?.isAdmin ? 'quan-tri' : 'tach-gop'
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [stars, setStars] = useState<number>(() => {
    const initialAcc = getCurrentLoggedInAccount();
    return Math.max(getAccountStars(initialAcc?.id), getPendingStars(initialAcc?.id));
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const initialAcc = getCurrentLoggedInAccount();
    const initialStars = Math.max(
      getAccountStars(initialAcc?.id),
      getPendingStars(initialAcc?.id)
    );
    return INITIAL_BADGES.map((b) => ({
      ...b,
      unlocked: initialStars >= b.requiredStars,
    }));
  });
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState<boolean>(false);
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);
  const [unlockedNotification, setUnlockedNotification] = useState<Badge | null>(null);

  // Score sync states
  const [pendingStarsCount, setPendingStarsCount] = useState<number>(() =>
    getPendingStars(getCurrentLoggedInAccount()?.id)
  );
  const [isSavingStars, setIsSavingStars] = useState<boolean>(false);
  const [scoreToast, setScoreToast] = useState<string | null>(null);

  const currentAccountRef = useRef<StudentAccount | null>(currentAccount);
  const starsRef = useRef<number>(stars);
  const debounceFlushTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    currentAccountRef.current = currentAccount;
  }, [currentAccount]);

  useEffect(() => {
    starsRef.current = stars;
  }, [stars]);

  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  const refreshSyncState = useCallback((acc?: StudentAccount | null) => {
    const targetAcc = acc !== undefined ? acc : currentAccountRef.current;
    setPendingStarsCount(getPendingStars(targetAcc?.id));
    setIsSavingStars(isCurrentlyFlushing());
  }, []);

  const showScoreUpdatedToast = useCallback((newStarTotal: number) => {
    setScoreToast(`Điểm vừa được cập nhật: ${newStarTotal} ★`);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setScoreToast(null);
    }, 3000);
  }, []);

  const recalculateBadgesForStars = useCallback((newStarTotal: number) => {
    setBadges((prevBadges) =>
      prevBadges.map((b) => {
        if (!b.unlocked && newStarTotal >= b.requiredStars) {
          setUnlockedNotification({ ...b, unlocked: true });
          sound.playVictory();
          try {
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
          } catch {
            // ignore
          }
          window.setTimeout(() => {
            setUnlockedNotification(null);
          }, 4500);
          return { ...b, unlocked: true };
        }
        return {
          ...b,
          unlocked: b.unlocked || newStarTotal >= b.requiredStars,
        };
      })
    );
  }, []);

  const triggerFlush = useCallback(
    async (acc?: StudentAccount | null) => {
      const targetAcc = acc !== undefined ? acc : currentAccountRef.current;
      if (!targetAcc) return;
      refreshSyncState(targetAcc);
      await flushPendingStars(targetAcc, () => refreshSyncState(targetAcc));
      refreshSyncState(targetAcc);
    },
    [refreshSyncState]
  );

  const syncScoreOnLogin = useCallback(
    async (account: StudentAccount) => {
      const localStars = getAccountStars(account.id);
      let pending = getPendingStars(account.id);
      const initialDisplayed = Math.max(localStars, pending);

      setStars(initialDisplayed);
      starsRef.current = initialDisplayed;
      saveAccountStars(initialDisplayed, account.id);
      recalculateBadgesForStars(initialDisplayed);
      refreshSyncState(account);

      const res = await fetchStarsFromServer(account.id, account.pass);
      if (currentAccountRef.current?.id !== account.id) return;

      if (res.ok) {
        const serverStars = res.stars;
        pending = getPendingStars(account.id);

        // Nếu sao máy chủ bằng 0 và sao lưu trên máy lớn hơn 0 thì đưa phần chênh vào bộ đếm chờ gửi một lần để điểm cũ không mất
        if (serverStars === 0 && localStars > 0 && !hasMigratedInitialStars(account.id)) {
          const diff = Math.max(0, localStars - pending);
          if (diff > 0) {
            pending = addPendingStars(account.id, diff);
          }
          markMigratedInitialStars(account.id);
        }

        const combined = serverStars + pending;
        const nextDisplayed = Math.max(starsRef.current, localStars, combined);
        setStars(nextDisplayed);
        starsRef.current = nextDisplayed;
        saveAccountStars(nextDisplayed, account.id);
        recalculateBadgesForStars(nextDisplayed);
      }

      refreshSyncState(account);
      void triggerFlush(account);
    },
    [recalculateBadgesForStars, refreshSyncState, triggerFlush]
  );

  const handleManualScoreSync = useCallback(async () => {
    const acc = currentAccountRef.current;
    if (!acc) return;
    setIsSavingStars(true);
    try {
      await flushPendingStars(acc, () => refreshSyncState(acc));
      const res = await fetchStarsFromServer(acc.id, acc.pass);
      if (res.ok && currentAccountRef.current?.id === acc.id) {
        const pending = getPendingStars(acc.id);
        const total = res.stars + pending;
        if (total > starsRef.current) {
          setStars(total);
          starsRef.current = total;
          saveAccountStars(total, acc.id);
          recalculateBadgesForStars(total);
          showScoreUpdatedToast(total);
        }
      }
    } finally {
      refreshSyncState(acc);
    }
  }, [recalculateBadgesForStars, refreshSyncState, showScoreUpdatedToast]);

  const handleSyncDrive = async (): Promise<StudentAccount[]> => {
    setIsSyncingDrive(true);
    try {
      const res = await syncAccountsFromGoogleDrive();
      setAccounts(res.accounts);
      setLastSyncTime(res.syncedAt);
      return res.accounts;
    } finally {
      setIsSyncingDrive(false);
    }
  };

  // Auto-sync accounts from Google Drive folder on startup and when returning from registration tab
  useEffect(() => {
    handleSyncDrive();
    const onFocus = () => {
      handleSyncDrive();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // Run login score sync on initial mount if already logged in
  useEffect(() => {
    if (currentAccount) {
      void syncScoreOnLogin(currentAccount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flush on 'online' event and every 60 seconds while app is open
  useEffect(() => {
    const handleOnline = () => {
      if (currentAccountRef.current) {
        void triggerFlush(currentAccountRef.current);
      }
    };

    window.addEventListener('online', handleOnline);
    const intervalId = window.setInterval(() => {
      if (currentAccountRef.current) {
        void triggerFlush(currentAccountRef.current);
      }
    }, 60000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.clearInterval(intervalId);
    };
  }, [triggerFlush]);

  // Poll server stars ('get') every 10s when logged in and tab is visible (with backoff up to 60s on error)
  useEffect(() => {
    if (!currentAccount) return;

    let cancelled = false;
    let isPolling = false;
    let currentDelay = 10000;
    let timeoutId: number | null = null;

    const scheduleNext = (delay: number) => {
      if (cancelled) return;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(runPoll, delay);
    };

    const runPoll = async () => {
      if (cancelled) return;

      if (
        typeof document !== 'undefined' &&
        document.visibilityState !== 'visible'
      ) {
        scheduleNext(10000);
        return;
      }

      if (isPolling || isCurrentlyFlushing() || debounceFlushTimerRef.current !== null) {
        scheduleNext(currentDelay);
        return;
      }

      isPolling = true;
      try {
        const res = await fetchStarsFromServer(currentAccount.id, currentAccount.pass);
        if (cancelled || currentAccountRef.current?.id !== currentAccount.id) return;

        if (res.ok) {
          currentDelay = 10000;
          const pending = getPendingStars(currentAccount.id);
          const candidateTotal = res.stars + pending;
          if (candidateTotal > starsRef.current) {
            setStars(candidateTotal);
            starsRef.current = candidateTotal;
            saveAccountStars(candidateTotal, currentAccount.id);
            recalculateBadgesForStars(candidateTotal);
            showScoreUpdatedToast(candidateTotal);
          }
        } else {
          currentDelay = Math.min(60000, currentDelay * 2);
        }
      } catch {
        currentDelay = Math.min(60000, currentDelay * 2);
      } finally {
        isPolling = false;
        scheduleNext(currentDelay);
      }
    };

    scheduleNext(10000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isPolling) {
        currentDelay = 10000;
        scheduleNext(1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentAccount, recalculateBadgesForStars, showScoreUpdatedToast]);

  const handleLogin = (account: StudentAccount) => {
    setCurrentAccount(account);
    currentAccountRef.current = account;
    saveCurrentLoggedInAccount(account);
    if (account.isAdmin) {
      setCurrentTab('quan-tri');
    } else if (currentTab === 'tai-khoan' || currentTab === 'quan-tri') {
      setCurrentTab('tach-gop');
    }
    void syncScoreOnLogin(account);
  };

  const handleLogout = async () => {
    const accToFlush = currentAccountRef.current;
    if (debounceFlushTimerRef.current) {
      window.clearTimeout(debounceFlushTimerRef.current);
      debounceFlushTimerRef.current = null;
    }

    if (accToFlush && getPendingStars(accToFlush.id) > 0) {
      setIsSavingStars(true);
      await flushPendingStarsWithTimeout(accToFlush, 5000, () =>
        refreshSyncState(accToFlush)
      );
    }

    setCurrentAccount(null);
    currentAccountRef.current = null;
    saveCurrentLoggedInAccount(null);
    setStars(0);
    starsRef.current = 0;
    setPendingStarsCount(0);
    setIsSavingStars(false);
    setBadges(INITIAL_BADGES.map((b) => ({ ...b, unlocked: false })));
    if (currentTab === 'quan-tri') {
      setCurrentTab('tai-khoan');
    }
  };

  const handleToggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const handleEarnStar = (amount = 1) => {
    const cleanAmount = Math.floor(amount);
    if (!Number.isInteger(cleanAmount) || cleanAmount <= 0) return;

    const activeAccount = currentAccountRef.current;
    if (activeAccount?.id) {
      const nextPending = addPendingStars(activeAccount.id, cleanAmount);
      setPendingStarsCount(nextPending);

      if (debounceFlushTimerRef.current) {
        window.clearTimeout(debounceFlushTimerRef.current);
      }
      debounceFlushTimerRef.current = window.setTimeout(() => {
        debounceFlushTimerRef.current = null;
        void triggerFlush(activeAccount);
      }, 3000);
    }

    setStars((prev) => {
      const newTotal = prev + cleanAmount;
      starsRef.current = newTotal;
      saveAccountStars(newTotal, activeAccount?.id);
      recalculateBadgesForStars(newTotal);
      return newTotal;
    });
  };

  const scoreSyncStatus: ScoreSyncStatus = isSavingStars
    ? 'saving'
    : pendingStarsCount > 0
      ? 'pending'
      : 'saved';

  const handleSelectSubject = (subject: SubjectMode) => {
    setActiveSubject(subject);
    if (subject === 'tieng-viet') {
      if (currentTab !== 'tieng-viet' && currentTab !== 'phan-loai-tu') {
        setCurrentTab('phan-loai-tu');
      }
    } else if (currentTab === 'tieng-viet' || currentTab === 'phan-loai-tu') {
      setCurrentTab('tach-gop');
    }
  };

  const handleSelectTab = (tab: TopicTab) => {
    setCurrentTab(tab);
    if (tab === 'tieng-viet' || tab === 'phan-loai-tu') {
      setActiveSubject('tieng-viet');
    } else if (
      tab === 'tach-gop' ||
      tab === 'cong-tru' ||
      tab === 'lien-truoc-sau' ||
      tab === 'so-sanh' ||
      tab === 'toan-do' ||
      tab === 'on-tap' ||
      tab === 'kiem-tra'
    ) {
      setActiveSubject('toan');
    }
  };

  const adminCards: {
    key: string;
    title: string;
    sub: string;
    icon: React.ReactNode;
    color: string;
    isCurrent: boolean;
    onClick: () => void;
  }[] = currentAccount?.isAdmin
    ? [
        {
          key: 'quan-tri',
          title: 'Quản Trị Admin',
          sub: 'Link đăng ký, quản lý & tổng số tài khoản hiện có',
          icon: <ShieldCheck className="w-5 h-5 text-indigo-700" />,
          color: 'bg-indigo-100/80 border-indigo-300 text-indigo-900',
          isCurrent: currentTab === 'quan-tri',
          onClick: () => handleSelectTab('quan-tri'),
        },
      ]
    : [];

  const mathCards: {
    key: string;
    title: string;
    sub: string;
    icon: React.ReactNode;
    color: string;
    isCurrent: boolean;
    onClick: () => void;
  }[] = [
    {
      key: 'tach-gop',
      title: 'Tách Gộp Số',
      sub: 'Sơ đồ tách gộp chuẩn SGK & phòng khám phá',
      icon: <Layers className="w-5 h-5 text-amber-700" />,
      color: 'bg-amber-100/70 border-amber-300 text-amber-900',
      isCurrent: currentTab === 'tach-gop',
      onClick: () => handleSelectTab('tach-gop'),
    },
    {
      key: 'cong-tru',
      title: 'Cộng Trừ Có Nhớ',
      sub: 'Đặt tính cột dọc phạm vi 100 & que tính',
      icon: <Calculator className="w-5 h-5 text-rose-700" />,
      color: 'bg-rose-100/70 border-rose-300 text-rose-900',
      isCurrent: currentTab === 'cong-tru',
      onClick: () => handleSelectTab('cong-tru'),
    },
    {
      key: 'lien-truoc-sau',
      title: 'Số Liền Trước & Sau',
      sub: 'Đoàn tàu toán học 1 - 150 & tia số trực quan',
      icon: <Train className="w-5 h-5 text-indigo-700" />,
      color: 'bg-indigo-100/70 border-indigo-300 text-indigo-900',
      isCurrent: currentTab === 'lien-truoc-sau',
      onClick: () => handleSelectTab('lien-truoc-sau'),
    },
    {
      key: 'so-sanh',
      title: 'So Sánh Dãy Số',
      sub: 'Cân bập bênh & sắp xếp từ bé đến lớn',
      icon: <Scale className="w-5 h-5 text-emerald-700" />,
      color: 'bg-emerald-100/70 border-emerald-300 text-emerald-900',
      isCurrent: currentTab === 'so-sanh',
      onClick: () => handleSelectTab('so-sanh'),
    },
    {
      key: 'toan-do',
      title: 'Toán Đố Lớp 2',
      sub: 'Bài toán có lời văn & sơ đồ đoạn thẳng',
      icon: <BookOpen className="w-5 h-5 text-indigo-700" />,
      color: 'bg-indigo-100/70 border-indigo-300 text-indigo-900',
      isCurrent: currentTab === 'toan-do',
      onClick: () => handleSelectTab('toan-do'),
    },
    {
      key: 'on-tap',
      title: 'Ôn Tập Toán',
      sub: 'Đề trắc nghiệm 10 câu tự sinh đủ 7 dạng toán',
      icon: <ClipboardCheck className="w-5 h-5 text-teal-700" />,
      color: 'bg-teal-100/70 border-teal-300 text-teal-900',
      isCurrent: currentTab === 'on-tap',
      onClick: () => handleSelectTab('on-tap'),
    },
    {
      key: 'kiem-tra',
      title: 'Kiểm Tra Toán',
      sub: 'Đề thi 10 - 15 câu tổng hợp đầy đủ 5 phần',
      icon: <GraduationCap className="w-5 h-5 text-amber-700" />,
      color: 'bg-amber-100/70 border-amber-300 text-amber-900',
      isCurrent: currentTab === 'kiem-tra',
      onClick: () => handleSelectTab('kiem-tra'),
    },
  ];

  const tiengVietCards: {
    key: string;
    title: string;
    sub: string;
    icon: React.ReactNode;
    color: string;
    isCurrent: boolean;
    onClick: () => void;
  }[] = [
    {
      key: 'phan-loai-tu',
      title: 'Sự Vật • Đặc Điểm • Hành Động',
      sub: 'Phân biệt 3 nhóm từ qua câu văn & cụm từ (+1 ★/câu)',
      icon: <Tags className="w-5 h-5 text-indigo-700" />,
      color: 'bg-indigo-100/80 border-indigo-300 text-indigo-900',
      isCurrent: currentTab === 'phan-loai-tu',
      onClick: () => handleSelectTab('phan-loai-tu'),
    },
    ...TIENG_VIET_WORKSHEETS.map((ws, idx) => ({
      key: `tv-${ws.id}`,
      title: ws.shortTitle,
      sub: `${ws.readingTitle} (${ws.author}) • 10 câu (+1 ★/câu)`,
      icon: <BookOpenText className="w-5 h-5 text-rose-700" />,
      color:
        idx % 3 === 0
          ? 'bg-rose-100/70 border-rose-300 text-rose-900'
          : idx % 3 === 1
            ? 'bg-amber-100/70 border-amber-300 text-amber-900'
            : 'bg-emerald-100/70 border-emerald-300 text-emerald-900',
      isCurrent: currentTab === 'tieng-viet' && selectedTvWorksheetId === ws.id,
      onClick: () => {
        setSelectedTvWorksheetId(ws.id);
        handleSelectTab('tieng-viet');
      },
    })),
  ];

  const utilityCards: {
    key: string;
    title: string;
    sub: string;
    icon: React.ReactNode;
    color: string;
    isCurrent: boolean;
    onClick: () => void;
  }[] = [
    {
      key: 'xep-hang',
      title: 'Bảng Xếp Hạng',
      sub: 'Top các siêu sao có điểm cao nhất toàn trường',
      icon: <Trophy className="w-5 h-5 text-orange-700" />,
      color: 'bg-orange-100/80 border-orange-300 text-orange-900',
      isCurrent: currentTab === 'xep-hang',
      onClick: () => handleSelectTab('xep-hang'),
    },
    {
      key: 'tai-khoan',
      title: 'Tài Khoản',
      sub: 'Quản lý tài khoản & thành tích học tập của bé',
      icon: <UserCircle2 className="w-5 h-5 text-blue-700" />,
      color: 'bg-blue-100/70 border-blue-300 text-blue-900',
      isCurrent: currentTab === 'tai-khoan',
      onClick: () => handleSelectTab('tai-khoan'),
    },
  ];

  const topicCards = [
    ...adminCards,
    ...(activeSubject === 'toan' ? mathCards : tiengVietCards),
    ...utilityCards,
  ];

  return (
    <VirtualKeypadProvider>
      <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-amber-50/60 via-amber-50/20 to-orange-50/30 text-slate-800 flex flex-col font-sans">
        {/* Top Bar Header */}
        <Header
          activeSubject={activeSubject}
          onSelectSubject={handleSelectSubject}
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          selectedTvWorksheetId={selectedTvWorksheetId}
          onSelectTvWorksheet={(wsId) => {
            setSelectedTvWorksheetId(wsId);
            handleSelectTab('tieng-viet');
          }}
          stars={stars}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onOpenBadges={() => setIsBadgesOpen(true)}
          onOpenPrint={() => setIsPrintOpen(true)}
          onOpenQuiz={() => setIsQuizOpen(true)}
          currentAccount={currentAccount}
          onLogout={handleLogout}
          scoreSyncStatus={scoreSyncStatus}
          pendingStarsCount={pendingStarsCount}
        />

        {/* Main Container */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-2.5 sm:px-6 py-3 sm:py-6 space-y-4 sm:space-y-6">
          {/* Welcome & Subject Hub Cards: Hidden on mobile so exercise appears immediately in the first viewport */}
          {currentAccount && (
            <section className="hidden lg:block bg-white rounded-3xl border border-amber-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              {/* Top Row: Greeting + Subject Switcher + Quick Actions */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-amber-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">👋</span>
                    <h1 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight">
                      Chào bé {currentAccount.id}! Cùng học{' '}
                      {activeSubject === 'tieng-viet' ? 'Môn Tiếng Việt' : 'Môn Toán'} lớp 2 thật
                      giỏi nhé!
                    </h1>
                  </div>
                  <p className="text-sm text-slate-600">
                    {activeSubject === 'tieng-viet'
                      ? 'Chọn bài tập Phân biệt 3 nhóm từ (Sự vật, Đặc điểm, Hành động) hoặc 10 đề đọc hiểu bên dưới (mỗi câu đúng +1 ★):'
                      : 'Chọn 1 chủ đề Toán lớp 2 bên dưới để luyện tập với hình ảnh trực quan sinh động:'}
                  </p>
                </div>

                {/* Big 2-Subject Switcher in Hub */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center p-1.5 rounded-2xl bg-amber-100/80 border border-amber-300">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        handleSelectSubject('toan');
                      }}
                      className={`min-h-[42px] px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 cursor-pointer transition-all ${
                        activeSubject === 'toan'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                          : 'text-amber-950 hover:bg-white/70'
                      }`}
                    >
                      <Calculator className="w-4 h-4 shrink-0" />
                      <span>Môn Toán (7 Chủ đề)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        handleSelectSubject('tieng-viet');
                      }}
                      className={`min-h-[42px] px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 cursor-pointer transition-all ${
                        activeSubject === 'tieng-viet'
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm'
                          : 'text-amber-950 hover:bg-white/70'
                      }`}
                    >
                      <BookOpenText className="w-4 h-4 shrink-0" />
                      <span>Môn Tiếng Việt</span>
                    </button>
                  </div>

                  {activeSubject === 'toan' && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setIsQuizOpen(true);
                      }}
                      className="min-h-[44px] px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-95 text-white font-bold text-sm rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-transform"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Thử Thách 10 Câu</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      handleLogout();
                    }}
                    className="min-h-[44px] px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 active:scale-95 text-rose-700 font-bold text-sm rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                    title="Đăng xuất tài khoản"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>

              {/* Topic Select Cards for Active Subject */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {topicCards.map((card) => {
                  return (
                    <button
                      key={card.key}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        card.onClick();
                      }}
                      className={`min-h-[44px] p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                        card.isCurrent
                          ? activeSubject === 'tieng-viet'
                            ? 'bg-rose-400/20 border-rose-500 shadow-md ring-2 ring-rose-400'
                            : 'bg-amber-400/20 border-amber-500 shadow-md ring-2 ring-amber-400'
                          : 'bg-white hover:bg-amber-50/50 border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-xl ${card.color} shadow-xs`}>
                          {card.icon}
                        </div>
                        {card.isCurrent && (
                          <span
                            className={`w-2.5 h-2.5 rounded-full animate-ping ${
                              activeSubject === 'tieng-viet' ? 'bg-rose-500' : 'bg-amber-500'
                            }`}
                          />
                        )}
                      </div>
                      <div>
                        <h2 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-amber-900 transition-colors">
                          {card.title}
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                          {card.sub}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Dynamic Topic Workspace (Requires login to do exercises, or shows XepHangSection / TaiKhoanSection) */}
          <section>
            {currentTab === 'xep-hang' ? (
              <XepHangSection
                accounts={accounts}
                currentAccount={currentAccount}
                currentUserStars={stars}
                lastSyncTime={lastSyncTime}
                isSyncing={isSyncingDrive}
                onSyncDrive={handleSyncDrive}
                onOpenBadges={() => setIsBadgesOpen(true)}
                onStartLearning={() =>
                  handleSelectTab(
                    currentAccount
                      ? activeSubject === 'tieng-viet'
                        ? 'tieng-viet'
                        : 'tach-gop'
                      : 'tai-khoan'
                  )
                }
              />
            ) : !currentAccount || currentTab === 'tai-khoan' ? (
              <TaiKhoanSection
                currentAccount={currentAccount}
                accounts={accounts}
                lastSyncTime={lastSyncTime}
                isSyncing={isSyncingDrive}
                stars={stars}
                badges={badges}
                onLogin={handleLogin}
                onLogout={handleLogout}
                onSyncDrive={handleSyncDrive}
                onStartLearning={() =>
                  handleSelectTab(activeSubject === 'tieng-viet' ? 'tieng-viet' : 'tach-gop')
                }
                onOpenAdmin={
                  currentAccount?.isAdmin ? () => handleSelectTab('quan-tri') : undefined
                }
                scoreSyncStatus={scoreSyncStatus}
                pendingStarsCount={pendingStarsCount}
                onManualScoreSync={handleManualScoreSync}
              />
            ) : currentTab === 'quan-tri' && currentAccount.isAdmin ? (
              <AdminSection
                currentAccount={currentAccount}
                accounts={accounts}
                lastSyncTime={lastSyncTime}
                isSyncing={isSyncingDrive}
                onSyncDrive={handleSyncDrive}
                onStartLearning={() =>
                  handleSelectTab(activeSubject === 'tieng-viet' ? 'tieng-viet' : 'tach-gop')
                }
                onLogout={handleLogout}
              />
            ) : (
              <>
                {currentTab === 'tach-gop' && (
                  <TachGopSection onEarnStar={() => handleEarnStar(1)} />
                )}

                {currentTab === 'cong-tru' && (
                  <CongTruCoNhoSection onEarnStar={() => handleEarnStar(1)} />
                )}

                {currentTab === 'lien-truoc-sau' && (
                  <LienTruocLienSauSection onEarnStar={() => handleEarnStar(1)} />
                )}

                {currentTab === 'so-sanh' && (
                  <SoSanhDaySoSection onEarnStar={() => handleEarnStar(1)} />
                )}

                {currentTab === 'toan-do' && (
                  <ToanDoSection onEarnStar={() => handleEarnStar(1)} />
                )}

                {currentTab === 'phan-loai-tu' && (
                  <PhanLoaiTuSection
                    onEarnStar={() => handleEarnStar(1)}
                    onSwitchToReadingWorksheets={() => handleSelectTab('tieng-viet')}
                  />
                )}

                {currentTab === 'tieng-viet' && (
                  <TiengVietSection
                    onEarnStar={() => handleEarnStar(1)}
                    selectedWorksheetId={selectedTvWorksheetId}
                    onSelectWorksheetId={(id) => setSelectedTvWorksheetId(id)}
                    onOpenWordClassifier={() => handleSelectTab('phan-loai-tu')}
                  />
                )}

                {currentTab === 'on-tap' && (
                  <OnTapSection onEarnStar={() => handleEarnStar(1)} />
                )}

                {currentTab === 'kiem-tra' && (
                  <KiemTraSection onEarnStars={(count) => handleEarnStar(count)} />
                )}
              </>
            )}
          </section>
        </main>

        {/* Small 3-second Toast Notification when Server Score Updates */}
        {scoreToast && (
          <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white text-sm font-bold px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2 animate-pop">
            <span>{scoreToast}</span>
          </div>
        )}

        {/* Floating Badge Notification */}
        {unlockedNotification && (
          <div className="fixed bottom-6 right-6 z-50 bg-white border-2 border-amber-400 rounded-2xl p-4 shadow-xl flex items-center gap-3 animate-pop max-w-sm">
            <RankIcon badgeId={unlockedNotification.id} size="md" />
            <div>
              <span className="text-sm font-bold text-amber-700 uppercase tracking-wide">
                🎉 Thăng cấp huy hiệu mới!
              </span>
              <h4 className="font-black text-base text-slate-900">
                {unlockedNotification.title}
              </h4>
              <p className="text-sm text-slate-600">
                {unlockedNotification.desc}
              </p>
            </div>
          </div>
        )}

        {/* Modals */}
        <QuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          onEarnStars={handleEarnStar}
        />

        <BadgesModal
          isOpen={isBadgesOpen}
          onClose={() => setIsBadgesOpen(false)}
          stars={stars}
          badges={badges}
        />

        <PrintWorksheetModal
          isOpen={isPrintOpen}
          onClose={() => setIsPrintOpen(false)}
        />

        {/* Footer */}
        <footer className="no-print mt-10 border-t border-amber-200/80 bg-white/70 py-4 px-4 text-center text-sm text-slate-600">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              {activeSubject === 'tieng-viet'
                ? 'Bé Học Tiếng Việt Lớp 2 · Đọc hiểu & Luyện từ câu theo SGK'
                : 'Bé Học Toán Lớp 2 · Giúp con vững bước tư duy toán học'}
            </span>
            <div className="flex items-center gap-3">
              <span>
                Bé đã đạt được <strong className="text-amber-700 font-bold">{stars} ★</strong>
              </span>
              {activeSubject === 'toan' && (
                <button
                  type="button"
                  onClick={() => setIsPrintOpen(true)}
                  className="min-h-[44px] px-3 py-1.5 text-amber-800 font-bold hover:underline cursor-pointer"
                >
                  In phiếu bài tập A4
                </button>
              )}
            </div>
          </div>
        </footer>

        {/* Fixed Bottom Virtual Keypad */}
        <FloatingVirtualKeypad />
      </div>
    </VirtualKeypadProvider>
  );
}
