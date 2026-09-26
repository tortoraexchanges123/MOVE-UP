import React from 'react'
import { Users, UserCheck, UserX, HardDrive, FileText, ShoppingCart, Trophy, Clock } from 'lucide-react'
import { api } from '../../lib/api.js'
import { formatBytes, timeAgo } from '../../lib/format.js'

export default function AdminDashboard() {
  const stats = api.dashboardStats()

  const cards = [
    { label: 'Total User', value: stats.totalUsers, icon: Users, color: 'text-brand-500 bg-brand-500/10' },
    { label: 'User Aktif', value: stats.activeUsers, icon: UserCheck, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'User Nonaktif', value: stats.inactiveUsers, icon: UserX, color: 'text-rose-500 bg-rose-500/10' },
    { label: 'Total Storage', value: formatBytes(stats.totalStorageUsed), icon: HardDrive, color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Total File', value: stats.totalFiles, icon: FileText, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Total Transaksi', value: stats.totalTransactions, icon: ShoppingCart, color: 'text-pink-500 bg-pink-500/10' },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 ${c.color}`}>
              <c.icon className="w-[18px] h-[18px]" />
            </div>
            <p className="text-xl font-bold">{c.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold">Produk Terlaris</h3>
          </div>
          {stats.bestProduct ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-lg">{stats.bestProduct.emoji}</div>
              <div>
                <p className="text-sm font-medium">{stats.bestProduct.name}</p>
                <p className="text-xs text-slate-400">{stats.bestProduct.price} koin</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Belum ada transaksi.</p>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold">Log Keamanan / Aktivitas Terbaru</h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {stats.recentLogs.length === 0 && <p className="text-sm text-slate-400">Belum ada aktivitas.</p>}
            {stats.recentLogs.map((l) => (
              <div key={l.id} className="text-sm border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0">
                <span className="capitalize font-medium">{l.action.replace('_', ' ')}</span>{' '}
                <span className="text-slate-400">{l.detail}</span>
                <p className="text-xs text-slate-400">{timeAgo(l.at)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
