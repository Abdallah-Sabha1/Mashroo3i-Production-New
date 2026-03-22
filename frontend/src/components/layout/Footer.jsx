import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Mashroo3i
            </span>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">AI-powered business planning for Jordanian entrepreneurs.</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="text-slate-500 hover:text-slate-700 transition-colors">Features</a></li>
              <li><Link to="/register" className="text-slate-500 hover:text-slate-700 transition-colors">Get Started</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="text-slate-500 hover:text-slate-700 transition-colors">About</a></li>
              <li><a href="#" className="text-slate-500 hover:text-slate-700 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-slate-500 hover:text-slate-700 transition-colors">Privacy</a></li>
              <li><a href="#" className="text-slate-500 hover:text-slate-700 transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 mt-10 pt-8">
          <p className="text-xs text-slate-400 text-center">2024 Mashroo3i. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
