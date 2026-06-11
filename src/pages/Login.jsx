import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { Network } from 'lucide-react'

export default function Login() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { if (user) navigate('/dashboard') }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/dashboard')
      } else {
        const { error } = await signUp(email, password, name)
        if (error) throw error
        toast.success('Cuenta creada. Revisa tu correo para confirmar.')
      }
    } catch (err) {
      toast.error(err.message || 'Error de autenticacion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <Network className="text-primary" size={28} />
          <span className="text-2xl font-bold text-white">Netplan</span>
        </div>

        <h2 className="text-xl font-semibold text-white mb-6">
          {mode === 'login' ? 'Iniciar sesion' : 'Crear cuenta'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="label">Nombre completo</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          <div>
            <label className="label">Correo electronico</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Contrasena</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <button type="submit" className="btn-primary w-full py-3 mt-2" disabled={loading}>
            {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          {mode === 'login' ? 'No tienes cuenta? ' : 'Ya tienes cuenta? '}
          <button
            className="text-primary hover:underline"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? 'Registrate' : 'Inicia sesion'}
          </button>
        </p>

        <div className="mt-4 text-center">
          <Link to="/" className="text-slate-500 text-xs hover:text-slate-300">Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}
