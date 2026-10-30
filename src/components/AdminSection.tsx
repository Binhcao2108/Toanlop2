import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  UserPlus,
  FolderKanban,
  FileSpreadsheet,
  Eye,
  EyeOff,
  Search,
  LogOut,
  Play,
  Star,
} from 'lucide-react';
import { StudentAccount } from '../types/math';
import {
  REGISTER_FORM_URL,
  DRIVE_FOLDER_URL,
  DRIVE_SHEET_URL,
  SHEET_TAI_KHOAN,
  SHEET_SO_SAO,
  getAccountStars,
  getSavedSoSaoMap,
} from '../utils/driveAccounts';
import { sound } from '../utils/audio';

interface AdminSectionProps {
  currentAccount: StudentAccount;
  accounts: StudentAccount[];
  lastSyncTime: string;
  isSyncing: boolean;
  onSyncDrive: () => Promise<StudentAccount[]>;
  onStartLearning: () => void;
  onLogout: () => void;
}

export const AdminSection: React.FC<AdminSectionProps> = ({
  currentAccount,
  accounts,
  lastSyncTime,
  isSyncing,
  onSyncDrive,
  onStartLearning,
  onLogout,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const soSaoMap = getSavedSoSaoMap();

  const handleCopyLink = async (url: string, key: string) => {
    sound.playClick();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2500);
    } catch {
      // Fallback ignore
    }
  };

  const handleManualSync = async () => {
    sound.playClick();
    setSyncMessage(null);
    const updated = await onSyncDrive();
    setSyncMessage(
      `Đã đồng bộ thành công ${updated.length} tài khoản (sheet "${SHEET_TAI_KHOAN}") & tổng số sao (sheet "${SHEET_SO_SAO}")!`
    );
    setTimeout(() => {
      setSyncMessage(null);
    }, 4000);
  };

  const filteredAccounts = accounts.filter((acc) => {
    const q = searchQuery.trim().toLowerCase();
    return (
      acc.id.toLowerCase().includes(q) ||
      (acc.fullName && acc.fullName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Top Admin Header Card */}
      <div className="bg-white rounded-3xl border-2 border-indigo-400 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 px-5 py-5 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
                <ShieldCheck className="w-8 h-8 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-0.5 rounded-full bg-amber-400 text-indigo-950 font-black text-xs uppercase tracking-wider">
                    FULL QUYỀN QUẢN TRỊ
                  </span>
                  <span className="text-sm text-indigo-100 font-semibold">
                    ID: {currentAccount.id}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black mt-1">
                  Trang Quản Trị Hệ Thống (ADMIN)
                </h2>
                <p className="text-sm text-indigo-100">
                  Quản lý danh sách tài khoản (sheet &ldquo;{SHEET_TAI_KHOAN}&rdquo;) và tổng số sao (sheet &ldquo;{SHEET_SO_SAO}&rdquo;)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="min-h-[44px] px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-indigo-950 font-black text-sm rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onLogout();
                }}
                className="min-h-[44px] px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-bold text-sm rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sync Feedback Banner */}
        {syncMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-3 text-emerald-800 text-sm font-bold flex items-center justify-between">
            <span>✅ {syncMessage}</span>
          </div>
        )}

        {/* Overview Metrics */}
        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-indigo-50/40">
          <div className="bg-white p-4 rounded-2xl border-2 border-indigo-200 shadow-2xs flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-600">
                Số lượng tài khoản hiện có
              </div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-700 tabular-nums">
                {accounts.length} <span className="text-base font-bold text-slate-600">tài khoản</span>
              </div>
              <div className="text-sm text-indigo-700 font-bold">
                Sheet: &ldquo;{SHEET_TAI_KHOAN}&rdquo;
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-600">Tài khoản Quản Trị</div>
              <div className="text-lg font-black text-amber-900">
                {currentAccount.id} (Admin)
              </div>
              <div className="text-sm text-emerald-700 font-bold">Toàn quyền truy cập</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <RefreshCw className={`w-6 h-6 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-600">Lần đồng bộ gần nhất</div>
              <div className="text-lg font-black text-emerald-800">{lastSyncTime}</div>
              <div className="text-sm text-slate-500 font-semibold">
                2 Sheet: &ldquo;{SHEET_TAI_KHOAN}&rdquo; &amp; &ldquo;{SHEET_SO_SAO}&rdquo;
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Links Grid: Link Đăng Ký & Link Quản Lý Tài Khoản */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Link Đăng Ký Tài Khoản */}
        <div className="bg-white rounded-3xl border-2 border-indigo-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Link Đăng Ký Tài Khoản
                </h3>
                <p className="text-sm text-slate-600">
                  Biểu mẫu Google Form để phụ huynh / học sinh đăng ký tài khoản mới (ghi vào sheet <strong>{SHEET_TAI_KHOAN}</strong>)
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-mono text-slate-700 break-all select-all">
              {REGISTER_FORM_URL}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <a
              href={REGISTER_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              className="flex-1 min-h-[48px] px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span>Mở Trang Đăng Ký</span>
            </a>

            <button
              type="button"
              onClick={() => handleCopyLink(REGISTER_FORM_URL, 'register')}
              className="min-h-[48px] px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-sm rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              {copiedKey === 'register' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-emerald-700">Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 shrink-0" />
                  <span>Sao chép link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card 2: Link Quản Lý Tài Khoản */}
        <div className="bg-white rounded-3xl border-2 border-emerald-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FolderKanban className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Link Quản Lý Tài Khoản &amp; Số Sao
                </h3>
                <p className="text-sm text-slate-600">
                  Sheet <strong className="text-indigo-800">{SHEET_TAI_KHOAN}</strong> (ID / Pass) &amp; Sheet <strong className="text-amber-800">{SHEET_SO_SAO}</strong> (Tổng số sao)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono text-slate-700 break-all select-all">
                <span className="font-sans font-bold text-slate-500 block text-xs mb-0.5">
                  Thư mục Google Drive:
                </span>
                {DRIVE_FOLDER_URL}
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-sm font-mono text-emerald-950 break-all select-all">
                <span className="font-sans font-bold text-emerald-700 block text-xs mb-0.5">
                  File bảng tính (2 sheet: &ldquo;{SHEET_TAI_KHOAN}&rdquo; &amp; &ldquo;{SHEET_SO_SAO}&rdquo;):
                </span>
                {DRIVE_SHEET_URL}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1 flex-wrap">
            <a
              href={DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              className="flex-1 min-h-[48px] px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span>Mở Thư Mục Drive</span>
            </a>

            <a
              href={DRIVE_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              className="flex-1 min-h-[48px] px-3.5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-2xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>Mở File taikhoan</span>
            </a>

            <button
              type="button"
              onClick={() => handleCopyLink(DRIVE_FOLDER_URL, 'drive')}
              className="min-h-[48px] px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-sm rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              {copiedKey === 'drive' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Đã chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 shrink-0" />
                  <span>Chép link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Existing Accounts List Table */}
      <div className="bg-white rounded-3xl border-2 border-amber-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Danh Sách Tài Khoản Hiện Có ({accounts.length})</span>
            </h3>
            <p className="text-sm text-slate-600">
              Tài khoản lấy từ sheet <strong>&ldquo;{SHEET_TAI_KHOAN}&rdquo;</strong> · Tổng số sao cộng từ sheet <strong>&ldquo;{SHEET_SO_SAO}&rdquo;</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo ID hoặc họ tên..."
                className="w-full min-h-[44px] pl-9 pr-3 py-2 text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowPasswords((prev) => !prev);
              }}
              className="min-h-[44px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {showPasswords ? (
                <>
                  <EyeOff className="w-4 h-4 shrink-0" />
                  <span>Ẩn mật khẩu</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 shrink-0" />
                  <span>Hiện mật khẩu</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-sm font-extrabold border-b border-slate-200">
                <th className="py-3 px-4 w-16">STT</th>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-4">Tài khoản (ID)</th>
                <th className="py-3 px-4">Mật khẩu (Pass)</th>
                <th className="py-3 px-4">Tổng số sao (Sheet &ldquo;{SHEET_SO_SAO}&rdquo;)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm font-bold">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    Không tìm thấy tài khoản nào khớp với từ khóa.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc, idx) => {
                  const sheetStars = soSaoMap[acc.id.trim().toLowerCase()] || 0;
                  const totalStars = Math.max(sheetStars, getAccountStars(acc.id));
                  return (
                    <tr key={`${acc.id}-${idx}`} className="hover:bg-amber-50/50 transition-colors">
                      <td className="py-3 px-4 text-slate-500 tabular-nums">{idx + 1}</td>
                      <td className="py-3 px-4 text-slate-700">
                        {acc.fullName || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-extrabold">{acc.id}</td>
                      <td className="py-3 px-4 font-mono text-indigo-700">
                        {showPasswords ? acc.pass : '••••••••'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-sm font-extrabold">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{totalStars} ★</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onStartLearning();
            }}
            className="min-h-[48px] px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-base rounded-2xl shadow-sm flex items-center gap-2 cursor-pointer transition-all"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Vào Xem & Làm Bài Tập Như Học Sinh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
