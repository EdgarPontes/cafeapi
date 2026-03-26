import { useState, useEffect } from 'react';

export default function SearchUser({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isVisitor, setIsVisitor] = useState(false);

  useEffect(() => {
    if (query.trim().length > 0) {
      // Direct fetch or small debounce can be added here
      fetch(`${import.meta.env.VITE_API_URL || ''}/api/funcionarios/`)
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter(u =>
            u.nome.toLowerCase().includes(query.toLowerCase()) ||
            u.codigo.toString().includes(query)
          );
          setResults(filtered);
        });
    } else {
      setResults([]);
    }
  }, [query]);

  const handleVisitorSelect = (selectedName) => {
    const nameToUse = selectedName || query;
    if (!nameToUse.trim()) return;

    // Remove acentos e converte para maiúsculo
    const normalizedNome = nameToUse.trim()
      .normalize('NFD') // Decompõe caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, ' ')
      .trim();
    
    const visitorUser = {
      codigo: '999999',
      nome: normalizedNome,
      visitante: true
    };
    onSelect(visitorUser);
    setQuery('');
    setResults([]);
    setIsVisitor(false);
  };

  const toggleVisitor = (e) => {
    setIsVisitor(e.target.checked);
  };

  return (
    <div className="relative flex flex-col gap-4">

      <div className="flex flex-col gap-2">
        <div className="relative flex gap-2">
          <input
            type="text"
            placeholder={isVisitor ? "Digite o nome do visitante..." : "Digite o código ou nome..."}
            className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-6 py-4 outline-none focus:border-accent transition-colors text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isVisitor) handleVisitorSelect();
            }}
          />
          {isVisitor && query.trim().length > 0 && (
            <button
              onClick={() => handleVisitorSelect()}
              className="bg-accent text-black font-black px-8 rounded-xl hover:bg-accent/80 transition-all uppercase tracking-widest text-sm whitespace-nowrap"
            >
              Avançar
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="w-6 h-6 rounded border-white/20 bg-white/10 text-accent focus:ring-accent transition-all cursor-pointer"
            checked={isVisitor}
            onChange={toggleVisitor}
          />
          <span className="text-white font-bold uppercase tracking-wider text-sm group-hover:text-accent transition-colors">
            Registrar como Visitante?
          </span>
        </label>
      </div>

      {results.length > 0 && (
        <div className="absolute top-[84px] left-0 right-0 glass-card overflow-hidden z-20 max-h-60 overflow-y-auto shadow-2xl">
          {results.map(user => {
            const displayCodigo = user.codigo.includes(':') ? user.codigo.split(':')[1] : user.codigo;
            return (
            <div
              key={user.codigo}
              className="px-6 py-4 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 flex flex-col"
              onClick={() => {
                if (isVisitor) {
                  handleVisitorSelect(user.nome);
                } else {
                  onSelect(user);
                  setQuery('');
                  setResults([]);
                }
              }}
            >
              <div className="font-bold text-lg">{user.nome}</div>
              <div className="text-sm text-gray-400">Código: {displayCodigo}</div>
              {isVisitor && (
                <div className="text-xs text-accent font-bold mt-1 uppercase">Selecionar como Visitante</div>
              )}
            </div>
          )})}
        </div>
      )}
    </div>
  );
}
