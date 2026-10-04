import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, RotateCcw, Lightbulb, CheckCircle2, ChevronRight, Layers, Split } from 'lucide-react';
import { TachGopQuestion, TachSoCongQuaMuoiQuestion } from '../types/math';
import { generateTachGopQuestion, generateTachSoCongQuaMuoiQuestion } from '../utils/mathGenerators';
import { NumberPad } from './NumberPad';
import { sound } from '../utils/audio';

interface TachGopSectionProps {
  onEarnStar: () => void;
}

export const TachGopSection: React.FC<TachGopSectionProps> = ({ onEarnStar }) => {
  // Mode: 'split-add' (Tách số cộng qua 10 - yêu cầu chính của phụ huynh), 'bond-tree' (Sơ đồ cây), 'sandbox' (Khám phá)
  const [activeSubMode, setActiveSubMode] = useState<'split-add' | 'bond-tree' | 'sandbox'>('split-add');

  // State for "Tách số cộng qua 10" (VD: 8 + 7 -> tách 7 thành 2 và 5)
  const [maxNumLimit, setMaxNumLimit] = useState<number>(9); // Always under 10 (7, 8, 9)
  const [tableSelection, setTableSelection] = useState<'all' | 9 | 8 | 7 | 6>('all');
  const [splitAddQ, setSplitAddQ] = useState<TachSoCongQuaMuoiQuestion>(() =>
    generateTachSoCongQuaMuoiQuestion({ maxNum: 9, table: 'all' })
  );
  const [activeSlot, setActiveSlot] = useState<'split1' | 'split2' | 'finalResult'>('split1');
  const [inputSplit1, setInputSplit1] = useState<string>('');
  const [inputSplit2, setInputSplit2] = useState<string>('');
  const [inputFinal, setInputFinal] = useState<string>('');
  const [splitAddStatus, setSplitAddStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showSplitAddHint, setShowSplitAddHint] = useState<boolean>(false);

  // State for "Sơ đồ cây Tách - Gộp"
  const [treeLevel, setTreeLevel] = useState<'mixed' | 'basic' | 'tens'>('mixed');
  const [treeQuestion, setTreeQuestion] = useState<TachGopQuestion>(() => generateTachGopQuestion('mixed'));
  const [treeInput, setTreeInput] = useState<string>('');
  const [treeStatus, setTreeStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showTreeHint, setShowTreeHint] = useState<boolean>(false);

  // Sandbox states
  const [sandboxTotal, setSandboxTotal] = useState<number>(12);
  const [sandboxSplit, setSandboxSplit] = useState<number>(5);

  const [streak, setStreak] = useState<number>(0);

  // --- Handlers for "Tách số cộng qua 10" ---
  const nextSplitAddQuestion = (maxNum = maxNumLimit, table = tableSelection) => {
    const q = generateTachSoCongQuaMuoiQuestion({ maxNum, table });
    setSplitAddQ(q);
    setInputSplit1('');
    setInputSplit2('');
    setInputFinal('');
    setActiveSlot('split1');
    setSplitAddStatus('idle');
    setShowSplitAddHint(false);
  };

  const handleMaxNumChange = (newMax: number) => {
    sound.playClick();
    setMaxNumLimit(newMax);
    nextSplitAddQuestion(newMax, tableSelection);
  };

  const handleTableChange = (newTable: 'all' | 9 | 8 | 7 | 6) => {
    sound.playClick();
    setTableSelection(newTable);
    nextSplitAddQuestion(maxNumLimit, newTable);
  };

  const handleCheckSplitAdd = () => {
    const s1 = parseInt(inputSplit1, 10);
    const s2 = parseInt(inputSplit2, 10);
    const res = parseInt(inputFinal, 10);

    const isCorrect =
      s1 === splitAddQ.split1 &&
      s2 === splitAddQ.split2 &&
      res === splitAddQ.finalResult;

    if (isCorrect) {
      sound.playCorrect();
      setSplitAddStatus('correct');
      setStreak((s) => s + 1);
      onEarnStar();
    } else {
      sound.playIncorrect();
      setSplitAddStatus('wrong');
    }
  };

  // --- Handlers for "Sơ đồ cây" ---
  const nextTreeQuestion = (lvl = treeLevel) => {
    setTreeQuestion(generateTachGopQuestion(lvl));
    setTreeInput('');
    setTreeStatus('idle');
    setShowTreeHint(false);
  };

  const handleCheckTree = () => {
    if (!treeInput.trim()) return;
    const ans = parseInt(treeInput, 10);
    let expected = treeQuestion.total;
    if (treeQuestion.missingField === 'partA') expected = treeQuestion.partA;
    if (treeQuestion.missingField === 'partB') expected = treeQuestion.partB;

    if (ans === expected) {
      sound.playCorrect();
      setTreeStatus('correct');
      setStreak((s) => s + 1);
      onEarnStar();
    } else {
      sound.playIncorrect();
      setTreeStatus('wrong');
    }
  };

  // NumberPad Digit handler for Split Add
  const handleSplitAddPadDigit = (d: string) => {
    if (activeSlot === 'split1') {
      if (inputSplit1.length < 2) {
        const nextVal = inputSplit1 + d;
        setInputSplit1(nextVal);
        // If 1 digit entered and matches single digit expectation, advance to split2
        if (nextVal.length >= 1) {
          setActiveSlot('split2');
        }
      }
    } else if (activeSlot === 'split2') {
      if (inputSplit2.length < 2) {
        const nextVal = inputSplit2 + d;
        setInputSplit2(nextVal);
        if (nextVal.length >= 1) {
          setActiveSlot('finalResult');
        }
      }
    } else {
      if (inputFinal.length < 3) {
        setInputFinal((p) => p + d);
      }
    }
    setSplitAddStatus('idle');
  };

  const handleSplitAddPadDelete = () => {
    if (activeSlot === 'split1') {
      setInputSplit1((p) => p.slice(0, -1));
    } else if (activeSlot === 'split2') {
      setInputSplit2((p) => p.slice(0, -1));
    } else {
      setInputFinal((p) => p.slice(0, -1));
    }
    setSplitAddStatus('idle');
  };

  const handleSplitAddPadClear = () => {
    if (activeSlot === 'split1') setInputSplit1('');
    else if (activeSlot === 'split2') setInputSplit2('');
    else setInputFinal('');
    setSplitAddStatus('idle');
  };

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (activeSubMode === 'split-add') {
          handleSplitAddPadDigit(e.key);
        } else if (activeSubMode === 'bond-tree') {
          if (treeInput.length < 3) {
            setTreeInput((p) => p + e.key);
            setTreeStatus('idle');
          }
        }
      } else if (e.key === 'Backspace') {
        if (activeSubMode === 'split-add') {
          handleSplitAddPadDelete();
        } else if (activeSubMode === 'bond-tree') {
          setTreeInput((p) => p.slice(0, -1));
          setTreeStatus('idle');
        }
      } else if (e.key === 'Enter') {
        if (activeSubMode === 'split-add') {
          if (splitAddStatus === 'correct') nextSplitAddQuestion();
          else handleCheckSplitAdd();
        } else if (activeSubMode === 'bond-tree') {
          if (treeStatus === 'correct') nextTreeQuestion();
          else handleCheckTree();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeSubMode,
    activeSlot,
    inputSplit1,
    inputSplit2,
    inputFinal,
    treeInput,
    splitAddStatus,
    treeStatus,
    splitAddQ,
    treeQuestion,
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Submode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-amber-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-amber-50 rounded-xl border border-amber-200/60">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveSubMode('split-add');
            }}
            className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubMode === 'split-add'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Split className="w-4 h-4" />
            <span>Tách Số Cộng Qua 10</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveSubMode('bond-tree');
            }}
            className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubMode === 'bond-tree'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Sơ Đồ Cây Tách - Gộp</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveSubMode('sandbox');
            }}
            className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer ${
              activeSubMode === 'sandbox'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            Phòng Khám Phá Tự Do
          </button>
        </div>

        <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-xs font-bold text-amber-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Liên tiếp: {streak}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: TÁCH SỐ ĐỂ CỘNG QUA 10 (VD: 8 + 7 TÁCH 7 RA 2 VÀ 5, 8+2=10, 10+5=15) */}
      {/* ========================================================================= */}
      {activeSubMode === 'split-add' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Visual Stage */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-amber-200/80 shadow-xs space-y-6">
            <div className="border-b border-amber-100 pb-3 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Tách số để làm tròn 10 rồi cộng (Toán Lớp 2)
                  </h2>
                  <p className="text-xs text-emerald-700 font-semibold">
                    ✓ Cả 2 số đều DƯỚI 10 (từ 2 đến 9) · Gộp đủ 10 rồi cộng số còn lại
                  </p>
                </div>

                {/* Chọn số cao nhất cho 2 số (Yêu cầu của phụ huynh) */}
                <div className="flex items-center gap-1.5 bg-amber-50 p-1 rounded-xl border border-amber-200 text-xs">
                  <span className="text-amber-900 font-bold px-1">Số cao nhất:</span>
                  {[9, 8, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleMaxNumChange(num)}
                      className={`px-2.5 py-1 rounded-lg font-black transition-colors cursor-pointer ${
                        maxNumLimit === num
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-amber-100'
                      }`}
                      title={`Cả 2 số trong phép tính tối đa là ${num} (dưới 10)`}
                    >
                      ≤ {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chọn bảng cộng 9+, 8+, 7+, 6+ */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1 border-t border-amber-100/60">
                <span className="text-slate-600 font-medium">Bảng cộng:</span>
                <button
                  type="button"
                  onClick={() => handleTableChange('all')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                    tableSelection === 'all'
                      ? 'bg-amber-200 text-amber-950 border border-amber-400'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả bảng
                </button>
                {([9, 8, 7, 6] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTableChange(t)}
                    disabled={t > maxNumLimit}
                    className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                      tableSelection === t
                        ? 'bg-amber-500 text-white shadow-xs'
                        : t > maxNumLimit
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                        : 'bg-slate-100 text-slate-700 hover:bg-amber-100'
                    }`}
                  >
                    Bảng {t}+
                  </button>
                ))}
              </div>
            </div>

            {/* KHUNG MINH HỌA TÁCH SỐ 2 Ô CHUẨN SƯ PHẠM */}
            <div className="bg-gradient-to-b from-amber-50/60 to-orange-50/40 p-5 sm:p-7 rounded-2xl border border-amber-200/80 flex flex-col items-center">
              {/* Phép tính hàng trên: num1 + num2 = [ finalResult ] */}
              <div className="flex items-center justify-center gap-3 sm:gap-5 text-3xl sm:text-4xl font-black text-slate-900">
                {/* Số thứ nhất */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-400 border-2 border-amber-500 text-amber-950 flex items-center justify-center shadow-sm">
                  {splitAddQ.num1}
                </div>

                <span className="text-amber-600 font-extrabold">+</span>

                {/* Số thứ hai (Số được tách) */}
                <div className="relative flex flex-col items-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-500 border-2 border-blue-600 text-white flex items-center justify-center shadow-sm">
                    {splitAddQ.num2}
                  </div>
                  <span className="text-[10px] font-bold text-blue-800 mt-1 uppercase tracking-tight">
                    Số bị tách
                  </span>
                </div>

                <span className="text-slate-400 font-extrabold">=</span>

                {/* Ô kết quả cuối cùng */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setActiveSlot('finalResult');
                  }}
                  className={`w-18 h-14 sm:w-20 sm:h-16 rounded-2xl border-3 flex items-center justify-center text-2xl sm:text-3xl font-black transition-all cursor-pointer shadow-sm ${
                    activeSlot === 'finalResult'
                      ? 'border-emerald-500 bg-emerald-100 text-emerald-950 scale-105 animate-pulse-glow'
                      : inputFinal
                      ? 'border-emerald-400 bg-white text-emerald-900'
                      : 'border-dashed border-amber-300 bg-white text-slate-300'
                  }`}
                  title="Bấm để điền kết quả phép tính"
                >
                  {inputFinal || '?'}
                </div>
              </div>

              {/* Nhánh tách hình chữ V từ số thứ hai (split1 & split2) */}
              <div className="relative mt-2 mb-4 w-56 flex flex-col items-center">
                {/* SVG hai nhánh rẽ xuống 2 ô */}
                <svg className="w-48 h-10" viewBox="0 0 192 40" fill="none">
                  {/* Left branch to split1 */}
                  <path
                    d="M 96 0 C 96 15, 36 15, 36 40"
                    stroke="#2563EB"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Right branch to split2 */}
                  <path
                    d="M 96 0 C 96 15, 156 15, 156 40"
                    stroke="#2563EB"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>

                {/* 2 Ô CHỖ BÉ TÁCH RA */}
                <div className="w-full flex items-center justify-between px-2">
                  {/* Ô TÁCH 1 */}
                  <div
                    onClick={() => {
                      sound.playClick();
                      setActiveSlot('split1');
                    }}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-3 flex items-center justify-center text-2xl sm:text-3xl font-black shadow-md transition-all ${
                        activeSlot === 'split1'
                          ? 'border-blue-600 bg-blue-100 text-blue-950 scale-110 animate-pulse-glow'
                          : inputSplit1
                          ? 'border-blue-400 bg-white text-blue-900'
                          : 'border-dashed border-blue-400 bg-white text-slate-300'
                      }`}
                      title="Ô tách 1: Cần mấy để gộp với số đầu thành 10?"
                    >
                      {inputSplit1 || '?'}
                    </div>
                    <span className="text-[11px] font-bold text-blue-800 mt-1">
                      Ô tách 1
                    </span>
                    <span className="text-[9px] text-slate-500 font-semibold">
                      (để {splitAddQ.num1} + {splitAddQ.split1} = {splitAddQ.roundTen})
                    </span>
                  </div>

                  {/* Dấu cộng nhỏ ở giữa minh họa split1 + split2 = num2 */}
                  <div className="text-blue-500 font-black text-xl pt-2">
                    +
                  </div>

                  {/* Ô TÁCH 2 */}
                  <div
                    onClick={() => {
                      sound.playClick();
                      setActiveSlot('split2');
                    }}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-3 flex items-center justify-center text-2xl sm:text-3xl font-black shadow-md transition-all ${
                        activeSlot === 'split2'
                          ? 'border-blue-600 bg-blue-100 text-blue-950 scale-110 animate-pulse-glow'
                          : inputSplit2
                          ? 'border-blue-400 bg-white text-blue-900'
                          : 'border-dashed border-blue-400 bg-white text-slate-300'
                      }`}
                      title="Ô tách 2: Số còn lại sau khi tách"
                    >
                      {inputSplit2 || '?'}
                    </div>
                    <span className="text-[11px] font-bold text-blue-800 mt-1">
                      Ô tách 2
                    </span>
                    <span className="text-[9px] text-slate-500 font-semibold">
                      (còn lại: {splitAddQ.num2} - {splitAddQ.split1} = {splitAddQ.split2})
                    </span>
                  </div>
                </div>
              </div>

              {/* 2 BƯỚC CỘNG TRỰC QUAN THEO YÊU CẦU SƯ PHẠM */}
              <div className="w-full max-w-md bg-white p-3.5 sm:p-4 rounded-xl border border-amber-200 shadow-xs space-y-2 text-xs sm:text-sm">
                <div className="font-bold text-amber-900 border-b border-amber-100 pb-1 flex items-center justify-between">
                  <span>Cách tính cộng qua 10 từng bước:</span>
                  <span className="text-[11px] font-semibold text-slate-500">Bé quan sát nhé</span>
                </div>

                {/* Bước 1 */}
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-amber-50/70 border border-amber-200/60 font-semibold text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    Lấy <strong>{splitAddQ.num1}</strong> +{' '}
                    <strong className="text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-300">
                      {inputSplit1 || 'Ô 1'}
                    </strong>{' '}
                    = <strong className="text-amber-800">{splitAddQ.roundTen}</strong> (làm tròn chục)
                  </span>
                </div>

                {/* Bước 2 */}
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-emerald-50/70 border border-emerald-200/60 font-semibold text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    Lấy <strong>{splitAddQ.roundTen}</strong> +{' '}
                    <strong className="text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-300">
                      {inputSplit2 || 'Ô 2'}
                    </strong>{' '}
                    = <strong className="text-emerald-700">{inputFinal || 'Kết quả'}</strong>
                  </span>
                </div>

                {/* Kết luận */}
                <div className="text-center font-bold text-slate-900 pt-1 text-sm sm:text-base">
                  👉 Vậy: {splitAddQ.num1} + {splitAddQ.num2} ={' '}
                  <span className="text-emerald-700 underline font-black">
                    {inputFinal || '?'}
                  </span>
                </div>
              </div>
            </div>

            {/* Feedback & Actions */}
            <div className="space-y-3">
              {splitAddStatus === 'correct' && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-2 animate-pop">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm sm:text-base">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <span>Bé tách số và cộng chuẩn xác 100%! +1 ★</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => nextSplitAddQuestion()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95 whitespace-nowrap"
                  >
                    <span>Bài tiếp</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {splitAddStatus === 'wrong' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-700 text-sm font-medium">
                  <span>Chưa đúng rồi! Bé kiểm tra lại xem 2 ô tách đã cộng bằng {splitAddQ.num2} chưa nhé!</span>
                  <button
                    type="button"
                    onClick={() => {
                      setInputSplit1('');
                      setInputSplit2('');
                      setInputFinal('');
                      setActiveSlot('split1');
                      setSplitAddStatus('idle');
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
                  onClick={() => setShowSplitAddHint(!showSplitAddHint)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 cursor-pointer"
                >
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>{showSplitAddHint ? 'Ẩn hướng dẫn tách' : 'Bé cần mẹo tách số?'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => nextSplitAddQuestion()}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đổi phép tính khác</span>
                </button>
              </div>

              {showSplitAddHint && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-1">
                  <p>💡 <strong>Hướng dẫn cho bé:</strong></p>
                  <p>• {splitAddQ.num1} cộng với mấy để bằng {splitAddQ.roundTen}? 👉 Cần <strong>{splitAddQ.split1}</strong> (điền vào Ô 1).</p>
                  <p>• Tách {splitAddQ.num2} gồm {splitAddQ.split1} và mấy? 👉 Còn <strong>{splitAddQ.split2}</strong> (điền vào Ô 2).</p>
                  <p>• Lấy {splitAddQ.roundTen} + {splitAddQ.split2} = <strong>{splitAddQ.finalResult}</strong>.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Active Slot Selector & Number Pad */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
              {/* 3 Slot Switcher Buttons */}
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveSlot('split1');
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                    activeSlot === 'split1'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-blue-50 text-blue-900 border-blue-200'
                  }`}
                >
                  Ô tách 1: <span className="font-extrabold">{inputSplit1 || '?'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveSlot('split2');
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                    activeSlot === 'split2'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-blue-50 text-blue-900 border-blue-200'
                  }`}
                >
                  Ô tách 2: <span className="font-extrabold">{inputSplit2 || '?'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveSlot('finalResult');
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                    activeSlot === 'finalResult'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  }`}
                >
                  Kết quả: <span className="font-extrabold">{inputFinal || '?'}</span>
                </button>
              </div>

              {/* Input Display Banner */}
              <div className="text-center mb-3">
                <span className="text-xs text-slate-500 font-semibold">
                  {activeSlot === 'split1'
                    ? `Bé nhập số ở Ô tách 1 (để gộp đủ ${splitAddQ.roundTen}):`
                    : activeSlot === 'split2'
                    ? 'Bé nhập số ở Ô tách 2 (phần còn lại):'
                    : 'Bé nhập kết quả cuối cùng:'}
                </span>
                <div className="text-3xl font-black text-amber-900 h-10 flex items-center justify-center">
                  {(activeSlot === 'split1'
                    ? inputSplit1
                    : activeSlot === 'split2'
                    ? inputSplit2
                    : inputFinal) || <span className="text-slate-300 font-normal text-2xl">Bấm số...</span>}
                </div>
              </div>

              <NumberPad
                onNumberClick={handleSplitAddPadDigit}
                onDelete={handleSplitAddPadDelete}
                onClear={handleSplitAddPadClear}
                onSubmit={handleCheckSplitAdd}
                submitDisabled={
                  splitAddStatus === 'correct' ||
                  !inputSplit1 ||
                  !inputSplit2 ||
                  !inputFinal
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: SƠ ĐỒ CÂY TÁCH - GỘP CHUẨN SGK                                    */}
      {/* ========================================================================= */}
      {activeSubMode === 'bond-tree' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-amber-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {treeQuestion.missingField === 'total'
                    ? 'Gộp các số để tìm số ở trên'
                    : 'Tách số ở trên thành 2 số'}
                </h2>
                <p className="text-xs text-slate-500">
                  Điền số thích hợp vào ô có dấu hỏi chấm (?)
                </p>
              </div>

              {/* Level switch */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setTreeLevel('basic');
                    nextTreeQuestion('basic');
                  }}
                  className={`px-2 py-1 rounded-md font-semibold cursor-pointer ${
                    treeLevel === 'basic' ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Phạm vi 10 & 20
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTreeLevel('tens');
                    nextTreeQuestion('tens');
                  }}
                  className={`px-2 py-1 rounded-md font-semibold cursor-pointer ${
                    treeLevel === 'tens' ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Chục & đơn vị
                </button>
              </div>
            </div>

            {/* Sơ đồ cây */}
            <div className="relative py-4 select-none">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg className="w-72 h-44" viewBox="0 0 288 176" fill="none">
                  <path
                    d="M 144 45 C 144 85, 72 90, 72 135"
                    stroke="#F59E0B"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={treeStatus === 'correct' ? 'none' : '6 4'}
                  />
                  <path
                    d="M 144 45 C 144 85, 216 90, 216 135"
                    stroke="#F59E0B"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={treeStatus === 'correct' ? 'none' : '6 4'}
                  />
                </svg>
              </div>

              <div className="relative z-10 flex flex-col items-center gap-10 sm:gap-12">
                {/* Vòng tròn tổng */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center font-extrabold text-2xl sm:text-3xl border-4 transition-all shadow-md ${
                      treeQuestion.missingField === 'total'
                        ? 'bg-amber-100 border-amber-500 text-amber-900 animate-pulse-glow'
                        : 'bg-amber-400 border-amber-600 text-amber-950'
                    }`}
                  >
                    {treeQuestion.missingField === 'total' ? treeInput || '?' : treeQuestion.total}
                  </div>
                  <span className="text-[11px] font-bold text-amber-900 mt-1 uppercase">
                    Số gộp (Tổng)
                  </span>
                </div>

                {/* 2 Vòng tròn con */}
                <div className="w-full flex items-center justify-around px-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-18 h-18 sm:w-22 sm:h-22 rounded-full flex items-center justify-center font-extrabold text-xl sm:text-2xl border-4 transition-all shadow-md ${
                        treeQuestion.missingField === 'partA'
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-950 animate-pulse-glow'
                          : 'bg-emerald-400 border-emerald-600 text-emerald-950'
                      }`}
                    >
                      {treeQuestion.missingField === 'partA' ? treeInput || '?' : treeQuestion.partA}
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 mt-1">
                      Phần 1
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div
                      className={`w-18 h-18 sm:w-22 sm:h-22 rounded-full flex items-center justify-center font-extrabold text-xl sm:text-2xl border-4 transition-all shadow-md ${
                        treeQuestion.missingField === 'partB'
                          ? 'bg-blue-100 border-blue-500 text-blue-950 animate-pulse-glow'
                          : 'bg-blue-400 border-blue-600 text-blue-950'
                      }`}
                    >
                      {treeQuestion.missingField === 'partB' ? treeInput || '?' : treeQuestion.partB}
                    </div>
                    <span className="text-[11px] font-bold text-blue-800 mt-1">
                      Phần 2
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Read-out */}
            <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-center text-sm font-semibold text-slate-700">
              {treeQuestion.missingField === 'total' ? (
                <span>
                  Gộp <strong className="text-emerald-700">{treeQuestion.partA}</strong> và{' '}
                  <strong className="text-blue-700">{treeQuestion.partB}</strong> được{' '}
                  <strong className="text-amber-800 underline">{treeInput || '?'}</strong>
                </span>
              ) : (
                <span>
                  Tách <strong className="text-amber-800">{treeQuestion.total}</strong> gồm{' '}
                  <strong className="text-emerald-700">
                    {treeQuestion.missingField === 'partA' ? treeInput || '?' : treeQuestion.partA}
                  </strong>{' '}
                  và{' '}
                  <strong className="text-blue-700">
                    {treeQuestion.missingField === 'partB' ? treeInput || '?' : treeQuestion.partB}
                  </strong>
                </span>
              )}
            </div>

            {/* Feedback */}
            <div className="space-y-3">
              {treeStatus === 'correct' && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-2 animate-pop">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm sm:text-base">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <span>Chính xác rồi! Bé thật thông minh! +1 ★</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => nextTreeQuestion()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95 whitespace-nowrap"
                  >
                    <span>Câu tiếp</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {treeStatus === 'wrong' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-700 text-sm font-medium">
                  <span>Chưa đúng rồi! Bé thử đếm lại hoặc xem gợi ý nhé!</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTreeInput('');
                      setTreeStatus('idle');
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
                  onClick={() => setShowTreeHint(!showTreeHint)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 cursor-pointer"
                >
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>{showTreeHint ? 'Ẩn gợi ý' : 'Bé cần gợi ý?'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => nextTreeQuestion()}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đổi câu khác</span>
                </button>
              </div>

              {showTreeHint && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  💡 <strong>Gợi ý:</strong> {treeQuestion.hint}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Number Pad for Bond Tree */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
              <div className="text-center mb-3">
                <span className="text-xs text-slate-500 font-semibold">Số bé đang nhập:</span>
                <div className="text-3xl font-black text-amber-900 h-10 flex items-center justify-center">
                  {treeInput || <span className="text-slate-300 font-normal text-2xl">Bấm số dưới đây...</span>}
                </div>
              </div>

              <NumberPad
                onNumberClick={(d) => {
                  if (treeInput.length < 3) {
                    setTreeInput((prev) => prev + d);
                    setTreeStatus('idle');
                  }
                }}
                onDelete={() => {
                  setTreeInput((prev) => prev.slice(0, -1));
                  setTreeStatus('idle');
                }}
                onClear={() => {
                  setTreeInput('');
                  setTreeStatus('idle');
                }}
                onSubmit={handleCheckTree}
                submitDisabled={!treeInput || treeStatus === 'correct'}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: PHÒNG KHÁM PHÁ TỰ DO                                              */}
      {/* ========================================================================= */}
      {activeSubMode === 'sandbox' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-amber-200/80 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Phòng Khám Phá: Bé tự chọn số để tách - gộp!
            </h2>
            <p className="text-xs text-slate-500">
              Kéo thanh trượt để xem 1 số có thể tách thành những phần nào nhé!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Chọn nhanh:</span>
            {[10, 12, 15, 20, 36, 50, 68, 100].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSandboxTotal(n);
                  setSandboxSplit(Math.floor(n / 2));
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                  sandboxTotal === n
                    ? 'bg-amber-500 border-amber-600 text-white'
                    : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="space-y-4 max-w-xl mx-auto bg-amber-50/50 p-4 rounded-xl border border-amber-200">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Số tổng muốn tách:</span>
                <span className="text-amber-800 text-sm font-extrabold">{sandboxTotal}</span>
              </div>
              <input
                type="range"
                min="2"
                max="100"
                value={sandboxTotal}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setSandboxTotal(val);
                  if (sandboxSplit >= val) setSandboxSplit(Math.floor(val / 2));
                }}
                className="w-full accent-amber-500 h-2 bg-amber-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Tách thành Phần 1 ({sandboxSplit}) và Phần 2 ({sandboxTotal - sandboxSplit}):</span>
              </div>
              <input
                type="range"
                min="0"
                max={sandboxTotal}
                value={sandboxSplit}
                onChange={(e) => setSandboxSplit(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 h-2 bg-emerald-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-amber-50/30 p-6 rounded-2xl border border-amber-200/60 flex flex-col items-center">
            <div className="text-center font-bold text-slate-800 mb-4 text-base sm:text-lg">
              Số <span className="text-amber-700 font-black text-2xl">{sandboxTotal}</span> gồm{' '}
              <span className="text-emerald-700 font-black text-2xl">{sandboxSplit}</span> và{' '}
              <span className="text-blue-700 font-black text-2xl">{sandboxTotal - sandboxSplit}</span>
            </div>

            <div className="w-full max-w-md h-12 rounded-xl overflow-hidden flex border-2 border-slate-700 shadow-sm">
              <div
                style={{ width: `${(sandboxSplit / sandboxTotal) * 100}%` }}
                className="bg-emerald-500 flex items-center justify-center text-white font-black text-sm transition-all"
              >
                {sandboxSplit > 0 ? sandboxSplit : ''}
              </div>
              <div
                style={{ width: `${((sandboxTotal - sandboxSplit) / sandboxTotal) * 100}%` }}
                className="bg-blue-500 flex items-center justify-center text-white font-black text-sm transition-all"
              >
                {sandboxTotal - sandboxSplit > 0 ? sandboxTotal - sandboxSplit : ''}
              </div>
            </div>

            <div className="flex justify-between w-full max-w-md text-xs font-bold mt-2">
              <span className="text-emerald-700">Phần 1: {sandboxSplit}</span>
              <span className="text-blue-700">Phần 2: {sandboxTotal - sandboxSplit}</span>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm font-bold">
              <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-xs">
                {sandboxSplit} + {sandboxTotal - sandboxSplit} = {sandboxTotal}
              </div>
              <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-xs">
                {sandboxTotal} - {sandboxSplit} = {sandboxTotal - sandboxSplit}
              </div>
              <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-xs">
                {sandboxTotal} - {sandboxTotal - sandboxSplit} = {sandboxSplit}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
