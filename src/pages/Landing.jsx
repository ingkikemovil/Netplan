import { Link } from 'react-router-dom'
import { Network, Zap, Shield, BarChart3 } from 'lucide-react'

const features = [
  { icon: Network, title: 'Arbol de Expansion Minima', desc: 'Calcula la red optima usando algoritmos de Kruskal y Prim con NetworkX.' },
  { icon: Shield, title: 'Restricciones Operativas', desc: 'Define conexiones obligatorias o prohibidas antes de calcular.' },
  { icon: Zap, title: 'Carga Masiva Excel', desc: 'Importa nodos y conexiones desde archivos .xlsx en segundos.' },
  { icon: BarChart3, title: 'Visualizacion Interactiva', desc: 'Mapa en tiempo real con Leaflet.js y exportacion a PDF o Excel.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <Network size={48} className="text-primary" />
          <h1 className="text-5xl font-extrabold text-white">Netplan</h1>
        </div>
        <p className="text-xl text-slate-300 max-w-2xl mb-3">
          Plataforma inteligente para la optimizacion de redes mediante Arboles de Expansion Minima
        </p>
        <p className="text-slate-400 max-w-xl mb-10">
          Conecta ciudades, torres y centros de datos al menor costo posible. Ingresa tus nodos,
          define restricciones y obtén la red optima en segundos.
        </p>
        <div className="flex gap-4">
          <Link to="/login" className="btn-primary text-base px-8 py-3">
            Iniciar sesion
          </Link>
          <Link to="/login?mode=signup" className="btn-secondary text-base px-8 py-3">
            Registrarse gratis
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card flex gap-4">
            <div className="shrink-0 bg-primary/20 rounded-lg p-3 h-fit">
              <Icon className="text-primary" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{title}</h3>
              <p className="text-slate-400 text-sm">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stack */}
      <div className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        React + Vite &middot; FastAPI &middot; NetworkX &middot; Supabase &middot; Leaflet.js &middot; Universidad de La Guajira
      </div>
    </div>
  )
}
