import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Cloud, Zap, ShoppingBag, Shield, Moon, Sun } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { isAdmin } from '../lib/api.js'

const items = [
  { to: '/beranda', label: 'Beranda', icon: Home },
  { to: '/stora', label: 'My Stora', icon: Cloud },
  { to: '/settings', label: 'Volt Settings', icon: Zap },
  { to: '/toko', label: 'Toko', icon: ShoppingBag },
]

export default function Sidebar() {
  const { user } = useAuth()
  const { theme, toggle } = useTheme()

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 px-4 py-5">
      <div className="flex items-center gap-2 px-2 mb-8">
        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-lg shadow-glow">☁️</span>
        <span className="font-bold text-lg tracking-tight">MOVE UP</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`
            }
          >
            <Icon className="w-[18px] h-[18px]" />
            {label}
          </NavLink>
        ))}

        {isAdmin(user?.role) && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`
            }
          >
            <Shield className="w-[18px] h-[18px]" />
            Ruang Admin
          </NavLink>
        )}
      </nav>

      <button onClick={toggle} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 mb-2">
        {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </button>

      <div className="flex items-center gap-2.5 px-2 py-2 border-t border-slate-200 dark:border-slate-800 pt-3">
        <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center text-sm font-semibold text-brand-600 dark:text-brand-400 overflow-hidden">
          {user?.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover" /> : user?.name?.[0]}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <p className="text-xs text-slate-400 truncate capitalize">{user?.role}</p>
        </div>
      </div>
    </aside>
  )
}
