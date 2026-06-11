const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Error en el servidor')
  }
  return res.json()
}

// Projects
export const api = {
  projects: {
    list: (userId) => request(`/api/projects/?user_id=${userId}`),
    create: (data) => request('/api/projects/', { method: 'POST', body: JSON.stringify(data) }),
    get: (id) => request(`/api/projects/${id}`),
    update: (id, data) => request(`/api/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/projects/${id}`, { method: 'DELETE' }),
  },
  nodes: {
    list: (projectId) => request(`/api/nodes/project/${projectId}`),
    create: (data) => request('/api/nodes/', { method: 'POST', body: JSON.stringify(data) }),
    bulk: (nodes) => request('/api/nodes/bulk', { method: 'POST', body: JSON.stringify({ nodes }) }),
    delete: (id) => request(`/api/nodes/${id}`, { method: 'DELETE' }),
    deleteAll: (projectId) => request(`/api/nodes/project/${projectId}/all`, { method: 'DELETE' }),
  },
  connections: {
    list: (projectId) => request(`/api/connections/project/${projectId}`),
    create: (data) => request('/api/connections/', { method: 'POST', body: JSON.stringify(data) }),
    bulk: (conns) => request('/api/connections/bulk', { method: 'POST', body: JSON.stringify({ connections: conns }) }),
    updateType: (id, connType) => request(`/api/connections/${id}?conn_type=${connType}`, { method: 'PATCH' }),
    delete: (id) => request(`/api/connections/${id}`, { method: 'DELETE' }),
    deleteAll: (projectId) => request(`/api/connections/project/${projectId}/all`, { method: 'DELETE' }),
  },
  mst: {
    calculate: (data) => request('/api/mst/calculate', { method: 'POST', body: JSON.stringify(data) }),
    results: (projectId) => request(`/api/mst/results/${projectId}`),
  },
  upload: {
    excel: async (file) => {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${BASE}/api/upload/excel`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Error al procesar el Excel')
      return res.json()
    },
  },
  export: {
    pdf: async (data) => {
      const res = await fetch(`${BASE}/api/export/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Netplan_${data.project_name}.pdf`
      a.click()
    },
    excel: async (data) => {
      const res = await fetch(`${BASE}/api/export/excel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Netplan_${data.project_name}.xlsx`
      a.click()
    },
  },
}
