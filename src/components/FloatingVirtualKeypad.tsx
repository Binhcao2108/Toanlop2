import React, { useEffect, useRef } from 'react';
import { X, Delete, Check, RotateCcw, Keyboard } from 'lucide-react';
import { useVirtualKeypad } from '../context/VirtualKeypadContext';
import { sound } from '../utils/audio';

export const FloatingVirtualKeypad: React.FC = () => {
  const {
    virtualKeypadEnabled,
    activeKeypad,
    setKeypadHeight,
    updateKeypadValue,
    getKeypadValue,
    closeKeypad,
  } = useVirtualKeypad();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const isOpen = Boolean(virtualKeypadEnabled && activeKeypad && activeKeypad.isOpen);

  useEffect(() => {
    if (!isOpen) {
      setKeypadHeight(0);
      if (typeof document !== 'undefined') {
        document.body.style.paddingBottom = '';
      }
      return;
    }

    const updateHeight = () => {
      if (containerRef.current) {
        const h = Math.ceil(containerRef.current.getBoundingClientRect().height);
        setKeypadHeight(h);
        if (typeof document !== 'undefined') {
          document.body.style.paddingBottom = `${h + 16}px`;
        }
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
      if (typeof document !== 'undefined') {
        document.body.style.paddingBottom = '';
      }
    };
  }, [isOpen, setKeypadHeight]);

  if (!isOpen || !activeKeypad) {
    return null;
  }

  const handleDigit = (d: string) => {
    sound.playClick();
    const cur = getKeypadValue() || '';
    const max = activeKeypad.maxLength ?? 3;
    let next: string;
    if (cur.length < max) {
      next = cur + d;
    } else {
      if (max === 1) {
        next = d;
      } else {
        next = cur;
      }
    }

    updateKeypadValue(next);
    if (activeKeypad.onChange) {
      activeKeypad.onChange(next);
    }
    if (activeKeypad.onDigit) {
      activeKeypad.onDigit(d);
    }
  };

  const handleDelete = () => {
    sound.playClick();
    const cur = getKeypadValue() || '';
    const next = cur.slice(0, -1);
    updateKeypadValue(next);
    if (activeKeypad.onChange) {
      activeKeypad.onChange(next);
    }
    if (activeKeypad.onDelete) {
      activeKeypad.onDelete();
    }
  };

  const handleClear = () => {
    sound.playClick();
    const next = '';
    updateKeypadValue(next);
    if (activeKeypad.onChange) {
      activeKeypad.onChange(next);
    }
    if (activeKeypad.onClear) {
      activeKeypad.onClear();
    }
  };

  const handleSubmit = () => {
    sound.playClick();
    const latestVal = getKeypadValue();
    const submitFn = activeKeypad.onSubmit;
    closeKeypad();
    if (submitFn) {
      submitFn(latestVal);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      className="fixed bottom-0 left-0 right-0 z-50 w-full bg-white border-t-2 border-amber-400 shadow-[0_-8px_30px_rgba(0,0,0,0.14)] select-none"
    >
      <div className="max-w-lg mx-auto px-3 pt-2 pb-3 space-y-2">
        {/* Header Bar: Title, Current Value & Close (X) Button */}
        <div className="flex items-center justify-between gap-2 border-b border-amber-100 pb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <Keyboard className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="text-sm font-bold text-amber-950 truncate">
              {activeKeypad.title || 'Bàn phím số'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-amber-50 border border-amber-300 rounded-xl px-3 py-1 flex items-center gap-1.5">
              <span className="text-sm font-semibold text-slate-600">Số:</span>
              <span className="text-xl font-black text-amber-950 font-mono min-w-[28px] text-center">
                {activeKeypad.value || '?'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                closeKeypad();
              }}
              className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center cursor-pointer transition-all"
              title="Đóng bàn phím"
              aria-label="Đóng bàn phím"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Large Green "Xong" Button Immediately Above Keys */}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full min-h-[48px] py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-base sm:text-lg rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>Xong</span>
        </button>

        {/* 3-Column Number Keys Grid (min-height >= 52px, font >= 24px, gap >= 8px) */}
        <div className="grid grid-cols-3 gap-2.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(String(num))}
              className="min-h-[54px] rounded-xl bg-slate-50 hover:bg-amber-100 active:bg-amber-200 border-2 border-slate-200 text-slate-900 text-2xl font-black shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClear}
            className="min-h-[54px] rounded-xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border-2 border-rose-200 text-rose-700 font-extrabold text-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1 px-2"
            title="Xóa hết"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>Xóa hết</span>
          </button>

          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="min-h-[54px] rounded-xl bg-slate-50 hover:bg-amber-100 active:bg-amber-200 border-2 border-slate-200 text-slate-900 text-2xl font-black shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="min-h-[54px] rounded-xl bg-amber-50 hover:bg-amber-100 active:bg-amber-200 border-2 border-amber-300 text-amber-900 font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            title="Xóa lùi 1 số"
            aria-label="Xóa lùi 1 số"
          >
            <Delete className="w-6 h-6 text-amber-800" />
          </button>
        </div>
      </div>
    </div>
  );
};
