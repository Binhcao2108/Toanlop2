import React, { useState } from 'react';
import { Sparkles, RotateCcw, Lightbulb, CheckCircle2, ChevronRight, Scale, ArrowDownAZ, ArrowUpAZ, RefreshCw } from 'lucide-react';
import { SoSanhQuestion } from '../types/math';
import { generateSoSanhQuestion } from '../utils/mathGenerators';
import { sound } from '../utils/audio';

interface SoSanhDaySoSectionProps {
  onEarnStar: () => void;
}

export const SoSanhDaySoSection: React.FC<SoSanhDaySoSectionProps> = ({ onEarnStar }) => {
  const [subType, setSubType] = useState<'all' | 'two-numbers' | 'sort-sequence'>('all');
  const [question, setQuestion] = useState<SoSanhQuestion>(() => generateSoSanhQuestion());
  
  // For two-numbers
  const [chosenSymbol, setChosenSymbol] = useState<'>' | '<' | '=' | null>(null);

  // For sort-sequence
  // User ordered items: array of numbers in the order the user picked
  const [orderedList, setOrderedList] = useState<number[]>([]);
  // Remaining items not yet placed
  const [remainingPool, setRemainingPool] = useState<number[]>(() =>
    question.type === 'sort-sequence' && question.sequence ? [...question.sequence] : []
  );

  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);

  const nextQuestion = (targetType = subType) => {
    const chosen = targetType === 'all' ? (Math.random() < 0.4 ? 'two-numbers' : 'sort-sequence') : targetType;
    const q = generateSoSanhQuestion(chosen);
    setQuestion(q);
    setChosenSymbol(null);
    setStatus('idle');
    setShowExplanation(false);
    if (q.type === 'sort-sequence' && q.sequence) {
      setOrderedList([]);
      setRemainingPool([...q.sequence]);
    }
  };

  const handleSubTypeChange = (newType: 'all' | 'two-numbers' | 'sort-sequence') => {
    setSubType(newType);
    nextQuestion(newType);
  };

  // Two numbers check
  const handleSelectSymbol = (sym: '>' | '<' | '=') => {
    sound.playClick();
    setChosenSymbol(sym);
    if (sym === question.symbolAnswer) {
      sound.playCorrect();
      setStatus('correct');
      setStreak((s) => s + 1);
      onEarnStar();
    } else {
      sound.playIncorrect();
      setStatus('wrong');
    }
  };

  // Sequence sorting actions
  const handlePickNumber = (num: number) => {
    sound.playClick();
    setOrderedList((prev) => [...prev, num]);
    setRemainingPool((prev) => {
      const idx = prev.indexOf(num);
      if (idx !== -1) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      }
      return prev;
    });
    setStatus('idle');
  };

  const handleRemoveFromOrder = (num: number, index: number) => {
    sound.playClick();
    setOrderedList((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
    setRemainingPool((prev) => [...prev, num]);
    setStatus('idle');
  };

  const handleResetSort = () => {
    sound.playClick();
    if (question.sequence) {
      setOrderedList([]);
      setRemainingPool([...question.sequence]);
      setStatus('idle');
    }
  };

  const handleCheckSort = () => {
    if (!question.correctOrder || orderedList.length !== question.correctOrder.length) return;
    const isAllCorrect = orderedList.every((val, i) => val === question.correctOrder![i]);
    if (isAllCorrect) {
      sound.playCorrect();
      setStatus('correct');
      setStreak((s) => s + 1);
      onEarnStar();
    } else {
      sound.playIncorrect();
      setStatus('wrong');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Filter Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-amber-200/80 shadow-xs">
        <div className="flex items-center gap-1 p-1 bg-amber-50 rounded-xl border border-amber-200/60">
          <button
            type="button"
            onClick={() => handleSubTypeChange('all')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer ${
              subType === 'all' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            Tổng hợp
          </button>
          <button
            type="button"
            onClick={() => handleSubTypeChange('two-numbers')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer ${
              subType === 'two-numbers' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            So sánh 2 số (&gt;, &lt;, =)
          </button>
          <button
            type="button"
            onClick={() => handleSubTypeChange('sort-sequence')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer ${
              subType === 'sort-sequence' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            Sắp xếp dãy số
          </button>
        </div>

        <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-xs font-bold text-amber-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Liên tiếp: {streak}</span>
        </div>
      </div>

      {/* Main Practice Area */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-amber-200/80 shadow-xs space-y-6">
        {question.type === 'two-numbers' ? (
          /* TYPE 1: SO SÁNH HAI SỐ (> , < , =) VỚI CÂN BẬP BÊNH */
          <div className="space-y-6">
            <div className="border-b border-amber-100 pb-3 text-center sm:text-left">
              <h2 className="text-lg font-bold text-slate-800">
                So sánh hai số trong phạm vi 1 đến 150
              </h2>
              <p className="text-xs text-slate-500">
                Bé hãy bấm chọn dấu thích hợp: Lớn hơn (&gt;), Bé hơn (&lt;), hoặc Bằng nhau (=)
              </p>
            </div>

            {/* Chiếc Cân Bập Bênh Trực Quan */}
            <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200/80 flex flex-col items-center">
              {/* Numbers Comparison Row */}
              <div className="flex items-center justify-center gap-4 sm:gap-8 my-4">
                {/* Left Number Box */}
                <div className="flex flex-col items-center">
                  <div className="min-w-[90px] sm:min-w-[120px] h-20 sm:h-24 bg-blue-500 border-3 border-blue-700 text-white rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-black shadow-md px-3">
                    {question.exprA || question.numA}
                  </div>
                  <span className="text-xs font-bold text-blue-900 mt-2">Bên trái</span>
                </div>

                {/* Operator Symbol Slot */}
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-black border-3 transition-all ${
                    status === 'correct'
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-900 shadow-md animate-pop'
                      : status === 'wrong'
                      ? 'bg-rose-100 border-rose-500 text-rose-800'
                      : chosenSymbol
                      ? 'bg-amber-100 border-amber-500 text-amber-900'
                      : 'bg-white border-dashed border-amber-300 text-slate-300 animate-pulse'
                  }`}
                >
                  {chosenSymbol || '?'}
                </div>

                {/* Right Number Box */}
                <div className="flex flex-col items-center">
                  <div className="min-w-[90px] sm:min-w-[120px] h-20 sm:h-24 bg-emerald-500 border-3 border-emerald-700 text-white rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-black shadow-md px-3">
                    {question.exprB || question.numB}
                  </div>
                  <span className="text-xs font-bold text-emerald-900 mt-2">Bên phải</span>
                </div>
              </div>

              {/* Visual Balance Scale Graphic */}
              <div className="w-full max-w-xs flex flex-col items-center mt-2 opacity-80">
                <div
                  className={`w-48 h-2 bg-slate-700 rounded-full transition-transform duration-300 ${
                    status === 'correct' && question.symbolAnswer === '>'
                      ? 'rotate-6'
                      : status === 'correct' && question.symbolAnswer === '<'
                      ? '-rotate-6'
                      : 'rotate-0'
                  }`}
                />
                <div className="w-4 h-8 bg-slate-600 rounded-b-md" />
                <div className="w-16 h-2 bg-slate-800 rounded-full" />
              </div>
            </div>

            {/* Symbol Buttons (Big & Touch friendly) */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => handleSelectSymbol('>')}
                className="py-4 bg-amber-400 hover:bg-amber-500 active:scale-95 text-amber-950 font-black text-3xl sm:text-4xl rounded-2xl border-2 border-amber-500 shadow-sm transition-transform cursor-pointer flex flex-col items-center justify-center"
              >
                <span>&gt;</span>
                <span className="text-[11px] font-bold mt-1">Lớn hơn</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSymbol('=')}
                className="py-4 bg-indigo-100 hover:bg-indigo-200 active:scale-95 text-indigo-900 font-black text-3xl sm:text-4xl rounded-2xl border-2 border-indigo-300 shadow-sm transition-transform cursor-pointer flex flex-col items-center justify-center"
              >
                <span>=</span>
                <span className="text-[11px] font-bold mt-1">Bằng nhau</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSymbol('<')}
                className="py-4 bg-emerald-400 hover:bg-emerald-500 active:scale-95 text-emerald-950 font-black text-3xl sm:text-4xl rounded-2xl border-2 border-emerald-500 shadow-sm transition-transform cursor-pointer flex flex-col items-center justify-center"
              >
                <span>&lt;</span>
                <span className="text-[11px] font-bold mt-1">Bé hơn</span>
              </button>
            </div>
          </div>
        ) : (
          /* TYPE 2: SẮP XẾP DÃY SỐ THEO THỨ TỰ (BÉ ĐẾN LỚN HOẶC LỚN ĐẾN BÉ) */
          <div className="space-y-6">
            <div className="border-b border-amber-100 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span>Sắp xếp dãy số theo thứ tự:</span>
                  <span className={`px-2.5 py-0.5 rounded-lg text-sm font-extrabold ${
                    question.orderType === 'asc'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {question.orderType === 'asc' ? 'TỪ BÉ ĐẾN LỚN (Tăng dần)' : 'TỪ LỚN ĐẾN BÉ (Giảm dần)'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Bấm vào từng số bên dưới để xếp vào hàng theo đúng thứ tự nhé!
                </p>
              </div>

              {question.orderType === 'asc' ? (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                  <ArrowUpAZ className="w-4 h-4" />
                  <span>Bé nhất ➔ Lớn nhất</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
                  <ArrowDownAZ className="w-4 h-4" />
                  <span>Lớn nhất ➔ Bé nhất</span>
                </div>
              )}
            </div>

            {/* Target Placed Sequence Slots */}
            <div className="bg-amber-50/60 p-4 sm:p-6 rounded-2xl border border-amber-200/80 space-y-2">
              <div className="text-xs font-bold text-slate-600 mb-2">
                Hàng số bé đang xếp ({orderedList.length}/{question.sequence?.length || 0}):
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 min-h-[72px]">
                {Array.from({ length: question.sequence?.length || 4 }).map((_, i) => {
                  const num = orderedList[i];
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        if (num !== undefined && status !== 'correct') {
                          handleRemoveFromOrder(num, i);
                        }
                      }}
                      className={`min-w-[56px] sm:min-w-[68px] h-14 sm:h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                        num !== undefined
                          ? status === 'correct'
                            ? 'bg-emerald-500 border-emerald-600 text-white font-black text-xl sm:text-2xl shadow-md'
                            : 'bg-white border-amber-500 text-amber-950 font-black text-xl sm:text-2xl shadow-sm hover:scale-105 cursor-pointer'
                          : 'border-dashed border-amber-300 bg-amber-100/50 text-amber-400'
                      }`}
                      title={num !== undefined ? 'Bấm để trả lại số này' : `Vị trí thứ ${i + 1}`}
                    >
                      {num !== undefined ? (
                        <>
                          <span>{num}</span>
                          <span className="text-[9px] font-semibold opacity-75">Vị trí {i + 1}</span>
                        </>
                      ) : (
                        <span className="text-xs font-bold">Vị trí {i + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {orderedList.length > 0 && status !== 'correct' && (
                <div className="text-center pt-2">
                  <span className="text-[11px] text-slate-500">
                    💡 Bấm vào ô số đã xếp để trả lại nếu muốn đổi vị trí.
                  </span>
                </div>
              )}
            </div>

            {/* Remaining Numbers Pool to click */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Các số cần xếp (Bấm để chọn số tiếp theo):
                </span>
                {orderedList.length > 0 && status !== 'correct' && (
                  <button
                    type="button"
                    onClick={handleResetSort}
                    className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Xếp lại từ đầu</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 min-h-[72px]">
                {remainingPool.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">
                    Đã xếp hết các số! Hãy bấm nút kiểm tra bên dưới.
                  </span>
                ) : (
                  remainingPool.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handlePickNumber(n)}
                      className="min-w-[60px] sm:min-w-[70px] h-14 bg-amber-400 hover:bg-amber-500 active:scale-95 text-amber-950 font-black text-2xl rounded-xl border-2 border-amber-500 shadow-sm transition-transform cursor-pointer"
                    >
                      {n}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Check button for sequence */}
            {orderedList.length === (question.sequence?.length || 0) && status !== 'correct' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleCheckSort}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Kiểm tra dãy số của bé
                </button>
              </div>
            )}
          </div>
        )}

        {/* Feedback & Navigation Actions */}
        <div className="space-y-3 pt-4 border-t border-amber-100">
          {status === 'correct' && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-2 animate-pop">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm sm:text-base">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <span>Xuất sắc luôn! Bé nhận được +1 ★</span>
              </div>
              <button
                type="button"
                onClick={() => nextQuestion()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95 whitespace-nowrap"
              >
                <span>Câu tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {status === 'wrong' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-700 text-sm font-medium">
              <span>Chưa chính xác rồi! Bé hãy so sánh từng cặp chữ số hàng chục và hàng đơn vị nhé!</span>
              <button
                type="button"
                onClick={() => {
                  setChosenSymbol(null);
                  handleResetSort();
                  setStatus('idle');
                }}
                className="text-xs font-bold underline hover:text-rose-900 cursor-pointer ml-2"
              >
                Thử lại
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 cursor-pointer"
            >
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>{showExplanation ? 'Ẩn mẹo so sánh' : 'Xem mẹo so sánh số'}</span>
            </button>

            <button
              type="button"
              onClick={() => nextQuestion()}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đổi câu khác</span>
            </button>
          </div>

          {showExplanation && (
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs sm:text-sm text-slate-800 space-y-1.5 leading-relaxed">
              <p className="font-bold text-amber-900">💡 Bí quyết so sánh số trong phạm vi 1 đến 150:</p>
              <p>1. <strong>Số có nhiều chữ số hơn</strong> thì luôn lớn hơn (ví dụ: số 102 có 3 chữ số luôn lớn hơn số 98 có 2 chữ số).</p>
              <p>2. <strong>Nếu cùng số chữ số:</strong> So sánh lần lượt từ trái sang phải:</p>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>So sánh hàng trăm trước (100 &gt; 99).</li>
                <li>Nếu hàng trăm bằng nhau, so sánh hàng chục (142 &gt; 124 vì 4 chục &gt; 2 chục).</li>
                <li>Nếu hàng chục bằng nhau, so sánh hàng đơn vị (138 &gt; 135 vì 8 &gt; 5).</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
