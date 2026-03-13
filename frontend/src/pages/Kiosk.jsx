import { useState, useEffect } from 'react';
import UserCard from '../components/UserCard';
import QRScanner from '../components/QRScanner';
import SearchUser from '../components/SearchUser';
import ValueSelector from '../components/ValueSelector';
import RankingPodium from '../components/RankingPodium';

export default function Kiosk() {
  const [user, setUser] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // RFID Listener
  useEffect(() => {
    let buffer = "";
    const handleKeyPress = (e) => {
      if (e.key === "Enter") {
        if (buffer) buscarFuncionario(buffer);
        buffer = "";
      } else {
        buffer += e.key;
      }
    };
    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, []);

  async function buscarFuncionario(codigo) {
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/funcionarios/${codigo}`);
      if (!resp.ok) throw new Error("Não encontrado");
      const data = await resp.json();
      setUser(data);
      setShowScanner(false);
    } catch (err) {
      showMessage('error', 'Funcionário não identificado');
    }
  }

  function handleUserSelect(selectedUser) {
    if (selectedUser.visitante) {
      // Visitante selecionado, define usuário como visitante
      setUser(selectedUser);
      setShowScanner(false);
    } else {
      // Funcionário normal, busca dados completos
      buscarFuncionario(selectedUser.codigo);
    }
  }

  async function confirmarCafe(valor) {
    try {
      const requestBody = {
        codigo: user.codigo,
        valor: valor
      };
      
      // Se for visitante, inclui o nome digitado
      if (user.visitante) {
        requestBody.nome = user.nome;
      }
      
      const resp = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/consumo/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      if (!resp.ok) throw new Error("Erro ao registrar");

      showMessage('success', 'Café registrado com sucesso! ☕');

      // Play sound simulation
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/221/221-preview.mp3');
      audio.play().catch(() => { });

      reset();
    } catch (err) {
      showMessage('error', 'Erro ao processar registro');
    }
  }

  function showMessage(type, msg) {
    setStatus({ type, message: msg });
    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
  }

  function reset() {
    setUser(null);
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center p-4 sm:p-6 gap-6 sm:gap-8">
      <header className="text-center">
        <h1 className="text-4xl sm:text-5xl font-black text-accent mb-2">CAFÉ SG</h1>
        {/*<p className="text-gray-400">Digite seu código ou nome</p>*/}
      </header>

      <main className="w-full max-w-2xl flex flex-col gap-6">
        {!user ? (
          <>
            <SearchUser onSelect={handleUserSelect} />
            {/*<div className="flex gap-4">
              <button
                onClick={() => setShowScanner(true)}
                className="flex-1 btn-premium py-4 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                📷 Escanear QR Code
              </button>
            </div>*/}
            <RankingPodium />
          </>
        ) : (
          <div className="flex flex-col gap-6 animate-in fade-in zoom-in duration-300">
            <UserCard user={user} />
            <ValueSelector onSelect={confirmarCafe} onCancel={reset} />
          </div>
        )}
      </main>

      {showScanner && <QRScanner onDetect={buscarFuncionario} onClose={() => setShowScanner(false)} />}

      {status.message && (
        <div className={`fixed bottom-10 px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl animate-bounce ${status.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
          {status.message}
        </div>
      )}
    </div>
  );
}
