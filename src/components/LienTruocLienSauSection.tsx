import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, Lightbulb, CheckCircle2, ChevronRight, Navigation, Train } from 'lucide-react';
import { LienTruocSauQuestion } from '../types/math';
import { generateLienTruocSauQuestion } from '../utils/mathGenerators';
import { NumberPad } from './NumberPad';
import { sound } from '../utils/audio';
import { useVirtualKeypad } from '../context/VirtualKeypadContext';

interface LienTruocLienSauSectionProps {
  onEarnStar: () => void;
}

export const LienTruocLienSauSection: React.FC<LienTruocLienSauSectionProps> = ({ onEarnStar }) => {
  const { openKeypad, updateKeypadValue, closeKeypad } = useVirtualKeypad();
  const [question, setQuestion] = useState<LienTruocSauQuestion>(() => generateLienTruocSauQuestion());
  
  // Focused slot when both before & after need to be answered
  const [activeSlot, setActiveSlot] = useState<'before' | 'after' | 'middle'>('before');
  const [inputBefore, setInputBefore] = useState<string>('');
  const [inputAfter, setInputAfter] = useState<string>('');
  const [inputMiddle, setInputMiddle] = useState<string>('');

  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showNumberLine, setShowNumberLine] = useState<boolean>(true);
  const [numberLineCenter, setNumberLineCenter] = useState<number>(question.targetNumber);
  const [streak, setStreak] = useState<number>(0);

  const nextQuestion = () => {
    const q = generateLienTruocSauQuestion();
    setQuestion(q);
    setInputBefore('');
    setInputAfter('');
    setInputMiddle('');
    setStatus('idle');
    setNumberLineCenter(q.targetNumber);
    closeKeypad();
    if (q.type === 'after') setActiveSlot('after');
    else if (q.type === 'middle') setActiveSlot('middle');
    else setActiveSlot('before');
  };

  const isCurrentValid = () => {
    if (question.type === 'before') {
      return parseInt(inputBefore, 10) === question.beforeVal;
    }
    if (question.type === 'after') {
      return parseInt(inputAfter, 10) === question.afterVal;
    }
    if (question.type === 'middle') {
      return parseInt(inputMiddle, 10) === question.targetNumber;
    }
    // both
    return (
      parseInt(inputBefore, 10) === question.beforeVal &&
      parseInt(inputAfter, 10) === question.afterVal
    );
  };

  const handleCheck = () => {
    if (isCurrentValid()) {
      sound.playCorrect();
      setStatus('correct');
      setStreak((s) => s + 1);
      onEarnStar();
    } else {
      sound.playIncorrect();
      setStatus('wrong');
    }
  };

  const handlePadDigit = (d: string) => {
    if (question.type === 'before' || (question.type === 'both' && activeSlot === 'before')) {
      if (inputBefore.length < 3) setInputBefore((p) => p + d);
    } else if (question.type === 'after' || (question.type === 'both' && activeSlot === 'after')) {
      if (inputAfter.length < 3) setInputAfter((p) => p + d);
    } else if (question.type === 'middle') {
      if (inputMiddle.length < 3) setInputMiddle((p) => p + d);
    }
    setStatus('idle');
  };

  const handlePadDelete = () => {
    if (question.type === 'before' || (question.type === 'both' && activeSlot === 'before')) {
      setInputBefore((p) => p.slice(0, -1));
    } else if (question.type === 'after' || (question.type === 'both' && activeSlot === 'after')) {
      setInputAfter((p) => p.slice(0, -1));
    } else if (question.type === 'middle') {
      setInputMiddle((p) => p.slice(0, -1));
    }
    setStatus('idle');
  };

  const handlePadClear = () => {
    if (question.type === 'both') {
      if (activeSlot === 'before') setInputBefore('');
      else setInputAfter('');
    } else {
      setInputBefore('');
      setInputAfter('');
      setInputMiddle('');
    }
    setStatus('idle');
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePadDigit(e.key);
      } else if (e.key === 'Backspace') {
        handlePadDelete();
      } else if (e.key === 'Enter') {
        if (status === 'correct') {
          nextQuestion();
        } else {
          handleCheck();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputBefore, inputAfter, inputMiddle, activeSlot, status, question]);

  // Generate range of 9 numbers around center for the number line
  const startNum = Math.max(1, Math.min(142, numberLineCenter - 4));
  const numberLineItems = Array.from({ length: 9 }, (_, i) => startNum + i);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Train & Visual Stage */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-amber-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Số liền trước và liền sau từ 1 đến 150
              </h2>
              <p className="text-xs text-slate-500">
                Liền trước = Bớt 1 (-1) · Liền sau = Thêm 1 (+1)
              </p>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-xs font-bold text-amber-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Liên tiếp: {streak}</span>
            </div>
          </div>

          {/* CÂU HỎI BẰNG LỜI */}
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-slate-800 font-semibold text-center text-sm sm:text-base">
            {question.type === 'before' && (
              <span>
                Số <strong className="text-amber-800">liền trước</strong> của số{' '}
                <span className="text-xl font-black text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                  {question.targetNumber}
                </span>{' '}
                là số nào?
              </span>
            )}
            {question.type === 'after' && (
              <span>
                Số <strong className="text-amber-800">liền sau</strong> của số{' '}
                <span className="text-xl font-black text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                  {question.targetNumber}
                </span>{' '}
                là số nào?
              </span>
            )}
            {question.type === 'both' && (
              <span>
                Bé hãy điền cả số <strong className="text-blue-700">liền trước</strong> và số{' '}
                <strong className="text-emerald-700">liền sau</strong> của số{' '}
                <span className="text-xl font-black text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                  {question.targetNumber}
                </span>
                !
              </span>
            )}
            {question.type === 'middle' && (
              <span>
                Số nào đứng ở <strong className="text-indigo-700">chính giữa</strong> số{' '}
                <strong>{question.beforeVal}</strong> và số <strong>{question.afterVal}</strong>?
              </span>
            )}
          </div>

          {/* ĐOÀN TÀU TOÁN HỌC TRỰC QUAN */}
          <div className="bg-gradient-to-b from-sky-50 to-amber-50/50 p-4 sm:p-6 rounded-2xl border border-sky-200/80 overflow-x-auto">
            <div className="flex items-end justify-center min-w-[340px] gap-2 pb-2">
              {/* Locomotive Engine */}
              <div className="flex flex-col items-center shrink-0">
                <div className="text-3xl animate-bounce">💨</div>
                <div className="w-16 h-18 bg-indigo-600 rounded-t-xl rounded-b-md text-white flex flex-col items-center justify-center shadow-md border-2 border-indigo-800 relative">
                  <span className="text-[10px] font-bold text-amber-300">ĐẦU TÀU</span>
                  <Train className="w-6 h-6 text-white mt-0.5" />
                  {/* Wheel */}
                  <div className="absolute -bottom-2 flex gap-2">
                    <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-amber-300" />
                    <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-amber-300" />
                  </div>
                </div>
              </div>

              {/* Hitch connector */}
              <div className="w-3 h-1 bg-slate-600 mb-6 shrink-0" />

              {/* Car 1: Liền Trước */}
              <div
                onClick={() => {
                  if (question.type === 'before' || question.type === 'both') {
                    sound.playClick();
                    setActiveSlot('before');
                    openKeypad({
                      title: 'Số liền trước (-1)',
                      value: inputBefore,
                      onDigit: (d) => {
                        if (inputBefore.length < 3) {
                          const next = inputBefore + d;
                          setInputBefore(next);
                          updateKeypadValue(next);
                          setStatus('idle');
                        }
                      },
                      onDelete: () => {
                        const next = inputBefore.slice(0, -1);
                        setInputBefore(next);
                        updateKeypadValue(next);
                        setStatus('idle');
                      },
                      onClear: () => {
                        setInputBefore('');
                        updateKeypadValue('');
                        setStatus('idle');
                      },
                      onSubmit: handleCheck,
                    });
                  }
                }}
                className={`flex flex-col items-center shrink-0 transition-transform ${
                  question.type === 'before' || question.type === 'both' ? 'cursor-pointer' : ''
                }`}
              >
                <span className="text-[11px] font-bold text-blue-800 mb-1">
                  Liền trước (-1)
                </span>
                <div
                  className={`w-20 h-20 sm:w-22 sm:h-22 rounded-xl flex flex-col items-center justify-center font-black text-2xl sm:text-3xl border-3 shadow-md relative ${
                    question.type === 'before' || question.type === 'both'
                      ? activeSlot === 'before'
                        ? 'bg-blue-100 border-blue-500 text-blue-950 animate-pulse-glow'
                        : 'bg-white border-blue-300 text-blue-900'
                      : 'bg-blue-50 border-blue-300 text-blue-900'
                  }`}
                >
                  {question.type === 'before' || question.type === 'both' ? (
                    <span className="text-3xl">{inputBefore || '?'}</span>
                  ) : (
                    question.beforeVal
                  )}

                  {/* Wheels */}
                  <div className="absolute -bottom-2.5 flex gap-5">
                    <div className="w-4 h-4 rounded-full bg-slate-800 border-2 border-amber-300" />
                    <div className="w-4 h-4 rounded-full bg-slate-800 border-2 border-amber-300" />
                  </div>
                </div>
              </div>

              {/* Hitch connector */}
              <div className="w-3 h-1 bg-slate-600 mb-6 shrink-0" />

              {/* Car 2: Số Ở Giữa (Target) */}
              <div
                onClick={() => {
                  if (question.type === 'middle') {
                    sound.playClick();
                    setActiveSlot('middle');
                    openKeypad({
                      title: 'Số ở giữa',
                      value: inputMiddle,
                      onDigit: (d) => {
                        if (inputMiddle.length < 3) {
                          const next = inputMiddle + d;
                          setInputMiddle(next);
                          updateKeypadValue(next);
                          setStatus('idle');
                        }
                      },
                      onDelete: () => {
                        const next = inputMiddle.slice(0, -1);
                        setInputMiddle(next);
                        updateKeypadValue(next);
                        setStatus('idle');
                      },
                      onClear: () => {
                        setInputMiddle('');
                        updateKeypadValue('');
                        setStatus('idle');
                      },
                      onSubmit: handleCheck,
                    });
                  }
                }}
                className={`flex flex-col items-center shrink-0 ${
                  question.type === 'middle' ? 'cursor-pointer' : ''
                }`}
              >
                <span className="text-[11px] font-bold text-indigo-800 mb-1">
                  Số ở giữa
                </span>
                <div
                  className={`w-20 h-20 sm:w-22 sm:h-22 rounded-xl flex flex-col items-center justify-center font-black text-2xl sm:text-3xl border-3 shadow-md relative ${
                    question.type === 'middle'
                      ? 'bg-indigo-100 border-indigo-500 text-indigo-950 animate-pulse-glow'
                      : 'bg-amber-400 border-amber-600 text-amber-950'
                  }`}
                >
                  {question.type === 'middle' ? (
                    <span className="text-3xl">{inputMiddle || '?'}</span>
                  ) : (
                    question.targetNumber
                  )}

                  {/* Wheels */}
                  <div className="absolute -bottom-2.5 flex gap-5">
                    <div className="w-4 h-4 rounded-full bg-slate-800 border-2 border-amber-300" />
                    <div className="w-4 h-4 rounded-full bg-slate-800 border-2 border-amber-300" />
                  </div>
                </div>
              </div>

              {/* Hitch connector */}
              <div className="w-3 h-1 bg-slate-600 mb-6 shrink-0" />

              {/* Car 3: Liền Sau */}
              <div
                onClick={() => {
                  if (question.type === 'after' || question.type === 'both') {
                    sound.playClick();
                    setActiveSlot('after');
                    openKeypad({
                      title: 'Số liền sau (+1)',
                      value: inputAfter,
                      onDigit: (d) => {
                        if (inputAfter.length < 3) {
                          const next = inputAfter + d;
                          setInputAfter(next);
                          updateKeypadValue(next);
                          setStatus('idle');
                        }
                      },
                      onDelete: () => {
                        const next = inputAfter.slice(0, -1);
                        setInputAfter(next);
                        updateKeypadValue(next);
                        setStatus('idle');
                      },
                      onClear: () => {
                        setInputAfter('');
                        updateKeypadValue('');
                        setStatus('idle');
                      },
                      onSubmit: handleCheck,
                    });
                  }
                }}
                className={`flex flex-col items-center shrink-0 transition-transform ${
                  question.type === 'after' || question.type === 'both' ? 'cursor-pointer' : ''
                }`}
              >
                <span className="text-[11px] font-bold text-emerald-800 mb-1">
                  Liền sau (+1)
                </span>
                <div
                  className={`w-20 h-20 sm:w-22 sm:h-22 rounded-xl flex flex-col items-center justify-center font-black text-2xl sm:text-3xl border-3 shadow-md relative ${
                    question.type === 'after' || question.type === 'both'
                      ? activeSlot === 'after'
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-950 animate-pulse-glow'
                        : 'bg-white border-emerald-300 text-emerald-900'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  }`}
                >
                  {question.type === 'after' || question.type === 'both' ? (
                    <span className="text-3xl">{inputAfter || '?'}</span>
                  ) : (
                    question.afterVal
                  )}

                  {/* Wheels */}
                  <div className="absolute -bottom-2.5 flex gap-5">
                    <div className="w-4 h-4 rounded-full bg-slate-800 border-2 border-amber-300" />
                    <div className="w-4 h-4 rounded-full bg-slate-800 border-2 border-amber-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Railway tracks */}
            <div className="w-full h-3 border-t-2 border-b-2 border-slate-700 mt-2 flex items-center justify-around">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-1 h-3 bg-amber-900/60" />
              ))}
            </div>
          </div>

          {/* TIA SỐ TƯƠNG TÁC TỪ 1 ĐẾN 150 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowNumberLine(!showNumberLine)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                <span>{showNumberLine ? 'Ẩn tia số tra cứu' : 'Xem tia số từ 1 đến 150'}</span>
              </button>
              <div className="text-xs text-slate-500">
                Kéo xem dãy số xung quanh
              </div>
            </div>

            {showNumberLine && (
              <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between overflow-x-auto gap-1 sm:gap-2 pb-1">
                  {numberLineItems.map((n) => {
                    const isTarget = n === question.targetNumber;
                    const isBefore = n === question.beforeVal;
                    const isAfter = n === question.afterVal;
                    return (
                      <div
                        key={n}
                        className={`flex flex-col items-center min-w-[34px] sm:min-w-[40px] py-1 px-1 rounded-lg border text-center transition-all ${
                          isTarget
                            ? 'bg-amber-400 border-amber-600 text-amber-950 font-black scale-105 shadow-xs'
                            : isBefore
                            ? 'bg-blue-100 border-blue-400 text-blue-950 font-bold'
                            : isAfter
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 text-xs'
                        }`}
                      >
                        <span className="text-xs sm:text-sm tabular-nums">{n}</span>
                        <div
                          className={`w-1.5 h-1.5 rounded-full mt-1 ${
                            isTarget
                              ? 'bg-amber-800'
                              : isBefore
                              ? 'bg-blue-600'
                              : isAfter
                              ? 'bg-emerald-600'
                              : 'bg-slate-300'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Range Slider to shift number line anywhere between 1 and 150 */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500 font-bold">1</span>
                  <input
                    type="range"
                    min="1"
                    max="150"
                    value={numberLineCenter}
                    onChange={(e) => setNumberLineCenter(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-500 font-bold">150</span>
                </div>
              </div>
            )}
          </div>

          {/* Feedback & Next Button */}
          <div className="space-y-3">
            {status === 'correct' && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-2 animate-pop">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm sm:text-base">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <span>Đúng rồi! Đoàn tàu đã sẵn sàng khởi hành! +1 ★</span>
                </div>
                <button
                  type="button"
                  onClick={nextQuestion}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95 whitespace-nowrap"
                >
                  <span>Chuyến tiếp theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {status === 'wrong' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-700 text-sm font-medium">
                <span>Chưa đúng rồi! Bé nhớ: Liền trước thì bớt 1, liền sau thì thêm 1 nhé!</span>
                <button
                  type="button"
                  onClick={handlePadClear}
                  className="text-xs font-bold underline hover:text-rose-900 cursor-pointer ml-2"
                >
                  Thử lại
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-600">
                💡 <strong>Ghi nhớ:</strong> Muốn tìm số liền trước ta lấy số đó <strong className="text-blue-700">- 1</strong>. Muốn tìm số liền sau ta lấy số đó <strong className="text-emerald-700">+ 1</strong>.
              </div>
              <button
                type="button"
                onClick={nextQuestion}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer shrink-0 ml-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đổi số khác</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Number Pad */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
            {/* If both slots exist, show toggle switch */}
            {question.type === 'both' && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveSlot('before');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                    activeSlot === 'before'
                      ? 'bg-blue-500 text-white border-blue-600 shadow-xs'
                      : 'bg-blue-50 text-blue-900 border-blue-200'
                  }`}
                >
                  Toa trước: <span className="font-extrabold">{inputBefore || '?'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveSlot('after');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                    activeSlot === 'after'
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  }`}
                >
                  Toa sau: <span className="font-extrabold">{inputAfter || '?'}</span>
                </button>
              </div>
            )}

            <div className="text-center mb-3">
              <span className="text-xs text-slate-500 font-semibold">
                {question.type === 'before'
                  ? 'Số liền trước đang nhập:'
                  : question.type === 'after'
                  ? 'Số liền sau đang nhập:'
                  : question.type === 'middle'
                  ? 'Số ở giữa đang nhập:'
                  : activeSlot === 'before'
                  ? 'Nhập số liền trước:'
                  : 'Nhập số liền sau:'}
              </span>
              <div className="text-3xl font-black text-amber-900 h-10 flex items-center justify-center">
                {(question.type === 'before'
                  ? inputBefore
                  : question.type === 'after'
                  ? inputAfter
                  : question.type === 'middle'
                  ? inputMiddle
                  : activeSlot === 'before'
                  ? inputBefore
                  : inputAfter) || <span className="text-slate-300 font-normal text-2xl">Bấm số...</span>}
              </div>
            </div>

            <NumberPad
              onNumberClick={handlePadDigit}
              onDelete={handlePadDelete}
              onClear={handlePadClear}
              onSubmit={handleCheck}
              submitDisabled={
                status === 'correct' ||
                (question.type === 'before'
                  ? !inputBefore
                  : question.type === 'after'
                  ? !inputAfter
                  : question.type === 'middle'
                  ? !inputMiddle
                  : !inputBefore || !inputAfter)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
