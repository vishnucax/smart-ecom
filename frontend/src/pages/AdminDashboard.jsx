import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPencilAlt, faTrash, faPlus, faTimes, faSignOutAlt,
  faBox, faCheckCircle, faExclamationCircle, faSpinner,
  faList, faClipboardList, faUser, faPhone, faMapMarkerAlt,
  faCalendarAlt, faHistory
} from '@fortawesome/free-solid-svg-icons'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('inventory') // 'inventory' or 'orders'
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', price: '', quantity: '', image_url: '' })
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!sessionStorage.getItem('adminToken')) {
      navigate('/admin/login')
      return
    }
    if (activeTab === 'inventory') {
      fetchProducts()
    } else {
      fetchOrders()
    }
  }, [activeTab])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchProducts = () => {
    setLoading(true)
    axios.get('http://localhost:5001/inventory')
      .then(res => setProducts(res.data))
      .catch(() => showToast('Failed to load products', 'error'))
      .finally(() => setLoading(false))
  }

  const fetchOrders = () => {
    setLoading(true)
    axios.get('http://localhost:5004/payments')
      .then(res => setOrders(res.data))
      .catch(() => showToast('Failed to load orders', 'error'))
      .finally(() => setLoading(false))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)

    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
      image_url: form.image_url || ''
    }

    if (editingId) {
      axios.put(`http://localhost:5001/inventory/${editingId}`, { ...payload, full_update: true })
        .then(() => {
          fetchProducts()
          setEditingId(null)
          setForm({ name: '', price: '', quantity: '', image_url: '' })
          showToast('Product updated successfully!')
        })
        .catch(err => showToast(err.response?.data?.error || 'Update failed', 'error'))
        .finally(() => setSubmitting(false))
    } else {
      axios.post('http://localhost:5001/inventory', payload)
        .then(() => {
          fetchProducts()
          setForm({ name: '', price: '', quantity: '', image_url: '' })
          showToast('Product added successfully!')
        })
        .catch(err => showToast(err.response?.data?.error || 'Failed to add product', 'error'))
        .finally(() => setSubmitting(false))
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      axios.delete(`http://localhost:5001/inventory/${id}`)
        .then(() => {
          fetchProducts()
          showToast('Product deleted')
        })
        .catch(() => showToast('Delete failed', 'error'))
    }
  }

  const handleEdit = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      image_url: product.image_url || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = () => {
    setEditingId(null)
    setForm({ name: '', price: '', quantity: '', image_url: '' })
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in-up">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-24 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl font-medium transition-all
          ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          <FontAwesomeIcon icon={toast.type === 'success' ? faCheckCircle : faExclamationCircle} />
          {toast.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Manage products and track customer orders</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'inventory' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <FontAwesomeIcon icon={faList} className="mr-2" />
              Inventory
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
              Orders
            </button>
          </div>
          <button
            onClick={() => { sessionStorage.removeItem('adminToken'); navigate('/admin/login') }}
            className="flex items-center justify-center w-full sm:w-auto gap-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            Logout
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-100 p-8 rounded-3xl sticky top-28 shadow-sm">
              <h2 className="text-xl font-extrabold mb-6 flex items-center gap-3 text-slate-800">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                   <FontAwesomeIcon icon={editingId ? faPencilAlt : faPlus} />
                </div>
                {editingId ? 'Edit Product' : 'Add Product'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Product Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Smart Watch"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="5000"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="100"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Image URL (Optional)</label>
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                  />
                </div>

                {/* Image Preview */}
                {form.image_url && (
                  <div className="rounded-2xl overflow-hidden h-40 bg-slate-50 border border-slate-100 shadow-inner">
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="w-full h-full object-contain p-2"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/20 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    {submitting ? (
                      <><FontAwesomeIcon icon={faSpinner} spin /> Saving...</>
                    ) : (
                      <><FontAwesomeIcon icon={editingId ? faPencilAlt : faPlus} />
                        {editingId ? 'Update Product' : 'Add Product'}</>
                    )}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3.5 rounded-xl transition-colors"
                    >
                      <FontAwesomeIcon icon={faTimes} /> Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* List Section */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-500 flex flex-col items-center gap-4 shadow-sm">
                <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-500" />
                <p className="font-medium">Loading inventory...</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Product Info</th>
                        <th className="px-6 py-4 text-right">Price</th>
                        <th className="px-6 py-4 text-center">Stock</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map(product => (
                        <tr key={product.id} className={`hover:bg-slate-50 transition-colors ${editingId === product.id ? 'bg-blue-50/50' : ''}`}>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-14 h-14 object-cover rounded-xl bg-white border border-slate-100 shadow-sm" />
                              ) : (
                                <div className="w-14 h-14 bg-slate-50 border border-slate-100 flex items-center justify-center rounded-xl text-slate-300 shadow-inner">
                                  <FontAwesomeIcon icon={faBox} className="text-xl" />
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-slate-800 text-base">{product.name}</div>
                                <div className="text-xs font-medium text-slate-400 bg-slate-100 inline-block px-2 py-0.5 rounded-md mt-1">ID: {product.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right font-bold text-slate-800 text-lg">
                            ₹{Number(product.price).toLocaleString()}
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                              product.quantity > 10
                                ? 'bg-green-100 text-green-700'
                                : product.quantity > 0
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-red-100 text-red-700'
                            }`}>
                              {product.quantity === 0 ? 'Out of Stock' : `${product.quantity} Units`}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => handleEdit(product)}
                                className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white p-2.5 rounded-xl transition-all shadow-sm"
                                title="Edit"
                              >
                                <FontAwesomeIcon icon={faPencilAlt} />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-2.5 rounded-xl transition-all shadow-sm"
                                title="Delete"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center py-16 text-slate-500 font-medium">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <FontAwesomeIcon icon={faBox} className="text-2xl text-slate-300" />
                            </div>
                            No products in inventory. Add one to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Orders Section */
        <div className="space-y-6">
          {loading ? (
             <div className="bg-white border border-slate-100 rounded-3xl p-20 text-center text-slate-500 flex flex-col items-center gap-4 shadow-sm">
                <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-500" />
                <p className="font-medium">Loading customer orders...</p>
              </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Order Detail</th>
                      <th className="px-6 py-4">Customer Info</th>
                      <th className="px-6 py-4 text-right">Payment</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {orders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-xl text-blue-600 shadow-inner">
                                <FontAwesomeIcon icon={faHistory} className="text-lg" />
                              </div>
                              <div className="space-y-1">
                                 <div className="font-bold text-slate-800 text-sm">{order.product_name}</div>
                                 <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-400" /> 
                                    {new Date(order.created_at).toLocaleDateString()}
                                 </div>
                                 <div className="text-xs font-bold text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded pl-1.5 pr-1.5">Qty: {order.quantity}</div>
                              </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="space-y-1.5">
                              <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                 <FontAwesomeIcon icon={faUser} className="text-slate-400 text-xs" />
                                 {order.customer_name}
                              </div>
                              <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
                                 <FontAwesomeIcon icon={faMapMarkerAlt} className="text-slate-400" />
                                 {order.customer_city}
                              </div>
                              <div className="text-xs font-medium text-slate-400 bg-slate-100 inline-block px-2 py-1 rounded">
                                 {order.customer_email}
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <div className="font-black text-slate-800 text-lg mb-1">₹{Number(order.final_amount).toLocaleString()}</div>
                           {Number(order.discount_applied) > 0 && (
                             <div className="text-xs font-bold text-green-600 bg-green-50 inline-block px-2 py-0.5 rounded">Disc: ₹{Number(order.discount_applied).toLocaleString()}</div>
                           )}
                        </td>
                        <td className="px-6 py-5 text-center">
                           <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                              {order.status}
                           </span>
                        </td>
                      </tr>
                     ))}
                     {orders.length === 0 && (
                       <tr>
                          <td colSpan="4" className="text-center py-20 text-slate-500 font-medium">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <FontAwesomeIcon icon={faClipboardList} className="text-2xl text-slate-300" />
                            </div>
                            No orders found yet.
                          </td>
                       </tr>
                     )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
