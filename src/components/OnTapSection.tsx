import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
  Sparkles,
  Trophy,
  Eye,
  EyeOff,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OnTapQuestion } from '../types/math';
import { generateOnTapQuiz } from '../utils/mathGenerators';
import { sound } from '../utils/audio';
import { useVirtualKeypad } from '../context/VirtualKeypadContext';

interface OnTapSectionProps {
  onEarnStar: () => void;
}

export const OnTapSection: React.FC<OnTapSectionProps> = ({ onEarnStar }) => {
  const { closeKeypad } = useVirtualKeypad();
  const [questions, setQuestions] = useState<OnTapQuestion[]>(() => generateOnTapQuiz());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [showWrongReview, setShowWrongReview] = useState<boolean>(false);
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(false);

  // Ensure virtual keypad is always closed in this multiple-choice section
  useEffect(() => {
    closeKeypad();
  }, []);

  const handleNewQuiz = () => {
    sound.playClick();
    closeKeypad();
    setQuestions(generateOnTapQuiz());
    setCurrentIndex(0);
    setUserAnswers({});
    setIsFinished(false);
    setShowWrongReview(false);
    setShowAnswerKey(false);
  };

  const currentQ = questions[currentIndex];
  const selectedChoice = currentQ ? userAnswers[currentQ.id] : undefined;
  const isAnswered = selectedChoice !== undefined;
  const isCurrentCorrect = isAnswered && selectedChoice === currentQ.correctLabel;

  const score = questions.reduce((acc, q) => {
    return acc + (userAnswers[q.id] === q.correctLabel ? 1 : 0);
  }, 0);

  const wrongQuestions = questions
    .map((q, idx) => ({ question: q, index: idx, picked: userAnswers[q.id] }))
    .filter((item) => item.picked !== item.question.correctLabel);

  const handleSelectOption = (label: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQ || isAnswered) return;

    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: label }));

    if (label === currentQ.correctLabel) {
      sound.playClick();
      sound.playCorrect();
      onEarnStar();
    } else {
      sound.playClick();
      sound.playIncorrect();
    }
  };

  const handleNextQuestion = () => {
    sound.playClick();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      if (score >= 8) {
        sound.playVictory();
        try {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
      }
    }
  };

  // Use 1 column if any option text is long (e.g. "Không so sánh được"), otherwise 2x2 grid
  const useSingleColumn =
    currentQ?.options.some((o) => o.value.length > 12) ?? false;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Top Header Bar: Title & "Đề mới" button */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-amber-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Ôn Tập Trắc Nghiệm Toán Lớp 2
            </h2>
            <p className="text-sm text-slate-600">
              10 câu ngẫu nhiên đủ 7 dạng toán · Chạm 1 lần để chọn đáp án
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNewQuiz}
          className="min-h-[44px] px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-sm rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-transform shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Đề mới</span>
        </button>
      </div>

      {/* Main Quiz Area */}
      {!isFinished && currentQ ? (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-amber-200/80 shadow-xs space-y-5">
          {/* Progress Bar "Câu X/10" */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-amber-950 bg-amber-100 px-3 py-1 rounded-lg border border-amber-300">
                Câu {currentIndex + 1}/{questions.length}
              </span>
              <span className="text-emerald-800 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Đúng: {score} câu</span>
              </span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300 rounded-full"
              />
            </div>
          </div>

          {/* Question Prompt Box */}
          <div className="p-4 sm:p-5 bg-gradient-to-b from-amber-50/80 to-orange-50/40 rounded-2xl border border-amber-200 space-y-2">
            <span className="inline-block text-sm font-bold text-amber-800 bg-white/90 px-2.5 py-0.5 rounded-md border border-amber-200">
              {currentQ.categoryTitle}
            </span>
            <p className="text-lg sm:text-xl font-black text-slate-900 leading-relaxed pt-1">
              {currentQ.prompt}
            </p>
          </div>

          {/* 4 Answer Choice Buttons (min-h-[56px], 2x2 or 1 col, single tap) */}
          <div
            className={`grid gap-3 ${
              useSingleColumn ? 'grid-cols-1' : 'grid-cols-2'
            }`}
          >
            {currentQ.options.map((opt) => {
              const isPicked = selectedChoice === opt.label;
              const isRightOption = opt.label === currentQ.correctLabel;

              let btnStyle =
                'bg-slate-50 hover:bg-amber-50 active:scale-98 border-slate-200 text-slate-900';
              let badgeStyle =
                'bg-amber-100 text-amber-900 border-amber-300';

              if (isAnswered) {
                if (isRightOption) {
                  btnStyle =
                    'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400 shadow-sm';
                  badgeStyle =
                    'bg-emerald-600 text-white border-emerald-700';
                } else if (isPicked) {
                  btnStyle =
                    'bg-rose-50 border-rose-400 text-rose-900';
                  badgeStyle =
                    'bg-rose-600 text-white border-rose-700';
                } else {
                  btnStyle =
                    'bg-slate-50 border-slate-200 text-slate-400 opacity-65';
                  badgeStyle =
                    'bg-slate-200 text-slate-500 border-slate-300';
                }
              }

              return (
                <button
                  key={opt.label}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt.label)}
                  className={`min-h-[56px] sm:min-h-[64px] p-3 sm:p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer select-none ${btnStyle}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-9 h-9 rounded-xl border font-black text-base flex items-center justify-center shrink-0 ${badgeStyle}`}
                    >
                      {opt.label}
                    </span>
                    <span className="text-lg sm:text-xl font-extrabold break-words">
                      {opt.value}
                    </span>
                  </div>

                  {isAnswered && isRightOption && (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  )}
                  {isAnswered && isPicked && !isRightOption && (
                    <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Immediate Feedback & Vietnamese Explanation + "Câu tiếp" Button */}
          {isAnswered && (
            <div
              className={`p-4 rounded-2xl border-2 space-y-3 animate-pop ${
                isCurrentCorrect
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50/90 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {isCurrentCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 flex-1">
                  <div className="font-black text-base sm:text-lg">
                    {isCurrentCorrect
                      ? 'Chính xác! Bé giỏi lắm! +1 ★'
                      : `Chưa đúng rồi! Đáp án đúng là ${currentQ.correctLabel}. ${currentQ.correctValue}`}
                  </div>
                  <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
                    💡 <strong>Giải thích:</strong> {currentQ.explanation}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="min-h-[48px] w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-base rounded-xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-transform"
                >
                  <span>
                    {currentIndex + 1 < questions.length ? 'Câu tiếp' : 'Hoàn thành đề'}
                  </span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Completion Summary Screen */
        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-amber-200/80 shadow-xs space-y-6 text-center animate-pop">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-4xl shadow-sm">
            {score >= 8 ? '🏆' : score >= 5 ? '🌟' : '💪'}
          </div>

          <div className="space-y-1.5">
            <span className="inline-block text-sm font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Hoàn Thành Đề Ôn Tập
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Điểm của bé: {score} / {questions.length}
            </h3>
            <p className="text-base text-slate-600 font-medium">
              {score === 10
                ? 'Tuyệt vời! Bé làm đúng hết cả 10 câu trắc nghiệm!'
                : score >= 8
                ? 'Rất giỏi! Bé nắm bài rất chắc chắn!'
                : 'Cố gắng lên nhé! Bé hãy xem lại các câu sai để nhớ bài hơn!'}
            </p>
          </div>

          {/* 2 Buttons: "Làm đề mới" and "Xem lại câu sai" */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleNewQuiz}
              className="min-h-[48px] w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-base rounded-2xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-transform"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Làm đề mới</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowWrongReview((prev) => !prev);
              }}
              className="min-h-[48px] w-full sm:w-auto px-6 py-3 bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-950 border border-amber-300 font-bold text-base rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-transform"
            >
              <AlertCircle className="w-5 h-5 text-amber-700" />
              <span>
                {showWrongReview
                  ? 'Ẩn câu sai'
                  : `Xem lại câu sai (${wrongQuestions.length})`}
              </span>
            </button>
          </div>

          {/* Review Wrong Questions List */}
          {showWrongReview && (
            <div className="text-left space-y-3 pt-4 border-t border-amber-100">
              <h4 className="font-extrabold text-base text-slate-800">
                Các câu cần lưu ý ({wrongQuestions.length} câu):
              </h4>
              {wrongQuestions.length === 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 font-bold text-sm flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Chúc mừng bé! Bé không làm sai câu nào cả!</span>
                </div>
              ) : (
                wrongQuestions.map(({ question: q, index, picked }) => {
                  const pickedOption = q.options.find((o) => o.label === picked);
                  return (
                    <div
                      key={q.id}
                      className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-1.5"
                    >
                      <div className="text-sm font-bold text-rose-800">
                        Câu {index + 1}: {q.prompt}
                      </div>
                      <div className="text-sm text-slate-700">
                        • Bé đã chọn:{' '}
                        <strong className="text-rose-700">
                          {picked ? `${picked}. ${pickedOption?.value ?? ''}` : 'Chưa chọn'}
                        </strong>
                      </div>
                      <div className="text-sm text-slate-700">
                        • Đáp án đúng:{' '}
                        <strong className="text-emerald-700">
                          {q.correctLabel}. {q.correctValue}
                        </strong>
                      </div>
                      <div className="text-sm text-slate-800 bg-white/80 p-2.5 rounded-xl border border-rose-100">
                        💡 {q.explanation}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom Parent Answer Key ("Xem đáp án" liệt kê đáp án đúng của cả 10 câu để phụ huynh đối chiếu) */}
      <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-slate-700">
            Bảng đáp án 10 câu (Dành cho phụ huynh đối chiếu)
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
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/70 text-sm space-y-1"
              >
                <div className="font-bold text-slate-900">
                  Câu {idx + 1}: {q.prompt}
                </div>
                <div className="text-emerald-800 font-extrabold">
                  ➔ Đáp án đúng: {q.correctLabel}. {q.correctValue}
                </div>
                <div className="text-slate-600">
                  Giải thích: {q.explanation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
