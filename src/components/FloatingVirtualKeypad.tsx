import React, { useMemo } from 'react';
import { X, Delete, Check, RotateCcw, Keyboard } from 'lucide-react';
import { useVirtualKeypad } from '../context/VirtualKeypadContext';
import { sound } from '../utils/audio';

export const FloatingVirtualKeypad: React.FC = () => {
  const { virtualKeypadEnabled, activeKeypad, closeKeypad } = useVirtualKeypad();

  // Ultra-compact size for mobile phone screens (fits smoothly on 360px+ screens)
  const padWidth = 220;
  const padHeight = 220;

  const { posStyle, arrowStyle, isAbove } = useMemo(() => {
    if (!activeKeypad || !activeKeypad.anchorRect) {
      return {
        posStyle: {
          position: 'fixed' as const,
          bottom: '16px',
          right: '16px',
          zIndex: 60,
        },
        arrowStyle: { display: 'none' },
        isAbove: false,
      };
    }

    const rect = activeKeypad.anchorRect;
    const centerX = rect.left + rect.width / 2;

    // Center horizontally with the target cell, clamped strictly inside viewport
    let left = centerX - padWidth / 2;
    left = Math.max(8, Math.min(window.innerWidth - padWidth - 8, left));

    const rectBottom = rect.top + rect.height;
    const spaceBelow = window.innerHeight - rectBottom;
    let top = rectBottom + 6;
    let placedAbove = false;

    // If not enough room below, place right above the cell
    if (spaceBelow < padHeight + 10 && rect.top >= padHeight + 10) {
      top = rect.top - padHeight - 6;
      placedAbove = true;
    } else if (spaceBelow < padHeight + 10) {
      // Clamp within viewport if tight screen
      top = Math.max(8, window.innerHeight - padHeight - 8);
    }

    // Pointer arrow position pointing directly to target center
    const arrowX = Math.max(12, Math.min(padWidth - 20, centerX - left));

    return {
      posStyle: {
        position: 'fixed' as const,
        top: `${Math.round(top)}px`,
        left: `${Math.round(left)}px`,
        zIndex: 60,
      },
      arrowStyle: {
        left: `${Math.round(arrowX)}px`,
      },
      isAbove: placedAbove,
    };
  }, [activeKeypad]);

  if (!virtualKeypadEnabled || !activeKeypad || !activeKeypad.isOpen) {
    return null;
  }

  const handleDigit = (d: string) => {
    sound.playClick();
    activeKeypad.onDigit(d);
  };

  const handleDelete = () => {
    sound.playClick();
    activeKeypad.onDelete();
  };

  const handleClear = () => {
    sound.playClick();
    activeKeypad.onClear();
  };

  const handleSubmit = () => {
    sound.playClick();
    if (activeKeypad.onSubmit) {
      activeKeypad.onSubmit();
    }
    closeKeypad();
  };

  return (
    <>
      {/* Fullscreen touch backdrop: Nhấn ra ngoài thì lập tức đóng */}
      <div
        className="fixed inset-0 z-50 bg-black/15 backdrop-blur-[0.5px] cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          closeKeypad();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          closeKeypad();
        }}
        aria-hidden="true"
      />

      {/* Popover Keypad đặt ngay sát cạnh ô dấu ? */}
      <div
        style={posStyle}
        className="animate-pop z-60 pointer-events-auto select-none"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="relative w-[220px] bg-white rounded-2xl border-2 border-amber-400 shadow-2xl p-2.5 space-y-1.5">
          {/* Pointer triangle arrow */}
          <div
            style={arrowStyle}
            className={`absolute w-3.5 h-3.5 bg-white border-amber-400 transform rotate-45 -translate-x-1/2 ${
              isAbove
                ? '-bottom-2 border-r-2 border-b-2'
                : '-top-2 border-l-2 border-t-2'
            }`}
          />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-amber-100 pb-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900">
              <Keyboard className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate max-w-[145px]">{activeKeypad.title || 'Bàn phím ảo'}</span>
            </div>
            <button
              type="button"
              onClick={closeKeypad}
              className="w-5 h-5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              title="Đóng phím ảo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Current Value Display */}
          <div className="bg-amber-50/90 rounded-lg px-2 py-0.5 border border-amber-200/80 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500">Số đã bấm:</span>
            <span className="text-lg font-black text-amber-950 font-mono tracking-wider h-5 flex items-center">
              {activeKeypad.value || <span className="text-slate-300 text-xs font-normal">?</span>}
            </span>
          </div>

          {/* 3x3 Digits Grid + Bottom Row */}
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigit(String(num))}
                className="h-8.5 rounded-lg bg-slate-50 hover:bg-amber-100 active:bg-amber-200 border border-slate-200 text-slate-800 text-base font-black shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClear}
              className="h-8.5 rounded-lg bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 text-rose-700 font-bold text-[10px] transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              title="Xóa hết"
            >
              <RotateCcw className="w-3 h-3 mr-0.5" />
              <span>Xóa</span>
            </button>

            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="h-8.5 rounded-lg bg-slate-50 hover:bg-amber-100 active:bg-amber-200 border border-slate-200 text-slate-800 text-base font-black shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="h-8.5 rounded-lg bg-amber-50 hover:bg-amber-100 active:bg-amber-200 border border-amber-200 text-amber-800 font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              title="Xóa 1 số"
            >
              <Delete className="w-4 h-4 text-amber-700" />
            </button>
          </div>

          {/* Done Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-transform"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Xong (Chạm ngoài để đóng)</span>
          </button>
        </div>
      </div>
    </>
  );
};
