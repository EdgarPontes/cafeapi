import { useState, useEffect } from 'react';

export default function Ranking({ large = false, period = 'hoje' }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/ranking/${period}`);
        if (resp.ok) {
          setData(await resp.json());
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchRanking();
    const interval = setInterval(fetchRanking, 30000); // 30s update
    return () => clearInterval(interval);
  }, [period]);

  return (
    <div className={`w-full ${large ? 'max-w-4xl' : 'max-w-md'}`}>
      <div className="flex flex-col gap-4">
        {data.length === 0 && <p className="text-gray-500 text-center">Nenhum registro ainda...</p>}
        {data.map((item, index) => (
          <div 
            key={index} 
            className={`flex items-center gap-4 glass-card p-4 transition-all hover:bg-white/5 ${
              index < 3 ? 'border-l-4 border-accent' : ''
            }`}
          >
            <div className={`flex items-center justify-center rounded-full font-black ${
              large ? 'w-16 h-16 text-3xl' : 'w-10 h-10 text-xl'
            } ${
              index === 0 ? 'bg-yellow-500 text-black' : 
              index === 1 ? 'bg-gray-300 text-black' : 
              index === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-white'
            }`}>
              {index + 1}
            </div>
            <div className="flex-1">
              <div className={`font-bold ${large ? 'text-3xl' : 'text-lg'}`}>
                {item.NOME}
              </div>
            </div>
            <div className={`font-black text-accent ${large ? 'text-2xl' : 'text-lg'}`}>
              R$ {item.TOTAL.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
