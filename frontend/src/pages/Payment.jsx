import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Payment() {
  const location = useLocation()
  const navigate = useNavigate()
  const { cart, total, discountCode, discountResult } = location.state || {}
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const finalAmount = discountResult ? discountResult.final_price : total

  const processPayment = () => {
    if (!cart || cart.length === 0) return
    setLoading(true)

    const paymentPromises = cart.map(item =>
      axios.post('http://localhost:5004/payment', {
        product_id: item.product_id,
        quantity: item.quantity,
        ...(discountCode && { discount_code: discountCode })
      })
    )

    Promise.all(paymentPromises)
      .then(() => {
        axios.delete('http://localhost:5002/cart').then(() => {
          setResult({
            multiple: true,
            original_price: total,
            discount_applied: discountResult ? discountResult.discount_amount : 0,
            final_amount: finalAmount
          })
          setLoading(false)
        })
      })
      .catch((err) => {
        console.error(err)
        setError('Payment failed for one or more items. Please try again.')
        setLoading(false)
      })
  }

  if (!cart) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg mb-4">No order found.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          Go to Inventory
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12 animate-fade-in-up">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold mb-2 text-slate-800">Payment</h1>
        <p className="text-slate-500">Review and confirm your order</p>
      </div>

      {!result ? (
        <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-6 text-slate-800">Order Summary</h2>

          <div className="max-h-[300px] overflow-y-auto pr-2 mb-6 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.product_name} className="w-12 h-12 object-cover rounded-xl bg-slate-50 shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-xl text-2xl shadow-inner">📦</div>
                  )}
                  <div>
                    <p className="font-bold text-slate-800 text-sm line-clamp-1">{item.product_name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="text-slate-800 font-bold text-sm bg-white border border-slate-100 px-2 py-1 rounded-lg">₹{(Number(item.price) * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div className="flex justify-between text-slate-600 font-medium text-sm">
              <span>Original Price</span>
              <span className="text-slate-800">₹{total?.toLocaleString()}</span>
            </div>
            {discountResult && (
              <div className="flex justify-between text-green-600 font-medium text-sm">
                <span>Discount ({discountResult.discount_percent}% off)</span>
                <span>- ₹{discountResult.discount_amount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-lg border-t border-slate-200 pt-3 mt-1">
              <span className="text-slate-800">Final Amount</span>
              <span className="text-blue-600 text-xl">₹{finalAmount?.toLocaleString()}</span>
            </div>
          </div>

          {error && (
            <div className="mt-6 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}

          <button
            onClick={processPayment}
            disabled={loading}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-blue-600/20 hover:shadow-lg hover:-translate-y-1 text-lg"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 shadow-xl shadow-green-500/10 rounded-3xl p-10 text-center animate-fade-in-up">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl text-green-500 block animate-bounce">🎉</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Payment Successful!</h2>
          <p className="text-slate-500 mb-8 text-lg">Your order has been placed successfully.</p>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-left space-y-3 mb-8">
            {!result.multiple ? (
              <>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-500">Product</span>
                  <span className="text-slate-800 font-bold">{result.product}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-500">Quantity</span>
                  <span className="text-slate-800 font-bold">{result.quantity}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-500">Items Purchased</span>
                <span className="text-slate-800 font-bold">{cart.length} items</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-medium mt-4">
              <span className="text-slate-500">Original Price</span>
              <span className="text-slate-800 font-bold">₹{result.original_price?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-green-600">
              <span>Discount Applied</span>
              <span className="font-bold">- ₹{result.discount_applied?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-extrabold text-lg border-t border-slate-200 pt-4 mt-2">
              <span className="text-slate-800">Amount Paid</span>
              <span className="text-blue-600">₹{result.final_amount?.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="inline-block bg-slate-900 hover:bg-black text-white font-bold py-4 px-10 rounded-full transition-all shadow-md shadow-slate-900/20 hover:shadow-lg hover:-translate-y-1"
          >
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  )
}