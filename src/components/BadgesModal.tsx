import React, { useState } from 'react';
import { X, Award, Star, CheckCircle, Lock, Sparkles, Flame } from 'lucide-react';
import { Badge } from '../types/math';
import { getCurrentRankInfo } from '../utils/mathGenerators';
import { RankIcon } from './RankIcon';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  stars: number;
  badges: Badge[];
}

function getTierStyles(tierColor?: string, isUnlocked?: boolean) {
  switch (tierColor) {
    case 'emerald':
      return {
        pill: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        iconBox: isUnlocked
          ? 'bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-200 border-emerald-400 shadow-md'
          : 'bg-emerald-50/70 border-emerald-200',
        cardBorder: isUnlocked ? 'border-emerald-300 bg-gradient-to-r from-emerald-50/80 to-teal-50/40' : 'border-slate-200 bg-white',
        bar: 'bg-emerald-500',
      };
    case 'amber':
      return {
        pill: 'bg-amber-100 text-amber-900 border-amber-300',
        iconBox: isUnlocked
          ? 'bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 border-amber-400 shadow-md'
          : 'bg-amber-50/70 border-amber-200',
        cardBorder: isUnlocked ? 'border-amber-300 bg-gradient-to-r from-amber-50/90 to-orange-50/50' : 'border-slate-200 bg-white',
        bar: 'bg-amber-500',
      };
    case 'sky':
      return {
        pill: 'bg-sky-100 text-sky-900 border-sky-300',
        iconBox: isUnlocked
          ? 'bg-gradient-to-br from-sky-100 via-blue-50 to-sky-200 border-sky-400 shadow-md'
          : 'bg-sky-50/70 border-sky-200',
        cardBorder: isUnlocked ? 'border-sky-300 bg-gradient-to-r from-sky-50/90 to-blue-50/40' : 'border-slate-200 bg-white',
        bar: 'bg-sky-500',
      };
    case 'yellow':
      return {
        pill: 'bg-yellow-100 text-yellow-900 border-yellow-400',
        iconBox: isUnlocked
          ? 'bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-200 border-yellow-400 shadow-md'
          : 'bg-yellow-50/70 border-yellow-200',
        cardBorder: isUnlocked ? 'border-yellow-400 bg-gradient-to-r from-yellow-50/90 to-amber-50/50' : 'border-slate-200 bg-white',
        bar: 'bg-yellow-500',
      };
    case 'teal':
      return {
        pill: 'bg-teal-100 text-teal-900 border-teal-300',
        iconBox: isUnlocked
          ? 'bg-gradient-to-br from-teal-100 via-cyan-50 to-teal-200 border-teal-400 shadow-md'
          : 'bg-teal-50/70 border-teal-200',
        cardBorder: isUnlocked ? 'border-teal-300 bg-gradient-to-r from-teal-50/90 to-cyan-50/40' : 'border-slate-200 bg-white',
        bar: 'bg-teal-500',
      };
    case 'indigo':
      return {
        pill: 'bg-indigo-100 text-indigo-900 border-indigo-300',
        iconBox: isUnlocked
          ? 'bg-gradient-to-br from-indigo-100 via-blue-50 to-indigo-200 border-indigo-400 shadow-md'
          : 'bg-indigo-50/70 border-indigo-200',
        cardBorder: isUnlocked ? 'border-indigo-300 bg-gradient-to-r from-indigo-50/90 to-blue-50/50' : 'border-slate-200 bg-white',
        bar: 'bg-indigo-500',
      };
    case 'purple':
      return {
        pill: 'bg-purple-100 text-purple-900 border-purple-300',
        iconBox: isUnlocked
          ? 'bg-gradient-to-br from-purple-100 via-violet-50 to-purple-200 border-purple-400 shadow-md'
          : 'bg-purple-50/70 border-purple-200',
        cardBorder: isUnlocked ? 'border-purple-300 bg-gradient-to-r from-purple-50/90 to-violet-50/50' : 'border-slate-200 bg-white',
        bar: 'bg-purple-500',
      };
    case 'rose':
      return {
        pill: 'bg-rose-100 text-rose-900 border-rose-300',
        iconBox: isUnlocked
          ? 'bg-gradient-to-br from-rose-100 via-orange-50 to-rose-200 border-rose-400 shadow-md'
          : 'bg-rose-50/70 border-rose-200',
        cardBorder: isUnlocked ? 'border-rose-300 bg-gradient-to-r from-rose-50/90 to-orange-50/50' : 'border-slate-200 bg-white',
        bar: 'bg-rose-500',
      };
    case 'fuchsia':
      return {
        pill: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300',
        iconBox: isUnlocked
          ? 'bg-gradient-to-br from-fuchsia-100 via-purple-100 to-amber-200 border-amber-400 shadow-lg'
          : 'bg-fuchsia-50/70 border-fuchsia-200',
        cardBorder: isUnlocked ? 'border-fuchsia-400 bg-gradient-to-r from-fuchsia-50 via-purple-50 to-amber-50' : 'border-slate-200 bg-white',
        bar: 'bg-fuchsia-600',
      };
    default:
      return {
        pill: 'bg-amber-100 text-amber-900 border-amber-300',
        iconBox: isUnlocked
          ? 'bg-amber-100 border-amber-400'
          : 'bg-amber-50 border-amber-200',
        cardBorder: isUnlocked ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200 bg-white',
        bar: 'bg-amber-500',
      };
  }
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  stars,
  badges,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  if (!isOpen) return null;

  const { currentBadge, nextBadge, progressToNext, starsNeededForNext } =
    getCurrentRankInfo(stars, badges);
  const unlockedCount = badges.filter((b) => stars >= b.requiredStars).length;

  const filteredBadges = badges.filter((b) => {
    const isUnlocked = stars >= b.requiredStars;
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-pop">
      <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner shrink-0">
              <Award className="w-6 h-6 text-amber-100" />
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-xl leading-tight">
                Bảng Phong Thần & Cấp Bậc (2000 ★)
              </h3>
              <p className="text-sm text-amber-100">
                Tích lũy sao vàng để mở khóa 21 huy hiệu chiến thần cực ngầu!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-white/20 transition-colors cursor-pointer text-white shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Rank & Next Milestone Banner */}
        <div className="bg-gradient-to-b from-amber-50 to-orange-50/40 border-b border-amber-200 px-4 sm:px-6 py-4 space-y-3 shrink-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 border-2 border-amber-300 shadow-md flex items-center justify-center shrink-0">
                <RankIcon badgeId={currentBadge?.id || 'b0'} size="lg" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950">
                    {currentBadge?.tier || 'Tập Sự'}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    • Đã mở {unlockedCount}/{badges.length} cấp bậc
                  </span>
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                  {currentBadge ? currentBadge.title : 'Bé Tập Sự Toán Học'}
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-amber-300 rounded-2xl px-3.5 py-2 flex items-center gap-1.5 shadow-2xs">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500 shrink-0" />
              <span className="text-xl font-black text-amber-700 tabular-nums">{stars}</span>
              <span className="text-xs font-extrabold text-slate-400">/ 2000 ★</span>
            </div>
          </div>

          {/* Progress to next rank */}
          {nextBadge ? (
            <div className="bg-white/90 rounded-2xl p-3 border border-amber-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-sm gap-2">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Lên hạng tiếp:</span>
                  <RankIcon badgeId={nextBadge.id} size="xs" />
                  <strong className="text-amber-900">{nextBadge.title}</strong>
                </span>
                <span className="font-extrabold text-amber-700 whitespace-nowrap">
                  Còn {starsNeededForNext} ★
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  style={{ width: `${progressToNext}%` }}
                  className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-fuchsia-600 to-amber-500 text-white rounded-2xl p-3 font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm">
              <Sparkles className="w-5 h-5 shrink-0" />
              <span>Chúc mừng! Bé đã chinh phục đỉnh cao tối thượng 2000 ★!</span>
            </div>
          )}

          {/* Filter Pills */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl text-sm font-extrabold transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-white text-slate-700 border border-amber-200 hover:bg-amber-100/50'
              }`}
            >
              Tất cả ({badges.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unlocked')}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl text-sm font-extrabold transition-colors cursor-pointer ${
                filter === 'unlocked'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-slate-700 border border-amber-200 hover:bg-emerald-50'
              }`}
            >
              Đã đạt ({unlockedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('locked')}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl text-sm font-extrabold transition-colors cursor-pointer ${
                filter === 'locked'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-700 border border-amber-200 hover:bg-indigo-50'
              }`}
            >
              Mục tiêu ({badges.length - unlockedCount})
            </button>
          </div>
        </div>

        {/* Badges List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 bg-slate-50/60">
          {filteredBadges.length === 0 ? (
            <div className="text-center py-8 text-slate-500 font-bold text-base">
              {filter === 'unlocked'
                ? 'Bé hãy làm bài tập để mở khóa cấp bậc đầu tiên nhé! 💪'
                : 'Bé đã mở khóa toàn bộ các cấp bậc! 🎉'}
            </div>
          ) : (
            filteredBadges.map((b) => {
              const rankNumber = badges.findIndex((item) => item.id === b.id) + 1;
              const isUnlocked = stars >= b.requiredStars;
              const isCurrentRank = currentBadge?.id === b.id;
              const isNextTarget = nextBadge?.id === b.id;
              const progress = Math.min(100, Math.round((stars / b.requiredStars) * 100));
              const styles = getTierStyles(b.tierColor, isUnlocked);

              return (
                <div
                  key={b.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex items-center gap-3.5 sm:gap-4 ${
                    isCurrentRank
                      ? 'border-amber-500 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 shadow-md ring-2 ring-amber-300/60'
                      : isNextTarget
                        ? 'border-orange-300 bg-white shadow-sm'
                        : styles.cardBorder
                  }`}
                >
                  {/* Custom SVG Emblem Icon Box */}
                  <div className="relative shrink-0">
                    <div
                      className={`w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-2xl flex items-center justify-center border-2 transition-transform ${
                        styles.iconBox
                      } ${isUnlocked ? 'scale-105' : 'opacity-90'}`}
                    >
                      <RankIcon badgeId={b.id} size="lg" />
                    </div>
                    <span className="absolute -top-2 -left-2 px-1.5 py-0.5 rounded-lg bg-slate-800 text-white font-black text-xs shadow-xs">
                      #{rankNumber}
                    </span>
                    {!isUnlocked && (
                      <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center border-2 border-white shadow-xs">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  {/* Badge Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      {b.tier && (
                        <span
                          className={`text-xs font-extrabold px-2 py-0.5 rounded-md border ${styles.pill}`}
                        >
                          {b.tier}
                        </span>
                      )}
                      {isCurrentRank && (
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-500 text-white">
                          ★ Cấp bậc hiện tại
                        </span>
                      )}
                      {isNextTarget && (
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 border border-orange-300">
                          🎯 Sắp đạt được
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="font-black text-base sm:text-lg text-slate-900">
                        {b.title}
                      </h4>
                      {isUnlocked ? (
                        <span className="flex items-center gap-1 text-emerald-800 text-sm font-extrabold bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full shrink-0">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{b.requiredStars} ★ Đã đạt</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-900 bg-amber-100/80 border border-amber-300 px-2.5 py-0.5 rounded-full text-sm font-extrabold shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                          <span>Mốc {b.requiredStars} ★</span>
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 mt-1">
                      {b.desc}
                    </p>

                    {!isUnlocked && (
                      <div className="mt-2.5 flex items-center gap-2.5">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${progress}%` }}
                            className={`h-full rounded-full ${styles.bar}`}
                          />
                        </div>
                        <span className="text-sm font-extrabold text-slate-600 tabular-nums shrink-0">
                          {stars}/{b.requiredStars} ★
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <span className="text-sm font-bold text-slate-600">
            Mỗi câu trả lời đúng = <strong className="text-amber-600">+1 ★</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-sm rounded-xl cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
