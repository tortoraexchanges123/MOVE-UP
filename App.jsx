import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Beranda from './pages/Beranda.jsx'
import MyStora from './pages/MyStora.jsx'
import VoltSettings from './pages/VoltSettings.jsx'
import Toko from './pages/Toko.jsx'
import Layout from './components/Layout.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import BosToko from './pages/admin/BosToko.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<Layout />}>
        <Route path="/beranda" element={<Beranda />} />
        <Route path="/stora" element={<MyStora />} />
        <Route path="/settings" element={<VoltSettings />} />
        <Route path="/toko" element={<Toko />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="toko" element={<BosToko />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/beranda" replace />} />
      <Route path="*" element={<Navigate to="/beranda" replace />} />
    </Routes>
  )
}
