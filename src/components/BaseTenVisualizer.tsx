import React from 'react';

interface BaseTenVisualizerProps {
  tens: number;
  units: number;
  label?: string;
  color?: 'amber' | 'blue' | 'emerald' | 'purple';
  highlightExtraUnit?: number;
  showRegroupAnimation?: boolean;
}

export const BaseTenVisualizer: React.FC<BaseTenVisualizerProps> = ({
  tens,
  units,
  label,
  color = 'amber',
}) => {
  const colorMap = {
    amber: {
      bundle: 'bg-amber-100 border-amber-300 text-amber-900',
      band: 'bg-rose-500',
      unit: 'bg-amber-400 border-amber-500 text-amber-950',
    },
    blue: {
      bundle: 'bg-blue-100 border-blue-300 text-blue-900',
      band: 'bg-indigo-500',
      unit: 'bg-blue-400 border-blue-500 text-blue-950',
    },
    emerald: {
      bundle: 'bg-emerald-100 border-emerald-300 text-emerald-900',
      band: 'bg-teal-600',
      unit: 'bg-emerald-400 border-emerald-500 text-emerald-950',
    },
    purple: {
      bundle: 'bg-purple-100 border-purple-300 text-purple-900',
      band: 'bg-pink-500',
      unit: 'bg-purple-400 border-purple-500 text-purple-950',
    },
  }[color];

  return (
    <div className="bg-white/80 p-3 rounded-xl border border-slate-200/80 shadow-xs">
      {label && (
        <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-slate-500 font-normal">
            ({tens} chục + {units} đơn vị = <span className="font-bold text-slate-900">{tens * 10 + units}</span>)
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {/* Tens Bundles (Bó chục que tính) */}
        <div>
          <div className="text-[11px] font-semibold text-slate-500 mb-1">
            Hàng chục ({tens} bó)
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[44px] items-center">
            {tens === 0 ? (
              <span className="text-xs text-slate-400 italic">0 bó</span>
            ) : (
              Array.from({ length: tens }).map((_, i) => (
                <div
                  key={i}
                  className={`relative flex items-center justify-center px-1.5 py-1 rounded-md border ${colorMap.bundle} shadow-xs`}
                  title="1 bó chục (10 que tính)"
                >
                  {/* Visual representation of 10 bundle of sticks */}
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 6 }).map((_, s) => (
                      <div
                        key={s}
                        className="w-1 h-8 rounded-full bg-amber-600/70"
                      />
                    ))}
                  </div>
                  {/* Tie ribbon */}
                  <div className={`absolute inset-x-0 h-2 top-3 ${colorMap.band} opacity-90 rounded-xs flex items-center justify-center`}>
                    <span className="text-[8px] font-black text-white leading-none">10</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Single Units (Que tính lẻ / Đơn vị) */}
        <div className="border-l border-slate-200 pl-4 sm:pl-6">
          <div className="text-[11px] font-semibold text-slate-500 mb-1">
            Đơn vị ({units} que lẻ)
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[44px] items-center max-w-xs">
            {units === 0 ? (
              <span className="text-xs text-slate-400 italic">0 que</span>
            ) : (
              Array.from({ length: units }).map((_, i) => (
                <div
                  key={i}
                  className="w-2.5 h-8 bg-amber-400 border border-amber-500 rounded-sm shadow-xs flex items-center justify-center"
                  title="1 que tính lẻ"
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
