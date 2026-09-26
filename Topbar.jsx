import React from 'react'
import { Search, Bell, Cloud } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Topbar({ search, onSearch, placeholder = 'Cari file, folder, atau link...' }) {
  const { user } = useAuth()

  return (
    <header className="flex items-center gap-3 px-4 md:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white/80 dark:bg-[#0a0e17]/80 backdrop-blur z-30">
      <div className="flex items-center gap-2 md:hidden">
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm">
          <Cloud className="w-4 h-4" />
        </span>
        <span className="font-bold">MOVE UP</span>
      </div>

      {onSearch && (
        <div className="hidden sm:flex items-center flex-1 max-w-md bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 gap-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={placeholder}
            className="bg-transparent text-sm outline-none w-full placeholder:text-slate-400"
          />
        </div>
      )}

      <div className="ml-auto flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300">
          <Bell className="w-[18px] h-[18px]" />
        </button>
        <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center text-sm font-semibold text-brand-600 dark:text-brand-400 overflow-hidden">
          {user?.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover" /> : user?.name?.[0]}
        </div>
      </div>
    </header>
  )
}
