import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#534AB7]"></div>
          <span className="font-medium text-gray-900">CampusConnect</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              isActive("/")
                ? "bg-[#EEEDFE] text-[#3C3489] font-medium"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Marketplace
          </Link>
          <Link
            to="/create-listing"
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              isActive("/create-listing")
                ? "bg-[#EEEDFE] text-[#3C3489] font-medium"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Sell item
          </Link>
          <Link
            to="/notes"
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                isActive("/notes")
                ? "bg-[#EEEDFE] text-[#3C3489] font-medium"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
            >
            Notes
          </Link>
          <Link to="/profile">
            <div className="w-8 h-8 rounded-full bg-[#534AB7] flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity">
                {user?.name?.charAt(0).toUpperCase()}
            </div>
          </Link>
          <Link
            to="/lending"
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                isActive("/lending")
                ? "bg-[#EEEDFE] text-[#3C3489] font-medium"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
            >
            Lending
            </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <span className="text-xs bg-[#E1F5EE] text-[#085041] px-2.5 py-1 rounded-full font-medium hidden sm:block">
            {user?.college || "SVNIT Surat"}
          </span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#534AB7] flex items-center justify-center text-white text-xs font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

      </div>
    </nav>
  )
}