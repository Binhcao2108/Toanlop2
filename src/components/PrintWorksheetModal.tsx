import React, { useState } from 'react';
import { X, Printer, RefreshCw } from 'lucide-react';
import {
  generateTachSoCongQuaMuoiQuestion,
  generateCongTruQuestion,
  generateLienTruocSauQuestion,
  generateSoSanhQuestion,
} from '../utils/mathGenerators';
import { TachSoCongQuaMuoiQuestion, CongTruQuestion, LienTruocSauQuestion, SoSanhQuestion } from '../types/math';

interface PrintWorksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintWorksheetModal: React.FC<PrintWorksheetModalProps> = ({ isOpen, onClose }) => {
  const [splitAddList, setSplitAddList] = useState<TachSoCongQuaMuoiQuestion[]>(() =>
    Array.from({ length: 4 }, () => generateTachSoCongQuaMuoiQuestion({ maxNum: 9 }))
  );
  const [congTruList, setCongTruList] = useState<CongTruQuestion[]>(() => [
    generateCongTruQuestion('+'),
    generateCongTruQuestion('+'),
    generateCongTruQuestion('-'),
    generateCongTruQuestion('-'),
  ]);
  const [lienTruocSauList, setLienTruocSauList] = useState<LienTruocSauQuestion[]>(() =>
    Array.from({ length: 4 }, () => generateLienTruocSauQuestion())
  );
  const [soSanhList, setSoSanhList] = useState<SoSanhQuestion[]>(() => [
    generateSoSanhQuestion('two-numbers'),
    generateSoSanhQuestion('two-numbers'),
    generateSoSanhQuestion('sort-sequence'),
    generateSoSanhQuestion('sort-sequence'),
  ]);

  const handleRegenerate = () => {
    setSplitAddList(Array.from({ length: 4 }, () => generateTachSoCongQuaMuoiQuestion({ maxNum: 9 })));
    setCongTruList([
      generateCongTruQuestion('+'),
      generateCongTruQuestion('+'),
      generateCongTruQuestion('-'),
      generateCongTruQuestion('-'),
    ]);
    setLienTruocSauList(Array.from({ length: 4 }, () => generateLienTruocSauQuestion()));
    setSoSanhList([
      generateSoSanhQuestion('two-numbers'),
      generateSoSanhQuestion('two-numbers'),
      generateSoSanhQuestion('sort-sequence'),
      generateSoSanhQuestion('sort-sequence'),
    ]);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full my-auto overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Controls (Hidden in print) */}
        <div className="no-print bg-slate-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-base">Phiếu Bài Tập Toán Lớp 2 (Khổ A4)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRegenerate}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Đổi Đề Mới</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Ngay</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full hover:bg-slate-700 text-slate-300 ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-white text-slate-900 print:p-0 print:m-0 space-y-6">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide">
                PHIẾU ÔN TẬP TOÁN LỚP 2
              </h2>
              <p className="text-xs italic text-slate-600">
                (Tách số làm tròn 10 để cộng · Đặt tính có nhớ trong phạm vi 100 · Liền trước liền sau · So sánh số)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 text-xs sm:text-sm font-medium">
              <div>Họ và tên học sinh: ....................................................</div>
              <div>Lớp: 2.....  Trường: .............................................</div>
              <div>Ngày tháng: ...... / ...... / 202...</div>
              <div>Điểm số: ......... / 10  |  Lời phê: ............................</div>
            </div>
          </div>

          {/* BÀI 1: TÁCH SỐ ĐỂ CỘNG QUA 10 */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Bài 1 (2.5 điểm): Tách số để làm tròn chục rồi tính (Điền vào ô tách và kết quả):
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {splitAddList.map((sq, idx) => (
                <div
                  key={sq.id}
                  className="p-3 border border-slate-300 rounded-xl space-y-2 text-xs sm:text-sm"
                >
                  <div className="font-bold text-slate-700">
                    Câu 1.{idx + 1}: Tính {sq.num1} + {sq.num2} = ......
                  </div>
                  <div className="pl-2 border-l-2 border-slate-400 space-y-1">
                    <div>
                      • Tách <strong>{sq.num2}</strong> thành: [ ..... ] và [ ..... ]
                    </div>
                    <div>
                      • Bước 1: {sq.num1} + [ ..... ] = {sq.roundTen}
                    </div>
                    <div>
                      • Bước 2: {sq.roundTen} + [ ..... ] = [ ..... ]
                    </div>
                    <div className="font-bold text-slate-900 pt-0.5">
                      👉 Vậy: {sq.num1} + {sq.num2} = [ ..... ]
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BÀI 2: ĐẶT TÍNH RỒI TÍNH CỘNG TRỪ CÓ NHỚ */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Bài 2 (2.5 điểm): Đặt tính rồi tính:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
              {congTruList.map((ct, idx) => (
                <div key={ct.id} className="p-3 border border-slate-300 rounded-xl">
                  <div className="text-[11px] font-bold font-sans text-slate-600 mb-2">
                    Câu 2.{idx + 1} ({ct.operation === '+' ? 'Cộng có nhớ' : 'Trừ có nhớ'})
                  </div>
                  <div className="w-20 mx-auto text-xl font-bold leading-tight">
                    <div className="text-right pr-2">{ct.num1}</div>
                    <div className="text-right pr-2 relative">
                      <span className="absolute left-0">{ct.operation}</span>
                      {ct.num2}
                    </div>
                    <div className="w-full h-0.5 bg-slate-800 my-1" />
                    <div className="text-right pr-2 text-slate-400">......</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BÀI 3: SỐ LIỀN TRƯỚC VÀ LIỀN SAU */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Bài 3 (2.5 điểm): Viết số liền trước và số liền sau của mỗi số sau (từ 1 đến 150):
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              {lienTruocSauList.map((lts, idx) => (
                <div key={lts.id} className="p-2.5 border border-slate-300 rounded-lg flex items-center justify-between">
                  <span>Câu 3.{idx + 1}:</span>
                  <div className="flex items-center gap-2 font-mono font-bold">
                    <span className="px-2 py-1 border-b border-dashed border-slate-700">.........</span>
                    <span>;</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-300">
                      {lts.targetNumber}
                    </span>
                    <span>;</span>
                    <span className="px-2 py-1 border-b border-dashed border-slate-700">.........</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BÀI 4: SO SÁNH VÀ SẮP XẾP DÃY SỐ */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Bài 4 (2.5 điểm): So sánh và sắp xếp dãy số:
            </h3>
            <div className="space-y-2 text-xs sm:text-sm">
              {/* So sánh hai số */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-2.5 border border-slate-300 rounded-lg flex items-center justify-between">
                  <span>a) Điền dấu &gt;, &lt;, =:</span>
                  <span className="font-bold font-mono">
                    {soSanhList[0]?.exprA || soSanhList[0]?.numA} ( ... ) {soSanhList[0]?.exprB || soSanhList[0]?.numB}
                  </span>
                </div>
                <div className="p-2.5 border border-slate-300 rounded-lg flex items-center justify-between">
                  <span>b) Điền dấu &gt;, &lt;, =:</span>
                  <span className="font-bold font-mono">
                    {soSanhList[1]?.exprA || soSanhList[1]?.numA} ( ... ) {soSanhList[1]?.exprB || soSanhList[1]?.numB}
                  </span>
                </div>
              </div>

              {/* Sắp xếp */}
              {soSanhList[2]?.sequence && (
                <div className="p-2.5 border border-slate-300 rounded-lg space-y-1">
                  <div>
                    c) Sắp xếp các số sau theo thứ tự <strong>từ bé đến lớn</strong>:
                  </div>
                  <div className="font-bold font-mono text-slate-800">
                    {soSanhList[2].sequence.join(', ')}
                  </div>
                  <div className="pt-1 text-slate-500">
                    ➔ Đáp án: ...................................................................................................................
                  </div>
                </div>
              )}

              {soSanhList[3]?.sequence && (
                <div className="p-2.5 border border-slate-300 rounded-lg space-y-1">
                  <div>
                    d) Sắp xếp các số sau theo thứ tự <strong>từ lớn đến bé</strong>:
                  </div>
                  <div className="font-bold font-mono text-slate-800">
                    {soSanhList[3].sequence.join(', ')}
                  </div>
                  <div className="pt-1 text-slate-500">
                    ➔ Đáp án: ...................................................................................................................
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
