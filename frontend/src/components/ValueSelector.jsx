import { useState } from 'react';

export default function ValueSelector({ onSelect, onCancel }) {
  const values = [0.25, 0.50, 1.00, 1.25, 1.50, 2.00];
  const [customValue, setCustomValue] = useState("");

  const parseValue = (str) => {
    let clean = str.replace(/[^0-9.,]/g, '');
    if (!clean) return 0;

    if (clean.includes(',') || clean.includes('.')) {
      return parseFloat(clean.replace(',', '.'));
    }

    if (clean.length >= 3) {
      return parseFloat(clean.slice(0, -2) + '.' + clean.slice(-2));
    } else {
      return parseFloat(clean);
    }
  };

  const handleBlur = () => {
    if (!customValue) return;
    const val = parseValue(customValue);
    if (val > 0) {
      setCustomValue(val.toFixed(2));
    } else {
      setCustomValue("");
    }
  };

  const handleCustomConfirm = () => {
    const val = parseValue(customValue);
    if (val > 0) {
      onSelect(val);
    }
  };

  return (
    <div className="glass-card p-8 text-center max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Selecione o Valor</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {values.map(val => (
          <button
            key={val}
            onClick={() => onSelect(val)}
            className="btn-premium p-6 rounded-2xl text-2xl font-black"
          >
            R$ {val.toFixed(2)}
          </button>
        ))}
      </div>

      <div className="mb-8 flex flex-col items-center justify-center gap-3">
        <div className="text-sm text-gray-300 font-medium">Ou digite outro valor:</div>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCustomConfirm();
            }}
            className="p-3 rounded-xl bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-blue-500 w-32 text-center text-xl font-bold"
          />
          <button
            onClick={handleCustomConfirm}
            disabled={!customValue || parseValue(customValue) <= 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-xl font-bold transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>

      <button
        onClick={onCancel}
        className="text-gray-400 hover:text-white underline"
      >
        Cancelar
      </button>
    </div>
  );
}
