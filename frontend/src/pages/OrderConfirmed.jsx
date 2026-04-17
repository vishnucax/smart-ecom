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
    <div className="max-w-3xl mx-auto px-6 py-12 text-center animate-fade-in-up">

      {/* Success Icon */}
      <div className="flex justify-center mb-8 relative">
        <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl scale-150 animate-pulse-soft"></div>
        <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center border-4 border-green-500 shadow-xl shadow-green-500/30 relative z-10">
          <FontAwesomeIcon icon={faStar} className="text-green-500 text-6xl animate-bounce" />
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-3 tracking-tight">Order Confirmed!</h1>
      <p className="text-slate-500 text-lg mb-10">
        Thank you <span className="font-bold text-slate-700">{form?.name}</span>! Your order has been placed successfully.
      </p>

      {/* Order ID */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 mb-8 transform hover:-translate-y-1 transition-transform">
        <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest mb-1">Order ID</p>
        <p className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">#SS-{orderId}</p>
      </div>

      {/* Items Ordered */}
      {items.length > 0 && (
        <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-8 text-left mb-8">
          <h2 className="text-xl font-extrabold mb-6 text-slate-800 border-b border-slate-100 pb-4">Items Ordered</h2>
          <div className="space-y-4">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between items-center pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 flex items-center justify-center rounded-xl text-slate-400 shadow-inner">
                    <FontAwesomeIcon icon={faBox} className="text-lg" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{item.name}</p>
                    <p className="text-slate-500 text-xs font-medium">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="text-slate-800 font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">₹{Number(item.amount).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Payment Summary */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-8 text-left">
          <h2 className="text-xl font-extrabold mb-6 text-slate-800 border-b border-slate-100 pb-4">Payment Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-medium text-slate-600">
              <span>Original Price</span>
              <span className="text-slate-800">₹{Number(result.original_price).toLocaleString()}</span>
            </div>
            {result.discount_applied > 0 && (
              <div className="flex justify-between text-sm font-medium text-green-600">
                <span>Discount Applied</span>
                <span>- ₹{Number(result.discount_applied).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-lg pt-4 border-t border-slate-100 mt-2">
              <span className="text-slate-800">Amount Paid</span>
              <span className="text-blue-600">₹{Number(result.final_amount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-8 text-left">
          <h2 className="text-xl font-extrabold mb-6 text-slate-800 border-b border-slate-100 pb-4">Delivery To</h2>
          <div className="space-y-2 text-sm text-slate-600 font-medium">
            <p className="text-slate-800 font-bold text-base">{form?.name}</p>
            <p className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 bg-slate-300 rounded-full"></div>{form?.address}, {form?.city}</p>
            <p className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>{form?.email}</p>
            <p className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>{form?.phone}</p>
          </div>
        </div>
      </div>

      {/* Order Status Tracker */}
      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 mb-10 shadow-inner">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-8">Order Status Tracker</h3>
        <div className="flex justify-center items-center gap-1 sm:gap-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-2 relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all shadow-sm relative z-10
                  ${step.done ? 'bg-green-500 text-white shadow-green-500/30' : 'bg-white border-2 border-slate-200 text-slate-300'}`}>
                  <FontAwesomeIcon icon={step.icon} />
                </div>
                <span className={`text-xs font-bold absolute -bottom-6 w-20 text-center ${step.done ? 'text-green-600' : 'text-slate-400'}`}>{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-1.5 rounded-full mb-6 mx-1 sm:mx-2 transition-colors ${steps[i+1].done ? 'bg-green-500' : 'bg-slate-200'}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center justify-center bg-slate-900 hover:bg-black text-white font-bold py-5 px-12 rounded-full transition-all shadow-md shadow-slate-900/20 hover:shadow-lg hover:-translate-y-1 mb-8 tracking-wide gap-2 group"
      >
        Continue Shopping
      </button>
    </div>
  )
}
