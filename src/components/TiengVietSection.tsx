import React, { useState, useEffect } from 'react';
import {
  BookOpenText,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Trophy,
  Eye,
  EyeOff,
  AlertCircle,
  FileText,
  ListChecks,
  BookMarked,
  Shuffle,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { useVirtualKeypad } from '../context/VirtualKeypadContext';

interface TiengVietSectionProps {
  onEarnStar: () => void;
}

export interface TiengVietOption {
  label: 'A' | 'B' | 'C';
  text: string;
}

export interface TiengVietQuestion {
  id: string;
  number: number;
  categoryBadge: string;
  prompt: string;
  quoteText?: string;
  options: TiengVietOption[];
  correctLabel: 'A' | 'B' | 'C';
  explanation: string;
}

export interface TiengVietNote {
  term: string;
  definition: string;
}

export interface TiengVietWorksheet {
  id: string;
  shortTitle: string;
  badgeLabel: string;
  readingTitle: string;
  author: string;
  paragraphs: string[];
  notes: TiengVietNote[];
  questions: TiengVietQuestion[];
}

export const TIENG_VIET_WORKSHEETS: TiengVietWorksheet[] = [
  // ================= ĐỀ 1 (ĐỀ GỐC PDF) =================
  {
    id: 'nhung-ngay-giap-tet',
    shortTitle: 'Đề 1: Những Ngày Giáp Tết',
    badgeLabel: 'Đề Ôn Tập Số 1 (Đề gốc theo phiếu PDF)',
    readingTitle: 'NHỮNG NGÀY GIÁP TẾT',
    author: 'Theo Tô Hoài',
    paragraphs: [
      'Trời ấm lại pha lành lạnh. Tết sắp đến. Hôm qua, còn gió nồm hây hây. Chiếc lá ổi cong lên, đốm đỏ gắt, rơi thoáng xuống mặt ao. Ai cũng lo trời nồm, bánh chưng chóng thiu, hoa cắm lọ cũng chóng tàn.',
      'Sớm nay, gió thổi se se lạnh. Những màng sương lạnh rung trong luống thìa là. Những bông hoa cải nở hoa vàng hơn hớn lên. Trời ren rét thế, lại càng ra vẻ Tết...',
      '... Bé chạy đến bên nồi bánh chưng đang sôi trên bếp lửa. Mấy anh xúm lại, ngồi quanh, đem cỗ tam cúc ra đánh chơi. Tối hôm nay, anh em sẽ ngủ quanh bên nồi bánh, nằm nghiêng, trông than hồng nổ pháo lép bép trước mặt.',
    ],
    notes: [
      {
        term: 'Trời nồm',
        definition:
          'là hiện tượng hơi nước trong không khí ngưng kết lại thành các hạt nước nhỏ, đọng lại trên các đồ vật. Đây là kiểu thời tiết đặc trưng ở các tỉnh miền Bắc nước ta.',
      },
      {
        term: 'Tam cúc',
        definition:
          'là trò chơi bài lá dân gian phổ biến ở miền Bắc. Đây là trò chơi thường được chơi vào những ngày Tết.',
      },
    ],
    questions: [
      {
        id: 'tv1-q1',
        number: 1,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '1. Chiếc lá ổi trong đoạn văn trông như thế nào?',
        options: [
          { label: 'A', text: 'Chiếc lá ổi héo rũ.' },
          {
            label: 'B',
            text: 'Chiếc lá ổi cong lên, đốm đỏ gắt, rơi thoáng xuống mặt ao.',
          },
          { label: 'C', text: 'Chiếc lá ổi hây hây.' },
        ],
        correctLabel: 'B',
        explanation:
          'Trong đoạn 1 của bài đọc có câu: “Chiếc lá ổi cong lên, đốm đỏ gắt, rơi thoáng xuống mặt ao.”',
      },
      {
        id: 'tv1-q2',
        number: 2,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '2. Những bông hoa cải có màu gì?',
        options: [
          { label: 'A', text: 'màu trắng' },
          { label: 'B', text: 'màu xanh' },
          { label: 'C', text: 'màu vàng' },
        ],
        correctLabel: 'C',
        explanation:
          'Trong đoạn 2 có viết: “Những bông hoa cải nở hoa vàng hơn hớn lên.” Vậy hoa cải có màu vàng.',
      },
      {
        id: 'tv1-q3',
        number: 3,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '3. Tối hôm nay anh em sẽ ngủ ở đâu?',
        options: [
          { label: 'A', text: 'Anh em sẽ ngủ quanh nồi bánh.' },
          { label: 'B', text: 'Anh em sẽ ngủ ở nhà.' },
          { label: 'C', text: 'Anh em sẽ không ngủ.' },
        ],
        correctLabel: 'A',
        explanation:
          'Ở đoạn 3 có câu: “Tối hôm nay, anh em sẽ ngủ quanh bên nồi bánh, nằm nghiêng, trông than hồng nổ pháo lép bép trước mặt.”',
      },
      {
        id: 'tv1-q4',
        number: 4,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt:
          '4. Qua bài đọc, theo em, thời tiết vào những ngày giáp tết ở miền Bắc thế nào?',
        options: [
          { label: 'A', text: 'ấm áp' },
          { label: 'B', text: 'rét lạnh' },
          { label: 'C', text: 'oi bức' },
        ],
        correctLabel: 'B',
        explanation:
          'Bài đọc miêu tả: “Sớm nay, gió thổi se se lạnh. Những màng sương lạnh rung trong luống thìa là... Trời ren rét thế, lại càng ra vẻ Tết...”. Vì vậy thời tiết giáp Tết ở miền Bắc rét lạnh.',
      },
      {
        id: 'tv1-q5',
        number: 5,
        categoryBadge: 'Từ chỉ hoạt động',
        prompt: '5. Tìm từ chỉ hoạt động trong câu sau:',
        quoteText:
          'Tối hôm nay, anh em sẽ ngủ quanh bên nồi bánh, nằm nghiêng, trông than hồng nổ pháo lép bép trước mặt.',
        options: [
          { label: 'A', text: 'anh, em, nồi bánh' },
          { label: 'B', text: 'ngủ, nằm, trông' },
          { label: 'C', text: 'than hồng, pháo, lép bép' },
        ],
        correctLabel: 'B',
        explanation:
          'Các từ “ngủ, nằm, trông” là các từ chỉ hoạt động của anh em khi thức canh nồi bánh chưng.',
      },
      {
        id: 'tv1-q6',
        number: 6,
        categoryBadge: 'Từ chỉ đặc điểm',
        prompt: 'Câu 6: Tìm từ chỉ đặc điểm trong câu: “Bố em tính tình vui vẻ”:',
        options: [
          { label: 'A', text: 'Bố em' },
          { label: 'B', text: 'tính tình' },
          { label: 'C', text: 'vui vẻ' },
        ],
        correctLabel: 'C',
        explanation:
          '“vui vẻ” là từ chỉ đặc điểm về tính tình của bố (Bố em là từ chỉ người, tính tình là từ chỉ sự vật/khái niệm).',
      },
      {
        id: 'tv1-q7',
        number: 7,
        categoryBadge: 'Từ chỉ sự vật',
        prompt: 'Câu 7: Tìm từ chỉ sự vật:',
        options: [
          { label: 'A', text: 'cắt tóc' },
          { label: 'B', text: 'thúng câu.' },
          { label: 'C', text: 'gáy vang nhà.' },
        ],
        correctLabel: 'B',
        explanation:
          '“thúng câu” là từ chỉ sự vật (đồ vật dùng khi đi câu). Còn “cắt tóc” và “gáy vang nhà” là từ ngữ chỉ hoạt động.',
      },
      {
        id: 'tv1-q8',
        number: 8,
        categoryBadge: 'Dấu câu',
        prompt: 'Câu 8: Chọn dấu câu thích hợp điền vào chỗ chấm trong câu sau:',
        quoteText: '“Ông ơi, ông đang tìm gì thế ạ …..”',
        options: [
          { label: 'A', text: 'Dấu chấm than (!)' },
          { label: 'B', text: 'Dấu chấm (.)' },
          { label: 'C', text: 'Dấu chấm hỏi (?)' },
        ],
        correctLabel: 'C',
        explanation:
          'Câu “Ông ơi, ông đang tìm gì thế ạ?” là câu hỏi nên cuối câu phải đặt dấu chấm hỏi (?).',
      },
      {
        id: 'tv1-q9',
        number: 9,
        categoryBadge: 'Mẫu câu Ai là gì?',
        prompt: 'Câu 9: Câu nào dưới đây là Mẫu câu Ai là gì ? (Câu giới thiệu)',
        options: [
          { label: 'A', text: 'Mẹ em là giáo viên.' },
          { label: 'B', text: 'Hoa hồng có màu đỏ thẳm.' },
          { label: 'C', text: 'Các bạn đọc sách ở thư viện.' },
        ],
        correctLabel: 'A',
        explanation:
          '“Mẹ em là giáo viên.” có từ “là” dùng để giới thiệu nghề nghiệp của mẹ, thuộc mẫu câu Ai là gì? (Câu B là mẫu câu Ai thế nào?, câu C là mẫu câu Ai làm gì?).',
      },
      {
        id: 'tv1-q10',
        number: 10,
        categoryBadge: 'Mẫu câu Ai làm gì?',
        prompt: 'Câu 10: Câu nào dưới đây là Mẫu câu Ai làm gì ? (Câu nêu hoạt động)',
        options: [
          { label: 'A', text: 'Cô giáo mỉm cười với em.' },
          { label: 'B', text: 'Cô Thủy Anh là giáo viên chủ nhiệm lớp em.' },
          { label: 'C', text: 'Cô giáo yêu thương chúng em.' },
        ],
        correctLabel: 'A',
        explanation:
          '“Cô giáo mỉm cười với em.” nêu hoạt động cụ thể (“mỉm cười với em”) của cô giáo nên thuộc mẫu câu Ai làm gì?.',
      },
    ],
  },

  // ================= ĐỀ 2 =================
  {
    id: 'cay-xoai-cua-ong',
    shortTitle: 'Đề 2: Cây Xoài Của Ông Em',
    badgeLabel: 'Đề Ôn Tập Số 2 (Đọc hiểu & Luyện từ câu)',
    readingTitle: 'CÂY XOÀI CỦA ÔNG EM',
    author: 'Theo Đoàn Giỏi',
    paragraphs: [
      'Ông em trồng cây xoài cát này trước sân khi em còn đi lẫm chẫm. Cuối đông, hoa nở trắng cành. Đầu hè, quả sai lúc lỉu.',
      'Trông từng chùm quả to, đung đưa theo gió, em càng nhớ ông. Mùa xoài nào, mẹ em cũng chọn những quả chín vàng và to nhất bày lên bàn thờ ông.',
      'Xoài thanh ca, xoài tượng... đều ngon. Nhưng em thích xoài cát nhất. Mùi xoài thơm dịu dàng, vị ngọt đậm đà, màu sắc đẹp đẽ.',
    ],
    notes: [
      {
        term: 'Lẫm chẫm',
        definition: 'dáng đi của em bé mới tập đi, bước còn chưa vững.',
      },
      {
        term: 'Lúc lỉu',
        definition: 'quả mọc rất nhiều, kết thành từng chùm nặng trĩu trên cành.',
      },
    ],
    questions: [
      {
        id: 'tv2-q1',
        number: 1,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '1. Ông trồng cây xoài cát trước sân từ khi nào?',
        options: [
          { label: 'A', text: 'Khi em bắt đầu vào học lớp 2.' },
          { label: 'B', text: 'Khi em còn đi lẫm chẫm.' },
          { label: 'C', text: 'Khi em đã lớn khôn.' },
        ],
        correctLabel: 'B',
        explanation:
          'Câu đầu bài đọc viết: “Ông em trồng cây xoài cát này trước sân khi em còn đi lẫm chẫm.”',
      },
      {
        id: 'tv2-q2',
        number: 2,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '2. Hoa xoài nở trắng cành vào lúc nào?',
        options: [
          { label: 'A', text: 'Cuối đông' },
          { label: 'B', text: 'Giữa thu' },
          { label: 'C', text: 'Đầu xuân' },
        ],
        correctLabel: 'A',
        explanation:
          'Trong đoạn 1 có viết: “Cuối đông, hoa nở trắng cành. Đầu hè, quả sai lúc lỉu.”',
      },
      {
        id: 'tv2-q3',
        number: 3,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt:
          '3. Mùa xoài nào, mẹ cũng chọn những quả xoài như thế nào bày lên bàn thờ ông?',
        options: [
          { label: 'A', text: 'Những quả xoài còn xanh non.' },
          { label: 'B', text: 'Những quả chín vàng và to nhất.' },
          { label: 'C', text: 'Những quả nhỏ nhất trên cành.' },
        ],
        correctLabel: 'B',
        explanation:
          'Đoạn 2 viết: “Mùa xoài nào, mẹ em cũng chọn những quả chín vàng và to nhất bày lên bàn thờ ông.”',
      },
      {
        id: 'tv2-q4',
        number: 4,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '4. Qua bài đọc, theo em, tình cảm của hai mẹ con đối với ông như thế nào?',
        options: [
          { label: 'A', text: 'Luôn nhớ thương và kính trọng ông.' },
          { label: 'B', text: 'Chỉ thích ăn xoài chứ không nhớ ông.' },
          { label: 'C', text: 'Đã quên kỷ niệm về ông.' },
        ],
        correctLabel: 'A',
        explanation:
          'Qua việc nhìn chùm quả nhớ ông và chọn những quả chín vàng to nhất bày lên bàn thờ ông, ta thấy hai mẹ con rất nhớ thương, hiếu thảo và kính trọng ông.',
      },
      {
        id: 'tv2-q5',
        number: 5,
        categoryBadge: 'Từ chỉ hoạt động',
        prompt: '5. Tìm từ chỉ hoạt động trong câu sau:',
        quoteText:
          'Mùa xoài nào, mẹ em cũng chọn những quả chín vàng bày lên bàn thờ ông.',
        options: [
          { label: 'A', text: 'mẹ em, quả xoài, bàn thờ' },
          { label: 'B', text: 'chọn, bày' },
          { label: 'C', text: 'chín vàng' },
        ],
        correctLabel: 'B',
        explanation: '“chọn” và “bày” là hai từ chỉ hoạt động của mẹ.',
      },
      {
        id: 'tv2-q6',
        number: 6,
        categoryBadge: 'Từ chỉ đặc điểm',
        prompt: 'Câu 6: Tìm từ chỉ đặc điểm trong câu: “Mùi xoài thơm dịu dàng”:',
        options: [
          { label: 'A', text: 'Mùi xoài' },
          { label: 'B', text: 'cây xoài' },
          { label: 'C', text: 'thơm dịu dàng' },
        ],
        correctLabel: 'C',
        explanation:
          '“thơm dịu dàng” là từ ngữ chỉ đặc điểm hương thơm của quả xoài chín.',
      },
      {
        id: 'tv2-q7',
        number: 7,
        categoryBadge: 'Từ chỉ sự vật',
        prompt: 'Câu 7: Tìm từ chỉ sự vật:',
        options: [
          { label: 'A', text: 'bàn thờ.' },
          { label: 'B', text: 'đung đưa.' },
          { label: 'C', text: 'ngọt đậm đà.' },
        ],
        correctLabel: 'A',
        explanation:
          '“bàn thờ” là từ chỉ sự vật (đồ vật). Còn “đung đưa” là từ chỉ hoạt động, “ngọt đậm đà” là từ chỉ đặc điểm.',
      },
      {
        id: 'tv2-q8',
        number: 8,
        categoryBadge: 'Dấu câu',
        prompt: 'Câu 8: Chọn dấu câu thích hợp điền vào chỗ chấm trong câu sau:',
        quoteText: '“Bạn thích ăn loại quả nào nhất …..”',
        options: [
          { label: 'A', text: 'Dấu chấm (.)' },
          { label: 'B', text: 'Dấu chấm hỏi (?)' },
          { label: 'C', text: 'Dấu chấm than (!)' },
        ],
        correctLabel: 'B',
        explanation:
          'Đây là câu dùng để hỏi bạn nên cuối câu cần điền Dấu chấm hỏi (?).',
      },
      {
        id: 'tv2-q9',
        number: 9,
        categoryBadge: 'Mẫu câu Ai là gì?',
        prompt: 'Câu 9: Câu nào dưới đây là Mẫu câu Ai là gì ? (Câu giới thiệu)',
        options: [
          { label: 'A', text: 'Xoài cát là loại quả em thích nhất.' },
          { label: 'B', text: 'Những chùm xoài đung đưa theo gió.' },
          { label: 'C', text: 'Quả xoài chín vàng ươm.' },
        ],
        correctLabel: 'A',
        explanation:
          'Câu “Xoài cát là loại quả em thích nhất.” có từ “là” dùng để giới thiệu, thuộc mẫu câu Ai là gì?.',
      },
      {
        id: 'tv2-q10',
        number: 10,
        categoryBadge: 'Mẫu câu Ai làm gì?',
        prompt: 'Câu 10: Câu nào dưới đây là Mẫu câu Ai làm gì ? (Câu nêu hoạt động)',
        options: [
          { label: 'A', text: 'Ông em trồng cây xoài cát trước sân.' },
          { label: 'B', text: 'Cây xoài là kỷ niệm của ông.' },
          { label: 'C', text: 'Bông hoa xoài trắng muốt.' },
        ],
        correctLabel: 'A',
        explanation:
          '“Ông em trồng cây xoài cát trước sân.” nêu hoạt động “trồng cây xoài cát trước sân” của ông em nên thuộc mẫu câu Ai làm gì?.',
      },
    ],
  },

  // ================= ĐỀ 3 =================
  {
    id: 'canh-dong-que-em',
    shortTitle: 'Đề 3: Cánh Đồng Quê Em',
    badgeLabel: 'Đề Ôn Tập Số 3 (Đọc hiểu & Luyện từ câu)',
    readingTitle: 'CÁNH ĐỒNG QUÊ EM',
    author: 'Theo Bùi Hồng',
    paragraphs: [
      'Buổi sáng mùa thu, em theo mẹ ra thăm cánh đồng làng. Mặt trời mới nhô lên đỏ ối ở phía chân trời. Những giọt sương đêm còn đọng trên lá lúa long lanh như những hạt ngọc nhỏ.',
      'Cánh đồng lúa chín trải rộng mênh mông như một tấm thảm vàng rực rỡ. Gió thu thổi nhẹ làm sóng lúa nhấp nhô nối đuôi nhau chạy mãi vào bờ.',
      'Trên đồng, các bác nông dân đang vui vẻ gặt lúa. Tiếng cười nói rộn ràng cả một góc quê. Em rất yêu cánh đồng quê hương mình.',
    ],
    notes: [
      {
        term: 'Mênh mông',
        definition: 'rộng lớn đến mức nhìn không thấy bờ bến.',
      },
      {
        term: 'Nhấp nhô',
        definition: 'nhô cao lên rồi hạ thấp xuống liên tiếp theo làn gió.',
      },
    ],
    questions: [
      {
        id: 'tv3-q1',
        number: 1,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '1. Những giọt sương đêm đọng trên lá lúa trông như thế nào?',
        options: [
          { label: 'A', text: 'Trắng xóa như bông tuyết.' },
          { label: 'B', text: 'Long lanh như những hạt ngọc nhỏ.' },
          { label: 'C', text: 'Đỏ ối như mặt trời.' },
        ],
        correctLabel: 'B',
        explanation:
          'Trong đoạn 1 có viết: “Những giọt sương đêm còn đọng trên lá lúa long lanh như những hạt ngọc nhỏ.”',
      },
      {
        id: 'tv3-q2',
        number: 2,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '2. Cánh đồng lúa chín được so sánh với hình ảnh gì?',
        options: [
          { label: 'A', text: 'Một tấm thảm vàng rực rỡ.' },
          { label: 'B', text: 'Một dòng sông xanh biếc.' },
          { label: 'C', text: 'Một bức tranh màu tím.' },
        ],
        correctLabel: 'A',
        explanation:
          'Đoạn 2 có câu: “Cánh đồng lúa chín trải rộng mênh mông như một tấm thảm vàng rực rỡ.”',
      },
      {
        id: 'tv3-q3',
        number: 3,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '3. Trên đồng, các bác nông dân đang làm gì?',
        options: [
          { label: 'A', text: 'Đang cày ruộng và gieo mạ.' },
          { label: 'B', text: 'Đang vui vẻ gặt lúa.' },
          { label: 'C', text: 'Đang ngồi nghỉ dưới gốc đa.' },
        ],
        correctLabel: 'B',
        explanation:
          'Ở đoạn 3 có câu: “Trên đồng, các bác nông dân đang vui vẻ gặt lúa.”',
      },
      {
        id: 'tv3-q4',
        number: 4,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '4. Qua bài đọc, theo em, cảnh cánh đồng vào mùa lúa chín như thế nào?',
        options: [
          { label: 'A', text: 'Vắng vẻ và buồn bã.' },
          { label: 'B', text: 'Tươi đẹp, trù phú và rộn ràng niềm vui.' },
          { label: 'C', text: 'Khô hạn và nắng gắt.' },
        ],
        correctLabel: 'B',
        explanation:
          'Cánh đồng lúa chín vàng rực rỡ, các bác nông dân gặt lúa với tiếng cười nói rộn ràng nên cảnh vật rất tươi đẹp và tràn ngập niềm vui.',
      },
      {
        id: 'tv3-q5',
        number: 5,
        categoryBadge: 'Từ chỉ hoạt động',
        prompt: '5. Tìm từ chỉ hoạt động trong câu sau:',
        quoteText:
          'Gió thu thổi nhẹ làm sóng lúa nhấp nhô nối đuôi nhau chạy mãi vào bờ.',
        options: [
          { label: 'A', text: 'gió thu, sóng lúa, bờ' },
          { label: 'B', text: 'thổi, nối đuôi, chạy' },
          { label: 'C', text: 'nhẹ, mênh mông' },
        ],
        correctLabel: 'B',
        explanation:
          'Các từ “thổi, nối đuôi, chạy” là những từ chỉ hoạt động trong câu.',
      },
      {
        id: 'tv3-q6',
        number: 6,
        categoryBadge: 'Từ chỉ đặc điểm',
        prompt: 'Câu 6: Tìm từ chỉ đặc điểm trong câu: “Những hạt lúa vàng óng”:',
        options: [
          { label: 'A', text: 'Những hạt' },
          { label: 'B', text: 'hạt lúa' },
          { label: 'C', text: 'vàng óng' },
        ],
        correctLabel: 'C',
        explanation:
          '“vàng óng” là từ chỉ đặc điểm màu sắc của những hạt lúa chín.',
      },
      {
        id: 'tv3-q7',
        number: 7,
        categoryBadge: 'Từ chỉ sự vật',
        prompt: 'Câu 7: Tìm từ chỉ sự vật:',
        options: [
          { label: 'A', text: 'gặt lúa.' },
          { label: 'B', text: 'bác nông dân.' },
          { label: 'C', text: 'rực rỡ.' },
        ],
        correctLabel: 'B',
        explanation:
          '“bác nông dân” là từ chỉ sự vật (chỉ người). Còn “gặt lúa” là từ chỉ hoạt động, “rực rỡ” là từ chỉ đặc điểm.',
      },
      {
        id: 'tv3-q8',
        number: 8,
        categoryBadge: 'Dấu câu',
        prompt: 'Câu 8: Chọn dấu câu thích hợp điền vào chỗ chấm trong câu sau:',
        quoteText: '“Sáng Chủ nhật tuần này, em có về quê thăm ông bà không …..”',
        options: [
          { label: 'A', text: 'Dấu chấm than (!)' },
          { label: 'B', text: 'Dấu chấm (.)' },
          { label: 'C', text: 'Dấu chấm hỏi (?)' },
        ],
        correctLabel: 'C',
        explanation:
          'Câu văn dùng để hỏi nên cuối câu phải đặt Dấu chấm hỏi (?).',
      },
      {
        id: 'tv3-q9',
        number: 9,
        categoryBadge: 'Mẫu câu Ai là gì?',
        prompt: 'Câu 9: Câu nào dưới đây là Mẫu câu Ai là gì ? (Câu giới thiệu)',
        options: [
          { label: 'A', text: 'Bác Ba là nông dân giỏi nhất làng em.' },
          { label: 'B', text: 'Các bác nông dân đang gặt lúa trên đồng.' },
          { label: 'C', text: 'Cánh đồng quê em rộng mênh mông.' },
        ],
        correctLabel: 'A',
        explanation:
          '“Bác Ba là nông dân giỏi nhất làng em.” có từ “là” dùng để giới thiệu về bác Ba, thuộc mẫu câu Ai là gì?.',
      },
      {
        id: 'tv3-q10',
        number: 10,
        categoryBadge: 'Mẫu câu Ai làm gì?',
        prompt: 'Câu 10: Câu nào dưới đây là Mẫu câu Ai làm gì ? (Câu nêu hoạt động)',
        options: [
          { label: 'A', text: 'Em theo mẹ ra thăm cánh đồng làng.' },
          { label: 'B', text: 'Giọt sương đêm trong vắt.' },
          { label: 'C', text: 'Quê em là một vùng quê yên bình.' },
        ],
        correctLabel: 'A',
        explanation:
          '“Em theo mẹ ra thăm cánh đồng làng.” nêu hoạt động của nhân vật “Em” nên thuộc mẫu câu Ai làm gì?.',
      },
    ],
  },

  // ================= ĐỀ 4 =================
  {
    id: 'chiec-cap-sach-moi',
    shortTitle: 'Đề 4: Chiếc Cặp Sách Mới',
    badgeLabel: 'Đề Ôn Tập Số 4 (Đọc hiểu & Luyện từ câu)',
    readingTitle: 'CHIẾC CẶP SÁCH MỚI',
    author: 'Theo Nguyễn Quỳnh',
    paragraphs: [
      'Nhân dịp năm học mới lớp Hai, mẹ mua tặng em một chiếc cặp sách rất xinh xắn. Chiếc cặp có màu xanh da trời, mặt trước in hình chú mèo máy Đô-rê-mon đang mỉm cười thật tươi.',
      'Quai cặp được may bằng vải dù chắc chắn, có đệm mút êm ái giúp em đeo không bị đau vai. Bên trong cặp có hai ngăn rộng để đựng sách vở và một ngăn nhỏ đựng hộp bút, thước kẻ.',
      'Mỗi ngày, chiếc cặp cùng em tung tăng đến trường. Đi học về, em lau chùi cặp sạch sẽ rồi đặt ngay ngắn trên góc bàn học.',
    ],
    notes: [
      {
        term: 'Xinh xắn',
        definition: 'có dáng vẻ nhỏ nhắn, ưa nhìn và đáng yêu.',
      },
      {
        term: 'Ngay ngắn',
        definition: 'được sắp xếp gọn gàng, thẳng thắn, đúng vị trí.',
      },
    ],
    questions: [
      {
        id: 'tv4-q1',
        number: 1,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '1. Mặt trước chiếc cặp sách của bạn nhỏ in hình gì?',
        options: [
          { label: 'A', text: 'Hình bông hoa hướng dương.' },
          {
            label: 'B',
            text: 'Hình chú mèo máy Đô-rê-mon đang mỉm cười thật tươi.',
          },
          { label: 'C', text: 'Hình chiếc ô tô màu đỏ.' },
        ],
        correctLabel: 'B',
        explanation:
          'Trong đoạn 1 có viết: “Chiếc cặp có màu xanh da trời, mặt trước in hình chú mèo máy Đô-rê-mon đang mỉm cười thật tươi.”',
      },
      {
        id: 'tv4-q2',
        number: 2,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '2. Chiếc cặp sách mẹ mua cho bạn nhỏ có màu gì?',
        options: [
          { label: 'A', text: 'màu hồng phấn' },
          { label: 'B', text: 'màu vàng tươi' },
          { label: 'C', text: 'màu xanh da trời' },
        ],
        correctLabel: 'C',
        explanation:
          'Đoạn 1 nêu rõ: “Chiếc cặp có màu xanh da trời”.',
      },
      {
        id: 'tv4-q3',
        number: 3,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '3. Khi đi học về, bạn nhỏ làm gì với chiếc cặp sách?',
        options: [
          {
            label: 'A',
            text: 'Lau chùi cặp sạch sẽ rồi đặt ngay ngắn trên góc bàn học.',
          },
          { label: 'B', text: 'Để cặp sách dưới sàn nhà.' },
          { label: 'C', text: 'Nhờ mẹ cất cặp sách vào tủ.' },
        ],
        correctLabel: 'A',
        explanation:
          'Câu cuối bài viết: “Đi học về, em lau chùi cặp sạch sẽ rồi đặt ngay ngắn trên góc bàn học.”',
      },
      {
        id: 'tv4-q4',
        number: 4,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '4. Qua bài đọc, theo em, bạn nhỏ là người có tính cách thế nào?',
        options: [
          { label: 'A', text: 'Cẩu thả, hay làm hỏng đồ dùng.' },
          { label: 'B', text: 'Biết yêu quý và giữ gìn đồ dùng học tập cẩn thận.' },
          { label: 'C', text: 'Lười biếng soạn sách vở.' },
        ],
        correctLabel: 'B',
        explanation:
          'Bạn nhỏ luôn lau chùi cặp sạch sẽ và đặt ngay ngắn trên bàn học mỗi khi đi học về, chứng tỏ bạn rất gọn gàng và biết giữ gìn đồ dùng học tập.',
      },
      {
        id: 'tv4-q5',
        number: 5,
        categoryBadge: 'Từ chỉ hoạt động',
        prompt: '5. Tìm từ chỉ hoạt động trong câu sau:',
        quoteText:
          'Đi học về, em lau chùi cặp sạch sẽ rồi đặt ngay ngắn trên góc bàn học.',
        options: [
          { label: 'A', text: 'cặp, góc bàn học' },
          { label: 'B', text: 'đi học, lau chùi, đặt' },
          { label: 'C', text: 'sạch sẽ, ngay ngắn' },
        ],
        correctLabel: 'B',
        explanation:
          'Các từ “đi học, lau chùi, đặt” là các từ chỉ hoạt động của bạn nhỏ.',
      },
      {
        id: 'tv4-q6',
        number: 6,
        categoryBadge: 'Từ chỉ đặc điểm',
        prompt: 'Câu 6: Tìm từ chỉ đặc điểm trong câu: “Quai cặp rất chắc chắn”:',
        options: [
          { label: 'A', text: 'Quai cặp' },
          { label: 'B', text: 'chiếc cặp' },
          { label: 'C', text: 'chắc chắn' },
        ],
        correctLabel: 'C',
        explanation:
          '“chắc chắn” là từ chỉ đặc điểm của quai cặp sách.',
      },
      {
        id: 'tv4-q7',
        number: 7,
        categoryBadge: 'Từ chỉ sự vật',
        prompt: 'Câu 7: Tìm từ chỉ sự vật:',
        options: [
          { label: 'A', text: 'thước kẻ.' },
          { label: 'B', text: 'mỉm cười.' },
          { label: 'C', text: 'êm ái.' },
        ],
        correctLabel: 'A',
        explanation:
          '“thước kẻ” là từ chỉ sự vật (đồ dùng học tập). “mỉm cười” là từ chỉ hoạt động, “êm ái” là từ chỉ đặc điểm.',
      },
      {
        id: 'tv4-q8',
        number: 8,
        categoryBadge: 'Dấu câu',
        prompt: 'Câu 8: Chọn dấu câu thích hợp điền vào chỗ chấm trong câu sau:',
        quoteText: '“Cậu để hộp bút màu ở ngăn nào thế …..”',
        options: [
          { label: 'A', text: 'Dấu chấm hỏi (?)' },
          { label: 'B', text: 'Dấu chấm (.)' },
          { label: 'C', text: 'Dấu chấm than (!)' },
        ],
        correctLabel: 'A',
        explanation:
          'Đây là câu hỏi vị trí hộp bút màu nên cuối câu cần điền Dấu chấm hỏi (?).',
      },
      {
        id: 'tv4-q9',
        number: 9,
        categoryBadge: 'Mẫu câu Ai là gì?',
        prompt: 'Câu 9: Câu nào dưới đây là Mẫu câu Ai là gì ? (Câu giới thiệu)',
        options: [
          { label: 'A', text: 'Chiếc cặp sách là người bạn thân thiết của em.' },
          { label: 'B', text: 'Chiếc cặp sách có màu xanh da trời.' },
          { label: 'C', text: 'Mẹ mua cho em chiếc cặp sách mới.' },
        ],
        correctLabel: 'A',
        explanation:
          '“Chiếc cặp sách là người bạn thân thiết của em.” dùng từ “là” để giới thiệu chiếc cặp sách, thuộc mẫu câu Ai là gì?.',
      },
      {
        id: 'tv4-q10',
        number: 10,
        categoryBadge: 'Mẫu câu Ai làm gì?',
        prompt: 'Câu 10: Câu nào dưới đây là Mẫu câu Ai làm gì ? (Câu nêu hoạt động)',
        options: [
          { label: 'A', text: 'Em xếp sách vở gọn gàng vào cặp.' },
          { label: 'B', text: 'Hộp bút của em rất xinh xắn.' },
          { label: 'C', text: 'Em là học sinh lớp Hai.' },
        ],
        correctLabel: 'A',
        explanation:
          '“Em xếp sách vở gọn gàng vào cặp.” nêu hoạt động “xếp sách vở” của em nên thuộc mẫu câu Ai làm gì?.',
      },
    ],
  },

  // ================= ĐỀ 5 =================
  {
    id: 'chu-ga-trong-choai',
    shortTitle: 'Đề 5: Chú Gà Trống Choai',
    badgeLabel: 'Đề Ôn Tập Số 5 (Đọc hiểu & Luyện từ câu)',
    readingTitle: 'CHÚ GÀ TRỐNG CHOAI',
    author: 'Theo Xuân Quý',
    paragraphs: [
      'Nhà bà ngoại em có nuôi một chú gà trống choai rất đẹp. Bộ lông của chú pha trộn nhiều màu sắc rực rỡ: xanh đen, vàng óng và đỏ tía. Cái mào trên đầu chú đỏ chót như một bông hoa mào gà.',
      'Đôi chân chú gà trống cao và vàng ươm, bước đi trông rất oai vệ. Đôi mắt chú tròn xoe, sáng long lanh như hai hạt cườm.',
      'Mỗi buổi sáng tinh mơ, chú nhảy phốc lên đống rơm cao trước sân, vỗ cánh phành phạch rồi cất tiếng gáy vang: “Ò... ó... o...”. Tiếng gáy của chú đánh thức mọi người dậy bắt đầu ngày mới.',
    ],
    notes: [
      {
        term: 'Gà trống choai',
        definition: 'gà trống mới lớn, khỏe mạnh và bắt đầu tập gáy.',
      },
      {
        term: 'Oai vệ',
        definition: 'có dáng vẻ hùng dũng, trang nghiêm, đáng nể.',
      },
    ],
    questions: [
      {
        id: 'tv5-q1',
        number: 1,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '1. Cái mào trên đầu chú gà trống được so sánh với gì?',
        options: [
          { label: 'A', text: 'Đỏ chót như một bông hoa mào gà.' },
          { label: 'B', text: 'Vàng tươi như bông hoa cúc.' },
          { label: 'C', text: 'Trắng muốt như đám mây.' },
        ],
        correctLabel: 'A',
        explanation:
          'Trong đoạn 1 có viết: “Cái mào trên đầu chú đỏ chót như một bông hoa mào gà.”',
      },
      {
        id: 'tv5-q2',
        number: 2,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '2. Đôi chân của chú gà trống có màu gì?',
        options: [
          { label: 'A', text: 'màu đen tuyền' },
          { label: 'B', text: 'màu vàng ươm' },
          { label: 'C', text: 'màu trắng hồng' },
        ],
        correctLabel: 'B',
        explanation:
          'Đoạn 2 có câu: “Đôi chân chú gà trống cao và vàng ươm, bước đi trông rất oai vệ.”',
      },
      {
        id: 'tv5-q3',
        number: 3,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '3. Mỗi buổi sáng tinh mơ, chú gà trống nhảy lên đâu để gáy?',
        options: [
          { label: 'A', text: 'Nhảy lên mái ngói.' },
          { label: 'B', text: 'Nhảy phốc lên đống rơm cao trước sân.' },
          { label: 'C', text: 'Đứng ở trong chuồng gà.' },
        ],
        correctLabel: 'B',
        explanation:
          'Ở đoạn 3 có viết: “Mỗi buổi sáng tinh mơ, chú nhảy phốc lên đống rơm cao trước sân, vỗ cánh phành phạch rồi cất tiếng gáy vang”.',
      },
      {
        id: 'tv5-q4',
        number: 4,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '4. Qua bài đọc, theo em, chú gà trống có ích lợi gì đối với mọi người?',
        options: [
          { label: 'A', text: 'Giúp bắt chuột trong kho thóc.' },
          { label: 'B', text: 'Gáy vang báo thức gọi mọi người dậy đúng giờ mỗi sáng.' },
          { label: 'C', text: 'Giúp trông giữ nhà cửa ban đêm.' },
        ],
        correctLabel: 'B',
        explanation:
          'Câu cuối bài nêu rõ: “Tiếng gáy của chú đánh thức mọi người dậy bắt đầu ngày mới.”',
      },
      {
        id: 'tv5-q5',
        number: 5,
        categoryBadge: 'Từ chỉ hoạt động',
        prompt: '5. Tìm từ chỉ hoạt động trong câu sau:',
        quoteText:
          'Chú nhảy phốc lên đống rơm cao trước sân, vỗ cánh phành phạch rồi cất tiếng gáy vang.',
        options: [
          { label: 'A', text: 'đống rơm, sân, cánh' },
          { label: 'B', text: 'nhảy, vỗ cánh, gáy' },
          { label: 'C', text: 'cao, phành phạch' },
        ],
        correctLabel: 'B',
        explanation:
          'Các từ “nhảy, vỗ cánh, gáy” là các từ chỉ hoạt động của chú gà trống.',
      },
      {
        id: 'tv5-q6',
        number: 6,
        categoryBadge: 'Từ chỉ đặc điểm',
        prompt: 'Câu 6: Tìm từ chỉ đặc điểm trong câu: “Đôi mắt chú gà tròn xoe”:',
        options: [
          { label: 'A', text: 'Đôi mắt' },
          { label: 'B', text: 'chú gà' },
          { label: 'C', text: 'tròn xoe' },
        ],
        correctLabel: 'C',
        explanation:
          '“tròn xoe” là từ chỉ đặc điểm hình dáng đôi mắt của chú gà.',
      },
      {
        id: 'tv5-q7',
        number: 7,
        categoryBadge: 'Từ chỉ sự vật',
        prompt: 'Câu 7: Tìm từ chỉ sự vật:',
        options: [
          { label: 'A', text: 'chú gà trống.' },
          { label: 'B', text: 'bước đi.' },
          { label: 'C', text: 'rực rỡ.' },
        ],
        correctLabel: 'A',
        explanation:
          '“chú gà trống” là từ chỉ sự vật (con vật). Còn “bước đi” là từ chỉ hoạt động, “rực rỡ” là từ chỉ đặc điểm.',
      },
      {
        id: 'tv5-q8',
        number: 8,
        categoryBadge: 'Dấu câu',
        prompt: 'Câu 8: Chọn dấu câu thích hợp điền vào chỗ chấm trong câu sau:',
        quoteText: '“Bà ơi, ai cho đàn gà ăn thóc thế ạ …..”',
        options: [
          { label: 'A', text: 'Dấu chấm (.)' },
          { label: 'B', text: 'Dấu chấm than (!)' },
          { label: 'C', text: 'Dấu chấm hỏi (?)' },
        ],
        correctLabel: 'C',
        explanation:
          'Câu văn dùng để hỏi bà nên cuối câu phải đặt Dấu chấm hỏi (?).',
      },
      {
        id: 'tv5-q9',
        number: 9,
        categoryBadge: 'Mẫu câu Ai là gì?',
        prompt: 'Câu 9: Câu nào dưới đây là Mẫu câu Ai là gì ? (Câu giới thiệu)',
        options: [
          { label: 'A', text: 'Chú gà trống là chiếc đồng hồ báo thức của nhà bà.' },
          { label: 'B', text: 'Chú gà trống gáy vang mỗi sáng.' },
          { label: 'C', text: 'Bộ lông của chú gà rất mượt mà.' },
        ],
        correctLabel: 'A',
        explanation:
          'Câu A có từ “là” giới thiệu chú gà trống như chiếc đồng hồ báo thức, thuộc mẫu câu Ai là gì?.',
      },
      {
        id: 'tv5-q10',
        number: 10,
        categoryBadge: 'Mẫu câu Ai làm gì?',
        prompt: 'Câu 10: Câu nào dưới đây là Mẫu câu Ai làm gì ? (Câu nêu hoạt động)',
        options: [
          { label: 'A', text: 'Bà ngoại rải thóc cho đàn gà ăn.' },
          { label: 'B', text: 'Cái mào gà đỏ chót.' },
          { label: 'C', text: 'Gà trống là loài vật nuôi có ích.' },
        ],
        correctLabel: 'A',
        explanation:
          '“Bà ngoại rải thóc cho đàn gà ăn.” nêu hoạt động của bà ngoại nên thuộc mẫu câu Ai làm gì?.',
      },
    ],
  },

  // ================= ĐỀ 6 =================
  {
    id: 'ba-noi-cua-em',
    shortTitle: 'Đề 6: Bà Nội Của Em',
    badgeLabel: 'Đề Ôn Tập Số 6 (Đọc hiểu & Luyện từ câu)',
    readingTitle: 'BÀ NỘI CỦA EM',
    author: 'Theo Thu Hà',
    paragraphs: [
      'Bà nội của em năm nay đã ngoài bảy mươi tuổi. Mái tóc bà bạc trắng như bông, luôn được búi gọn gàng sau gáy. Mỗi khi bà cười, đôi mắt bà hiền từ và ấm áp lạ thường.',
      'Những buổi trưa hè oi ả, bà thường ngồi bên võng, tay phe phẩy chiếc quạt nan quạt mát cho em ngủ. Tiếng võng kêu kẽo kẹt hòa cùng lời ru ngọt ngào của bà đưa em vào giấc mơ đẹp.',
      'Buổi tối, bà hay kể cho em nghe biết bao câu chuyện cổ tích lý thú. Em rất yêu bà và mong bà luôn mạnh khỏe.',
    ],
    notes: [
      {
        term: 'Hiền từ',
        definition: 'hiền hậu và giàu lòng thương yêu con cháu.',
      },
      {
        term: 'Oi ả',
        definition: 'nóng bức, ngột ngạt vì lặng gió vào mùa hè.',
      },
    ],
    questions: [
      {
        id: 'tv6-q1',
        number: 1,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '1. Mái tóc của bà nội trong bài đọc được miêu tả như thế nào?',
        options: [
          { label: 'A', text: 'Đen nhánh và dài ngang lưng.' },
          {
            label: 'B',
            text: 'Bạc trắng như bông, luôn được búi gọn gàng sau gáy.',
          },
          { label: 'C', text: 'Xoăn bồng bềnh màu hạt dẻ.' },
        ],
        correctLabel: 'B',
        explanation:
          'Trong đoạn 1 có viết: “Mái tóc bà bạc trắng như bông, luôn được búi gọn gàng sau gáy.”',
      },
      {
        id: 'tv6-q2',
        number: 2,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '2. Những buổi trưa hè, bà dùng vật gì để quạt mát cho bạn nhỏ ngủ?',
        options: [
          { label: 'A', text: 'Chiếc quạt điện' },
          { label: 'B', text: 'Chiếc quạt giấy' },
          { label: 'C', text: 'Chiếc quạt nan' },
        ],
        correctLabel: 'C',
        explanation:
          'Đoạn 2 có câu: “Những buổi trưa hè oi ả, bà thường ngồi bên võng, tay phe phẩy chiếc quạt nan quạt mát cho em ngủ.”',
      },
      {
        id: 'tv6-q3',
        number: 3,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '3. Buổi tối, bà nội thường làm gì cho bạn nhỏ?',
        options: [
          { label: 'A', text: 'Kể cho em nghe những câu chuyện cổ tích lý thú.' },
          { label: 'B', text: 'Dẫn em đi dạo công viên.' },
          { label: 'C', text: 'Dạy em vẽ tranh.' },
        ],
        correctLabel: 'A',
        explanation:
          'Ở đoạn 3 có câu: “Buổi tối, bà hay kể cho em nghe biết bao câu chuyện cổ tích lý thú.”',
      },
      {
        id: 'tv6-q4',
        number: 4,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '4. Qua bài đọc, theo em, bạn nhỏ mong ước điều gì cho bà nội?',
        options: [
          { label: 'A', text: 'Mong bà mua cho nhiều đồ chơi.' },
          { label: 'B', text: 'Mong bà luôn mạnh khỏe.' },
          { label: 'C', text: 'Mong được đi du lịch xa.' },
        ],
        correctLabel: 'B',
        explanation:
          'Câu cuối bài đọc viết: “Em rất yêu bà và mong bà luôn mạnh khỏe.”',
      },
      {
        id: 'tv6-q5',
        number: 5,
        categoryBadge: 'Từ chỉ hoạt động',
        prompt: '5. Tìm từ chỉ hoạt động trong câu sau:',
        quoteText:
          'Bà thường ngồi bên võng, tay phe phẩy chiếc quạt nan quạt mát cho em ngủ.',
        options: [
          { label: 'A', text: 'bà, võng, chiếc quạt nan' },
          { label: 'B', text: 'ngồi, quạt, ngủ' },
          { label: 'C', text: 'mát, oi ả' },
        ],
        correctLabel: 'B',
        explanation:
          'Các từ “ngồi, quạt, ngủ” là những từ chỉ hoạt động của bà và em.',
      },
      {
        id: 'tv6-q6',
        number: 6,
        categoryBadge: 'Từ chỉ đặc điểm',
        prompt: 'Câu 6: Tìm từ chỉ đặc điểm trong câu: “Lời ru của bà rất ngọt ngào”:',
        options: [
          { label: 'A', text: 'Lời ru' },
          { label: 'B', text: 'của bà' },
          { label: 'C', text: 'ngọt ngào' },
        ],
        correctLabel: 'C',
        explanation:
          '“ngọt ngào” là từ chỉ đặc điểm của lời ru.',
      },
      {
        id: 'tv6-q7',
        number: 7,
        categoryBadge: 'Từ chỉ sự vật',
        prompt: 'Câu 7: Tìm từ chỉ sự vật:',
        options: [
          { label: 'A', text: 'kể chuyện.' },
          { label: 'B', text: 'chiếc quạt nan.' },
          { label: 'C', text: 'hiền từ.' },
        ],
        correctLabel: 'B',
        explanation:
          '“chiếc quạt nan” là từ chỉ sự vật (đồ vật). Còn “kể chuyện” là từ chỉ hoạt động, “hiền từ” là từ chỉ đặc điểm.',
      },
      {
        id: 'tv6-q8',
        number: 8,
        categoryBadge: 'Dấu câu',
        prompt: 'Câu 8: Chọn dấu câu thích hợp điền vào chỗ chấm trong câu sau:',
        quoteText: '“Tối nay bà kể chuyện Tấm Cám cho cháu nghe nhé ạ …..”',
        options: [
          { label: 'A', text: 'Dấu chấm hỏi (?)' },
          { label: 'B', text: 'Dấu phẩy (,)' },
          { label: 'C', text: 'Dấu hai chấm (:)' },
        ],
        correctLabel: 'A',
        explanation:
          'Câu hỏi xin ý kiến của bà ở cuối câu dùng Dấu chấm hỏi (?).',
      },
      {
        id: 'tv6-q9',
        number: 9,
        categoryBadge: 'Mẫu câu Ai là gì?',
        prompt: 'Câu 9: Câu nào dưới đây là Mẫu câu Ai là gì ? (Câu giới thiệu)',
        options: [
          { label: 'A', text: 'Bà nội là người em yêu quý nhất trong gia đình.' },
          { label: 'B', text: 'Đôi mắt bà rất hiền từ và ấm áp.' },
          { label: 'C', text: 'Em bóp vai cho bà đỡ mỏi.' },
        ],
        correctLabel: 'A',
        explanation:
          'Câu A có từ “là” dùng để giới thiệu về bà nội, thuộc mẫu câu Ai là gì?.',
      },
      {
        id: 'tv6-q10',
        number: 10,
        categoryBadge: 'Mẫu câu Ai làm gì?',
        prompt: 'Câu 10: Câu nào dưới đây là Mẫu câu Ai làm gì ? (Câu nêu hoạt động)',
        options: [
          { label: 'A', text: 'Bà kể chuyện cổ tích cho hai anh em nghe.' },
          { label: 'B', text: 'Mái tóc bà bạc trắng như bông.' },
          { label: 'C', text: 'Em là đứa cháu ngoan của bà.' },
        ],
        correctLabel: 'A',
        explanation:
          '“Bà kể chuyện cổ tích cho hai anh em nghe.” nêu hoạt động “kể chuyện cổ tích” của bà nên thuộc mẫu câu Ai làm gì?.',
      },
    ],
  },

  // ================= ĐỀ 7 =================
  {
    id: 'gio-ra-choi-o-truong',
    shortTitle: 'Đề 7: Giờ Ra Chơi Ở Trường Em',
    badgeLabel: 'Đề Ôn Tập Số 7 (Đọc hiểu & Luyện từ câu)',
    readingTitle: 'GIỜ RA CHƠI Ở TRƯỜNG EM',
    author: 'Theo Hải Minh',
    paragraphs: [
      '“Tùng! Tùng! Tùng!”. Tiếng trống trường vang lên giòn giã báo hiệu giờ ra chơi đã đến. Từ các lớp học, chúng em ùa ra sân trường như đàn chim non sổ lồng.',
      'Dưới bóng mát của cây bàng cổ thụ, các bạn nữ đang vui vẻ nhảy dây. Ở giữa sân, các bạn nam chia đội đá cầu, quả cầu xanh đỏ bay thoăn thoắt từ chân bạn này sang chân bạn khác.',
      'Trên ghế đá cạnh bồn hoa mười giờ, mấy bạn đang chụm đầu cùng đọc quyển truyện tranh mới. Giờ ra chơi giúp chúng em thêm khỏe khoắn và vui tươi để học tiếp các tiết sau.',
    ],
    notes: [
      {
        term: 'Giòn giã',
        definition: 'âm thanh vang lên liên tiếp, nghe vui tai và thúc giục.',
      },
      {
        term: 'Thoăn thoắt',
        definition: 'chuyển động rất nhanh nhẹn, khéo léo và nhịp nhàng.',
      },
    ],
    questions: [
      {
        id: 'tv7-q1',
        number: 1,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '1. Khi tiếng trống báo giờ ra chơi vang lên, các bạn học sinh ùa ra sân như thế nào?',
        options: [
          { label: 'A', text: 'Đi chậm rãi từng bước.' },
          { label: 'B', text: 'Ùa ra sân trường như đàn chim non sổ lồng.' },
          { label: 'C', text: 'Ngồi yên trong lớp học.' },
        ],
        correctLabel: 'B',
        explanation:
          'Trong đoạn 1 có viết: “Từ các lớp học, chúng em ùa ra sân trường như đàn chim non sổ lồng.”',
      },
      {
        id: 'tv7-q2',
        number: 2,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '2. Quả cầu của các bạn nam có màu gì?',
        options: [
          { label: 'A', text: 'màu xanh đỏ' },
          { label: 'B', text: 'màu tím vàng' },
          { label: 'C', text: 'màu đen trắng' },
        ],
        correctLabel: 'A',
        explanation:
          'Đoạn 2 có câu: “Ở giữa sân, các bạn nam chia đội đá cầu, quả cầu xanh đỏ bay thoăn thoắt...”.',
      },
      {
        id: 'tv7-q3',
        number: 3,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '3. Mấy bạn ngồi trên ghế đá cạnh bồn hoa đang làm gì?',
        options: [
          { label: 'A', text: 'Đang chơi bắn bi.' },
          { label: 'B', text: 'Đang chụm đầu cùng đọc quyển truyện tranh mới.' },
          { label: 'C', text: 'Đang tập hát múa.' },
        ],
        correctLabel: 'B',
        explanation:
          'Ở đoạn 3 có câu: “Trên ghế đá cạnh bồn hoa mười giờ, mấy bạn đang chụm đầu cùng đọc quyển truyện tranh mới.”',
      },
      {
        id: 'tv7-q4',
        number: 4,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '4. Qua bài đọc, theo em, giờ ra chơi có lợi ích gì cho học sinh?',
        options: [
          { label: 'A', text: 'Làm học sinh mệt mỏi hơn.' },
          {
            label: 'B',
            text: 'Giúp học sinh thêm khỏe khoắn và vui tươi để học tiếp các tiết sau.',
          },
          { label: 'C', text: 'Làm học sinh quên bài học.' },
        ],
        correctLabel: 'B',
        explanation:
          'Câu cuối bài đọc nêu rõ: “Giờ ra chơi giúp chúng em thêm khỏe khoắn và vui tươi để học tiếp các tiết sau.”',
      },
      {
        id: 'tv7-q5',
        number: 5,
        categoryBadge: 'Từ chỉ hoạt động',
        prompt: '5. Tìm từ chỉ hoạt động trong câu sau:',
        quoteText:
          'Các bạn nữ đang nhảy dây, còn các bạn nam chia đội đá cầu và đọc truyện.',
        options: [
          { label: 'A', text: 'các bạn nữ, các bạn nam, truyện' },
          { label: 'B', text: 'nhảy dây, đá cầu, đọc' },
          { label: 'C', text: 'vui vẻ, khỏe khoắn' },
        ],
        correctLabel: 'B',
        explanation:
          '“nhảy dây, đá cầu, đọc” là các từ ngữ chỉ hoạt động vui chơi của học sinh.',
      },
      {
        id: 'tv7-q6',
        number: 6,
        categoryBadge: 'Từ chỉ đặc điểm',
        prompt: 'Câu 6: Tìm từ chỉ đặc điểm trong câu: “Sân trường em rất rộng rãi”:',
        options: [
          { label: 'A', text: 'Sân trường' },
          { label: 'B', text: 'trường em' },
          { label: 'C', text: 'rộng rãi' },
        ],
        correctLabel: 'C',
        explanation:
          '“rộng rãi” là từ chỉ đặc điểm của sân trường.',
      },
      {
        id: 'tv7-q7',
        number: 7,
        categoryBadge: 'Từ chỉ sự vật',
        prompt: 'Câu 7: Tìm từ chỉ sự vật:',
        options: [
          { label: 'A', text: 'nhảy dây.' },
          { label: 'B', text: 'trống trường.' },
          { label: 'C', text: 'giòn giã.' },
        ],
        correctLabel: 'B',
        explanation:
          '“trống trường” là từ chỉ sự vật (đồ vật). Còn “nhảy dây” là từ chỉ hoạt động, “giòn giã” là từ chỉ đặc điểm.',
      },
      {
        id: 'tv7-q8',
        number: 8,
        categoryBadge: 'Dấu câu',
        prompt: 'Câu 8: Chọn dấu câu thích hợp điền vào chỗ chấm trong câu sau:',
        quoteText: '“Giờ ra chơi, các cậu thích chơi trò gì nhất …..”',
        options: [
          { label: 'A', text: 'Dấu chấm (.)' },
          { label: 'B', text: 'Dấu chấm than (!)' },
          { label: 'C', text: 'Dấu chấm hỏi (?)' },
        ],
        correctLabel: 'C',
        explanation:
          'Đây là câu hỏi các bạn về trò chơi yêu thích nên cuối câu đặt Dấu chấm hỏi (?).',
      },
      {
        id: 'tv7-q9',
        number: 9,
        categoryBadge: 'Mẫu câu Ai là gì?',
        prompt: 'Câu 9: Câu nào dưới đây là Mẫu câu Ai là gì ? (Câu giới thiệu)',
        options: [
          { label: 'A', text: 'Bạn Lan là lớp trưởng lớp 2A.' },
          { label: 'B', text: 'Bạn Lan nhảy dây rất khéo.' },
          { label: 'C', text: 'Chúng em đá cầu ở giữa sân trường.' },
        ],
        correctLabel: 'A',
        explanation:
          '“Bạn Lan là lớp trưởng lớp 2A.” có từ “là” giới thiệu chức vụ của bạn Lan, thuộc mẫu câu Ai là gì?.',
      },
      {
        id: 'tv7-q10',
        number: 10,
        categoryBadge: 'Mẫu câu Ai làm gì?',
        prompt: 'Câu 10: Câu nào dưới đây là Mẫu câu Ai làm gì ? (Câu nêu hoạt động)',
        options: [
          { label: 'A', text: 'Bác bảo vệ đánh trống báo giờ ra chơi.' },
          { label: 'B', text: 'Cây bàng tỏa bóng mát rượi.' },
          { label: 'C', text: 'Bác bảo vệ là người rất hiền lành.' },
        ],
        correctLabel: 'A',
        explanation:
          '“Bác bảo vệ đánh trống báo giờ ra chơi.” nêu hoạt động “đánh trống” của bác bảo vệ nên thuộc mẫu câu Ai làm gì?.',
      },
    ],
  },

  // ================= ĐỀ 8 =================
  {
    id: 'cay-bang-truoc-lop',
    shortTitle: 'Đề 8: Cây Bàng Trước Lớp',
    badgeLabel: 'Đề Ôn Tập Số 8 (Đọc hiểu & Luyện từ câu)',
    readingTitle: 'CÂY BÀNG TRƯỚC LỚP HỌC',
    author: 'Theo Hữu Tưởng',
    paragraphs: [
      'Trước cửa lớp em có trồng một cây bàng cao lớn. Mùa xuân, cành bàng đâm chồi nảy lộc, những chiếc lá non xanh mơn mởn như những bàn tay nhỏ xíu vẫy chào chúng em.',
      'Sang mùa hạ, lá bàng mọc dày và xanh um, tán lá xòe rộng như một chiếc ô khổng lồ che nắng cho sân trường. Chim chóc bay về hót líu lo trên vòm lá mát rượi.',
      'Mùa thu tới, từng chùm quả bàng chín vàng ươm, tỏa hương thơm ngát. Đến mùa đông, lá bàng chuyển sang màu đỏ thẫm rồi rụng dần xuống sân.',
    ],
    notes: [
      {
        term: 'Mơn mởn',
        definition: 'non tươi, mịn màng và tràn đầy sức sống.',
      },
      {
        term: 'Khổng lồ',
        definition: 'rất to lớn, vượt xa kích thước bình thường.',
      },
    ],
    questions: [
      {
        id: 'tv8-q1',
        number: 1,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '1. Vào mùa xuân, những chiếc lá bàng non trông như thế nào?',
        options: [
          { label: 'A', text: 'Đỏ thẫm và rụng đầy sân.' },
          {
            label: 'B',
            text: 'Xanh mơn mởn như những bàn tay nhỏ xíu vẫy chào chúng em.',
          },
          { label: 'C', text: 'Khô héo và vàng úa.' },
        ],
        correctLabel: 'B',
        explanation:
          'Trong đoạn 1 có viết: “Mùa xuân, cành bàng đâm chồi nảy lộc, những chiếc lá non xanh mơn mởn như những bàn tay nhỏ xíu vẫy chào chúng em.”',
      },
      {
        id: 'tv8-q2',
        number: 2,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '2. Đến mùa đông, lá bàng chuyển sang màu gì?',
        options: [
          { label: 'A', text: 'màu xanh non' },
          { label: 'B', text: 'màu tím biếc' },
          { label: 'C', text: 'màu đỏ thẫm' },
        ],
        correctLabel: 'C',
        explanation:
          'Câu cuối đoạn 3 viết: “Đến mùa đông, lá bàng chuyển sang màu đỏ thẫm rồi rụng dần xuống sân.”',
      },
      {
        id: 'tv8-q3',
        number: 3,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '3. Sang mùa hạ, tán lá bàng có tác dụng gì đối với sân trường?',
        options: [
          {
            label: 'A',
            text: 'Xòe rộng như chiếc ô khổng lồ che nắng cho sân trường.',
          },
          { label: 'B', text: 'Trụi hết lá để đón nắng.' },
          { label: 'C', text: 'Rụng lá đầy mái trường.' },
        ],
        correctLabel: 'A',
        explanation:
          'Đoạn 2 có câu: “Sang mùa hạ, lá bàng mọc dày và xanh um, tán lá xòe rộng như một chiếc ô khổng lồ che nắng cho sân trường.”',
      },
      {
        id: 'tv8-q4',
        number: 4,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '4. Qua bài đọc, theo em, quả bàng chín vàng ươm và thơm ngát vào mùa nào?',
        options: [
          { label: 'A', text: 'Mùa xuân' },
          { label: 'B', text: 'Mùa thu' },
          { label: 'C', text: 'Mùa đông' },
        ],
        correctLabel: 'B',
        explanation:
          'Ở đoạn 3 có viết: “Mùa thu tới, từng chùm quả bàng chín vàng ươm, tỏa hương thơm ngát.”',
      },
      {
        id: 'tv8-q5',
        number: 5,
        categoryBadge: 'Từ chỉ hoạt động',
        prompt: '5. Tìm từ chỉ hoạt động trong câu sau:',
        quoteText: 'Chim chóc bay về đậu trên cành và hót líu lo.',
        options: [
          { label: 'A', text: 'chim chóc, cành' },
          { label: 'B', text: 'bay, đậu, hót' },
          { label: 'C', text: 'líu lo, mát rượi' },
        ],
        correctLabel: 'B',
        explanation:
          'Các từ “bay, đậu, hót” là các từ chỉ hoạt động của đàn chim.',
      },
      {
        id: 'tv8-q6',
        number: 6,
        categoryBadge: 'Từ chỉ đặc điểm',
        prompt: 'Câu 6: Tìm từ chỉ đặc điểm trong câu: “Quả bàng chín thơm ngát”:',
        options: [
          { label: 'A', text: 'Quả bàng' },
          { label: 'B', text: 'cây bàng' },
          { label: 'C', text: 'thơm ngát' },
        ],
        correctLabel: 'C',
        explanation:
          '“thơm ngát” là từ chỉ đặc điểm mùi hương của quả bàng chín.',
      },
      {
        id: 'tv8-q7',
        number: 7,
        categoryBadge: 'Từ chỉ sự vật',
        prompt: 'Câu 7: Tìm từ chỉ sự vật:',
        options: [
          { label: 'A', text: 'cây bàng.' },
          { label: 'B', text: 'che nắng.' },
          { label: 'C', text: 'cao lớn.' },
        ],
        correctLabel: 'A',
        explanation:
          '“cây bàng” là từ chỉ sự vật (cây cối). Còn “che nắng” là từ chỉ hoạt động, “cao lớn” là từ chỉ đặc điểm.',
      },
      {
        id: 'tv8-q8',
        number: 8,
        categoryBadge: 'Dấu câu',
        prompt: 'Câu 8: Chọn dấu câu thích hợp điền vào chỗ chấm trong câu sau:',
        quoteText: '“Sân trường bạn có trồng cây bàng không …..”',
        options: [
          { label: 'A', text: 'Dấu chấm than (!)' },
          { label: 'B', text: 'Dấu chấm (.)' },
          { label: 'C', text: 'Dấu chấm hỏi (?)' },
        ],
        correctLabel: 'C',
        explanation:
          'Câu văn dùng để hỏi bạn nên cuối câu phải đặt Dấu chấm hỏi (?).',
      },
      {
        id: 'tv8-q9',
        number: 9,
        categoryBadge: 'Mẫu câu Ai là gì?',
        prompt: 'Câu 9: Câu nào dưới đây là Mẫu câu Ai là gì ? (Câu giới thiệu)',
        options: [
          { label: 'A', text: 'Cây bàng là cái ô xanh mát của chúng em.' },
          { label: 'B', text: 'Lá bàng mùa đông đỏ thẫm.' },
          { label: 'C', text: 'Chúng em nhặt lá bàng rơi trên sân.' },
        ],
        correctLabel: 'A',
        explanation:
          'Câu A có từ “là” giới thiệu về cây bàng, thuộc mẫu câu Ai là gì?.',
      },
      {
        id: 'tv8-q10',
        number: 10,
        categoryBadge: 'Mẫu câu Ai làm gì?',
        prompt: 'Câu 10: Câu nào dưới đây là Mẫu câu Ai làm gì ? (Câu nêu hoạt động)',
        options: [
          { label: 'A', text: 'Đàn chim hót líu lo trên vòm lá.' },
          { label: 'B', text: 'Vòm lá bàng xanh mơn mởn.' },
          { label: 'C', text: 'Chim sâu là bạn của nhà nông.' },
        ],
        correctLabel: 'A',
        explanation:
          '“Đàn chim hót líu lo trên vòm lá.” nêu hoạt động “hót líu lo” của đàn chim nên thuộc mẫu câu Ai làm gì?.',
      },
    ],
  },

  // ================= ĐỀ 9 =================
  {
    id: 'chu-meo-mun-cua-be',
    shortTitle: 'Đề 9: Chú Mèo Mun Của Bé',
    badgeLabel: 'Đề Ôn Tập Số 9 (Đọc hiểu & Luyện từ câu)',
    readingTitle: 'CHÚ MÈO MUN CỦA BÉ',
    author: 'Theo Trần Đức Tiến',
    paragraphs: [
      'Sinh nhật năm ngoái, dì Lan tặng em một chú mèo con rất đáng yêu. Toàn thân chú khoác bộ lông màu đen mượt như nhung nên cả nhà đặt tên chú là Mun.',
      'Cái đầu chú tròn trịa, hai tai vểnh lên nghe ngóng mọi tiếng động. Đôi mắt Mun tròn xoe, xanh biếc như hai hòn bi ve. Dưới bốn bàn chân chú có lớp đệm thịt hồng hào nên Mun bước đi êm ru, không phát ra tiếng động.',
      'Ban ngày, Mun thích nằm cuộn tròn ngoài hiên sưởi nắng. Ban đêm, chú chăm chỉ đi rình bắt chuột. Từ ngày có Mun, lũ chuột không dám bén mảng vào bếp nữa.',
    ],
    notes: [
      {
        term: 'Mèo mun',
        definition: 'loài mèo có bộ lông màu đen tuyền.',
      },
      {
        term: 'Bén mảng',
        definition: 'dám lén lút đến gần một nơi nào đó.',
      },
    ],
    questions: [
      {
        id: 'tv9-q1',
        number: 1,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '1. Vì sao cả nhà đặt tên cho chú mèo là Mun?',
        options: [
          { label: 'A', text: 'Vì chú có bộ lông trắng như tuyết.' },
          {
            label: 'B',
            text: 'Vì toàn thân chú khoác bộ lông màu đen mượt như nhung.',
          },
          { label: 'C', text: 'Vì chú có bộ lông vàng sọc nâu.' },
        ],
        correctLabel: 'B',
        explanation:
          'Trong đoạn 1 có viết: “Toàn thân chú khoác bộ lông màu đen mượt như nhung nên cả nhà đặt tên chú là Mun.”',
      },
      {
        id: 'tv9-q2',
        number: 2,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '2. Đôi mắt của chú mèo Mun có màu gì?',
        options: [
          { label: 'A', text: 'màu xanh biếc' },
          { label: 'B', text: 'màu đỏ hồng' },
          { label: 'C', text: 'màu tím nhạt' },
        ],
        correctLabel: 'A',
        explanation:
          'Đoạn 2 có câu: “Đôi mắt Mun tròn xoe, xanh biếc như hai hòn bi ve.”',
      },
      {
        id: 'tv9-q3',
        number: 3,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '3. Ban ngày, chú mèo Mun thích làm gì?',
        options: [
          { label: 'A', text: 'Nằm cuộn tròn ngoài hiên sưởi nắng.' },
          { label: 'B', text: 'Trèo lên ngọn cây cau.' },
          { label: 'C', text: 'Chạy nhảy ngoài cánh đồng.' },
        ],
        correctLabel: 'A',
        explanation:
          'Ở đoạn 3 có câu: “Ban ngày, Mun thích nằm cuộn tròn ngoài hiên sưởi nắng.”',
      },
      {
        id: 'tv9-q4',
        number: 4,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '4. Qua bài đọc, nhờ có chú mèo Mun mà căn bếp của gia đình thế nào?',
        options: [
          { label: 'A', text: 'Lũ chuột kéo đến nhiều hơn.' },
          { label: 'B', text: 'Lũ chuột không dám bén mảng vào bếp nữa.' },
          { label: 'C', text: 'Đồ đạc trong bếp bị xáo trộn.' },
        ],
        correctLabel: 'B',
        explanation:
          'Câu cuối bài nêu rõ: “Từ ngày có Mun, lũ chuột không dám bén mảng vào bếp nữa.”',
      },
      {
        id: 'tv9-q5',
        number: 5,
        categoryBadge: 'Từ chỉ hoạt động',
        prompt: '5. Tìm từ chỉ hoạt động trong câu sau:',
        quoteText:
          'Ban ngày, Mun nằm sưởi nắng, còn ban đêm chú đi rình và bắt chuột.',
        options: [
          { label: 'A', text: 'Mun, nắng, chuột' },
          { label: 'B', text: 'nằm, đi rình, bắt' },
          { label: 'C', text: 'êm ru, chăm chỉ' },
        ],
        correctLabel: 'B',
        explanation:
          'Các từ “nằm, đi rình, bắt” là những từ chỉ hoạt động của chú mèo Mun.',
      },
      {
        id: 'tv9-q6',
        number: 6,
        categoryBadge: 'Từ chỉ đặc điểm',
        prompt: 'Câu 6: Tìm từ chỉ đặc điểm trong câu: “Bộ lông mèo đen mượt”:',
        options: [
          { label: 'A', text: 'Bộ lông' },
          { label: 'B', text: 'con mèo' },
          { label: 'C', text: 'đen mượt' },
        ],
        correctLabel: 'C',
        explanation:
          '“đen mượt” là từ chỉ đặc điểm của bộ lông mèo.',
      },
      {
        id: 'tv9-q7',
        number: 7,
        categoryBadge: 'Từ chỉ sự vật',
        prompt: 'Câu 7: Tìm từ chỉ sự vật:',
        options: [
          { label: 'A', text: 'sưởi nắng.' },
          { label: 'B', text: 'con mèo.' },
          { label: 'C', text: 'tròn trịa.' },
        ],
        correctLabel: 'B',
        explanation:
          '“con mèo” là từ chỉ sự vật (con vật). Còn “sưởi nắng” là từ chỉ hoạt động, “tròn trịa” là từ chỉ đặc điểm.',
      },
      {
        id: 'tv9-q8',
        number: 8,
        categoryBadge: 'Dấu câu',
        prompt: 'Câu 8: Chọn dấu câu thích hợp điền vào chỗ chấm trong câu sau:',
        quoteText: '“Nhà bạn có nuôi chú mèo nào không …..”',
        options: [
          { label: 'A', text: 'Dấu chấm hỏi (?)' },
          { label: 'B', text: 'Dấu chấm (.)' },
          { label: 'C', text: 'Dấu chấm than (!)' },
        ],
        correctLabel: 'A',
        explanation:
          'Đây là câu hỏi nên cuối câu cần điền Dấu chấm hỏi (?).',
      },
      {
        id: 'tv9-q9',
        number: 9,
        categoryBadge: 'Mẫu câu Ai là gì?',
        prompt: 'Câu 9: Câu nào dưới đây là Mẫu câu Ai là gì ? (Câu giới thiệu)',
        options: [
          { label: 'A', text: 'Mun là chú mèo bắt chuột giỏi nhất nhà em.' },
          { label: 'B', text: 'Chú mèo Mun đang nằm sưởi nắng.' },
          { label: 'C', text: 'Đôi mắt chú mèo tròn xoe.' },
        ],
        correctLabel: 'A',
        explanation:
          'Câu A có từ “là” dùng để giới thiệu về chú mèo Mun, thuộc mẫu câu Ai là gì?.',
      },
      {
        id: 'tv9-q10',
        number: 10,
        categoryBadge: 'Mẫu câu Ai làm gì?',
        prompt: 'Câu 10: Câu nào dưới đây là Mẫu câu Ai làm gì ? (Câu nêu hoạt động)',
        options: [
          { label: 'A', text: 'Chú mèo vểnh tai nghe ngóng tiếng động.' },
          { label: 'B', text: 'Bốn bàn chân mèo rất hồng hào.' },
          { label: 'C', text: 'Mèo Mun là món quà sinh nhật của dì Lan.' },
        ],
        correctLabel: 'A',
        explanation:
          '“Chú mèo vểnh tai nghe ngóng tiếng động.” nêu hoạt động của chú mèo nên thuộc mẫu câu Ai làm gì?.',
      },
    ],
  },

  // ================= ĐỀ 10 =================
  {
    id: 'ngay-chu-nhat-cua-em',
    shortTitle: 'Đề 10: Ngày Chủ Nhật Của Em',
    badgeLabel: 'Đề Ôn Tập Số 10 (Đọc hiểu & Luyện từ câu)',
    readingTitle: 'NGÀY CHỦ NHẬT CỦA EM',
    author: 'Theo Minh Châu',
    paragraphs: [
      'Sáng Chủ nhật, được nghỉ học nhưng em vẫn thức dậy thật sớm. Em gấp chăn màn gọn gàng rồi ra sân tập thể dục cùng bố trong bầu không khí trong lành.',
      'Sau bữa ăn sáng, em phụ mẹ quét nhà và nhặt rau chuẩn bị cho bữa trưa. Bố thì cầm bình tưới nước cho những chậu hoa hồng đỏ thắm ngoài ban công. Nhìn ngôi nhà sạch bóng, mẹ khen em nay đã lớn và biết giúp đỡ bố mẹ.',
      'Buổi chiều, cả nhà em quây quần bên nhau trong phòng khách. Bố đọc báo, mẹ gọt táo chín, còn em đọc truyện thiếu nhi. Ngày Chủ nhật bên gia đình thật đầm ấm và hạnh phúc.',
    ],
    notes: [
      {
        term: 'Trong lành',
        definition: 'không khí sạch sẽ, mát mẻ, dễ chịu, không có khói bụi.',
      },
      {
        term: 'Quây quần',
        definition: 'tụ họp lại đông đủ, gần gũi và thân mật bên nhau.',
      },
    ],
    questions: [
      {
        id: 'tv10-q1',
        number: 1,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '1. Sáng Chủ nhật, sau khi gấp chăn màn gọn gàng, bạn nhỏ làm gì cùng bố?',
        options: [
          { label: 'A', text: 'Đi siêu thị mua thức ăn.' },
          { label: 'B', text: 'Ra sân tập thể dục cùng bố.' },
          { label: 'C', text: 'Xem chương trình hoạt hình.' },
        ],
        correctLabel: 'B',
        explanation:
          'Trong đoạn 1 có viết: “Em gấp chăn màn gọn gàng rồi ra sân tập thể dục cùng bố trong bầu không khí trong lành.”',
      },
      {
        id: 'tv10-q2',
        number: 2,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '2. Những chậu hoa hồng ngoài ban công có màu gì?',
        options: [
          { label: 'A', text: 'màu trắng tinh' },
          { label: 'B', text: 'màu vàng nhạt' },
          { label: 'C', text: 'màu đỏ thắm' },
        ],
        correctLabel: 'C',
        explanation:
          'Đoạn 2 có câu: “Bố thì cầm bình tưới nước cho những chậu hoa hồng đỏ thắm ngoài ban công.”',
      },
      {
        id: 'tv10-q3',
        number: 3,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '3. Sau bữa ăn sáng, bạn nhỏ đã phụ mẹ làm những công việc gì?',
        options: [
          { label: 'A', text: 'Quét nhà và nhặt rau chuẩn bị cho bữa trưa.' },
          { label: 'B', text: 'Sửa quạt điện và đóng bàn ghế.' },
          { label: 'C', text: 'Đi chợ mua cá và thịt.' },
        ],
        correctLabel: 'A',
        explanation:
          'Ở đoạn 2 có câu: “Sau bữa ăn sáng, em phụ mẹ quét nhà và nhặt rau chuẩn bị cho bữa trưa.”',
      },
      {
        id: 'tv10-q4',
        number: 4,
        categoryBadge: 'Đọc hiểu văn bản',
        prompt: '4. Qua bài đọc, theo em, không khí gia đình bạn nhỏ vào ngày Chủ nhật như thế nào?',
        options: [
          { label: 'A', text: 'Ai cũng bận rộn đi vắng cả ngày.' },
          { label: 'B', text: 'Thật đầm ấm, yêu thương và hạnh phúc.' },
          { label: 'C', text: 'Buồn tẻ và im lặng.' },
        ],
        correctLabel: 'B',
        explanation:
          'Câu cuối bài nêu rõ: “Ngày Chủ nhật bên gia đình thật đầm ấm và hạnh phúc.”',
      },
      {
        id: 'tv10-q5',
        number: 5,
        categoryBadge: 'Từ chỉ hoạt động',
        prompt: '5. Tìm từ chỉ hoạt động trong câu sau:',
        quoteText:
          'Bố đọc báo, mẹ gọt táo chín, còn em đọc truyện thiếu nhi.',
        options: [
          { label: 'A', text: 'bố, mẹ, báo, táo' },
          { label: 'B', text: 'đọc báo, gọt táo, đọc truyện' },
          { label: 'C', text: 'chín, đầm ấm, hạnh phúc' },
        ],
        correctLabel: 'B',
        explanation:
          '“đọc báo, gọt táo, đọc truyện” là các từ ngữ chỉ hoạt động của bố, mẹ và em.',
      },
      {
        id: 'tv10-q6',
        number: 6,
        categoryBadge: 'Từ chỉ đặc điểm',
        prompt: 'Câu 6: Tìm từ chỉ đặc điểm trong câu: “Ngôi nhà của em rất sạch bóng”:',
        options: [
          { label: 'A', text: 'Ngôi nhà' },
          { label: 'B', text: 'của em' },
          { label: 'C', text: 'sạch bóng' },
        ],
        correctLabel: 'C',
        explanation:
          '“sạch bóng” là từ chỉ đặc điểm của ngôi nhà sau khi được quét dọn.',
      },
      {
        id: 'tv10-q7',
        number: 7,
        categoryBadge: 'Từ chỉ sự vật',
        prompt: 'Câu 7: Tìm từ chỉ sự vật:',
        options: [
          { label: 'A', text: 'chậu hoa hồng.' },
          { label: 'B', text: 'quét nhà.' },
          { label: 'C', text: 'trong lành.' },
        ],
        correctLabel: 'A',
        explanation:
          '“chậu hoa hồng” là từ chỉ sự vật (đồ vật/cây cối). Còn “quét nhà” là từ chỉ hoạt động, “trong lành” là từ chỉ đặc điểm.',
      },
      {
        id: 'tv10-q8',
        number: 8,
        categoryBadge: 'Dấu câu',
        prompt: 'Câu 8: Chọn dấu câu thích hợp điền vào chỗ chấm trong câu sau:',
        quoteText: '“Ngày Chủ nhật được nghỉ học, em thường giúp bố mẹ việc gì …..”',
        options: [
          { label: 'A', text: 'Dấu chấm (.)' },
          { label: 'B', text: 'Dấu chấm than (!)' },
          { label: 'C', text: 'Dấu chấm hỏi (?)' },
        ],
        correctLabel: 'C',
        explanation:
          'Đây là câu dùng để hỏi nên cuối câu cần đặt Dấu chấm hỏi (?).',
      },
      {
        id: 'tv10-q9',
        number: 9,
        categoryBadge: 'Mẫu câu Ai là gì?',
        prompt: 'Câu 9: Câu nào dưới đây là Mẫu câu Ai là gì ? (Câu giới thiệu)',
        options: [
          { label: 'A', text: 'Em là người con chăm ngoan của bố mẹ.' },
          { label: 'B', text: 'Em phụ mẹ quét nhà và nhặt rau.' },
          { label: 'C', text: 'Những bông hoa hồng nở đỏ thắm.' },
        ],
        correctLabel: 'A',
        explanation:
          '“Em là người con chăm ngoan của bố mẹ.” có từ “là” dùng để giới thiệu, thuộc mẫu câu Ai là gì?.',
      },
      {
        id: 'tv10-q10',
        number: 10,
        categoryBadge: 'Mẫu câu Ai làm gì?',
        prompt: 'Câu 10: Câu nào dưới đây là Mẫu câu Ai làm gì ? (Câu nêu hoạt động)',
        options: [
          { label: 'A', text: 'Bố tưới nước cho những chậu hoa ngoài ban công.' },
          { label: 'B', text: 'Không khí buổi sáng thật trong lành.' },
          { label: 'C', text: 'Chủ nhật là ngày nghỉ cuối tuần của cả nhà.' },
        ],
        correctLabel: 'A',
        explanation:
          '“Bố tưới nước cho những chậu hoa ngoài ban công.” nêu hoạt động “tưới nước” của bố nên thuộc mẫu câu Ai làm gì?.',
      },
    ],
  },
];

export const TiengVietSection: React.FC<TiengVietSectionProps> = ({ onEarnStar }) => {
  const { closeKeypad } = useVirtualKeypad();
  const [selectedWorksheetId, setSelectedWorksheetId] = useState<string>(
    TIENG_VIET_WORKSHEETS[0].id
  );
  // Display mode: 'all-in-one' (giống tờ phiếu bài tập thật) or 'step-by-step' (từng câu 1 -> 10)
  const [viewMode, setViewMode] = useState<'all-in-one' | 'step-by-step'>('all-in-one');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // Keep answers per worksheet ID so the student can track progress across all 10 worksheets
  const [answersByWorksheet, setAnswersByWorksheet] = useState<
    Record<string, Record<string, 'A' | 'B' | 'C'>>
  >({});
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(false);
  const [showOriginalPdfModal, setShowOriginalPdfModal] = useState<boolean>(false);

  // Close virtual math keypad when in Vietnamese section
  useEffect(() => {
    closeKeypad();
  }, [closeKeypad]);

  const currentWorksheet =
    TIENG_VIET_WORKSHEETS.find((w) => w.id === selectedWorksheetId) ||
    TIENG_VIET_WORKSHEETS[0];
  const currentWorksheetIndex = TIENG_VIET_WORKSHEETS.findIndex(
    (w) => w.id === currentWorksheet.id
  );
  const questions = currentWorksheet.questions;
  const userAnswers = answersByWorksheet[currentWorksheet.id] || {};

  const answeredCount = questions.filter((q) => userAnswers[q.id] !== undefined).length;
  const correctCount = questions.reduce(
    (sum, q) => sum + (userAnswers[q.id] === q.correctLabel ? 1 : 0),
    0
  );
  const isAllCompleted = answeredCount === questions.length;

  const handleSelectWorksheet = (worksheetId: string) => {
    sound.playClick();
    setSelectedWorksheetId(worksheetId);
    setCurrentIndex(0);
    setShowAnswerKey(false);
  };

  const handlePickRandomWorksheet = () => {
    sound.playClick();
    const otherWorksheets = TIENG_VIET_WORKSHEETS.filter(
      (w) => w.id !== currentWorksheet.id
    );
    const randomPick =
      otherWorksheets[Math.floor(Math.random() * otherWorksheets.length)] ||
      TIENG_VIET_WORKSHEETS[0];
    setSelectedWorksheetId(randomPick.id);
    setCurrentIndex(0);
    setShowAnswerKey(false);
  };

  const handleResetCurrentWorksheet = () => {
    sound.playClick();
    setCurrentIndex(0);
    setAnswersByWorksheet((prev) => ({
      ...prev,
      [currentWorksheet.id]: {},
    }));
    setShowAnswerKey(false);
  };

  const handleChooseOption = (question: TiengVietQuestion, label: 'A' | 'B' | 'C') => {
    // Only allow answering each question once per attempt so stars are awarded fairly (+1 star per correct answer)
    if (userAnswers[question.id] !== undefined) return;

    const nextAnswers = { ...userAnswers, [question.id]: label };
    setAnswersByWorksheet((prev) => ({
      ...prev,
      [currentWorksheet.id]: nextAnswers,
    }));

    const isCorrect = label === question.correctLabel;
    if (isCorrect) {
      sound.playClick();
      sound.playCorrect();
      onEarnStar();
    } else {
      sound.playClick();
      sound.playIncorrect();
    }

    // Check if this was the final question of the worksheet
    const totalAnsweredAfter = questions.filter(
      (q) => nextAnswers[q.id] !== undefined
    ).length;
    if (totalAnsweredAfter === questions.length) {
      const finalScore = questions.reduce(
        (sum, q) => sum + (nextAnswers[q.id] === q.correctLabel ? 1 : 0),
        0
      );
      if (finalScore >= 8) {
        sound.playVictory();
        try {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
      }
    }
  };

  const currentStepQuestion = questions[currentIndex];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Top Banner & Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-amber-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
              <BookOpenText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  Kho 10 Đề Ôn Tập Tiếng Việt Lớp 2 – Đọc Hiểu & Luyện Từ Câu
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Đúng 1 câu = +1 ★
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-0.5">
                Gồm 10 bài đọc hiểu lớp 2 kèm 10 câu hỏi đúng cấu trúc phiếu ôn tập (4 câu đọc hiểu + 6 câu từ và câu).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {currentWorksheet.id === 'nhung-ngay-giap-tet' && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowOriginalPdfModal(true);
                }}
                className="min-h-[42px] px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-sm flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <FileText className="w-4 h-4 text-indigo-700" />
                <span>Xem phiếu gốc</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePickRandomWorksheet}
              className="min-h-[42px] px-3.5 py-2 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-transform"
            >
              <Shuffle className="w-4 h-4" />
              <span>Đổi đề ngẫu nhiên</span>
            </button>

            <button
              type="button"
              onClick={handleResetCurrentWorksheet}
              className="min-h-[42px] px-3.5 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-sm rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-transform"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm lại đề này</span>
            </button>
          </div>
        </div>

        {/* 10 WORKSHEETS SELECTOR GRID */}
        <div className="pt-3 border-t border-amber-100 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-extrabold text-slate-800">
              📚 Chọn đề bài đọc Tiếng Việt Lớp 2 ({currentWorksheetIndex + 1}/
              {TIENG_VIET_WORKSHEETS.length}):
            </span>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setViewMode('all-in-one');
                }}
                className={`min-h-[34px] px-3 py-1 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  viewMode === 'all-in-one'
                    ? 'bg-white text-amber-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListChecks className="w-4 h-4" />
                <span>Cả phiếu (10 câu)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setViewMode('step-by-step');
                }}
                className={`min-h-[34px] px-3 py-1 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  viewMode === 'step-by-step'
                    ? 'bg-white text-amber-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookMarked className="w-4 h-4" />
                <span>Từng câu một</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {TIENG_VIET_WORKSHEETS.map((ws) => {
              const isSelected = ws.id === currentWorksheet.id;
              const wsAnswers = answersByWorksheet[ws.id] || {};
              const wsAnsweredCount = ws.questions.filter(
                (q) => wsAnswers[q.id] !== undefined
              ).length;
              const wsCorrectCount = ws.questions.reduce(
                (sum, q) => sum + (wsAnswers[q.id] === q.correctLabel ? 1 : 0),
                0
              );
              const isDone = wsAnsweredCount === ws.questions.length;

              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => handleSelectWorksheet(ws.id)}
                  className={`min-h-[54px] px-3 py-2 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                      : isDone
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300'
                        : 'bg-rose-50/60 hover:bg-rose-100/80 text-slate-900 border-rose-200/80'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-extrabold leading-tight line-clamp-2">
                    {ws.shortTitle}
                  </span>
                  <div className="flex items-center justify-between gap-1 mt-1">
                    <span
                      className={`text-[11px] font-bold ${
                        isSelected
                          ? 'text-rose-100'
                          : isDone
                            ? 'text-emerald-700'
                            : 'text-slate-500'
                      }`}
                    >
                      {ws.author}
                    </span>
                    {wsAnsweredCount > 0 && (
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-white/25 text-white'
                            : 'bg-emerald-200/80 text-emerald-900'
                        }`}
                      >
                        {wsCorrectCount}/{ws.questions.length}★
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress & Score Bar */}
      <div className="bg-white px-4 py-3 rounded-2xl border border-amber-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3 py-1 rounded-xl bg-rose-100 border border-rose-300 text-rose-950 font-black text-sm">
            {currentWorksheet.shortTitle}
          </span>
          <span className="px-3 py-1 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 font-black text-sm">
            Đã làm: {answeredCount}/{questions.length} câu
          </span>
          <span className="px-3 py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 font-black text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Đúng: {correctCount} câu (+{correctCount} ★)
          </span>
        </div>

        <div className="flex-1 min-w-[160px] max-w-xs h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 transition-all duration-300 rounded-full"
          />
        </div>
      </div>

      {/* READING PASSAGE CARD ("ĐỌC HIỂU") */}
      <div className="bg-gradient-to-b from-amber-50/90 via-white to-orange-50/40 rounded-3xl border-2 border-amber-300/90 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-rose-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider">
              ĐỌC HIỂU
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-900">
              {currentWorksheet.badgeLabel}
            </span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-600">
            📖 Bé hãy đọc kỹ bài văn dưới đây trước khi trả lời câu hỏi nhé!
          </span>
        </div>

        <div className="text-center pt-1">
          <h3 className="text-xl sm:text-2xl font-black text-rose-950 tracking-wide uppercase">
            {currentWorksheet.readingTitle}
          </h3>
        </div>

        {/* Reading Text Paragraphs */}
        <div className="space-y-3.5 text-slate-900 text-base sm:text-lg leading-relaxed font-medium bg-white/90 p-4 sm:p-6 rounded-2xl border border-amber-200/80 shadow-2xs">
          {currentWorksheet.paragraphs.map((para, index) => (
            <p key={index} className="indent-6 sm:indent-8 text-justify">
              {para}
            </p>
          ))}
          <p className="text-right font-black italic text-slate-800 pt-1 pr-2">
            {currentWorksheet.author}
          </p>
        </div>

        {/* Vocabulary Notes (Chú giải từ khó) */}
        {currentWorksheet.notes.length > 0 && (
          <div className="bg-amber-100/60 border border-amber-300/90 rounded-2xl p-4 space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-amber-900">
              📌 Giải nghĩa từ khó trong bài:
            </div>
            {currentWorksheet.notes.map((note, idx) => (
              <p key={idx} className="text-sm sm:text-base text-slate-800 leading-relaxed">
                <strong className="italic font-black text-amber-950">{note.term}:</strong>{' '}
                <span className="italic">{note.definition}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* INSTRUCTIONS HEADER */}
      <div className="bg-indigo-950 text-white px-5 py-3.5 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-2">
        <p className="font-extrabold text-sm sm:text-base italic">
          ✍️ Dựa vào bài đọc, khoanh vào đáp án đúng nhất hoặc làm theo yêu cầu:
        </p>
        <span className="text-xs sm:text-sm text-amber-300 font-bold">
          Chạm vào đáp án A, B hoặc C để chọn
        </span>
      </div>

      {/* QUESTIONS AREA */}
      {viewMode === 'all-in-one' ? (
        /* ALL 10 QUESTIONS IN ONE WORKSHEET VIEW */
        <div className="space-y-4">
          {questions.map((q) => {
            const picked = userAnswers[q.id];
            const isAnswered = picked !== undefined;
            const isCorrect = isAnswered && picked === q.correctLabel;
            const correctOption = q.options.find((o) => o.label === q.correctLabel);

            return (
              <div
                key={q.id}
                className={`bg-white p-4 sm:p-6 rounded-3xl border-2 transition-all shadow-xs space-y-4 ${
                  !isAnswered
                    ? 'border-amber-200/90'
                    : isCorrect
                      ? 'border-emerald-400 bg-emerald-50/15'
                      : 'border-rose-300 bg-rose-50/15'
                }`}
              >
                {/* Question Header */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                      {q.categoryBadge}
                    </span>
                    {isAnswered && (
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {isCorrect ? '✓ Đúng (+1 ★)' : `✕ Đáp án đúng: ${q.correctLabel}`}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {q.prompt}
                  </h4>

                  {q.quoteText && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-slate-900 italic font-semibold text-base sm:text-lg">
                      {q.quoteText}
                    </div>
                  )}
                </div>

                {/* Options A, B, C */}
                <div className="grid grid-cols-1 gap-2.5">
                  {q.options.map((opt) => {
                    const isThisPicked = picked === opt.label;
                    const isThisCorrect = opt.label === q.correctLabel;

                    let btnClass =
                      'bg-slate-50 hover:bg-amber-50/80 border-slate-200 hover:border-amber-300 text-slate-900';
                    let circleClass =
                      'bg-amber-100 text-amber-950 border-amber-300';

                    if (isAnswered) {
                      if (isThisCorrect) {
                        btnClass =
                          'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400/70 shadow-2xs';
                        circleClass =
                          'bg-emerald-600 text-white border-emerald-700';
                      } else if (isThisPicked) {
                        btnClass = 'bg-rose-50 border-rose-400 text-rose-950';
                        circleClass = 'bg-rose-600 text-white border-rose-700';
                      } else {
                        btnClass =
                          'bg-slate-50 border-slate-200 text-slate-400 opacity-70';
                        circleClass =
                          'bg-slate-200 text-slate-500 border-slate-300';
                      }
                    }

                    return (
                      <button
                        key={opt.label}
                        type="button"
                        disabled={isAnswered}
                        onClick={() => handleChooseOption(q, opt.label)}
                        className={`min-h-[52px] px-4 py-3 rounded-2xl border-2 text-left flex items-center justify-between gap-3 transition-all cursor-pointer select-none ${btnClass}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-9 h-9 rounded-full border-2 font-black text-base flex items-center justify-center shrink-0 ${circleClass}`}
                          >
                            {opt.label}
                          </span>
                          <span className="text-base sm:text-lg font-bold break-words">
                            {opt.text}
                          </span>
                        </div>

                        {isAnswered && isThisCorrect && (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                        )}
                        {isAnswered && isThisPicked && !isThisCorrect && (
                          <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {isAnswered && (
                  <div
                    className={`p-3.5 rounded-2xl border text-sm sm:text-base flex items-start gap-2.5 animate-pop ${
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
                    <div className="space-y-1">
                      <div className="font-black">
                        {isCorrect
                          ? 'Chính xác! Bé được cộng +1 ★'
                          : `Chưa đúng rồi! Đáp án đúng là ${q.correctLabel}. ${correctOption?.text || ''}`}
                      </div>
                      <p className="text-slate-700 font-medium">
                        💡 <strong>Giải thích:</strong> {q.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* STEP-BY-STEP QUESTION VIEW */
        currentStepQuestion && (
          <div className="bg-white p-5 sm:p-7 rounded-3xl border-2 border-amber-200/90 shadow-xs space-y-5">
            {/* Step Navigation Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-100">
              <div className="flex flex-wrap items-center gap-1.5">
                {questions.map((q, idx) => {
                  const ans = userAnswers[q.id];
                  const isCurrent = idx === currentIndex;
                  let pillStyle =
                    'bg-slate-100 text-slate-700 border-slate-200 hover:bg-amber-50';
                  if (ans !== undefined) {
                    pillStyle =
                      ans === q.correctLabel
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : 'bg-rose-500 text-white border-rose-600';
                  }
                  if (isCurrent) {
                    pillStyle += ' ring-2 ring-amber-500 scale-105';
                  }
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setCurrentIndex(idx);
                      }}
                      className={`w-9 h-9 rounded-xl border font-black text-sm flex items-center justify-center cursor-pointer transition-all ${pillStyle}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <span className="text-xs font-extrabold text-amber-900 bg-amber-100 px-3 py-1 rounded-lg border border-amber-300">
                {currentStepQuestion.categoryBadge}
              </span>
            </div>

            {/* Active Question Content */}
            <div className="space-y-3">
              <h4 className="text-lg sm:text-xl font-black text-slate-900">
                {currentStepQuestion.prompt}
              </h4>
              {currentStepQuestion.quoteText && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-slate-900 italic font-semibold text-base sm:text-lg">
                  {currentStepQuestion.quoteText}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {currentStepQuestion.options.map((opt) => {
                const picked = userAnswers[currentStepQuestion.id];
                const isAnswered = picked !== undefined;
                const isThisPicked = picked === opt.label;
                const isThisCorrect = opt.label === currentStepQuestion.correctLabel;

                let btnClass =
                  'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-900';
                let circleClass =
                  'bg-amber-100 text-amber-950 border-amber-300';

                if (isAnswered) {
                  if (isThisCorrect) {
                    btnClass =
                      'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400';
                    circleClass =
                      'bg-emerald-600 text-white border-emerald-700';
                  } else if (isThisPicked) {
                    btnClass = 'bg-rose-50 border-rose-400 text-rose-950';
                    circleClass = 'bg-rose-600 text-white border-rose-700';
                  } else {
                    btnClass = 'bg-slate-50 border-slate-200 text-slate-400 opacity-70';
                    circleClass = 'bg-slate-200 text-slate-500 border-slate-300';
                  }
                }

                return (
                  <button
                    key={opt.label}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleChooseOption(currentStepQuestion, opt.label)}
                    className={`min-h-[56px] p-4 rounded-2xl border-2 text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${btnClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-9 h-9 rounded-full border-2 font-black text-base flex items-center justify-center shrink-0 ${circleClass}`}
                      >
                        {opt.label}
                      </span>
                      <span className="text-base sm:text-lg font-bold">
                        {opt.text}
                      </span>
                    </div>
                    {isAnswered && isThisCorrect && (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    )}
                    {isAnswered && isThisPicked && !isThisCorrect && (
                      <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Step Feedback */}
            {userAnswers[currentStepQuestion.id] !== undefined && (
              <div
                className={`p-4 rounded-2xl border-2 space-y-2 animate-pop ${
                  userAnswers[currentStepQuestion.id] ===
                  currentStepQuestion.correctLabel
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="font-black text-base">
                  {userAnswers[currentStepQuestion.id] ===
                  currentStepQuestion.correctLabel
                    ? 'Chính xác! Bé giỏi lắm! +1 ★'
                    : `Chưa đúng rồi! Đáp án đúng là ${currentStepQuestion.correctLabel}.`}
                </div>
                <p className="text-sm sm:text-base text-slate-800 font-medium">
                  💡 <strong>Giải thích:</strong> {currentStepQuestion.explanation}
                </p>
              </div>
            )}

            {/* Prev / Next Question Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-amber-100">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => {
                  sound.playClick();
                  setCurrentIndex((prev) => Math.max(0, prev - 1));
                }}
                className={`min-h-[44px] px-4 py-2 rounded-xl border font-bold text-sm flex items-center gap-1.5 ${
                  currentIndex === 0
                    ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                    : 'bg-white hover:bg-amber-50 text-slate-800 border-amber-300 cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Câu trước</span>
              </button>

              <button
                type="button"
                disabled={currentIndex === questions.length - 1}
                onClick={() => {
                  sound.playClick();
                  setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
                }}
                className={`min-h-[44px] px-5 py-2 rounded-xl font-black text-sm flex items-center gap-1.5 ${
                  currentIndex === questions.length - 1
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer'
                }`}
              >
                <span>Câu tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      )}

      {/* COMPLETION CELEBRATION BANNER WHEN ALL 10 QUESTIONS ARE ANSWERED */}
      {isAllCompleted && (
        <div className="bg-gradient-to-r from-amber-100 via-yellow-50 to-emerald-100 p-6 rounded-3xl border-2 border-amber-400 shadow-md text-center space-y-4 animate-pop">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white border-2 border-amber-300 flex items-center justify-center text-3xl shadow-xs">
            {correctCount >= 8 ? '🏆' : correctCount >= 5 ? '🌟' : '💪'}
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900">
              Hoàn thành {currentWorksheet.shortTitle}: {correctCount}/{questions.length} câu đúng!
            </h3>
            <p className="text-base font-bold text-emerald-800">
              Bé đã nhận được tổng cộng +{correctCount} ★ từ bài tập này!
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleResetCurrentWorksheet}
              className="min-h-[48px] px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-2xl shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Làm lại đề này</span>
            </button>
            {TIENG_VIET_WORKSHEETS.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  const nextIdx =
                    (currentWorksheetIndex + 1) % TIENG_VIET_WORKSHEETS.length;
                  handleSelectWorksheet(TIENG_VIET_WORKSHEETS[nextIdx].id);
                }}
                className="min-h-[48px] px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base rounded-2xl shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Trophy className="w-5 h-5 text-amber-300" />
                <span>Chuyển sang đề tiếp theo</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* PARENT ANSWER KEY COLLAPSIBLE */}
      <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-slate-700">
            Bảng đáp án & giải thích chi tiết 10 câu (Dành cho phụ huynh đối chiếu)
          </span>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setShowAnswerKey((prev) => !prev);
            }}
            className="min-h-[44px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {showAnswerKey ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Ẩn đáp án</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Xem đáp án</span>
              </>
            )}
          </button>
        </div>

        {showAnswerKey && (
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            {questions.map((q) => {
              const rightOpt = q.options.find((o) => o.label === q.correctLabel);
              return (
                <div
                  key={q.id}
                  className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/70 text-sm space-y-1"
                >
                  <div className="font-bold text-slate-900">{q.prompt}</div>
                  <div className="text-emerald-800 font-extrabold">
                    ➔ Đáp án đúng: {q.correctLabel}. {rightOpt?.text}
                  </div>
                  <div className="text-slate-600">Giải thích: {q.explanation}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* IN-APP MODAL TO VIEW THE ORIGINAL PDF FILE */}
      {showOriginalPdfModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white w-full max-w-4xl h-[88vh] rounded-3xl border-2 border-amber-300 shadow-2xl flex flex-col overflow-hidden animate-pop">
            <div className="px-5 py-3.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-base sm:text-lg text-slate-900">
                  Phiếu Bài Tập Gốc: Ôn Tập Tiếng Việt Tuần 8 – Những Ngày Giáp Tết
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOriginalPdfModal(false)}
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-sm flex items-center gap-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Đóng</span>
              </button>
            </div>
            <div className="flex-1 bg-slate-100">
              <iframe
                src="/assets/aistudio/ON_TAP_TVt8_c01e7739.pdf"
                title="Phiếu Ôn Tập Tiếng Việt Tuần 8"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
