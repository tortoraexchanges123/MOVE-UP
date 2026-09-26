import React, { useState } from 'react'
import { X, UploadCloud, Link2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'
import { useToast } from '../context/ToastContext.jsx'

const MAX_INLINE_SIZE = 4 * 1024 * 1024 // 4MB safe limit for localStorage-embedded demo files

function detectType(file) {
  if (file.type.startsWith('image/')) return 'foto'
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('audio/')) return 'music'
  return 'file'
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function UploadModal({ open, onClose, onDone, folderId = null }) {
  const { user, refresh } = useAuth()
  const { push } = useToast()
  const [mode, setMode] = useState('file')
  const [linkName, setLinkName] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  if (!open) return null

  async function handleFiles(fileList) {
    setBusy(true)
    try {
      for (const file of Array.from(fileList)) {
        const dataUrl = file.size <= MAX_INLINE_SIZE ? await fileToDataUrl(file) : null
        api.uploadFile(user.id, {
          filename: file.name,
          fileType: detectType(file),
          size: file.size,
          dataUrl,
          folderId,
        })
      }
      push('File berhasil diupload')
      refresh()
      onDone?.()
      onClose()
    } catch (e) {
      push(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function handleLink(e) {
    e.preventDefault()
    setBusy(true)
    try {
      api.addLink(user.id, { name: linkName || linkUrl, url: linkUrl })
      push('Link berhasil disimpan')
      refresh()
      onDone?.()
      onClose()
    } catch (e) {
      push(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="card w-full max-w-md p-5 fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-base">Upload ke My Stora</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setMode('file')} className={`flex-1 text-sm py-2 rounded-lg font-medium ${mode === 'file' ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>File / Media</button>
          <button onClick={() => setMode('link')} className={`flex-1 text-sm py-2 rounded-lg font-medium ${mode === 'link' ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>Link</button>
        </div>

        {mode === 'file' ? (
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-10 cursor-pointer transition-colors ${dragOver ? 'border-brand-500 bg-brand-500/5' : 'border-slate-300 dark:border-slate-700'}`}
          >
            <UploadCloud className="w-8 h-8 text-brand-500" />
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center px-4">
              {busy ? 'Mengunggah...' : 'Tarik file ke sini atau klik untuk memilih'}
            </p>
            <input type="file" multiple className="hidden" disabled={busy} onChange={(e) => e.target.files.length && handleFiles(e.target.files)} />
          </label>
        ) : (
          <form onSubmit={handleLink} className="space-y-3">
            <div>
              <label className="label">Nama link</label>
              <input className="input" placeholder="Contoh: Google Drive Project" value={linkName} onChange={(e) => setLinkName(e.target.value)} />
            </div>
            <div>
              <label className="label">URL</label>
              <div className="relative">
                <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input pl-9" placeholder="https://..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} required />
              </div>
            </div>
            <button disabled={busy} className="btn-primary w-full">{busy ? 'Menyimpan...' : 'Simpan Link'}</button>
          </form>
        )}
      </div>
    </div>
  )
}
