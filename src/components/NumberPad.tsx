import React from 'react';
import { Delete, Check } from 'lucide-react';
import { sound } from '../utils/audio';

interface NumberPadProps {
  onNumberClick: (num: string) => void;
  onDelete: () => void;
  onSubmit?: () => void;
  onClear?: () => void;
  submitDisabled?: boolean;
}

export const NumberPad: React.FC<NumberPadProps> = ({
  onNumberClick,
  onDelete,
  onSubmit,
  onClear,
  submitDisabled = false,
}) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  const handleDigit = (digit: string) => {
    sound.playClick();
    onNumberClick(digit);
  };

  const handleDelete = () => {
    sound.playClick();
    onDelete();
  };

  const handleClear = () => {
    sound.playClick();
    if (onClear) onClear();
    else onDelete();
  };

  const handleSubmit = () => {
    if (!submitDisabled && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="bg-amber-100/70 p-3 sm:p-4 rounded-2xl border border-amber-200 shadow-sm max-w-sm mx-auto">
      <div className="text-center text-xs font-semibold text-amber-800 mb-2 uppercase tracking-wide">
        Bàn phím số cho bé
      </div>
      <div className="grid grid-cols-3 gap-2">
        {digits.slice(0, 9).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleDigit(d)}
            className="h-12 sm:h-14 bg-white hover:bg-amber-50 active:scale-95 text-slate-800 text-xl sm:text-2xl font-bold rounded-xl border border-amber-200/80 shadow-sm hover:shadow transition-all flex items-center justify-center cursor-pointer select-none"
          >
            {d}
          </button>
        ))}

        <button
          type="button"
          onClick={handleClear}
          title="Xóa hết"
          className="h-12 sm:h-14 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-600 text-sm font-bold rounded-xl border border-rose-200 shadow-sm transition-all flex items-center justify-center cursor-pointer select-none"
        >
          Xóa hết
        </button>

        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="h-12 sm:h-14 bg-white hover:bg-amber-50 active:scale-95 text-slate-800 text-xl sm:text-2xl font-bold rounded-xl border border-amber-200/80 shadow-sm hover:shadow transition-all flex items-center justify-center cursor-pointer select-none"
        >
          0
        </button>

        <button
          type="button"
          onClick={handleDelete}
          title="Xóa một số"
          className="h-12 sm:h-14 bg-amber-50 hover:bg-amber-200/60 active:scale-95 text-amber-900 rounded-xl border border-amber-300 shadow-sm transition-all flex items-center justify-center cursor-pointer select-none"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      {onSubmit && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitDisabled}
          className={`w-full mt-2 py-3 px-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer select-none shadow-sm ${
            submitDisabled
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-emerald-200 hover:shadow-md'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>Kiểm tra kết quả</span>
        </button>
      )}
    </div>
  );
};
