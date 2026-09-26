import React, { useState } from 'react'
import { User, Palette, Gift, Layers, LogOut, Sun, Moon, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { api } from '../lib/api.js'
import Topbar from '../components/Topbar.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { useNavigate } from 'react-router-dom'

const SECTIONS = [
  { key: 'akun', label: 'Pengaturan Akun', icon: User },
  { key: 'tema', label: 'Tema', icon: Palette },
  { key: 'hadiah', label: 'Hadiah', icon: Gift },
  { key: 'koleksi', label: 'Koleksi', icon: Layers },
]

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function VoltSettings() {
  const { user, refresh, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { push } = useToast()
  const navigate = useNavigate()
  const [section, setSection] = useState('akun')
  const [name, setName] = useState(user.name)
  const [curPw, setCurPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [code, setCode] = useState('')
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [tick, setTick] = useState(0)

  function bump() {
    setTick((t) => t + 1)
    refresh()
  }

  async function onPhoto(e) {
    const f = e.target.files?.[0]
    if (!f) return
    const url = await fileToDataUrl(f)
    api.updateAccount(user.id, { photo: url })
    bump()
    push('Foto profil diperbarui')
  }

  function saveName(e) {
    e.preventDefault()
    api.updateAccount(user.id, { name })
    bump()
    push('Nama berhasil diperbarui')
  }

  function savePassword(e) {
    e.preventDefault()
    try {
      api.changePassword(user.id, curPw, newPw)
      push('Password berhasil diubah')
      setCurPw('')
      setNewPw('')
    } catch (err) {
      push(err.message, 'error')
    }
  }

  function doRedeem(e) {
    e.preventDefault()
    try {
      const { reward } = api.redeem(user.id, code)
      push(`Kode berhasil! Hadiah: ${reward.rewardType}`, 'success')
      setCode('')
      bump()
    } catch (err) {
      push(err.message, 'error')
    }
  }

  const collection = api.listCollection(user.id)
  const catLabels = { notif: 'Efek Notifikasi', sampah: 'Efek Hapus/Sampah', tema: 'Tema', lainnya: 'Lainnya' }

  function useItem(c) {
    api.useItem(user.id, c.id)
    bump()
    push(`${c.product.name} sedang digunakan`)
  }

  return (
    <div>
      <Topbar />
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Volt Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Atur akun, tema, dan preferensi kamu.</p>

        <div className="grid md:grid-cols-[220px_1fr] gap-5">
          <div className="card p-2 flex md:flex-col gap-1 overflow-x-auto">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSection(s.key)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap ${
                  section === s.key ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <s.icon className="w-4 h-4" /> {s.label}
              </button>
            ))}
          </div>

          <div className="card p-5">
            {section === 'akun' && (
              <div className="space-y-6">
                <div>
                  <p className="label mb-3">Ubah Foto Profil</p>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-brand-500/20 overflow-hidden flex items-center justify-center text-xl font-semibold text-brand-500">
                      {user.photo ? <img src={user.photo} className="w-full h-full object-cover" alt="" /> : user.name[0]}
                    </div>
                    <label className="btn-secondary cursor-pointer text-sm">
                      Ganti Foto
                      <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
                    </label>
                  </div>
                </div>

                <form onSubmit={saveName} className="space-y-3 max-w-sm">
                  <div>
                    <label className="label">Nama</label>
                    <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Email / Username</label>
                    <input className="input opacity-60" value={user.email} disabled />
                  </div>
                  <button className="btn-primary">Simpan Perubahan</button>
                </form>

                <form onSubmit={savePassword} className="space-y-3 max-w-sm border-t border-slate-100 dark:border-slate-800 pt-5">
                  <p className="font-medium text-sm">Ubah Password</p>
                  <div>
                    <label className="label">Password saat ini</label>
                    <input type="password" className="input" value={curPw} onChange={(e) => setCurPw(e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Password baru</label>
                    <input type="password" className="input" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={6} />
                  </div>
                  <button className="btn-secondary">Ubah Password</button>
                </form>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                  <button onClick={() => setConfirmLogout(true)} className="flex items-center gap-2 text-rose-500 font-medium text-sm">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            )}

            {section === 'tema' && (
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button onClick={() => setTheme('light')} className={`card !bg-white p-4 flex flex-col items-center gap-2 border-2 ${theme === 'light' ? '!border-brand-500' : '!border-slate-200'}`}>
                  <Sun className="w-6 h-6 text-amber-400" />
                  <span className="text-sm font-medium text-slate-700">Light Mode</span>
                  {theme === 'light' && <Check className="w-4 h-4 text-brand-500" />}
                </button>
                <button onClick={() => setTheme('dark')} className={`card !bg-[#111827] p-4 flex flex-col items-center gap-2 border-2 ${theme === 'dark' ? '!border-brand-500' : '!border-slate-700'}`}>
                  <Moon className="w-6 h-6 text-indigo-300" />
                  <span className="text-sm font-medium text-slate-200">Dark Mode</span>
                  {theme === 'dark' && <Check className="w-4 h-4 text-brand-500" />}
                </button>
              </div>
            )}

            {section === 'hadiah' && (
              <div className="max-w-sm">
                <p className="font-medium mb-1">Punya kode redeem?</p>
                <p className="text-sm text-slate-400 mb-4">Tukarkan kode untuk mendapatkan storage, tema, efek, atau item lainnya.</p>
                <form onSubmit={doRedeem} className="flex gap-2">
                  <input className="input" placeholder="Masukkan kode redeem" value={code} onChange={(e) => setCode(e.target.value)} required />
                  <button className="btn-primary shrink-0">REDEEM</button>
                </form>
                <p className="text-xs text-slate-400 mt-3">Contoh kode demo: <span className="font-mono">MOVEUP-GIFT-2026</span></p>
                <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Koin kamu saat ini</p>
                  <p className="text-2xl font-bold text-brand-500">{user.coins} 🪙</p>
                </div>
              </div>
            )}

            {section === 'koleksi' && (
              <div>
                {collection.length === 0 && <p className="text-sm text-slate-400">Kamu belum memiliki item. Kunjungi Toko untuk membeli efek dan tema.</p>}
                {Object.entries(catLabels).map(([cat, label]) => {
                  const items = collection.filter((c) => c.product.type === cat)
                  if (items.length === 0) return null
                  return (
                    <div key={cat} className="mb-5">
                      <p className="text-sm font-semibold mb-2">{label}</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {items.map((c) => (
                          <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-lg shrink-0">{c.product.emoji}</div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{c.product.name}</p>
                              <p className="text-xs text-slate-400">{c.active ? 'Sedang digunakan' : 'Belum digunakan'}</p>
                            </div>
                            {!c.active && (
                              <button onClick={() => useItem(c)} className="text-xs btn-secondary !px-2.5 !py-1.5 shrink-0">Pakai</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmLogout}
        title="Keluar dari akun?"
        message="Kamu perlu masuk kembali untuk mengakses MOVE UP."
        confirmLabel="Logout"
        danger
        onClose={() => setConfirmLogout(false)}
        onConfirm={() => { logout(); navigate('/login') }}
      />
    </div>
  )
}
