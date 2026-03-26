export default function UserCard({user}){
  // Remove prefix like 'SG:' or 'RJK:' for display and photo
  const displayCodigo = user.codigo.includes(':') ? user.codigo.split(':')[1] : user.codigo;
  const foto = `/fotos/${displayCodigo}.jpg`;

  return(
    <div className="flex items-center gap-6 glass-card p-6 transition-all hover:scale-[1.02]">
      <div className="relative">
        <img
          src={foto}
          onError={(e)=>e.target.src="https://ui-avatars.com/api/?name=" + encodeURIComponent(user.nome) + "&background=random"}
          className="w-24 h-24 rounded-full border-4 border-accent object-cover"
          alt={user.nome}
        />
        <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-bg-dark"></div>
      </div>

      <div className="flex-1">
        <div className="font-bold text-2xl text-accent mb-1 uppercase tracking-tight">
          {user.nome}
        </div>
        <div className="text-gray-400 font-mono text-sm">
          #{displayCodigo}
        </div>
      </div>
    </div>
  )
}
