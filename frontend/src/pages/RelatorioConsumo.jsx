import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale/pt-BR';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('pt-BR', ptBR);

export default function RelatorioConsumo() {
  const navigate = useNavigate();
  const [data, setData] = useState({ records: [], totals: [], total_funcionarios: 0, total_visitantes: 0 });
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isBaixando, setIsBaixando] = useState(false);
  const [reportType, setReportType] = useState('detalhado'); // 'detalhado' or 'resumido'

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
              <span className="block text-sm font-bold text-gray-400 mt-1 print:hidden">
                Período: {new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR')} até {new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR')}
              </span>
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
                  className={`py-3 rounded-xl border font-bold transition-all uppercase text-xs tracking-widest ${
                    reportType === 'detalhado' 
                      ? 'bg-accent text-black border-accent' 
                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  Detalhado
                </button>
                <button
                  onClick={() => setReportType('resumido')}
                  className={`py-3 rounded-xl border font-bold transition-all uppercase text-xs tracking-widest ${
                    reportType === 'resumido' 
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

      <style dangerouslySetInnerHTML={{
        __html: `
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
