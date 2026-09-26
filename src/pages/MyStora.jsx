import React, { useMemo, useState } from 'react'
import {
  Upload, FileText, Image as ImageIcon, Video, Music2, Link2, Folder as FolderIcon,
  MoreVertical, Download, Pencil, Trash2, FolderInput, Copy, RotateCcw, XCircle, FolderPlus,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'
import { useToast } from '../context/ToastContext.jsx'
import Topbar from '../components/Topbar.jsx'
import UploadModal from '../components/UploadModal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { formatBytes, timeAgo } from '../lib/format.js'

const TABS = [
  { key: 'semua', label: 'Semua' },
  { key: 'file', label: 'File' },
  { key: 'video', label: 'Video' },
  { key: 'foto', label: 'Foto' },
  { key: 'music', label: 'Music' },
  { key: 'link', label: 'Link' },
  { key: 'folder', label: 'Folder' },
]

const typeIcon = { foto: ImageIcon, video: Video, music: Music2, link: Link2, file: FileText }
const typeColor = { foto: 'text-emerald-500 bg-emerald-500/10', video: 'text-purple-500 bg-purple-500/10', music: 'text-pink-500 bg-pink-500/10', link: 'text-amber-500 bg-amber-500/10', file: 'text-brand-500 bg-brand-500/10' }

export default function MyStora() {
  const { user, refresh } = useAuth()
  const { push } = useToast()
  const [tab, setTab] = useState('semua')
  const [search, setSearch] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [showTrash, setShowTrash] = useState(false)
  const [menuFor, setMenuFor] = useState(null)
  const [renaming, setRenaming] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [tick, setTick] = useState(0)

  const { files, trashed, folders } = api.listFiles(user.id)

  const filtered = useMemo(() => {
    let list = files
    if (tab !== 'semua' && tab !== 'folder') list = list.filter((f) => f.fileType === tab)
    if (search) list = list.filter((f) => f.filename.toLowerCase().includes(search.toLowerCase()))
    return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [files, tab, search, tick])

  const showFolders = (tab === 'semua' || tab === 'folder') && folders.length > 0 && !search

  function bump() {
    setTick((t) => t + 1)
    refresh()
  }

  function doRename() {
    try {
      api.renameFile(user.id, renaming, renameValue)
      push('File berhasil diganti nama')
      setRenaming(null)
      bump()
    } catch (e) {
      push(e.message, 'error')
    }
  }

  function doTrash(id) {
    try {
      api.trashFile(user.id, id)
      push('File dipindahkan ke Trash')
      bump()
    } catch (e) {
      push(e.message, 'error')
    }
  }

  function doRestore(id) {
    api.restoreFile(user.id, id)
    push('File dipulihkan')
    bump()
  }

  function doDeletePermanent(id) {
    try {
      api.deleteFilePermanent(user.id, id)
      push('File dihapus permanen')
      bump()
    } catch (e) {
      push(e.message, 'error')
    }
  }

  function copyLink(f) {
    const link = f.fileType === 'link' ? f.dataUrl : `https://moveup.app/share/${f.id}`
    navigator.clipboard?.writeText(link).catch(() => {})
    push('Link disalin ke clipboard')
  }

  function createFolder(e) {
    e.preventDefault()
    if (!folderName.trim()) return
    api.createFolder(user.id, folderName.trim())
    push('Folder berhasil dibuat')
    setFolderName('')
    setShowNewFolder(false)
    bump()
  }

  return (
    <div>
      <Topbar search={search} onSearch={setSearch} />
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">My Stora</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Kelola semua file kamu di sini.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowTrash(true)} className="btn-secondary flex items-center gap-2 text-sm">
              <Trash2 className="w-4 h-4" /> Trash {trashed.length > 0 && `(${trashed.length})`}
            </button>
            <button onClick={() => setShowNewFolder(true)} className="btn-secondary flex items-center gap-2 text-sm">
              <FolderPlus className="w-4 h-4" /> Folder
            </button>
            <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Upload className="w-4 h-4" /> Upload
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 ${
                tab === t.key ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="card overflow-hidden">
          {showFolders && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
              {folders.map((fo) => (
                <div key={fo.id} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <FolderIcon className="w-6 h-6 text-amber-400 shrink-0" fill="currentColor" fillOpacity={0.15} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{fo.name}</p>
                    <p className="text-xs text-slate-400">{files.filter((f) => f.folderId === fo.id).length} items</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab !== 'folder' && (
            filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                {search ? 'Tidak ada hasil ditemukan.' : 'Belum ada file di kategori ini. Yuk upload!'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((f) => {
                  const Icon = typeIcon[f.fileType] || FileText
                  return (
                    <div key={f.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 relative">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeColor[f.fileType]}`}>
                        <Icon className="w-[18px] h-[18px]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        {renaming === f.id ? (
                          <input
                            autoFocus
                            className="input !py-1 text-sm"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && doRename()}
                            onBlur={doRename}
                          />
                        ) : (
                          <p className="text-sm font-medium truncate">{f.filename}</p>
                        )}
                        <p className="text-xs text-slate-400">{formatBytes(f.size)} · {timeAgo(f.createdAt)}</p>
                      </div>

                      <div className="relative">
                        <button onClick={() => setMenuFor(menuFor === f.id ? null : f.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {menuFor === f.id && (
                          <div className="absolute right-0 top-9 z-20 w-44 card p-1.5 shadow-lg">
                            {f.dataUrl && (
                              <a href={f.dataUrl} download={f.filename} onClick={() => setMenuFor(null)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                <Download className="w-4 h-4" /> Download
                              </a>
                            )}
                            <button onClick={() => { copyLink(f); setMenuFor(null) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                              <Copy className="w-4 h-4" /> Copy Link
                            </button>
                            <button onClick={() => { setRenaming(f.id); setRenameValue(f.filename); setMenuFor(null) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                              <Pencil className="w-4 h-4" /> Rename
                            </button>
                            {folders.length > 0 && (
                              <button onClick={() => { api.moveFile(user.id, f.id, folders[0].id); push(`Dipindahkan ke ${folders[0].name}`); setMenuFor(null); bump() }} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                <FolderInput className="w-4 h-4" /> Pindah ke Folder
                              </button>
                            )}
                            <button onClick={() => { doTrash(f.id); setMenuFor(null) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500">
                              <Trash2 className="w-4 h-4" /> Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}
        </div>
      </div>

      <UploadModal open={showUpload} onClose={() => setShowUpload(false)} onDone={bump} />

      {showNewFolder && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={() => setShowNewFolder(false)}>
          <form onSubmit={createFolder} className="card w-full max-w-sm p-5 fade-in-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-3">Buat Folder Baru</h3>
            <input autoFocus className="input mb-4" placeholder="Nama folder" value={folderName} onChange={(e) => setFolderName(e.target.value)} />
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setShowNewFolder(false)}>Batal</button>
              <button className="btn-primary">Buat</button>
            </div>
          </form>
        </div>
      )}

      {showTrash && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={() => setShowTrash(false)}>
          <div className="card w-full max-w-md p-5 fade-in-up max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Trash</h3>
              <button onClick={() => setShowTrash(false)}><XCircle className="w-5 h-5 text-slate-400" /></button>
            </div>
            {trashed.length === 0 && <p className="text-sm text-slate-400">Trash kosong.</p>}
            <div className="space-y-2">
              {trashed.map((f) => (
                <div key={f.id} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{f.filename}</p>
                    <p className="text-xs text-slate-400">{formatBytes(f.size)}</p>
                  </div>
                  <button onClick={() => doRestore(f.id)} className="text-brand-500 hover:bg-brand-500/10 p-2 rounded-lg" title="Pulihkan">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button onClick={() => setConfirmDelete(f.id)} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg" title="Hapus permanen">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title="Hapus permanen?"
        message="File akan dihapus permanen dan tidak bisa dipulihkan lagi."
        confirmLabel="Hapus Permanen"
        danger
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => doDeletePermanent(confirmDelete)}
      />
    </div>
  )
}
