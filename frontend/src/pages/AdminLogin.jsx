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
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <FontAwesomeIcon icon={faShieldAlt} className="text-blue-400 text-3xl" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-gray-400 text-sm">Enter your credentials to manage SmartShop</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@gmail.com"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="admin"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition mt-4 disabled:bg-gray-700"
          >
            {loading ? (
              <><FontAwesomeIcon icon={faSpinner} spin /> Verifying...</>
            ) : (
              <><FontAwesomeIcon icon={faSignInAlt} /> Login to Dashboard</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
