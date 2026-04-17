import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle, faBox, faBoxOpen, faTruck, faHome, faStar
} from '@fortawesome/free-solid-svg-icons'

export default function OrderConfirmed() {
  const location = useLocation()
  const navigate = useNavigate()
  const { result, form } = location.state || {}
  const [orderId] = useState(() => Math.floor(Math.random() * 900000) + 100000)

  useEffect(() => {
    if (!result) navigate('/')
  }, [])

  if (!result) return null

  const items = result.items || []

  const steps = [
    { icon: faCheckCircle, label: 'Placed', done: true },
    { icon: faBoxOpen, label: 'Packing', done: false },
    { icon: faTruck, label: 'Shipping', done: false },
    { icon: faHome, label: 'Delivered', done: false },
  ]

  return (
    <div className="max-w-2xl mx-auto px-8 py-10 text-center">

      {/* Success Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center border-2 border-green-500">
          <FontAwesomeIcon icon={faStar} className="text-green-400 text-5xl" />
        </div>
      </div>

      <h1 className="text-4xl font-bold text-green-400 mb-2">Order Confirmed!</h1>
      <p className="text-gray-400 mb-8">
        Thank you {form?.name}! Your order has been placed successfully.
      </p>

      {/* Order ID */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6">
        <p className="text-gray-400 text-sm">Order ID</p>
        <p className="text-2xl font-bold text-blue-400">#SS-{orderId}</p>
      </div>

      {/* Items Ordered */}
      {items.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-left mb-6">
          <h2 className="text-xl font-bold mb-4">Items Ordered</h2>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between items-center pb-3 border-b border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-800 flex items-center justify-center rounded-lg text-gray-500">
                    <FontAwesomeIcon icon={faBox} />
                  </div>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="text-green-400 font-bold">₹{Number(item.amount).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Summary */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-left mb-6">
        <h2 className="text-xl font-bold mb-4">Payment Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Original Price</span>
            <span>₹{Number(result.original_price).toLocaleString()}</span>
          </div>
          {result.discount_applied > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Discount Applied</span>
              <span>- ₹{Number(result.discount_applied).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-700">
            <span>Amount Paid</span>
            <span className="text-green-400">₹{Number(result.final_amount).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Delivery Details */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-left mb-8">
        <h2 className="text-xl font-bold mb-4">Delivery To</h2>
        <div className="space-y-1 text-gray-300">
          <p className="font-semibold">{form?.name}</p>
          <p>{form?.address}, {form?.city}</p>
          <p>{form?.email}</p>
          <p>{form?.phone}</p>
        </div>
      </div>

      {/* Order Status Tracker */}
      <div className="flex justify-center items-center gap-2 mb-8">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                ${step.done ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                <FontAwesomeIcon icon={step.icon} />
              </div>
              <span className="text-xs text-gray-400">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-12 h-1 bg-gray-700 mb-4 mx-1"></div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/')}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-xl transition"
      >
        Continue Shopping
      </button>
    </div>
  )
}
