import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import NodeForm from '../components/NodeForm'
import ConnectionForm from '../components/ConnectionForm'
import NetworkMap from '../components/NetworkMap'
import ResultsPanel from '../components/ResultsPanel'
import UploadExcel from '../components/UploadExcel'
import { Trash2, Play, ChevronDown, ChevronUp, MapPin, Link2, BarChart3 } from 'lucide-react'

const CONN_TYPE_CYCLE = { normal: 'mandatory', mandatory: 'forbidden', forbidden: 'normal' }
const CONN_BADGE = {
  normal: 'badge-normal',
  mandatory: 'badge-mandatory',
  forbidden: 'badge-forbidden',
}
const CONN_LABEL = { normal: 'Normal', mandatory: 'Obligatoria', forbidden: 'Prohibida' }

export default function ProjectEditor() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [nodes, setNodes] = useState([])
  const [connections, setConnections] = useState([])
  const [result, setResult] = useState(null)
  const [showMst, setShowMst] = useState(false)
  const [algorithm, setAlgorithm] = useState('kruskal')
  const [budget, setBudget] = useState('')
  const [calculating, setCalculating] = useState(false)
  const [tab, setTab] = useState('nodes') // nodes | connections | results
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAll() }, [id])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [proj, ns, cs] = await Promise.all([
        api.projects.get(id),
        api.nodes.list(id),
        api.connections.list(id),
      ])
      setProject(proj)
      setNodes(ns)
      setConnections(cs)
      if (proj.status === 'calculated') {
        try {
          const r = await api.mst.results(id)
          setResult(r)
          setShowMst(true)
        } catch { /* sin resultado previo */ }
      }
    } catch {
      toast.error('Error al cargar el proyecto')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Nodos
  const handleAddNode = async (data) => {
    try {
      const n = await api.nodes.create(data)
      setNodes(prev => [...prev, n])
      toast.success('Nodo agregado')
    } catch (err) { toast.error(err.message) }
  }

  const handleDeleteNode = async (nodeId) => {
    try {
      await api.nodes.delete(nodeId)
      setNodes(prev => prev.filter(n => n.id !== nodeId))
      setConnections(prev => prev.filter(c => c.source_node_id !== nodeId && c.target_node_id !== nodeId))
    } catch (err) { toast.error(err.message) }
  }

  // Conexiones
  const handleAddConnection = async (data) => {
    try {
      const c = await api.connections.create(data)
      setConnections(prev => [...prev, c])
      toast.success('Conexión agregada')
    } catch (err) { toast.error(err.message) }
  }

  const handleToggleConnType = async (conn) => {
    const next = CONN_TYPE_CYCLE[conn.conn_type] || 'normal'
    try {
      await api.connections.updateType(conn.id, next)
      setConnections(prev => prev.map(c => c.id === conn.id ? { ...c, conn_type: next } : c))
    } catch (err) { toast.error(err.message) }
  }

  const handleDeleteConn = async (connId) => {
    try {
      await api.connections.delete(connId)
      setConnections(prev => prev.filter(c => c.id !== connId))
    } catch (err) { toast.error(err.message) }
  }

  // MST
  const handleCalculate = async () => {
    if (nodes.length < 2) return toast.error('Necesitas al menos 2 nodos')
    if (connections.length === 0) return toast.error('Agrega al menos una conexión')
    setCalculating(true)
    try {
      const r = await api.mst.calculate({
        project_id: id,
        algorithm,
        budget: budget ? parseFloat(budget) : null,
      })
      setResult(r)
      setShowMst(true)
      setTab('results')
      toast.success('¡Árbol de expansión mínima calculado!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setCalculating(false)
    }
  }

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))

  if (loading) return <div className="flex items-center justify-center h-96 text-slate-400">Cargando proyecto...</div>

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Panel lateral izquierdo */}
      <div className="w-96 shrink-0 bg-card border-r border-slate-700 flex flex-col overflow-hidden">
        {/* Header proyecto */}
        <div className="p-4 border-b border-slate-700">
          <h2 className="font-bold text-white text-lg truncate">{project?.name}</h2>
          {project?.description && <p className="text-slate-400 text-sm mt-1 line-clamp-2">{project.description}</p>}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          {[
            { key: 'nodes', label: 'Nodos', icon: MapPin },
            { key: 'connections', label: 'Conexiones', icon: Link2 },
            { key: 'results', label: 'Resultados', icon: BarChart3 },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1 transition-colors border-b-2 ${
                tab === key ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={13} />{label}
            </button>
          ))}
        </div>

        {/* Contenido del tab */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* TAB: NODOS */}
          {tab === 'nodes' && (
            <>
              <UploadExcel projectId={id} nodes={nodes} onImported={loadAll} />
              <div className="border-t border-slate-700 pt-4">
                <p className="text-slate-400 text-xs font-semibold uppercase mb-3">Agregar nodo manual</p>
                <NodeForm projectId={id} onCreated={handleAddNode} />
              </div>
              <div className="border-t border-slate-700 pt-4">
                <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
                  Nodos ({nodes.length})
                </p>
                <div className="space-y-2">
                  {nodes.map(n => (
                    <div key={n.id} className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-white text-sm font-medium">{n.name}</p>
                        <p className="text-slate-500 text-xs">{n.node_type} · {n.latitude?.toFixed(3)}, {n.longitude?.toFixed(3)}</p>
                      </div>
                      <button onClick={() => handleDeleteNode(n.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {nodes.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Sin nodos aún</p>}
                </div>
              </div>
            </>
          )}

          {/* TAB: CONEXIONES */}
          {tab === 'connections' && (
            <>
              <ConnectionForm projectId={id} nodes={nodes} onCreated={handleAddConnection} />
              <div className="border-t border-slate-700 pt-4">
                <p className="text-slate-400 text-xs font-semibold uppercase mb-1">
                  Conexiones ({connections.length})
                </p>
                <p className="text-slate-500 text-xs mb-3">Haz clic en el badge para cambiar el tipo</p>
                <div className="space-y-2">
                  {connections.map(c => {
                    const src = nodeMap[c.source_node_id] || c.source
                    const tgt = nodeMap[c.target_node_id] || c.target
                    return (
                      <div key={c.id} className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{src?.name} → {tgt?.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => handleToggleConnType(c)}
                              className={`${CONN_BADGE[c.conn_type]} cursor-pointer hover:opacity-80 transition-opacity`}
                            >
                              {CONN_LABEL[c.conn_type]}
                            </button>
                            <span className="text-slate-500 text-xs">{c.cost}</span>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteConn(c.id)} className="text-slate-600 hover:text-red-400 transition-colors ml-2">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )
                  })}
                  {connections.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Sin conexiones aún</p>}
                </div>
              </div>
            </>
          )}

          {/* TAB: RESULTADOS */}
          {tab === 'results' && (
            <>
              {/* Configuración del cálculo */}
              <div className="space-y-3">
                <div>
                  <label className="label">Algoritmo</label>
                  <select className="input" value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
                    <option value="kruskal">Kruskal</option>
                    <option value="prim">Prim</option>
                  </select>
                </div>
                <div>
                  <label className="label">Presupuesto máximo (opcional)</label>
                  <input className="input" type="number" min="0" step="any" value={budget} onChange={e => setBudget(e.target.value)} placeholder="Sin límite" />
                </div>
                <button
                  onClick={handleCalculate}
                  disabled={calculating || nodes.length < 2}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Play size={16} />
                  {calculating ? 'Calculando...' : 'Calcular MST'}
                </button>
              </div>

              {result && (
                <>
                  <div className="border-t border-slate-700 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-slate-400 text-xs font-semibold uppercase">Resultado</p>
                      <button
                        onClick={() => setShowMst(!showMst)}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        {showMst ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {showMst ? 'Ocultar MST' : 'Mostrar MST'}
                      </button>
                    </div>
                    <ResultsPanel result={result} projectName={project?.name} />
                  </div>
                </>
              )}

              {!result && <p className="text-slate-500 text-sm text-center py-8">Aún no hay resultados calculados</p>}
            </>
          )}
        </div>
      </div>

      {/* Mapa */}
      <div className="flex-1 relative">
        <NetworkMap
          nodes={nodes}
          connections={connections}
          mstEdges={result?.tree_edges || []}
          showMst={showMst}
        />
        {/* Toggle overlay */}
        {result && (
          <div className="absolute top-4 right-4 z-[1000] bg-card border border-slate-700 rounded-lg p-2 flex items-center gap-2">
            <span className="text-xs text-slate-400">Ver MST</span>
            <button
              onClick={() => setShowMst(!showMst)}
              className={`w-10 h-5 rounded-full transition-colors relative ${showMst ? 'bg-primary' : 'bg-slate-600'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${showMst ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
