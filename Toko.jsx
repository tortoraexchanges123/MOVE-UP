import React, { useMemo, useState } from 'react'
import { Coins } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'
import { useToast } from '../context/ToastContext.jsx'
import Topbar from '../components/Topbar.jsx'

const CATS = [
  { key: 'notif', label: 'Efek Notifikasi' },
  { key: 'sampah', label: 'Efek Sampah' },
  { key: 'tema', label: 'Tema' },
]

export default function Toko() {
  const { user, refresh } = useAuth()
  const { push } = useToast()
  const [cat, setCat] = useState('notif')
  const [tick, setTick] = useState(0)

  const products = api.listProducts().filter((p) => p.type === cat)
  const owned = useMemo(() => new Set(api.listCollection(user.id).map((c) => c.productId)), [user, tick])

  function buy(p) {
    try {
      api.buyProduct(user.id, p.id)
      push(`${p.name} berhasil dibeli!`)
      setTick((t) => t + 1)
      refresh()
    } catch (e) {
      push(e.message, 'error')
    }
  }

  return (
    <div>
      <Topbar />
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Toko</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Beli efek, tema, dan item keren lainnya.</p>
          </div>
          <div className="flex items-center gap-2 card !rounded-xl px-4 py-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-sm">{user.coins}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {CATS.map((c) => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium ${cat === c.key ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => {
            const isOwned = owned.has(p.id)
            return (
              <div key={p.id} className="card p-4 flex flex-col">
                <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center text-4xl mb-3">
                  {p.emoji}
                </div>
                <p className="font-semibold text-sm mb-1">{p.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex-1">{p.description}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                    <Coins className="w-4 h-4" /> {p.price}
                  </span>
                  <button
                    disabled={isOwned}
                    onClick={() => buy(p)}
                    className={isOwned ? 'btn-secondary !px-3 !py-1.5 text-xs cursor-default' : 'btn-primary !px-3 !py-1.5 text-xs'}
                  >
                    {isOwned ? 'Dimiliki' : 'Beli'}
                  </button>
                </div>
              </div>
            )
          })}
          {products.length === 0 && <p className="text-sm text-slate-400 col-span-full text-center py-10">Belum ada produk di kategori ini.</p>}
        </div>
      </div>
    </div>
  )
}
