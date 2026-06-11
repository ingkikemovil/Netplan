import { Download, FileSpreadsheet } from 'lucide-react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

export default function ResultsPanel({ result, projectName }) {
  if (!result) return null

  const handleExport = async (format) => {
    const payload = {
      project_name: projectName,
      algorithm: result.algorithm,
      total_cost: result.total_cost,
      nodes_connected: result.nodes_connected,
      edges_used: result.edges_used,
      tree_edges: result.tree_edges.map(e => ({
        source_name: e.source?.name || e.source_node_id,
        target_name: e.target?.name || e.target_node_id,
        cost: e.cost,
        conn_type: e.conn_type || 'normal',
      })),
    }
    try {
      if (format === 'pdf') await api.export.pdf(payload)
      else await api.export.excel(payload)
    } catch {
      toast.error('Error al exportar')
    }
  }

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
          <p className="text-slate-400 text-xs">Costo Total</p>
          <p className="text-white font-bold text-lg">${result.total_cost?.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-3 text-center">
          <p className="text-slate-400 text-xs">Algoritmo</p>
          <p className="text-white font-bold text-lg">{result.algorithm?.toUpperCase()}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 text-center">
          <p className="text-slate-400 text-xs">Nodos conectados</p>
          <p className="text-white font-semibold">{result.nodes_connected}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 text-center">
          <p className="text-slate-400 text-xs">Conexiones usadas</p>
          <p className="text-white font-semibold">{result.edges_used}</p>
        </div>
      </div>

      {/* Tabla de aristas */}
      <div className="overflow-auto max-h-60">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700">
              <th className="text-left py-2">Origen</th>
              <th className="text-left py-2">Destino</th>
              <th className="text-right py-2">Costo</th>
            </tr>
          </thead>
          <tbody>
            {result.tree_edges?.map((e, i) => (
              <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="py-1.5 text-white">{e.source?.name || e.source_node_id}</td>
                <td className="py-1.5 text-white">{e.target?.name || e.target_node_id}</td>
                <td className="py-1.5 text-right text-slate-300">{e.cost?.toLocaleString('es-CO')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Exportar */}
      <div className="flex gap-2 pt-2">
        <button onClick={() => handleExport('pdf')} className="btn-secondary flex items-center gap-2 flex-1 justify-center text-sm">
          <Download size={15} /> PDF
        </button>
        <button onClick={() => handleExport('excel')} className="btn-secondary flex items-center gap-2 flex-1 justify-center text-sm">
          <FileSpreadsheet size={15} /> Excel
        </button>
      </div>
    </div>
  )
}
