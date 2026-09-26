import React, { useState } from 'react'
import { Pencil, Trash2, Ban, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { api } from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'

const TABS = [
  { key: 'produk', label: 'Kelola Produk' },
  { key: 'gift', label: 'Gift Item' },
  { key: 'admincode', label: 'Kode Redeem Admin' },
]

const emptyProduct = { id: null, name: '', type: 'notif', description: '', price: 100, emoji: '✨' }

export default function BosToko() {
  const { user } = useAuth()
  const { push } = useToast()
  const [tab, setTab] = useState('produk')
  const [tick, setTick] = useState(0)
  const [form, setForm] = useState(emptyProduct)

  const [giftCode, setGiftCode] = useState('')
  const [giftProduct, setGiftProduct] = useState('')
  const [giftMax, setGiftMax] = useState(50)
  const [giftExp, setGiftExp] = useState('')

  const [adminRole, setAdminRole] = useState('admin3')
  const [adminMax, setAdminMax] = useState(1)
  const [adminExp, setAdminExp] = useState('')

  function bump() {
    setTick((t) => t + 1)
  }

  const products = api.listProducts()
  const codes = api.listRedeemCodes()

  function saveProduct(e) {
    e.preventDefault()
    try {
      api.upsertProduct(user.id, { ...form, price: Number(form.price) })
      push(form.id ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan')
      setForm(emptyProduct)
      bump()
    } catch (err) {
      push(err.message, 'error')
    }
  }

  function deleteProduct(id) {
    api.deleteProduct(user.id, id)
    push('Produk dihapus')
    bump()
  }

  function createGift(e) {
    e.preventDefault()
    if (!giftProduct) return push('Pilih produk hadiah terlebih dahulu', 'error')
    try {
      const rc = api.createGiftCode(user.id, { code: giftCode || `MOVEUP-GIFT-${Math.random().toString(36).slice(2, 7).toUpperCase()}`, productId: giftProduct, maxUsage: giftMax, expiration: giftExp || null })
      push(`Kode gift dibuat: ${rc.code}`)
      setGiftCode('')
      bump()
    } catch (err) {
      push(err.message, 'error')
    }
  }

  function createAdminCode(e) {
    e.preventDefault()
    try {
      const rc = api.createAdminCode(user.id, { role: adminRole, maxUsage: adminMax, expiration: adminExp || null })
      push(`Kode admin dibuat: ${rc.code}`)
      bump()
    } catch (err) {
      push(err.message, 'error')
    }
  }

  function toggleCode(code, status) {
    try {
      api.setRedeemCodeStatus(user.id, code, status)
      bump()
    } catch (err) {
      push(err.message, 'error')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${tab === t.key ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'produk' && (
        <div className="grid md:grid-cols-[320px_1fr] gap-4">
          <form onSubmit={saveProduct} className="card p-5 space-y-3 h-fit">
            <h3 className="font-semibold text-sm">{form.id ? 'Edit Produk' : 'Tambah Produk'}</h3>
            <div>
              <label className="label">Nama Produk</label>
              <input className="input" placeholder="Contoh: Tema Dark Neon" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Kategori</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="notif">Efek Notifikasi</option>
                <option value="sampah">Efek Sampah</option>
                <option value="tema">Tema</option>
              </select>
            </div>
            <div>
              <label className="label">Emoji / Ikon</label>
              <input className="input" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} maxLength={4} />
            </div>
            <div>
              <label className="label">Harga (Koin)</label>
              <input type="number" min={0} className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div>
              <label className="label">Deskripsi</label>
              <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button className="btn-primary flex-1">Simpan</button>
              {form.id && <button type="button" className="btn-secondary" onClick={() => setForm(emptyProduct)}>Batal</button>}
            </div>
          </form>

          <div className="card divide-y divide-slate-100 dark:divide-slate-800">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-lg shrink-0">{p.emoji}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.price} koin · {p.type}</p>
                </div>
                <button onClick={() => setForm(p)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => deleteProduct(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-500/10">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'gift' && (
        <div className="grid md:grid-cols-[320px_1fr] gap-4">
          <form onSubmit={createGift} className="card p-5 space-y-3 h-fit">
            <h3 className="font-semibold text-sm">Buat Gift Item</h3>
            <div>
              <label className="label">Kode (kosongkan untuk otomatis)</label>
              <input className="input" placeholder="MOVEUP-GIFT-2026" value={giftCode} onChange={(e) => setGiftCode(e.target.value)} />
            </div>
            <div>
              <label className="label">Item Hadiah</label>
              <select className="input" value={giftProduct} onChange={(e) => setGiftProduct(e.target.value)} required>
                <option value="">Pilih produk...</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Batas Penggunaan</label>
              <input type="number" min={1} className="input" value={giftMax} onChange={(e) => setGiftMax(e.target.value)} />
            </div>
            <div>
              <label className="label">Masa Berlaku (opsional)</label>
              <input type="date" className="input" value={giftExp} onChange={(e) => setGiftExp(e.target.value)} />
            </div>
            <button className="btn-primary w-full">Buat Kode</button>
          </form>
          <CodeTable codes={codes.filter((c) => c.rewardType === 'product' || c.rewardType === 'storage')} onToggle={toggleCode} />
        </div>
      )}

      {tab === 'admincode' && (
        <div className="grid md:grid-cols-[320px_1fr] gap-4">
          <form onSubmit={createAdminCode} className="card p-5 space-y-3 h-fit">
            <h3 className="font-semibold text-sm">Buat Kode Redeem Admin</h3>
            {user.role !== 'admin1' && <p className="text-xs text-rose-500">Hanya Admin 1 yang dapat membuat kode ini.</p>}
            <div>
              <label className="label">Role Target</label>
              <select className="input" value={adminRole} onChange={(e) => setAdminRole(e.target.value)}>
                <option value="admin3">Admin 3</option>
                <option value="admin2">Admin 2</option>
              </select>
            </div>
            <div>
              <label className="label">Batas Penggunaan</label>
              <input type="number" min={1} className="input" value={adminMax} onChange={(e) => setAdminMax(e.target.value)} />
            </div>
            <div>
              <label className="label">Masa Berlaku (opsional)</label>
              <input type="date" className="input" value={adminExp} onChange={(e) => setAdminExp(e.target.value)} />
            </div>
            <button disabled={user.role !== 'admin1'} className="btn-primary w-full">Buat Kode</button>
          </form>
          <CodeTable codes={codes.filter((c) => c.rewardType === 'role')} onToggle={toggleCode} masked />
        </div>
      )}
    </div>
  )
}

function CodeTable({ codes, onToggle, masked }) {
  return (
    <div className="card divide-y divide-slate-100 dark:divide-slate-800">
      {codes.length === 0 && <p className="p-5 text-sm text-slate-400">Belum ada kode dibuat.</p>}
      {codes.map((c) => (
        <div key={c.code} className="flex items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-mono font-medium truncate">{masked ? c.code : c.code}</p>
            <p className="text-xs text-slate-400">{c.usedCount}/{c.maxUsage} dipakai {c.expiration && `· berlaku s.d ${c.expiration}`}</p>
          </div>
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${c.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
            {c.status === 'active' ? 'Aktif' : 'Nonaktif'}
          </span>
          <button
            onClick={() => onToggle(c.code, c.status === 'active' ? 'nonaktif' : 'active')}
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.status === 'active' ? 'text-rose-500 hover:bg-rose-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
          >
            {c.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          </button>
        </div>
      ))}
    </div>
  )
}
