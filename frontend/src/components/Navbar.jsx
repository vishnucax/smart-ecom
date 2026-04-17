import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStore, faShoppingCart, faUserShield } from '@fortawesome/free-solid-svg-icons'

export default function Navbar({ cartCount }) {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <FontAwesomeIcon icon={faStore} className="text-blue-400 text-2xl" />
        <span className="text-xl font-bold text-white">SmartShop</span>
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/admin/login" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-1">
          <FontAwesomeIcon icon={faUserShield} />
          <span>Admin</span>
        </Link>
        <Link to="/" className="text-gray-300 hover:text-white transition text-sm">Products</Link>
        <Link to="/cart" className="relative text-gray-300 hover:text-white transition text-sm flex items-center gap-2">
          <FontAwesomeIcon icon={faShoppingCart} />
          <span>Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  )
}