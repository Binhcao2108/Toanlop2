import { StudentAccount } from '../types/math';
import { syncSoSaoSheetFromGoogleDrive } from './driveAccounts';

export const SCORE_API_URL = "DÁN_URL_EXEC_VÀO_ĐÂY";
export const SCORE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdooLNZPrZs7vqKo1iQ4mkNjl9ZOd5vnewBW08f-pjfYdxbdQ/formResponse";
export const ENTRY_ID = "entry.1755248557";
export const ENTRY_PASS = "entry.1515107676";
export const ENTRY_STARS = "entry.1493121490";

export type ScoreSyncStatus = 'saved' | 'saving' | 'pending';

const PENDING_STARS_PREFIX = 'grade2_math_pending_stars_';
const MIGRATED_INITIAL_PREFIX = 'grade2_math_migrated_initial_';

function getPendingKey(id: string): string {
  return `${PENDING_STARS_PREFIX}${id.trim().toLowerCase()}`;
}

function getMigratedKey(id: string): string {
  return `${MIGRATED_INITIAL_PREFIX}${id.trim().toLowerCase()}`;
}

export function getPendingStars(id?: string | null): number {
  if (!id) return 0;
  const raw = localStorage.getItem(getPendingKey(id));
  const parsed = parseInt(raw || '0', 10);
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

export function setPendingStars(id: string, count: number): void {
  if (!id) return;
  const safeCount = Math.max(0, Math.floor(count));
  localStorage.setItem(getPendingKey(id), String(safeCount));
}

export function addPendingStars(id: string, delta: number): number {
  if (!id || !Number.isInteger(delta) || delta <= 0) {
    return getPendingStars(id);
  }
  const next = getPendingStars(id) + delta;
  setPendingStars(id, next);
  return next;
}

export function hasMigratedInitialStars(id: string): boolean {
  if (!id) return false;
  return localStorage.getItem(getMigratedKey(id)) === '1';
}

export function markMigratedInitialStars(id: string): void {
  if (!id) return;
  localStorage.setItem(getMigratedKey(id), '1');
}

/**
 * Gửi điểm qua Google Form bằng mode no-cors (ghi vào sheet 'so sao').
 * Chỉ gửi khi delta là số nguyên > 0.
 * Coi là đã gửi nếu fetch không ném lỗi mạng.
 * KHÔNG in mật khẩu ra console.
 */
export async function sendStarsViaForm(id: string, pass: string, delta: number): Promise<boolean> {
  const cleanDelta = Math.floor(delta);
  if (!id || !pass || !Number.isInteger(cleanDelta) || cleanDelta <= 0) {
    return false;
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return false;
  }

  try {
    await fetch(SCORE_FORM_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        [ENTRY_ID]: id,
        [ENTRY_PASS]: pass,
        [ENTRY_STARS]: String(cleanDelta),
      }),
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Đọc tổng số sao của tài khoản:
 * 1. Nếu SCORE_API_URL đã được dán URL Apps Script hợp lệ, gọi POST { action: 'get', id, pass }.
 * 2. Đồng thời / mặc định đọc trực tiếp từ sheet 'so sao' trong file đồng bộ Google Drive
 *    để cộng tổng cột 'Số sao' của đúng tài khoản ID.
 */
export async function fetchStarsFromServer(
  id: string,
  pass: string
): Promise<{ ok: boolean; stars: number }> {
  if (!id || !pass) {
    return { ok: false, stars: 0 };
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { ok: false, stars: 0 };
  }

  // 1. Thử đọc qua Apps Script nếu SCORE_API_URL đã được cấu hình URL thật
  if (SCORE_API_URL && SCORE_API_URL.startsWith('http')) {
    try {
      const response = await fetch(SCORE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'get',
          id,
          pass,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.ok === true && typeof data.stars === 'number' && !Number.isNaN(data.stars)) {
          return {
            ok: true,
            stars: Math.max(0, Math.floor(data.stars)),
          };
        }
      }
    } catch {
      // Nếu lỗi, chuyển sang đọc trực tiếp từ sheet 'so sao' bên dưới
    }
  }

  // 2. Đọc trực tiếp từ sheet 'so sao' của file bảng tính trên Google Drive
  try {
    const sheetRes = await syncSoSaoSheetFromGoogleDrive();
    if (sheetRes.ok) {
      const key = id.trim().toLowerCase();
      const totalFromSheet = sheetRes.starsById[key] || 0;
      return {
        ok: true,
        stars: Math.max(0, Math.floor(totalFromSheet)),
      };
    }
  } catch {
    // ignore
  }

  return { ok: false, stars: 0 };
}

let isFlushingFlag = false;

export function isCurrentlyFlushing(): boolean {
  return isFlushingFlag;
}

/**
 * Gộp toàn bộ sao đang chờ của tài khoản thành MỘT lần gửi form.
 * Gửi xong trừ đúng số vừa gửi khỏi bộ đếm.
 * Đảm bảo không có 2 lần flush chạy chồng nhau.
 */
export async function flushPendingStars(
  account: StudentAccount | null,
  onStatusChange?: () => void
): Promise<boolean> {
  if (!account || !account.id || !account.pass) {
    return false;
  }

  if (isFlushingFlag) {
    return false;
  }

  const deltaToSend = getPendingStars(account.id);
  if (!Number.isInteger(deltaToSend) || deltaToSend <= 0) {
    onStatusChange?.();
    return true;
  }

  isFlushingFlag = true;
  onStatusChange?.();

  try {
    const sent = await sendStarsViaForm(account.id, account.pass, deltaToSend);
    if (sent) {
      const currentPending = getPendingStars(account.id);
      const remaining = Math.max(0, currentPending - deltaToSend);
      setPendingStars(account.id, remaining);
      return true;
    }
    return false;
  } finally {
    isFlushingFlag = false;
    onStatusChange?.();
  }
}

/**
 * Gọi flush khi đăng xuất, đợi tối đa timeoutMs (mặc định 5000ms).
 */
export async function flushPendingStarsWithTimeout(
  account: StudentAccount | null,
  timeoutMs = 5000,
  onStatusChange?: () => void
): Promise<void> {
  if (!account || getPendingStars(account.id) <= 0) {
    return;
  }

  await Promise.race([
    flushPendingStars(account, onStatusChange),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}
