import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Cloud, Zap, ShoppingBag, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { isAdmin } from '../lib/api.js'

const items = [
  { to: '/beranda', label: 'Beranda', icon: Home },
  { to: '/stora', label: 'My Stora', icon: Cloud },
  { to: '/settings', label: 'Volt', icon: Zap },
  { to: '/toko', label: 'Toko', icon: ShoppingBag },
]

export default function BottomNav() {
  const { user } = useAuth()
  const nav = isAdmin(user?.role) ? [...items, { to: '/admin', label: 'Admin', icon: Shield }] : items

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0d1220]/90 backdrop-blur border-t border-slate-200 dark:border-slate-800 flex justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {nav.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[11px] font-medium ${
              isActive ? 'text-brand-500' : 'text-slate-400'
            }`
          }
        >
          <Icon className="w-5 h-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
