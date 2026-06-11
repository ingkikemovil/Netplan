import { AlertTriangle } from 'lucide-react'

export default function CycleModal({ nodes, srcId, tgtId, onAllow, onCancel }) {
  const srcName = nodes.find(n => n.id === srcId)?.name || srcId
  const tgtName = nodes.find(n => n.id === tgtId)?.name || tgtId

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div className="bg-card border border-slate-700 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-yellow-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Ciclo detectado</h3>
            <p className="text-slate-400 text-xs">La red forma un ciclo con esta conexion</p>
          </div>
        </div>

        <p className="text-slate-300 text-sm mb-2">
          Agregar la conexion <span className="text-white font-medium">{srcName} &rarr; {tgtName}</span> crea un ciclo en la red.
        </p>
        <p className="text-slate-400 text-xs mb-6">
          En un Arbol de Expansion Minima los ciclos se eliminan automaticamente al calcular. Puedes agregar la conexion de todas formas o cancelar.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onAllow}
            className="flex-1 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold text-sm transition-colors"
          >
            Agregar igual
          </button>
        </div>
      </div>
    </div>
  )
}
