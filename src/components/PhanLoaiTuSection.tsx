import React, { useState, useEffect, useMemo } from 'react';
import {
  Tags,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shuffle,
  RotateCcw,
  Lightbulb,
  ArrowRight,
  ListChecks,
  Target,
  BookOpenText,
  Trophy,
  Flame,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { useVirtualKeypad } from '../context/VirtualKeypadContext';
import confetti from 'canvas-confetti';

export type WordGroupType = 'su-vat' | 'dac-diem' | 'hanh-dong';
export type QuestionFormatFilter = 'all' | 'phrase' | 'sentence';
export type PracticeMode = 'single' | 'worksheet-10';

export interface WordClassificationItem {
  id: string;
  format: 'phrase' | 'sentence';
  emoji: string;
  /** For 'phrase': the phrase or word itself. For 'sentence': full sentence with [highlighted] target */
  displayText: string;
  /** The specific word/phrase being classified */
  targetText: string;
  group: WordGroupType;
  subCategory: string;
  explanation: string;
}

export const WORD_GROUP_META: Record<
  WordGroupType,
  {
    label: string;
    shortLabel: string;
    emoji: string;
    questionHint: string;
    examples: string;
    cardBg: string;
    cardBorder: string;
    textColor: string;
    badgeBg: string;
    activeRing: string;
  }
> = {
  'su-vat': {
    label: 'Từ chỉ Sự vật',
    shortLabel: 'Sự vật',
    emoji: '🧸',
    questionHint: 'Trả lời câu hỏi: Ai? Cái gì? Con gì?',
    examples: 'Cô giáo, chú mèo, cây bàng, quyển vở, mặt trời...',
    cardBg: 'bg-sky-50 hover:bg-sky-100/90',
    cardBorder: 'border-sky-300 hover:border-sky-500',
    textColor: 'text-sky-950',
    badgeBg: 'bg-sky-600 text-white',
    activeRing: 'ring-sky-400',
  },
  'dac-diem': {
    label: 'Từ chỉ Đặc điểm',
    shortLabel: 'Đặc điểm',
    emoji: '🎨',
    questionHint: 'Trả lời câu hỏi: Thế nào? (màu sắc, hình dáng, tính nết)',
    examples: 'Đỏ thắm, cao vút, chăm chỉ, tròn xoe, mát rượi...',
    cardBg: 'bg-amber-50 hover:bg-amber-100/90',
    cardBorder: 'border-amber-300 hover:border-amber-500',
    textColor: 'text-amber-950',
    badgeBg: 'bg-amber-500 text-white',
    activeRing: 'ring-amber-400',
  },
  'hanh-dong': {
    label: 'Từ chỉ Hành động',
    shortLabel: 'Hành động',
    emoji: '🏃',
    questionHint: 'Trả lời câu hỏi: Làm gì? (hoạt động, việc làm)',
    examples: 'Học bài, quét nhà, chạy nhảy, ca hát, bay lượn...',
    cardBg: 'bg-emerald-50 hover:bg-emerald-100/90',
    cardBorder: 'border-emerald-300 hover:border-emerald-500',
    textColor: 'text-emerald-950',
    badgeBg: 'bg-emerald-600 text-white',
    activeRing: 'ring-emerald-400',
  },
};

export const WORD_CLASSIFICATION_BANK: WordClassificationItem[] = [
  // ================= DẠNG CỤM TỪ / TỪ NGỮ: SỰ VẬT (16 câu) =================
  {
    id: 'p-sv-1',
    format: 'phrase',
    emoji: '🎒',
    displayText: 'Chiếc cặp sách mới',
    targetText: 'Chiếc cặp sách mới',
    group: 'su-vat',
    subCategory: 'Đồ vật đi học',
    explanation:
      '“Chiếc cặp sách mới” gọi tên đồ vật quen thuộc của học sinh (trả lời câu hỏi Cái gì?), nên là Từ chỉ sự vật.',
  },
  {
    id: 'p-sv-2',
    format: 'phrase',
    emoji: '🐱',
    displayText: 'Chú mèo mướp',
    targetText: 'Chú mèo mướp',
    group: 'su-vat',
    subCategory: 'Con vật',
    explanation:
      '“Chú mèo mướp” là tên gọi con vật nuôi trong nhà (trả lời câu hỏi Con gì?), nên thuộc nhóm Từ chỉ sự vật.',
  },
  {
    id: 'p-sv-3',
    format: 'phrase',
    emoji: '👩‍🏫',
    displayText: 'Cô giáo chủ nhiệm',
    targetText: 'Cô giáo chủ nhiệm',
    group: 'su-vat',
    subCategory: 'Con người',
    explanation:
      '“Cô giáo chủ nhiệm” là từ chỉ người dạy học ở trường (trả lời câu hỏi Ai?), nên thuộc nhóm Từ chỉ sự vật.',
  },
  {
    id: 'p-sv-4',
    format: 'phrase',
    emoji: '🌳',
    displayText: 'Cây phượng vĩ giữa sân trường',
    targetText: 'Cây phượng vĩ giữa sân trường',
    group: 'su-vat',
    subCategory: 'Cây cối',
    explanation:
      '“Cây phượng vĩ” chỉ cây cối (trả lời câu hỏi Cái gì?), nên thuộc nhóm Từ chỉ sự vật.',
  },
  {
    id: 'p-sv-5',
    format: 'phrase',
    emoji: '✏️',
    displayText: 'Hộp bút chì màu',
    targetText: 'Hộp bút chì màu',
    group: 'su-vat',
    subCategory: 'Đồ dùng học tập',
    explanation:
      '“Hộp bút chì màu” là đồ dùng học tập của bé (trả lời câu hỏi Cái gì?), nên là Từ chỉ sự vật.',
  },
  {
    id: 'p-sv-6',
    format: 'phrase',
    emoji: '🐦',
    displayText: 'Đàn chim sẻ nhỏ',
    targetText: 'Đàn chim sẻ nhỏ',
    group: 'su-vat',
    subCategory: 'Con vật',
    explanation:
      '“Đàn chim sẻ nhỏ” chỉ con vật trong tự nhiên (trả lời câu hỏi Con gì?), nên là Từ chỉ sự vật.',
  },
  {
    id: 'p-sv-7',
    format: 'phrase',
    emoji: '👨‍⚕️',
    displayText: 'Bác sĩ khám bệnh',
    targetText: 'Bác sĩ',
    group: 'su-vat',
    subCategory: 'Con người & Nghề nghiệp',
    explanation:
      'Cụm danh từ chỉ người làm nghề y (“Bác sĩ”) trả lời câu hỏi Ai?, nên thuộc nhóm Từ chỉ sự vật.',
  },
  {
    id: 'p-sv-8',
    format: 'phrase',
    emoji: '🌺',
    displayText: 'Bông hoa hồng nhung',
    targetText: 'Bông hoa hồng nhung',
    group: 'su-vat',
    subCategory: 'Cây hoa',
    explanation:
      '“Bông hoa hồng nhung” là tên một loài hoa (cây cối), nên thuộc nhóm Từ chỉ sự vật.',
  },
  {
    id: 'p-sv-9',
    format: 'phrase',
    emoji: '⏰',
    displayText: 'Chiếc đồng hồ báo thức',
    targetText: 'Chiếc đồng hồ báo thức',
    group: 'su-vat',
    subCategory: 'Đồ vật trong nhà',
    explanation:
      '“Chiếc đồng hồ báo thức” chỉ đồ vật xem giờ trong nhà, nên thuộc nhóm Từ chỉ sự vật.',
  },
  {
    id: 'p-sv-10',
    format: 'phrase',
    emoji: '🌞',
    displayText: 'Ông mặt trời buổi sớm',
    targetText: 'Ông mặt trời buổi sớm',
    group: 'su-vat',
    subCategory: 'Thiên nhiên',
    explanation:
      '“Ông mặt trời” chỉ sự vật trong thiên nhiên, bầu trời, nên thuộc nhóm Từ chỉ sự vật.',
  },
  {
    id: 'p-sv-11',
    format: 'phrase',
    emoji: '🐓',
    displayText: 'Chú gà trống tía',
    targetText: 'Chú gà trống tía',
    group: 'su-vat',
    subCategory: 'Con vật',
    explanation:
      '“Chú gà trống tía” chỉ con vật nuôi quen thuộc, nên thuộc nhóm Từ chỉ sự vật.',
  },
  {
    id: 'p-sv-12',
    format: 'phrase',
    emoji: '📖',
    displayText: 'Quyển sách Tiếng Việt lớp 2',
    targetText: 'Quyển sách Tiếng Việt lớp 2',
    group: 'su-vat',
    subCategory: 'Đồ dùng học tập',
    explanation:
      '“Quyển sách Tiếng Việt lớp 2” chỉ đồ dùng học tập (Cái gì?), nên là Từ chỉ sự vật.',
  },
  {
    id: 'p-sv-13',
    format: 'phrase',
    emoji: '👵',
    displayText: 'Bà ngoại hiền từ',
    targetText: 'Bà ngoại',
    group: 'su-vat',
    subCategory: 'Người thân',
    explanation:
      '“Bà ngoại” là từ chỉ người thân trong gia đình (trả lời câu hỏi Ai?), nên là Từ chỉ sự vật.',
  },
  {
    id: 'p-sv-14',
    format: 'phrase',
    emoji: '🚲',
    displayText: 'Chiếc xe đạp màu xanh',
    targetText: 'Chiếc xe đạp màu xanh',
    group: 'su-vat',
    subCategory: 'Phương tiện / Đồ vật',
    explanation:
      'Cụm từ gọi tên đồ vật “Chiếc xe đạp” (Cái gì?), nên thuộc nhóm Từ chỉ sự vật.',
  },
  {
    id: 'p-sv-15',
    format: 'phrase',
    emoji: '🌧️',
    displayText: 'Cơn mưa mùa hạ',
    targetText: 'Cơn mưa mùa hạ',
    group: 'su-vat',
    subCategory: 'Hiện tượng tự nhiên',
    explanation:
      '“Cơn mưa mùa hạ” chỉ hiện tượng tự nhiên (sự vật), nên thuộc nhóm Từ chỉ sự vật.',
  },

  // ================= DẠNG CỤM TỪ / TỪ NGỮ: ĐẶC ĐIỂM (16 câu) =================
  {
    id: 'p-dd-1',
    format: 'phrase',
    emoji: '🌟',
    displayText: 'Chăm chỉ, ngoan ngoãn',
    targetText: 'Chăm chỉ, ngoan ngoãn',
    group: 'dac-diem',
    subCategory: 'Tính nết / Phẩm chất',
    explanation:
      '“Chăm chỉ, ngoan ngoãn” chỉ tính nết tốt đẹp của học sinh (trả lời câu hỏi Thế nào?), nên là Từ chỉ đặc điểm.',
  },
  {
    id: 'p-dd-2',
    format: 'phrase',
    emoji: '🌹',
    displayText: 'Đỏ thắm, tươi tắn',
    targetText: 'Đỏ thắm, tươi tắn',
    group: 'dac-diem',
    subCategory: 'Màu sắc & Vẻ đẹp',
    explanation:
      '“Đỏ thắm, tươi tắn” miêu tả màu sắc và vẻ đẹp (Thế nào?), nên thuộc nhóm Từ chỉ đặc điểm.',
  },
  {
    id: 'p-dd-3',
    format: 'phrase',
    emoji: '🦒',
    displayText: 'Cao vút, thẳng tắp',
    targetText: 'Cao vút, thẳng tắp',
    group: 'dac-diem',
    subCategory: 'Hình dáng / Kích thước',
    explanation:
      '“Cao vút, thẳng tắp” miêu tả hình dáng và chiều cao của sự vật, nên thuộc nhóm Từ chỉ đặc điểm.',
  },
  {
    id: 'p-dd-4',
    format: 'phrase',
    emoji: '👀',
    displayText: 'Tròn xoe, đen láy',
    targetText: 'Tròn xoe, đen láy',
    group: 'dac-diem',
    subCategory: 'Hình dáng & Màu sắc',
    explanation:
      '“Tròn xoe, đen láy” miêu tả hình dáng và màu sắc của đôi mắt, nên là Từ chỉ đặc điểm.',
  },
  {
    id: 'p-dd-5',
    format: 'phrase',
    emoji: '🍬',
    displayText: 'Ngọt lịm, thơm phức',
    targetText: 'Ngọt lịm, thơm phức',
    group: 'dac-diem',
    subCategory: 'Hương vị',
    explanation:
      '“Ngọt lịm, thơm phức” chỉ mùi vị của quả chín hoặc món ăn (Thế nào?), nên là Từ chỉ đặc điểm.',
  },
  {
    id: 'p-dd-6',
    format: 'phrase',
    emoji: '☁️',
    displayText: 'Trắng tinh, mềm mại',
    targetText: 'Trắng tinh, mềm mại',
    group: 'dac-diem',
    subCategory: 'Màu sắc & Tính chất',
    explanation:
      '“Trắng tinh, mềm mại” chỉ màu sắc và tính chất của sự vật, nên thuộc nhóm Từ chỉ đặc điểm.',
  },
  {
    id: 'p-dd-7',
    format: 'phrase',
    emoji: '🌾',
    displayText: 'Vàng óng ả',
    targetText: 'Vàng óng ả',
    group: 'dac-diem',
    subCategory: 'Màu sắc',
    explanation:
      '“Vàng óng ả” là từ chỉ màu sắc đẹp đẽ của nắng hoặc lúa chín, nên thuộc nhóm Từ chỉ đặc điểm.',
  },
  {
    id: 'p-dd-8',
    format: 'phrase',
    emoji: '🍃',
    displayText: 'Xanh mướt, mát rượi',
    targetText: 'Xanh mướt, mát rượi',
    group: 'dac-diem',
    subCategory: 'Màu sắc & Cảm giác',
    explanation:
      '“Xanh mướt, mát rượi” chỉ màu sắc của cây lá và cảm giác dễ chịu, nên là Từ chỉ đặc điểm.',
  },
  {
    id: 'p-dd-9',
    format: 'phrase',
    emoji: '🐇',
    displayText: 'Nhanh nhẹn, hoạt bát',
    targetText: 'Nhanh nhẹn, hoạt bát',
    group: 'dac-diem',
    subCategory: 'Tính chất / Tính cách',
    explanation:
      '“Nhanh nhẹn, hoạt bát” miêu tả tính cách, tác phong (Thế nào?), nên thuộc nhóm Từ chỉ đặc điểm.',
  },
  {
    id: 'p-dd-10',
    format: 'phrase',
    emoji: '💖',
    displayText: 'Hiền hậu, dịu dàng',
    targetText: 'Hiền hậu, dịu dàng',
    group: 'dac-diem',
    subCategory: 'Phẩm chất',
    explanation:
      '“Hiền hậu, dịu dàng” chỉ phẩm chất, tính nết của bà, của mẹ, của cô giáo, nên là Từ chỉ đặc điểm.',
  },
  {
    id: 'p-dd-11',
    format: 'phrase',
    emoji: '🐘',
    displayText: 'To lớn, khỏe mạnh',
    targetText: 'To lớn, khỏe mạnh',
    group: 'dac-diem',
    subCategory: 'Kích thước & Thể chất',
    explanation:
      '“To lớn, khỏe mạnh” miêu tả vóc dáng và sức khỏe (Thế nào?), nên thuộc nhóm Từ chỉ đặc điểm.',
  },
  {
    id: 'p-dd-12',
    format: 'phrase',
    emoji: '🐣',
    displayText: 'Nhỏ nhắn, xinh xắn',
    targetText: 'Nhỏ nhắn, xinh xắn',
    group: 'dac-diem',
    subCategory: 'Hình dáng',
    explanation:
      '“Nhỏ nhắn, xinh xắn” chỉ hình dáng đáng yêu của sự vật, nên thuộc nhóm Từ chỉ đặc điểm.',
  },
  {
    id: 'p-dd-13',
    format: 'phrase',
    emoji: '🦁',
    displayText: 'Dũng cảm, thật thà',
    targetText: 'Dũng cảm, thật thà',
    group: 'dac-diem',
    subCategory: 'Phẩm chất',
    explanation:
      '“Dũng cảm, thật thà” chỉ đức tính đáng quý của con người, nên thuộc nhóm Từ chỉ đặc điểm.',
  },
  {
    id: 'p-dd-14',
    format: 'phrase',
    emoji: '🌊',
    displayText: 'Trong vắt, phẳng lặng',
    targetText: 'Trong vắt, phẳng lặng',
    group: 'dac-diem',
    subCategory: 'Tính chất',
    explanation:
      '“Trong vắt, phẳng lặng” miêu tả đặc điểm của mặt hồ nước, nên thuộc nhóm Từ chỉ đặc điểm.',
  },
  {
    id: 'p-dd-15',
    format: 'phrase',
    emoji: '✨',
    displayText: 'Gọn gàng, ngăn nắp',
    targetText: 'Gọn gàng, ngăn nắp',
    group: 'dac-diem',
    subCategory: 'Tính chất / Thói quen',
    explanation:
      '“Gọn gàng, ngăn nắp” trả lời cho câu hỏi Thế nào?, nên thuộc nhóm Từ chỉ đặc điểm.',
  },

  // ================= DẠNG CỤM TỪ / TỪ NGỮ: HÀNH ĐỘNG (16 câu) =================
  {
    id: 'p-hd-1',
    format: 'phrase',
    emoji: '🧹',
    displayText: 'Quét nhà giúp mẹ',
    targetText: 'Quét nhà giúp mẹ',
    group: 'hanh-dong',
    subCategory: 'Việc làm ở nhà',
    explanation:
      '“Quét nhà giúp mẹ” chỉ việc làm, hoạt động của bé ở nhà (trả lời câu hỏi Làm gì?), nên là Từ chỉ hành động.',
  },
  {
    id: 'p-hd-2',
    format: 'phrase',
    emoji: '✍️',
    displayText: 'Viết bài vào vở',
    targetText: 'Viết bài vào vở',
    group: 'hanh-dong',
    subCategory: 'Hoạt động học tập',
    explanation:
      '“Viết bài vào vở” là hoạt động học tập của học sinh (Làm gì?), nên thuộc nhóm Từ chỉ hành động.',
  },
  {
    id: 'p-hd-3',
    format: 'phrase',
    emoji: '🏃‍♂️',
    displayText: 'Chạy tung tăng trên sân',
    targetText: 'Chạy tung tăng trên sân',
    group: 'hanh-dong',
    subCategory: 'Hoạt động vui chơi',
    explanation:
      '“Chạy tung tăng” chỉ hoạt động di chuyển, vui chơi của đôi chân, nên là Từ chỉ hành động.',
  },
  {
    id: 'p-hd-4',
    format: 'phrase',
    emoji: '🪴',
    displayText: 'Tưới nước cho cây hoa',
    targetText: 'Tưới nước cho cây hoa',
    group: 'hanh-dong',
    subCategory: 'Chăm sóc cây cối',
    explanation:
      '“Tưới nước cho cây hoa” chỉ việc làm chăm sóc cây (Làm gì?), nên thuộc nhóm Từ chỉ hành động.',
  },
  {
    id: 'p-hd-5',
    format: 'phrase',
    emoji: '🦅',
    displayText: 'Bay lượn trên bầu trời',
    targetText: 'Bay lượn trên bầu trời',
    group: 'hanh-dong',
    subCategory: 'Hoạt động của con vật',
    explanation:
      '“Bay lượn” là hoạt động của loài chim trên bầu trời (Làm gì?), nên là Từ chỉ hành động.',
  },
  {
    id: 'p-hd-6',
    format: 'phrase',
    emoji: '🍳',
    displayText: 'Nấu bữa cơm tối',
    targetText: 'Nấu bữa cơm tối',
    group: 'hanh-dong',
    subCategory: 'Việc làm gia đình',
    explanation:
      '“Nấu bữa cơm tối” chỉ hoạt động chế biến thức ăn, nên thuộc nhóm Từ chỉ hành động.',
  },
  {
    id: 'p-hd-7',
    format: 'phrase',
    emoji: '🎤',
    displayText: 'Ca hát líu lo',
    targetText: 'Ca hát líu lo',
    group: 'hanh-dong',
    subCategory: 'Hoạt động',
    explanation:
      '“Ca hát” chỉ hoạt động phát ra tiếng hát (Làm gì?), nên thuộc nhóm Từ chỉ hành động.',
  },
  {
    id: 'p-hd-8',
    format: 'phrase',
    emoji: '📚',
    displayText: 'Đọc truyện cổ tích',
    targetText: 'Đọc truyện cổ tích',
    group: 'hanh-dong',
    subCategory: 'Hoạt động học tập',
    explanation:
      '“Đọc truyện cổ tích” chỉ hoạt động đọc sách (Làm gì?), nên thuộc nhóm Từ chỉ hành động.',
  },
  {
    id: 'p-hd-9',
    format: 'phrase',
    emoji: '🤸',
    displayText: 'Nhảy dây cùng các bạn',
    targetText: 'Nhảy dây cùng các bạn',
    group: 'hanh-dong',
    subCategory: 'Vui chơi giờ ra chơi',
    explanation:
      '“Nhảy dây” chỉ hoạt động vui chơi rèn luyện sức khỏe, nên là Từ chỉ hành động.',
  },
  {
    id: 'p-hd-10',
    format: 'phrase',
    emoji: '👩‍🏫',
    displayText: 'Giảng bài trên lớp',
    targetText: 'Giảng bài trên lớp',
    group: 'hanh-dong',
    subCategory: 'Hoạt động dạy học',
    explanation:
      '“Giảng bài” chỉ hoạt động dạy học của thầy cô giáo (Làm gì?), nên là Từ chỉ hành động.',
  },
  {
    id: 'p-hd-11',
    format: 'phrase',
    emoji: '🦷',
    displayText: 'Đánh răng rửa mặt',
    targetText: 'Đánh răng rửa mặt',
    group: 'hanh-dong',
    subCategory: 'Sinh hoạt hằng ngày',
    explanation:
      '“Đánh răng rửa mặt” chỉ hoạt động vệ sinh cá nhân mỗi ngày, nên thuộc nhóm Từ chỉ hành động.',
  },
  {
    id: 'p-hd-12',
    format: 'phrase',
    emoji: '👕',
    displayText: 'Gấp quần áo gọn gàng',
    targetText: 'Gấp quần áo',
    group: 'hanh-dong',
    subCategory: 'Việc nhà',
    explanation:
      '“Gấp quần áo” chỉ hoạt động thu dọn đồ đạc của bé (Làm gì?), nên là Từ chỉ hành động.',
  },
  {
    id: 'p-hd-13',
    format: 'phrase',
    emoji: '🐟',
    displayText: 'Bơi lội dưới hồ nước',
    targetText: 'Bơi lội dưới hồ nước',
    group: 'hanh-dong',
    subCategory: 'Hoạt động dưới nước',
    explanation:
      '“Bơi lội” là hoạt động di chuyển dưới nước (Làm gì?), nên thuộc nhóm Từ chỉ hành động.',
  },
  {
    id: 'p-hd-14',
    format: 'phrase',
    emoji: '🎨',
    displayText: 'Vẽ bức tranh quê hương',
    targetText: 'Vẽ bức tranh quê hương',
    group: 'hanh-dong',
    subCategory: 'Hoạt động mỹ thuật',
    explanation:
      '“Vẽ bức tranh” chỉ hoạt động sáng tạo hội họa (Làm gì?), nên là Từ chỉ hành động.',
  },
  {
    id: 'p-hd-15',
    format: 'phrase',
    emoji: '🙋',
    displayText: 'Giơ tay phát biểu bài',
    targetText: 'Giơ tay phát biểu bài',
    group: 'hanh-dong',
    subCategory: 'Hoạt động trên lớp',
    explanation:
      '“Giơ tay phát biểu bài” chỉ hoạt động tích cực trong giờ học, nên thuộc nhóm Từ chỉ hành động.',
  },

  // ================= DẠNG CÂU VĂN (CÓ TỪ IN ĐẬM): SỰ VẬT (15 câu) =================
  {
    id: 's-sv-1',
    format: 'sentence',
    emoji: '🐦',
    displayText: 'Trên cành cây cao, [chú chim chích bông] đang nhảy nhót bắt sâu.',
    targetText: 'chú chim chích bông',
    group: 'su-vat',
    subCategory: 'Câu văn • Con vật',
    explanation:
      'Trong câu, “chú chim chích bông” là tên gọi con vật có ích (trả lời câu hỏi Con gì?), nên thuộc nhóm Từ chỉ sự vật.',
  },
  {
    id: 's-sv-2',
    format: 'sentence',
    emoji: '👩‍🏫',
    displayText: 'Mỗi buổi sáng đến lớp, [cô giáo] đều mỉm cười dịu dàng đón chúng em.',
    targetText: 'cô giáo',
    group: 'su-vat',
    subCategory: 'Câu văn • Con người',
    explanation:
      'Trong câu, “cô giáo” là từ chỉ người (trả lời câu hỏi Ai?), nên thuộc nhóm Từ chỉ sự vật.',
  },
  {
    id: 's-sv-3',
    format: 'sentence',
    emoji: '📏',
    displayText: 'Em cẩn thận xếp quyển vở và [chiếc thước kẻ] vào trong cặp sách.',
    targetText: 'chiếc thước kẻ',
    group: 'su-vat',
    subCategory: 'Câu văn • Đồ dùng học tập',
    explanation:
      '“Chiếc thước kẻ” là đồ dùng học tập của học sinh (trả lời câu hỏi Cái gì?), nên là Từ chỉ sự vật.',
  },
  {
    id: 's-sv-4',
    format: 'sentence',
    emoji: '🌳',
    displayText: 'Giữa sân trường em có [cây bàng cổ thụ] tỏa bóng mát rượi.',
    targetText: 'cây bàng cổ thụ',
    group: 'su-vat',
    subCategory: 'Câu văn • Cây cối',
    explanation:
      '“Cây bàng cổ thụ” chỉ cây cối trên sân trường, nên thuộc nhóm Từ chỉ sự vật.',
  },
  {
    id: 's-sv-5',
    format: 'sentence',
    emoji: '🐕',
    displayText: 'Mỗi khi em đi học về, [chú chó Cún Bông] lại chạy ra vẫy đuôi mừng rỡ.',
    targetText: 'chú chó Cún Bông',
    group: 'su-vat',
    subCategory: 'Câu văn • Con vật',
    explanation:
      '“Chú chó Cún Bông” chỉ con vật nuôi thân thiết trong nhà, nên là Từ chỉ sự vật.',
  },
  {
    id: 's-sv-6',
    format: 'sentence',
    emoji: '🌕',
    displayText: 'Đêm Trung thu, [vầng trăng rằm] tròn vành vạnh tỏa sáng khắp sân nhà.',
    targetText: 'vầng trăng rằm',
    group: 'su-vat',
    subCategory: 'Câu văn • Thiên nhiên',
    explanation:
      '“Vầng trăng rằm” là sự vật trong tự nhiên trên bầu trời đêm, nên thuộc nhóm Từ chỉ sự vật.',
  },
  {
    id: 's-sv-7',
    format: 'sentence',
    emoji: '👵',
    displayText: 'Tối nào [bà nội] cũng kể cho hai chị em nghe những câu chuyện cổ tích hay.',
    targetText: 'bà nội',
    group: 'su-vat',
    subCategory: 'Câu văn • Người thân',
    explanation:
      '“Bà nội” là từ chỉ người thân trong gia đình (Ai?), nên thuộc nhóm Từ chỉ sự vật.',
  },
  {
    id: 's-sv-8',
    format: 'sentence',
    emoji: '🪷',
    displayText: 'Trong đầm nước mùa hè, những [bông hoa sen] tỏa hương thơm ngát.',
    targetText: 'bông hoa sen',
    group: 'su-vat',
    subCategory: 'Câu văn • Cây hoa',
    explanation:
      '“Bông hoa sen” chỉ cây hoa (trả lời câu hỏi Cái gì?), nên là Từ chỉ sự vật.',
  },
  {
    id: 's-sv-9',
    format: 'sentence',
    emoji: '🥁',
    displayText: 'Tiếng [trống trường] vang lên tùng tùng báo hiệu giờ vào lớp.',
    targetText: 'trống trường',
    group: 'su-vat',
    subCategory: 'Câu văn • Đồ vật',
    explanation:
      '“Trống trường” là đồ vật quen thuộc ở trường học, nên thuộc nhóm Từ chỉ sự vật.',
  },
  {
    id: 's-sv-10',
    format: 'sentence',
    emoji: '🐝',
    displayText: 'Buổi sớm mai, [đàn ong mật] chăm chỉ bay đi tìm hoa gây mật.',
    targetText: 'đàn ong mật',
    group: 'su-vat',
    subCategory: 'Câu văn • Con vật',
    explanation:
      '“Đàn ong mật” là từ chỉ con vật (Con gì?), nên thuộc nhóm Từ chỉ sự vật.',
  },

  // ================= DẠNG CÂU VĂN (CÓ TỪ IN ĐẬM): ĐẶC ĐIỂM (15 câu) =================
  {
    id: 's-dd-1',
    format: 'sentence',
    emoji: '🌼',
    displayText: 'Những bông hoa cúc mùa thu nở [vàng tươi rực rỡ] dưới ánh nắng sớm.',
    targetText: 'vàng tươi rực rỡ',
    group: 'dac-diem',
    subCategory: 'Câu văn • Màu sắc',
    explanation:
      'Trong câu, “vàng tươi rực rỡ” miêu tả màu sắc đẹp của bông hoa cúc (Thế nào?), nên là Từ chỉ đặc điểm.',
  },
  {
    id: 's-dd-2',
    format: 'sentence',
    emoji: '👧',
    displayText: 'Bạn Lan là một học sinh rất [chăm chỉ và lễ phép] với thầy cô giáo.',
    targetText: 'chăm chỉ và lễ phép',
    group: 'dac-diem',
    subCategory: 'Câu văn • Tính nết',
    explanation:
      '“Chăm chỉ và lễ phép” chỉ tính nết, phẩm chất tốt đẹp của bạn Lan, nên thuộc nhóm Từ chỉ đặc điểm.',
  },
  {
    id: 's-dd-3',
    format: 'sentence',
    emoji: '🏞️',
    displayText: 'Dòng suối đầu nguồn có làn nước [trong vắt và mát lạnh].',
    targetText: 'trong vắt và mát lạnh',
    group: 'dac-diem',
    subCategory: 'Câu văn • Tính chất',
    explanation:
      '“Trong vắt và mát lạnh” miêu tả đặc điểm, tính chất của làn nước suối, nên là Từ chỉ đặc điểm.',
  },
  {
    id: 's-dd-4',
    format: 'sentence',
    emoji: '🐱',
    displayText: 'Chú mèo con nhà em có bộ lông [trắng muốt như bông].',
    targetText: 'trắng muốt như bông',
    group: 'dac-diem',
    subCategory: 'Câu văn • Màu sắc',
    explanation:
      '“Trắng muốt như bông” chỉ màu sắc của bộ lông chú mèo (Thế nào?), nên là Từ chỉ đặc điểm.',
  },
  {
    id: 's-dd-5',
    format: 'sentence',
    emoji: '📚',
    displayText: 'Góc học tập của bé Minh lúc nào cũng [gọn gàng, ngăn nắp].',
    targetText: 'gọn gàng, ngăn nắp',
    group: 'dac-diem',
    subCategory: 'Câu văn • Đặc điểm',
    explanation:
      '“Gọn gàng, ngăn nắp” miêu tả trạng thái, đặc điểm của góc học tập, nên thuộc nhóm Từ chỉ đặc điểm.',
  },
  {
    id: 's-dd-6',
    format: 'sentence',
    emoji: '🍎',
    displayText: 'Những quả táo chín trên cành trông [đỏ căng mọng] thật thích mắt.',
    targetText: 'đỏ căng mọng',
    group: 'dac-diem',
    subCategory: 'Câu văn • Màu sắc & Hình dáng',
    explanation:
      '“Đỏ căng mọng” chỉ màu sắc và vẻ ngoài của quả táo chín, nên là Từ chỉ đặc điểm.',
  },
  {
    id: 's-dd-7',
    format: 'sentence',
    emoji: '🛣️',
    displayText: 'Con đường dẫn vào làng em nay đã [rộng rãi và sạch đẹp] hơn xưa.',
    targetText: 'rộng rãi và sạch đẹp',
    group: 'dac-diem',
    subCategory: 'Câu văn • Hình dáng & Tính chất',
    explanation:
      '“Rộng rãi và sạch đẹp” trả lời câu hỏi Thế nào? cho con đường làng, nên là Từ chỉ đặc điểm.',
  },
  {
    id: 's-dd-8',
    format: 'sentence',
    emoji: '👵',
    displayText: 'Đôi bàn tay của mẹ [ấm áp và dịu dàng] biết bao.',
    targetText: 'ấm áp và dịu dàng',
    group: 'dac-diem',
    subCategory: 'Câu văn • Cảm giác & Phẩm chất',
    explanation:
      '“Ấm áp và dịu dàng” chỉ đặc điểm đáng quý của đôi bàn tay mẹ, nên thuộc nhóm Từ chỉ đặc điểm.',
  },
  {
    id: 's-dd-9',
    format: 'sentence',
    emoji: '🌲',
    displayText: 'Những hàng thông trên đồi mọc [thẳng tắp, xanh rờn].',
    targetText: 'thẳng tắp, xanh rờn',
    group: 'dac-diem',
    subCategory: 'Câu văn • Hình dáng & Màu sắc',
    explanation:
      '“Thẳng tắp, xanh rờn” chỉ hình dáng và màu sắc của hàng thông, nên là Từ chỉ đặc điểm.',
  },
  {
    id: 's-dd-10',
    format: 'sentence',
    emoji: '🐰',
    displayText: 'Đôi tai của chú thỏ con [dài và vểnh cao] để nghe ngóng xung quanh.',
    targetText: 'dài và vểnh cao',
    group: 'dac-diem',
    subCategory: 'Câu văn • Hình dáng',
    explanation:
      '“Dài và vểnh cao” miêu tả hình dáng đôi tai thỏ (Thế nào?), nên thuộc nhóm Từ chỉ đặc điểm.',
  },

  // ================= DẠNG CÂU VĂN (CÓ TỪ IN ĐẬM): HÀNH ĐỘNG (15 câu) =================
  {
    id: 's-hd-1',
    format: 'sentence',
    emoji: '🍲',
    displayText: 'Trong gian bếp nhỏ, mẹ em đang [nấu bữa cơm chiều] thơm phức.',
    targetText: 'nấu bữa cơm chiều',
    group: 'hanh-dong',
    subCategory: 'Câu văn • Việc làm',
    explanation:
      'Trong câu, “nấu bữa cơm chiều” chỉ việc làm của mẹ (trả lời câu hỏi Làm gì?), nên thuộc nhóm Từ chỉ hành động.',
  },
  {
    id: 's-hd-2',
    format: 'sentence',
    emoji: '⚽',
    displayText: 'Giờ ra chơi, các bạn học sinh [ùa ra sân trường chơi đá cầu].',
    targetText: 'ùa ra sân trường chơi đá cầu',
    group: 'hanh-dong',
    subCategory: 'Câu văn • Hoạt động vui chơi',
    explanation:
      '“Ùa ra sân trường chơi đá cầu” chỉ hoạt động vui chơi của các bạn học sinh (Làm gì?), nên là Từ chỉ hành động.',
  },
  {
    id: 's-hd-3',
    format: 'sentence',
    emoji: '📖',
    displayText: 'Buổi tối, hai anh em ngồi vào bàn [học bài và làm bài tập].',
    targetText: 'học bài và làm bài tập',
    group: 'hanh-dong',
    subCategory: 'Câu văn • Hoạt động học tập',
    explanation:
      '“Học bài và làm bài tập” là hoạt động học tập của hai anh em, nên thuộc nhóm Từ chỉ hành động.',
  },
  {
    id: 's-hd-4',
    format: 'sentence',
    emoji: '🌱',
    displayText: 'Chiều chủ nhật, bố và em cùng nhau [nhổ cỏ, bắt sâu cho vườn rau].',
    targetText: 'nhổ cỏ, bắt sâu cho vườn rau',
    group: 'hanh-dong',
    subCategory: 'Câu văn • Lao động',
    explanation:
      '“Nhổ cỏ, bắt sâu cho vườn rau” chỉ hoạt động chăm sóc cây cối (Làm gì?), nên là Từ chỉ hành động.',
  },
  {
    id: 's-hd-5',
    format: 'sentence',
    emoji: '🐦',
    displayText: 'Đàn chim én đang [chao liệng trên bầu trời] mùa xuân ấm áp.',
    targetText: 'chao liệng trên bầu trời',
    group: 'hanh-dong',
    subCategory: 'Câu văn • Hoạt động con vật',
    explanation:
      '“Chao liệng trên bầu trời” chỉ hoạt động bay của đàn chim én, nên thuộc nhóm Từ chỉ hành động.',
  },
  {
    id: 's-hd-6',
    format: 'sentence',
    emoji: '🧹',
    displayText: 'Sau bữa ăn tối, bé Hà tự giác [thu dọn bát đũa và lau bàn] giúp mẹ.',
    targetText: 'thu dọn bát đũa và lau bàn',
    group: 'hanh-dong',
    subCategory: 'Câu văn • Việc nhà',
    explanation:
      '“Thu dọn bát đũa và lau bàn” là việc làm ngoan ngoãn của bé Hà giúp mẹ, nên là Từ chỉ hành động.',
  },
  {
    id: 's-hd-7',
    format: 'sentence',
    emoji: '🐓',
    displayText: 'Mỗi sáng tinh mơ, chú gà trống lại [vươn cổ gáy vang] đánh thức mọi người.',
    targetText: 'vươn cổ gáy vang',
    group: 'hanh-dong',
    subCategory: 'Câu văn • Hoạt động con vật',
    explanation:
      '“Vươn cổ gáy vang” chỉ hoạt động của chú gà trống mỗi buổi sáng, nên là Từ chỉ hành động.',
  },
  {
    id: 's-hd-8',
    format: 'sentence',
    emoji: '🎨',
    displayText: 'Trong giờ Mỹ thuật, bạn Nam đang say sưa [tô màu bức tranh gia đình].',
    targetText: 'tô màu bức tranh gia đình',
    group: 'hanh-dong',
    subCategory: 'Câu văn • Hoạt động học tập',
    explanation:
      '“Tô màu bức tranh gia đình” chỉ hoạt động vẽ tranh của bạn Nam (Làm gì?), nên là Từ chỉ hành động.',
  },
  {
    id: 's-hd-9',
    format: 'sentence',
    emoji: '👵',
    displayText: 'Em lễ phép [khoanh tay chào ông bà] trước khi cắp sách tới trường.',
    targetText: 'khoanh tay chào ông bà',
    group: 'hanh-dong',
    subCategory: 'Câu văn • Cử chỉ / Hành động',
    explanation:
      '“Khoanh tay chào ông bà” chỉ cử chỉ, hành động lễ phép của bé, nên thuộc nhóm Từ chỉ hành động.',
  },
  {
    id: 's-hd-10',
    format: 'sentence',
    emoji: '🐟',
    displayText: 'Dưới làn nước trong xanh, đàn cá vàng đang [tung tăng bơi lội].',
    targetText: 'tung tăng bơi lội',
    group: 'hanh-dong',
    subCategory: 'Câu văn • Hoạt động con vật',
    explanation:
      '“Tung tăng bơi lội” chỉ hoạt động di chuyển dưới nước của đàn cá, nên là Từ chỉ hành động.',
  },
];

function shuffleItems<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Helper to render sentence with [highlighted] word/phrase styled clearly
 */
function renderHighlightedSentence(displayText: string) {
  const match = displayText.match(/^(.*?)\[(.*?)\](.*)$/);
  if (!match) {
    return <span>{displayText}</span>;
  }
  const [, before, highlighted, after] = match;
  return (
    <>
      <span>{before}</span>
      <span className="inline-block px-2.5 py-0.5 mx-1 rounded-xl bg-amber-200/90 text-rose-900 font-black underline decoration-rose-500 decoration-2 underline-offset-4 border border-amber-400 shadow-2xs">
        {highlighted}
      </span>
      <span>{after}</span>
    </>
  );
}

interface PhanLoaiTuSectionProps {
  onEarnStar: () => void;
  onSwitchToReadingWorksheets?: () => void;
}

export const PhanLoaiTuSection: React.FC<PhanLoaiTuSectionProps> = ({
  onEarnStar,
  onSwitchToReadingWorksheets,
}) => {
  const { closeKeypad } = useVirtualKeypad();

  const [practiceMode, setPracticeMode] = useState<PracticeMode>('single');
  const [formatFilter, setFormatFilter] = useState<QuestionFormatFilter>('all');
  const [showTips, setShowTips] = useState<boolean>(true);

  // Single interactive infinite practice state
  const [deck, setDeck] = useState<WordClassificationItem[]>(() =>
    shuffleItems(WORD_CLASSIFICATION_BANK)
  );
  const [deckIndex, setDeckIndex] = useState<number>(0);
  const [selectedGroup, setSelectedGroup] = useState<WordGroupType | null>(null);
  const [hasEarnedForCurrent, setHasEarnedForCurrent] = useState<boolean>(false);
  const [hadWrongAttemptOnCurrent, setHadWrongAttemptOnCurrent] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [totalCorrectSession, setTotalCorrectSession] = useState<number>(0);

  // 10-question worksheet mode state
  const [worksheetQuestions, setWorksheetQuestions] = useState<WordClassificationItem[]>(() =>
    shuffleItems(WORD_CLASSIFICATION_BANK).slice(0, 10)
  );
  const [worksheetAnswers, setWorksheetAnswers] = useState<Record<string, WordGroupType>>({});

  useEffect(() => {
    closeKeypad();
  }, [closeKeypad]);

  // Rebuild filtered deck when formatFilter changes
  const filteredPool = useMemo(() => {
    if (formatFilter === 'all') return WORD_CLASSIFICATION_BANK;
    return WORD_CLASSIFICATION_BANK.filter((item) => item.format === formatFilter);
  }, [formatFilter]);

  useEffect(() => {
    const fresh = shuffleItems(filteredPool);
    setDeck(fresh);
    setDeckIndex(0);
    setSelectedGroup(null);
    setHasEarnedForCurrent(false);
    setHadWrongAttemptOnCurrent(false);

    setWorksheetQuestions(fresh.slice(0, 10));
    setWorksheetAnswers({});
  }, [filteredPool]);

  const currentQuestion = deck[deckIndex] || filteredPool[0];

  const handleSelectGroupInSingleMode = (group: WordGroupType) => {
    if (!currentQuestion) return;
    // If already answered correctly, ignore extra clicks
    if (selectedGroup === currentQuestion.group) return;

    setSelectedGroup(group);

    if (group === currentQuestion.group) {
      sound.playClick();
      sound.playCorrect();
      const nextStreak = hadWrongAttemptOnCurrent ? 1 : streak + 1;
      setStreak(nextStreak);

      if (!hasEarnedForCurrent) {
        setHasEarnedForCurrent(true);
        setTotalCorrectSession((prev) => prev + 1);
        onEarnStar();
      }

      if (nextStreak > 0 && nextStreak % 5 === 0) {
        try {
          confetti({ particleCount: 70, spread: 65, origin: { y: 0.65 } });
        } catch {
          // ignore
        }
      }
    } else {
      sound.playClick();
      sound.playIncorrect();
      setHadWrongAttemptOnCurrent(true);
      setStreak(0);
    }
  };

  const handleNextSingleQuestion = () => {
    sound.playClick();
    if (deckIndex + 1 < deck.length) {
      setDeckIndex((prev) => prev + 1);
    } else {
      setDeck(shuffleItems(filteredPool));
      setDeckIndex(0);
    }
    setSelectedGroup(null);
    setHasEarnedForCurrent(false);
    setHadWrongAttemptOnCurrent(false);
  };

  const handleNewWorksheet10 = () => {
    sound.playClick();
    const fresh = shuffleItems(filteredPool).slice(0, 10);
    setWorksheetQuestions(fresh);
    setWorksheetAnswers({});
  };

  const handleSelectWorksheetAnswer = (item: WordClassificationItem, group: WordGroupType) => {
    if (worksheetAnswers[item.id] !== undefined) return;
    const next = { ...worksheetAnswers, [item.id]: group };
    setWorksheetAnswers(next);

    const isRight = group === item.group;
    if (isRight) {
      sound.playClick();
      sound.playCorrect();
      setTotalCorrectSession((prev) => prev + 1);
      onEarnStar();
    } else {
      sound.playClick();
      sound.playIncorrect();
    }

    const answeredCountAfter = worksheetQuestions.filter((q) => next[q.id] !== undefined).length;
    if (answeredCountAfter === worksheetQuestions.length) {
      const rightCount = worksheetQuestions.reduce(
        (sum, q) => sum + (next[q.id] === q.group ? 1 : 0),
        0
      );
      if (rightCount >= 8) {
        sound.playVictory();
        try {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
      }
    }
  };

  const wsAnsweredCount = worksheetQuestions.filter(
    (q) => worksheetAnswers[q.id] !== undefined
  ).length;
  const wsCorrectCount = worksheetQuestions.reduce(
    (sum, q) => sum + (worksheetAnswers[q.id] === q.group ? 1 : 0),
    0
  );
  const wsAllDone = wsAnsweredCount === worksheetQuestions.length;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Top Header Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-amber-200/90 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 via-amber-500 to-emerald-500 text-white flex items-center justify-center shadow-sm shrink-0">
              <Tags className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  Phân Biệt 3 Nhóm Từ: Sự Vật • Đặc Điểm • Hành Động
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Đúng 1 câu = +1 ★
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-0.5">
                Đọc câu văn hoặc cụm từ bên dưới rồi chọn xem từ ngữ đó thuộc nhóm{' '}
                <strong>Sự vật</strong>, <strong>Đặc điểm</strong> hay{' '}
                <strong>Hành động</strong> nhé!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onSwitchToReadingWorksheets && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSwitchToReadingWorksheets();
                }}
                className="min-h-[42px] px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 font-bold text-sm flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <BookOpenText className="w-4 h-4 text-rose-700" />
                <span>Sang 10 Đề Đọc Hiểu</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowTips((prev) => !prev);
              }}
              className={`min-h-[42px] px-3.5 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 cursor-pointer border transition-colors ${
                showTips
                  ? 'bg-amber-100 text-amber-950 border-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>{showTips ? 'Ẩn mẹo nhớ' : 'Mẹo nhớ 3 nhóm từ'}</span>
            </button>
          </div>
        </div>

        {/* Filter & Mode Bar */}
        <div className="pt-3 border-t border-amber-100 flex flex-wrap items-center justify-between gap-3">
          {/* Format Filter: All vs Phrase vs Sentence */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs sm:text-sm font-extrabold text-slate-700 mr-1">
              Dạng bài:
            </span>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setFormatFilter('all');
              }}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black cursor-pointer transition-all border ${
                formatFilter === 'all'
                  ? 'bg-rose-600 text-white border-rose-700 shadow-2xs'
                  : 'bg-slate-50 hover:bg-amber-50 text-slate-700 border-slate-200'
              }`}
            >
              🔀 Cả Câu & Cụm từ ({WORD_CLASSIFICATION_BANK.length} câu)
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setFormatFilter('phrase');
              }}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black cursor-pointer transition-all border ${
                formatFilter === 'phrase'
                  ? 'bg-sky-600 text-white border-sky-700 shadow-2xs'
                  : 'bg-slate-50 hover:bg-sky-50 text-slate-700 border-slate-200'
              }`}
            >
              💬 Cho 1 Cụm từ
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setFormatFilter('sentence');
              }}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black cursor-pointer transition-all border ${
                formatFilter === 'sentence'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                  : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-200'
              }`}
            >
              📝 Cho 1 Câu văn
            </button>
          </div>

          {/* Practice Mode Switcher: Single Interactive vs 10-Question Worksheet */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setPracticeMode('single');
              }}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                practiceMode === 'single'
                  ? 'bg-white text-amber-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Target className="w-4 h-4 text-rose-600" />
              <span>Luyện từng câu</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setPracticeMode('worksheet-10');
              }}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                practiceMode === 'worksheet-10'
                  ? 'bg-white text-amber-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListChecks className="w-4 h-4 text-emerald-600" />
              <span>Phiếu 10 câu</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-GROUP VISUAL MEMORY GUIDE FOR GRADE 2 */}
      {showTips && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['su-vat', 'dac-diem', 'hanh-dong'] as WordGroupType[]).map((gKey) => {
            const meta = WORD_GROUP_META[gKey];
            return (
              <div
                key={gKey}
                className={`p-4 rounded-2xl border-2 ${meta.cardBg} ${meta.cardBorder} space-y-1.5 shadow-2xs`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base sm:text-lg font-black flex items-center gap-2 text-slate-900">
                    <span className="text-2xl">{meta.emoji}</span>
                    <span>{meta.label}</span>
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${meta.badgeBg}`}
                  >
                    Nhóm {meta.shortLabel}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-extrabold text-slate-800">
                  💡 {meta.questionHint}
                </p>
                <p className="text-xs text-slate-600">
                  <strong>Ví dụ:</strong> {meta.examples}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== MODE 1: SINGLE QUESTION INTERACTIVE PRACTICE ==================== */}
      {practiceMode === 'single' && currentQuestion && (
        <div className="bg-white p-5 sm:p-7 rounded-3xl border-2 border-amber-200/90 shadow-xs space-y-6">
          {/* Status Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-100">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-black border ${
                  currentQuestion.format === 'sentence'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-sky-100 text-sky-900 border-sky-300'
                }`}
              >
                {currentQuestion.format === 'sentence'
                  ? '📝 Dạng Câu Văn (Phân loại từ in đậm)'
                  : '💬 Dạng Cụm Từ / Từ Ngữ'}
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs sm:text-sm font-bold">
                {currentQuestion.subCategory}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-orange-100 text-orange-900 border border-orange-300 text-xs sm:text-sm font-black flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-600" />
                Chuỗi đúng: {streak}
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs sm:text-sm font-black flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Đã nhận: +{totalCorrectSession} ★
              </span>
            </div>
          </div>

          {/* Prompt & Target Box */}
          <div className="text-center space-y-4 py-2">
            <p className="text-sm sm:text-base font-extrabold text-slate-600">
              {currentQuestion.format === 'sentence' ? (
                <>
                  Trong câu văn dưới đây, từ/cụm từ{' '}
                  <strong className="text-rose-700 underline decoration-2">
                    “{currentQuestion.targetText}”
                  </strong>{' '}
                  thuộc nhóm từ nào?
                </>
              ) : (
                <>
                  Cụm từ / từ ngữ dưới đây thuộc nhóm <strong>Sự vật</strong>,{' '}
                  <strong>Đặc điểm</strong> hay <strong>Hành động</strong>?
                </>
              )}
            </p>

            <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-amber-50/90 to-orange-50/50 border-2 border-amber-300 shadow-xs space-y-3">
              <div className="text-4xl sm:text-5xl select-none">
                {currentQuestion.emoji}
              </div>
              {currentQuestion.format === 'sentence' ? (
                <div className="text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed">
                  {renderHighlightedSentence(currentQuestion.displayText)}
                </div>
              ) : (
                <div className="text-2xl sm:text-3xl font-black text-rose-950 tracking-tight">
                  “{currentQuestion.displayText}”
                </div>
              )}
              {currentQuestion.format === 'sentence' && (
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-amber-300 text-xs sm:text-sm font-extrabold text-slate-800">
                    🔍 Từ cần phân loại:{' '}
                    <strong className="text-rose-700 font-black">
                      {currentQuestion.targetText}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 3 BIG GROUP SELECTION BUTTONS */}
          <div className="space-y-2">
            <div className="text-center text-xs sm:text-sm font-bold text-slate-500">
              👇 Bé hãy chạm vào 1 trong 3 nhóm từ dưới đây:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {(['su-vat', 'dac-diem', 'hanh-dong'] as WordGroupType[]).map((gKey) => {
                const meta = WORD_GROUP_META[gKey];
                const isSolved = selectedGroup === currentQuestion.group;
                const isPicked = selectedGroup === gKey;
                const isCorrectGroup = gKey === currentQuestion.group;

                let btnStyle = `${meta.cardBg} ${meta.cardBorder} ${meta.textColor}`;
                if (isPicked) {
                  if (isCorrectGroup) {
                    btnStyle =
                      'bg-emerald-100 border-emerald-500 text-emerald-950 ring-4 ring-emerald-300 shadow-md scale-[1.01]';
                  } else {
                    btnStyle =
                      'bg-rose-100 border-rose-500 text-rose-950 ring-2 ring-rose-300';
                  }
                } else if (isSolved) {
                  btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-65';
                }

                return (
                  <button
                    key={gKey}
                    type="button"
                    disabled={isSolved}
                    onClick={() => handleSelectGroupInSingleMode(gKey)}
                    className={`min-h-[96px] p-4 sm:p-5 rounded-3xl border-2 text-left flex flex-col justify-between gap-2 transition-all cursor-pointer select-none ${btnStyle}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-3xl">{meta.emoji}</span>
                      {isPicked && isCorrectGroup && (
                        <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                      )}
                      {isPicked && !isCorrectGroup && (
                        <XCircle className="w-7 h-7 text-rose-600 shrink-0" />
                      )}
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl font-black">{meta.label}</div>
                      <div className="text-xs font-bold opacity-80 mt-0.5">
                        {meta.questionHint}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback & Explanation Box */}
          {selectedGroup !== null && (
            <div
              className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pop ${
                selectedGroup === currentQuestion.group
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-start gap-3">
                {selectedGroup === currentQuestion.group ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-black text-base sm:text-lg">
                    {selectedGroup === currentQuestion.group
                      ? '🎉 Chính xác tuyệt vời! Bé được cộng +1 ★'
                      : `Chưa đúng rồi! “${currentQuestion.targetText}” không phải là ${WORD_GROUP_META[selectedGroup].label}. Bé thử chọn lại nhé!`}
                  </div>
                  <p className="text-sm sm:text-base text-slate-800 font-medium">
                    {selectedGroup === currentQuestion.group ? (
                      <>
                        💡 <strong>Giải thích:</strong> {currentQuestion.explanation}
                      </>
                    ) : (
                      <>
                        💡 <strong>Gợi ý cho bé:</strong> Hãy thử đặt câu hỏi xem từ{' '}
                        <strong>“{currentQuestion.targetText}”</strong> trả lời cho câu hỏi{' '}
                        <em>Ai? Cái gì? Con gì?</em> (Sự vật), <em>Thế nào?</em> (Đặc điểm) hay{' '}
                        <em>Làm gì?</em> (Hành động) nhé!
                      </>
                    )}
                  </p>
                </div>
              </div>

              {selectedGroup === currentQuestion.group && (
                <button
                  type="button"
                  onClick={handleNextSingleQuestion}
                  className="min-h-[48px] px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-base shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-transform"
                >
                  <span>Câu tiếp theo</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Bottom Skip / Shuffle Button */}
          <div className="flex items-center justify-between pt-2 border-t border-amber-100">
            <span className="text-xs sm:text-sm font-semibold text-slate-500">
              Kho bài tập: {filteredPool.length} câu (Tự động trộn ngẫu nhiên)
            </span>
            <button
              type="button"
              onClick={handleNextSingleQuestion}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 font-bold text-sm flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Shuffle className="w-4 h-4" />
              <span>Đổi câu khác</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================== MODE 2: 10-QUESTION WORKSHEET VIEW ==================== */}
      {practiceMode === 'worksheet-10' && (
        <div className="space-y-4">
          {/* Progress Bar for 10-question worksheet */}
          <div className="bg-white px-4 py-3.5 rounded-2xl border border-amber-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-rose-100 border border-rose-300 text-rose-950 font-black text-sm">
                Phiếu 10 Câu Phân Loại Từ
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 font-black text-sm">
                Đã làm: {wsAnsweredCount}/{worksheetQuestions.length} câu
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 font-black text-sm flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Đúng: {wsCorrectCount}/{worksheetQuestions.length} (+{wsCorrectCount} ★)
              </span>
            </div>

            <button
              type="button"
              onClick={handleNewWorksheet10}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tạo phiếu 10 câu mới</span>
            </button>
          </div>

          {/* List of 10 Questions */}
          <div className="space-y-4">
            {worksheetQuestions.map((item, idx) => {
              const picked = worksheetAnswers[item.id];
              const isAnswered = picked !== undefined;
              const isCorrect = isAnswered && picked === item.group;

              return (
                <div
                  key={item.id}
                  className={`bg-white p-4 sm:p-6 rounded-3xl border-2 transition-all shadow-xs space-y-4 ${
                    !isAnswered
                      ? 'border-amber-200/90'
                      : isCorrect
                        ? 'border-emerald-400 bg-emerald-50/15'
                        : 'border-rose-300 bg-rose-50/15'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-amber-100 text-amber-950 border border-amber-300">
                        Câu {idx + 1}/10
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {item.format === 'sentence'
                          ? '📝 Từ in đậm trong câu'
                          : '💬 Cụm từ / Từ ngữ'}
                      </span>
                    </div>

                    {isAnswered && (
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {isCorrect
                          ? '✓ Đúng (+1 ★)'
                          : `✕ Đáp án: ${WORD_GROUP_META[item.group].label}`}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 flex items-start sm:items-center gap-3">
                    <span className="text-3xl shrink-0">{item.emoji}</span>
                    <div className="space-y-1">
                      {item.format === 'sentence' ? (
                        <>
                          <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                            {renderHighlightedSentence(item.displayText)}
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-slate-600">
                            ➔ Từ/cụm từ <strong>“{item.targetText}”</strong> thuộc nhóm nào?
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-lg sm:text-xl font-black text-rose-950">
                            “{item.displayText}”
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-slate-600">
                            ➔ Cụm từ trên thuộc nhóm từ nào?
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 3 Group Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {(['su-vat', 'dac-diem', 'hanh-dong'] as WordGroupType[]).map((gKey) => {
                      const meta = WORD_GROUP_META[gKey];
                      const isThisPicked = picked === gKey;
                      const isThisRight = item.group === gKey;

                      let btnClass = `${meta.cardBg} ${meta.cardBorder} ${meta.textColor}`;
                      if (isAnswered) {
                        if (isThisRight) {
                          btnClass =
                            'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400';
                        } else if (isThisPicked) {
                          btnClass = 'bg-rose-50 border-rose-400 text-rose-950';
                        } else {
                          btnClass =
                            'bg-slate-50 border-slate-200 text-slate-400 opacity-65';
                        }
                      }

                      return (
                        <button
                          key={gKey}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => handleSelectWorksheetAnswer(item, gKey)}
                          className={`min-h-[54px] px-4 py-3 rounded-2xl border-2 font-black text-sm sm:text-base flex items-center justify-between gap-2 transition-all cursor-pointer ${btnClass}`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-xl">{meta.emoji}</span>
                            <span>{meta.label}</span>
                          </span>
                          {isAnswered && isThisRight && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          )}
                          {isAnswered && isThisPicked && !isThisRight && (
                            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {isAnswered && (
                    <div
                      className={`p-3.5 rounded-2xl border text-sm flex items-start gap-2.5 animate-pop ${
                        isCorrect
                          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                          : 'bg-rose-50/90 border-rose-300 text-rose-950'
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-black">
                          {isCorrect
                            ? 'Chính xác! +1 ★ — '
                            : `Đáp án đúng là ${WORD_GROUP_META[item.group].label}. — `}
                        </span>
                        <span className="text-slate-700 font-medium">
                          {item.explanation}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Completion Banner for 10-question worksheet */}
          {wsAllDone && (
            <div className="bg-gradient-to-r from-amber-100 via-yellow-50 to-emerald-100 p-6 rounded-3xl border-2 border-amber-400 shadow-md text-center space-y-4 animate-pop">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white border-2 border-amber-300 flex items-center justify-center text-3xl shadow-xs">
                {wsCorrectCount >= 8 ? '🏆' : wsCorrectCount >= 5 ? '🌟' : '💪'}
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900">
                  Hoàn thành Phiếu Phân Loại Từ: {wsCorrectCount}/10 câu đúng!
                </h3>
                <p className="text-base font-bold text-emerald-800">
                  Bé đã nhận được +{wsCorrectCount} ★ từ phiếu bài tập này!
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleNewWorksheet10}
                  className="min-h-[48px] px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-2xl shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Trophy className="w-5 h-5 text-amber-300" />
                  <span>Làm tiếp Phiếu 10 câu mới</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
