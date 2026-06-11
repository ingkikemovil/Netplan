import { useState } from 'react'
import { Link2 } from 'lucide-react'

const CONN_TYPES = [
  { value: 'normal', label: 'Normal', cls: 'badge-normal' },
  { value: 'mandatory', label: 'Obligatoria', cls: 'badge-mandatory' },
  { value: 'forbidden', label: 'Prohibida', cls: 'badge-forbidden' },
]

export default function ConnectionForm({ projectId, nodes, onCreated }) {
  const [form, setForm] = useState({ source_node_id: '', target_node_id: '', cost: '', conn_type: 'normal' })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.source_node_id === form.target_node_id) return alert('Los nodos deben ser diferentes')
    setLoading(true)
    try {
      await onCreated({
        project_id: projectId,
        source_node_id: form.source_node_id,
        target_node_id: form.target_node_id,
        cost: parseFloat(form.cost),
        conn_type: form.conn_type,
      })
      setForm({ source_node_id: '', target_node_id: '', cost: '', conn_type: 'normal' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Nodo origen *</label>
          <select className="input" value={form.source_node_id} onChange={e => set('source_node_id', e.target.value)} required>
            <option value="">Seleccionar...</option>
            {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Nodo destino *</label>
          <select className="input" value={form.target_node_id} onChange={e => set('target_node_id', e.target.value)} required>
            <option value="">Seleccionar...</option>
            {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Costo *</label>
          <input className="input" type="number" min="0" step="any" value={form.cost} onChange={e => set('cost', e.target.value)} placeholder="0.00" required />
        </div>
        <div>
          <label className="label">Tipo de conexión</label>
          <select className="input" value={form.conn_type} onChange={e => set('conn_type', e.target.value)}>
            {CONN_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>
      <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
        <Link2 size={16} />
        {loading ? 'Guardando...' : 'Agregar conexión'}
      </button>
    </form>
  )
}
