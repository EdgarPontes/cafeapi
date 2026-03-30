import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale/pt-BR';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('pt-BR', ptBR);

const SESSION_KEY = 'relatorio_auth';

function LoginModal({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/relatorios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        sessionStorage.setItem(SESSION_KEY, '1');
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.detail || 'Usuário ou senha incorretos.');
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError('Erro ao conectar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div
        className={`bg-[#111] border border-white/10 rounded-3xl p-10 w-full max-w-sm shadow-2xl transition-transform ${shaking ? 'animate-shake' : ''
          }`}
      >
        <div className="text-center mb-8">
          <span className="text-5xl">☕</span>
          <h1 className="text-2xl font-black text-accent uppercase tracking-tighter mt-3">
            Relatórios
          </h1>
          <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-bold">Acesso restrito</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Usuário</label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-accent outline-none transition-colors text-sm"
              placeholder="Digite o usuário"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Senha</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-accent outline-none transition-colors text-sm"
              placeholder="Digite a senha"
            />
          </div>
          {error && (
            <p className="text-red-400 text-xs font-bold text-center uppercase tracking-wide">{error}</p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full py-4 bg-accent text-black font-black rounded-xl hover:bg-accent/80 active:scale-[0.98] transition-all uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.4s ease; }
      `}</style>
    </div>
  );
}

export default function RelatorioConsumo() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === '1'
  );
  const [data, setData] = useState({ records: [], totals: [], total_funcionarios: 0, total_visitantes: 0 });
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isBaixando, setIsBaixando] = useState(false);
  const [reportType, setReportType] = useState('detalhado'); // 'detalhado' or 'resumido'
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoError, setPhotoError] = useState(false);

  // Set default dates for the current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [showBaixados, setShowBaixados] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      baixado: showBaixados
    });

    fetch(`${import.meta.env.VITE_API_URL || ''}/api/relatorios/consumos?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching report:", err);
        setLoading(false);
      });
  }, [startDate, endDate, showBaixados]);

  const fetchReport = () => {
    setLoading(true);
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      baixado: showBaixados
    });

    fetch(`${import.meta.env.VITE_API_URL || ''}/api/relatorios/consumos?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching report:", err);
        setLoading(false);
      });
  };

  const handleBaixar = async () => {
    setIsBaixando(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/relatorios/baixar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate
        })
      });

      if (response.ok) {
        setShowConfirmModal(false);
        window.print();
        fetchReport(); // Refresh to hide baixados if checkbox is off
      } else {
        alert("Erro ao realizar a baixa.");
      }
    } catch (error) {
      console.error("Error in handleBaixar:", error);
      alert("Erro na requisição de baixa.");
    } finally {
      setIsBaixando(false);
    }
  };

  const handlePrintOnly = () => {
    setShowConfirmModal(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (!isAuthenticated) {
    return <LoginModal onSuccess={() => setIsAuthenticated(true)} />;
  }

  if (loading && data.records.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-accent">
        <span className="text-2xl font-bold animate-pulse uppercase tracking-widest">Carregando Relatório...</span>
      </div>
    );
  }

  // Helper to format date in report title (MM/YYYY)
  const reportDate = new Date(startDate + 'T00:00:00');
  const monthYear = `${reportDate.getMonth() + 1}/${reportDate.getFullYear()}`;

  return (
    <div className="min-h-screen w-full p-4 sm:p-8 bg-black/95 text-white">
      <header className="flex flex-col mb-8 gap-6">
        <div className="flex justify-between items-start w-full">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-accent uppercase tracking-tighter">
              Relatório de Consumos
            </h1>
          </div>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-6 py-3 bg-accent text-black font-bold rounded-xl hover:bg-accent/80 transition-all uppercase tracking-widest text-sm print:hidden"
          >
            Imprimir Relatório
          </button>
        </div>

        {/* Filters Section */}
        <div className="flex flex-wrap items-end gap-6 bg-white/5 p-6 rounded-2xl border border-white/10 print:hidden">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">De</label>
            <DatePicker
              selected={new Date(startDate + 'T00:00:00')}
              onChange={(date) => setStartDate(date ? date.toISOString().split('T')[0] : '')}
              dateFormat="dd/MM/yyyy"
              locale="pt-BR"
              className="bg-black border border-white/20 rounded-lg px-4 py-2 text-white focus:border-accent outline-none transition-colors w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Até</label>
            <DatePicker
              selected={new Date(endDate + 'T00:00:00')}
              onChange={(date) => setEndDate(date ? date.toISOString().split('T')[0] : '')}
              dateFormat="dd/MM/yyyy"
              locale="pt-BR"
              className="bg-black border border-white/20 rounded-lg px-4 py-2 text-white focus:border-accent outline-none transition-colors w-full"
            />
          </div>
          <div className="flex items-center gap-3 h-[42px]">
            <input
              type="checkbox"
              id="baixado"
              checked={showBaixados}
              onChange={(e) => setShowBaixados(e.target.checked)}
              className="w-5 h-5 accent-accent cursor-pointer"
            />
            <label htmlFor="baixado" className="text-sm font-bold text-gray-200 cursor-pointer select-none">
              Mostrar Baixados?
            </label>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 print:block">
        {/* PRINT DETALHADO */}
        {reportType === 'detalhado' && (
          <div className="hidden print:block font-mono text-[9pt] leading-tight text-black">
            <div className="text-center mb-1">
              RELACAO DE CONSUMO DE CAFE DETALHADO - {monthYear}
            </div>
            <div className="border-t border-black border-dashed mb-1"></div>
            <div className="grid grid-cols-[80px_1fr_100px_100px_100px] gap-2 font-bold mb-1 uppercase">
              <div>CODIGO</div>
              <div>NOME</div>
              <div className="text-right">VALOR</div>
              <div className="text-center">DATA</div>
              <div className="text-center">HORA</div>
            </div>
            <div className="border-t border-black border-dashed mb-2"></div>
            {data.records.map((record, idx) => (
              <div key={idx} className="grid grid-cols-[80px_1fr_100px_100px_100px] gap-2 mb-1">
                <div>{record.codigo}</div>
                <div className="truncate uppercase">{record.nome}</div>
                <div className="text-right">{record.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                <div className="text-center">{new Date(record.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}</div>
                <div className="text-center">{record.hora}</div>
              </div>
            ))}
            <div className="mt-8">
              <div className="font-bold mb-1">TOTAL DE CONSUMO:</div>
              <div>Funcionarios: R$ {data.total_funcionarios?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div>Visitantes..: R$ {data.total_visitantes?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        )}

        {/* PRINT RESUMIDO */}
        {reportType === 'resumido' && (
          <div className="hidden print:block font-mono text-[9pt] leading-tight text-black">
            <div className="text-center mb-1">
              RELACAO DE CONSUMO DE CAFE RESUMIDO - {monthYear}
            </div>
            <div className="border-t border-black border-dashed mb-1"></div>
            <div className="grid grid-cols-[80px_1fr_100px] gap-2 font-bold mb-1 uppercase">
              <div>CODIGO</div>
              <div>NOME</div>
              <div className="text-right">VALOR</div>
            </div>
            <div className="border-t border-black border-dashed mb-2"></div>
            {data.totals.map((item, idx) => (
              <div key={idx} className="grid grid-cols-[80px_1fr_100px] gap-2 mb-1">
                <div>{item.codigo}</div>
                <div className="truncate uppercase">{item.nome}</div>
                <div className="text-right">{item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              </div>
            ))}
            <div className="mt-8">
              <div className="font-bold mb-1">TOTAL DE CONSUMO:</div>
              <div>Funcionarios: R$ {data.total_funcionarios?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div>Visitantes..: R$ {data.total_visitantes?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        )}

        {/* Detailed Records Section - screen only */}
        <section className="col-span-1 print:hidden">
          <div className="glass-card overflow-hidden">
            <div className="max-h-[750px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 text-gray-400 uppercase text-xs font-bold sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4">Código</th>
                    <th className="px-6 py-4">Usuário</th>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4 text-center">Hora</th>
                    <th className="px-6 py-4 text-center">Foto</th>
                    <th className="px-6 py-4 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.records.map((record, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                        {record.codigo}
                      </td>
                      <td className="px-6 py-4">
                        <span className="uppercase font-bold text-gray-200 group-hover:text-accent transition-colors">
                          {record.nome}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {new Date(record.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-400 text-sm">
                        {record.hora}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            const apiUrl = import.meta.env.VITE_API_URL || '';
                            const photoUrl = `${apiUrl}/api/fotos/arquivo/consumo_${record.id_consumo}_${record.codigo}.jpg`;
                            setPhotoError(false);
                            setSelectedPhoto(photoUrl);
                          }}
                          className="p-2 text-gray-400 hover:text-accent transition-colors rounded-lg hover:bg-white/10"
                          title="Ver Foto do Consumo"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                          </svg>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        R$ {record.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm print:hidden"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/10 shadow-2xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">
              Imprimir Relatório
            </h3>

            <div className="mb-6">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Tipo de Relatório</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setReportType('detalhado')}
                  className={`py-3 rounded-xl border font-bold transition-all uppercase text-xs tracking-widest ${reportType === 'detalhado'
                      ? 'bg-accent text-black border-accent'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                    }`}
                >
                  Detalhado
                </button>
                <button
                  onClick={() => setReportType('resumido')}
                  className={`py-3 rounded-xl border font-bold transition-all uppercase text-xs tracking-widest ${reportType === 'resumido'
                      ? 'bg-accent text-black border-accent'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                    }`}
                >
                  Resumido
                </button>
              </div>
            </div>

            <p className="text-gray-400 font-medium mb-8 leading-relaxed text-sm">
              Deseja fazer a baixa dos lançamentos impressos?
              <span className="block text-xs mt-2 text-accent/70 uppercase font-bold">* Isso gravará a data e hora da baixa nos registros.</span>
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleBaixar}
                disabled={isBaixando}
                className="w-full py-4 bg-accent text-black font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest disabled:opacity-50"
              >
                {isBaixando ? 'Processando...' : 'Sim, Fazer Baixa'}
              </button>
              <button
                onClick={handlePrintOnly}
                className="w-full py-4 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest"
              >
                Não, Apenas Imprimir
              </button>
            </div>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="w-full mt-4 text-xs text-gray-500 hover:text-gray-300 transition-colors uppercase font-bold tracking-widest"
            >
              Cancelar e Voltar
            </button>
          </div>
        </div>
      )}

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md transition-all animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-full lg:max-w-4xl max-h-screen rounded-2xl shadow-3xl overflow-hidden border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={selectedPhoto}
              alt="Foto do Consumo"
              className={`max-w-full max-h-[85vh] object-contain block ${photoError ? 'hidden' : 'visible'}`}
              onError={() => setPhotoError(true)}
            />
            {photoError && (
              <div className="p-16 text-center bg-[#111]">
                <span className="text-4xl mb-4 block">📸</span>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Foto não encontrada para este consumo</p>
                <button
                  className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
                  onClick={() => setSelectedPhoto(null)}
                >
                  Fechar
                </button>
              </div>
            )}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-all hover:scale-110 active:scale-90"
              title="Fechar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        /* Custom styles for react-datepicker to match theme */
        .react-datepicker {
          background-color: #0a0a0a !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          font-family: inherit !important;
          color: white !important;
        }
        .react-datepicker__header {
          background-color: #1a1a1a !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .react-datepicker__current-month, 
        .react-datepicker__day-name, 
        .react-datepicker-time__header {
          color: #eee !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        .react-datepicker__day {
          color: #ccc !important;
        }
        .react-datepicker__day:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
          color: white !important;
        }
        .react-datepicker__day--selected {
          background-color: var(--accent-color, #fbbf24) !important;
          color: black !important;
          font-weight: bold !important;
        }
        .react-datepicker__day--keyboard-selected {
          background-color: transparent !important;
          border: 1px solid var(--accent-color, #fbbf24) !important;
        }
        .react-datepicker__navigation-icon::before {
          border-color: #ccc !important;
        }

        @media print {
          html, body, #root, .min-h-screen, .bg-black\\/95 { 
            background: white !important; 
            color: black !important; 
            padding: 0 !important; 
            margin: 0 !important; 
            -webkit-print-color-adjust: exact; 
          }
          .min-h-screen { min-height: auto !important; width: 100% !important; }
          header, button, a, .print\\:hidden, .glass-card, section { display: none !important; }
          .print\\:block { display: block !important; background: white !important; }
          .text-accent, .text-gray-400, .text-gray-300, .text-black, .text-gray-100 { color: black !important; }
          h1 { display: none !important; }
          @page { margin: 1cm; }
        }
      `}} />
    </div>
  );
}
