import React, { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Cloud, Upload } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function Register() {
  const { user, register } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [photo, setPhoto] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/beranda" replace />

  async function onPhoto(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setPhoto(await fileToDataUrl(f))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    if (password !== confirm) return setErr('Konfirmasi password tidak cocok')
    if (password.length < 6) return setErr('Password minimal 6 karakter')
    setBusy(true)
    try {
      await register({ name, identifier, password, photo })
      push('Akun berhasil dibuat. Selamat datang di MOVE UP!')
      navigate('/beranda')
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b14] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-glow mb-3">
            <Cloud className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Daftar ke MOVE UP</h1>
          <p className="text-slate-400 text-sm">Mulai simpan file kamu di cloud.</p>
        </div>

        <form onSubmit={onSubmit} className="card !bg-[#0d1220] !border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
              {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : <Upload className="w-5 h-5 text-slate-500" />}
            </div>
            <label className="btn-secondary !bg-slate-800 !text-slate-200 cursor-pointer text-sm">
              Foto profil (opsional)
              <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
            </label>
          </div>

          <div>
            <label className="label !text-slate-300">Nama lengkap</label>
            <input className="input !bg-slate-900 !border-slate-700 !text-white" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label !text-slate-300">Username / Email</label>
            <input className="input !bg-slate-900 !border-slate-700 !text-white" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label !text-slate-300">Password</label>
              <input type="password" className="input !bg-slate-900 !border-slate-700 !text-white" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className="label !text-slate-300">Konfirmasi</label>
              <input type="password" className="input !bg-slate-900 !border-slate-700 !text-white" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
          </div>

          {err && <p className="text-sm text-rose-400">{err}</p>}

          <button disabled={busy} className="btn-primary w-full !py-3">{busy ? 'Memproses...' : 'Daftar'}</button>
        </form>

        <p className="text-sm text-slate-400 text-center mt-6">
          Sudah punya akun? <Link to="/login" className="text-brand-400 font-medium hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  )
}
