import React from 'react';

const AccessDenied = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-white p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Animated Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative flex items-center justify-center w-full h-full bg-red-500/10 border-2 border-red-500/30 rounded-full">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 text-red-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Acesso <span className="text-red-500">Negado</span>
          </h1>
          <p className="text-xl text-gray-400 font-medium">
            Este dispositivo não tem permissão para acessar o sistema de café.
          </p>
        </div>

        <div className="pt-8 border-t border-white/10">
          <p className="text-sm text-gray-500">
            Se você acredita que isto é um erro, entre em contato com o administrador para autorizar o endereço IP deste dispositivo.
          </p>
        </div>

        <div className="mt-8 flex justify-center">
            <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all active:scale-95"
            >
                Tentar Novamente
            </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
