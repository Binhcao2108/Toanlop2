/**
 * Type definitions for Grade 2 Math Learning App
 */

export type TopicTab = 'tach-gop' | 'cong-tru' | 'lien-truoc-sau' | 'so-sanh' | 'toan-do';

export interface TachGopQuestion {
  id: string;
  total: number;
  partA: number;
  partB: number;
  missingField: 'total' | 'partA' | 'partB';
  theme: 'apples' | 'stars' | 'dots' | 'blocks';
  hint: string;
}

export interface TachSoCongQuaMuoiQuestion {
  id: string;
  num1: number; // e.g. 8 (or 9, 8, 7, 6 or 28, 37...)
  num2: number; // e.g. 7
  split1: number; // e.g. 2 (num1 + split1 = roundTen)
  split2: number; // e.g. 5 (num2 - split1 = split2)
  roundTen: number; // e.g. 10 (or 30, 40...)
  finalResult: number; // e.g. 15
  hintText: string;
}

export interface CongTruQuestion {
  id: string;
  num1: number;
  num2: number;
  operation: '+' | '-';
  result: number;
  // Regrouping details
  carryOver: boolean; // For addition: unit1 + unit2 >= 10
  borrowOver: boolean; // For subtraction: unit1 < unit2
  unit1: number;
  tens1: number;
  unit2: number;
  tens2: number;
  carryValue: number; // 1 if carry/borrow
  step1Text: string;
  step2Text: string;
}

export interface LienTruocSauQuestion {
  id: string;
  targetNumber: number; // 1 to 150
  type: 'before' | 'after' | 'both' | 'middle';
  beforeVal: number;
  afterVal: number;
  givenNumbers: {
    before?: number;
    middle?: number;
    after?: number;
  };
}

export interface SoSanhQuestion {
  id: string;
  type: 'two-numbers' | 'sort-sequence';
  // for two-numbers
  numA?: number;
  numB?: number;
  exprA?: string;
  exprB?: string;
  symbolAnswer?: '>' | '<' | '=';
  // for sort-sequence
  sequence?: number[];
  orderType?: 'asc' | 'desc'; // asc: bé đến lớn, desc: lớn đến bé
  correctOrder?: number[];
}

export interface WordProblemQuestion {
  id: string;
  difficulty: 'basic' | 'advanced';
  type: 'cho-con-lai' | 'so-sanh-hon' | 'them-tat-ca' | 'nhieu-hon' | 'it-hon';
  typeTitle: string; // e.g., 'Bài toán cho đi & còn lại', 'So sánh dài hơn / nhiều hơn'
  storyText: string;
  questionText: string;
  unitName: string; // e.g., 'viên kẹo', 'cm', 'bông hoa', 'viên bi', 'quả cam'
  num1: number;
  num2: number;
  operation: '+' | '-';
  result: number;
  // Sơ đồ đoạn thẳng visual
  item1Name: string;
  item1Count: number;
  item2Name: string;
  item2Count?: number; // Target to find or given
  difference?: number;
  // Expected response details
  solutionTitle: string; // Lời giải mẫu
  hint: string;
}

export interface Badge {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  requiredStars: number;
}

export interface UserProgress {
  stars: number;
  totalAnswered: number;
  correctAnswered: number;
  tachGopCount: number;
  congTruCount: number;
  lienTruocSauCount: number;
  soSanhCount: number;
  unlockedBadges: string[];
}
