import { useState, useEffect } from 'react';

export default function RankingPodium() {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    async function fetchRanking() {
      try {
        const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/ranking/mes`);
        if (resp.ok) {
          const data = await resp.json();
          setRanking(data.slice(0, 3));
        }
      } catch (err) {
        console.error("Erro ao buscar ranking:", err);
      }
    }
    fetchRanking();
    
    // Atualiza o ranking a cada minuto
    const intervalId = setInterval(fetchRanking, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  if (ranking.length === 0) return null;

  const getFirstName = (fullName) => {
    if (!fullName) return "";
    return fullName.split(" ")[0];
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-8 flex flex-col items-center opacity-80 transition-opacity hover:opacity-100">
      <h2 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest">
        Top 3 Consumidores (Mês)
      </h2>
      <div className="flex items-end justify-center w-full px-4 gap-2 h-40">
        
        {/* 2o Lugar - Prata */}
        {ranking[1] ? (
          <div className="flex flex-col items-center flex-1">
            <div className="text-sm font-bold text-slate-300 mb-2 truncate w-24 text-center" title={ranking[1].NOME}>
              {getFirstName(ranking[1].NOME)}
            </div>
            <div className="w-full bg-gradient-to-t from-slate-600 to-slate-400 rounded-t-xl h-24 flex items-start justify-center pt-3 shadow-lg relative border-t-2 border-slate-300">
                <span className="text-2xl font-black text-slate-100 drop-shadow-md">2º</span>
            </div>
          </div>
        ) : (
          <div className="flex-1"></div>
        )}

        {/* 1o Lugar - Ouro */}
        {ranking[0] ? (
          <div className="flex flex-col items-center flex-1 z-10">
            <div className="text-base font-black text-amber-400 mb-2 truncate w-28 text-center drop-shadow-sm" title={ranking[0].NOME}>
              {getFirstName(ranking[0].NOME)}
            </div>
            <div className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-xl h-32 flex items-start justify-center pt-3 shadow-xl relative border-t-2 border-amber-300">
                <span className="text-3xl font-black text-amber-100 drop-shadow-md">1º</span>
            </div>
          </div>
        ) : (
          <div className="flex-1"></div>
        )}

        {/* 3o Lugar - Bronze */}
        {ranking[2] ? (
          <div className="flex flex-col items-center flex-1">
            <div className="text-sm font-bold text-orange-300 mb-2 truncate w-24 text-center" title={ranking[2].NOME}>
              {getFirstName(ranking[2].NOME)}
            </div>
            <div className="w-full bg-gradient-to-t from-orange-800 to-orange-600 rounded-t-xl h-20 flex items-start justify-center pt-3 shadow-lg relative border-t-2 border-orange-500">
                <span className="text-2xl font-black text-orange-200 drop-shadow-md">3º</span>
            </div>
          </div>
        ) : (
          <div className="flex-1"></div>
        )}
      </div>
    </div>
  );
}
