import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, Lightbulb, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import { WordProblemQuestion } from '../types/math';
import { generateWordProblemQuestion } from '../utils/mathGenerators';
import { NumberPad } from './NumberPad';
import { sound } from '../utils/audio';
import { useVirtualKeypad } from '../context/VirtualKeypadContext';

interface ToanDoSectionProps {
  onEarnStar: () => void;
}

export const ToanDoSection: React.FC<ToanDoSectionProps> = ({ onEarnStar }) => {
  const { openKeypad, updateKeypadValue, closeKeypad } = useVirtualKeypad();
  const [difficulty, setDifficulty] = useState<'basic' | 'advanced'>('basic');
  const [category, setCategory] = useState<'all' | 'cho-con-lai' | 'so-sanh-hon' | 'them-tat-ca' | 'nhieu-hon' | 'it-hon'>('all');

  const [question, setQuestion] = useState<WordProblemQuestion>(() =>
    generateWordProblemQuestion({ difficulty: 'basic', category: 'all' })
  );

  const [userResultInput, setUserResultInput] = useState<string>('');
  const [chosenOp, setChosenOp] = useState<'+' | '-' | null>(null);

  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showDiagram, setShowDiagram] = useState<boolean>(true);
  const [showScratchpad, setShowScratchpad] = useState<boolean>(false);
  const [scratchTens, setScratchTens] = useState<string>('');
  const [scratchUnit, setScratchUnit] = useState<string>('');
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = React.useRef<boolean>(false);
  const [streak, setStreak] = useState<number>(0);

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleApplyScratchToResult = () => {
    sound.playClick();
    const combined = `${scratchTens}${scratchUnit}`.trim();
    if (combined) {
      setUserResultInput(combined);
      updateKeypadValue(combined);
      setStatus('idle');
    }
  };

  const nextQuestion = (diff = difficulty, cat = category) => {
    const q = generateWordProblemQuestion({ difficulty: diff, category: cat });
    setQuestion(q);
    setUserResultInput('');
    setChosenOp(null);
    setScratchTens('');
    setScratchUnit('');
    handleClearCanvas();
    setStatus('idle');
    setShowHint(false);
    closeKeypad();
  };

  const handleDifficultyChange = (newDiff: 'basic' | 'advanced') => {
    sound.playClick();
    setDifficulty(newDiff);
    setCategory('all');
    nextQuestion(newDiff, 'all');
  };

  const handleCategoryChange = (cat: typeof category) => {
    sound.playClick();
    setCategory(cat);
    nextQuestion(difficulty, cat);
  };

  const handleCheck = () => {
    const res = parseInt(userResultInput, 10);
    const isOpCorrect = chosenOp ? chosenOp === question.operation : true;
    const isResultCorrect = res === question.result;

    if (isResultCorrect && isOpCorrect) {
      sound.playCorrect();
      setStatus('correct');
      setStreak((s) => s + 1);
      onEarnStar();
    } else {
      sound.playIncorrect();
      setStatus('wrong');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (userResultInput.length < 3) {
          const next = userResultInput + e.key;
          setUserResultInput(next);
          updateKeypadValue(next);
          setStatus('idle');
        }
      } else if (e.key === 'Backspace') {
        const next = userResultInput.slice(0, -1);
        setUserResultInput(next);
        updateKeypadValue(next);
        setStatus('idle');
      } else if (e.key === '+' || e.key === '-') {
        setChosenOp(e.key as '+' | '-');
        setStatus('idle');
      } else if (e.key === 'Enter') {
        if (status === 'correct') nextQuestion();
        else handleCheck();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userResultInput, chosenOp, status, question]);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Top Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-amber-50 rounded-xl border border-amber-200/60">
            <button
              type="button"
              onClick={() => handleDifficultyChange('basic')}
              className={`min-h-[44px] px-3.5 py-1.5 text-sm font-black rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                difficulty === 'basic'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              <span>🍬 Đề Cơ Bản</span>
            </button>
            <button
              type="button"
              onClick={() => handleDifficultyChange('advanced')}
              className={`min-h-[44px] px-3.5 py-1.5 text-sm font-black rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                difficulty === 'advanced'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-900 hover:bg-indigo-50'
              }`}
            >
              <span>🚀 Đề Nâng Cao (Có nhớ)</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-sm font-bold text-amber-800">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Liên tiếp: {streak}</span>
          </div>
        </div>

        {/* Sub-categories */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-amber-100 text-sm">
          <span className="font-bold text-slate-700">Dạng bài:</span>
          <button
            type="button"
            onClick={() => handleCategoryChange('all')}
            className={`min-h-[44px] px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              category === 'all' ? 'bg-amber-200 text-amber-950 border border-amber-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất cả
          </button>

          {difficulty === 'basic' ? (
            <>
              <button
                type="button"
                onClick={() => handleCategoryChange('cho-con-lai')}
                className={`min-h-[44px] px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  category === 'cho-con-lai' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-amber-100'
                }`}
              >
                <span>🍬 Cho đi & Còn lại (-)</span>
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('so-sanh-hon')}
                className={`min-h-[44px] px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  category === 'so-sanh-hon' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-amber-100'
                }`}
              >
                <span>📏 So sánh dài/nhiều hơn (-)</span>
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('them-tat-ca')}
                className={`min-h-[44px] px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  category === 'them-tat-ca' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-amber-100'
                }`}
              >
                <span>➕ Thêm vào (+)</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleCategoryChange('nhieu-hon')}
                className={`min-h-[44px] px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                  category === 'nhieu-hon' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-indigo-50'
                }`}
              >
                Nhiều hơn (+)
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('it-hon')}
                className={`min-h-[44px] px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                  category === 'it-hon' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-indigo-50'
                }`}
              >
                Ít hơn (-)
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Word Problem Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7 bg-white p-4 sm:p-6 rounded-2xl border border-amber-200/80 shadow-xs space-y-5">
          <div className="border-b border-amber-100 pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span
                className={`inline-block text-sm font-black px-2.5 py-0.5 rounded-lg border ${
                  difficulty === 'basic'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-indigo-100 text-indigo-900 border-indigo-300'
                }`}
              >
                {question.typeTitle}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 mt-1">
                Đề bài toán có lời văn lớp 2
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowDiagram(!showDiagram)}
              className="min-h-[44px] px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-sm font-bold text-amber-800 flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>{showDiagram ? 'Ẩn sơ đồ' : 'Xem sơ đồ'}</span>
            </button>
          </div>

          {/* ĐỀ BÀI (chữ tối thiểu 18px) */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-amber-50/70 rounded-2xl border border-amber-200 shadow-xs">
            <div className="flex items-start gap-2.5">
              <span className="text-2xl mt-0.5 shrink-0">
                {question.type === 'cho-con-lai' ? '🍬' : question.type === 'so-sanh-hon' ? '📏' : '📖'}
              </span>
              <div className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
                {question.storyText}{' '}
                <span className="text-indigo-800 underline font-black">{question.questionText}</span>
              </div>
            </div>
          </div>

          {/* SƠ ĐỒ ĐOẠN THẲNG TRỰC QUAN (Co giãn vừa khít màn hình 360px) */}
          {showDiagram && (
            <div className="p-3.5 sm:p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="text-sm font-bold text-slate-700">
                Tóm tắt bằng sơ đồ đoạn thẳng:
              </div>

              {question.type === 'cho-con-lai' && (
                <div className="space-y-2 text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-20 sm:w-24 text-slate-700 shrink-0">Ban đầu:</span>
                    <div className="flex-1 min-h-[36px] bg-amber-400 text-amber-950 flex items-center justify-center px-2 rounded-lg shadow-xs text-center">
                      {question.num1} {question.unitName}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 sm:w-24 text-slate-700 shrink-0">Cho & Còn:</span>
                    <div className="flex-1 flex items-center gap-1 min-w-0">
                      <div className="min-h-[36px] bg-rose-500 text-white flex items-center justify-center px-2 rounded-l-lg text-sm shrink-0">
                        Cho: {question.num2}
                      </div>
                      <div className="flex-1 min-h-[36px] bg-emerald-600 text-white flex items-center justify-center px-2 rounded-r-lg text-sm font-black text-center">
                        Còn: ?
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {question.type === 'so-sanh-hon' && (
                <div className="space-y-2 text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-700 truncate shrink-0">{question.item1Name}:</span>
                    <div className="flex-1 min-h-[36px] bg-blue-500 text-white flex items-center justify-center px-2 rounded-lg shadow-xs">
                      {question.num1} {question.unitName}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-700 truncate shrink-0">{question.item2Name}:</span>
                    <div className="flex-1 flex items-center gap-1 min-w-0">
                      <div className="flex-1 min-h-[36px] bg-blue-200 text-slate-900 flex items-center justify-center px-2 rounded-l-lg">
                        {question.num2} {question.unitName}
                      </div>
                      <div className="min-h-[36px] bg-emerald-600 text-white flex items-center justify-center px-2 rounded-r-lg text-sm font-black shrink-0">
                        Hơn: ?
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {question.type === 'them-tat-ca' && (
                <div className="space-y-2 text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-20 sm:w-24 text-slate-700 shrink-0">Tất cả:</span>
                    <div className="flex-1 flex flex-wrap items-center gap-1">
                      <div className="min-h-[36px] bg-amber-400 text-amber-950 flex items-center justify-center px-2.5 rounded-l-lg">
                        Có: {question.num1}
                      </div>
                      <div className="min-h-[36px] bg-blue-400 text-blue-950 flex items-center justify-center px-2.5 rounded-r-lg">
                        Thêm: {question.num2}
                      </div>
                      <span className="text-emerald-700 font-black ml-1">➔ ? {question.unitName}</span>
                    </div>
                  </div>
                </div>
              )}

              {(question.type === 'nhieu-hon' || question.type === 'it-hon') && (
                <div className="space-y-2 text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-700 truncate shrink-0">{question.item1Name}:</span>
                    <div className="flex-1 min-h-[36px] bg-blue-500 text-white flex items-center justify-center px-2 rounded-lg shadow-xs">
                      {question.num1} {question.unitName}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-700 truncate shrink-0">{question.item2Name}:</span>
                    <div className="flex-1 flex flex-wrap items-center gap-1">
                      <div
                        className={`min-h-[36px] ${
                          question.type === 'nhieu-hon' ? 'bg-blue-200 text-slate-900' : 'bg-emerald-600 text-white'
                        } flex items-center justify-center px-2.5 rounded-l-lg`}
                      >
                        {question.type === 'nhieu-hon' ? `${question.num1}` : '?'}
                      </div>
                      <div className="min-h-[36px] bg-emerald-600 text-white flex items-center justify-center px-2.5 rounded-r-lg text-sm">
                        {question.difference} {question.unitName}
                      </div>
                      {question.type === 'nhieu-hon' && (
                        <span className="text-emerald-800 font-extrabold ml-1">➔ ? {question.unitName}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BẬT / ẨN BẢNG NHÁP XẾP 2 SỐ */}
          <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">📝</span>
                <div>
                  <h3 className="text-sm font-bold text-amber-950">
                    Bảng nháp xếp cột dọc cho bé
                  </h3>
                  <p className="text-sm text-slate-600">
                    Xếp sẵn 2 số theo cột dọc để bé dễ nháp tính
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowScratchpad(!showScratchpad);
                }}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 ${
                  showScratchpad
                    ? 'bg-amber-500 text-white border border-amber-600'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-amber-100'
                }`}
              >
                <span>{showScratchpad ? 'Ẩn bảng nháp' : 'Mở bảng nháp'}</span>
              </button>
            </div>

            {showScratchpad && (
              <div className="pt-2 border-t border-amber-200/70 space-y-3 animate-pop">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                  {/* Khung đặt tính cột dọc 2 số */}
                  <div className="bg-white p-3.5 rounded-xl border-2 border-amber-300 flex flex-col items-center shadow-xs">
                    <span className="text-sm font-bold text-amber-900 mb-1.5">
                      Cột dọc: {question.num1} {question.operation} {question.num2}
                    </span>
                    <div className="w-48 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200 text-center font-mono">
                      <div className="grid grid-cols-2 text-sm font-bold text-slate-600 border-b border-amber-200 pb-1 mb-1">
                        <span>Chục</span>
                        <span>Đơn vị</span>
                      </div>

                      <div className="grid grid-cols-2 text-2xl font-black text-slate-800 py-0.5 border-b border-slate-100">
                        <span>{Math.floor(question.num1 / 10) || ''}</span>
                        <span>{question.num1 % 10}</span>
                      </div>

                      <div className="relative grid grid-cols-2 text-2xl font-black text-slate-800 py-0.5">
                        <span className="absolute left-1 text-amber-700 text-xl font-sans font-black">
                          {question.operation}
                        </span>
                        <span>{Math.floor(question.num2 / 10) || ''}</span>
                        <span>{question.num2 % 10}</span>
                      </div>

                      <div className="w-full h-1 bg-slate-800 rounded-full my-1.5" />

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
                          className="h-11 text-center text-xl font-black rounded-lg border-2 border-amber-400 bg-white text-slate-900 outline-none cursor-pointer"
                          title="Nháp chữ số hàng chục"
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
                          className="h-11 text-center text-xl font-black rounded-lg border-2 border-blue-400 bg-white text-slate-900 outline-none cursor-pointer"
                          title="Nháp chữ số hàng đơn vị"
                        />
                      </div>
                    </div>

                    {(scratchTens || scratchUnit) && (
                      <button
                        type="button"
                        onClick={handleApplyScratchToResult}
                        className="min-h-[44px] mt-2.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-xs cursor-pointer active:scale-95 transition-transform"
                      >
                        👉 Đưa số ({scratchTens}{scratchUnit}) vào bài làm
                      </button>
                    )}
                  </div>

                  {/* Bảng vẽ ngón tay */}
                  <div className="bg-white p-3 rounded-xl border border-amber-200 flex flex-col items-center shadow-xs">
                    <div className="w-full flex items-center justify-between mb-1.5 text-sm font-bold text-slate-700">
                      <span>✏️ Vẽ nháp:</span>
                      <button
                        type="button"
                        onClick={handleClearCanvas}
                        className="min-h-[44px] px-2.5 text-sm text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer"
                      >
                        Xóa nét vẽ
                      </button>
                    </div>
                    <canvas
                      ref={canvasRef}
                      width={220}
                      height={130}
                      onPointerDown={(e) => {
                        isDrawingRef.current = true;
                        const canvas = canvasRef.current;
                        if (!canvas) return;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return;
                        const rect = canvas.getBoundingClientRect();
                        ctx.lineWidth = 3;
                        ctx.lineCap = 'round';
                        ctx.strokeStyle = '#2563eb';
                        ctx.beginPath();
                        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                      }}
                      onPointerMove={(e) => {
                        if (!isDrawingRef.current) return;
                        const canvas = canvasRef.current;
                        if (!canvas) return;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return;
                        const rect = canvas.getBoundingClientRect();
                        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                        ctx.stroke();
                      }}
                      onPointerUp={() => {
                        isDrawingRef.current = false;
                      }}
                      onPointerLeave={() => {
                        isDrawingRef.current = false;
                      }}
                      className="w-full h-32 bg-amber-50/40 rounded-lg border border-dashed border-amber-300 touch-none cursor-crosshair"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* KHUNG BÀI GIẢI MẪU 3 BƯỚC CHUẨN TIỂU HỌC */}
          <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-amber-300 space-y-4">
            <div className="text-center font-bold text-amber-900 uppercase tracking-wide text-sm">
              Bài Giải
            </div>

            <div className="text-base font-bold text-slate-800 pl-2.5 border-l-4 border-amber-400">
              {question.solutionTitle}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-3 bg-amber-50/60 rounded-xl p-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {question.num1}
              </span>

              {/* Nút chọn phép tính (+ hoặc -) min-h-[44px] */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setChosenOp('+');
                    setStatus('idle');
                  }}
                  className={`min-w-[44px] min-h-[44px] rounded-xl font-black text-2xl transition-all cursor-pointer border ${
                    chosenOp === '+'
                      ? 'bg-amber-500 text-white border-amber-600 scale-105 shadow-xs'
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-amber-100'
                  }`}
                  title="Phép cộng"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setChosenOp('-');
                    setStatus('idle');
                  }}
                  className={`min-w-[44px] min-h-[44px] rounded-xl font-black text-2xl transition-all cursor-pointer border ${
                    chosenOp === '-'
                      ? 'bg-amber-500 text-white border-amber-600 scale-105 shadow-xs'
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-amber-100'
                  }`}
                  title="Phép trừ"
                >
                  -
                </button>
              </div>

              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {question.num2}
              </span>

              <span className="text-2xl font-bold text-slate-400">=</span>

              {/* Ô kết quả */}
              <input
                type="text"
                inputMode="none"
                readOnly
                value={userResultInput}
                placeholder="?"
                onClick={(e) => {
                  sound.playClick();
                  openKeypad({
                    title: 'Kết quả bài toán đố',
                    value: userResultInput,
                    maxLength: 3,
                    targetEl: e.currentTarget,
                    onChange: (val) => {
                      setUserResultInput(val);
                      setStatus('idle');
                    },
                    onSubmit: handleCheck,
                  });
                }}
                className={`w-24 h-12 rounded-xl border-2 text-center text-2xl font-black transition-all px-2 outline-none cursor-pointer ${
                  status === 'correct'
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                    : status === 'wrong'
                    ? 'bg-rose-50 border-rose-400 text-rose-800'
                    : userResultInput
                    ? 'bg-white border-amber-500 text-slate-900 shadow-sm'
                    : 'bg-white border-dashed border-amber-300 text-slate-300 placeholder:text-slate-300 animate-pulse'
                }`}
                title="Chạm vào để mở bàn phím số"
              />

              <span className="text-sm sm:text-base font-bold text-slate-700">
                ({question.unitName})
              </span>
            </div>

            <div className="text-right text-sm sm:text-base font-bold text-slate-700 pr-2">
              Đáp số: <span className="text-emerald-700 underline font-black">{userResultInput || '.....'}</span> {question.unitName}
            </div>
          </div>

          {/* Feedback & Actions */}
          <div className="space-y-3">
            {status === 'correct' && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-wrap items-center justify-between gap-2 animate-pop">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <span>Bé giải đúng bài toán rồi! Thật tuyệt vời! +1 ★</span>
                </div>
                <button
                  type="button"
                  onClick={() => nextQuestion()}
                  className="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95 whitespace-nowrap"
                >
                  <span>Bài tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {status === 'wrong' && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-rose-700 text-sm font-medium">
                <span>Chưa đúng rồi! Bé hãy đọc kỹ đề xem làm phép cộng hay trừ nhé!</span>
                <button
                  type="button"
                  onClick={() => {
                    setUserResultInput('');
                    setChosenOp(null);
                    setStatus('idle');
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
                onClick={() => setShowHint(!showHint)}
                className="min-h-[44px] px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 flex items-center gap-1.5 text-sm font-bold text-amber-800 cursor-pointer"
              >
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>{showHint ? 'Ẩn mẹo giải toán' : 'Mẹo giải toán đố?'}</span>
              </button>

              <button
                type="button"
                onClick={() => nextQuestion()}
                className="min-h-[44px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 text-sm font-semibold text-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Đổi bài toán khác</span>
              </button>
            </div>

            {showHint && (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-950 leading-relaxed">
                💡 <strong>Gợi ý cách làm:</strong> {question.hint}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: NumberPad */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
            <div className="text-center mb-3">
              <span className="text-sm text-slate-600 font-semibold">Kết quả bé nhập:</span>
              <div className="text-3xl font-black text-amber-900 h-10 flex items-center justify-center">
                {userResultInput || <span className="text-slate-300 font-normal text-xl">Chạm ô ? để nhập</span>}
              </div>
            </div>

            <NumberPad
              onNumberClick={(d) => {
                if (userResultInput.length < 3) {
                  const next = userResultInput + d;
                  setUserResultInput(next);
                  updateKeypadValue(next);
                  setStatus('idle');
                }
              }}
              onDelete={() => {
                const next = userResultInput.slice(0, -1);
                setUserResultInput(next);
                updateKeypadValue(next);
                setStatus('idle');
              }}
              onClear={() => {
                setUserResultInput('');
                updateKeypadValue('');
                setStatus('idle');
              }}
              onSubmit={handleCheck}
              submitDisabled={!userResultInput || status === 'correct'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
