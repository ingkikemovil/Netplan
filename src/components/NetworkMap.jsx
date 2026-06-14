import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const TYPE_COLORS = { city: '#3b82f6', tower: '#f59e0b', datacenter: '#10b981', other: '#8b5cf6' }
const CONN_COLORS = { normal: '#64748b', mandatory: '#22c55e', forbidden: '#ef4444' }

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      // Solo disparar si no se hizo clic en un marker (Popup abierto o CircleMarker)
      if (!e.originalEvent._stopped) {
        onMapClick(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

function AutoZoom({ nodes }) {
  const map = useMap()
  const prevLen = useRef(0)

  useEffect(() => {
    if (nodes.length === 0) return
    if (nodes.length === 1 && prevLen.current === 0) {
      // Primer nodo: centrar y hacer zoom
      map.setView([nodes[0].latitude, nodes[0].longitude], 10, { animate: true })
    } else if (nodes.length > prevLen.current) {
      // Nodo adicional: solo re-centrar sin cambiar zoom
      const lat = nodes.reduce((s, n) => s + n.latitude, 0) / nodes.length
      const lng = nodes.reduce((s, n) => s + n.longitude, 0) / nodes.length
      map.setView([lat, lng], map.getZoom(), { animate: true })
    }
    prevLen.current = nodes.length
  }, [nodes.length])

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
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Hint cuando no hay nodos */}
      {nodes.length === 0 && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          background: 'rgba(15,23,42,0.88)',
          color: '#94a3b8',
          padding: '12px 20px',
          borderRadius: 8,
          fontSize: 13,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          border: '1px solid #334155',
        }}>
          📍 Haz clic en el mapa para agregar un nodo
        </div>
      )}

      <MapContainer
        center={center}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        key="netplan-map"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <AutoZoom nodes={nodes} />
        {onMapClick && <ClickHandler onMapClick={onMapClick} />}

        {/* Conexiones normales */}
        {!showMst && connections.map(c => {
          const src = nodeMap[c.source_node_id]
          const tgt = nodeMap[c.target_node_id]
          if (!src || !tgt) return null
          return (
            <Polyline
              key={c.id}
              positions={[[src.latitude, src.longitude], [tgt.latitude, tgt.longitude]]}
              pathOptions={{
                color: CONN_COLORS[c.conn_type] || '#64748b',
                weight: c.conn_type === 'mandatory' ? 3 : 1.5,
                dashArray: c.conn_type === 'forbidden' ? '6 4' : null,
                opacity: 0.7,
              }}
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
              key={`mst-${i}`}
              positions={[[src.latitude, src.longitude], [tgt.latitude, tgt.longitude]]}
              pathOptions={{ color: e.conn_type === 'mandatory' ? '#22c55e' : '#2563eb', weight: 4, opacity: 0.9 }}
            >
              <Popup>{src.name} → {tgt.name}<br />Costo: {e.cost}</Popup>
            </Polyline>
          )
        })}

        {/* Nodos */}
        {nodes.map(n => (
          <CircleMarker
            key={n.id}
            center={[n.latitude, n.longitude]}
            radius={9}
            pathOptions={{ fillColor: TYPE_COLORS[n.node_type] || '#3b82f6', color: '#fff', weight: 2, fillOpacity: 1 }}
            eventHandlers={{
              click: (e) => {
                // Marcar el evento para que ClickHandler no lo procese
                e.originalEvent._stopped = true
              }
            }}
          >
            <Popup>
              <strong>{n.name}</strong><br />
              Tipo: {n.node_type}<br />
              ({n.latitude.toFixed(4)}, {n.longitude.toFixed(4)})
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
