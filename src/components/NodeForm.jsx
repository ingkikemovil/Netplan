import { useState } from 'react'
import { MapPin } from 'lucide-react'

const NODE_TYPES = ['city', 'tower', 'datacenter', 'other']
const NODE_LABELS = { city: 'Ciudad', tower: 'Torre', datacenter: 'Centro de datos', other: 'Otro' }

export default function NodeForm({ projectId, onCreated }) {
  const [form, setForm] = useState({ name: '', node_type: 'city', latitude: '', longitude: '', address: '' })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onCreated({
        project_id: projectId,
        name: form.name,
        node_type: form.node_type,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        address: form.address || null,
      })
      setForm({ name: '', node_type: 'city', latitude: '', longitude: '', address: '' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Nombre *</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej: Riohacha" required />
        </div>
        <div>
          <label className="label">Tipo</label>
          <select className="input" value={form.node_type} onChange={e => set('node_type', e.target.value)}>
            {NODE_TYPES.map(t => <option key={t} value={t}>{NODE_LABELS[t]}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Latitud *</label>
          <input className="input" type="number" step="any" value={form.latitude} onChange={e => set('latitude', e.target.value)} placeholder="11.5444" required />
        </div>
        <div>
          <label className="label">Longitud *</label>
          <input className="input" type="number" step="any" value={form.longitude} onChange={e => set('longitude', e.target.value)} placeholder="-72.9072" required />
        </div>
      </div>
      <div>
        <label className="label">Dirección (opcional)</label>
        <input className="input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Dirección o referencia" />
      </div>
      <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
        <MapPin size={16} />
        {loading ? 'Guardando...' : 'Agregar nodo'}
      </button>
    </form>
  )
}
