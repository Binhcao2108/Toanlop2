import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, Lightbulb, CheckCircle2, ChevronRight, Layers, Ruler, Candy, ArrowRight } from 'lucide-react';
import { WordProblemQuestion } from '../types/math';
import { generateWordProblemQuestion } from '../utils/mathGenerators';
import { NumberPad } from './NumberPad';
import { sound } from '../utils/audio';

interface ToanDoSectionProps {
  onEarnStar: () => void;
}

export const ToanDoSection: React.FC<ToanDoSectionProps> = ({ onEarnStar }) => {
  // Difficulty: 'basic' (Đề cơ bản: kẹo, thước kẻ, bút...) vs 'advanced' (Đề nâng cao: có nhớ)
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
  const [streak, setStreak] = useState<number>(0);

  const nextQuestion = (diff = difficulty, cat = category) => {
    const q = generateWordProblemQuestion({ difficulty: diff, category: cat });
    setQuestion(q);
    setUserResultInput('');
    setChosenOp(null);
    setStatus('idle');
    setShowHint(false);
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

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (userResultInput.length < 3) {
          setUserResultInput((p) => p + e.key);
          setStatus('idle');
        }
      } else if (e.key === 'Backspace') {
        setUserResultInput((p) => p.slice(0, -1));
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Filter Bar: Basic vs Advanced & Topics */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-3">
        {/* Difficulty Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-amber-50 rounded-xl border border-amber-200/60">
            <button
              type="button"
              onClick={() => handleDifficultyChange('basic')}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-black rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                difficulty === 'basic'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              <span>🍬 Đề Cơ Bản (Dễ hiểu, gần gũi)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDifficultyChange('advanced')}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-black rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                difficulty === 'advanced'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-900 hover:bg-indigo-50'
              }`}
            >
              <span>🚀 Đề Nâng Cao (Toán có nhớ)</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-xs font-bold text-amber-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Liên tiếp: {streak}</span>
          </div>
        </div>

        {/* Sub-categories */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-amber-100 text-xs">
          <span className="font-bold text-slate-700">Dạng bài:</span>
          <button
            type="button"
            onClick={() => handleCategoryChange('all')}
            className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
              category === 'all' ? 'bg-amber-200 text-amber-950 border border-amber-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả dạng
          </button>

          {difficulty === 'basic' ? (
            <>
              <button
                type="button"
                onClick={() => handleCategoryChange('cho-con-lai')}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  category === 'cho-con-lai' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-amber-100'
                }`}
                title="Bé có 20 viên kẹo, cho bạn 5 viên, hỏi còn lại bao nhiêu viên"
              >
                <span>🍬 Cho đi & Còn lại (-)</span>
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('so-sanh-hon')}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  category === 'so-sanh-hon' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-amber-100'
                }`}
                title="Thước dài 30 cm, bút dài 20 cm, hỏi thước dài hơn bút bao nhiêu cm"
              >
                <span>📏 So sánh dài hơn / nhiều hơn (-)</span>
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('them-tat-ca')}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  category === 'them-tat-ca' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-amber-100'
                }`}
              >
                <span>➕ Thêm vào & Có tất cả (+)</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleCategoryChange('nhieu-hon')}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                  category === 'nhieu-hon' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-indigo-50'
                }`}
              >
                Bài toán về nhiều hơn (+)
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('it-hon')}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                  category === 'it-hon' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-indigo-50'
                }`}
              >
                Bài toán về ít hơn (-)
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Word Problem Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Story, Diagram & Solution */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-amber-200/80 shadow-xs space-y-5">
          <div className="border-b border-amber-100 pb-3 flex items-center justify-between">
            <div>
              <span className={`text-[11px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wide ${
                difficulty === 'basic'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-indigo-100 text-indigo-900 border-indigo-300'
              }`}>
                {question.typeTitle}
              </span>
              <h2 className="text-lg font-bold text-slate-800 mt-1">
                Đề bài toán có lời văn lớp 2
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowDiagram(!showDiagram)}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showDiagram ? 'Ẩn sơ đồ' : 'Xem sơ đồ đoạn thẳng'}</span>
            </button>
          </div>

          {/* ĐỀ BÀI (Câu từ đời thường, gần gũi với bé lớp 2) */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-amber-50/70 rounded-2xl border border-amber-200 shadow-xs space-y-2">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">
                {question.type === 'cho-con-lai' ? '🍬' : question.type === 'so-sanh-hon' ? '📏' : '📖'}
              </span>
              <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                {question.storyText}{' '}
                <span className="text-indigo-800 underline font-black">{question.questionText}</span>
              </div>
            </div>
          </div>

          {/* SƠ ĐỒ ĐOẠN THẲNG TRỰC QUAN CHUẨN SGK */}
          {showDiagram && (
            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="text-xs font-bold text-slate-600 flex items-center justify-between">
                <span>Tóm tắt bằng sơ đồ đoạn thẳng:</span>
                <span className="text-[11px] text-slate-400 font-normal">Nhìn đoạn thẳng để tìm phép tính</span>
              </div>

              {/* DẠNG 1: CHO ĐI & CÒN LẠI (vd: Có 20 kẹo, cho 5 kẹo, còn ? kẹo) */}
              {question.type === 'cho-con-lai' && (
                <div className="space-y-2 text-xs sm:text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-700 text-right shrink-0">Ban đầu có:</span>
                    <div className="h-7 bg-amber-400 text-amber-950 flex items-center justify-center px-3 rounded-md shadow-xs min-w-[200px]">
                      {question.num1} {question.unitName}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-700 text-right shrink-0">Đã cho & Còn lại:</span>
                    <div className="flex items-center gap-1 min-w-[200px]">
                      <div className="h-7 bg-rose-400 text-white flex items-center justify-center px-2 rounded-l-md text-xs min-w-[70px]">
                        Cho: {question.num2}
                      </div>
                      <div className="h-7 bg-emerald-500 text-white flex items-center justify-center px-3 rounded-r-md text-xs font-black min-w-[120px] animate-pulse-glow">
                        Còn lại: ? {question.unitName}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DẠNG 2: SO SÁNH DÀI HƠN / NHIỀU HƠN (vd: Thước dài 30cm, bút dài 20cm, thước dài hơn ? cm) */}
              {question.type === 'so-sanh-hon' && (
                <div className="space-y-2 text-xs sm:text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-28 text-slate-700 text-right shrink-0 truncate">{question.item1Name}:</span>
                    <div className="flex items-center gap-1">
                      <div className="h-7 bg-blue-500 text-white flex items-center justify-center px-3 rounded-md shadow-xs min-w-[170px]">
                        {question.num1} {question.unitName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-28 text-slate-700 text-right shrink-0 truncate">{question.item2Name}:</span>
                    <div className="flex items-center gap-1">
                      <div className="h-7 bg-blue-300 text-slate-900 flex items-center justify-center px-2 rounded-l-md min-w-[110px]">
                        {question.num2} {question.unitName}
                      </div>
                      <div className="h-7 bg-emerald-500 text-white flex items-center justify-center px-2 rounded-r-md border border-l-0 text-xs font-black min-w-[60px] animate-pulse-glow">
                        Dài hơn: ? {question.unitName}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DẠNG 3: THÊM VÀO & CÓ TẤT CẢ */}
              {question.type === 'them-tat-ca' && (
                <div className="space-y-2 text-xs sm:text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-700 text-right shrink-0">Có tất cả:</span>
                    <div className="flex items-center gap-1 min-w-[200px]">
                      <div className="h-7 bg-amber-400 text-amber-950 flex items-center justify-center px-3 rounded-l-md min-w-[90px]">
                        Ban đầu: {question.num1}
                      </div>
                      <div className="h-7 bg-blue-400 text-blue-950 flex items-center justify-center px-3 rounded-r-md min-w-[70px]">
                        Thêm: {question.num2}
                      </div>
                      <span className="text-emerald-700 font-black ml-2">➔ ? {question.unitName}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* DẠNG 4 & 5: NHIỀU HƠN / ÍT HƠN (NÂNG CAO) */}
              {(question.type === 'nhieu-hon' || question.type === 'it-hon') && (
                <div className="space-y-2 text-xs sm:text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-700 text-right shrink-0 truncate">{question.item1Name}:</span>
                    <div className="h-7 bg-blue-500 text-white flex items-center justify-center px-3 rounded-md shadow-xs min-w-[130px]">
                      {question.num1} {question.unitName}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-700 text-right shrink-0 truncate">{question.item2Name}:</span>
                    <div className="flex items-center gap-1">
                      <div className={`h-7 ${question.type === 'nhieu-hon' ? 'bg-blue-300 text-slate-900' : 'bg-emerald-500 text-white'} flex items-center justify-center px-2 rounded-l-md min-w-[90px]`}>
                        {question.type === 'nhieu-hon' ? `${question.num1}` : '?'}
                      </div>
                      <div className="h-7 bg-emerald-500 text-white flex items-center justify-center px-2 rounded-r-md border border-l-0 text-xs min-w-[50px]">
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

          {/* KHUNG BÀI GIẢI MẪU 3 BƯỚC CHUẨN TIỂU HỌC */}
          <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-amber-300 space-y-4">
            <div className="text-center font-bold text-amber-900 uppercase tracking-wide text-xs">
              Bài Giải
            </div>

            {/* Lời giải */}
            <div className="text-sm font-semibold text-slate-800 pl-2 border-l-4 border-amber-400">
              {question.solutionTitle}
            </div>

            {/* Phép tính: Bé chọn dấu + hoặc - và nhập kết quả */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2 bg-amber-50/60 rounded-xl p-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {question.num1}
              </span>

              {/* Nút chọn phép tính (+ hoặc -) */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setChosenOp('+');
                    setStatus('idle');
                  }}
                  className={`w-10 h-10 rounded-xl font-black text-xl transition-all cursor-pointer border ${
                    chosenOp === '+'
                      ? 'bg-amber-500 text-white border-amber-600 scale-105 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-100'
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
                  className={`w-10 h-10 rounded-xl font-black text-xl transition-all cursor-pointer border ${
                    chosenOp === '-'
                      ? 'bg-amber-500 text-white border-amber-600 scale-105 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-100'
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
              <div
                className={`min-w-[80px] h-12 rounded-xl border-2 flex items-center justify-center text-2xl font-black transition-all px-2 ${
                  status === 'correct'
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                    : status === 'wrong'
                    ? 'bg-rose-50 border-rose-400 text-rose-800'
                    : userResultInput
                    ? 'bg-white border-amber-500 text-slate-900 shadow-sm'
                    : 'bg-white border-dashed border-amber-300 text-slate-300 animate-pulse'
                }`}
              >
                {userResultInput || '?'}
              </div>

              <span className="text-xs sm:text-sm font-bold text-slate-600">
                ({question.unitName})
              </span>
            </div>

            {/* Đáp số */}
            <div className="text-right text-xs sm:text-sm font-bold text-slate-700 pr-2">
              Đáp số: <span className="text-emerald-700 underline font-black">{userResultInput || '.....'}</span> {question.unitName}
            </div>
          </div>

          {/* Feedback & Actions */}
          <div className="space-y-3">
            {status === 'correct' && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-2 animate-pop">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm sm:text-base">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <span>Bé giải đúng bài toán rồi! Thật tuyệt vời! +1 ★</span>
                </div>
                <button
                  type="button"
                  onClick={() => nextQuestion()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95 whitespace-nowrap"
                >
                  <span>Bài tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {status === 'wrong' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-700 text-sm font-medium">
                <span>Chưa đúng rồi! Bé hãy đọc kỹ đề xem làm phép cộng hay trừ nhé!</span>
                <button
                  type="button"
                  onClick={() => {
                    setUserResultInput('');
                    setChosenOp(null);
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
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 cursor-pointer"
              >
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>{showHint ? 'Ẩn mẹo giải toán' : 'Mẹo giải toán đố?'}</span>
              </button>

              <button
                type="button"
                onClick={() => nextQuestion()}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đổi bài toán khác</span>
              </button>
            </div>

            {showHint && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs sm:text-sm text-amber-900 leading-relaxed">
                💡 <strong>Gợi ý cách làm:</strong> {question.hint}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: NumberPad */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
            <div className="text-center mb-3">
              <span className="text-xs text-slate-500 font-semibold">Kết quả bé nhập:</span>
              <div className="text-3xl font-black text-amber-900 h-10 flex items-center justify-center">
                {userResultInput || <span className="text-slate-300 font-normal text-2xl">Bấm số...</span>}
              </div>
            </div>

            <NumberPad
              onNumberClick={(d) => {
                if (userResultInput.length < 3) {
                  setUserResultInput((p) => p + d);
                  setStatus('idle');
                }
              }}
              onDelete={() => {
                setUserResultInput((p) => p.slice(0, -1));
                setStatus('idle');
              }}
              onClear={() => {
                setUserResultInput('');
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
