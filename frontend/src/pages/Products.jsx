import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBox, faCartPlus, faBolt, faShoppingCart, faCheckCircle, faSearch, faSortAmountDown, faSortAmountUp } from '@fortawesome/free-solid-svg-icons'

export default function Products({ setCartCount }) {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [addedMap, setAddedMap] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('none') // 'none', 'low', 'high'
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('http://localhost:5001/inventory')
      .then(res => { 
        setProducts(res.data); 
        setFilteredProducts(res.data);
        setLoading(false) 
      })
      .catch(() => setLoading(false))
  }, [])

  // Search and Sort Logic
  useEffect(() => {
    let result = products.filter(p => p.quantity > 0)
    
    // Filter
    if (searchQuery) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Sort
    if (sortOrder === 'low') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortOrder === 'high') {
      result.sort((a, b) => b.price - a.price)
    }

    setFilteredProducts(result)
  }, [searchQuery, sortOrder, products])

  const addToCart = (product) => {
    axios.post('http://localhost:5002/cart', { product_id: product.id, quantity: 1 })
      .then(() => {
        setAddedMap(prev => ({ ...prev, [product.id]: true }))
        setCartCount(prev => prev + 1)
        setTimeout(() => setAddedMap(prev => ({ ...prev, [product.id]: false })), 2000)
      })
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-5xl font-extrabold mb-3 text-slate-800 tracking-tight">Our Products</h1>
          <p className="text-slate-500 text-lg">Premium electronics and gadgets at your fingertips</p>
        </div>
        
        {/* Search and Filter UI */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
          <div className="relative group w-full sm:w-auto">
            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder-slate-400"
            />
          </div>
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer text-slate-700 appearance-none pr-10 relative w-full sm:w-auto"
            style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="none" viewBox="0 0 24 24" stroke="%2394a3b8"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
          >
            <option value="none">Sort by: Relevancy</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm animate-pulse">
              <div className="h-56 bg-slate-100 rounded-2xl mb-6"></div>
              <div className="h-5 bg-slate-200 rounded-full mb-3 w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded-full mb-3 w-1/2"></div>
              <div className="h-10 bg-slate-100 rounded-xl mt-6"></div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-24 bg-white border border-slate-100 rounded-3xl shadow-sm">
           <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-50 rounded-full mb-6">
             <FontAwesomeIcon icon={faBox} className="text-4xl text-slate-300" />
           </div>
           <h3 className="text-2xl font-bold text-slate-700 mb-2">No products found</h3>
           <p className="text-slate-500 text-lg mb-6">We couldn't find anything matching "{searchQuery}"</p>
           <button onClick={() => setSearchQuery('')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-6 rounded-xl transition-colors">
             Clear search
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
              {product.image_url ? (
                <div className="h-56 mb-5 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center relative shadow-inner">
                  <img src={product.image_url} alt={product.name} className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                </div>
              ) : (
                <div className="h-56 mb-5 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 shadow-inner group-hover:bg-slate-100 transition-colors">
                  <FontAwesomeIcon icon={faBox} className="text-6xl group-hover:scale-110 transition-transform duration-300" />
                </div>
              )}
              
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h2 className="text-lg font-bold text-slate-800 line-clamp-2 leading-tight">{product.name}</h2>
                </div>
                
                <div className="mt-auto pt-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="text-2xl font-extrabold text-blue-600">₹{Number(product.price).toLocaleString()}</p>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-5 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${product.quantity > 5 ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></span>
                    {product.quantity} in stock
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(product)}
                      disabled={addedMap[product.id]}
                      className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3 px-3 rounded-xl transition-all duration-300 text-sm ${
                        addedMap[product.id] 
                          ? 'bg-green-500 text-white shadow-md shadow-green-500/20' 
                          : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700'
                      }`}
                    >
                      <FontAwesomeIcon icon={addedMap[product.id] ? faCheckCircle : faCartPlus} className={addedMap[product.id] ? 'animate-bounce' : ''} />
                    </button>
                    <button
                      onClick={() => { addToCart(product); setTimeout(() => navigate('/cart'), 500) }}
                      className="flex-[2] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 active:scale-95 text-sm"
                    >
                      <FontAwesomeIcon icon={faBolt} />
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-16 text-center">
        <button
          onClick={() => navigate('/cart')}
          className="inline-flex items-center gap-3 bg-slate-900 hover:bg-black text-white font-bold py-5 px-12 rounded-full transition-all hover:shadow-xl hover:-translate-y-1 group"
        >
          <FontAwesomeIcon icon={faShoppingCart} className="group-hover:animate-bounce" />
          <span className="tracking-wide">Proceed to Cart</span>
        </button>
      </div>
    </div>
  )
}