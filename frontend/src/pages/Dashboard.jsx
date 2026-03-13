import { useState, useEffect } from 'react';
import Ranking from '../components/Ranking';
import Charts from '../components/Charts';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [chartData, setChartData] = useState([]);
  const [period, setPeriod] = useState('mes');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/relatorios/mensal`)
      .then(res => res.json())
      .then(data => setChartData(data));
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-black/95">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12 gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <h1 className="text-3xl sm:text-4xl font-black text-accent text-center sm:text-left">DASHBOARD ANALÍTICO</h1>
          <Link to="/relatorio" className="px-4 py-2 bg-white/10 hover:bg-accent hover:text-black rounded-lg font-bold transition-all text-xs uppercase tracking-widest border border-white/10">
            📑 Ver Relatório Completo
          </Link>
        </div>
        <div className="flex flex-wrap justify-center sm:flex-nowrap gap-2 glass-card p-1">
          <button 
            onClick={() => setPeriod('hoje')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${period === 'hoje' ? 'bg-accent text-black' : 'hover:bg-white/5'}`}
          >
            HOJE
          </button>
          <button 
            onClick={() => setPeriod('semana')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${period === 'semana' ? 'bg-accent text-black' : 'hover:bg-white/5'}`}
          >
            SEMANA
          </button>
          <button 
            onClick={() => setPeriod('mes')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${period === 'mes' ? 'bg-accent text-black' : 'hover:bg-white/5'}`}
          >
            MÊS
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            🏆 Ranking Top 10
          </h2>
          <Ranking period={period} />
        </section>

        <section className="flex flex-col gap-8">
          <h2 className="text-2xl font-bold mb-2">📊 Analytics</h2>
          <Charts data={chartData} />
          <div className="glass-card p-8 flex flex-col justify-center items-center gap-2">
            <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Total do Mês</span>
            <span className="text-6xl font-black text-accent">
              R$ {chartData.reduce((acc, curr) => acc + curr.TOTAL, 0).toFixed(2)}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
