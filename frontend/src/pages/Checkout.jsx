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
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Checkout</h1>
        <p className="text-gray-400">Enter your details to place the order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Delivery Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-5">Delivery Details</h2>
          <div className="space-y-4">
            {[
              { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Vishnu K' },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'vishnu@email.com' },
              { label: 'Phone', name: 'phone', type: 'tel', placeholder: '+91 9876543210' },
              { label: 'Address', name: 'address', type: 'text', placeholder: '123, Main Street' },
              { label: 'City', name: 'city', type: 'text', placeholder: 'Palakkad' },
            ].map(field => (
              <div key={field.name}>
                <label className="text-sm text-gray-400 mb-1 block">{field.label}</label>
                <input
                  name={field.name}
                  type={field.type}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800 last:border-0 last:mb-0 last:pb-0">
                <div className="flex items-center gap-3">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.product_name} className="w-12 h-12 object-cover rounded-xl bg-gray-800" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-800 flex items-center justify-center rounded-xl text-gray-600">
                      <FontAwesomeIcon icon={faBox} className="text-xl" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{item.product_name}</p>
                    <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="text-green-400 font-bold">₹{(Number(item.price) * item.quantity).toLocaleString()}</p>
              </div>
            ))}

            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-white">₹{total?.toLocaleString()}</span>
              </div>
              {discountResult && (
                <div className="flex justify-between text-green-400">
                  <span>Discount ({discountResult.discount_percent}%)</span>
                  <span>- ₹{discountResult.discount_amount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl pt-3 border-t border-gray-700">
                <span>Total</span>
                <span className="text-green-400">₹{(finalAmount ?? total)?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-900 border border-red-600 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={placeOrder}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white font-bold py-4 rounded-xl transition text-lg"
          >
            {loading ? (
              <><FontAwesomeIcon icon={faSpinner} spin /> Placing Order...</>
            ) : (
              <><FontAwesomeIcon icon={faCheckCircle} /> Place Order</>
            )}
          </button>

          <p className="text-center text-gray-500 text-xs mt-3 flex items-center justify-center gap-1">
            <FontAwesomeIcon icon={faLock} /> Secure checkout powered by SmartShop
          </p>
        </div>
      </div>
    </div>
  )
}
