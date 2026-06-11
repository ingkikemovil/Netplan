import { useRef, useState } from 'react'
import { Upload, FileText } from 'lucide-react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

export default function UploadExcel({ projectId, nodes, onImported }) {
  const ref = useRef()
  const [loading, setLoading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    try {
      const data = await api.upload.excel(file)
      // Insertar nodos
      if (data.nodes.length > 0) {
        const nodesWithProject = data.nodes.map(n => ({ ...n, project_id: projectId }))
        await api.nodes.bulk(nodesWithProject)
      }
      // Resolver nombres a IDs y luego insertar conexiones
      if (data.connections.length > 0) {
        const allNodes = await api.nodes.list(projectId)
        const nameToId = Object.fromEntries(allNodes.map(n => [n.name.toLowerCase(), n.id]))
        const conns = data.connections
          .map(c => ({
            project_id: projectId,
            source_node_id: nameToId[c.source_name.toLowerCase()],
            target_node_id: nameToId[c.target_name.toLowerCase()],
            cost: c.cost,
            conn_type: c.conn_type,
          }))
          .filter(c => c.source_node_id && c.target_node_id)
        if (conns.length > 0) await api.connections.bulk(conns)
      }
      toast.success(`Importado: ${data.nodes.length} nodos, ${data.connections.length} conexiones`)
      onImported()
    } catch (err) {
      toast.error(err.message || 'Error al importar')
    } finally {
      setLoading(false)
      ref.current.value = ''
    }
  }

  return (
    <div>
      <input ref={ref} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
      <button
        onClick={() => ref.current.click()}
        disabled={loading}
        className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
      >
        {loading ? <><Upload size={15} className="animate-bounce" /> Importando...</> : <><FileText size={15} /> Cargar Excel (.xlsx)</>}
      </button>
      <p className="text-slate-500 text-xs mt-2 text-center">
        Hojas requeridas: <code className="text-slate-400">nodos</code> y <code className="text-slate-400">conexiones</code>
      </p>
    </div>
  )
}
