import React, { useState } from 'react';
import {
  LogIn,
  LogOut,
  Eye,
  EyeOff,
  Star,
  Award,
  CheckCircle2,
  AlertCircle,
  Play,
  KeyRound,
  User,
  UserPlus,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { StudentAccount, Badge } from '../types/math';
import { REGISTER_FORM_URL, matchAdminAccount } from '../utils/driveAccounts';
import { ScoreSyncStatus } from '../utils/scoreSync';
import { getCurrentRankInfo } from '../utils/mathGenerators';
import { RankIcon } from './RankIcon';
import { sound } from '../utils/audio';

interface TaiKhoanSectionProps {
  currentAccount: StudentAccount | null;
  accounts: StudentAccount[];
  lastSyncTime: string;
  isSyncing: boolean;
  stars: number;
  badges: Badge[];
  onLogin: (account: StudentAccount) => void;
  onLogout: () => void;
  onSyncDrive: () => Promise<StudentAccount[]>;
  onStartLearning: () => void;
  onOpenAdmin?: () => void;
  scoreSyncStatus?: ScoreSyncStatus;
  pendingStarsCount?: number;
  onManualScoreSync?: () => Promise<void>;
}

export const TaiKhoanSection: React.FC<TaiKhoanSectionProps> = ({
  currentAccount,
  accounts,
  isSyncing,
  stars,
  badges,
  onLogin,
  onLogout,
  onSyncDrive,
  onStartLearning,
  onOpenAdmin,
  scoreSyncStatus = 'saved',
  pendingStarsCount = 0,
  onManualScoreSync,
}) => {
  const [inputId, setInputId] = useState<string>('');
  const [inputPass, setInputPass] = useState<string>('');
  const [showPass, setShowPass] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const unlockedCount = badges.filter((b) => stars >= b.requiredStars).length;
  const { currentBadge, nextBadge, progressToNext, starsNeededForNext } =
    getCurrentRankInfo(stars, badges);

  const findMatchingAccount = (
    list: StudentAccount[],
    idText: string,
    passText: string
  ): StudentAccount | undefined => {
    return [...list]
      .reverse()
      .find(
        (acc) =>
          acc.id.trim().toLowerCase() === idText.toLowerCase() &&
          acc.pass.trim() === passText
      );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSyncNotice(null);

    const trimmedId = inputId.trim();
    const trimmedPass = inputPass.trim();

    if (!trimmedId || !trimmedPass) {
      sound.playIncorrect();
      setErrorMsg('Vui lòng nhập đầy đủ cả ID và mật khẩu (pass)!');
      return;
    }

    // 1. Check if this is the full-privilege ADMIN account (BINHCK / Khanhan@2019)
    const adminAcc = matchAdminAccount(trimmedId, trimmedPass);
    if (adminAcc) {
      sound.playCorrect();
      setInputId('');
      setInputPass('');
      onLogin(adminAcc);
      return;
    }

    // 2. Otherwise check student accounts synced from Google Drive `taikhoan`
    let matched = findMatchingAccount(accounts, trimmedId, trimmedPass);

    // If not found in local state, sync fresh data from Google Drive `taikhoan` sheet first
    if (!matched) {
      const latestAccounts = await onSyncDrive();
      matched = findMatchingAccount(latestAccounts, trimmedId, trimmedPass);
    }

    if (!matched) {
      sound.playIncorrect();
      setErrorMsg('Sai ID hoặc mật khẩu (pass)! Vui lòng kiểm tra lại hoặc bấm đồng bộ nếu vừa đăng ký.');
      return;
    }

    sound.playCorrect();
    setInputId('');
    setInputPass('');
    onLogin(matched);
  };

  const handleManualSync = async () => {
    sound.playClick();
    setErrorMsg(null);
    setSyncNotice(null);
    await onSyncDrive();
    setSyncNotice('Đã đồng bộ danh sách tài khoản mới nhất!');
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Top Status / Login or Active Profile Card */}
      {!currentAccount ? (
        <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4 text-white">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                  <LogIn className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black">
                    Đăng Nhập Tài Khoản Làm Bài Tập
                  </h2>
                  <p className="text-sm text-amber-100">
                    Nhập ID và mật khẩu (pass) của bé để bắt đầu làm bài
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {syncNotice && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{syncNotice}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="student-id-input"
                className="block text-sm font-extrabold text-slate-700"
              >
                Tài khoản (ID)
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="student-id-input"
                  type="text"
                  autoComplete="username"
                  value={inputId}
                  onChange={(e) => {
                    setInputId(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Nhập ID tài khoản"
                  className="w-full min-h-[50px] pl-11 pr-4 py-2.5 text-lg font-bold text-slate-900 bg-amber-50/40 border-2 border-slate-300 rounded-2xl focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="student-pass-input"
                className="block text-sm font-extrabold text-slate-700"
              >
                Mật khẩu (pass)
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="student-pass-input"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={inputPass}
                  onChange={(e) => {
                    setInputPass(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Nhập mật khẩu"
                  className="w-full min-h-[50px] pl-11 pr-12 py-2.5 text-lg font-bold text-slate-900 bg-amber-50/40 border-2 border-slate-300 rounded-2xl focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((prev) => !prev)}
                  className="min-h-[44px] min-w-[44px] absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
                  title={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSyncing}
              className="w-full min-h-[52px] py-3 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 active:scale-[0.99] text-white font-black text-lg rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <LogIn className="w-5 h-5" />
              <span>{isSyncing ? 'Đang kiểm tra & đồng bộ...' : 'Đăng Nhập Vào Làm Bài Tập'}</span>
            </button>

            {/* Account Registration Section */}
            <div className="pt-4 mt-2 border-t border-slate-200 space-y-3">
              <div className="text-center">
                <p className="text-sm font-bold text-slate-600">
                  Chưa có tài khoản học tập cho bé?
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <a
                  href={REGISTER_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  className="flex-1 min-h-[48px] py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-extrabold text-base rounded-2xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all text-center"
                >
                  <UserPlus className="w-5 h-5 shrink-0" />
                  <span>Đăng Ký Tài Khoản</span>
                </a>

                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="min-h-[48px] py-2.5 px-4 bg-amber-100 hover:bg-amber-200 disabled:opacity-60 text-amber-900 font-bold text-sm rounded-2xl border border-amber-300 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  title="Cập nhật tài khoản vừa đăng ký"
                >
                  <RefreshCw className={`w-4 h-4 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Đồng bộ tài khoản</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border-2 border-emerald-300 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 text-white flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                <RankIcon
                  badgeId={currentAccount.isAdmin ? 'b21' : currentBadge?.id || 'b0'}
                  size="md"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold bg-white/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{currentAccount.isAdmin ? 'ADMIN Quản Trị' : 'Đang đăng nhập'}</span>
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black mt-0.5">
                  Tài khoản: {currentAccount.id}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onLogout();
              }}
              className="min-h-[44px] px-4 py-2 bg-white/20 hover:bg-white/30 active:scale-95 text-white font-bold text-sm rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất / Đổi tài khoản</span>
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            {currentAccount.isAdmin && onOpenAdmin && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenAdmin();
                }}
                className="w-full min-h-[52px] py-3 px-6 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-black text-lg rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <ShieldCheck className="w-6 h-6 text-amber-300" />
                <span>Vào Trang Quản Trị ADMIN</span>
              </button>
            )}

            {/* Current Rank Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border-2 border-amber-300 space-y-2.5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 flex items-center justify-center shadow-sm border-2 border-amber-300 shrink-0">
                    <RankIcon badgeId={currentBadge?.id || 'b0'} size="lg" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-950">
                        {currentBadge?.tier || 'Tập Sự'}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        Cấp bậc hiện tại
                      </span>
                    </div>
                    <div className="text-lg sm:text-xl font-black text-slate-900">
                      {currentBadge ? currentBadge.title : 'Bé Tập Sự Toán Học'}
                    </div>
                  </div>
                </div>
                {nextBadge && (
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-500">Lên hạng tiếp theo</div>
                    <div className="text-sm font-black text-amber-800 flex items-center justify-end gap-1.5 mt-0.5">
                      <RankIcon badgeId={nextBadge.id} size="xs" />
                      <span>
                        {nextBadge.title} (còn {starsNeededForNext} ★)
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {nextBadge && (
                <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-amber-200">
                  <div
                    style={{ width: `${progressToNext}%` }}
                    className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-full transition-all duration-500"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Star className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-amber-900">Sao vàng tích lũy</div>
                  <div className="text-2xl font-black text-amber-700">{stars} ★</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-indigo-900">Cấp bậc đạt được</div>
                  <div className="text-2xl font-black text-indigo-700">
                    {unlockedCount} / {badges.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Score Sync Status Chip & Manual Sync Button */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-600">Trạng thái điểm:</span>
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold border ${
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
              </div>

              {onManualScoreSync && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    void onManualScoreSync();
                  }}
                  disabled={scoreSyncStatus === 'saving'}
                  className="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 active:scale-95 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
                >
                  <RefreshCw
                    className={`w-4 h-4 shrink-0 ${
                      scoreSyncStatus === 'saving' ? 'animate-spin' : ''
                    }`}
                  />
                  <span>Đồng bộ ngay</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onStartLearning();
              }}
              className="w-full min-h-[52px] py-3 px-6 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white font-black text-lg rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Vào Làm Bài Tập Ngay</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

