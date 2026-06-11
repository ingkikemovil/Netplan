import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LogOut, Network } from 'lucide-react'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="bg-card border-b border-slate-700 px-6 py-3 flex items-center justify-between">
      <Link to="/dashboard" className="flex items-center gap-2 text-white font-bold text-lg">
        <Network className="text-primary" size={22} />
        Netplan
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-slate-400 text-sm">{user?.email}</span>
        <button onClick={handleLogout} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm">
          <LogOut size={16} />
          Salir
        </button>
      </div>
    </nav>
  )
}
