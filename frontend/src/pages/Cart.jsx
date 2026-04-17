import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBox, faTrash, faArrowRight, faTag, faShoppingCart } from '@fortawesome/free-solid-svg-icons'

export default function Cart({ setCartCount }) {
  const [cart, setCart] = useState([])
  const [total, setTotal] = useState(0)
  const [discountCode, setDiscountCode] = useState('')
  const [discountResult, setDiscountResult] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = () => {
    axios.get('http://localhost:5002/cart')
      .then(res => {
        setCart(res.data.cart_items)
        setTotal(res.data.total)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  const handleRemove = (id) => {
    axios.delete(`http://localhost:5002/cart/${id}`)
      .then(() => {
        fetchCart()
        setCartCount(prev => Math.max(0, prev - 1))
      })
  }

  const applyDiscount = () => {
    if (!discountCode) return
    axios.post('http://localhost:5003/discount', { code: discountCode, original_price: total })
      .then(res => {
        if (res.data.discount_percent === 0) {
          setMessage({ text: 'Invalid discount code', type: 'error' })
          setDiscountResult(null)
        } else {
          setDiscountResult(res.data)
          setMessage({ text: `${discountCode} applied — ${res.data.discount_percent}% off!`, type: 'success' })
        }
      })
      .catch(err => {
        console.error('Discount apply error:', err)
        setMessage({ text: 'Error connecting to discount service', type: 'error' })
        setDiscountResult(null)
      })
  }

  const finalAmount = discountResult ? discountResult.final_price : total

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in-up">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-3 text-slate-800 tracking-tight">Your Cart</h1>
        <p className="text-slate-500 text-lg">Review your items before checkout</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : cart.length === 0 ? (
        <div className="text-center py-24 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-50 rounded-full mb-6">
            <FontAwesomeIcon icon={faShoppingCart} className="text-4xl text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-700 mb-2">Your cart is empty</h3>
          <p className="text-slate-500 text-lg mb-8">Looks like you haven't added anything yet.</p>
          <button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full transition-all shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-1">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Cart Items */}
          <div className="lg:w-2/3 space-y-6">
            {cart.map((item, index) => (
              <div key={item.id} 
                   className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow group"
                   style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-center gap-5 w-full sm:w-auto">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.product_name} className="w-24 h-24 object-cover rounded-2xl bg-slate-50 shadow-inner group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-24 h-24 bg-slate-50 flex items-center justify-center rounded-2xl text-slate-300 shadow-inner">
                      <FontAwesomeIcon icon={faBox} className="text-3xl" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-slate-800 mb-1">{item.product_name}</h3>
                    <p className="text-slate-500 text-sm mb-1 font-medium bg-slate-100 inline-block px-3 py-1 rounded-lg">Qty: {item.quantity}</p>
                    <p className="text-slate-500 text-sm">₹{Number(item.price).toLocaleString()} each</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-8 border-t border-slate-100 sm:border-0 pt-4 sm:pt-0">
                  <p className="text-blue-600 font-extrabold text-2xl">
                    ₹{(Number(item.price) * item.quantity).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-3 rounded-xl transition-colors shadow-sm"
                    title="Remove item"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <button onClick={() => navigate('/')} className="text-slate-500 hover:text-blue-600 font-semibold transition-colors flex items-center gap-2 group">
                <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Continue Shopping
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white border border-slate-100 rounded-3xl p-8 sticky top-28 shadow-sm">
              <h2 className="text-2xl font-extrabold mb-6 text-slate-800 tracking-tight">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal</span>
                  <span className="text-slate-800">₹{total.toLocaleString()}</span>
                </div>
                {discountResult && (
                  <div className="flex justify-between text-green-600 font-medium bg-green-50 p-3 rounded-xl">
                    <span>Discount ({discountResult.discount_percent}%)</span>
                    <span>- ₹{discountResult.discount_amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-xl pt-6 border-t border-slate-100">
                  <span className="text-slate-800">Total</span>
                  <span className="text-blue-600">₹{finalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Discount Code */}
              <div className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faTag} className="text-blue-500" /> Have a coupon?
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="e.g. NEWYEAR"
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-slate-400 uppercase tracking-widest text-slate-700"
                  />
                  <button
                    onClick={applyDiscount}
                    className="bg-slate-800 hover:bg-black text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors shadow-md shadow-slate-800/10"
                  >
                    Apply
                  </button>
                </div>
                {message.text && (
                  <p className={`text-sm mt-3 font-medium flex items-center gap-2 ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${message.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}></span>
                    {message.text}
                  </p>
                )}
              </div>

              <button
                onClick={() => navigate('/checkout', { state: { cart, total, discountCode: discountResult ? discountCode : null, discountResult, finalAmount } })}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 px-6 rounded-2xl transition-all shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-1 group tracking-wide"
              >
                Proceed to Checkout <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}