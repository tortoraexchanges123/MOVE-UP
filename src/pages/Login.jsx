import React, { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Cloud, Image, Play, Music2, Link2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function Login() {
  const { user, login } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/beranda" replace />

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      await login(identifier, password)
      push('Berhasil masuk. Selamat datang kembali!')
      navigate('/beranda')
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#070b14]">
      <div className="hidden md:flex flex-col justify-center items-center relative overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#14294d,transparent_60%),radial-gradient(circle_at_70%_80%,#0d1a33,transparent_60%)] p-10">
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-glow mb-6">
            <Cloud className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">MOVE UP</h1>
          <p className="text-slate-400">Simpan. Akses. Naik Level.</p>
        </div>
        <div className="absolute bottom-10 left-10 text-brand-400/60"><Image className="w-8 h-8" /></div>
        <div className="absolute top-16 right-16 text-brand-400/60"><Play className="w-8 h-8" /></div>
        <div className="absolute bottom-24 right-24 text-brand-400/60"><Music2 className="w-8 h-8" /></div>
        <div className="absolute top-1/2 left-16 text-brand-400/60"><Link2 className="w-8 h-8" /></div>
      </div>

      <div className="flex flex-col justify-center px-6 sm:px-16 py-10 bg-[#0a0e17]">
        <div className="max-w-sm w-full mx-auto">
          <h2 className="text-2xl font-bold text-white mb-1">Masuk ke MOVE UP</h2>
          <p className="text-slate-400 text-sm mb-8">Akses file dan data kamu di mana saja.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label !text-slate-300">Email / Username</label>
              <input className="input !bg-slate-900 !border-slate-700 !text-white" placeholder="Masukkan email atau username"
                value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
            </div>
            <div>
              <label className="label !text-slate-300">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input !bg-slate-900 !border-slate-700 !text-white pr-10" placeholder="Masukkan password"
                  value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {err && <p className="text-sm text-rose-400">{err}</p>}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-300">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-brand-500" />
                Ingat saya
              </label>
              <button type="button" onClick={() => push('Fitur reset password segera hadir.', 'info')} className="text-brand-400 hover:underline">
                Lupa password?
              </button>
            </div>

            <button disabled={busy} className="btn-primary w-full !py-3">{busy ? 'Memproses...' : 'Masuk'}</button>
          </form>

          <p className="text-sm text-slate-400 text-center mt-6">
            Belum punya akun? <Link to="/register" className="text-brand-400 font-medium hover:underline">Daftar sekarang</Link>
          </p>

          <div className="mt-8 text-xs text-slate-500 border-t border-slate-800 pt-4">
            Demo admin: <span className="text-slate-300">admin / admin123</span> · Demo user: <span className="text-slate-300">andi / user123</span>
          </div>
        </div>
      </div>
    </div>
  )
}
