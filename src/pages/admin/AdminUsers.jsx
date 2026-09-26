import React, { useState } from 'react'
import { Plus, Ban, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { api, canManage } from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'
import { formatBytes } from '../../lib/format.js'

const ROLE_LABEL = { user: 'User', admin3: 'Admin 3', admin2: 'Admin 2', admin1: 'Admin 1' }

export default function AdminUsers() {
  const { user: me, refresh } = useAuth()
  const { push } = useToast()
  const [tick, setTick] = useState(0)
  const [confirmToggle, setConfirmToggle] = useState(null)
  const [addingStorage, setAddingStorage] = useState(null)

  const users = api.listUsers()

  function bump() {
    setTick((t) => t + 1)
    refresh()
  }

  function addStorage(target, gb) {
    try {
      api.addStorage(me.id, target.id, gb * 1024 * 1024 * 1024)
      push(`+${gb}GB ditambahkan ke ${target.username}`)
      bump()
    } catch (e) {
      push(e.message, 'error')
    }
    setAddingStorage(null)
  }

  function toggleStatus(target) {
    try {
      const next = target.status === 'active' ? 'nonaktif' : 'active'
      api.setUserStatus(me.id, target.id, next)
      push(`Akun ${target.username} ${next === 'active' ? 'diaktifkan' : 'dinonaktifkan'}`)
      bump()
    } catch (e) {
      push(e.message, 'error')
    }
  }

  function changeRole(target, role) {
    try {
      api.setUserRole(me.id, target.id, role)
      push(`Role ${target.username} diubah menjadi ${ROLE_LABEL[role]}`)
      bump()
    } catch (e) {
      push(e.message, 'error')
    }
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm min-w-[720px]">
        <thead>
          <tr className="text-left text-slate-400 border-b border-slate-100 dark:border-slate-800">
            <th className="px-4 py-3 font-medium">Nama</th>
            <th className="px-4 py-3 font-medium">Username</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Storage</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const manageable = canManage(me.role, u.role) || me.id === u.id
            return (
              <tr key={u.id} className="border-b border-slate-50 dark:border-slate-800/60 last:border-0">
                <td className="px-4 py-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-xs font-semibold text-brand-500 overflow-hidden shrink-0">
                    {u.photo ? <img src={u.photo} className="w-full h-full object-cover" alt="" /> : u.name[0]}
                  </div>
                  {u.name}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.username}</td>
                <td className="px-4 py-3">
                  {me.role === 'admin1' && me.id !== u.id ? (
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u, e.target.value)}
                      className="input !py-1 !px-2 text-xs w-28"
                    >
                      {Object.entries(ROLE_LABEL).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium">{ROLE_LABEL[u.role]}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatBytes(u.storageUsed)} / {formatBytes(u.storageQuota)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {u.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button
                      title="Tambah storage 10GB"
                      onClick={() => addStorage(u, 10)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-500 hover:bg-brand-500/10"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    {manageable && me.id !== u.id && (
                      <button
                        title={u.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                        onClick={() => setConfirmToggle(u)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${u.status === 'active' ? 'text-rose-500 hover:bg-rose-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                      >
                        {u.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <ConfirmModal
        open={!!confirmToggle}
        title={confirmToggle?.status === 'active' ? 'Nonaktifkan akun ini?' : 'Aktifkan kembali akun ini?'}
        message={confirmToggle?.status === 'active' ? 'User tidak akan bisa login, upload, atau menggunakan layanan.' : 'User akan bisa mengakses akunnya kembali.'}
        confirmLabel={confirmToggle?.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
        danger={confirmToggle?.status === 'active'}
        onClose={() => setConfirmToggle(null)}
        onConfirm={() => toggleStatus(confirmToggle)}
      />
    </div>
  )
}
