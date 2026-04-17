import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Products({ setCartCount }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [addedMap, setAddedMap] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('http://localhost:5001/inventory')
      .then(res => { setProducts(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const addToCart = (product) => {
    axios.post('http://localhost:5002/cart', { product_id: product.id, quantity: 1 })
      .then(() => {
        setAddedMap(prev => ({ ...prev, [product.id]: true }))
        setCartCount(prev => prev + 1)
        setTimeout(() => setAddedMap(prev => ({ ...prev, [product.id]: false })), 2000)
      })
  }



  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Our Products</h1>
        <p className="text-gray-400">Browse and add items to your cart</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse">
              <div className="h-24 bg-gray-800 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-800 rounded mb-2"></div>
              <div className="h-4 bg-gray-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.filter(p => p.quantity > 0).map(product => (
            <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col hover:border-gray-600 transition">
              {product.image_url ? (
                <div className="h-48 mb-4 rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center">
                  <img src={product.image_url} alt={product.name} className="object-cover h-full w-full" />
                </div>
              ) : (
                <div className="h-48 mb-4 rounded-xl bg-gray-800 flex items-center justify-center text-6xl">
                  📦
                </div>
              )}
              <h2 className="text-xl font-bold mt-2 mb-1">{product.name}</h2>
              <p className="text-green-400 text-2xl font-bold mb-1">₹{Number(product.price).toLocaleString()}</p>
              <p className="text-gray-500 text-sm mb-6">
                {product.quantity} in stock
              </p>
              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => addToCart(product)}
                  disabled={addedMap[product.id]}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-2 px-4 rounded-xl transition text-sm"
                >
                  {addedMap[product.id] ? '✅ Added!' : 'Add to Cart'}
                </button>
                <button
                  onClick={() => { addToCart(product); setTimeout(() => navigate('/cart'), 500) }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-2 px-4 rounded-xl transition text-sm"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <button
          onClick={() => navigate('/cart')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition"
        >
          View Cart 🛍️
        </button>
      </div>
    </div>
  )
}