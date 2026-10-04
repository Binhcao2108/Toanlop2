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

/**
 * Generate Addition and Subtraction with Regrouping (Cộng trừ có nhớ trong phạm vi 100)
 */
export function generateCongTruQuestion(operationChoice?: '+' | '-'): CongTruQuestion {
  const op = operationChoice || (Math.random() < 0.5 ? '+' : '-');

  if (op === '+') {
    // Addition with carrying in range <= 100
    // Guarantee units add up to >= 10
    const tens1 = getRandomInt(1, 6);
    const unit1 = getRandomInt(2, 9);
    // unit2 must be >= 10 - unit1 so that unit1 + unit2 >= 10
    const minUnit2 = 10 - unit1;
    const unit2 = getRandomInt(minUnit2, 9);
    const maxTens2 = 9 - tens1 - 1; // leave room for carry so total <= 100
    const tens2 = getRandomInt(1, Math.max(1, maxTens2));

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
    // Subtraction with borrowing in range <= 100
    // Guarantee unit1 < unit2
    const tens1 = getRandomInt(3, 9);
    const unit1 = getRandomInt(0, 7);
    // unit2 must be > unit1
    const unit2 = getRandomInt(unit1 + 1, 9);
    const tens2 = getRandomInt(1, tens1 - 1);

    const num1 = tens1 * 10 + unit1;
    const num2 = tens2 * 10 + unit2;
    const result = num1 - num2;

    const borrowUnit = 10 + unit1;
    const unitDiff = borrowUnit - unit2;
    const tensSub = tens1 - (tens2 + 1);

    const step1Text = `Hàng đơn vị: ${unit1} không trừ được ${unit2}, lấy 1 chục (${borrowUnit} - ${unit2} = ${unitDiff}). Viết ${unitDiff}, nhớ 1 sang hàng chục.`;
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
