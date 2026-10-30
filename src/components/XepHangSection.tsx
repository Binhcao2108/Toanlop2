import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  RefreshCw,
  Search,
  Sparkles,
  Award,
  Flame,
  Users,
  ArrowUpRight,
  Star,
} from 'lucide-react';
import { StudentAccount } from '../types/math';
import {
  ADMIN_ACCOUNT,
  getAccountStars,
  getSavedSoSaoMap,
  syncSoSaoSheetFromGoogleDrive,
} from '../utils/driveAccounts';
import { getPendingStars } from '../utils/scoreSync';
import { getCurrentRankInfo } from '../utils/mathGenerators';
import { RankIcon } from './RankIcon';
import { sound } from '../utils/audio';

interface XepHangSectionProps {
  accounts: StudentAccount[];
  currentAccount: StudentAccount | null;
  currentUserStars: number;
  lastSyncTime: string;
  isSyncing: boolean;
  onSyncDrive: () => Promise<StudentAccount[]>;
  onOpenBadges: () => void;
  onStartLearning: () => void;
}

interface LeaderboardEntry {
  id: string;
  fullName?: string;
  stars: number;
  isCurrentUser: boolean;
  isAdmin: boolean;
  rankPosition: number;
}

export const XepHangSection: React.FC<XepHangSectionProps> = ({
  accounts,
  currentAccount,
  currentUserStars,
  lastSyncTime,
  isSyncing,
  onSyncDrive,
  onOpenBadges,
  onStartLearning,
}) => {
  const [soSaoMap, setSoSaoMap] = useState<Record<string, number>>(() =>
    getSavedSoSaoMap()
  );
  const [isRefreshingScores, setIsRefreshingScores] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastScoreSyncAt, setLastScoreSyncAt] = useState<string>(lastSyncTime);

  const refreshScores = useCallback(async () => {
    setIsRefreshingScores(true);
    try {
      const [soSaoRes] = await Promise.all([
        syncSoSaoSheetFromGoogleDrive(),
        onSyncDrive(),
      ]);
      if (soSaoRes.ok) {
        setSoSaoMap(soSaoRes.starsById);
      } else {
        setSoSaoMap(getSavedSoSaoMap());
      }
      setLastScoreSyncAt(new Date().toLocaleTimeString('vi-VN'));
    } finally {
      setIsRefreshingScores(false);
    }
  }, [onSyncDrive]);

  // Automatically sync the latest stars from the 'so sao' sheet when opening the leaderboard tab
  useEffect(() => {
    let mounted = true;
    setIsRefreshingScores(true);
    syncSoSaoSheetFromGoogleDrive()
      .then((res) => {
        if (!mounted) return;
        if (res.ok) {
          setSoSaoMap(res.starsById);
          setLastScoreSyncAt(new Date().toLocaleTimeString('vi-VN'));
        } else {
          setSoSaoMap(getSavedSoSaoMap());
        }
      })
      .finally(() => {
        if (mounted) {
          setIsRefreshingScores(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Build sorted leaderboard combining accounts from Sheet 'tai khoan' + any IDs present in Sheet 'so sao'
  const leaderboard = useMemo<LeaderboardEntry[]>(() => {
    const mapByLowerId = new Map<
      string,
      { id: string; fullName?: string; isAdmin: boolean }
    >();

    for (const acc of accounts) {
      const cleanId = acc.id.trim();
      if (!cleanId) continue;
      const lower = cleanId.toLowerCase();
      mapByLowerId.set(lower, {
        id: cleanId,
        fullName: acc.fullName,
        isAdmin: Boolean(acc.isAdmin || cleanId.toUpperCase() === ADMIN_ACCOUNT.id),
      });
    }

    // Also include any student IDs recorded in Sheet 'so sao' even if not yet in local accounts list
    for (const rawKey of Object.keys(soSaoMap)) {
      const lower = rawKey.trim().toLowerCase();
      if (!lower) continue;
      if (!mapByLowerId.has(lower)) {
        mapByLowerId.set(lower, {
          id: rawKey.trim().toUpperCase(),
          isAdmin: rawKey.trim().toUpperCase() === ADMIN_ACCOUNT.id,
        });
      }
    }

    // Ensure currently logged-in account is always included
    if (currentAccount?.id) {
      const lower = currentAccount.id.trim().toLowerCase();
      if (!mapByLowerId.has(lower)) {
        mapByLowerId.set(lower, {
          id: currentAccount.id.trim(),
          fullName: currentAccount.fullName,
          isAdmin: Boolean(currentAccount.isAdmin),
        });
      }
    }

    const currentLower = currentAccount?.id.trim().toLowerCase() || '';

    const rawEntries = Array.from(mapByLowerId.entries()).map(([lowerId, info]) => {
      const sheetStars = soSaoMap[lowerId] || 0;
      const localStars = getAccountStars(info.id);
      const pendingStars = getPendingStars(info.id);
      const isMe = lowerId === currentLower;

      const bestStars = isMe
        ? Math.max(currentUserStars, localStars, sheetStars + pendingStars)
        : Math.max(localStars, sheetStars + pendingStars);

      return {
        id: info.id,
        fullName: info.fullName,
        stars: bestStars,
        isCurrentUser: isMe,
        isAdmin: info.isAdmin,
      };
    });

    // Sort descending by stars, then alphabetically by fullName/id
    rawEntries.sort((a, b) => {
      if (b.stars !== a.stars) return b.stars - a.stars;
      const nameA = (a.fullName || a.id).toLocaleLowerCase('vi');
      const nameB = (b.fullName || b.id).toLocaleLowerCase('vi');
      return nameA.localeCompare(nameB, 'vi');
    });

    return rawEntries.map((item, idx) => ({
      ...item,
      rankPosition: idx + 1,
    }));
  }, [accounts, soSaoMap, currentAccount, currentUserStars]);

  const currentUserEntry = useMemo(
    () => leaderboard.find((item) => item.isCurrentUser) || null,
    [leaderboard]
  );

  // Find the student right above the current user so we can encourage them
  const nextRivalEntry = useMemo(() => {
    if (!currentUserEntry || currentUserEntry.rankPosition <= 1) return null;
    return leaderboard[currentUserEntry.rankPosition - 2] || null;
  }, [leaderboard, currentUserEntry]);

  const filteredLeaderboard = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return leaderboard;
    return leaderboard.filter(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        (item.fullName && item.fullName.toLowerCase().includes(q))
    );
  }, [leaderboard, searchQuery]);

  const topThree = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);
  const totalStarsAll = useMemo(
    () => leaderboard.reduce((sum, item) => sum + item.stars, 0),
    [leaderboard]
  );

  const busy = isSyncing || isRefreshingScores;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-5 sm:p-7 text-white shadow-lg border-2 border-amber-300">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-sm font-extrabold">
              <Trophy className="w-4 h-4 text-amber-200" />
              <span>Đấu Trường Siêu Sao Toán Lớp 2</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
              <span>🏆 Bảng Xếp Hạng Cao Thủ</span>
            </h2>
            <p className="text-sm sm:text-base text-amber-50 font-semibold max-w-2xl">
              Vinh danh những chiến binh chăm chỉ giải toán và tích lũy nhiều Sao Vàng nhất! Làm bài tập mỗi ngày để thăng hạng thật ngầu nhé!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenBadges();
              }}
              className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 active:scale-95 text-white font-extrabold text-sm border border-white/40 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Award className="w-4 h-4 text-amber-200" />
              <span>Xem 21 Cấp Bậc</span>
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => {
                sound.playClick();
                void refreshScores();
              }}
              className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-white text-amber-950 hover:bg-amber-50 active:scale-95 font-black text-sm shadow-sm flex items-center gap-2 cursor-pointer transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 text-amber-600 ${busy ? 'animate-spin' : ''}`} />
              <span>{busy ? 'Đang cập nhật...' : 'Cập nhật điểm mới'}</span>
            </button>
          </div>
        </div>

        {/* Summary Stats Strip */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/25 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-black/15 backdrop-blur-xs rounded-2xl px-4 py-2.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="text-sm text-amber-100 font-semibold">Tổng số thí sinh</div>
              <div className="text-lg sm:text-xl font-black tabular-nums">
                {leaderboard.length} bạn nhỏ
              </div>
            </div>
          </div>

          <div className="bg-black/15 backdrop-blur-xs rounded-2xl px-4 py-2.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <div className="text-sm text-amber-100 font-semibold">Tổng sao toàn trường</div>
              <div className="text-lg sm:text-xl font-black tabular-nums">
                {totalStarsAll.toLocaleString('vi-VN')} ★
              </div>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-black/15 backdrop-blur-xs rounded-2xl px-4 py-2.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="text-sm text-amber-100 font-semibold">Đồng bộ gần nhất</div>
              <div className="text-base sm:text-lg font-black tabular-nums">
                {lastScoreSyncAt || lastSyncTime || 'Vừa xong'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current User Personal Rank Highlight Card */}
      {currentUserEntry && (
        <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-purple-950 text-white p-5 sm:p-6 shadow-md border-2 border-indigo-400/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <RankIcon
                badgeId={
                  currentUserEntry.isAdmin
                    ? 'b21'
                    : getCurrentRankInfo(currentUserEntry.stars).currentBadge?.id || 'b0'
                }
                size="lg"
              />
              <span className="absolute -top-2 -left-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-sm shadow">
                #{currentUserEntry.rankPosition}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-extrabold uppercase tracking-wider text-amber-300">
                  Vị trí hiện tại của bé
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white/15 text-white text-sm font-bold">
                  Hạng {currentUserEntry.rankPosition} / {leaderboard.length}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black mt-0.5">
                {currentUserEntry.fullName
                  ? `${currentUserEntry.fullName} (${currentUserEntry.id})`
                  : currentUserEntry.id}
              </h3>
              <p className="text-sm text-indigo-200 font-semibold mt-0.5">
                Danh hiệu:{' '}
                <strong className="text-amber-300">
                  {currentUserEntry.isAdmin
                    ? 'Quản Trị Viên Tối Thượng'
                    : getCurrentRankInfo(currentUserEntry.stars).currentBadge?.title ||
                      'Tân Binh Toán Học'}
                </strong>
                {nextRivalEntry ? (
                  <>
                    {' '}
                    • Chỉ cần thêm{' '}
                    <strong className="text-emerald-300">
                      {Math.max(1, nextRivalEntry.stars - currentUserEntry.stars + 1)} ★
                    </strong>{' '}
                    để vượt qua {nextRivalEntry.fullName || nextRivalEntry.id} (Hạng #
                    {nextRivalEntry.rankPosition})!
                  </>
                ) : (
                  <> • Chúc mừng bé đang dẫn đầu Bảng Xếp Hạng Toàn Trường! 🎉</>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/15 pt-3 md:pt-0">
            <div className="px-4 py-2 rounded-2xl bg-amber-400/20 border border-amber-300/40 text-center">
              <div className="text-sm text-amber-200 font-bold">Điểm của bé</div>
              <div className="text-xl sm:text-2xl font-black text-amber-300 tabular-nums">
                {currentUserEntry.stars} ★
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onStartLearning();
              }}
              className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-sm shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Săn Thêm Sao</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top 3 Podium (Bục Vinh Quang Top 3) */}
      {topThree.length > 0 && (
        <div className="bg-white rounded-3xl border-2 border-amber-200/90 p-5 sm:p-7 shadow-xs">
          <div className="text-center mb-6">
            <h3 className="text-xl sm:text-2xl font-black text-amber-950 flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 text-amber-500" />
              <span>Bục Vinh Quang Top 3 Siêu Sao</span>
              <Crown className="w-6 h-6 text-amber-500" />
            </h3>
            <p className="text-sm text-slate-600 font-medium mt-1">
              3 nhà vô địch có tổng số Sao Vàng cao nhất hiện tại
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-4xl mx-auto">
            {/* Rank 2 - Silver (Left on desktop, 2nd on mobile) */}
            {topThree[1] && (
              <div
                className={`order-2 md:order-1 rounded-3xl p-5 border-2 transition-all flex flex-col items-center text-center relative ${
                  topThree[1].isCurrentUser
                    ? 'bg-gradient-to-b from-slate-100 via-white to-indigo-50 border-indigo-400 ring-2 ring-indigo-300 shadow-md'
                    : 'bg-gradient-to-b from-slate-100/90 to-white border-slate-300 shadow-xs'
                }`}
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-800 font-black text-sm mb-3">
                  <Medal className="w-4 h-4 text-slate-600" />
                  <span>Á QUÂN • HẠNG 2</span>
                </div>

                <RankIcon
                  badgeId={
                    topThree[1].isAdmin
                      ? 'b21'
                      : getCurrentRankInfo(topThree[1].stars).currentBadge?.id || 'b0'
                  }
                  size="lg"
                />

                <h4 className="mt-3 font-black text-lg text-slate-900 break-all">
                  {topThree[1].fullName || topThree[1].id}
                </h4>
                {topThree[1].fullName && (
                  <span className="text-sm font-bold text-slate-500">
                    ID: {topThree[1].id}
                  </span>
                )}

                <span className="mt-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-sm font-extrabold">
                  {topThree[1].isAdmin
                    ? 'Tối Thượng'
                    : getCurrentRankInfo(topThree[1].stars).currentBadge?.title ||
                      'Tân Binh Toán Học'}
                </span>

                <div className="mt-3 w-full py-2.5 px-4 rounded-2xl bg-slate-800 text-white font-black text-xl tabular-nums flex items-center justify-center gap-1.5 shadow-xs">
                  <span>{topThree[1].stars}</span>
                  <span className="text-amber-400">★</span>
                </div>
              </div>
            )}

            {/* Rank 1 - Gold Champion (Center on desktop, 1st on mobile) */}
            {topThree[0] && (
              <div
                className={`order-1 md:order-2 rounded-3xl p-6 border-2 transition-all flex flex-col items-center text-center relative md:-translate-y-2 ${
                  topThree[0].isCurrentUser
                    ? 'bg-gradient-to-b from-amber-200/80 via-amber-50 to-white border-amber-500 ring-4 ring-amber-300 shadow-xl'
                    : 'bg-gradient-to-b from-amber-100/90 via-amber-50/50 to-white border-amber-400 shadow-lg'
                }`}
              >
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm shadow-xs mb-3">
                  <Crown className="w-4 h-4 text-yellow-200" />
                  <span>QUÁN QUÂN • HẠNG 1</span>
                </div>

                <RankIcon
                  badgeId={
                    topThree[0].isAdmin
                      ? 'b21'
                      : getCurrentRankInfo(topThree[0].stars).currentBadge?.id || 'b0'
                  }
                  size="xl"
                />

                <h4 className="mt-3 font-black text-xl text-amber-950 break-all">
                  {topThree[0].fullName || topThree[0].id}
                </h4>
                {topThree[0].fullName && (
                  <span className="text-sm font-bold text-amber-800">
                    ID: {topThree[0].id}
                  </span>
                )}

                <span className="mt-1.5 px-3 py-1 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 text-sm font-extrabold">
                  {topThree[0].isAdmin
                    ? 'Quản Trị Tối Thượng'
                    : getCurrentRankInfo(topThree[0].stars).currentBadge?.title ||
                      'Tân Binh Toán Học'}
                </span>

                <div className="mt-4 w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-black text-2xl tabular-nums flex items-center justify-center gap-1.5 shadow-md">
                  <span>{topThree[0].stars}</span>
                  <span className="text-yellow-200">★</span>
                </div>
              </div>
            )}

            {/* Rank 3 - Bronze (Right on desktop, 3rd on mobile) */}
            {topThree[2] && (
              <div
                className={`order-3 rounded-3xl p-5 border-2 transition-all flex flex-col items-center text-center relative ${
                  topThree[2].isCurrentUser
                    ? 'bg-gradient-to-b from-orange-100 via-white to-indigo-50 border-indigo-400 ring-2 ring-indigo-300 shadow-md'
                    : 'bg-gradient-to-b from-orange-100/80 to-white border-orange-300 shadow-xs'
                }`}
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-200 text-orange-950 font-black text-sm mb-3">
                  <Medal className="w-4 h-4 text-orange-700" />
                  <span>QUÝ QUÂN • HẠNG 3</span>
                </div>

                <RankIcon
                  badgeId={
                    topThree[2].isAdmin
                      ? 'b21'
                      : getCurrentRankInfo(topThree[2].stars).currentBadge?.id || 'b0'
                  }
                  size="lg"
                />

                <h4 className="mt-3 font-black text-lg text-slate-900 break-all">
                  {topThree[2].fullName || topThree[2].id}
                </h4>
                {topThree[2].fullName && (
                  <span className="text-sm font-bold text-slate-500">
                    ID: {topThree[2].id}
                  </span>
                )}

                <span className="mt-1.5 px-3 py-1 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 text-sm font-extrabold">
                  {topThree[2].isAdmin
                    ? 'Tối Thượng'
                    : getCurrentRankInfo(topThree[2].stars).currentBadge?.title ||
                      'Tân Binh Toán Học'}
                </span>

                <div className="mt-3 w-full py-2.5 px-4 rounded-2xl bg-orange-900 text-white font-black text-xl tabular-nums flex items-center justify-center gap-1.5 shadow-xs">
                  <span>{topThree[2].stars}</span>
                  <span className="text-amber-300">★</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Leaderboard Table / List */}
      <div className="bg-white rounded-3xl border border-amber-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Danh Sách Xếp Hạng Chi Tiết ({filteredLeaderboard.length} bạn)
            </h3>
            <p className="text-sm text-slate-600">
              Xếp hạng từ cao xuống thấp theo tổng số Sao Vàng tích lũy
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên hoặc ID tài khoản..."
              className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-2xl border border-slate-300 focus:border-amber-500 focus:outline-none text-sm font-semibold text-slate-800 bg-slate-50/70"
            />
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredLeaderboard.map((entry) => {
            const rankInfo = getCurrentRankInfo(entry.stars);
            const currentBadge = rankInfo.currentBadge;
            const nextBadge = rankInfo.nextBadge;
            const badgeId = entry.isAdmin ? 'b21' : currentBadge?.id || 'b0';

            const isTop1 = entry.rankPosition === 1;
            const isTop2 = entry.rankPosition === 2;
            const isTop3 = entry.rankPosition === 3;

            return (
              <div
                key={entry.id}
                className={`rounded-2xl p-3.5 sm:p-4 border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  entry.isCurrentUser
                    ? 'bg-gradient-to-r from-amber-50 via-yellow-50/80 to-indigo-50/70 border-amber-400 shadow-sm ring-2 ring-amber-300/70'
                    : isTop1
                      ? 'bg-amber-50/60 border-amber-300'
                      : isTop2
                        ? 'bg-slate-50/90 border-slate-300'
                        : isTop3
                          ? 'bg-orange-50/50 border-orange-200'
                          : 'bg-white hover:bg-slate-50/80 border-slate-200/80'
                }`}
              >
                {/* Left: Position + Rank Emblem + Name + Rank Title */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  {/* Rank Number Badge */}
                  <div
                    className={`w-11 h-11 rounded-2xl font-black text-base flex items-center justify-center shrink-0 shadow-2xs ${
                      isTop1
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                        : isTop2
                          ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white'
                          : isTop3
                            ? 'bg-gradient-to-br from-orange-300 to-amber-700 text-white'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${entry.rankPosition}`}
                  </div>

                  {/* Custom SVG Rank Shield Icon */}
                  <RankIcon badgeId={badgeId} size="md" />

                  {/* Student Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-black text-base sm:text-lg text-slate-900 truncate">
                        {entry.fullName ? `${entry.fullName} (${entry.id})` : entry.id}
                      </span>

                      {entry.isCurrentUser && (
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-sm font-extrabold">
                          Là bé!
                        </span>
                      )}

                      {entry.isAdmin && (
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 text-sm font-extrabold">
                          👑 Admin
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-sm font-extrabold border ${
                          currentBadge?.tierColor ||
                          'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {entry.isAdmin
                          ? 'Cấp Tối Thượng'
                          : currentBadge?.tier || 'Tập Sự'}
                      </span>

                      <span className="text-sm font-bold text-slate-700">
                        {entry.isAdmin
                          ? 'Quản Trị Viên Tối Thượng'
                          : currentBadge?.title || 'Chưa mở khóa cấp bậc'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Progress to next rank & Total Stars */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-200/60 pt-2.5 sm:pt-0 shrink-0">
                  <div className="w-36 sm:w-44">
                    <div className="flex items-center justify-between text-sm font-bold text-slate-600 mb-1">
                      <span>Tiến độ cấp bậc</span>
                      <span className="tabular-nums">
                        {nextBadge
                          ? `${entry.stars}/${nextBadge.requiredStars}`
                          : ' Tối đa 2000 ★'}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 transition-all duration-500"
                        style={{ width: `${rankInfo.progressToNext}%` }}
                      />
                    </div>
                  </div>

                  <div className="min-w-[96px] px-3.5 py-2 rounded-2xl bg-amber-100/90 border border-amber-300 text-amber-950 font-black text-base sm:text-lg tabular-nums flex items-center justify-center gap-1 shadow-2xs">
                    <span>{entry.stars}</span>
                    <span className="text-amber-500">★</span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredLeaderboard.length === 0 && (
            <div className="text-center py-10 text-slate-500 font-semibold text-base">
              Không tìm thấy bạn nhỏ nào khớp với từ khóa "{searchQuery}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
