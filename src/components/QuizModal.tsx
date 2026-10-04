import React, { useState, useEffect } from 'react';
import { X, Sparkles, Trophy, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import {
  generateTachGopQuestion,
  generateTachSoCongQuaMuoiQuestion,
  generateCongTruQuestion,
  generateLienTruocSauQuestion,
  generateSoSanhQuestion,
} from '../utils/mathGenerators';
import { NumberPad } from './NumberPad';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEarnStars: (count: number) => void;
}

interface QuizItem {
  id: string;
  topic: 'tach-gop' | 'cong-tru' | 'lien-truoc-sau' | 'so-sanh';
  prompt: string;
  subPrompt?: string;
  expectedAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, onEarnStars }) => {
  const [questions, setQuestions] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [inputVal, setInputVal] = useState<string>('');
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const initQuiz = () => {
    const list: QuizItem[] = [];

    // 1 Tách số cộng qua 10 & 1 Tách Gộp
    const sq = generateTachSoCongQuaMuoiQuestion({ maxNum: 9 });
    list.push({
      id: `q-ts-0`,
      topic: 'tach-gop',
      prompt: `Khi cộng ${sq.num1} + ${sq.num2}, ta tách ${sq.num2} thành ${sq.split1} và mấy?`,
      subPrompt: `Vì ${sq.num1} + ${sq.split1} = ${sq.roundTen}`,
      expectedAnswer: `${sq.split2}`,
    });

    const tg = generateTachGopQuestion('mixed');
    const expected =
      tg.missingField === 'total'
        ? `${tg.total}`
        : tg.missingField === 'partA'
        ? `${tg.partA}`
        : `${tg.partB}`;
    const desc =
      tg.missingField === 'total'
        ? `Gộp ${tg.partA} và ${tg.partB} được bao nhiêu?`
        : `Số ${tg.total} gồm ${tg.missingField === 'partA' ? '?' : tg.partA} và ${
            tg.missingField === 'partB' ? '?' : tg.partB
          }. Điền số vào ?`;
    list.push({
      id: `q-tg-1`,
      topic: 'tach-gop',
      prompt: desc,
      expectedAnswer: expected,
    });

    // 3 Cộng trừ có nhớ
    for (let i = 0; i < 3; i++) {
      const q = generateCongTruQuestion(i % 2 === 0 ? '+' : '-');
      list.push({
        id: `q-ct-${i}`,
        topic: 'cong-tru',
        prompt: `Tính: ${q.num1} ${q.operation} ${q.num2} = ?`,
        subPrompt: q.operation === '+' ? 'Phép cộng có nhớ' : 'Phép trừ có nhớ',
        expectedAnswer: `${q.result}`,
      });
    }

    // 3 Liền trước - Liền sau
    for (let i = 0; i < 3; i++) {
      const q = generateLienTruocSauQuestion();
      if (q.type === 'before') {
        list.push({
          id: `q-lts-${i}`,
          topic: 'lien-truoc-sau',
          prompt: `Số liền trước của số ${q.targetNumber} là số nào?`,
          expectedAnswer: `${q.beforeVal}`,
        });
      } else {
        list.push({
          id: `q-lts-${i}`,
          topic: 'lien-truoc-sau',
          prompt: `Số liền sau của số ${q.targetNumber} là số nào?`,
          expectedAnswer: `${q.afterVal}`,
        });
      }
    }

    // 2 So sánh số
    for (let i = 0; i < 2; i++) {
      const q = generateSoSanhQuestion('two-numbers');
      list.push({
        id: `q-ss-${i}`,
        topic: 'so-sanh',
        prompt: `So sánh: ${q.exprA || q.numA} ... ${q.exprB || q.numB}`,
        subPrompt: 'Điền dấu > hoặc < hoặc =',
        expectedAnswer: q.symbolAnswer || '=',
      });
    }

    // Shuffle
    const shuffled = list.sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setInputVal('');
    setIsFinished(false);
    setScore(0);
  };

  useEffect(() => {
    if (isOpen) {
      initQuiz();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];

  const handleAnswer = (ans: string) => {
    if (!currentQ) return;
    const isCorrect = ans.trim() === currentQ.expectedAnswer.trim();
    if (isCorrect) {
      sound.playCorrect();
      setScore((s) => s + 1);
    } else {
      sound.playIncorrect();
    }

    const updated = [...questions];
    updated[currentIndex] = {
      ...currentQ,
      userAnswer: ans,
      isCorrect,
    };
    setQuestions(updated);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setInputVal('');
    } else {
      // Completed!
      const finalScore = isCorrect ? score + 1 : score;
      setIsFinished(true);
      onEarnStars(finalScore);
      if (finalScore >= 7) {
        sound.playVictory();
        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-pop">
      <div className="bg-white rounded-3xl border border-amber-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-200" />
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl">
                Thử Thách 10 Câu Toán Lớp 2
              </h3>
              <p className="text-xs text-amber-100">
                Ôn tập tổng hợp cả 4 chủ đề nhận sao thưởng
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {!isFinished ? (
            currentQ && (
              <div className="space-y-6">
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                    <span>Câu {currentIndex + 1} / {questions.length}</span>
                    <span className="text-amber-700">Đúng: {score} câu</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                      className="h-full bg-amber-500 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Question Box */}
                <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 text-center space-y-2">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                    {currentQ.topic === 'tach-gop'
                      ? 'Chủ đề: Tách Gộp Số'
                      : currentQ.topic === 'cong-tru'
                      ? 'Chủ đề: Cộng Trừ Có Nhớ'
                      : currentQ.topic === 'lien-truoc-sau'
                      ? 'Chủ đề: Liền Trước & Sau'
                      : 'Chủ đề: So Sánh Số'}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                    {currentQ.prompt}
                  </div>
                  {currentQ.subPrompt && (
                    <div className="text-xs text-slate-500 font-medium">
                      {currentQ.subPrompt}
                    </div>
                  )}
                </div>

                {/* Input method depends on topic */}
                {currentQ.topic === 'so-sanh' ? (
                  <div className="space-y-3">
                    <div className="text-center text-xs font-semibold text-slate-500">
                      Chọn dấu thích hợp:
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {(['>', '=', '<'] as const).map((sym) => (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => handleAnswer(sym)}
                          className="py-4 bg-amber-400 hover:bg-amber-500 active:scale-95 text-amber-950 font-black text-3xl rounded-xl border border-amber-500 shadow-sm transition-transform cursor-pointer"
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center">
                      <span className="text-xs text-slate-500 font-medium">Câu trả lời của bé:</span>
                      <div className="text-3xl font-black text-amber-900 h-10 flex items-center justify-center">
                        {inputVal || <span className="text-slate-300 font-normal text-2xl">Bấm số...</span>}
                      </div>
                    </div>

                    <NumberPad
                      onNumberClick={(d) => {
                        if (inputVal.length < 3) setInputVal((p) => p + d);
                      }}
                      onDelete={() => setInputVal((p) => p.slice(0, -1))}
                      onClear={() => setInputVal('')}
                      onSubmit={() => {
                        if (inputVal) handleAnswer(inputVal);
                      }}
                      submitDisabled={!inputVal}
                    />
                  </div>
                )}
              </div>
            )
          ) : (
            /* FINISHED SUMMARY SCREEN */
            <div className="text-center space-y-5 py-4">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner border-2 border-amber-300">
                {score >= 8 ? '🏆' : score >= 5 ? '🌟' : '🎈'}
              </div>

              <div>
                <h4 className="text-2xl font-black text-slate-900">
                  {score === 10
                    ? 'Xuất Sắc! Thủ Khoa Toán Lớp 2!'
                    : score >= 8
                    ? 'Bé Giỏi Quá! Kết Quả Tuyệt Vời!'
                    : score >= 5
                    ? 'Làm Tốt Lắm! Cố Gắng Thêm Nhé!'
                    : 'Bé Đã Hoàn Thành Thử Thách!'}
                </h4>
                <p className="text-sm text-slate-600 mt-1">
                  Bé đã trả lời đúng <strong className="text-amber-700 text-lg font-black">{score} / {questions.length}</strong> câu hỏi và nhận được{' '}
                  <strong className="text-amber-600 font-black text-lg">+{score} ★</strong>
                </p>
              </div>

              {/* Review List */}
              <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80"
                  >
                    <span className="font-semibold text-slate-700 truncate max-w-[240px]">
                      Câu {idx + 1}: {q.prompt}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-slate-500">Bé: {q.userAnswer}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-emerald-700 font-bold">Đ/A: {q.expectedAnswer}</span>
                      {q.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          ✕
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={initQuiz}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Chơi Lại Đề Khác</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-sm cursor-pointer transition-transform active:scale-95"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
