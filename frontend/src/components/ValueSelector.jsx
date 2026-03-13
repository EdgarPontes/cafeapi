import { useState } from 'react';

export default function ValueSelector({ onSelect, onCancel }) {
  const [history, setHistory] = useState([]);

  const total = history.reduce((sum, val) => sum + val, 0);

  const addValue = (val) => {
    setHistory([...history, val]);
  };

  const undo = () => {
    setHistory(history.slice(0, -1));
  };

  const clear = () => {
    setHistory([]);
  };

  return (
    <div className="glass-card p-8 text-center max-w-sm mx-auto flex flex-col gap-6 shadow-2xl border-white/5 bg-[#1a1a1a]">
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold text-white mb-6">Adicionar Créditos</h2>
        <div className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wider">Total</div>
        <div className="text-5xl font-black text-[#D2B48C] drop-shadow-lg">
          R$ {total.toFixed(2)}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => addValue(0.25)}
          className="flex-1 min-w-[140px] bg-[#8C5E3C] hover:bg-[#7A5134] text-white py-7 rounded-2xl text-2xl font-black shadow-md transition-all active:scale-95 border border-white/5"
        >
          R$ 0.25
        </button>
        <button
          onClick={() => addValue(0.50)}
          className="flex-1 min-w-[140px] bg-[#8C5E3C] hover:bg-[#7A5134] text-white py-7 rounded-2xl text-2xl font-black shadow-md transition-all active:scale-95 border border-white/5"
        >
          R$ 0.50
        </button>
        <button
          onClick={() => addValue(1.00)}
          className="flex-1 min-w-[140px] bg-[#8C5E3C] hover:bg-[#7A5134] text-white py-7 rounded-2xl text-2xl font-black shadow-md transition-all active:scale-95 border border-white/5"
        >
          R$ 1.00
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={clear}
          className="bg-[#8B1A1A] hover:bg-[#751616] text-white py-4 rounded-full font-bold shadow-md transition-all active:scale-95"
        >
          Limpar
        </button>
        <button
          onClick={undo}
          className="bg-[#3D444D] hover:bg-[#343a41] text-white py-4 rounded-full font-bold shadow-md transition-all active:scale-95"
        >
          Desfazer
        </button>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <button
          onClick={() => onSelect(total)}
          disabled={total <= 0}
          className="bg-[#CBA363] hover:bg-[#B38D4F] disabled:opacity-40 disabled:cursor-not-allowed text-white py-5 rounded-full text-xl font-bold shadow-xl transition-all active:scale-[0.98] border border-white/10"
        >
          Confirmar
        </button>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-white font-medium transition-colors py-2"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
