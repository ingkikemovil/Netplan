import { useRef, useState } from 'react'
import { Upload, FileText, AlertTriangle, CheckCircle, X, Download } from 'lucide-react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

export default function UploadExcel({ projectId, onImported }) {
  const ref = useRef()
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null) // { nodes, connections, warnings }
  const [parsed, setParsed] = useState(null)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    setPreview(null)
    setParsed(null)
    try {
      const data = await api.upload.excel(file)
      setParsed(data)
      setPreview({
        nodes: data.nodes.length,
        connections: data.connections.length,
        warnings: data.warnings || [],
      })
    } catch (err) {
      toast.error(err.message || 'Error al leer el archivo')
    } finally {
      setLoading(false)
      ref.current.value = ''
    }
  }

  const handleImport = async () => {
    if (!parsed) return
    setLoading(true)
    try {
      let nodesInserted = 0, connsInserted = 0
      let skippedNodes = [], skippedConns = 0

      if (parsed.nodes.length > 0) {
        const nodesWithProject = parsed.nodes.map(n => ({ ...n, project_id: projectId }))
        const res = await api.nodes.bulk(nodesWithProject)
        nodesInserted = res.inserted ?? parsed.nodes.length
        skippedNodes = res.skipped_names ?? []
      }

      if (parsed.connections.length > 0) {
        const allNodes = await api.nodes.list(projectId)
        const nameToId = Object.fromEntries(allNodes.map(n => [n.name.toLowerCase(), n.id]))
        const conns = parsed.connections
          .map(c => ({
            project_id: projectId,
            source_node_id: nameToId[c.source_name.toLowerCase()],
            target_node_id: nameToId[c.target_name.toLowerCase()],
            cost: c.cost,
            conn_type: c.conn_type,
          }))
          .filter(c => c.source_node_id && c.target_node_id)

        if (conns.length > 0) {
          const res = await api.connections.bulk(conns)
          connsInserted = res.inserted ?? conns.length
          skippedConns = res.skipped ?? 0
        }
      }

      let msg = `Importados: ${nodesInserted} nodos, ${connsInserted} conexiones`
      if (skippedNodes.length > 0) msg += ` (${skippedNodes.length} nodos duplicados omitidos)`
      if (skippedConns > 0) msg += ` (${skippedConns} conexiones duplicadas omitidas)`
      toast.success(msg, { duration: 5000 })
      setPreview(null)
      setParsed(null)
      onImported()
    } catch (err) {
      toast.error(err.message || 'Error al importar')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    // Genera un CSV con instrucciones como guia (simple, sin dependencias)
    const info = `PLANTILLA NETPLAN - INSTRUCCIONES
===========================================

HOJA 1: nodos  (nombre exacto requerido, o: nodes, puntos, vertices)
Columnas requeridas: nombre, latitud, longitud
Columnas opcionales: tipo, direccion

nombre,tipo,latitud,longitud,direccion
Riohacha,city,11.5444,-72.9072,Centro historico
Maicao,city,11.3833,-72.2436,
Uribia,city,11.7131,-72.2692,
Manaure,tower,11.7803,-72.4469,Zona costera

Tipos de nodo: city | tower | datacenter | other

HOJA 2: conexiones  (nombre exacto requerido, o: connections, edges, aristas)
Columnas requeridas: origen, destino, costo
Columna opcional: tipo

origen,destino,costo,tipo
Riohacha,Maicao,2000,normal
Maicao,Uribia,1500,mandatory
Riohacha,Manaure,3000,normal
Uribia,Manaure,1800,normal

Tipos de conexion: normal | mandatory (obligatoria) | forbidden (prohibida)

NOMBRES DE COLUMNA ACEPTADOS:
- nombre: nombre, name, nodo, node, ciudad, punto
- latitud: latitud, latitude, lat, y
- longitud: longitud, longitude, lng, lon, x
- tipo nodo: tipo, type, clase, category
- origen: origen, source, from, desde
- destino: destino, target, to, hasta
- costo: costo, cost, peso, weight, distancia, valor
`
    const blob = new Blob([info], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Netplan_Plantilla_Excel.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-3">
      <input ref={ref} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />

      <div className="flex gap-2">
        <button
          onClick={() => ref.current.click()}
          disabled={loading}
          className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
        >
          {loading
            ? <><Upload size={15} className="animate-bounce" /> Leyendo...</>
            : <><FileText size={15} /> Cargar Excel (.xlsx)</>}
        </button>
        <button
          onClick={downloadTemplate}
          title="Descargar plantilla de ejemplo"
          className="px-3 py-2 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 transition-colors"
        >
          <Download size={15} />
        </button>
      </div>

      {/* Preview resultado del parsing */}
      {preview && (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Vista previa del archivo</span>
            <button onClick={() => { setPreview(null); setParsed(null) }} className="text-slate-500 hover:text-white">
              <X size={14} />
            </button>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 text-green-400 text-xs">
              <CheckCircle size={13} />
              <span>{preview.nodes} nodos</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-400 text-xs">
              <CheckCircle size={13} />
              <span>{preview.connections} conexiones</span>
            </div>
          </div>

          {preview.warnings.length > 0 && (
            <div className="space-y-1">
              {preview.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-1.5 text-yellow-400 text-xs">
                  <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          {(preview.nodes > 0 || preview.connections > 0) && (
            <button
              onClick={handleImport}
              disabled={loading}
              className="btn-primary w-full text-sm py-1.5"
            >
              {loading ? 'Importando...' : `Importar ${preview.nodes} nodos y ${preview.connections} conexiones`}
            </button>
          )}
        </div>
      )}

      <p className="text-slate-500 text-xs text-center">
        Hoja <code className="text-slate-400">nodos</code> y <code className="text-slate-400">conexiones</code> &mdash;
        <button onClick={downloadTemplate} className="text-primary hover:underline ml-1">ver plantilla</button>
      </p>
    </div>
  )
}
