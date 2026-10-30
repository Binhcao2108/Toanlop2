import { StudentAccount } from '../types/math';

export const DRIVE_FOLDER_ID = '1iPduGOSbnBDKhRFJiKXVZIh8rz7jNmo7';
export const DRIVE_FOLDER_URL = `https://drive.google.com/drive/u/0/folders/${DRIVE_FOLDER_ID}`;
export const DRIVE_FILE_ID = '1lL3OV8i8OYotnv_8gzK2ovVhl1SQKtTcQPBHHMAcRiU';
export const DRIVE_FILE_NAME = 'taikhoan';
export const DRIVE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${DRIVE_FILE_ID}/edit`;

// Hai sheet riêng biệt trong file bảng tính taikhoan:
// 1. Sheet 'tai khoan' (gid=1444030410): dùng để đồng bộ danh sách tài khoản đăng nhập (ID, Pass, Họ Và Tên)
// 2. Sheet 'so sao' (gid=2013539663): dùng để đồng bộ tổng số sao của từng tài khoản (ID, Mã xác nhận, Số sao)
export const SHEET_TAI_KHOAN = 'tai khoan';
export const SHEET_TAI_KHOAN_GID = '1444030410';
export const SHEET_SO_SAO = 'so sao';
export const SHEET_SO_SAO_GID = '2013539663';

export const REGISTER_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSc08EZkjzL_5mjQUMtFZ6KdhQkp0h0TC1Y7RtyqhJ1KzBC-jg/viewform?fbzx=4094338494009261511';

// Exclusive Full-Privilege Admin Account
export const ADMIN_ACCOUNT: StudentAccount = {
  id: 'BINHCK',
  pass: 'Khanhan@2019',
  fullName: 'Quản Trị Viên (ADMIN)',
  isAdmin: true,
};

export function matchAdminAccount(idText: string, passText: string): StudentAccount | null {
  if (
    idText.trim().toLowerCase() === ADMIN_ACCOUNT.id.toLowerCase() &&
    (passText.trim() === ADMIN_ACCOUNT.pass ||
      passText.trim().toLowerCase() === ADMIN_ACCOUNT.pass.toLowerCase())
  ) {
    return { ...ADMIN_ACCOUNT };
  }
  return null;
}

// Pre-downloaded accounts from sheet 'tai khoan' in folder 1iPduGOSbnBDKhRFJiKXVZIh8rz7jNmo7
export const DEFAULT_DRIVE_ACCOUNTS: StudentAccount[] = [
  { id: 'Binhck', pass: '210819', fullName: 'CAO KHÁNH BÌNH' },
  { id: 'minh', pass: '123456', fullName: 'minh' },
  { id: 'ANCK', pass: '210819', fullName: 'CAO KHÁNH AN' },
  { id: 'tramnguyen', pass: '210819', fullName: 'Nguyễn Thị Bích Trâm' },
  { id: 'TEST2019', pass: 'Khanhbinh', fullName: 'TEST' },
];

const ACCOUNTS_STORAGE_KEY = 'grade2_math_drive_accounts_v4';
const SO_SAO_MAP_STORAGE_KEY = 'grade2_math_sheet_so_sao_map_v1';
const LAST_SYNC_STORAGE_KEY = 'grade2_math_drive_last_sync';
const CURRENT_ACCOUNT_STORAGE_KEY = 'grade2_math_current_account';

/**
 * Splits a single CSV line into cells, respecting double quotes.
 */
export function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses CSV text from Sheet 1 ('tai khoan') containing ID and Pass columns into StudentAccount[].
 * Explicitly distinguishes 'tai khoan' from 'so sao' so star rows are never treated as login accounts.
 */
export function parseAccountsCsv(csvText: string): StudentAccount[] {
  const lines = csvText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headerCols = splitCsvLine(lines[0]).map((col) => col.trim().toLowerCase());

  // Nếu bảng có cột "số sao" mà không có cột "pass", đây là sheet "so sao" chứ không phải "tai khoan"
  const hasSoSaoHeader = headerCols.some((h) => h.includes('số sao') || h.includes('so sao'));

  let idIdx = headerCols.findIndex((h) => h === 'id');
  if (idIdx < 0) {
    idIdx = headerCols.findIndex((h) => h.includes('id') || h.includes('tài khoản'));
  }

  let passIdx = headerCols.findIndex((h) => h === 'pass' || h === 'password');
  if (passIdx < 0) {
    passIdx = headerCols.findIndex((h) => h.includes('pass') || h.includes('mật khẩu'));
  }

  if (hasSoSaoHeader && passIdx < 0) {
    return [];
  }

  let nameIdx = headerCols.findIndex(
    (h) => h.includes('họ và tên') || h.includes('ho va ten') || h.includes('họ tên') || h === 'tên'
  );

  const colId = idIdx >= 0 ? idIdx : 0;
  const colPass = passIdx >= 0 ? passIdx : 1;

  // Map by lowercase ID to keep the latest registration row if an ID appears multiple times
  const byId = new Map<string, StudentAccount>();

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const id = (cols[colId] || '').trim();
    const pass = (cols[colPass] || '').trim();
    const fullName = nameIdx >= 0 ? (cols[nameIdx] || '').trim() : undefined;
    if (id && pass) {
      byId.set(id.toLowerCase(), {
        id,
        pass,
        ...(fullName ? { fullName } : {}),
      });
    }
  }

  return Array.from(byId.values());
}

/**
 * Parses CSV text from Sheet 2 ('so sao') containing columns:
 * "Dấu thời gian", "ID", "Mã xác nhận", "Số sao"
 * Sums all valid star entries for each account ID (case-insensitive).
 */
export function parseSoSaoCsv(csvText: string): {
  validSheet: boolean;
  starsById: Record<string, number>;
} {
  const lines = csvText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 1) {
    return { validSheet: false, starsById: {} };
  }

  const headerCols = splitCsvLine(lines[0]).map((col) => col.trim().toLowerCase());

  let idIdx = headerCols.findIndex((h) => h === 'id');
  if (idIdx < 0) {
    idIdx = headerCols.findIndex((h) => h.includes('id') || h.includes('tài khoản'));
  }

  let starsIdx = headerCols.findIndex(
    (h) => h === 'số sao' || h === 'so sao' || h.includes('số sao') || h.includes('so sao')
  );

  // Phải có cột ID và cột Số sao mới đúng là sheet 'so sao'
  if (idIdx < 0 || starsIdx < 0) {
    return { validSheet: false, starsById: {} };
  }

  const starsById: Record<string, number> = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const rawId = (cols[idIdx] || '').trim();
    const rawStars = (cols[starsIdx] || '').trim();
    if (!rawId) continue;

    const parsedStars = parseInt(rawStars, 10);
    if (!Number.isNaN(parsedStars) && parsedStars > 0) {
      const key = rawId.toLowerCase();
      starsById[key] = (starsById[key] || 0) + parsedStars;
    }
  }

  return { validSheet: true, starsById };
}

export function getSavedSoSaoMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(SO_SAO_MAP_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return { binhck: 4 };
}

export function saveSoSaoMap(map: Record<string, number>): void {
  try {
    localStorage.setItem(SO_SAO_MAP_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/**
 * Fetches Sheet 2 ('so sao') directly from Google Sheets and computes the total stars per account ID.
 * Prioritizes native CSV export (/export?format=csv&gid=2013539663) so mixed-type ID columns are never stripped by gviz.
 */
export async function syncSoSaoSheetFromGoogleDrive(
  targetFileId = DRIVE_FILE_ID
): Promise<{
  ok: boolean;
  starsById: Record<string, number>;
}> {
  const soSaoUrls = [
    `https://docs.google.com/spreadsheets/d/${targetFileId}/export?format=csv&gid=${SHEET_SO_SAO_GID}&_t=${Date.now()}`,
    `https://docs.google.com/spreadsheets/d/${targetFileId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
      SHEET_SO_SAO
    )}&_t=${Date.now()}`,
  ];

  for (const sheetUrl of soSaoUrls) {
    try {
      const response = await fetch(sheetUrl, { cache: 'no-store' });
      if (response.ok) {
        const csvText = await response.text();
        const parsed = parseSoSaoCsv(csvText);
        if (parsed.validSheet) {
          saveSoSaoMap(parsed.starsById);
          // Đồng bộ tổng số sao từ sheet 'so sao' vào bộ nhớ từng tài khoản (không làm giảm số sao nếu trên máy đang có sao chờ gửi)
          Object.entries(parsed.starsById).forEach(([idLower, sheetTotal]) => {
            const currentLocal = getAccountStars(idLower);
            if (sheetTotal > currentLocal) {
              saveAccountStars(sheetTotal, idLower);
            }
          });
          return { ok: true, starsById: parsed.starsById };
        }
      }
    } catch {
      // try next URL
    }
  }

  try {
    const localRes = await fetch(`/sosao.csv?_t=${Date.now()}`);
    if (localRes.ok) {
      const csvText = await localRes.text();
      const parsed = parseSoSaoCsv(csvText);
      if (parsed.validSheet) {
        return { ok: true, starsById: parsed.starsById };
      }
    }
  } catch {
    // ignore
  }

  return { ok: false, starsById: getSavedSoSaoMap() };
}

export function getSavedAccounts(): StudentAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_DRIVE_ACCOUNTS;
}

export function getLastSyncTime(): string {
  try {
    return localStorage.getItem(LAST_SYNC_STORAGE_KEY) || 'Vừa đồng bộ';
  } catch {
    return 'Vừa đồng bộ';
  }
}

export function getCurrentLoggedInAccount(): StudentAccount | null {
  try {
    const raw = localStorage.getItem(CURRENT_ACCOUNT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.id === 'string') {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export function saveCurrentLoggedInAccount(account: StudentAccount | null): void {
  try {
    if (account) {
      localStorage.setItem(CURRENT_ACCOUNT_STORAGE_KEY, JSON.stringify(account));
    } else {
      localStorage.removeItem(CURRENT_ACCOUNT_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

export function getAccountStars(accountId?: string | null): number {
  try {
    const key = accountId ? `grade2_math_stars_${accountId.toLowerCase()}` : 'grade2_math_stars';
    const saved = localStorage.getItem(key);
    const localVal = saved ? parseInt(saved, 10) : 0;
    if (accountId) {
      const soSaoMap = getSavedSoSaoMap();
      const sheetVal = soSaoMap[accountId.trim().toLowerCase()] || 0;
      return Math.max(Number.isNaN(localVal) ? 0 : localVal, sheetVal);
    }
    return Number.isNaN(localVal) ? 0 : localVal;
  } catch {
    return 0;
  }
}

export function saveAccountStars(stars: number, accountId?: string | null): void {
  try {
    const key = accountId ? `grade2_math_stars_${accountId.toLowerCase()}` : 'grade2_math_stars';
    localStorage.setItem(key, stars.toString());
  } catch {
    // ignore
  }
}

/**
 * Syncs login accounts from Sheet 1 ('tai khoan') and total stars from Sheet 2 ('so sao')
 * inside the Google Drive spreadsheet (taikhoan).
 *
 * Uses `/export?format=csv&gid=1444030410` as the primary endpoint because Google Visualization API (`gviz/tq`)
 * drops text values (passwords containing letters) when a column is predominantly numeric.
 */
export async function syncAccountsFromGoogleDrive(customFileOrFolderInput?: string): Promise<{
  accounts: StudentAccount[];
  syncedAt: string;
  source: string;
}> {
  let targetFileId = DRIVE_FILE_ID;

  if (customFileOrFolderInput && customFileOrFolderInput.trim()) {
    const match = customFileOrFolderInput.match(/[-\w]{25,}/);
    if (match && match[0] !== DRIVE_FOLDER_ID) {
      targetFileId = match[0];
    }
  }

  // Đồng bộ song song Sheet 'so sao' để lấy tổng số sao của từng tài khoản
  void syncSoSaoSheetFromGoogleDrive(targetFileId);

  // Ưu tiên `/export?format=csv&gid=1444030410` để lấy đầy đủ cả mật khẩu số và mật khẩu có chữ (tránh lỗi gviz/tq bỏ trống ô chữ trong cột số)
  const urlsToTry = [
    `https://docs.google.com/spreadsheets/d/${targetFileId}/export?format=csv&gid=${SHEET_TAI_KHOAN_GID}&_t=${Date.now()}`,
    `https://docs.google.com/spreadsheets/d/${targetFileId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
      SHEET_TAI_KHOAN
    )}&_t=${Date.now()}`,
  ];

  const mergedById = new Map<string, StudentAccount>();

  for (const url of urlsToTry) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) {
        const csvText = await response.text();
        const parsed = parseAccountsCsv(csvText);
        for (const acc of parsed) {
          const key = acc.id.trim().toLowerCase();
          if (!mergedById.has(key)) {
            mergedById.set(key, acc);
          }
        }
        // Nếu endpoint đầu tiên (export?format=csv) đã lấy được danh sách đầy đủ thì dùng ngay
        if (mergedById.size > 0 && url.includes('/export?format=csv')) {
          break;
        }
      }
    } catch {
      // Try next URL
    }
  }

  if (mergedById.size > 0) {
    const finalAccounts = Array.from(mergedById.values());
    const syncedAt = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(finalAccounts));
      localStorage.setItem(LAST_SYNC_STORAGE_KEY, syncedAt);
    } catch {
      // ignore
    }
    return {
      accounts: finalAccounts,
      syncedAt,
      source: `Google Drive (${DRIVE_FILE_NAME} - sheet "${SHEET_TAI_KHOAN}")`,
    };
  }

  try {
    const localRes = await fetch(`/taikhoan.csv?_t=${Date.now()}`);
    if (localRes.ok) {
      const csvText = await localRes.text();
      const parsed = parseAccountsCsv(csvText);
      if (parsed.length > 0) {
        const syncedAt = new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        try {
          localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(parsed));
          localStorage.setItem(LAST_SYNC_STORAGE_KEY, syncedAt);
        } catch {
          // ignore
        }
        return {
          accounts: parsed,
          syncedAt,
          source: `Bản tải về (${DRIVE_FILE_NAME} - sheet "${SHEET_TAI_KHOAN}")`,
        };
      }
    }
  } catch {
    // ignore
  }

  const syncedAt = new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return {
    accounts: DEFAULT_DRIVE_ACCOUNTS,
    syncedAt,
    source: `Mặc định (${DRIVE_FILE_NAME} - sheet "${SHEET_TAI_KHOAN}")`,
  };
}
