import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStore, faShoppingCart, faUserShield } from '@fortawesome/free-solid-svg-icons'

export default function Navbar({ cartCount }) {
  return (
    <nav className="glass sticky top-0 z-50 px-8 py-4 flex items-center justify-between transition-all duration-300">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:bg-blue-700 transition shadow-sm">
          <FontAwesomeIcon icon={faStore} className="text-xl" />
        </div>
        <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">SmartShop</span>
      </Link>
      <div className="flex items-center gap-8">
        <Link to="/admin/login" className="text-slate-500 hover:text-blue-600 font-medium transition-colors text-sm flex items-center gap-2">
          <FontAwesomeIcon icon={faUserShield} />
          <span>Admin</span>
        </Link>
        <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300 pb-1">Products</Link>
        <Link to="/cart" className="relative text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full">
          <FontAwesomeIcon icon={faShoppingCart} />
          <span>Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white animate-pulse-soft shadow-sm">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  )
}