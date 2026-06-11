import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const TYPE_COLORS = { city: '#3b82f6', tower: '#f59e0b', datacenter: '#10b981', other: '#8b5cf6' }
const CONN_COLORS = { normal: '#64748b', mandatory: '#22c55e', forbidden: '#ef4444' }

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function NetworkMap({ nodes, connections, mstEdges = [], showMst = false, onMapClick }) {
  const center = nodes.length > 0
    ? [
        nodes.reduce((s, n) => s + n.latitude, 0) / nodes.length,
        nodes.reduce((s, n) => s + n.longitude, 0) / nodes.length,
      ]
    : [11.5444, -72.9072]

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))

  return (
    <MapContainer center={center} zoom={nodes.length > 0 ? 7 : 6} style={{ height: '100%', width: '100%' }} key={nodes.length === 0 ? 'empty' : nodes[0]?.id}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {onMapClick && <ClickHandler onMapClick={onMapClick} />}

      {/* Instruccion cuando no hay nodos */}
      {nodes.length === 0 && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, background: 'rgba(15,23,42,0.85)', color: '#94a3b8', padding: '12px 20px', borderRadius: 8, fontSize: 13, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          Haz clic en el mapa para agregar un nodo
        </div>
      )}

      {/* Todas las conexiones */}
      {!showMst && connections.map(c => {
        const src = nodeMap[c.source_node_id] || (c.source && { latitude: c.source.latitude, longitude: c.source.longitude })
        const tgt = nodeMap[c.target_node_id] || (c.target && { latitude: c.target.latitude, longitude: c.target.longitude })
        if (!src || !tgt) return null
        return (
          <Polyline
            key={c.id}
            positions={[[src.latitude, src.longitude], [tgt.latitude, tgt.longitude]]}
            pathOptions={{ color: CONN_COLORS[c.conn_type] || '#64748b', weight: c.conn_type === 'mandatory' ? 3 : 1.5, dashArray: c.conn_type === 'forbidden' ? '6 4' : null, opacity: 0.6 }}
          >
            <Popup>Costo: {c.cost} | Tipo: {c.conn_type}</Popup>
          </Polyline>
        )
      })}

      {/* MST resultante */}
      {showMst && mstEdges.map((e, i) => {
        const src = e.source || nodeMap[e.source_node_id]
        const tgt = e.target || nodeMap[e.target_node_id]
        if (!src || !tgt) return null
        return (
          <Polyline
            key={i}
            positions={[[src.latitude, src.longitude], [tgt.latitude, tgt.longitude]]}
            pathOptions={{ color: e.conn_type === 'mandatory' ? '#22c55e' : '#2563eb', weight: 4, opacity: 0.9 }}
          >
            <Popup>
              {src.name} → {tgt.name}<br />Costo: {e.cost}
            </Popup>
          </Polyline>
        )
      })}

      {/* Nodos */}
      {nodes.map(n => (
        <CircleMarker
          key={n.id}
          center={[n.latitude, n.longitude]}
          radius={8}
          pathOptions={{ fillColor: TYPE_COLORS[n.node_type] || '#3b82f6', color: '#fff', weight: 2, fillOpacity: 1 }}
        >
          <Popup>
            <strong>{n.name}</strong><br />
            Tipo: {n.node_type}<br />
            ({n.latitude.toFixed(4)}, {n.longitude.toFixed(4)})
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
