import React, { useState, useEffect } from 'react';
import { Sparkles, HelpCircle, RotateCcw, Lightbulb, CheckCircle2, ChevronRight, BookOpen, Layers } from 'lucide-react';
import { CongTruQuestion } from '../types/math';
import { generateCongTruQuestion } from '../utils/mathGenerators';
import { NumberPad } from './NumberPad';
import { BaseTenVisualizer } from './BaseTenVisualizer';
import { sound } from '../utils/audio';

interface CongTruCoNhoSectionProps {
  onEarnStar: () => void;
}

export const CongTruCoNhoSection: React.FC<CongTruCoNhoSectionProps> = ({ onEarnStar }) => {
  const [opChoice, setOpChoice] = useState<'+' | '-' | 'both'>('both');
  const [mode, setMode] = useState<'standard' | 'step-by-step'>('standard');
  const [question, setQuestion] = useState<CongTruQuestion>(() => generateCongTruQuestion());
  const [userInput, setUserInput] = useState<string>('');
  
  // Step-by-step mode states
  const [step, setStep] = useState<1 | 2>(1);
  const [step1UnitInput, setStep1UnitInput] = useState<string>('');
  const [step2TensInput, setStep2TensInput] = useState<string>('');
  const [carryBoxFilled, setCarryBoxFilled] = useState<boolean>(false);

  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showSticks, setShowSticks] = useState<boolean>(true);
  const [streak, setStreak] = useState<number>(0);

  const nextQuestion = (op = opChoice) => {
    const chosenOp = op === 'both' ? (Math.random() < 0.5 ? '+' : '-') : op;
    setQuestion(generateCongTruQuestion(chosenOp));
    setUserInput('');
    setStep(1);
    setStep1UnitInput('');
    setStep2TensInput('');
    setCarryBoxFilled(false);
    setStatus('idle');
    setShowExplanation(false);
  };

  const handleOpChoiceChange = (newOp: '+' | '-' | 'both') => {
    setOpChoice(newOp);
    nextQuestion(newOp);
  };

  const handleCheckStandard = () => {
    if (!userInput.trim()) return;
    const ans = parseInt(userInput, 10);
    if (ans === question.result) {
      sound.playCorrect();
      setStatus('correct');
      setStreak((s) => s + 1);
      onEarnStar();
    } else {
      sound.playIncorrect();
      setStatus('wrong');
    }
  };

  const handleCheckStep1 = () => {
    const expectedUnit = question.result % 10;
    const ans = parseInt(step1UnitInput, 10);
    if (ans === expectedUnit) {
      sound.playCorrect();
      setCarryBoxFilled(true);
      setStep(2);
      setStatus('idle');
    } else {
      sound.playIncorrect();
      setStatus('wrong');
    }
  };

  const handleCheckStep2 = () => {
    const expectedTens = Math.floor(question.result / 10);
    const ans = parseInt(step2TensInput, 10);
    if (ans === expectedTens) {
      sound.playCorrect();
      setStatus('correct');
      setStreak((s) => s + 1);
      onEarnStar();
    } else {
      sound.playIncorrect();
      setStatus('wrong');
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (mode === 'standard') {
          if (userInput.length < 3) {
            setUserInput((prev) => prev + e.key);
            setStatus('idle');
          }
        } else {
          if (step === 1 && step1UnitInput.length < 1) {
            setStep1UnitInput(e.key);
            setStatus('idle');
          } else if (step === 2 && step2TensInput.length < 2) {
            setStep2TensInput((prev) => prev + e.key);
            setStatus('idle');
          }
        }
      } else if (e.key === 'Backspace') {
        if (mode === 'standard') {
          setUserInput((prev) => prev.slice(0, -1));
        } else {
          if (step === 1) setStep1UnitInput('');
          else setStep2TensInput((prev) => prev.slice(0, -1));
        }
        setStatus('idle');
      } else if (e.key === 'Enter') {
        if (status === 'correct') {
          nextQuestion();
        } else if (mode === 'standard') {
          handleCheckStandard();
        } else {
          if (step === 1) handleCheckStep1();
          else handleCheckStep2();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userInput, step, step1UnitInput, step2TensInput, mode, status, question]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-amber-200/80 shadow-xs">
        {/* Operation Filter */}
        <div className="flex items-center gap-1 p-1 bg-amber-50 rounded-xl border border-amber-200/60">
          <button
            type="button"
            onClick={() => handleOpChoiceChange('both')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer ${
              opChoice === 'both' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            Cả Cộng & Trừ
          </button>
          <button
            type="button"
            onClick={() => handleOpChoiceChange('+')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer ${
              opChoice === '+' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            + Cộng có nhớ
          </button>
          <button
            type="button"
            onClick={() => handleOpChoiceChange('-')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer ${
              opChoice === '-' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            - Trừ có nhớ
          </button>
        </div>

        {/* Learning Mode */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setMode('standard');
            }}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              mode === 'standard' ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tự tính nhanh
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setMode('step-by-step');
            }}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              mode === 'step-by-step' ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hướng dẫn từng bước
          </button>
        </div>
      </div>

      {/* Main Learning Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Vertical Column Math & Visual Que Tính */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-amber-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {question.operation === '+'
                  ? 'Phép cộng có nhớ trong phạm vi 100'
                  : 'Phép trừ có nhớ trong phạm vi 100'}
              </h2>
              <p className="text-xs text-slate-500">
                Đặt tính rồi tính theo cột dọc (Tính từ phải sang trái)
              </p>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-xs font-bold text-amber-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Liên tiếp: {streak}</span>
            </div>
          </div>

          {/* CHUẨN CỘT DỌC ĐẶT TÍNH RỒI TÍNH CỦA TIỂU HỌC VIỆT NAM */}
          <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200/80 flex flex-col items-center">
            {/* Headers: Chục & Đơn vị */}
            <div className="w-56 grid grid-cols-2 text-center text-xs font-bold text-slate-500 mb-2 border-b border-dashed border-amber-300 pb-1">
              <span className="text-amber-800">Hàng Chục</span>
              <span className="text-blue-800">Hàng Đơn Vị</span>
            </div>

            {/* Math layout */}
            <div className="relative w-56 font-mono text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              {/* Carry / Borrow Memory Circle on top of Tens column */}
              <div className="flex justify-start pl-8 mb-1">
                <div
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center border transition-all ${
                    carryBoxFilled || showExplanation || status === 'correct'
                      ? 'bg-rose-500 border-rose-600 text-white scale-110 shadow-xs'
                      : 'bg-amber-100 border-amber-300 text-amber-600 border-dashed'
                  }`}
                  title="Ô ghi nhớ (nhớ 1 sang hàng chục)"
                >
                  {carryBoxFilled || showExplanation || status === 'correct' ? '1' : 'nhớ'}
                </div>
              </div>

              {/* Number 1 */}
              <div className="grid grid-cols-2 text-center py-1">
                <span className="text-amber-900">{question.tens1}</span>
                <span className="text-blue-900">{question.unit1}</span>
              </div>

              {/* Operator & Number 2 */}
              <div className="relative grid grid-cols-2 text-center py-1">
                <span className="absolute -left-4 sm:-left-6 top-1 text-2xl sm:text-3xl font-extrabold text-amber-600 font-sans">
                  {question.operation}
                </span>
                <span className="text-amber-900">{question.tens2}</span>
                <span className="text-blue-900">{question.unit2}</span>
              </div>

              {/* Divider Line */}
              <div className="w-full h-1 bg-slate-800 rounded-full my-2" />

              {/* Result Row */}
              {mode === 'standard' ? (
                <div className="grid grid-cols-2 text-center py-1">
                  <div className="col-span-2 flex items-center justify-center">
                    <span
                      className={`min-w-[100px] h-14 rounded-xl border-2 flex items-center justify-center text-3xl font-black tracking-wider transition-all shadow-inner ${
                        status === 'correct'
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                          : status === 'wrong'
                          ? 'bg-rose-50 border-rose-400 text-rose-800'
                          : userInput
                          ? 'bg-white border-amber-500 text-slate-900 shadow-sm'
                          : 'bg-white border-dashed border-amber-300 text-slate-300 animate-pulse'
                      }`}
                    >
                      {userInput || '?'}
                    </span>
                  </div>
                </div>
              ) : (
                /* Step-by-step separated digits */
                <div className="grid grid-cols-2 text-center py-1 gap-2">
                  {/* Tens digit */}
                  <div
                    className={`h-14 rounded-xl border-2 flex items-center justify-center text-3xl font-black transition-all ${
                      step === 2
                        ? 'border-amber-500 bg-amber-100 text-amber-950 animate-pulse-glow'
                        : step2TensInput || status === 'correct'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                        : 'border-dashed border-slate-300 bg-slate-50 text-slate-300'
                    }`}
                  >
                    {status === 'correct'
                      ? Math.floor(question.result / 10)
                      : step2TensInput || (step === 2 ? '?' : '—')}
                  </div>

                  {/* Units digit */}
                  <div
                    className={`h-14 rounded-xl border-2 flex items-center justify-center text-3xl font-black transition-all ${
                      step === 1
                        ? 'border-blue-500 bg-blue-100 text-blue-950 animate-pulse-glow'
                        : step1UnitInput
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                        : 'border-dashed border-slate-300 bg-slate-50 text-slate-300'
                    }`}
                  >
                    {step1UnitInput || (step === 1 ? '?' : question.result % 10)}
                  </div>
                </div>
              )}
            </div>

            {/* Guided Prompt for Step-by-Step */}
            {mode === 'step-by-step' && status !== 'correct' && (
              <div className="mt-4 p-3 bg-white rounded-xl border border-amber-200 text-xs sm:text-sm text-slate-700 text-center font-medium shadow-xs max-w-md">
                {step === 1 ? (
                  <div>
                    <span className="font-bold text-blue-700">Bước 1: Tính hàng đơn vị</span>
                    <p className="mt-1">{question.step1Text}</p>
                    <p className="text-amber-800 font-bold mt-1">Bé hãy nhập chữ số hàng đơn vị vào ô bên phải nhé!</p>
                  </div>
                ) : (
                  <div>
                    <span className="font-bold text-amber-700">Bước 2: Tính hàng chục</span>
                    <p className="mt-1">{question.step2Text}</p>
                    <p className="text-amber-800 font-bold mt-1">Bé hãy nhập chữ số hàng chục vào ô bên trái nhé!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive Base-Ten / Que Tính Visualizer Toggle */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowSticks(!showSticks)}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-amber-600" />
              <span>{showSticks ? 'Ẩn mô hình que tính' : 'Xem mô hình que tính trực quan'}</span>
            </button>

            {showSticks && (
              <div className="space-y-2 bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200">
                <BaseTenVisualizer
                  tens={question.tens1}
                  units={question.unit1}
                  label={`Số thứ nhất: ${question.num1}`}
                  color="amber"
                />
                <BaseTenVisualizer
                  tens={question.tens2}
                  units={question.unit2}
                  label={`Số thứ hai: ${question.num2}`}
                  color="blue"
                />
                {status === 'correct' && (
                  <BaseTenVisualizer
                    tens={Math.floor(question.result / 10)}
                    units={question.result % 10}
                    label={`Kết quả: ${question.result}`}
                    color="emerald"
                  />
                )}
              </div>
            )}
          </div>

          {/* Feedback & Navigation Actions */}
          <div className="space-y-3">
            {status === 'correct' && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-2 animate-pop">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm sm:text-base">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <span>Bé tính chuẩn xác rồi! Nhận ngay +1 ★</span>
                </div>
                <button
                  type="button"
                  onClick={() => nextQuestion()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95 whitespace-nowrap"
                >
                  <span>Phép tính tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {status === 'wrong' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-700 text-sm font-medium">
                <span>Chưa đúng rồi! Bé nhớ cộng thêm hoặc mượn 1 chục nhé!</span>
                <button
                  type="button"
                  onClick={() => {
                    setUserInput('');
                    if (mode === 'step-by-step') {
                      if (step === 1) setStep1UnitInput('');
                      else setStep2TensInput('');
                    }
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
                <span>{showExplanation ? 'Ẩn lời giải chi tiết' : 'Xem cách làm chi tiết'}</span>
              </button>

              <button
                type="button"
                onClick={() => nextQuestion()}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đổi phép tính khác</span>
              </button>
            </div>

            {showExplanation && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs sm:text-sm text-slate-800 space-y-2 leading-relaxed">
                <div className="font-bold text-amber-900 text-sm flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-amber-700" />
                  <span>Lời giải từng bước chuẩn sách giáo khoa:</span>
                </div>
                <div className="pl-2 border-l-2 border-amber-400 space-y-1">
                  <p>• <strong>Bước 1 (Tính hàng đơn vị):</strong> {question.step1Text}</p>
                  <p>• <strong>Bước 2 (Tính hàng chục):</strong> {question.step2Text}</p>
                  <p className="font-bold text-emerald-800 pt-1">
                    👉 Vậy {question.num1} {question.operation} {question.num2} = {question.result}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Number Pad */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
            <div className="text-center mb-3">
              <span className="text-xs text-slate-500 font-semibold">
                {mode === 'standard'
                  ? 'Kết quả bé nhập:'
                  : step === 1
                  ? 'Chữ số hàng đơn vị:'
                  : 'Chữ số hàng chục:'}
              </span>
              <div className="text-3xl font-black text-amber-900 h-10 flex items-center justify-center">
                {mode === 'standard' ? (
                  userInput || <span className="text-slate-300 font-normal text-2xl">Bấm số...</span>
                ) : step === 1 ? (
                  step1UnitInput || <span className="text-slate-300 font-normal text-2xl">Nhập đơn vị...</span>
                ) : (
                  step2TensInput || <span className="text-slate-300 font-normal text-2xl">Nhập hàng chục...</span>
                )}
              </div>
            </div>

            <NumberPad
              onNumberClick={(d) => {
                if (mode === 'standard') {
                  if (userInput.length < 3) {
                    setUserInput((prev) => prev + d);
                    setStatus('idle');
                  }
                } else {
                  if (step === 1 && step1UnitInput.length < 1) {
                    setStep1UnitInput(d);
                    setStatus('idle');
                  } else if (step === 2 && step2TensInput.length < 2) {
                    setStep2TensInput((prev) => prev + d);
                    setStatus('idle');
                  }
                }
              }}
              onDelete={() => {
                if (mode === 'standard') {
                  setUserInput((prev) => prev.slice(0, -1));
                } else {
                  if (step === 1) setStep1UnitInput('');
                  else setStep2TensInput((prev) => prev.slice(0, -1));
                }
                setStatus('idle');
              }}
              onClear={() => {
                if (mode === 'standard') setUserInput('');
                else {
                  if (step === 1) setStep1UnitInput('');
                  else setStep2TensInput('');
                }
                setStatus('idle');
              }}
              onSubmit={() => {
                if (mode === 'standard') handleCheckStandard();
                else if (step === 1) handleCheckStep1();
                else handleCheckStep2();
              }}
              submitDisabled={
                status === 'correct' ||
                (mode === 'standard' ? !userInput : step === 1 ? !step1UnitInput : !step2TensInput)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
