import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Kiosk from './pages/Kiosk';
import Dashboard from './pages/Dashboard';
import TVRanking from './pages/TVRanking';
import RelatorioConsumo from './pages/RelatorioConsumo';
import AccessDenied from './components/AccessDenied';

function App() {
  const [isForbidden, setIsForbidden] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const resp = await fetch(`${import.meta.env.VITE_API_URL || ''}/`);
        if (resp.status === 403) {
          setIsForbidden(true);
        } else {
          setIsForbidden(false);
        }
      } catch (err) {
        // Se houver erro de rede, assume que não está bloqueado (ou deixa carregar para ver erros locais)
        setIsForbidden(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isForbidden) {
    return <AccessDenied />;
  }

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
                  <Route path="/relatorio" element={<Kiosk />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/" element={<RelatorioConsumo />} />
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
