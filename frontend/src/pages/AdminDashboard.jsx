import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', price: '', quantity: '', image_url: '' })
  const [editingId, setEditingId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!sessionStorage.getItem('adminToken')) {
      navigate('/admin/login')
      return
    }
    fetchProducts()
  }, [])

  const fetchProducts = () => {
    setLoading(true)
    axios.get('http://localhost:5001/inventory')
      .then(res => setProducts(res.data))
      .finally(() => setLoading(false))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      axios.put(`http://localhost:5001/inventory/${editingId}`, { ...form, full_update: true })
        .then(() => {
          fetchProducts()
          setEditingId(null)
          setForm({ name: '', price: '', quantity: '', image_url: '' })
        })
    } else {
      axios.post('http://localhost:5001/inventory', form)
        .then(() => {
          fetchProducts()
          setForm({ name: '', price: '', quantity: '', image_url: '' })
        })
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      axios.delete(`http://localhost:5001/inventory/${id}`)
        .then(() => fetchProducts())
    }
  }

  const handleEdit = (product) => {
    setEditingId(product.id)
    setForm({ name: product.name, price: product.price, quantity: product.quantity, image_url: product.image_url || '' })
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your product inventory</p>
        </div>
        <button 
          onClick={() => { sessionStorage.removeItem('adminToken'); navigate('/admin/login') }}
          className="bg-gray-800 hover:bg-red-500/20 hover:text-red-500 border border-gray-700 px-4 py-2 rounded-xl text-sm transition"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl sticky top-24">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Product Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Smart Watch"
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Price (₹)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="5000"
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Quantity</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="100"
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Image URL (Optional)</label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
                >
                  {editingId ? 'Update Product' : 'Add Product'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => { setEditingId(null); setForm({ name: '', price: '', quantity: '', image_url: '' }) }}
                    className="bg-gray-700 hover:bg-gray-600 px-4 rounded-xl transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading products...</div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Product</th>
                    <th className="px-6 py-4 font-semibold text-right">Price</th>
                    <th className="px-6 py-4 font-semibold text-center">Stock</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-800/30 transition">
                      <td className="px-6 py-4 flex items-center gap-3">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-10 h-10 object-cover rounded-lg bg-gray-800" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-800 flex items-center justify-center rounded-lg text-lg">📦</div>
                        )}
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-gray-500">ID: {product.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-green-400 font-medium">
                        ₹{Number(product.price).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.quantity > 10 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white p-2 rounded-lg transition"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg transition"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-20 text-gray-500">No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
