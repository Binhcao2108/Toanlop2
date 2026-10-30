import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RotateCcw, Lightbulb, CheckCircle2, ChevronRight, Layers, Split } from 'lucide-react';
import { TachGopQuestion, TachSoCongQuaMuoiQuestion } from '../types/math';
import { generateTachGopQuestion, generateTachSoCongQuaMuoiQuestion } from '../utils/mathGenerators';
import { NumberPad } from './NumberPad';
import { sound } from '../utils/audio';
import { useVirtualKeypad } from '../context/VirtualKeypadContext';

interface TachGopSectionProps {
  onEarnStar: () => void;
}

export const TachGopSection: React.FC<TachGopSectionProps> = ({ onEarnStar }) => {
  const { openKeypad, updateKeypadValue, closeKeypad } = useVirtualKeypad();
  const [activeSubMode, setActiveSubMode] = useState<'split-add' | 'bond-tree' | 'sandbox'>('split-add');

  const [maxNumLimit, setMaxNumLimit] = useState<number>(9);
  const [tableSelection, setTableSelection] = useState<'all' | 9 | 8 | 7 | 6>('all');
  const [splitAddQ, setSplitAddQ] = useState<TachSoCongQuaMuoiQuestion>(() =>
    generateTachSoCongQuaMuoiQuestion({ maxNum: 9, table: 'all' })
  );
  const [activeSlot, setActiveSlot] = useState<'split1' | 'split2' | 'finalResult'>('split1');
  const [inputSplit1, setInputSplit1] = useState<string>('');
  const [inputSplit2, setInputSplit2] = useState<string>('');
  const [inputFinal, setInputFinal] = useState<string>('');
  const [splitAddStatus, setSplitAddStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [splitAddErrorMsg, setSplitAddErrorMsg] = useState<string>('');
  const [showSplitAddHint, setShowSplitAddHint] = useState<boolean>(false);

  const [treeLevel, setTreeLevel] = useState<'mixed' | 'basic' | 'tens'>('mixed');
  const [treeQuestion, setTreeQuestion] = useState<TachGopQuestion>(() => generateTachGopQuestion('mixed'));
  const [treeInput, setTreeInput] = useState<string>('');
  const [treeStatus, setTreeStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showTreeHint, setShowTreeHint] = useState<boolean>(false);

  const [sandboxTotal, setSandboxTotal] = useState<number>(12);
  const [sandboxSplit, setSandboxSplit] = useState<number>(5);

  const [streak, setStreak] = useState<number>(0);

  const activeSlotRef = useRef<'split1' | 'split2' | 'finalResult'>('split1');
  const inputSplit1Ref = useRef(inputSplit1);
  const inputSplit2Ref = useRef(inputSplit2);
  const inputFinalRef = useRef(inputFinal);
  const splitAddQRef = useRef(splitAddQ);
  const splitAddStatusRef = useRef(splitAddStatus);

  const treeInputRef = useRef(treeInput);
  const treeQuestionRef = useRef(treeQuestion);
  const treeStatusRef = useRef(treeStatus);

  useEffect(() => {
    activeSlotRef.current = activeSlot;
    inputSplit1Ref.current = inputSplit1;
    inputSplit2Ref.current = inputSplit2;
    inputFinalRef.current = inputFinal;
    splitAddQRef.current = splitAddQ;
    splitAddStatusRef.current = splitAddStatus;
    treeInputRef.current = treeInput;
    treeQuestionRef.current = treeQuestion;
    treeStatusRef.current = treeStatus;
  }, [
    activeSlot,
    inputSplit1,
    inputSplit2,
    inputFinal,
    splitAddQ,
    splitAddStatus,
    treeInput,
    treeQuestion,
    treeStatus,
  ]);

  const nextSplitAddQuestion = (maxNum = maxNumLimit, table = tableSelection) => {
    const q = generateTachSoCongQuaMuoiQuestion({ maxNum, table });
    splitAddQRef.current = q;
    inputSplit1Ref.current = '';
    inputSplit2Ref.current = '';
    inputFinalRef.current = '';
    activeSlotRef.current = 'split1';
    splitAddStatusRef.current = 'idle';

    setSplitAddQ(q);
    setInputSplit1('');
    setInputSplit2('');
    setInputFinal('');
    setActiveSlot('split1');
    setSplitAddStatus('idle');
    setSplitAddErrorMsg('');
    setShowSplitAddHint(false);
    closeKeypad();
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
    if (splitAddStatusRef.current === 'correct') return;

    const q = splitAddQRef.current;
    const s1 = parseInt(inputSplit1Ref.current, 10);
    const s2 = parseInt(inputSplit2Ref.current, 10);
    const res = parseInt(inputFinalRef.current, 10);

    const isCorrect =
      s1 === q.split1 &&
      s2 === q.split2 &&
      res === q.finalResult;

    if (isCorrect) {
      sound.playCorrect();
      splitAddStatusRef.current = 'correct';
      setSplitAddStatus('correct');
      setSplitAddErrorMsg('');
      setStreak((s) => s + 1);
      onEarnStar();
    } else {
      sound.playIncorrect();
      splitAddStatusRef.current = 'wrong';
      setSplitAddStatus('wrong');
      if (s1 !== q.split1) {
        setSplitAddErrorMsg(
          `Chưa đúng rồi! Ở Ô tách 1, ${q.num1} cộng mấy để bằng ${q.roundTen} nhỉ?`
        );
      } else if (s2 !== q.split2) {
        setSplitAddErrorMsg(
          `Chưa đúng rồi! Tách ${q.num2} gồm ${q.split1} và mấy ở Ô tách 2 nhỉ?`
        );
      } else {
        setSplitAddErrorMsg(
          `2 ô tách đúng rồi! Bé kiểm tra lại ô Kết quả (${q.roundTen} + ${q.split2} = mấy) nhé!`
        );
      }
    }
  };

  const handleFloatingSubmitSplitAdd = () => {
    const s1 = inputSplit1Ref.current.trim();
    const s2 = inputSplit2Ref.current.trim();
    const fin = inputFinalRef.current.trim();

    if (s1 && s2 && fin) {
      handleCheckSplitAdd();
    } else if (!s1) {
      activeSlotRef.current = 'split1';
      setActiveSlot('split1');
    } else if (!s2) {
      activeSlotRef.current = 'split2';
      setActiveSlot('split2');
    } else {
      activeSlotRef.current = 'finalResult';
      setActiveSlot('finalResult');
    }
  };

  const nextTreeQuestion = (lvl = treeLevel) => {
    const q = generateTachGopQuestion(lvl);
    treeQuestionRef.current = q;
    treeInputRef.current = '';
    treeStatusRef.current = 'idle';

    setTreeQuestion(q);
    setTreeInput('');
    setTreeStatus('idle');
    setShowTreeHint(false);
    closeKeypad();
  };

  const handleCheckTree = () => {
    if (treeStatusRef.current === 'correct') return;
    const raw = treeInputRef.current.trim();
    if (!raw) return;

    const q = treeQuestionRef.current;
    const ans = parseInt(raw, 10);
    let expected = q.total;
    if (q.missingField === 'partA') expected = q.partA;
    if (q.missingField === 'partB') expected = q.partB;

    if (ans === expected) {
      sound.playCorrect();
      treeStatusRef.current = 'correct';
      setTreeStatus('correct');
      setStreak((s) => s + 1);
      onEarnStar();
    } else {
      sound.playIncorrect();
      treeStatusRef.current = 'wrong';
      setTreeStatus('wrong');
    }
  };

  const handleSplitAddPadDigit = (d: string) => {
    const slot = activeSlotRef.current;
    const isSingleDigitSplit = splitAddQRef.current.num2 < 10;

    if (slot === 'split1') {
      const cur = inputSplit1Ref.current;
      const next = isSingleDigitSplit ? d : cur.length < 2 ? cur + d : cur;
      inputSplit1Ref.current = next;
      setInputSplit1(next);
      updateKeypadValue(next);
      if (isSingleDigitSplit && !inputSplit2Ref.current) {
        activeSlotRef.current = 'split2';
        setActiveSlot('split2');
      }
    } else if (slot === 'split2') {
      const cur = inputSplit2Ref.current;
      const next = isSingleDigitSplit ? d : cur.length < 2 ? cur + d : cur;
      inputSplit2Ref.current = next;
      setInputSplit2(next);
      updateKeypadValue(next);
      if (isSingleDigitSplit && !inputFinalRef.current) {
        activeSlotRef.current = 'finalResult';
        setActiveSlot('finalResult');
      }
    } else {
      const cur = inputFinalRef.current;
      const next = cur.length < 3 ? cur + d : cur;
      inputFinalRef.current = next;
      setInputFinal(next);
      updateKeypadValue(next);
    }
    splitAddStatusRef.current = 'idle';
    setSplitAddStatus('idle');
    setSplitAddErrorMsg('');
  };

  const handleSplitAddPadDelete = () => {
    const slot = activeSlotRef.current;
    if (slot === 'split1') {
      const next = inputSplit1Ref.current.slice(0, -1);
      inputSplit1Ref.current = next;
      setInputSplit1(next);
      updateKeypadValue(next);
    } else if (slot === 'split2') {
      if (inputSplit2Ref.current) {
        const next = inputSplit2Ref.current.slice(0, -1);
        inputSplit2Ref.current = next;
        setInputSplit2(next);
        updateKeypadValue(next);
      } else {
        activeSlotRef.current = 'split1';
        setActiveSlot('split1');
        const next = inputSplit1Ref.current.slice(0, -1);
        inputSplit1Ref.current = next;
        setInputSplit1(next);
        updateKeypadValue(next);
      }
    } else {
      if (inputFinalRef.current) {
        const next = inputFinalRef.current.slice(0, -1);
        inputFinalRef.current = next;
        setInputFinal(next);
        updateKeypadValue(next);
      } else {
        activeSlotRef.current = 'split2';
        setActiveSlot('split2');
        const next = inputSplit2Ref.current.slice(0, -1);
        inputSplit2Ref.current = next;
        setInputSplit2(next);
        updateKeypadValue(next);
      }
    }
    splitAddStatusRef.current = 'idle';
    setSplitAddStatus('idle');
    setSplitAddErrorMsg('');
  };

  const handleSplitAddPadClear = () => {
    const slot = activeSlotRef.current;
    if (slot === 'split1') {
      inputSplit1Ref.current = '';
      setInputSplit1('');
      updateKeypadValue('');
    } else if (slot === 'split2') {
      inputSplit2Ref.current = '';
      setInputSplit2('');
      updateKeypadValue('');
    } else {
      inputFinalRef.current = '';
      setInputFinal('');
      updateKeypadValue('');
    }
    splitAddStatusRef.current = 'idle';
    setSplitAddStatus('idle');
    setSplitAddErrorMsg('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (activeSubMode === 'split-add') {
          handleSplitAddPadDigit(e.key);
        } else if (activeSubMode === 'bond-tree') {
          if (treeInputRef.current.length < 3) {
            const next = treeInputRef.current + e.key;
            treeInputRef.current = next;
            setTreeInput(next);
            updateKeypadValue(next);
            treeStatusRef.current = 'idle';
            setTreeStatus('idle');
          }
        }
      } else if (e.key === 'Backspace') {
        if (activeSubMode === 'split-add') {
          handleSplitAddPadDelete();
        } else if (activeSubMode === 'bond-tree') {
          const next = treeInputRef.current.slice(0, -1);
          treeInputRef.current = next;
          setTreeInput(next);
          updateKeypadValue(next);
          treeStatusRef.current = 'idle';
          setTreeStatus('idle');
        }
      } else if (e.key === 'Enter') {
        if (activeSubMode === 'split-add') {
          if (splitAddStatusRef.current === 'correct') nextSplitAddQuestion();
          else handleCheckSplitAdd();
        } else if (activeSubMode === 'bond-tree') {
          if (treeStatusRef.current === 'correct') nextTreeQuestion();
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

  const openFinalKeypad = (el: HTMLElement) => {
    sound.playClick();
    setActiveSlot('finalResult');
    activeSlotRef.current = 'finalResult';
    openKeypad({
      title: 'Ô kết quả phép tính',
      value: inputFinalRef.current,
      maxLength: 3,
      targetEl: el,
      onChange: (next) => {
        inputFinalRef.current = next;
        setInputFinal(next);
        splitAddStatusRef.current = 'idle';
        setSplitAddStatus('idle');
        setSplitAddErrorMsg('');
      },
      onSubmit: () => {
        handleFloatingSubmitSplitAdd();
      },
    });
  };

  const openSplit1Keypad = (el: HTMLElement) => {
    sound.playClick();
    setActiveSlot('split1');
    activeSlotRef.current = 'split1';
    const isSingle = splitAddQRef.current.num2 < 10;
    openKeypad({
      title: `Ô tách 1 (để gộp đủ ${splitAddQRef.current.roundTen})`,
      value: inputSplit1Ref.current,
      maxLength: isSingle ? 1 : 2,
      targetEl: el,
      onChange: (next) => {
        inputSplit1Ref.current = next;
        setInputSplit1(next);
        splitAddStatusRef.current = 'idle';
        setSplitAddStatus('idle');
        setSplitAddErrorMsg('');
      },
      onSubmit: () => {
        handleFloatingSubmitSplitAdd();
      },
    });
  };

  const openSplit2Keypad = (el: HTMLElement) => {
    sound.playClick();
    setActiveSlot('split2');
    activeSlotRef.current = 'split2';
    const isSingle = splitAddQRef.current.num2 < 10;
    openKeypad({
      title: 'Ô tách 2 (phần còn lại)',
      value: inputSplit2Ref.current,
      maxLength: isSingle ? 1 : 2,
      targetEl: el,
      onChange: (next) => {
        inputSplit2Ref.current = next;
        setInputSplit2(next);
        splitAddStatusRef.current = 'idle';
        setSplitAddStatus('idle');
        setSplitAddErrorMsg('');
      },
      onSubmit: () => {
        handleFloatingSubmitSplitAdd();
      },
    });
  };

  const openTreeKeypad = (el: HTMLElement, title: string) => {
    sound.playClick();
    openKeypad({
      title,
      value: treeInputRef.current,
      maxLength: 3,
      targetEl: el,
      onChange: (next) => {
        treeInputRef.current = next;
        setTreeInput(next);
        treeStatusRef.current = 'idle';
        setTreeStatus('idle');
      },
      onSubmit: () => {
        handleCheckTree();
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Submode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-amber-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-amber-50 rounded-xl border border-amber-200/60">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              closeKeypad();
              setActiveSubMode('split-add');
            }}
            className={`min-h-[44px] px-3 sm:px-4 py-2 text-sm font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubMode === 'split-add'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Split className="w-4 h-4 shrink-0" />
            <span>Tách Số Cộng Qua 10</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              closeKeypad();
              setActiveSubMode('bond-tree');
            }}
            className={`min-h-[44px] px-3 sm:px-4 py-2 text-sm font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubMode === 'bond-tree'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>Sơ Đồ Cây Tách - Gộp</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              closeKeypad();
              setActiveSubMode('sandbox');
            }}
            className={`min-h-[44px] px-3 sm:px-4 py-2 text-sm font-bold rounded-lg transition-colors cursor-pointer ${
              activeSubMode === 'sandbox'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            Phòng Khám Phá Tự Do
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-sm font-bold text-amber-800">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Liên tiếp: {streak}</span>
        </div>
      </div>

      {/* MODE 1: TÁCH SỐ ĐỂ CỘNG QUA 10 */}
      {activeSubMode === 'split-add' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 bg-white p-4 sm:p-6 rounded-2xl border border-amber-200/80 shadow-xs space-y-5">
            <div className="border-b border-amber-100 pb-3 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                    Tách số để làm tròn 10 rồi cộng
                  </h2>
                  <p className="text-sm text-emerald-700 font-semibold">
                    ✓ Cả 2 số đều dưới 10 (từ 2 đến 9) · Gộp đủ 10 rồi cộng số còn lại
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-amber-50 p-1 rounded-xl border border-amber-200 text-sm">
                  <span className="text-amber-900 font-bold px-1.5">Tối đa:</span>
                  {[9, 8, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleMaxNumChange(num)}
                      className={`min-h-[44px] px-3 py-1.5 rounded-lg font-black transition-colors cursor-pointer ${
                        maxNumLimit === num
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-amber-100'
                      }`}
                    >
                      ≤ {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-sm pt-2 border-t border-amber-100/60">
                <span className="text-slate-700 font-semibold">Bảng cộng:</span>
                <button
                  type="button"
                  onClick={() => handleTableChange('all')}
                  className={`min-h-[44px] px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    tableSelection === 'all'
                      ? 'bg-amber-200 text-amber-950 border border-amber-400'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Tất cả
                </button>
                {([9, 8, 7, 6] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTableChange(t)}
                    disabled={t > maxNumLimit}
                    className={`min-h-[44px] px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                      tableSelection === t
                        ? 'bg-amber-500 text-white shadow-xs'
                        : t > maxNumLimit
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                        : 'bg-slate-100 text-slate-700 hover:bg-amber-100'
                    }`}
                  >
                    {t}+
                  </button>
                ))}
              </div>
            </div>

            {/* KHUNG MINH HỌA TÁCH SỐ 2 Ô CHUẨN SƯ PHẠM */}
            <div className="bg-gradient-to-b from-amber-50/60 to-orange-50/40 p-4 sm:p-6 rounded-2xl border border-amber-200/80 flex flex-col items-center">
              <div className="flex items-center justify-center gap-2 sm:gap-4 text-2xl sm:text-4xl font-black text-slate-900">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-400 border-2 border-amber-500 text-amber-950 flex items-center justify-center shadow-sm">
                  {splitAddQ.num1}
                </div>

                <span className="text-amber-600 font-extrabold">+</span>

                <div className="relative flex flex-col items-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-500 border-2 border-blue-600 text-white flex items-center justify-center shadow-sm">
                    {splitAddQ.num2}
                  </div>
                  <span className="text-sm font-bold text-blue-800 mt-1">
                    Số tách
                  </span>
                </div>

                <span className="text-slate-400 font-extrabold">=</span>

                <input
                  type="text"
                  inputMode="none"
                  readOnly
                  maxLength={3}
                  value={inputFinal}
                  placeholder="?"
                  onClick={(e) => openFinalKeypad(e.currentTarget)}
                  className={`w-16 h-14 sm:w-20 sm:h-16 rounded-2xl border-3 text-center text-2xl sm:text-3xl font-black transition-all cursor-pointer shadow-sm outline-none ${
                    activeSlot === 'finalResult'
                      ? 'border-emerald-500 bg-emerald-100 text-emerald-950 scale-105 animate-pulse-glow'
                      : inputFinal
                      ? 'border-emerald-400 bg-white text-emerald-900'
                      : 'border-dashed border-amber-300 bg-white text-slate-300 placeholder:text-slate-300'
                  }`}
                  title="Chạm để điền kết quả phép tính"
                />
              </div>

              {/* Nhánh tách hình chữ V */}
              <div className="relative mt-2 mb-4 w-full max-w-[230px] flex flex-col items-center">
                <svg className="w-48 max-w-full h-10" viewBox="0 0 192 40" fill="none">
                  <path
                    d="M 96 0 C 96 15, 36 15, 36 40"
                    stroke="#2563EB"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 96 0 C 96 15, 156 15, 156 40"
                    stroke="#2563EB"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="w-full flex items-start justify-between gap-2">
                  {/* Ô TÁCH 1 */}
                  <div className="flex flex-col items-center">
                    <input
                      type="text"
                      inputMode="none"
                      readOnly
                      maxLength={2}
                      value={inputSplit1}
                      placeholder="?"
                      onClick={(e) => openSplit1Keypad(e.currentTarget)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-3 text-center text-2xl sm:text-3xl font-black shadow-md transition-all outline-none cursor-pointer ${
                        activeSlot === 'split1'
                          ? 'border-blue-600 bg-blue-100 text-blue-950 scale-105 animate-pulse-glow'
                          : inputSplit1
                          ? 'border-blue-400 bg-white text-blue-900'
                          : 'border-dashed border-blue-400 bg-white text-slate-300 placeholder:text-slate-300'
                      }`}
                      title="Ô tách 1: Cần mấy để gộp với số đầu thành 10?"
                    />
                    <span className="text-sm font-bold text-blue-800 mt-1">
                      Ô tách 1
                    </span>
                    <span className="text-sm text-slate-600 font-semibold text-center">
                      ({splitAddQ.num1} + ? = {splitAddQ.roundTen})
                    </span>
                  </div>

                  <div className="text-blue-500 font-black text-2xl pt-3">
                    +
                  </div>

                  {/* Ô TÁCH 2 */}
                  <div className="flex flex-col items-center">
                    <input
                      type="text"
                      inputMode="none"
                      readOnly
                      maxLength={2}
                      value={inputSplit2}
                      placeholder="?"
                      onClick={(e) => openSplit2Keypad(e.currentTarget)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-3 text-center text-2xl sm:text-3xl font-black shadow-md transition-all outline-none cursor-pointer ${
                        activeSlot === 'split2'
                          ? 'border-blue-600 bg-blue-100 text-blue-950 scale-105 animate-pulse-glow'
                          : inputSplit2
                          ? 'border-blue-400 bg-white text-blue-900'
                          : 'border-dashed border-blue-400 bg-white text-slate-300 placeholder:text-slate-300'
                      }`}
                      title="Ô tách 2: Số còn lại sau khi tách"
                    />
                    <span className="text-sm font-bold text-blue-800 mt-1">
                      Ô tách 2
                    </span>
                    <span className="text-sm text-slate-600 font-semibold text-center">
                      (còn lại)
                    </span>
                  </div>
                </div>
              </div>

              {/* 2 BƯỚC CỘNG TRỰC QUAN */}
              <div className="w-full max-w-md bg-white p-3.5 sm:p-4 rounded-xl border border-amber-200 shadow-xs space-y-2 text-sm sm:text-base">
                <div className="font-bold text-amber-900 border-b border-amber-100 pb-1 flex items-center justify-between">
                  <span>Cách tính cộng qua 10 từng bước:</span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/70 border border-amber-200/60 font-semibold text-slate-800">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-sm font-black flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    Lấy <strong>{splitAddQ.num1}</strong> +{' '}
                    <strong className="text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-300">
                      {inputSplit1 || 'Ô 1'}
                    </strong>{' '}
                    = <strong className="text-amber-800">{splitAddQ.roundTen}</strong> (tròn chục)
                  </span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/60 font-semibold text-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-sm font-black flex items-center justify-center shrink-0">
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

                <div className="text-center font-bold text-slate-900 pt-1 text-lg">
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
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-wrap items-center justify-between gap-2 animate-pop">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <span>Bé tách số và cộng chuẩn xác 100%! +1 ★</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => nextSplitAddQuestion()}
                    className="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95 whitespace-nowrap"
                  >
                    <span>Bài tiếp</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {splitAddStatus === 'wrong' && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-rose-700 text-sm font-medium">
                  <span>
                    {splitAddErrorMsg ||
                      `Chưa đúng rồi! Bé kiểm tra lại xem 2 ô tách đã cộng bằng ${splitAddQ.num2} chưa nhé!`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      inputSplit1Ref.current = '';
                      inputSplit2Ref.current = '';
                      inputFinalRef.current = '';
                      activeSlotRef.current = 'split1';
                      splitAddStatusRef.current = 'idle';
                      setInputSplit1('');
                      setInputSplit2('');
                      setInputFinal('');
                      setActiveSlot('split1');
                      setSplitAddStatus('idle');
                      setSplitAddErrorMsg('');
                      updateKeypadValue('');
                    }}
                    className="min-h-[44px] px-3 py-1.5 text-sm font-bold underline hover:text-rose-900 cursor-pointer"
                  >
                    Làm lại
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSplitAddHint(!showSplitAddHint)}
                  className="min-h-[44px] px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 flex items-center gap-1.5 text-sm font-bold text-amber-800 cursor-pointer"
                >
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>{showSplitAddHint ? 'Ẩn hướng dẫn tách' : 'Bé cần mẹo tách số?'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => nextSplitAddQuestion()}
                  className="min-h-[44px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 text-sm font-semibold text-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Đổi phép tính khác</span>
                </button>
              </div>

              {showSplitAddHint && (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-950 leading-relaxed space-y-1">
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
              <div className="grid grid-cols-3 gap-2 mb-3">
                <button
                  type="button"
                  onClick={(e) => openSplit1Keypad(e.currentTarget)}
                  className={`min-h-[44px] py-2 px-1.5 rounded-xl text-sm font-bold border transition-colors cursor-pointer text-center ${
                    activeSlot === 'split1'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-blue-50 text-blue-900 border-blue-200'
                  }`}
                >
                  Ô 1: <span className="font-extrabold">{inputSplit1 || '?'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => openSplit2Keypad(e.currentTarget)}
                  className={`min-h-[44px] py-2 px-1.5 rounded-xl text-sm font-bold border transition-colors cursor-pointer text-center ${
                    activeSlot === 'split2'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-blue-50 text-blue-900 border-blue-200'
                  }`}
                >
                  Ô 2: <span className="font-extrabold">{inputSplit2 || '?'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => openFinalKeypad(e.currentTarget)}
                  className={`min-h-[44px] py-2 px-1.5 rounded-xl text-sm font-bold border transition-colors cursor-pointer text-center ${
                    activeSlot === 'finalResult'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  }`}
                >
                  K.quả: <span className="font-extrabold">{inputFinal || '?'}</span>
                </button>
              </div>

              <div className="text-center mb-3">
                <span className="text-sm text-slate-600 font-semibold">
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
                    : inputFinal) || <span className="text-slate-300 font-normal text-xl">Chạm ô ? để nhập</span>}
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

      {/* MODE 2: SƠ ĐỒ CÂY TÁCH - GỘP CHUẨN SGK */}
      {activeSubMode === 'bond-tree' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 bg-white p-4 sm:p-6 rounded-2xl border border-amber-200/80 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                  {treeQuestion.missingField === 'total'
                    ? 'Gộp các số để tìm số ở trên'
                    : 'Tách số ở trên thành 2 số'}
                </h2>
                <p className="text-sm text-slate-600">
                  Chạm vào ô có dấu hỏi chấm (?) để điền số thích hợp
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setTreeLevel('basic');
                    nextTreeQuestion('basic');
                  }}
                  className={`min-h-[44px] px-3 py-1.5 rounded-xl font-bold cursor-pointer ${
                    treeLevel === 'basic' ? 'bg-amber-200 text-amber-950' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Phạm vi 20
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTreeLevel('tens');
                    nextTreeQuestion('tens');
                  }}
                  className={`min-h-[44px] px-3 py-1.5 rounded-xl font-bold cursor-pointer ${
                    treeLevel === 'tens' ? 'bg-amber-200 text-amber-950' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Chục & đơn vị
                </button>
              </div>
            </div>

            {/* Sơ đồ cây */}
            <div className="relative py-4 select-none">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg className="w-72 max-w-full h-44" viewBox="0 0 288 176" fill="none">
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
                <div className="flex flex-col items-center">
                  {treeQuestion.missingField === 'total' ? (
                    <input
                      type="text"
                      inputMode="none"
                      readOnly
                      maxLength={3}
                      value={treeInput}
                      placeholder="?"
                      onClick={(e) => openTreeKeypad(e.currentTarget, 'Điền số tổng (?)')}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full text-center font-extrabold text-2xl sm:text-3xl border-4 border-amber-500 bg-amber-100 text-amber-900 animate-pulse-glow cursor-pointer outline-none shadow-md placeholder:text-amber-300"
                      title="Chạm để điền số tổng"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center font-extrabold text-2xl sm:text-3xl border-4 border-amber-600 bg-amber-400 text-amber-950 shadow-md">
                      {treeQuestion.total}
                    </div>
                  )}
                  <span className="text-sm font-bold text-amber-900 mt-1">
                    Số gộp (Tổng)
                  </span>
                </div>

                <div className="w-full flex items-center justify-around px-2">
                  <div className="flex flex-col items-center">
                    {treeQuestion.missingField === 'partA' ? (
                      <input
                        type="text"
                        inputMode="none"
                        readOnly
                        maxLength={3}
                        value={treeInput}
                        placeholder="?"
                        onClick={(e) => openTreeKeypad(e.currentTarget, 'Điền số phần 1 (?)')}
                        className="w-18 h-18 sm:w-22 sm:h-22 rounded-full text-center font-extrabold text-2xl border-4 border-emerald-500 bg-emerald-100 text-emerald-950 animate-pulse-glow cursor-pointer outline-none shadow-md placeholder:text-emerald-300"
                        title="Chạm để điền số phần 1"
                      />
                    ) : (
                      <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full flex items-center justify-center font-extrabold text-2xl border-4 border-emerald-600 bg-emerald-400 text-emerald-950 shadow-md">
                        {treeQuestion.partA}
                      </div>
                    )}
                    <span className="text-sm font-bold text-emerald-800 mt-1">
                      Phần 1
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    {treeQuestion.missingField === 'partB' ? (
                      <input
                        type="text"
                        inputMode="none"
                        readOnly
                        maxLength={3}
                        value={treeInput}
                        placeholder="?"
                        onClick={(e) => openTreeKeypad(e.currentTarget, 'Điền số phần 2 (?)')}
                        className="w-18 h-18 sm:w-22 sm:h-22 rounded-full text-center font-extrabold text-2xl border-4 border-blue-500 bg-blue-100 text-blue-950 animate-pulse-glow cursor-pointer outline-none shadow-md placeholder:text-blue-300"
                        title="Chạm để điền số phần 2"
                      />
                    ) : (
                      <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full flex items-center justify-center font-extrabold text-2xl border-4 border-blue-600 bg-blue-400 text-blue-950 shadow-md">
                        {treeQuestion.partB}
                      </div>
                    )}
                    <span className="text-sm font-bold text-blue-800 mt-1">
                      Phần 2
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 text-center text-lg font-bold text-slate-800">
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

            <div className="space-y-3">
              {treeStatus === 'correct' && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-wrap items-center justify-between gap-2 animate-pop">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <span>Chính xác rồi! Bé thật thông minh! +1 ★</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => nextTreeQuestion()}
                    className="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95 whitespace-nowrap"
                  >
                    <span>Câu tiếp</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {treeStatus === 'wrong' && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-rose-700 text-sm font-medium">
                  <span>Chưa đúng rồi! Bé thử đếm lại hoặc xem gợi ý nhé!</span>
                  <button
                    type="button"
                    onClick={() => {
                      treeInputRef.current = '';
                      treeStatusRef.current = 'idle';
                      setTreeInput('');
                      setTreeStatus('idle');
                      updateKeypadValue('');
                    }}
                    className="min-h-[44px] px-3 py-1.5 text-sm font-bold underline hover:text-rose-900 cursor-pointer"
                  >
                    Thử lại
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowTreeHint(!showTreeHint)}
                  className="min-h-[44px] px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 flex items-center gap-1.5 text-sm font-bold text-amber-800 cursor-pointer"
                >
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>{showTreeHint ? 'Ẩn gợi ý' : 'Bé cần gợi ý?'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => nextTreeQuestion()}
                  className="min-h-[44px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 text-sm font-semibold text-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Đổi câu khác</span>
                </button>
              </div>

              {showTreeHint && (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-950 leading-relaxed">
                  💡 <strong>Gợi ý:</strong> {treeQuestion.hint}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
              <div className="text-center mb-3">
                <span className="text-sm text-slate-600 font-semibold">Số bé đang nhập:</span>
                <div className="text-3xl font-black text-amber-900 h-10 flex items-center justify-center">
                  {treeInput || <span className="text-slate-300 font-normal text-xl">Chạm ô ? để nhập</span>}
                </div>
              </div>

              <NumberPad
                onNumberClick={(d) => {
                  const cur = treeInputRef.current;
                  const next = cur.length < 3 ? cur + d : cur;
                  treeInputRef.current = next;
                  setTreeInput(next);
                  updateKeypadValue(next);
                  treeStatusRef.current = 'idle';
                  setTreeStatus('idle');
                }}
                onDelete={() => {
                  const next = treeInputRef.current.slice(0, -1);
                  treeInputRef.current = next;
                  setTreeInput(next);
                  updateKeypadValue(next);
                  treeStatusRef.current = 'idle';
                  setTreeStatus('idle');
                }}
                onClear={() => {
                  treeInputRef.current = '';
                  setTreeInput('');
                  updateKeypadValue('');
                  treeStatusRef.current = 'idle';
                  setTreeStatus('idle');
                }}
                onSubmit={handleCheckTree}
                submitDisabled={!treeInput || treeStatus === 'correct'}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: PHÒNG KHÁM PHÁ TỰ DO */}
      {activeSubMode === 'sandbox' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-amber-200/80 shadow-xs space-y-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">
              Phòng Khám Phá: Bé tự chọn số để tách - gộp!
            </h2>
            <p className="text-sm text-slate-600">
              Kéo thanh trượt để xem 1 số có thể tách thành những phần nào nhé!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">Chọn nhanh:</span>
            {[10, 12, 15, 20, 36, 50, 68, 100].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSandboxTotal(n);
                  setSandboxSplit(Math.floor(n / 2));
                }}
                className={`min-h-[44px] px-3.5 py-1.5 text-sm font-bold rounded-xl border transition-colors cursor-pointer ${
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
              <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                <span>Số tổng muốn tách:</span>
                <span className="text-amber-800 text-base font-extrabold">{sandboxTotal}</span>
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
                className="w-full accent-amber-500 h-3 bg-amber-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                <span>Tách thành Phần 1 ({sandboxSplit}) và Phần 2 ({sandboxTotal - sandboxSplit}):</span>
              </div>
              <input
                type="range"
                min="0"
                max={sandboxTotal}
                value={sandboxSplit}
                onChange={(e) => setSandboxSplit(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 h-3 bg-emerald-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-amber-50/30 p-5 rounded-2xl border border-amber-200/60 flex flex-col items-center">
            <div className="text-center font-bold text-slate-800 mb-4 text-lg sm:text-xl">
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

            <div className="flex justify-between w-full max-w-md text-sm font-bold mt-2">
              <span className="text-emerald-700">Phần 1: {sandboxSplit}</span>
              <span className="text-blue-700">Phần 2: {sandboxTotal - sandboxSplit}</span>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 text-lg font-bold">
              <div className="px-3.5 py-2 bg-white rounded-xl border border-slate-200 shadow-xs">
                {sandboxSplit} + {sandboxTotal - sandboxSplit} = {sandboxTotal}
              </div>
              <div className="px-3.5 py-2 bg-white rounded-xl border border-slate-200 shadow-xs">
                {sandboxTotal} - {sandboxSplit} = {sandboxTotal - sandboxSplit}
              </div>
              <div className="px-3.5 py-2 bg-white rounded-xl border border-slate-200 shadow-xs">
                {sandboxTotal} - {sandboxTotal - sandboxSplit} = {sandboxSplit}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
