import { TachGopQuestion, TachSoCongQuaMuoiQuestion, CongTruQuestion, LienTruocSauQuestion, SoSanhQuestion, Badge } from '../types/math';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate "Tách số để cộng qua 10 / làm tròn 10"
 * Đảm bảo cả 2 số đều DƯỚI 10 (từ 2 đến 9, không vượt quá 10)
 * Hỗ trợ chọn số cao nhất cho 2 số (maxNum, mặc định là 9)
 * Hoặc chọn bảng cộng cụ thể (9+, 8+, 7+, 6+)
 */
export function generateTachSoCongQuaMuoiQuestion(options?: {
  maxNum?: number;
  table?: 'all' | 9 | 8 | 7 | 6;
}): TachSoCongQuaMuoiQuestion {
  const maxLimit = Math.max(7, Math.min(9, options?.maxNum ?? 9));
  const table = options?.table ?? 'all';

  // Available first numbers (must be >= 6 so that 10 - num1 < maxLimit)
  let candidateNum1s = [9, 8, 7, 6].filter((n) => n <= maxLimit);
  if (candidateNum1s.length === 0) candidateNum1s = [maxLimit];

  let num1: number;
  if (table !== 'all' && candidateNum1s.includes(table)) {
    num1 = table;
  } else {
    num1 = candidateNum1s[getRandomInt(0, candidateNum1s.length - 1)];
  }

  // split1 is the amount needed to reach 10: num1 + split1 = 10
  const split1 = 10 - num1;
  const roundTen = 10;

  // num2 must be at least split1 + 1 so split2 >= 1, and at most maxLimit (under 10)
  const minNum2 = split1 + 1;
  const maxNum2 = maxLimit;
  const num2 = getRandomInt(minNum2, Math.max(minNum2, maxNum2));

  const split2 = num2 - split1;
  const finalResult = num1 + num2;

  const hintText = `Vì ${num1} + ${split1} = 10 nên ta tách ${num2} thành ${split1} và ${split2}. Lấy ${num1} + ${split1} = 10, rồi lấy 10 + ${split2} = ${finalResult}.`;

  return {
    id: `ts-cqm-${Date.now()}-${Math.random()}`,
    num1,
    num2,
    split1,
    split2,
    roundTen,
    finalResult,
    hintText,
  };
}

/**
 * Generate Number Bonds (Tách - Gộp số)
 * Types:
 * - within 10 & 20: 7 = 3 + 4, 15 = 8 + 7
 * - tens & units: 54 = 50 + 4, 82 = 80 + 2
 * - round tens within 100: 80 = 50 + 30, 100 = 60 + 40
 */
export function generateTachGopQuestion(mode: 'mixed' | 'basic' | 'tens' = 'mixed'): TachGopQuestion {
  const missingOptions: ('total' | 'partA' | 'partB')[] = ['total', 'partA', 'partB'];
  const missingField = missingOptions[getRandomInt(0, 2)];
  const themes: ('apples' | 'stars' | 'dots' | 'blocks')[] = ['apples', 'stars', 'dots', 'blocks'];
  const theme = themes[getRandomInt(0, themes.length - 1)];

  let total: number;
  let partA: number;
  let partB: number;
  let hint = '';

  const chosenMode = mode === 'mixed' ? (Math.random() < 0.4 ? 'tens' : 'basic') : mode;

  if (chosenMode === 'tens') {
    // 60% tens & units decomposition (e.g., 47 gồm 40 và 7)
    // 40% round tens (e.g., 70 gồm 30 và 40)
    if (Math.random() < 0.6) {
      const tens = getRandomInt(2, 9) * 10;
      const units = getRandomInt(1, 9);
      total = tens + units;
      partA = tens;
      partB = units;
      hint = `${total} gồm ${tens} (chục) và ${units} (đơn vị).`;
    } else {
      partA = getRandomInt(1, 8) * 10;
      partB = getRandomInt(1, 10 - partA / 10) * 10;
      total = partA + partB;
      hint = `Gộp ${partA} và ${partB} được ${total}.`;
    }
  } else {
    // Basic numbers within 10 or 20
    if (Math.random() < 0.5) {
      // within 10
      total = getRandomInt(5, 10);
      partA = getRandomInt(1, total - 1);
      partB = total - partA;
      hint = `Số ${total} được tách thành ${partA} và ${partB}.`;
    } else {
      // within 20 (crucial for Grade 2 regrouping foundation: 8+7=15, 9+6=15, 6+8=14)
      total = getRandomInt(11, 18);
      partA = getRandomInt(Math.max(2, total - 9), Math.min(9, total - 2));
      partB = total - partA;
      hint = `Gộp ${partA} và ${partB} tạo thành ${total}.`;
    }
  }

  return {
    id: `tg-${Date.now()}-${Math.random()}`,
    total,
    partA,
    partB,
    missingField,
    theme,
    hint,
  };
}

export type CongTruRange = 'within20' | 'within50' | 'within100' | 'twoDigitPlusOne';

/**
 * Generate Addition and Subtraction with Regrouping (Cộng trừ có nhớ)
 * Hỗ trợ chọn khoảng số:
 * - within20: Phạm vi 20 (cộng trừ qua 10)
 * - within50: Phạm vi 50
 * - within100: Phạm vi 100
 * - twoDigitPlusOne: Số có 2 chữ số với số có 1 chữ số
 */
export function generateCongTruQuestion(options?: {
  operation?: '+' | '-';
  range?: CongTruRange;
} | '+' | '-'): CongTruQuestion {
  const op = typeof options === 'string'
    ? options
    : options?.operation || (Math.random() < 0.5 ? '+' : '-');
  const range = typeof options === 'object' && options?.range ? options.range : 'within100';

  if (op === '+') {
    let tens1: number;
    let unit1: number;
    let tens2: number;
    let unit2: number;

    if (range === 'within20') {
      tens1 = 0;
      unit1 = getRandomInt(6, 9);
      tens2 = 0;
      unit2 = getRandomInt(10 - unit1 + 1, 9);
    } else if (range === 'twoDigitPlusOne') {
      tens1 = getRandomInt(1, 8);
      unit1 = getRandomInt(4, 9);
      tens2 = 0;
      unit2 = getRandomInt(10 - unit1, 9);
    } else if (range === 'within50') {
      tens1 = getRandomInt(1, 3);
      unit1 = getRandomInt(4, 9);
      const maxTens2 = 4 - tens1 - 1;
      tens2 = getRandomInt(1, Math.max(1, maxTens2));
      unit2 = getRandomInt(10 - unit1, 9);
    } else {
      // within100
      tens1 = getRandomInt(1, 6);
      unit1 = getRandomInt(3, 9);
      const maxTens2 = 9 - tens1 - 1;
      tens2 = getRandomInt(1, Math.max(1, maxTens2));
      unit2 = getRandomInt(10 - unit1, 9);
    }

    const num1 = tens1 * 10 + unit1;
    const num2 = tens2 * 10 + unit2;
    const result = num1 + num2;

    const unitSum = unit1 + unit2;
    const unitResult = unitSum % 10;
    const tensSum = tens1 + tens2 + 1; // with carry 1

    const step1Text = `Hàng đơn vị: ${unit1} + ${unit2} = ${unitSum}. Viết ${unitResult}, nhớ 1 sang hàng chục.`;
    const step2Text = `Hàng chục: ${tens1} + ${tens2} = ${tens1 + tens2}, thêm 1 (nhớ) bằng ${tensSum}. Viết ${tensSum}.`;

    return {
      id: `add-${Date.now()}-${Math.random()}`,
      num1,
      num2,
      operation: '+',
      result,
      carryOver: true,
      borrowOver: false,
      unit1,
      tens1,
      unit2,
      tens2,
      carryValue: 1,
      step1Text,
      step2Text,
    };
  } else {
    // Subtraction with borrowing
    let tens1: number;
    let unit1: number;
    let tens2: number;
    let unit2: number;

    if (range === 'within20') {
      tens1 = 1;
      unit1 = getRandomInt(1, 5); // 11 to 15
      tens2 = 0;
      unit2 = getRandomInt(unit1 + 2, 9); // e.g. 12 - 7, 14 - 8
    } else if (range === 'twoDigitPlusOne') {
      tens1 = getRandomInt(2, 8);
      unit1 = getRandomInt(0, 5);
      tens2 = 0;
      unit2 = getRandomInt(unit1 + 2, 9); // e.g. 42 - 7, 51 - 6
    } else if (range === 'within50') {
      tens1 = getRandomInt(3, 4);
      unit1 = getRandomInt(0, 6);
      tens2 = getRandomInt(1, tens1 - 1);
      unit2 = getRandomInt(unit1 + 1, 9);
    } else {
      // within100
      tens1 = getRandomInt(3, 9);
      unit1 = getRandomInt(0, 7);
      tens2 = getRandomInt(1, tens1 - 1);
      unit2 = getRandomInt(unit1 + 1, 9);
    }

    const num1 = tens1 * 10 + unit1;
    const num2 = tens2 * 10 + unit2;
    const result = num1 - num2;

    const borrowUnit = 10 + unit1;
    const unitDiff = borrowUnit - unit2;
    const tensSub = tens1 - (tens2 + 1);

    const step1Text = `Hàng đơn vị: ${unit1} không trừ được ${unit2}, mượn 1 chục (${borrowUnit} - ${unit2} = ${unitDiff}). Viết ${unitDiff}, nhớ 1 sang hàng chục.`;
    const step2Text = `Hàng chục: ${tens2} thêm 1 (nhớ) bằng ${tens2 + 1}; lấy ${tens1} - ${tens2 + 1} = ${tensSub}. Viết ${tensSub}.`;

    return {
      id: `sub-${Date.now()}-${Math.random()}`,
      num1,
      num2,
      operation: '-',
      result,
      carryOver: false,
      borrowOver: true,
      unit1,
      tens1,
      unit2,
      tens2,
      carryValue: 1,
      step1Text,
      step2Text,
    };
  }
}

import { WordProblemQuestion } from '../types/math';

/**
 * Generate Word Problems for Grade 2 (Toán đố có lời văn lớp 2)
 * Chia thành 2 mức độ:
 * - ĐỀ CƠ BẢN:
 *    + Cho đi & Còn lại (vd: Bé có 20 viên kẹo cho bạn 5 viên hỏi còn lại bao nhiêu)
 *    + So sánh dài hơn / nhiều hơn bao nhiêu (vd: Thước dài 30cm, bút dài 20cm hỏi thước dài hơn bút bao nhiêu)
 *    + Thêm vào & Có tất cả (vd: Có 15 viên kẹo, mẹ cho thêm 5 viên...)
 * - ĐỀ NÂNG CAO:
 *    + Bài toán về nhiều hơn (Phép cộng có nhớ: Lớp có 28 nam, nữ nhiều hơn nam 7 bạn...)
 *    + Bài toán về ít hơn (Phép trừ có nhớ: Có 52 cây, ít hơn 18 cây...)
 */
export function generateWordProblemQuestion(options?: {
  difficulty?: 'basic' | 'advanced';
  category?: 'all' | 'cho-con-lai' | 'so-sanh-hon' | 'them-tat-ca' | 'nhieu-hon' | 'it-hon';
}): WordProblemQuestion {
  const difficulty = options?.difficulty || 'basic';
  const category = options?.category || 'all';

  if (difficulty === 'basic') {
    // Basic types
    const basicPool: ('cho-con-lai' | 'so-sanh-hon' | 'them-tat-ca')[] = ['cho-con-lai', 'so-sanh-hon', 'them-tat-ca'];
    const chosenType =
      category === 'cho-con-lai' || category === 'so-sanh-hon' || category === 'them-tat-ca'
        ? category
        : basicPool[getRandomInt(0, basicPool.length - 1)];

    if (chosenType === 'cho-con-lai') {
      const templates = [
        {
          name1: 'Bé An',
          name2: 'bạn Bình',
          unit: 'viên kẹo',
          genNum: () => {
            const n1 = [20, 25, 30, 18, 15, 24][getRandomInt(0, 5)];
            const n2 = [5, 6, 8, 4, 10, 7][getRandomInt(0, 5)];
            return { n1, n2: Math.min(n1 - 2, n2) };
          },
          story: (n1: number, n2: number, nA: string, nB: string) => `${nA} có ${n1} viên kẹo, cho ${nB} ${n2} viên kẹo.`,
          question: (nA: string) => `Hỏi ${nA} còn lại bao nhiêu viên kẹo?`,
          solution: (nA: string) => `${nA} còn lại số viên kẹo là:`,
        },
        {
          name1: 'Bé Mai',
          name2: 'em Nam',
          unit: 'chiếc bánh',
          genNum: () => {
            const n1 = [16, 20, 24, 18, 30][getRandomInt(0, 4)];
            const n2 = [5, 6, 4, 8, 10][getRandomInt(0, 4)];
            return { n1, n2: Math.min(n1 - 2, n2) };
          },
          story: (n1: number, n2: number, nA: string, nB: string) => `${nA} có ${n1} chiếc bánh quy, cho ${nB} ${n2} chiếc bánh quy.`,
          question: (nA: string) => `Hỏi ${nA} còn lại bao nhiêu chiếc bánh quy?`,
          solution: (nA: string) => `${nA} còn lại số chiếc bánh quy là:`,
        },
        {
          name1: 'Bạn Huy',
          name2: 'bạn Dũng',
          unit: 'viên bi',
          genNum: () => {
            const n1 = [20, 30, 25, 35, 18][getRandomInt(0, 4)];
            const n2 = [5, 10, 8, 6, 12][getRandomInt(0, 4)];
            return { n1, n2: Math.min(n1 - 2, n2) };
          },
          story: (n1: number, n2: number, nA: string, nB: string) => `${nA} có ${n1} viên bi, cho ${nB} ${n2} viên bi.`,
          question: (nA: string) => `Hỏi ${nA} còn lại bao nhiêu viên bi?`,
          solution: (nA: string) => `${nA} còn lại số viên bi là:`,
        },
        {
          name1: 'Mẹ',
          name2: 'bà ngoại',
          unit: 'quả cam',
          genNum: () => {
            const n1 = [20, 24, 28, 30, 16][getRandomInt(0, 4)];
            const n2 = [5, 6, 8, 10, 4][getRandomInt(0, 4)];
            return { n1, n2: Math.min(n1 - 2, n2) };
          },
          story: (n1: number, n2: number, nA: string, nB: string) => `${nA} mua ${n1} quả cam, ${nA.toLowerCase()} đem biếu ${nB} ${n2} quả cam.`,
          question: (nA: string) => `Hỏi ${nA.toLowerCase()} còn lại bao nhiêu quả cam?`,
          solution: (nA: string) => `${nA} còn lại số quả cam là:`,
        },
      ];
      const t = templates[getRandomInt(0, templates.length - 1)];
      const { n1: num1, n2: num2 } = t.genNum();
      const result = num1 - num2;

      return {
        id: `wp-basic-ccl-${Date.now()}-${Math.random()}`,
        difficulty: 'basic',
        type: 'cho-con-lai',
        typeTitle: 'Bài toán cho đi & còn lại (Phép trừ cơ bản)',
        storyText: t.story(num1, num2, t.name1, t.name2),
        questionText: t.question(t.name1),
        unitName: t.unit,
        num1,
        num2,
        operation: '-',
        result,
        item1Name: `Ban đầu có`,
        item1Count: num1,
        item2Name: `Đã cho đi`,
        item2Count: num2,
        solutionTitle: t.solution(t.name1),
        hint: `Muốn tìm số lượng còn lại: Lấy số lượng ban đầu (${num1}) TRỪ đi số đã cho (${num2}).`,
      };
    } else if (chosenType === 'so-sanh-hon') {
      const templates = [
        {
          item1: 'Cây thước kẻ',
          item2: 'Cây bút chì',
          unit: 'cm',
          genNum: () => {
            const n1 = [30, 25, 20, 35, 40][getRandomInt(0, 4)];
            const n2 = [20, 15, 12, 18, 10][getRandomInt(0, 4)];
            return { n1: Math.max(n1, n2 + 5), n2: Math.min(n1 - 5, n2) };
          },
          story: (n1: number, n2: number) => `Cây thước kẻ dài ${n1} cm, cây bút chì dài ${n2} cm.`,
          question: `Hỏi cây thước kẻ dài hơn cây bút chì bao nhiêu xăng-ti-mét?`,
          solution: `Cây thước kẻ dài hơn cây bút chì số xăng-ti-mét là:`,
        },
        {
          item1: 'Sợi dây đỏ',
          item2: 'Sợi dây xanh',
          unit: 'cm',
          genNum: () => {
            const n1 = [40, 50, 35, 45, 60][getRandomInt(0, 4)];
            const n2 = [20, 30, 25, 15, 30][getRandomInt(0, 4)];
            return { n1: Math.max(n1, n2 + 5), n2: Math.min(n1 - 5, n2) };
          },
          story: (n1: number, n2: number) => `Sợi dây đỏ dài ${n1} cm, sợi dây xanh dài ${n2} cm.`,
          question: `Hỏi sợi dây đỏ dài hơn sợi dây xanh bao nhiêu xăng-ti-mét?`,
          solution: `Sợi dây đỏ dài hơn sợi dây xanh số xăng-ti-mét là:`,
        },
        {
          item1: 'Bạn Bình',
          item2: 'Bạn An',
          unit: 'viên kẹo',
          genNum: () => {
            const n1 = [30, 25, 28, 20, 35][getRandomInt(0, 4)];
            const n2 = [20, 15, 18, 10, 20][getRandomInt(0, 4)];
            return { n1: Math.max(n1, n2 + 4), n2: Math.min(n1 - 4, n2) };
          },
          story: (n1: number, n2: number) => `Bạn Bình có ${n1} viên kẹo, bạn An có ${n2} viên kẹo.`,
          question: `Hỏi bạn Bình có nhiều hơn bạn An bao nhiêu viên kẹo?`,
          solution: `Bạn Bình có nhiều hơn bạn An số viên kẹo là:`,
        },
        {
          item1: 'Hàng rào',
          item2: 'Chiếc ghế',
          unit: 'cm',
          genNum: () => {
            const n1 = [80, 90, 70, 85][getRandomInt(0, 3)];
            const n2 = [50, 40, 45, 50][getRandomInt(0, 3)];
            return { n1, n2 };
          },
          story: (n1: number, n2: number) => `Hàng rào cao ${n1} cm, chiếc ghế cao ${n2} cm.`,
          question: `Hỏi hàng rào cao hơn chiếc ghế bao nhiêu xăng-ti-mét?`,
          solution: `Hàng rào cao hơn chiếc ghế số xăng-ti-mét là:`,
        },
      ];
      const t = templates[getRandomInt(0, templates.length - 1)];
      const { n1: num1, n2: num2 } = t.genNum();
      const result = num1 - num2;

      return {
        id: `wp-basic-ssh-${Date.now()}-${Math.random()}`,
        difficulty: 'basic',
        type: 'so-sanh-hon',
        typeTitle: 'So sánh dài hơn / nhiều hơn bao nhiêu (Phép trừ cơ bản)',
        storyText: t.story(num1, num2),
        questionText: t.question,
        unitName: t.unit,
        num1,
        num2,
        operation: '-',
        result,
        item1Name: t.item1,
        item1Count: num1,
        item2Name: t.item2,
        item2Count: num2,
        difference: result,
        solutionTitle: t.solution,
        hint: `Muốn biết vật nào dài hơn (hoặc nhiều hơn) bao nhiêu: Lấy số đo lớn (${num1}) TRỪ đi số đo bé (${num2}).`,
      };
    } else {
      // them-tat-ca
      const templates = [
        {
          name: 'Bé An',
          unit: 'viên kẹo',
          genNum: () => {
            const n1 = [15, 20, 12, 18, 25][getRandomInt(0, 4)];
            const n2 = [5, 10, 6, 8, 5][getRandomInt(0, 4)];
            return { n1, n2 };
          },
          story: (n1: number, n2: number) => `Bé An có ${n1} viên kẹo, mẹ cho bé thêm ${n2} viên kẹo nữa.`,
          question: `Hỏi bé An có tất cả bao nhiêu viên kẹo?`,
          solution: `Bé An có tất cả số viên kẹo là:`,
        },
        {
          name: 'Cây bút',
          unit: 'cm',
          genNum: () => {
            const n1 = [14, 15, 16, 12][getRandomInt(0, 3)];
            const n2 = [5, 4, 6, 5][getRandomInt(0, 3)];
            return { n1, n2 };
          },
          story: (n1: number, n2: number) => `Cây bút chì dài ${n1} cm, phần nắp bút dài thêm ${n2} cm.`,
          question: `Hỏi khi đậy nắp, cây bút chì dài tất cả bao nhiêu xăng-ti-mét?`,
          solution: `Độ dài của cây bút chì khi đậy nắp là:`,
        },
        {
          name: 'Bạn Mai',
          unit: 'bông hoa',
          genNum: () => {
            const n1 = [14, 15, 20, 18, 16][getRandomInt(0, 4)];
            const n2 = [6, 5, 8, 7, 5][getRandomInt(0, 4)];
            return { n1, n2 };
          },
          story: (n1: number, n2: number) => `Bạn Mai có ${n1} bông hoa, bạn hái thêm ${n2} bông hoa nữa.`,
          question: `Hỏi bạn Mai có tất cả bao nhiêu bông hoa?`,
          solution: `Bạn Mai có tất cả số bông hoa là:`,
        },
      ];
      const t = templates[getRandomInt(0, templates.length - 1)];
      const { n1: num1, n2: num2 } = t.genNum();
      const result = num1 + num2;

      return {
        id: `wp-basic-ttc-${Date.now()}-${Math.random()}`,
        difficulty: 'basic',
        type: 'them-tat-ca',
        typeTitle: 'Thêm vào & có tất cả (Phép cộng cơ bản)',
        storyText: t.story(num1, num2),
        questionText: t.question,
        unitName: t.unit,
        num1,
        num2,
        operation: '+',
        result,
        item1Name: `Ban đầu có`,
        item1Count: num1,
        item2Name: `Được thêm`,
        item2Count: num2,
        solutionTitle: t.solution,
        hint: `Muốn tìm TẤT CẢ khi được thêm vào: Lấy số lượng ban đầu (${num1}) CỘNG với số lượng thêm (${num2}).`,
      };
    }
  } else {
    // Advanced types: nhieu-hon, it-hon with regrouping
    const advPool: ('nhieu-hon' | 'it-hon')[] = ['nhieu-hon', 'it-hon'];
    const chosenType = category === 'nhieu-hon' || category === 'it-hon' ? category : advPool[getRandomInt(0, advPool.length - 1)];

    if (chosenType === 'nhieu-hon') {
      const templates = [
        {
          item1: 'Bạn nam',
          item2: 'Bạn nữ',
          unit: 'học sinh',
          genNum: () => {
            const n1 = [25, 28, 34, 27, 36][getRandomInt(0, 4)];
            const n2 = [7, 8, 6, 9, 15][getRandomInt(0, 4)];
            return { n1, n2 };
          },
          story: (n1: number, n2: number) => `Lớp 2A có ${n1} học sinh nam, số học sinh nữ nhiều hơn số học sinh nam ${n2} bạn.`,
          question: `Hỏi lớp 2A có bao nhiêu học sinh nữ?`,
          solution: `Số học sinh nữ của lớp 2A là:`,
        },
        {
          item1: 'Cây cam',
          item2: 'Cây bưởi',
          unit: 'cây',
          genNum: () => {
            const n1 = [38, 45, 27, 36, 48][getRandomInt(0, 4)];
            const n2 = [14, 18, 16, 25, 17][getRandomInt(0, 4)];
            return { n1, n2 };
          },
          story: (n1: number, n2: number) => `Vườn nhà bác An có ${n1} cây cam, số cây bưởi nhiều hơn số cây cam ${n2} cây.`,
          question: `Hỏi vườn nhà bác An có bao nhiêu cây bưởi?`,
          solution: `Số cây bưởi vườn nhà bác An có là:`,
        },
        {
          item1: 'Đoạn dây đỏ',
          item2: 'Đoạn dây xanh',
          unit: 'cm',
          genNum: () => {
            const n1 = [36, 48, 29, 45][getRandomInt(0, 3)];
            const n2 = [17, 15, 18, 26][getRandomInt(0, 3)];
            return { n1, n2 };
          },
          story: (n1: number, n2: number) => `Đoạn dây đỏ dài ${n1} cm, đoạn dây xanh dài hơn đoạn dây đỏ ${n2} cm.`,
          question: `Hỏi đoạn dây xanh dài bao nhiêu xăng-ti-mét?`,
          solution: `Độ dài của đoạn dây xanh là:`,
        },
      ];
      const t = templates[getRandomInt(0, templates.length - 1)];
      const { n1: num1, n2: num2 } = t.genNum();
      const result = num1 + num2;

      return {
        id: `wp-adv-nh-${Date.now()}-${Math.random()}`,
        difficulty: 'advanced',
        type: 'nhieu-hon',
        typeTitle: 'Bài toán về nhiều hơn (Phép cộng có nhớ)',
        storyText: t.story(num1, num2),
        questionText: t.question,
        unitName: t.unit,
        num1,
        num2,
        operation: '+',
        result,
        item1Name: t.item1,
        item1Count: num1,
        item2Name: t.item2,
        difference: num2,
        solutionTitle: t.solution,
        hint: `Muốn tìm số lớn hơn (${t.item2}): Lấy số bé (${num1}) CỘNG với phần nhiều hơn (${num2}).`,
      };
    } else {
      // it-hon
      const templates = [
        {
          item1: 'Cây cam',
          item2: 'Cây chanh',
          unit: 'cây',
          genNum: () => {
            const n1 = [45, 52, 60, 42, 50][getRandomInt(0, 4)];
            const n2 = [18, 16, 25, 17, 24][getRandomInt(0, 4)];
            return { n1, n2 };
          },
          story: (n1: number, n2: number) => `Vườn nhà Mai có ${n1} cây cam, số cây chanh ít hơn số cây cam ${n2} cây.`,
          question: `Hỏi vườn có bao nhiêu cây chanh?`,
          solution: `Số cây chanh trong vườn là:`,
        },
        {
          item1: 'Anh',
          item2: 'Em',
          unit: 'viên bi',
          genNum: () => {
            const n1 = [42, 50, 35, 48, 52][getRandomInt(0, 4)];
            const n2 = [15, 18, 17, 19, 25][getRandomInt(0, 4)];
            return { n1, n2 };
          },
          story: (n1: number, n2: number) => `Anh có ${n1} viên bi, em có ít hơn anh ${n2} viên bi.`,
          question: `Hỏi em có bao nhiêu viên bi?`,
          solution: `Số viên bi của em là:`,
        },
        {
          item1: 'Thùng thứ nhất',
          item2: 'Thùng thứ hai',
          unit: 'lít dầu',
          genNum: () => {
            const n1 = [60, 52, 70, 45, 55][getRandomInt(0, 4)];
            const n2 = [24, 18, 26, 17, 28][getRandomInt(0, 4)];
            return { n1, n2 };
          },
          story: (n1: number, n2: number) => `Thùng thứ nhất đựng ${n1} lít dầu, thùng thứ hai đựng ít hơn thùng thứ nhất ${n2} lít dầu.`,
          question: `Hỏi thùng thứ hai đựng bao nhiêu lít dầu?`,
          solution: `Số lít dầu thùng thứ hai đựng là:`,
        },
      ];
      const t = templates[getRandomInt(0, templates.length - 1)];
      const { n1: num1, n2: num2 } = t.genNum();
      const result = num1 - num2;

      return {
        id: `wp-adv-ih-${Date.now()}-${Math.random()}`,
        difficulty: 'advanced',
        type: 'it-hon',
        typeTitle: 'Bài toán về ít hơn (Phép trừ có nhớ)',
        storyText: t.story(num1, num2),
        questionText: t.question,
        unitName: t.unit,
        num1,
        num2,
        operation: '-',
        result,
        item1Name: t.item1,
        item1Count: num1,
        item2Name: t.item2,
        difference: num2,
        solutionTitle: t.solution,
        hint: `Muốn tìm số bé hơn (${t.item2}): Lấy số lớn (${num1}) TRỪ đi phần ít hơn (${num2}).`,
      };
    }
  }
}

/**
 * Generate Preceding and Succeeding Numbers (Số liền trước và liền sau từ 1 đến 150)
 */
export function generateLienTruocSauQuestion(): LienTruocSauQuestion {
  // Target number from 2 to 149
  const targetNumber = getRandomInt(2, 149);
  const types: ('before' | 'after' | 'both' | 'middle')[] = ['before', 'after', 'both', 'middle'];
  const type = types[getRandomInt(0, types.length - 1)];

  const beforeVal = targetNumber - 1;
  const afterVal = targetNumber + 1;

  let givenNumbers: LienTruocSauQuestion['givenNumbers'] = {};

  if (type === 'before') {
    // Missing before, given target
    givenNumbers = { middle: targetNumber, after: afterVal };
  } else if (type === 'after') {
    // Missing after, given target
    givenNumbers = { before: beforeVal, middle: targetNumber };
  } else if (type === 'middle') {
    // Given before and after, find middle
    givenNumbers = { before: beforeVal, after: afterVal };
  } else {
    // Find both before and after
    givenNumbers = { middle: targetNumber };
  }

  return {
    id: `lts-${Date.now()}-${Math.random()}`,
    targetNumber,
    type,
    beforeVal,
    afterVal,
    givenNumbers,
  };
}

/**
 * Generate Comparing and Sequence Ordering (So sánh dãy số theo thứ tự 1 đến 150)
 */
export function generateSoSanhQuestion(mode?: 'two-numbers' | 'sort-sequence'): SoSanhQuestion {
  const chosenType = mode || (Math.random() < 0.4 ? 'two-numbers' : 'sort-sequence');

  if (chosenType === 'two-numbers') {
    const isExpr = Math.random() < 0.35;
    if (isExpr) {
      // Comparison with arithmetic expression e.g., 34 + 18 vs 52
      const baseA1 = getRandomInt(10, 60);
      const baseA2 = getRandomInt(10, 40);
      const valA = baseA1 + baseA2;
      const exprA = `${baseA1} + ${baseA2}`;
      // valB could be equal, +1 or -1 or random nearby
      const delta = [0, -2, 2, -5, 5, 10][getRandomInt(0, 5)];
      const valB = Math.max(1, Math.min(150, valA + delta));

      let symbolAnswer: '>' | '<' | '=' = '=';
      if (valA > valB) symbolAnswer = '>';
      else if (valA < valB) symbolAnswer = '<';

      return {
        id: `cmp-${Date.now()}-${Math.random()}`,
        type: 'two-numbers',
        numA: valA,
        numB: valB,
        exprA,
        exprB: `${valB}`,
        symbolAnswer,
      };
    } else {
      // Compare two pure numbers between 1 and 150
      const numA = getRandomInt(1, 150);
      let numB = getRandomInt(1, 150);
      // Ensure high occurrence of numbers with same tens or close values to test understanding
      if (Math.random() < 0.3) {
        numB = numA;
      } else if (Math.random() < 0.5) {
        const delta = getRandomInt(-5, 5);
        numB = Math.max(1, Math.min(150, numA + delta));
      }

      let symbolAnswer: '>' | '<' | '=' = '=';
      if (numA > numB) symbolAnswer = '>';
      else if (numA < numB) symbolAnswer = '<';

      return {
        id: `cmp-${Date.now()}-${Math.random()}`,
        type: 'two-numbers',
        numA,
        numB,
        symbolAnswer,
      };
    }
  } else {
    // Sort sequence of 4 or 5 numbers in 1 to 150
    const count = getRandomInt(4, 5);
    const set = new Set<number>();
    while (set.size < count) {
      set.add(getRandomInt(1, 150));
    }
    const sequence = Array.from(set);
    const orderType: 'asc' | 'desc' = Math.random() < 0.5 ? 'asc' : 'desc';

    const sorted = [...sequence].sort((a, b) => (orderType === 'asc' ? a - b : b - a));

    return {
      id: `sort-${Date.now()}-${Math.random()}`,
      type: 'sort-sequence',
      sequence,
      orderType,
      correctOrder: sorted,
    };
  }
}

/**
 * List of fun animal badges that Grade 2 kids love to unlock!
 */
export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge-1',
    title: 'Bé Khởi Động',
    desc: 'Bắt đầu chuyến phiêu lưu toán học và đạt 3 ngôi sao.',
    icon: '🐣',
    unlocked: false,
    requiredStars: 3,
  },
  {
    id: 'badge-2',
    title: 'Bậc Thầy Tách Gộp',
    desc: 'Hiểu rõ cấu tạo số và tách gộp thành thạo.',
    icon: '🐝',
    unlocked: false,
    requiredStars: 8,
  },
  {
    id: 'badge-3',
    title: 'Hiệp Sĩ Cộng Nhớ',
    desc: 'Thực hiện phép tính cộng có nhớ chuẩn xác.',
    icon: '🦁',
    unlocked: false,
    requiredStars: 15,
  },
  {
    id: 'badge-4',
    title: 'Thần Đồng Trừ Nhớ',
    desc: 'Mượn chục và trừ có nhớ xuất sắc.',
    icon: '🦊',
    unlocked: false,
    requiredStars: 25,
  },
  {
    id: 'badge-5',
    title: 'Bác Lái Tàu Toán Học',
    desc: 'Chinh phục số liền trước và liền sau từ 1 đến 150.',
    icon: '🚂',
    unlocked: false,
    requiredStars: 35,
  },
  {
    id: 'badge-6',
    title: 'Nhà Thám Hiểm Dãy Số',
    desc: 'Sắp xếp dãy số thần tốc từ bé đến lớn và lớn đến bé.',
    icon: '🚀',
    unlocked: false,
    requiredStars: 45,
  },
  {
    id: 'badge-7',
    title: 'Đại Trí Tuệ Lớp 2',
    desc: 'Đạt danh hiệu Thủ khoa Toán lớp 2 với 60 ngôi sao.',
    icon: '👑',
    unlocked: false,
    requiredStars: 60,
  },
];
