import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShieldAlt, faSignInAlt, faSpinner } from '@fortawesome/free-solid-svg-icons'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    axios.post('http://localhost:5001/admin/login', form)
      .then(res => {
        sessionStorage.setItem('adminToken', res.data.token)
        navigate('/admin')
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Login failed')
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in-up">
      <div className="bg-white border border-slate-100 p-10 rounded-3xl w-full max-w-md shadow-xl shadow-slate-200/50 relative overflow-hidden">
        {/* Decorative background shape */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="text-center mb-10 relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
              <FontAwesomeIcon icon={faShieldAlt} className="text-blue-600 text-3xl" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Admin Portal</h1>
          <p className="text-slate-500 font-medium font-sm">Secure access to SmartShop Management</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-medium p-4 rounded-xl mb-6 flex items-center gap-3 relative z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 block"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@gmail.com"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder-slate-400"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all mt-8 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed shadow-md shadow-slate-900/20 hover:shadow-lg hover:-translate-y-1 group"
          >
            {loading ? (
              <><FontAwesomeIcon icon={faSpinner} spin /> Authenticating...</>
            ) : (
              <><FontAwesomeIcon icon={faSignInAlt} className="group-hover:-translate-y-0.5 transition-transform" /> Access Dashboard</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
