import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('http://localhost:5001/inventory')
      .then(res => {
        setProducts(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const addToCart = (product) => {
    axios.post('http://localhost:5002/cart', {
      product_id: product.id,
      quantity: 1
    })
    .then(() => {
      setMessage(`✅ ${product.name} added to cart!`)
      setTimeout(() => setMessage(''), 3000)
    })
    .catch(() => setMessage('❌ Failed to add to cart'))
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in-up">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-3">Inventory</h1>
        <p className="text-slate-500 font-medium text-lg">Browse available products</p>
      </div>

      {message && (
        <div className="mb-8 px-5 py-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 font-bold flex items-center justify-center md:justify-start gap-3 shadow-sm transform transition-all">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-500">
           <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
           <p className="font-bold text-lg">Loading products...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <div key={product.id} className="bg-white border border-slate-100 rounded-3xl p-8 transition-all hover:shadow-xl hover:-translate-y-1 group">
              <div className="text-5xl mb-6 bg-slate-50 w-24 h-24 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                {product.name === 'Laptop' ? '💻' : product.name === 'Phone' ? '📱' : '🎧'}
              </div>
              <h2 className="text-2xl font-extrabold mb-2 text-slate-800">{product.name}</h2>
              <p className="text-blue-600 text-xl font-black mb-2">₹{Number(product.price).toLocaleString()}</p>
              <p className="text-slate-500 text-sm font-medium mb-6 bg-slate-50 inline-block px-3 py-1 rounded-lg">Stock: {product.quantity} units</p>
              <button
                onClick={() => addToCart(product)}
                disabled={product.quantity === 0}
                className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-slate-900/20"
              >
                {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <button
          onClick={() => navigate('/cart')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full transition-all shadow-md shadow-blue-600/20 hover:shadow-lg hover:-translate-y-1"
        >
          View Cart &rarr;
        </button>
      </div>
    </div>
  )
}