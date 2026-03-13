import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Kiosk from './pages/Kiosk';
import Dashboard from './pages/Dashboard';
import TVRanking from './pages/TVRanking';
import RelatorioConsumo from './pages/RelatorioConsumo';

function App() {
  return (
    <BrowserRouter>
      {/* Navigation bar - hidden on /tv */}
      <Routes>
        <Route path="/tv" element={<TVRanking />} />
        <Route
          path="*"
          element={
            <div className="flex flex-col min-h-screen">
              {/*<nav className="flex gap-6 items-center px-8 py-4 bg-black/60 backdrop-blur border-b border-white/10">
                <span className="text-accent font-black text-xl">☕ CAFÉ</span>
                <Link to="/" className="text-gray-300 hover:text-accent font-bold transition-colors">Kiosk</Link>
                <Link to="/dashboard" className="text-gray-300 hover:text-accent font-bold transition-colors">Dashboard</Link>
                <Link to="/tv" className="text-gray-300 hover:text-accent font-bold transition-colors">Modo TV</Link>
              </nav>*/}
              <main className="flex-1 flex items-center justify-center">
                <Routes>
                  <Route path="/" element={<Kiosk />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/relatorio" element={<RelatorioConsumo />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
