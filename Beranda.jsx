import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, Image as ImageIcon, Video, Music2, Link2, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'
import Topbar from '../components/Topbar.jsx'
import { formatBytes, timeAgo } from '../lib/format.js'
import UploadModal from '../components/UploadModal.jsx'

export default function Beranda() {
  const { user, refresh } = useAuth()
  const navigate = useNavigate()
  const [showUpload, setShowUpload] = useState(false)
  const { files } = api.listFiles(user.id)
  const logs = useMemo(() => api.auditLogs().filter((l) => l.userId === user.id).slice(0, 4), [files, user])

  const counts = useMemo(() => {
    const c = { file: 0, foto: 0, video: 0, music: 0, link: 0 }
    files.forEach((f) => {
      if (f.fileType === 'foto') c.foto++
      else if (f.fileType === 'video') c.video++
      else if (f.fileType === 'music') c.music++
      else if (f.fileType === 'link') c.link++
      else c.file++
    })
    return c
  }, [files])

  const pct = Math.min(100, Math.round((user.storageUsed / user.storageQuota) * 100))
  const recentFiles = [...files].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3)

  const typeIcon = { foto: ImageIcon, video: Video, music: Music2, link: Link2, file: FileText }

  return (
    <div>
      <Topbar />
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Halo, {user.name.split(' ')[0]} 👋</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Selamat datang kembali di MOVE UP</p>
          </div>
          <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload
          </button>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Penyimpanan</p>
            <p className="text-sm text-slate-400">{formatBytes(user.storageUsed)} tersisa {formatBytes(user.storageQuota - user.storageUsed)}</p>
          </div>
          <div className="flex items-end gap-3 mb-2">
            <span className="text-2xl font-bold">{formatBytes(user.storageUsed)}</span>
            <span className="text-slate-400 text-sm mb-1">/ {formatBytes(user.storageQuota)}</span>
            <span className="ml-auto text-brand-500 font-semibold text-sm mb-1">{pct}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total File', value: files.length, icon: FileText, color: 'text-brand-500' },
            { label: 'Foto', value: counts.foto, icon: ImageIcon, color: 'text-emerald-500' },
            { label: 'Video', value: counts.video, icon: Video, color: 'text-purple-500' },
            { label: 'Music', value: counts.music, icon: Music2, color: 'text-pink-500' },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <s.icon className={`w-5 h-5 mb-2 ${s.color}`} />
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">File Terbaru</h3>
              <button onClick={() => navigate('/stora')} className="text-sm text-brand-500 hover:underline">Lihat Semua</button>
            </div>
            {recentFiles.length === 0 && <p className="text-sm text-slate-400">Belum ada file. Yuk upload yang pertama!</p>}
            <div className="space-y-2">
              {recentFiles.map((f) => {
                const Icon = typeIcon[f.fileType] || FileText
                return (
                  <div key={f.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{f.filename}</p>
                      <p className="text-xs text-slate-400">{formatBytes(f.size)} · {timeAgo(f.createdAt)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold mb-3">Aktivitas Terbaru</h3>
            {logs.length === 0 && <p className="text-sm text-slate-400">Belum ada aktivitas.</p>}
            <div className="space-y-2">
              {logs.map((l) => (
                <div key={l.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm capitalize">{l.action.replace('_', ' ')} <span className="text-slate-400">{l.detail}</span></p>
                    <p className="text-xs text-slate-400">{timeAgo(l.at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <UploadModal open={showUpload} onClose={() => setShowUpload(false)} onDone={refresh} />
    </div>
  )
}
