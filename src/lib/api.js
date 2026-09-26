import { db } from './db.js'

// Role hierarchy: higher number = higher privilege.
export const ROLE_RANK = { user: 0, admin3: 1, admin2: 2, admin1: 3 }
export const isAdmin = (role) => role && role !== 'user'
export const canManage = (actorRole, targetRole) =>
  ROLE_RANK[actorRole] > ROLE_RANK[targetRole]

function fail(msg) {
  const e = new Error(msg)
  throw e
}

function getUser(state, id) {
  const u = state.users.find((u) => u.id === id)
  if (!u) fail('User tidak ditemukan')
  return u
}

export const api = {
  // ---------- AUTH ----------
  login(identifier, password) {
    const state = db.read()
    const user = state.users.find(
      (u) => (u.username === identifier || u.email === identifier) && u.password === password,
    )
    if (!user) fail('Email/username atau password salah')
    if (user.status !== 'active') fail('Akun ini telah dinonaktifkan')
    state.session = user.id
    db.log(state, user.id, 'login', `${user.username} login`)
    db.write(state)
    return user
  },

  register({ name, identifier, password, photo }) {
    const state = db.read()
    const exists = state.users.some((u) => u.username === identifier || u.email === identifier)
    if (exists) fail('Email/username sudah terdaftar')
    const newUser = {
      id: db.uid('u'),
      name,
      username: identifier,
      email: identifier.includes('@') ? identifier : `${identifier}@moveup.app`,
      password,
      photo: photo || '',
      role: 'user',
      storageQuota: 10 * db.GB,
      storageUsed: 0,
      coins: 50,
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    state.users.push(newUser)
    state.session = newUser.id
    db.log(state, newUser.id, 'register', `${identifier} mendaftar`)
    db.write(state)
    return newUser
  },

  logout() {
    const state = db.read()
    if (state.session) db.log(state, state.session, 'logout', '')
    state.session = null
    db.write(state)
  },

  currentUser() {
    const state = db.read()
    if (!state.session) return null
    return state.users.find((u) => u.id === state.session) || null
  },

  updateAccount(userId, { name, photo }) {
    const state = db.read()
    const u = getUser(state, userId)
    if (name) u.name = name
    if (photo !== undefined) u.photo = photo
    db.log(state, userId, 'update_account', 'Profil diperbarui')
    db.write(state)
    return u
  },

  changePassword(userId, currentPassword, newPassword) {
    const state = db.read()
    const u = getUser(state, userId)
    if (u.password !== currentPassword) fail('Password saat ini salah')
    u.password = newPassword
    db.log(state, userId, 'change_password', 'Password diubah')
    db.write(state)
    return u
  },

  // ---------- FILES ----------
  listFiles(userId) {
    const state = db.read()
    return {
      files: state.files.filter((f) => f.userId === userId && !f.trashed),
      trashed: state.files.filter((f) => f.userId === userId && f.trashed),
      folders: state.folders.filter((f) => f.userId === userId),
    }
  },

  createFolder(userId, name, parentFolderId = null) {
    const state = db.read()
    const folder = { id: db.uid('fold'), userId, name, parentFolderId }
    state.folders.push(folder)
    db.log(state, userId, 'create_folder', name)
    db.write(state)
    return folder
  },

  uploadFile(userId, { filename, fileType, size, dataUrl, folderId = null }) {
    const state = db.read()
    const u = getUser(state, userId)
    if (u.status !== 'active') fail('Akun dinonaktifkan')
    if (u.storageUsed + size > u.storageQuota) fail('Kuota penyimpanan tidak cukup')
    const file = {
      id: db.uid('file'),
      userId,
      filename,
      fileType,
      size,
      dataUrl: dataUrl || null,
      folderId,
      trashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    state.files.push(file)
    u.storageUsed += size
    db.log(state, userId, 'upload', filename)
    db.write(state)
    return file
  },

  renameFile(userId, fileId, newName) {
    const state = db.read()
    const f = state.files.find((f) => f.id === fileId && f.userId === userId)
    if (!f) fail('File tidak ditemukan')
    f.filename = newName
    f.updatedAt = new Date().toISOString()
    db.log(state, userId, 'rename', newName)
    db.write(state)
    return f
  },

  moveFile(userId, fileId, folderId) {
    const state = db.read()
    const f = state.files.find((f) => f.id === fileId && f.userId === userId)
    if (!f) fail('File tidak ditemukan')
    f.folderId = folderId
    db.write(state)
    return f
  },

  trashFile(userId, fileId) {
    const state = db.read()
    const f = state.files.find((f) => f.id === fileId && f.userId === userId)
    if (!f) fail('File tidak ditemukan')
    f.trashed = true
    db.log(state, userId, 'trash', f.filename)
    db.write(state)
    return f
  },

  restoreFile(userId, fileId) {
    const state = db.read()
    const f = state.files.find((f) => f.id === fileId && f.userId === userId)
    if (!f) fail('File tidak ditemukan')
    f.trashed = false
    db.write(state)
    return f
  },

  deleteFilePermanent(userId, fileId) {
    const state = db.read()
    const idx = state.files.findIndex((f) => f.id === fileId && f.userId === userId)
    if (idx === -1) fail('File tidak ditemukan')
    const f = state.files[idx]
    const u = getUser(state, userId)
    u.storageUsed = Math.max(0, u.storageUsed - f.size)
    state.files.splice(idx, 1)
    db.log(state, userId, 'delete', f.filename)
    db.write(state)
  },

  addLink(userId, { name, url }) {
    return api.uploadFile(userId, { filename: name, fileType: 'link', size: 1024, dataUrl: url })
  },

  // ---------- STORE / COLLECTION ----------
  listProducts() {
    const state = db.read()
    return state.products.filter((p) => p.status === 'active')
  },

  listCollection(userId) {
    const state = db.read()
    return state.collection
      .filter((c) => c.userId === userId)
      .map((c) => ({ ...c, product: state.products.find((p) => p.id === c.productId) }))
      .filter((c) => c.product)
  },

  buyProduct(userId, productId) {
    const state = db.read()
    const u = getUser(state, userId)
    const p = state.products.find((p) => p.id === productId)
    if (!p) fail('Produk tidak ditemukan')
    const already = state.collection.some((c) => c.userId === userId && c.productId === productId)
    if (already) fail('Item sudah kamu miliki')
    if (u.coins < p.price) fail('Koin kamu tidak cukup')
    u.coins -= p.price
    state.collection.push({
      id: db.uid('col'),
      userId,
      productId,
      acquiredAt: new Date().toISOString(),
      active: false,
    })
    state.transactions.unshift({
      id: db.uid('trx'),
      userId,
      productId,
      price: p.price,
      createdAt: new Date().toISOString(),
    })
    db.log(state, userId, 'purchase', p.name)
    db.write(state)
    return u
  },

  useItem(userId, collectionId) {
    const state = db.read()
    const item = state.collection.find((c) => c.id === collectionId && c.userId === userId)
    if (!item) fail('Item tidak ditemukan')
    const product = state.products.find((p) => p.id === item.productId)
    // deactivate other items of same type, then activate this one
    state.collection
      .filter((c) => c.userId === userId)
      .forEach((c) => {
        const p = state.products.find((p) => p.id === c.productId)
        if (p && product && p.type === product.type) c.active = false
      })
    item.active = true
    db.write(state)
    return item
  },

  // ---------- REDEEM ----------
  redeem(userId, code) {
    const state = db.read()
    const u = getUser(state, userId)
    const rc = state.redeemCodes.find((c) => c.code.toLowerCase() === code.trim().toLowerCase())
    if (!rc) fail('Kode tidak valid')
    if (rc.status !== 'active') fail('Kode sudah tidak aktif')
    if (rc.expiration && new Date(rc.expiration) < new Date()) fail('Kode sudah kedaluwarsa')
    if (rc.usedCount >= rc.maxUsage) fail('Kode sudah mencapai batas penggunaan')
    if (rc.targetRole && u.role !== rc.targetRole && rc.rewardType === 'role' && false) {
      // reserved for future per-user usage tracking
    }
    const alreadyUsedByUser = (rc.usedBy || []).includes(userId)
    if (alreadyUsedByUser) fail('Kode sudah kamu gunakan')

    if (rc.rewardType === 'storage') {
      u.storageQuota += rc.rewardValue
    } else if (rc.rewardType === 'coins') {
      u.coins += rc.rewardValue
    } else if (rc.rewardType === 'product') {
      const already = state.collection.some((c) => c.userId === userId && c.productId === rc.rewardValue)
      if (!already) {
        state.collection.push({ id: db.uid('col'), userId, productId: rc.rewardValue, acquiredAt: new Date().toISOString(), active: false })
      }
    } else if (rc.rewardType === 'role') {
      u.role = rc.rewardValue
    }
    rc.usedCount += 1
    rc.usedBy = [...(rc.usedBy || []), userId]
    db.log(state, userId, 'redeem', rc.code)
    db.write(state)
    return { user: u, reward: rc }
  },

  // ---------- ADMIN: USERS ----------
  listUsers() {
    const state = db.read()
    return state.users
  },

  addStorage(actorId, targetUserId, bytesToAdd) {
    const state = db.read()
    const actor = getUser(state, actorId)
    const target = getUser(state, targetUserId)
    if (!isAdmin(actor.role)) fail('Kamu tidak punya izin admin')
    target.storageQuota += bytesToAdd
    db.log(state, actorId, 'add_storage', `+${(bytesToAdd / db.GB).toFixed(0)}GB untuk ${target.username}`)
    db.write(state)
    return target
  },

  setUserStatus(actorId, targetUserId, status) {
    const state = db.read()
    const actor = getUser(state, actorId)
    const target = getUser(state, targetUserId)
    if (!isAdmin(actor.role)) fail('Kamu tidak punya izin admin')
    if (!canManage(actor.role, target.role) && actor.id !== target.id) fail('Kamu tidak bisa mengelola akun level ini')
    target.status = status
    db.log(state, actorId, 'set_status', `${target.username} -> ${status}`)
    db.write(state)
    return target
  },

  setUserRole(actorId, targetUserId, newRole) {
    const state = db.read()
    const actor = getUser(state, actorId)
    const target = getUser(state, targetUserId)
    if (actor.role !== 'admin1') fail('Hanya Admin 1 yang bisa mengubah role')
    if (actor.id === target.id) fail('Tidak bisa mengubah role sendiri')
    target.role = newRole
    db.log(state, actorId, 'set_role', `${target.username} -> ${newRole}`)
    db.write(state)
    return target
  },

  // ---------- ADMIN: STORE (Bos Toko) ----------
  upsertProduct(actorId, product) {
    const state = db.read()
    const actor = getUser(state, actorId)
    if (!isAdmin(actor.role)) fail('Kamu tidak punya izin admin')
    if (product.id) {
      const idx = state.products.findIndex((p) => p.id === product.id)
      if (idx === -1) fail('Produk tidak ditemukan')
      state.products[idx] = { ...state.products[idx], ...product }
    } else {
      state.products.push({ ...product, id: db.uid('p'), status: product.status || 'active' })
    }
    db.log(state, actorId, 'upsert_product', product.name)
    db.write(state)
    return state.products
  },

  deleteProduct(actorId, productId) {
    const state = db.read()
    const actor = getUser(state, actorId)
    if (!isAdmin(actor.role)) fail('Kamu tidak punya izin admin')
    state.products = state.products.filter((p) => p.id !== productId)
    db.log(state, actorId, 'delete_product', productId)
    db.write(state)
    return state.products
  },

  createGiftCode(actorId, { code, productId, maxUsage, expiration }) {
    const state = db.read()
    const actor = getUser(state, actorId)
    if (!isAdmin(actor.role)) fail('Kamu tidak punya izin admin')
    const rc = {
      code,
      rewardType: 'product',
      rewardValue: productId,
      targetRole: null,
      maxUsage: Number(maxUsage) || 1,
      usedCount: 0,
      usedBy: [],
      expiration: expiration || null,
      status: 'active',
    }
    state.redeemCodes.push(rc)
    db.log(state, actorId, 'create_gift_code', code)
    db.write(state)
    return rc
  },

  createAdminCode(actorId, { role, maxUsage, expiration }) {
    const state = db.read()
    const actor = getUser(state, actorId)
    if (actor.role !== 'admin1') fail('Hanya Admin 1 yang bisa membuat kode admin')
    const code = `MOVEUP-ADMIN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    const rc = {
      code,
      rewardType: 'role',
      rewardValue: role,
      targetRole: null,
      maxUsage: Number(maxUsage) || 1,
      usedCount: 0,
      usedBy: [],
      expiration: expiration || null,
      status: 'active',
    }
    state.redeemCodes.push(rc)
    db.log(state, actorId, 'create_admin_code', `role:${role}`)
    db.write(state)
    return rc
  },

  listRedeemCodes() {
    const state = db.read()
    return state.redeemCodes
  },

  setRedeemCodeStatus(actorId, code, status) {
    const state = db.read()
    const actor = getUser(state, actorId)
    if (!isAdmin(actor.role)) fail('Kamu tidak punya izin admin')
    const rc = state.redeemCodes.find((c) => c.code === code)
    if (!rc) fail('Kode tidak ditemukan')
    rc.status = status
    db.write(state)
    return rc
  },

  // ---------- ADMIN: DASHBOARD ----------
  dashboardStats() {
    const state = db.read()
    const totalUsers = state.users.length
    const activeUsers = state.users.filter((u) => u.status === 'active').length
    const inactiveUsers = totalUsers - activeUsers
    const totalStorageUsed = state.users.reduce((sum, u) => sum + u.storageUsed, 0)
    const totalFiles = state.files.filter((f) => !f.trashed).length
    const totalTransactions = state.transactions.length
    const salesByProduct = {}
    state.transactions.forEach((t) => {
      salesByProduct[t.productId] = (salesByProduct[t.productId] || 0) + 1
    })
    const bestProductId = Object.entries(salesByProduct).sort((a, b) => b[1] - a[1])[0]?.[0]
    const bestProduct = state.products.find((p) => p.id === bestProductId)
    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalStorageUsed,
      totalFiles,
      totalTransactions,
      bestProduct,
      recentLogs: state.auditLogs.slice(0, 8),
    }
  },

  auditLogs() {
    const state = db.read()
    return state.auditLogs
  },
}
