import React from 'react'
import { NavLink, Navigate, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, Store } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { isAdmin } from '../../lib/api.js'
import Topbar from '../../components/Topbar.jsx'

const tabs = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Data User & Admin', icon: Users },
  { to: '/admin/toko', label: 'Bos Toko', icon: Store },
]

export default function AdminLayout() {
  const { user } = useAuth()
  if (!isAdmin(user?.role)) return <Navigate to="/beranda" replace />

  return (
    <div>
      <Topbar />
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Ruang Admin</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Kelola data user, admin, dan sistem.</p>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  isActive ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`
              }
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </NavLink>
          ))}
        </div>

        <Outlet />
      </div>
    </div>
  )
}
