import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBox, faCheckCircle, faSpinner, faLock, faArrowRight } from '@fortawesome/free-solid-svg-icons'

export default function Checkout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { cart, total, discountCode, discountResult, finalAmount } = location.state || {}
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', phone: '' })

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const placeOrder = async () => {
    if (!form.name || !form.email || !form.address || !form.city || !form.phone) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    setError('')

    try {
      const paymentPromises = cart.map(item =>
        axios.post('http://localhost:5004/payment', {
          product_id: item.product_id,
          quantity: item.quantity,
          ...(discountCode && { discount_code: discountCode }),
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          customer_address: form.address,
          customer_city: form.city
        })
      )

      const results = await Promise.all(paymentPromises)
      
      // Clear cart on backend
      await axios.delete('http://localhost:5002/cart')

      const aggregatedResult = {
        items: cart.map((item, i) => ({
          name: results[i].data.product,
          quantity: results[i].data.quantity,
          amount: results[i].data.final_amount
        })),
        original_price: total,
        discount_applied: discountResult ? discountResult.discount_amount : 0,
        final_amount: finalAmount
      }

      navigate('/order-confirmed', { state: { result: aggregatedResult, form } })
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Payment failed. Please try again.')
      setLoading(false)
    }
  }

  if (!cart) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg mb-4">No order found.</p>
        <button onClick={() => navigate('/')} className="bg-blue-600 text-white py-2 px-6 rounded-xl">Go Shopping</button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in-up">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold mb-3 text-slate-800 tracking-tight">Checkout</h1>
        <p className="text-slate-500 text-lg">Enter your details to complete your order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Delivery Form */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-3">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
              Delivery Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Vishnu K', full: false },
                { label: 'Email Address', name: 'email', type: 'email', placeholder: 'vishnu@email.com', full: false },
                { label: 'Phone Number', name: 'phone', type: 'tel', placeholder: '+91 9876543210', full: false },
                { label: 'City', name: 'city', type: 'text', placeholder: 'Palakkad', full: false },
                { label: 'Delivery Address', name: 'address', type: 'text', placeholder: '123, Main Street, Apartment 4B', full: true },
              ].map(field => (
                <div key={field.name} className={field.full ? 'md:col-span-2' : ''}>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">{field.label}</label>
                  <input
                    name={field.name}
                    type={field.type}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 mb-6 shadow-sm sticky top-28">
            <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-3">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Order Overview
            </h2>
            
            <div className="max-h-[300px] overflow-y-auto pr-2 mb-6 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between pb-4 border-b border-slate-200 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name} className="w-14 h-14 object-cover rounded-xl bg-white shadow-sm" />
                    ) : (
                      <div className="w-14 h-14 bg-white shadow-sm flex items-center justify-center rounded-xl text-slate-300">
                        <FontAwesomeIcon icon={faBox} className="text-xl" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-800 text-sm line-clamp-1">{item.product_name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-slate-800 font-bold text-sm bg-white px-2 py-1 rounded-lg border border-slate-100">
                    ₹{(Number(item.price) * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between text-slate-600 text-sm font-medium">
                <span>Subtotal</span>
                <span className="text-slate-800">₹{total?.toLocaleString()}</span>
              </div>
              {discountResult && (
                <div className="flex justify-between text-green-600 text-sm font-medium">
                  <span>Discount ({discountResult.discount_percent}%)</span>
                  <span>- ₹{discountResult.discount_amount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-slate-100">
                <span className="text-slate-800">Total Payable</span>
                <span className="text-blue-600 text-xl">₹{(finalAmount ?? total)?.toLocaleString()}</span>
              </div>
            </div>

            {error && (
              <div className="mt-6 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                {error}
              </div>
            )}

            <button
              onClick={placeOrder}
              disabled={loading}
              className="w-full mt-6 flex items-center justify-center gap-3 bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-slate-900/20 hover:shadow-lg hover:-translate-y-1 text-lg group"
            >
              {loading ? (
                <><FontAwesomeIcon icon={faSpinner} spin /> Processing...</>
              ) : (
                <>Confirm & Pay <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>

            <p className="text-center text-slate-400 text-xs mt-6 flex items-center justify-center gap-1.5 font-medium">
              <FontAwesomeIcon icon={faLock} className="text-slate-300" /> Secure checkout with SSL encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
