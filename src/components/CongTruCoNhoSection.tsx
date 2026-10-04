import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, Lightbulb, CheckCircle2, ChevronRight, BookOpen, Layers, Check } from 'lucide-react';
import { CongTruQuestion } from '../types/math';
import { generateCongTruQuestion, CongTruRange } from '../utils/mathGenerators';
import { NumberPad } from './NumberPad';
import { BaseTenVisualizer } from './BaseTenVisualizer';
import { sound } from '../utils/audio';
import { useVirtualKeypad } from '../context/VirtualKeypadContext';

interface CongTruCoNhoSectionProps {
  onEarnStar: () => void;
}

export const CongTruCoNhoSection: React.FC<CongTruCoNhoSectionProps> = ({ onEarnStar }) => {
  const { openKeypad, updateKeypadValue, closeKeypad } = useVirtualKeypad();
  const [opChoice, setOpChoice] = useState<'+' | '-' | 'both'>('both');
  const [rangeChoice, setRangeChoice] = useState<CongTruRange>('within100');
  
  const [question, setQuestion] = useState<CongTruQuestion>(() =>
    generateCongTruQuestion({ operation: '+', range: 'within100' })
  );
  
  // 3 distinct inputs filled by the child before checking:
  // 1. unitInput: Chữ số hàng đơn vị
  // 2. tensInput: Chữ số hàng chục
  // 3. carryInput: Ô nhớ 1 ở phía bên phải phép tính
  const [unitInput, setUnitInput] = useState<string>('');
  const [tensInput, setTensInput] = useState<string>('');
  const [carryInput, setCarryInput] = useState<string>('');
  
  const [activeSlot, setActiveSlot] = useState<'unit' | 'tens' | 'carry'>('unit');

  // Evaluation states: only checked when user clicks "Kiểm tra kết quả"
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showSticks, setShowSticks] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);

  const nextQuestion = (op = opChoice, range = rangeChoice) => {
    const chosenOp = op === 'both' ? (Math.random() < 0.5 ? '+' : '-') : op;
    const q = generateCongTruQuestion({ operation: chosenOp, range });
    setQuestion(q);
    setUnitInput('');
    setTensInput('');
    setCarryInput('');
    setActiveSlot('unit');
    setStatus('idle');
    setErrorMessage('');
    setShowExplanation(false);
    closeKeypad();
  };

  const handleOpChoiceChange = (newOp: '+' | '-' | 'both') => {
    setOpChoice(newOp);
    nextQuestion(newOp, rangeChoice);
  };

  const handleRangeChange = (newRange: CongTruRange) => {
    sound.playClick();
    setRangeChoice(newRange);
    nextQuestion(opChoice, newRange);
  };

  // "Làm xong rồi mới kiểm tra đúng hay sai"
  const handleCheck = () => {
    const expectedUnit = question.result % 10;
    const expectedTens = Math.floor(question.result / 10);
    const expectedCarry = 1; // Both addition with carry and subtraction with borrow require 1

    const u = parseInt(unitInput, 10);
    const t = parseInt(tensInput, 10);
    const c = parseInt(carryInput, 10);

    const isResultCorrect = u === expectedUnit && t === expectedTens;
    const isCarryCorrect = c === expectedCarry;

    if (isResultCorrect && isCarryCorrect) {
      sound.playCorrect();
      setStatus('correct');
      setErrorMessage('');
      setStreak((s) => s + 1);
      onEarnStar();
    } else {
      sound.playIncorrect();
      setStatus('wrong');
      if (!isResultCorrect && !isCarryCorrect) {
        setErrorMessage('Kết quả và số nhớ đều chưa đúng, bé hãy tính lại nhé!');
      } else if (!isResultCorrect) {
        setErrorMessage('Kết quả tính chưa đúng, bé kiểm tra lại hàng đơn vị và hàng chục nhé!');
      } else {
        setErrorMessage('Kết quả tính đúng rồi, nhưng ở ô bên phải bé cần điền số nhớ 1 nhé!');
      }
    }
  };

  const handleDigit = (d: string) => {
    if (activeSlot === 'unit') {
      setUnitInput(d);
      updateKeypadValue(d);
      setActiveSlot('tens');
    } else if (activeSlot === 'tens') {
      setTensInput(d);
      updateKeypadValue(d);
      setActiveSlot('carry');
    } else {
      setCarryInput(d);
      updateKeypadValue(d);
    }
    setStatus('idle');
  };

  const handleDelete = () => {
    if (activeSlot === 'unit') {
      setUnitInput('');
      updateKeypadValue('');
    } else if (activeSlot === 'tens') {
      setTensInput('');
      updateKeypadValue('');
    } else {
      setCarryInput('');
      updateKeypadValue('');
    }
    setStatus('idle');
  };

  const handleClear = () => {
    setUnitInput('');
    setTensInput('');
    setCarryInput('');
    updateKeypadValue('');
    setActiveSlot('unit');
    setStatus('idle');
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
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
  }, [unitInput, tensInput, carryInput, activeSlot, status, question]);

  const isAddition = question.operation === '+';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-3">
        {/* Row 1: Phép tính (+, -, Cả hai) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
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

          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-xs font-bold text-amber-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Liên tiếp: {streak}</span>
          </div>
        </div>

        {/* Row 2: Chọn khoảng số ra đề */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-100 text-xs">
          <span className="font-bold text-amber-900 shrink-0">Chọn khoảng số ra đề:</span>
          {[
            { id: 'within100' as CongTruRange, label: 'Phạm vi ≤ 100' },
            { id: 'within50' as CongTruRange, label: 'Phạm vi ≤ 50' },
            { id: 'within20' as CongTruRange, label: 'Phạm vi ≤ 20' },
            { id: 'twoDigitPlusOne' as CongTruRange, label: '2 chữ số với 1 chữ số' },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleRangeChange(r.id)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                rangeChoice === r.id
                  ? 'bg-amber-500 text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-amber-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Learning Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Vertical Math & Ô NHỚ PHÍA BÊN PHẢI */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-amber-200/80 shadow-xs space-y-6">
          <div className="border-b border-amber-100 pb-3">
            <h2 className="text-lg font-bold text-slate-800">
              {isAddition ? 'Đặt tính phép cộng có nhớ' : 'Đặt tính phép trừ có nhớ'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Bé điền kết quả vào cột dọc và điền số <strong>nhớ 1</strong> vào ô bên phải, làm xong bấm <strong>Kiểm tra</strong> nhé!
            </p>
          </div>

          {/* ========================================================================= */}
          {/* KHUNG PHÉP TÍNH BÊN TRÁI & Ô ĐIỀN NHỚ 1 BÊN PHẢI                           */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-b from-amber-50/70 via-orange-50/40 to-amber-50/70 p-5 sm:p-7 rounded-2xl border border-amber-200/80 flex flex-col items-center">
            
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              
              {/* PHÍA TRÁI: KHUNG ĐẶT TÍNH CỘT DỌC THẲNG HÀNG */}
              <div className="w-56 bg-white p-4 rounded-2xl border-2 border-amber-300 shadow-sm">
                
                {/* Header: Hàng Chục & Hàng Đơn Vị */}
                <div className="grid grid-cols-2 text-center text-xs font-bold border-b border-amber-200 pb-1.5 mb-2">
                  <span className="text-amber-800 bg-amber-50 py-0.5 rounded-l-md border-r border-amber-200">
                    Hàng Chục
                  </span>
                  <span className="text-blue-800 bg-blue-50 py-0.5 rounded-r-md">
                    Hàng Đơn Vị
                  </span>
                </div>

                {/* SỐ THỨ NHẤT */}
                <div className="grid grid-cols-2 text-center text-3xl font-black font-mono py-1.5 border-b border-slate-100">
                  <div className="text-amber-900 border-r border-slate-100">
                    {question.tens1 > 0 ? question.tens1 : ''}
                  </div>
                  <div className="text-blue-900">
                    {question.unit1}
                  </div>
                </div>

                {/* DẤU VÀ SỐ THỨ HAI */}
                <div className="relative grid grid-cols-2 text-center text-3xl font-black font-mono py-1.5">
                  <div className="absolute -left-3 top-1 text-2xl font-black text-amber-700 font-sans">
                    {question.operation}
                  </div>
                  <div className="text-amber-900 border-r border-slate-100">
                    {question.tens2 > 0 ? question.tens2 : ''}
                  </div>
                  <div className="text-blue-900">
                    {question.unit2}
                  </div>
                </div>

                {/* ĐƯỜNG KẺ NGANG */}
                <div className="w-full h-1 bg-slate-900 rounded-full my-2" />

                {/* HAI Ô KẾT QUẢ THẲNG TẮP DƯỚI HÀNG CHỤC VÀ ĐƠN VỊ */}
                <div className="grid grid-cols-2 gap-2 text-center py-1">
                  {/* Ô Chữ số Hàng Chục */}
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={tensInput}
                    placeholder="?"
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(-1);
                      setTensInput(val);
                      updateKeypadValue(val);
                      setStatus('idle');
                    }}
                    onFocus={(e) => {
                      sound.playClick();
                      setActiveSlot('tens');
                      const rect = e.currentTarget.getBoundingClientRect();
                      openKeypad({
                        title: 'Chữ số Hàng Chục',
                        value: tensInput,
                        anchorRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
                        onDigit: (d) => {
                          setTensInput(d);
                          updateKeypadValue(d);
                          setActiveSlot('carry');
                        },
                        onDelete: () => {
                          setTensInput('');
                          updateKeypadValue('');
                        },
                        onClear: () => {
                          setTensInput('');
                          updateKeypadValue('');
                        },
                        onSubmit: handleCheck,
                      });
                    }}
                    onClick={(e) => {
                      sound.playClick();
                      setActiveSlot('tens');
                      const rect = e.currentTarget.getBoundingClientRect();
                      openKeypad({
                        title: 'Chữ số Hàng Chục',
                        value: tensInput,
                        anchorRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
                        onDigit: (d) => {
                          setTensInput(d);
                          updateKeypadValue(d);
                          setActiveSlot('carry');
                        },
                        onDelete: () => {
                          setTensInput('');
                          updateKeypadValue('');
                        },
                        onClear: () => {
                          setTensInput('');
                          updateKeypadValue('');
                        },
                        onSubmit: handleCheck,
                      });
                    }}
                    className={`h-14 w-full rounded-xl border-2 text-center text-3xl font-black font-mono transition-all cursor-pointer outline-none ${
                      activeSlot === 'tens'
                        ? 'border-amber-500 bg-amber-100 text-amber-950 scale-105 shadow-sm animate-pulse-glow'
                        : tensInput
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                        : 'border-dashed border-amber-300 bg-amber-50/50 text-slate-300 placeholder:text-slate-300'
                    }`}
                    title="Bấm để nhập chữ số hàng chục"
                  />

                  {/* Ô Chữ số Hàng Đơn Vị */}
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={unitInput}
                    placeholder="?"
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(-1);
                      setUnitInput(val);
                      updateKeypadValue(val);
                      setStatus('idle');
                    }}
                    onFocus={(e) => {
                      sound.playClick();
                      setActiveSlot('unit');
                      const rect = e.currentTarget.getBoundingClientRect();
                      openKeypad({
                        title: 'Chữ số Hàng Đơn Vị',
                        value: unitInput,
                        anchorRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
                        onDigit: (d) => {
                          setUnitInput(d);
                          updateKeypadValue(d);
                          setActiveSlot('tens');
                        },
                        onDelete: () => {
                          setUnitInput('');
                          updateKeypadValue('');
                        },
                        onClear: () => {
                          setUnitInput('');
                          updateKeypadValue('');
                        },
                        onSubmit: handleCheck,
                      });
                    }}
                    onClick={(e) => {
                      sound.playClick();
                      setActiveSlot('unit');
                      const rect = e.currentTarget.getBoundingClientRect();
                      openKeypad({
                        title: 'Chữ số Hàng Đơn Vị',
                        value: unitInput,
                        anchorRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
                        onDigit: (d) => {
                          setUnitInput(d);
                          updateKeypadValue(d);
                          setActiveSlot('tens');
                        },
                        onDelete: () => {
                          setUnitInput('');
                          updateKeypadValue('');
                        },
                        onClear: () => {
                          setUnitInput('');
                          updateKeypadValue('');
                        },
                        onSubmit: handleCheck,
                      });
                    }}
                    className={`h-14 w-full rounded-xl border-2 text-center text-3xl font-black font-mono transition-all cursor-pointer outline-none ${
                      activeSlot === 'unit'
                        ? 'border-blue-500 bg-blue-100 text-blue-950 scale-105 shadow-sm animate-pulse-glow'
                        : unitInput
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                        : 'border-dashed border-blue-300 bg-blue-50/50 text-slate-300 placeholder:text-slate-300'
                    }`}
                    title="Bấm để nhập chữ số hàng đơn vị"
                  />
                </div>

                <div className="text-[10px] text-center text-slate-400 mt-1 font-semibold">
                  (Bấm ô để nhập số)
                </div>
              </div>

              {/* PHÍA BÊN PHẢI PHÉP TÍNH: Ô ĐIỀN NHỚ 1 (YÊU CẦU CỦA BẠN) */}
              <div
                className={`w-36 bg-white p-3.5 rounded-2xl border-2 transition-all shadow-sm flex flex-col items-center justify-between min-h-[180px] ${
                  activeSlot === 'carry'
                    ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/30 scale-105 animate-pulse-glow'
                    : carryInput
                    ? 'border-rose-400 bg-rose-50/20'
                    : 'border-dashed border-rose-300 hover:border-rose-400'
                }`}
                title="Bấm để điền số nhớ vào đây"
              >
                <div className="text-center">
                  <span className="text-xs font-black text-rose-700 uppercase tracking-tight block">
                    {isAddition ? 'Ghi Nhớ' : 'Mượn / Nhớ'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold block">
                    (Phía bên phải)
                  </span>
                </div>

                {/* Ô vuông to điền số nhớ 1 */}
                <div className="my-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={carryInput}
                    placeholder="?"
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(-1);
                      setCarryInput(val);
                      updateKeypadValue(val);
                      setStatus('idle');
                    }}
                    onFocus={(e) => {
                      sound.playClick();
                      setActiveSlot('carry');
                      const rect = e.currentTarget.getBoundingClientRect();
                      openKeypad({
                        title: isAddition ? 'Ô Ghi Nhớ 1 (phía bên phải)' : 'Ô Mượn/Nhớ 1 (phía bên phải)',
                        value: carryInput,
                        anchorRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
                        onDigit: (d) => {
                          setCarryInput(d);
                          updateKeypadValue(d);
                        },
                        onDelete: () => {
                          setCarryInput('');
                          updateKeypadValue('');
                        },
                        onClear: () => {
                          setCarryInput('');
                          updateKeypadValue('');
                        },
                        onSubmit: handleCheck,
                      });
                    }}
                    onClick={(e) => {
                      sound.playClick();
                      setActiveSlot('carry');
                      const rect = e.currentTarget.getBoundingClientRect();
                      openKeypad({
                        title: isAddition ? 'Ô Ghi Nhớ 1 (phía bên phải)' : 'Ô Mượn/Nhớ 1 (phía bên phải)',
                        value: carryInput,
                        anchorRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
                        onDigit: (d) => {
                          setCarryInput(d);
                          updateKeypadValue(d);
                        },
                        onDelete: () => {
                          setCarryInput('');
                          updateKeypadValue('');
                        },
                        onClear: () => {
                          setCarryInput('');
                          updateKeypadValue('');
                        },
                        onSubmit: handleCheck,
                      });
                    }}
                    className={`w-14 h-14 rounded-2xl border-3 text-center text-3xl font-black transition-all outline-none cursor-pointer ${
                      carryInput
                        ? 'bg-rose-500 border-rose-600 text-white shadow-md'
                        : 'bg-white border-dashed border-rose-400 text-rose-300 placeholder:text-rose-300'
                    }`}
                  />
                  <span className="text-[11px] font-bold text-rose-800 text-center block mt-1">
                    Nhớ 1
                  </span>
                </div>

                <div className="text-[10px] text-center text-slate-500 leading-tight">
                  {isAddition
                    ? 'Cộng đơn vị dư ➔ điền nhớ 1'
                    : 'Mượn 1 chục ➔ điền nhớ 1'}
                </div>
              </div>
            </div>

            {/* Trạng thái nhắc nhở khi bé đang làm */}
            <div className="mt-4 text-xs font-semibold text-slate-600 bg-white/80 px-4 py-2 rounded-xl border border-amber-200">
              {activeSlot === 'unit' && '👉 Bé đang nhập Chữ số Hàng Đơn Vị (cột bên phải)'}
              {activeSlot === 'tens' && '👉 Bé đang nhập Chữ số Hàng Chục (cột bên trái)'}
              {activeSlot === 'carry' && '👉 Bé đang nhập Ô Ghi Nhớ 1 (ở phía bên phải phép tính)'}
            </div>
          </div>

          {/* Feedback & Actions */}
          <div className="space-y-3">
            {status === 'correct' && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-2 animate-pop">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm sm:text-base">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <span>Bé tính chuẩn xác và ghi nhớ số 1 rất giỏi! +1 ★</span>
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
                <span>{errorMessage || 'Chưa đúng rồi! Bé hãy kiểm tra lại kết quả hoặc số nhớ 1 nhé!'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setUnitInput('');
                    setTensInput('');
                    setCarryInput('');
                    setActiveSlot('unit');
                    setStatus('idle');
                  }}
                  className="text-xs font-bold underline hover:text-rose-900 cursor-pointer ml-2"
                >
                  Làm lại
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
                  <p>• <strong>Bước 1 (Hàng đơn vị):</strong> {question.step1Text}</p>
                  <p>• <strong>Bước 2 (Hàng chục):</strong> {question.step2Text}</p>
                  <p>• <strong>Ô nhớ bên phải:</strong> Điền số <strong>1</strong>.</p>
                  <p className="font-bold text-emerald-800 pt-1">
                    👉 Vậy {question.num1} {question.operation} {question.num2} = {question.result}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Number Pad & 3 Slot Selector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
            {/* 3 Slot Switcher Buttons */}
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveSlot('unit');
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                  activeSlot === 'unit'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-blue-50 text-blue-900 border-blue-200'
                }`}
              >
                Đơn vị: <span className="font-black text-sm">{unitInput || '?'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveSlot('tens');
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                  activeSlot === 'tens'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}
              >
                Hàng chục: <span className="font-black text-sm">{tensInput || '?'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveSlot('carry');
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                  activeSlot === 'carry'
                    ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                    : 'bg-rose-50 text-rose-900 border-rose-200'
                }`}
              >
                Ô nhớ: <span className="font-black text-sm">{carryInput || '?'}</span>
              </button>
            </div>

            <div className="text-center mb-3">
              <span className="text-xs text-slate-500 font-semibold">
                {activeSlot === 'unit'
                  ? 'Bé đang nhập Chữ số Hàng Đơn Vị:'
                  : activeSlot === 'tens'
                  ? 'Bé đang nhập Chữ số Hàng Chục:'
                  : 'Bé đang nhập Ô Nhớ 1 Bên Phải:'}
              </span>
              <div className="text-3xl font-black text-amber-900 h-10 flex items-center justify-center">
                {(activeSlot === 'unit'
                  ? unitInput
                  : activeSlot === 'tens'
                  ? tensInput
                  : carryInput) || <span className="text-slate-300 font-normal text-2xl">Bấm số...</span>}
              </div>
            </div>

            {/* Bàn phím số to */}
            <NumberPad
              onNumberClick={handleDigit}
              onDelete={handleDelete}
              onClear={handleClear}
              onSubmit={handleCheck}
              submitDisabled={
                status === 'correct' ||
                !unitInput ||
                !tensInput ||
                !carryInput
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
