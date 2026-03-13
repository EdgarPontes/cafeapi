import { useState, useEffect } from 'react';

export default function SearchUser({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showVisitorOption, setShowVisitorOption] = useState(false);

  useEffect(() => {
    if (query.length > 2) {
      // Small debounce simulation or just direct fetch
      fetch(`${import.meta.env.VITE_API_URL || ''}/api/funcionarios/`)
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter(u =>
            u.nome.toLowerCase().includes(query.toLowerCase()) ||
            u.codigo.includes(query)
          );
          setResults(filtered);
          setShowVisitorOption(filtered.length === 0);
        });
    } else {
      setResults([]);
      setShowVisitorOption(false);
    }
  }, [query]);

  const handleVisitorSelect = () => {
    // Remove acentos e converte para maiúsculo
    const normalizedNome = query.trim()
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
    setShowVisitorOption(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Digite o código ou nome..."
        className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-6 py-4 outline-none focus:border-accent transition-colors text-lg"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card overflow-hidden z-10 max-h-60 overflow-y-auto">
          {results.map(user => (
            <div
              key={user.codigo}
              className="px-6 py-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0"
              onClick={() => {
                onSelect(user);
                setQuery('');
                setResults([]);
              }}
            >
              <div className="font-bold">{user.nome}</div>
              <div className="text-sm text-gray-400">{user.codigo}</div>
            </div>
          ))}
        </div>
      )}

      {showVisitorOption && query.length > 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card overflow-hidden z-10">
          <div className="p-4">
            <label className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded">
              <input
                type="checkbox"
                className="w-5 h-5 text-accent bg-white/10 border-white/20 rounded focus:ring-accent focus:ring-2"
                checked={false}
                onChange={handleVisitorSelect}
              />
              <span className="text-white font-medium">Visitante?</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
