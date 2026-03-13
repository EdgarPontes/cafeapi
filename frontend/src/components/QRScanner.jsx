import { Scanner } from "@yudiel/react-qr-scanner"

export default function QRScanner({onDetect, onClose}){
  function handleScan(result){
    if(result && result[0]){
      // The result is an array of detected objects
      const text = result[0].rawValue;
      const codigo = text.includes("/") ? text.split("/").pop() : text;
      onDetect(codigo);
    }
  }

  function handleError(err){
    console.error(err)
  }

  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass-card p-6 w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">Escanear QR Code</h2>
        <div className="rounded-xl overflow-hidden border-2 border-accent">
          <Scanner
            onScan={handleScan}
            onError={handleError}
            styles={{ container: { width: "100%" } }}
          />
        </div>
        <p className="mt-4 text-center text-sm text-gray-400">
          Aproxime o QR Code da câmera
        </p>
      </div>
    </div>
  )
}
