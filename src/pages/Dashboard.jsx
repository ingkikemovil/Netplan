import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, FolderOpen, Network } from 'lucide-react'

const STATUS_LABELS = {
  draft: { label: 'Borrador', cls: 'bg-slate-600' },
  calculated: { label: 'Calculado', cls: 'bg-green-700' },
  archived: { label: 'Archivado', cls: 'bg-yellow-700' },
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { if (user) fetchProjects() }, [user])

  const fetchProjects = async () => {
    try {
      const data = await api.projects.list(user.id)
      setProjects(data)
    } catch {
      toast.error('Error al cargar proyectos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const p = await api.projects.create({ name: newName, description: newDesc, user_id: user.id })
      setProjects([p, ...projects])
      setNewName('')
      setNewDesc('')
      setShowForm(false)
      toast.success('Proyecto creado')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('¿Eliminar este proyecto y todos sus datos?')) return
    try {
      await api.projects.delete(id)
      setProjects(projects.filter(p => p.id !== id))
      toast.success('Proyecto eliminado')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Mis Proyectos</h1>
          <p className="text-slate-400 text-sm mt-1">Gestiona tus redes de planificación</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nuevo proyecto
        </button>
      </div>

      {/* Formulario nuevo proyecto */}
      {showForm && (
        <form onSubmit={handleCreate} className="card mb-8 space-y-4">
          <h3 className="font-semibold text-white">Nuevo proyecto</h3>
          <div>
            <label className="label">Nombre del proyecto *</label>
            <input className="input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ej: Red Fibra Óptica Guajira" required />
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea className="input resize-none" rows={2} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Descripción opcional..." />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? 'Creando...' : 'Crear proyecto'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      {/* Lista de proyectos */}
      {loading ? (
        <div className="text-slate-400 text-center py-20">Cargando proyectos...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <Network size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No tienes proyectos aún. ¡Crea el primero!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(p => {
            const st = STATUS_LABELS[p.status] || STATUS_LABELS.draft
            return (
              <div
                key={p.id}
                onClick={() => navigate(`/project/${p.id}`)}
                className="card cursor-pointer hover:border-primary transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white ${st.cls}`}>{st.label}</span>
                    <h3 className="font-semibold text-white mt-2 group-hover:text-primary transition-colors">{p.name}</h3>
                    {p.description && <p className="text-slate-400 text-sm mt-1 line-clamp-2">{p.description}</p>}
                  </div>
                  <button
                    onClick={e => handleDelete(p.id, e)}
                    className="text-slate-600 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-xs mt-3">
                  <FolderOpen size={13} />
                  {new Date(p.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
