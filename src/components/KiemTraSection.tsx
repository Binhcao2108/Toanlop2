import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Check,
  Printer,
  Pause,
  Play,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { useVirtualKeypad } from '../context/VirtualKeypadContext';
import {
  generateTachSoCongQuaMuoiQuestion,
  generateTachGopQuestion,
  generateCongTruQuestion,
  generateLienTruocSauQuestion,
  generateSoSanhQuestion,
  generateWordProblemQuestion,
} from '../utils/mathGenerators';
import {
  TachSoCongQuaMuoiQuestion,
  TachGopQuestion,
  CongTruQuestion,
  LienTruocSauQuestion,
  SoSanhQuestion,
  WordProblemQuestion,
} from '../types/math';

interface KiemTraSectionProps {
  onEarnStars: (count: number) => void;
}

export type ExamQuestion =
  | {
      id: string;
      partIndex: 1;
      partName: 'Phần 1: Tách Gộp Số';
      type: 'tach-so-cong-qua-10';
      data: TachSoCongQuaMuoiQuestion;
      userSplit1: string;
      userSplit2: string;
      userFinal: string;
      isCorrect?: boolean;
    }
  | {
      id: string;
      partIndex: 1;
      partName: 'Phần 1: Tách Gộp Số';
      type: 'so-do-cay';
      data: TachGopQuestion;
      userInput: string;
      isCorrect?: boolean;
    }
  | {
      id: string;
      partIndex: 2;
      partName: 'Phần 2: Đặt Tính Có Nhớ';
      type: 'cong-tru-co-nho';
      data: CongTruQuestion;
      userUnit: string;
      userTens: string;
      userCarry: string;
      isCorrect?: boolean;
    }
  | {
      id: string;
      partIndex: 3;
      partName: 'Phần 3: Số Liền Trước & Sau';
      type: 'lien-truoc-sau';
      data: LienTruocSauQuestion;
      userBefore: string;
      userMiddle: string;
      userAfter: string;
      isCorrect?: boolean;
    }
  | {
      id: string;
      partIndex: 4;
      partName: 'Phần 4: So Sánh Dãy Số';
      type: 'so-sanh';
      data: SoSanhQuestion;
      userSymbol: string;
      isCorrect?: boolean;
    }
  | {
      id: string;
      partIndex: 5;
      partName: 'Phần 5: Toán Đố Có Lời Văn';
      type: 'toan-do';
      data: WordProblemQuestion;
      userOp: string;
      userResult: string;
      isCorrect?: boolean;
    };

export const KiemTraSection: React.FC<KiemTraSectionProps> = ({ onEarnStars }) => {
  const { openKeypad, closeKeypad } = useVirtualKeypad();

  const [examLength, setExamLength] = useState<10 | 15>(10);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isExamActive, setIsExamActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);

  const [showExamScratchpad, setShowExamScratchpad] = useState<boolean>(false);
  const [scratchTens, setScratchTens] = useState<string>('');
  const [scratchUnit, setScratchUnit] = useState<string>('');

  const generateExam = (len: 10 | 15) => {
    const list: ExamQuestion[] = [];
    const countPerPart = len === 10 ? 2 : 3;

    // PHẦN 1: TÁCH GỘP SỐ
    for (let i = 0; i < countPerPart; i++) {
      if (i % 2 === 0) {
        list.push({
          id: `exam-p1-ts-${i}`,
          partIndex: 1,
          partName: 'Phần 1: Tách Gộp Số',
          type: 'tach-so-cong-qua-10',
          data: generateTachSoCongQuaMuoiQuestion({ maxNum: 9 }),
          userSplit1: '',
          userSplit2: '',
          userFinal: '',
        });
      } else {
        list.push({
          id: `exam-p1-tree-${i}`,
          partIndex: 1,
          partName: 'Phần 1: Tách Gộp Số',
          type: 'so-do-cay',
          data: generateTachGopQuestion('mixed'),
          userInput: '',
        });
      }
    }

    // PHẦN 2: ĐẶT TÍNH RỒI TÍNH CỘNG TRỪ CÓ NHỚ
    for (let i = 0; i < countPerPart; i++) {
      const op = i % 2 === 0 ? '+' : '-';
      list.push({
        id: `exam-p2-ct-${i}`,
        partIndex: 2,
        partName: 'Phần 2: Đặt Tính Có Nhớ',
        type: 'cong-tru-co-nho',
        data: generateCongTruQuestion({ operation: op, range: 'within100' }),
        userUnit: '',
        userTens: '',
        userCarry: '',
      });
    }

    // PHẦN 3: SỐ LIỀN TRƯỚC & SỐ LIỀN SAU
    for (let i = 0; i < countPerPart; i++) {
      list.push({
        id: `exam-p3-lts-${i}`,
        partIndex: 3,
        partName: 'Phần 3: Số Liền Trước & Sau',
        type: 'lien-truoc-sau',
        data: generateLienTruocSauQuestion(),
        userBefore: '',
        userMiddle: '',
        userAfter: '',
      });
    }

    // PHẦN 4: SO SÁNH DÃY SỐ
    for (let i = 0; i < countPerPart; i++) {
      list.push({
        id: `exam-p4-ss-${i}`,
        partIndex: 4,
        partName: 'Phần 4: So Sánh Dãy Số',
        type: 'so-sanh',
        data: generateSoSanhQuestion('two-numbers'),
        userSymbol: '',
      });
    }

    // PHẦN 5: TOÁN ĐỐ CÓ LỜI VĂN
    for (let i = 0; i < countPerPart; i++) {
      list.push({
        id: `exam-p5-td-${i}`,
        partIndex: 5,
        partName: 'Phần 5: Toán Đố Có Lời Văn',
        type: 'toan-do',
        data: generateWordProblemQuestion({ difficulty: i === 0 ? 'basic' : 'advanced' }),
        userOp: '',
        userResult: '',
      });
    }

    return list;
  };

  const startExam = (len = examLength) => {
    sound.playClick();
    const newQuestions = generateExam(len);
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setIsFinished(false);
    setIsExamActive(true);
    setSecondsRemaining(len === 10 ? 15 * 60 : 20 * 60);
    setIsTimerPaused(false);
    setShowExamScratchpad(false);
    setScratchTens('');
    setScratchUnit('');
    closeKeypad();
  };

  useEffect(() => {
    if (!isExamActive || isFinished || isTimerPaused) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isExamActive, isFinished, isTimerPaused]);

  const checkQuestionCorrectness = (q: ExamQuestion): boolean => {
    switch (q.type) {
      case 'tach-so-cong-qua-10': {
        const s1 = parseInt(q.userSplit1, 10);
        const s2 = parseInt(q.userSplit2, 10);
        const fin = parseInt(q.userFinal, 10);
        return s1 === q.data.split1 && s2 === q.data.split2 && fin === q.data.finalResult;
      }
      case 'so-do-cay': {
        const val = parseInt(q.userInput, 10);
        const expected =
          q.data.missingField === 'total'
            ? q.data.total
            : q.data.missingField === 'partA'
            ? q.data.partA
            : q.data.partB;
        return val === expected;
      }
      case 'cong-tru-co-nho': {
        const u = parseInt(q.userUnit, 10);
        const t = parseInt(q.userTens, 10);
        const c = parseInt(q.userCarry, 10);
        const expUnit = q.data.result % 10;
        const expTens = Math.floor(q.data.result / 10);
        const expCarry = 1;
        return u === expUnit && t === expTens && c === expCarry;
      }
      case 'lien-truoc-sau': {
        if (q.data.type === 'before') {
          return parseInt(q.userBefore, 10) === q.data.beforeVal;
        }
        if (q.data.type === 'after') {
          return parseInt(q.userAfter, 10) === q.data.afterVal;
        }
        if (q.data.type === 'middle') {
          return parseInt(q.userMiddle, 10) === q.data.targetNumber;
        }
        return (
          parseInt(q.userBefore, 10) === q.data.beforeVal &&
          parseInt(q.userAfter, 10) === q.data.afterVal
        );
      }
      case 'so-sanh': {
        return q.userSymbol === q.data.symbolAnswer;
      }
      case 'toan-do': {
        const opMatch = q.userOp ? q.userOp === q.data.operation : true;
        const resMatch = parseInt(q.userResult, 10) === q.data.result;
        return opMatch && resMatch;
      }
    }
  };

  const isQuestionAnswered = (q: ExamQuestion): boolean => {
    switch (q.type) {
      case 'tach-so-cong-qua-10':
        return !!q.userFinal && !!q.userSplit1 && !!q.userSplit2;
      case 'so-do-cay':
        return !!q.userInput;
      case 'cong-tru-co-nho':
        return !!q.userUnit && !!q.userTens && !!q.userCarry;
      case 'lien-truoc-sau':
        if (q.data.type === 'both') return !!q.userBefore && !!q.userAfter;
        if (q.data.type === 'before') return !!q.userBefore;
        if (q.data.type === 'middle') return !!q.userMiddle;
        return !!q.userAfter;
      case 'so-sanh':
        return !!q.userSymbol;
      case 'toan-do':
        return !!q.userResult;
    }
  };

  const questionsRef = useRef<ExamQuestion[]>(questions);
  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  const handleSubmitExam = () => {
    sound.playVictory();
    closeKeypad();

    const graded = questionsRef.current.map((q) => ({
      ...q,
      isCorrect: checkQuestionCorrectness(q),
    }));
    questionsRef.current = graded;
    setQuestions(graded);
    setIsFinished(true);

    const correctCount = graded.filter((q) => q.isCorrect).length;
    const finalScore = Math.round((correctCount / graded.length) * 10);

    if (finalScore === 10) {
      onEarnStars(5);
    } else if (finalScore >= 8) {
      onEarnStars(3);
    } else if (finalScore >= 5) {
      onEarnStars(1);
    }

    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch {}
  };

  const currentQ = questions[currentIndex];
  const answeredCount = questions.filter(isQuestionAnswered).length;
  const correctCount = questions.filter((q) => q.isCorrect).length;
  const examScore = questions.length ? Math.round((correctCount / questions.length) * 10) : 0;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentIndexRef = useRef<number>(0);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const updateCurrentQuestion = (updater: (prev: ExamQuestion) => ExamQuestion) => {
    setQuestions((prev) => {
      const idx = currentIndexRef.current;
      if (!prev[idx]) return prev;
      const next = [...prev];
      next[idx] = updater(next[idx]);
      questionsRef.current = next;
      return next;
    });
  };

  const openExamFinalKeypad = (el: HTMLElement, initialVal: string) => {
    sound.playClick();
    openKeypad({
      title: 'Kết quả phép tính',
      value: initialVal,
      maxLength: 3,
      targetEl: el,
      onChange: (val) => {
        updateCurrentQuestion((q) => (q.type === 'tach-so-cong-qua-10' ? { ...q, userFinal: val } : q));
      },
    });
  };

  const openExamSplit1Keypad = (el: HTMLElement, num1: number, initialVal: string) => {
    sound.playClick();
    openKeypad({
      title: `Ô tách 1 (để ${num1} + ? = 10)`,
      value: initialVal,
      maxLength: 2,
      targetEl: el,
      onChange: (val) => {
        updateCurrentQuestion((q) => (q.type === 'tach-so-cong-qua-10' ? { ...q, userSplit1: val } : q));
      },
    });
  };

  const openExamSplit2Keypad = (el: HTMLElement, initialVal: string) => {
    sound.playClick();
    openKeypad({
      title: 'Ô tách 2 (phần còn lại)',
      value: initialVal,
      maxLength: 2,
      targetEl: el,
      onChange: (val) => {
        updateCurrentQuestion((q) => (q.type === 'tach-so-cong-qua-10' ? { ...q, userSplit2: val } : q));
      },
    });
  };

  const openExamTreeKeypad = (el: HTMLElement, title: string, initialVal: string) => {
    sound.playClick();
    openKeypad({
      title,
      value: initialVal,
      maxLength: 3,
      targetEl: el,
      onChange: (val) => {
        updateCurrentQuestion((q) => (q.type === 'so-do-cay' ? { ...q, userInput: val } : q));
      },
    });
  };

  const openExamCarKeypad = (
    el: HTMLElement,
    field: 'userBefore' | 'userMiddle' | 'userAfter',
    title: string,
    initialVal: string
  ) => {
    sound.playClick();
    openKeypad({
      title,
      value: initialVal,
      maxLength: 3,
      targetEl: el,
      onChange: (val) => {
        updateCurrentQuestion((q) => (q.type === 'lien-truoc-sau' ? { ...q, [field]: val } : q));
      },
    });
  };

  const openExamWordResultKeypad = (el: HTMLElement, initialVal: string) => {
    sound.playClick();
    openKeypad({
      title: 'Kết quả bài toán đố',
      value: initialVal,
      maxLength: 3,
      targetEl: el,
      onChange: (val) => {
        updateCurrentQuestion((q) => (q.type === 'toan-do' ? { ...q, userResult: val } : q));
      },
    });
  };

  return (
    <div className="space-y-5 animate-pop">
      {/* 1. MÀN HÌNH CHỌN ĐỀ KIỂM TRA */}
      {!isExamActive && (
        <div className="bg-white rounded-3xl border border-amber-200/80 p-5 sm:p-8 shadow-xs space-y-6 text-center max-w-3xl mx-auto">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center text-3xl shadow-md animate-bounce">
            📝
          </div>

          <div>
            <span className="inline-block text-sm font-bold text-amber-800 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200 uppercase tracking-wider">
              Khảo Sát & Kiểm Tra Định Kỳ
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-950 mt-2">
              Bài Kiểm Tra Toán Lớp 2 Tổng Hợp
            </h2>
            <p className="text-base text-slate-600 mt-1 max-w-xl mx-auto">
              Đề kiểm tra bao quát toàn bộ <strong>5 phần kiến thức trọng tâm</strong>: Tách gộp số,
              Đặt tính có nhớ, Số liền trước sau, So sánh dãy số và Bài toán đố có lời văn.
            </p>
          </div>

          {/* Cấu trúc đề thi 5 phần */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-left pt-1">
            {[
              { num: '1', title: 'Tách Gộp Số', desc: 'Làm tròn 10 & sơ đồ cây', color: 'bg-amber-50 border-amber-200 text-amber-900' },
              { num: '2', title: 'Đặt Tính Có Nhớ', desc: 'Cột dọc chục - đơn vị', color: 'bg-rose-50 border-rose-200 text-rose-900' },
              { num: '3', title: 'Liền Trước & Sau', desc: 'Đoàn tàu toán học', color: 'bg-indigo-50 border-indigo-200 text-indigo-900' },
              { num: '4', title: 'So Sánh Dãy Số', desc: 'Điền dấu >, <, =', color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
              { num: '5', title: 'Toán Đố Lớp 2', desc: 'Lời văn & bảng nháp', color: 'bg-blue-50 border-blue-200 text-blue-900' },
            ].map((p) => (
              <div key={p.num} className={`p-3 rounded-2xl border ${p.color} flex flex-col justify-between`}>
                <div>
                  <span className="text-sm font-black opacity-75">Phần {p.num}</span>
                  <h4 className="font-bold text-sm sm:text-base mt-0.5 leading-snug">{p.title}</h4>
                </div>
                <p className="text-sm opacity-80 mt-1.5">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Chọn số câu và bắt đầu */}
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left w-full sm:w-auto">
              <span className="text-sm font-bold text-slate-700 block">Chọn thời lượng kiểm tra:</span>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setExamLength(10);
                  }}
                  className={`min-h-[44px] px-4 py-2 rounded-xl font-bold text-sm border transition-colors cursor-pointer ${
                    examLength === 10
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-100'
                  }`}
                >
                  Đề 10 câu (15 phút)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setExamLength(15);
                  }}
                  className={`min-h-[44px] px-4 py-2 rounded-xl font-bold text-sm border transition-colors cursor-pointer ${
                    examLength === 15
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-100'
                  }`}
                >
                  Đề 15 câu (20 phút)
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => startExam(examLength)}
              className="min-h-[48px] w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-base font-black rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 shrink-0"
            >
              <span>Bắt Đầu Làm Bài</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* 2. GIAO DIỆN LÀM BÀI KIỂM TRA ĐANG DIỄN RA */}
      {isExamActive && !isFinished && currentQ && (
        <div className="space-y-4">
          {/* Top Bar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-amber-200/80 shadow-xs flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl">
                  {currentQ.partName}
                </span>
                <span className="text-sm font-semibold text-slate-600">
                  Đã làm: <strong className="text-emerald-700 font-bold">{answeredCount}</strong>/{questions.length}
                </span>
              </div>

              {/* Timer & Submit CTA */}
              <div className="flex items-center gap-2">
                <div
                  className={`min-h-[44px] px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono text-sm font-black ${
                    secondsRemaining < 180
                      ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{formatTimer(secondsRemaining)}</span>
                  <button
                    type="button"
                    onClick={() => setIsTimerPaused(!isTimerPaused)}
                    className="p-1.5 rounded-lg hover:bg-amber-200/60 text-slate-600 cursor-pointer"
                    title={isTimerPaused ? 'Tiếp tục' : 'Tạm dừng'}
                  >
                    {isTimerPaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitExam}
                  className="min-h-[44px] px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-xs cursor-pointer transition-transform whitespace-nowrap"
                >
                  Nộp Bài 🏆
                </button>
              </div>
            </div>

            {/* Questions Indicator Buttons (min-h-[44px]) */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = isQuestionAnswered(q);
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      closeKeypad();
                      setCurrentIndex(idx);
                    }}
                    className={`min-w-[44px] min-h-[44px] rounded-xl font-bold text-sm flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      isCurrent
                        ? 'bg-amber-500 text-white border-2 border-amber-600 shadow-sm font-black'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-amber-50'
                    }`}
                    title={`Câu ${idx + 1}: ${q.partName}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* QUESTION CARD */}
          <div className="bg-white rounded-3xl border border-amber-200/80 p-4 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-3">
              <div>
                <span className="text-sm font-extrabold text-amber-700 uppercase">
                  Câu hỏi {currentIndex + 1} / {questions.length}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 mt-0.5">
                  {currentQ.partName}
                </h3>
              </div>
              <span className="text-sm text-slate-600 font-medium">
                (Chạm vào ô <strong className="text-amber-700">?</strong> để nhập số)
              </span>
            </div>

            {/* DẠNG 1.A: TÁCH SỐ CỘNG QUA 10 */}
            {currentQ.type === 'tach-so-cong-qua-10' && (
              <div className="flex flex-col items-center p-4 sm:p-6 bg-gradient-to-b from-amber-50/60 to-orange-50/40 rounded-2xl border border-amber-200/80 space-y-4">
                <p className="text-lg font-bold text-slate-800 text-center">
                  Bé hãy tách số <strong>{currentQ.data.num2}</strong> để làm tròn 10 với{' '}
                  <strong>{currentQ.data.num1}</strong>, rồi tính kết quả:
                </p>

                <div className="flex items-center justify-center gap-2 sm:gap-3 text-2xl sm:text-4xl font-black text-slate-900">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400 border-2 border-amber-500 text-amber-950 flex items-center justify-center shadow-xs">
                    {currentQ.data.num1}
                  </div>
                  <span className="text-amber-600 font-extrabold">+</span>
                  <div className="w-14 h-14 rounded-2xl bg-blue-500 border-2 border-blue-600 text-white flex items-center justify-center shadow-xs">
                    {currentQ.data.num2}
                  </div>
                  <span className="text-slate-400 font-extrabold">=</span>
                  <input
                    type="text"
                    inputMode="none"
                    readOnly
                    maxLength={3}
                    value={currentQ.userFinal}
                    placeholder="?"
                    onClick={(e) => openExamFinalKeypad(e.currentTarget, currentQ.userFinal)}
                    className="w-16 sm:w-18 h-14 rounded-2xl border-3 border-emerald-500 bg-white text-center text-2xl sm:text-3xl font-black text-emerald-950 shadow-xs outline-none cursor-pointer placeholder:text-slate-300"
                  />
                </div>

                <div className="relative w-full max-w-[224px] flex flex-col items-center">
                  <svg className="w-48 max-w-full h-10" viewBox="0 0 192 40" fill="none">
                    <path d="M 96 0 C 96 15, 36 15, 36 40" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M 96 0 C 96 15, 156 15, 156 40" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" />
                  </svg>
                  <div className="w-full flex items-center justify-between px-2">
                    <div className="flex flex-col items-center">
                      <input
                        type="text"
                        inputMode="none"
                        readOnly
                        maxLength={2}
                        value={currentQ.userSplit1}
                        placeholder="?"
                        onClick={(e) => openExamSplit1Keypad(e.currentTarget, currentQ.data.num1, currentQ.userSplit1)}
                        className="w-14 h-14 rounded-2xl border-3 border-blue-500 bg-white text-center text-2xl font-black text-blue-900 shadow-sm outline-none cursor-pointer placeholder:text-slate-300"
                      />
                      <span className="text-sm font-bold text-blue-800 mt-1">Ô tách 1</span>
                    </div>

                    <span className="text-blue-500 font-black text-xl pt-1">+</span>

                    <div className="flex flex-col items-center">
                      <input
                        type="text"
                        inputMode="none"
                        readOnly
                        maxLength={2}
                        value={currentQ.userSplit2}
                        placeholder="?"
                        onClick={(e) => openExamSplit2Keypad(e.currentTarget, currentQ.userSplit2)}
                        className="w-14 h-14 rounded-2xl border-3 border-blue-500 bg-white text-center text-2xl font-black text-blue-900 shadow-sm outline-none cursor-pointer placeholder:text-slate-300"
                      />
                      <span className="text-sm font-bold text-blue-800 mt-1">Ô tách 2</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DẠNG 1.B: SƠ ĐỒ CÂY TÁCH GỘP */}
            {currentQ.type === 'so-do-cay' && (
              <div className="flex flex-col items-center p-4 sm:p-6 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-4">
                <p className="text-lg font-bold text-slate-800 text-center">
                  Bé hãy quan sát sơ đồ cây và điền số thích hợp vào ô dấu <strong>?</strong>:
                </p>

                <div className="relative py-2 flex flex-col items-center gap-8 w-full">
                  <div className="flex flex-col items-center">
                    {currentQ.data.missingField === 'total' ? (
                      <input
                        type="text"
                        inputMode="none"
                        readOnly
                        maxLength={3}
                        value={currentQ.userInput}
                        placeholder="?"
                        onClick={(e) => openExamTreeKeypad(e.currentTarget, 'Số Gộp (Tổng)', currentQ.userInput)}
                        className="w-20 h-20 rounded-full border-4 border-amber-500 bg-amber-100 text-center text-3xl font-black text-amber-950 shadow-md outline-none cursor-pointer placeholder:text-slate-300"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-amber-400 border-4 border-amber-600 text-amber-950 flex items-center justify-center font-extrabold text-3xl shadow-md">
                        {currentQ.data.total}
                      </div>
                    )}
                    <span className="text-sm font-bold text-amber-900 mt-1">Số Gộp (Tổng)</span>
                  </div>

                  <div className="flex items-center justify-around w-full max-w-xs">
                    <div className="flex flex-col items-center">
                      {currentQ.data.missingField === 'partA' ? (
                        <input
                          type="text"
                          inputMode="none"
                          readOnly
                          maxLength={3}
                          value={currentQ.userInput}
                          placeholder="?"
                          onClick={(e) => openExamTreeKeypad(e.currentTarget, 'Số phần 1', currentQ.userInput)}
                          className="w-18 h-18 rounded-full border-4 border-emerald-500 bg-emerald-100 text-center text-2xl font-black text-emerald-950 shadow-md outline-none cursor-pointer placeholder:text-slate-300"
                        />
                      ) : (
                        <div className="w-18 h-18 rounded-full bg-emerald-400 border-4 border-emerald-600 text-emerald-950 flex items-center justify-center font-extrabold text-2xl shadow-md">
                          {currentQ.data.partA}
                        </div>
                      )}
                      <span className="text-sm font-bold text-emerald-800 mt-1">Phần 1</span>
                    </div>

                    <div className="flex flex-col items-center">
                      {currentQ.data.missingField === 'partB' ? (
                        <input
                          type="text"
                          inputMode="none"
                          readOnly
                          maxLength={3}
                          value={currentQ.userInput}
                          placeholder="?"
                          onClick={(e) => openExamTreeKeypad(e.currentTarget, 'Số phần 2', currentQ.userInput)}
                          className="w-18 h-18 rounded-full border-4 border-blue-500 bg-blue-100 text-center text-2xl font-black text-blue-950 shadow-md outline-none cursor-pointer placeholder:text-slate-300"
                        />
                      ) : (
                        <div className="w-18 h-18 rounded-full bg-blue-400 border-4 border-blue-600 text-blue-950 flex items-center justify-center font-extrabold text-2xl shadow-md">
                          {currentQ.data.partB}
                        </div>
                      )}
                      <span className="text-sm font-bold text-blue-800 mt-1">Phần 2</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DẠNG 2: ĐẶT TÍNH RỒI TÍNH CỘNG TRỪ CÓ NHỚ */}
            {currentQ.type === 'cong-tru-co-nho' && (
              <div className="flex flex-col items-center p-4 sm:p-6 bg-gradient-to-b from-amber-50/70 to-orange-50/40 rounded-2xl border border-amber-200 space-y-4">
                <p className="text-lg font-bold text-slate-800 text-center">
                  Đặt tính rồi tính:{' '}
                  <strong className="text-amber-900">
                    {currentQ.data.num1} {currentQ.data.operation} {currentQ.data.num2}
                  </strong>{' '}
                  (kèm số nhớ 1 bên phải):
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                  <div className="w-52 sm:w-56 bg-white p-4 rounded-2xl border-2 border-amber-300 shadow-sm">
                    <div className="grid grid-cols-2 text-center text-sm font-bold border-b border-amber-200 pb-1 mb-2">
                      <span className="text-amber-800 bg-amber-50 py-1 rounded-l-md border-r border-amber-200">
                        Chục
                      </span>
                      <span className="text-blue-800 bg-blue-50 py-1 rounded-r-md">Đơn vị</span>
                    </div>

                    <div className="grid grid-cols-2 text-center text-3xl font-black font-mono py-1 border-b border-slate-100">
                      <span className="text-amber-900 border-r border-slate-100">
                        {currentQ.data.tens1 > 0 ? currentQ.data.tens1 : ''}
                      </span>
                      <span className="text-blue-900">{currentQ.data.unit1}</span>
                    </div>

                    <div className="relative grid grid-cols-2 text-center text-3xl font-black font-mono py-1">
                      <span className="absolute -left-2.5 top-1 text-2xl font-black text-amber-700 font-sans">
                        {currentQ.data.operation}
                      </span>
                      <span className="text-amber-900 border-r border-slate-100">
                        {currentQ.data.tens2 > 0 ? currentQ.data.tens2 : ''}
                      </span>
                      <span className="text-blue-900">{currentQ.data.unit2}</span>
                    </div>

                    <div className="w-full h-1 bg-slate-900 rounded-full my-2" />

                    <div className="grid grid-cols-2 gap-2 text-center py-1">
                      <input
                        type="text"
                        inputMode="none"
                        readOnly
                        maxLength={1}
                        value={currentQ.userTens}
                        placeholder="?"
                        onClick={(e) => {
                          sound.playClick();
                          openKeypad({
                            title: 'Chữ số Hàng Chục',
                            value: currentQ.userTens,
                            maxLength: 1,
                            targetEl: e.currentTarget,
                            onChange: (val) => {
                              updateCurrentQuestion((q) => (q.type === 'cong-tru-co-nho' ? { ...q, userTens: val } : q));
                            },
                          });
                        }}
                        className="h-14 w-full rounded-xl border-2 border-amber-400 bg-amber-50/50 text-center text-3xl font-black font-mono outline-none cursor-pointer placeholder:text-slate-300"
                        title="Chữ số hàng chục"
                      />

                      <input
                        type="text"
                        inputMode="none"
                        readOnly
                        maxLength={1}
                        value={currentQ.userUnit}
                        placeholder="?"
                        onClick={(e) => {
                          sound.playClick();
                          openKeypad({
                            title: 'Chữ số Hàng Đơn Vị',
                            value: currentQ.userUnit,
                            maxLength: 1,
                            targetEl: e.currentTarget,
                            onChange: (val) => {
                              updateCurrentQuestion((q) => (q.type === 'cong-tru-co-nho' ? { ...q, userUnit: val } : q));
                            },
                          });
                        }}
                        className="h-14 w-full rounded-xl border-2 border-blue-400 bg-blue-50/50 text-center text-3xl font-black font-mono outline-none cursor-pointer placeholder:text-slate-300"
                        title="Chữ số hàng đơn vị"
                      />
                    </div>
                  </div>

                  {/* Ô Nhớ 1 bên phải */}
                  <div className="w-36 bg-white p-3.5 rounded-2xl border-2 border-dashed border-rose-300 shadow-sm flex flex-col items-center justify-between min-h-[170px]">
                    <div className="text-center">
                      <span className="text-sm font-black text-rose-700 uppercase tracking-tight block">
                        {currentQ.data.operation === '+' ? 'Ghi Nhớ' : 'Mượn / Nhớ'}
                      </span>
                      <span className="text-sm text-slate-600 font-semibold block">(Bên phải)</span>
                    </div>

                    <input
                      type="text"
                      inputMode="none"
                      readOnly
                      maxLength={1}
                      value={currentQ.userCarry}
                      placeholder="?"
                      onClick={(e) => {
                        sound.playClick();
                        openKeypad({
                          title: 'Ô Ghi Nhớ 1 (phía bên phải)',
                          value: currentQ.userCarry,
                          maxLength: 1,
                          targetEl: e.currentTarget,
                          onChange: (val) => {
                            updateCurrentQuestion((q) => (q.type === 'cong-tru-co-nho' ? { ...q, userCarry: val } : q));
                          },
                        });
                      }}
                      className="w-14 h-14 rounded-2xl border-3 border-rose-400 bg-rose-50 text-center text-3xl font-black text-rose-900 outline-none cursor-pointer placeholder:text-rose-300"
                    />

                    <span className="text-sm text-slate-600 text-center">
                      {currentQ.data.operation === '+' ? 'Cộng dư ➔ nhớ 1' : 'Mượn chục ➔ nhớ 1'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* DẠNG 3: SỐ LIỀN TRƯỚC & LIỀN SAU */}
            {currentQ.type === 'lien-truoc-sau' && (
              <div className="flex flex-col items-center p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <p className="text-lg font-bold text-slate-800 text-center">
                  Quan sát đoàn tàu và điền số thích hợp vào toa tàu có dấu <strong>?</strong>:
                </p>

                <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 w-full py-2">
                  {/* Car 1: Liền trước */}
                  <div className="flex-1 max-w-[96px] flex flex-col items-center">
                    <span className="text-sm font-bold text-blue-800 mb-1 whitespace-nowrap">Trước (-1)</span>
                    {currentQ.data.type === 'before' || currentQ.data.type === 'both' ? (
                      <input
                        type="text"
                        inputMode="none"
                        readOnly
                        value={currentQ.userBefore}
                        placeholder="?"
                        onClick={(e) =>
                          openExamCarKeypad(e.currentTarget, 'userBefore', 'Số liền trước (-1)', currentQ.userBefore)
                        }
                        className="w-full h-18 sm:h-20 rounded-xl border-3 border-blue-500 bg-blue-100 text-center text-2xl sm:text-3xl font-black text-blue-950 shadow-md outline-none cursor-pointer placeholder:text-slate-300"
                      />
                    ) : (
                      <div className="w-full h-18 sm:h-20 rounded-xl bg-blue-50 border-3 border-blue-300 text-blue-900 flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md">
                        {currentQ.data.beforeVal}
                      </div>
                    )}
                  </div>

                  <span className="text-slate-400 font-bold text-xl pt-5">—</span>

                  {/* Car 2: Ở giữa */}
                  <div className="flex-1 max-w-[96px] flex flex-col items-center">
                    <span className="text-sm font-bold text-indigo-800 mb-1 whitespace-nowrap">Ở giữa</span>
                    {currentQ.data.type === 'middle' ? (
                      <input
                        type="text"
                        inputMode="none"
                        readOnly
                        value={currentQ.userMiddle}
                        placeholder="?"
                        onClick={(e) =>
                          openExamCarKeypad(e.currentTarget, 'userMiddle', 'Số ở giữa', currentQ.userMiddle)
                        }
                        className="w-full h-18 sm:h-20 rounded-xl border-3 border-indigo-500 bg-indigo-100 text-center text-2xl sm:text-3xl font-black text-indigo-950 shadow-md outline-none cursor-pointer placeholder:text-slate-300"
                      />
                    ) : (
                      <div className="w-full h-18 sm:h-20 rounded-xl bg-amber-400 border-3 border-amber-600 text-amber-950 flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md">
                        {currentQ.data.targetNumber}
                      </div>
                    )}
                  </div>

                  <span className="text-slate-400 font-bold text-xl pt-5">—</span>

                  {/* Car 3: Liền sau */}
                  <div className="flex-1 max-w-[96px] flex flex-col items-center">
                    <span className="text-sm font-bold text-emerald-800 mb-1 whitespace-nowrap">Sau (+1)</span>
                    {currentQ.data.type === 'after' || currentQ.data.type === 'both' ? (
                      <input
                        type="text"
                        inputMode="none"
                        readOnly
                        value={currentQ.userAfter}
                        placeholder="?"
                        onClick={(e) =>
                          openExamCarKeypad(e.currentTarget, 'userAfter', 'Số liền sau (+1)', currentQ.userAfter)
                        }
                        className="w-full h-18 sm:h-20 rounded-xl border-3 border-emerald-500 bg-emerald-100 text-center text-2xl sm:text-3xl font-black text-emerald-950 shadow-md outline-none cursor-pointer placeholder:text-slate-300"
                      />
                    ) : (
                      <div className="w-full h-18 sm:h-20 rounded-xl bg-emerald-50 border-3 border-emerald-300 text-emerald-900 flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md">
                        {currentQ.data.afterVal}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DẠNG 4: SO SÁNH DÃY SỐ */}
            {currentQ.type === 'so-sanh' && (
              <div className="flex flex-col items-center p-4 sm:p-6 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-4">
                <p className="text-lg font-bold text-slate-800 text-center">
                  So sánh và chọn dấu thích hợp (<strong>&gt;</strong>, <strong>&lt;</strong> hoặc <strong>=</strong>):
                </p>

                <div className="flex items-center justify-center gap-3 text-2xl sm:text-3xl font-black text-slate-900">
                  <div className="px-4 py-3 bg-white rounded-2xl border-2 border-slate-300 shadow-xs">
                    {currentQ.data.exprA || currentQ.data.numA}
                  </div>

                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-3 border-dashed border-emerald-500 bg-white flex items-center justify-center text-3xl font-black text-emerald-800 shadow-sm">
                    {currentQ.userSymbol || '?'}
                  </div>

                  <div className="px-4 py-3 bg-white rounded-2xl border-2 border-slate-300 shadow-xs">
                    {currentQ.data.exprB || currentQ.data.numB}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  {(['>', '=', '<'] as const).map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        updateCurrentQuestion((q) => (q.type === 'so-sanh' ? { ...q, userSymbol: sym } : q));
                      }}
                      className={`min-w-[56px] min-h-[56px] rounded-2xl text-2xl font-black border-2 transition-transform active:scale-95 cursor-pointer shadow-sm ${
                        currentQ.userSymbol === sym
                          ? 'bg-emerald-500 text-white border-emerald-600 scale-105'
                          : 'bg-white text-slate-800 border-slate-300 hover:bg-emerald-50'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* DẠNG 5: TOÁN ĐỐ CÓ LỜI VĂN */}
            {currentQ.type === 'toan-do' && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
                  <span className="text-xl mr-2">📖</span>
                  {currentQ.data.storyText}{' '}
                  <span className="text-indigo-800 underline font-black">{currentQ.data.questionText}</span>
                </div>

                {/* Bảng nháp xếp cột dọc 2 số */}
                <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                      <span>📝</span> Bảng nháp xếp cột dọc 2 số
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setShowExamScratchpad(!showExamScratchpad);
                      }}
                      className="min-h-[44px] px-3 py-1.5 bg-white text-sm font-bold rounded-xl border border-slate-300 hover:bg-amber-100 cursor-pointer"
                    >
                      {showExamScratchpad ? 'Ẩn bảng nháp' : 'Mở bảng nháp'}
                    </button>
                  </div>

                  {showExamScratchpad && (
                    <div className="pt-2 border-t border-amber-200/70 flex flex-col items-center">
                      <div className="w-48 bg-white p-3 rounded-xl border-2 border-amber-300 font-mono text-center">
                        <div className="grid grid-cols-2 text-sm font-bold text-slate-600 border-b border-amber-200 pb-1 mb-1">
                          <span>Chục</span>
                          <span>Đơn vị</span>
                        </div>
                        <div className="grid grid-cols-2 text-2xl font-black text-slate-800 py-0.5">
                          <span>{Math.floor(currentQ.data.num1 / 10) || ''}</span>
                          <span>{currentQ.data.num1 % 10}</span>
                        </div>
                        <div className="relative grid grid-cols-2 text-2xl font-black text-slate-800 py-0.5">
                          <span className="absolute left-1 text-amber-700 font-sans font-bold">
                            {currentQ.data.operation}
                          </span>
                          <span>{Math.floor(currentQ.data.num2 / 10) || ''}</span>
                          <span>{currentQ.data.num2 % 10}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-900 rounded-full my-1.5" />
                        <div className="grid grid-cols-2 gap-1.5 py-1">
                          <input
                            type="text"
                            inputMode="none"
                            readOnly
                            maxLength={1}
                            value={scratchTens}
                            placeholder="?"
                            onClick={(e) => {
                              sound.playClick();
                              openKeypad({
                                title: 'Nháp chữ số hàng chục',
                                value: scratchTens,
                                maxLength: 1,
                                targetEl: e.currentTarget,
                                onChange: (val) => setScratchTens(val),
                              });
                            }}
                            className="h-11 text-center text-xl font-black rounded-lg border border-amber-400 outline-none cursor-pointer"
                          />
                          <input
                            type="text"
                            inputMode="none"
                            readOnly
                            maxLength={1}
                            value={scratchUnit}
                            placeholder="?"
                            onClick={(e) => {
                              sound.playClick();
                              openKeypad({
                                title: 'Nháp chữ số hàng đơn vị',
                                value: scratchUnit,
                                maxLength: 1,
                                targetEl: e.currentTarget,
                                onChange: (val) => setScratchUnit(val),
                              });
                            }}
                            className="h-11 text-center text-xl font-black rounded-lg border border-blue-400 outline-none cursor-pointer"
                          />
                        </div>
                      </div>
                      {(scratchTens || scratchUnit) && (
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            const res = `${scratchTens}${scratchUnit}`;
                            updateCurrentQuestion((q) => (q.type === 'toan-do' ? { ...q, userResult: res } : q));
                          }}
                          className="min-h-[44px] mt-2 px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-xs cursor-pointer"
                        >
                          👉 Đưa ({scratchTens}{scratchUnit}) vào ô đáp số
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Khung bài giải */}
                <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-amber-300 space-y-3">
                  <span className="text-sm font-bold text-amber-900 uppercase">Bài giải:</span>
                  <p className="text-base font-bold text-slate-800 pl-2.5 border-l-4 border-amber-400">
                    {currentQ.data.solutionTitle}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2 py-2.5 bg-amber-50/60 rounded-xl p-3">
                    <span className="text-2xl font-black text-slate-900">{currentQ.data.num1}</span>

                    <div className="flex items-center gap-1.5">
                      {['+', '-'].map((op) => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            updateCurrentQuestion((q) => (q.type === 'toan-do' ? { ...q, userOp: op } : q));
                          }}
                          className={`min-w-[44px] min-h-[44px] rounded-xl font-black text-xl border transition-colors cursor-pointer ${
                            currentQ.userOp === op
                              ? 'bg-amber-500 text-white border-amber-600'
                              : 'bg-white text-slate-800 border-slate-300 hover:bg-amber-100'
                          }`}
                        >
                          {op}
                        </button>
                      ))}
                    </div>

                    <span className="text-2xl font-black text-slate-900">{currentQ.data.num2}</span>
                    <span className="text-2xl font-bold text-slate-400">=</span>

                    <input
                      type="text"
                      inputMode="none"
                      readOnly
                      value={currentQ.userResult}
                      placeholder="?"
                      onClick={(e) => openExamWordResultKeypad(e.currentTarget, currentQ.userResult)}
                      className="w-20 h-12 rounded-xl border-2 border-emerald-500 bg-white text-center text-2xl font-black outline-none cursor-pointer placeholder:text-slate-300"
                    />
                    <span className="text-sm font-bold text-slate-700">({currentQ.data.unitName})</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Navigation Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-amber-100">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => {
                  sound.playClick();
                  closeKeypad();
                  setCurrentIndex((p) => Math.max(0, p - 1));
                }}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors ${
                  currentIndex === 0
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Câu trước</span>
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    closeKeypad();
                    setCurrentIndex((p) => Math.min(questions.length - 1, p + 1));
                  }}
                  className="min-h-[44px] px-5 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-transform"
                >
                  <span>Câu tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitExam}
                  className="min-h-[44px] px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-95 text-white rounded-xl text-sm font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-transform"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Nộp bài & Chấm điểm</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. BẢNG TỔNG KẾT KẾT QUẢ BÀI KIỂM TRA */}
      {isFinished && (
        <div className="bg-white rounded-3xl border border-amber-200/80 p-5 sm:p-8 shadow-xs space-y-6 animate-pop">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center text-4xl shadow-lg animate-bounce">
              {examScore >= 9 ? '🏆' : examScore >= 7 ? '🌟' : '💪'}
            </div>

            <div>
              <span className="inline-block text-sm font-bold text-amber-800 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200 uppercase tracking-wider">
                Kết Quả Bài Kiểm Tra
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-amber-950 mt-2">
                {examScore} / 10 Điểm
              </h2>
              <p className="text-base font-bold text-emerald-800 mt-1">
                Bé đã trả lời đúng {correctCount} / {questions.length} câu hỏi!
              </p>
            </div>

            <div className="max-w-xl mx-auto p-4 bg-amber-50 rounded-2xl border border-amber-200 text-left flex items-start gap-3">
              <span className="text-2xl">👩‍🏫</span>
              <div>
                <strong className="text-sm font-bold text-amber-950 uppercase block">Lời nhận xét của cô:</strong>
                <p className="text-sm text-amber-900 mt-0.5 leading-relaxed">
                  {examScore === 10
                    ? 'Xuất sắc tuyệt đối! Con nắm rất vững toàn bộ 5 phần kiến thức Toán Lớp 2. Cố gắng phát huy con nhé! 🌟'
                    : examScore >= 8
                    ? 'Rất tốt! Con chỉ cần chú ý thêm một chút nữa ở những câu còn nhầm là đạt điểm 10 tuyệt đối rồi! 👏'
                    : examScore >= 5
                    ? 'Khá tốt! Con hãy xem kỹ phần giải thích chi tiết bên dưới để rút kinh nghiệm nhé! Cố lên con! 💪'
                    : 'Con đừng buồn nhé! Hãy ôn lại các bài tập từng phần rồi thử sức lại với đề mới nhé! ❤️'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-amber-100">
            <button
              type="button"
              onClick={() => startExam(examLength)}
              className="min-h-[48px] px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-transform"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm Đề Kiểm Tra Mới</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-[48px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold flex items-center gap-2 border border-slate-300 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Kết Quả Này Ra Giấy</span>
            </button>
          </div>

          <div className="space-y-4 pt-4 border-t border-amber-100">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              <span>Xem Lại Lời Giải Chi Tiết Từng Câu:</span>
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border ${
                    q.isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                  } space-y-2 text-left`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-white border font-bold text-sm flex items-center justify-center text-slate-700 shadow-2xs">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-bold text-slate-700">{q.partName}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {q.isCorrect ? (
                        <span className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đúng
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-rose-700 flex items-center gap-1">
                          <XCircle className="w-4 h-4 text-rose-600" /> Chưa đúng
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-slate-800 font-medium pl-8">
                    {q.type === 'tach-so-cong-qua-10' && (
                      <p>
                        Phép tính: <strong>{q.data.num1} + {q.data.num2}</strong>. Đáp án đúng: Tách {q.data.num2} thành{' '}
                        <strong className="text-emerald-700">{q.data.split1}</strong> và{' '}
                        <strong className="text-emerald-700">{q.data.split2}</strong> ➔ Kết quả ={' '}
                        <strong className="text-emerald-700">{q.data.finalResult}</strong>.
                      </p>
                    )}
                    {q.type === 'so-do-cay' && (
                      <p>
                        Sơ đồ cây: Tổng {q.data.total} gồm {q.data.partA} và {q.data.partB}. Đáp án đúng:{' '}
                        <strong className="text-emerald-700">
                          {q.data.missingField === 'total'
                            ? q.data.total
                            : q.data.missingField === 'partA'
                            ? q.data.partA
                            : q.data.partB}
                        </strong>.
                      </p>
                    )}
                    {q.type === 'cong-tru-co-nho' && (
                      <p>
                        Đặt tính: <strong>{q.data.num1} {q.data.operation} {q.data.num2}</strong>. Kết quả đúng:{' '}
                        <strong className="text-emerald-700">{q.data.result}</strong> (Hàng chục:{' '}
                        {Math.floor(q.data.result / 10)}, Hàng đơn vị: {q.data.result % 10}, Ghi nhớ: 1).
                      </p>
                    )}
                    {q.type === 'lien-truoc-sau' && (
                      <p>
                        Số: {q.data.targetNumber}. Liền trước ={' '}
                        <strong className="text-emerald-700">{q.data.beforeVal}</strong>, Liền sau ={' '}
                        <strong className="text-emerald-700">{q.data.afterVal}</strong>.
                      </p>
                    )}
                    {q.type === 'so-sanh' && (
                      <p>
                        So sánh: {q.data.exprA || q.data.numA} và {q.data.exprB || q.data.numB}. Đáp án đúng là dấu{' '}
                        <strong className="text-emerald-700 text-base">{q.data.symbolAnswer}</strong>.
                      </p>
                    )}
                    {q.type === 'toan-do' && (
                      <p>
                        Bài toán đố: Phép tính đúng là{' '}
                        <strong className="text-emerald-700">
                          {q.data.num1} {q.data.operation} {q.data.num2} = {q.data.result} {q.data.unitName}
                        </strong>.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
