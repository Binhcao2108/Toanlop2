import React from 'react';
import { X, Award, Star, CheckCircle, Lock } from 'lucide-react';
import { Badge } from '../types/math';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  stars: number;
  badges: Badge[];
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  stars,
  badges,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-pop">
      <div className="bg-white rounded-3xl border border-amber-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-200" />
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl">
                Tủ Huy Hiệu Của Bé
              </h3>
              <p className="text-xs text-amber-100">
                Tích lũy sao vàng từ các bài tập để mở khóa huy hiệu vinh dự!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Stars Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between">
          <span className="text-xs font-bold text-amber-900 uppercase">
            Sao vàng hiện có
          </span>
          <div className="flex items-center gap-1.5 text-amber-700 font-black text-xl">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            <span>{stars} ★</span>
          </div>
        </div>

        {/* Badges List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {badges.map((b) => {
            const isUnlocked = stars >= b.requiredStars;
            const progress = Math.min(100, Math.round((stars / b.requiredStars) * 100));

            return (
              <div
                key={b.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center gap-4 ${
                  isUnlocked
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50/40 border-amber-300 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-70'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border ${
                    isUnlocked
                      ? 'bg-amber-400 border-amber-500 scale-105'
                      : 'bg-slate-200 border-slate-300 grayscale'
                  }`}
                >
                  {b.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-800">
                      {b.title}
                    </h4>
                    {isUnlocked ? (
                      <span className="flex items-center gap-1 text-emerald-700 text-xs font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Đã mở
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                        <Lock className="w-3.5 h-3.5" />
                        Cần {b.requiredStars} ★
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {b.desc}
                  </p>

                  {!isUnlocked && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${progress}%` }}
                          className="h-full bg-amber-500 rounded-full"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{stars}/{b.requiredStars}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-xl cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
