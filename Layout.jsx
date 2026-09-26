import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Sidebar from './Sidebar.jsx'
import BottomNav from './BottomNav.jsx'

export default function Layout() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-20 md:pb-0">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}
