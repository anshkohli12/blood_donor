import { Link, useLocation } from "react-router-dom"
import { Heart } from "lucide-react"

const AuthLayout = ({ children }) => {
  const location = useLocation()
  const isLogin = location.pathname === '/login'
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className={`w-full ${isLogin ? 'max-w-md' : 'max-w-2xl'}`}>
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-slate-700 hover:text-blood-crimson transition-colors">
            <Heart className="h-8 w-8 fill-current text-blood-crimson" />
            <span className="text-2xl font-bold font-montserrat">Blood Donor Network</span>
          </Link>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">{children}</div>
      </div>
    </div>
  )
}

export default AuthLayout
