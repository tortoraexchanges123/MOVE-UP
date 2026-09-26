import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmModal({ open, title, message, confirmLabel = 'Konfirmasi', danger, onConfirm, onClose }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="card w-full max-w-sm p-5 fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${danger ? 'bg-rose-500/10 text-rose-500' : 'bg-brand-500/10 text-brand-500'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <h3 className="font-semibold text-base mb-1">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{message}</p>
        <div className="flex gap-2 justify-end">
          <button className="btn-secondary" onClick={onClose}>Batal</button>
          <button
            className={danger ? 'rounded-xl px-4 py-2.5 font-medium text-white bg-rose-500 hover:bg-rose-600 transition-colors' : 'btn-primary'}
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
