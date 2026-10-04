import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TachGopSection } from './components/TachGopSection';
import { CongTruCoNhoSection } from './components/CongTruCoNhoSection';
import { LienTruocLienSauSection } from './components/LienTruocLienSauSection';
import { SoSanhDaySoSection } from './components/SoSanhDaySoSection';
import { ToanDoSection } from './components/ToanDoSection';
import { QuizModal } from './components/QuizModal';
import { BadgesModal } from './components/BadgesModal';
import { PrintWorksheetModal } from './components/PrintWorksheetModal';
import { TopicTab, Badge } from './types/math';
import { INITIAL_BADGES } from './utils/mathGenerators';
import { sound } from './utils/audio';
import confetti from 'canvas-confetti';
import { Award, BookOpen, Calculator, Sparkles, Train, Scale, Layers } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TopicTab>('tach-gop');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [stars, setStars] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('grade2_math_stars');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState<boolean>(false);
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);
  const [unlockedNotification, setUnlockedNotification] = useState<Badge | null>(null);

  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  const handleToggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const handleEarnStar = (amount = 1) => {
    setStars((prev) => {
      const newTotal = prev + amount;
      try {
        localStorage.setItem('grade2_math_stars', newTotal.toString());
      } catch {
        // ignore
      }

      // Check if newly unlocked a badge
      badges.forEach((b) => {
        if (!b.unlocked && newTotal >= b.requiredStars) {
          b.unlocked = true;
          setUnlockedNotification(b);
          sound.playVictory();
          try {
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
          } catch {
            // ignore
          }
          setTimeout(() => {
            setUnlockedNotification(null);
          }, 4500);
        }
      });

      return newTotal;
    });
  };

  const topicCards: {
    id: TopicTab;
    title: string;
    sub: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      id: 'tach-gop',
      title: 'Tách Gộp Số',
      sub: 'Sơ đồ tách gộp chuẩn SGK & phòng khám phá',
      icon: <Layers className="w-5 h-5 text-amber-700" />,
      color: 'bg-amber-100/70 border-amber-300 text-amber-900',
    },
    {
      id: 'cong-tru',
      title: 'Cộng Trừ Có Nhớ',
      sub: 'Đặt tính cột dọc phạm vi 100 & que tính',
      icon: <Calculator className="w-5 h-5 text-rose-700" />,
      color: 'bg-rose-100/70 border-rose-300 text-rose-900',
    },
    {
      id: 'lien-truoc-sau',
      title: 'Số Liền Trước & Sau',
      sub: 'Đoàn tàu toán học 1 - 150 & tia số trực quan',
      icon: <Train className="w-5 h-5 text-indigo-700" />,
      color: 'bg-indigo-100/70 border-indigo-300 text-indigo-900',
    },
    {
      id: 'so-sanh',
      title: 'So Sánh Dãy Số',
      sub: 'Cân bập bênh & sắp xếp từ bé đến lớn',
      icon: <Scale className="w-5 h-5 text-emerald-700" />,
      color: 'bg-emerald-100/70 border-emerald-300 text-emerald-900',
    },
    {
      id: 'toan-do',
      title: 'Toán Đố Lớp 2',
      sub: 'Bài toán có lời văn & sơ đồ đoạn thẳng',
      icon: <BookOpen className="w-5 h-5 text-indigo-700" />,
      color: 'bg-indigo-100/70 border-indigo-300 text-indigo-900',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-amber-50/20 to-orange-50/30 text-slate-800 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        stars={stars}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenBadges={() => setIsBadgesOpen(true)}
        onOpenPrint={() => setIsPrintOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
        {/* Welcome & Topic Hub Cards */}
        <section className="bg-white rounded-3xl border border-amber-200/80 p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">👋</span>
                <h1 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight">
                  Chào bé yêu! Cùng làm toán lớp 2 thật giỏi nhé!
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                Lựa chọn một chủ đề bên dưới để luyện tập với hình ảnh trực quan sinh động:
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsQuizOpen(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-transform"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Thử Thách 10 Câu</span>
              </button>
            </div>
          </div>

          {/* 5 Topic Select Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {topicCards.map((card) => {
              const isCurrent = currentTab === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setCurrentTab(card.id);
                  }}
                  className={`p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-amber-400/20 border-amber-500 shadow-md ring-2 ring-amber-400'
                      : 'bg-white hover:bg-amber-50/50 border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-xl ${card.color} shadow-xs`}>
                      {card.icon}
                    </div>
                    {isCurrent && (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-amber-900 transition-colors">
                      {card.title}
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                      {card.sub}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Dynamic Topic Workspace */}
        <section>
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
        </section>
      </main>

      {/* Floating Badge Notification */}
      {unlockedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border-2 border-amber-400 rounded-2xl p-4 shadow-xl flex items-center gap-3 animate-pop max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center text-2xl shadow-sm">
            {unlockedNotification.icon}
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">
              🎉 Mở khóa huy hiệu mới!
            </span>
            <h4 className="font-black text-sm text-slate-900">
              {unlockedNotification.title}
            </h4>
            <p className="text-xs text-slate-500">
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
      <footer className="no-print mt-12 border-t border-amber-200/80 bg-white/70 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Toán Lớp 2 Vui Học · Giúp con vững bước tư duy toán học</span>
          <div className="flex items-center gap-3">
            <span>Bé đã đạt được <strong className="text-amber-700 font-bold">{stars} ★</strong></span>
            <button
              type="button"
              onClick={() => setIsPrintOpen(true)}
              className="text-amber-800 font-semibold hover:underline cursor-pointer"
            >
              In phiếu bài tập A4
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
