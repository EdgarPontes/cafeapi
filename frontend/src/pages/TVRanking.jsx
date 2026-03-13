import Ranking from '../components/Ranking';

export default function TVRanking() {
  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-10 md:p-20 flex flex-col items-center">
      <h1 className="text-4xl md:text-7xl font-black mb-8 md:mb-16 text-center tracking-tighter text-accent animate-pulse">
        ☕ RANKING DO CAFÉ
      </h1>
      
      <div className="w-full flex justify-center">
        <Ranking large period="hoje" />
      </div>

      <footer className="mt-20 text-gray-600 font-mono">
        ATUALIZADO EM TEMPO REAL • SISTEMA CAFÉ ENTERPRISE
      </footer>
    </div>
  );
}
