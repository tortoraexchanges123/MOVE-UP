// Simple localStorage-backed "database" so the whole app works with zero
// backend/config and deploys as a static site without any server needed.
const KEY = 'moveup_db_v1'

const GB = 1024 * 1024 * 1024

function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

function seed() {
  const now = new Date().toISOString()
  const adminId = 'u_admin1'
  const userId = 'u_demo1'
  return {
    users: [
      {
        id: adminId,
        name: 'Rizky Maulana',
        username: 'admin',
        email: 'admin@moveup.app',
        password: 'admin123',
        photo: '',
        role: 'admin1',
        storageQuota: 100 * GB,
        storageUsed: 0,
        coins: 5000,
        status: 'active',
        createdAt: now,
      },
      {
        id: userId,
        name: 'Andi Saputra',
        username: 'andi',
        email: 'andi@moveup.app',
        password: 'user123',
        photo: '',
        role: 'user',
        storageQuota: 10 * GB,
        storageUsed: 0,
        coins: 250,
        status: 'active',
        createdAt: now,
      },
    ],
    files: [],
    folders: [],
    products: [
      { id: 'p1', name: 'Efek Upload Berhasil', type: 'notif', description: 'Animasi awan biru saat upload selesai.', price: 100, status: 'active', emoji: '☁️' },
      { id: 'p2', name: 'Efek Download', type: 'notif', description: 'Panah biru turun saat download selesai.', price: 100, status: 'active', emoji: '⬇️' },
      { id: 'p3', name: 'Efek Hapus Sampah', type: 'sampah', description: 'Efek tempat sampah hijau saat menghapus file.', price: 100, status: 'active', emoji: '🗑️' },
      { id: 'p4', name: 'Tema Dark Neon', type: 'tema', description: 'Tema gelap dengan aksen neon ungu-biru.', price: 500, status: 'active', emoji: '🌌' },
      { id: 'p5', name: 'Tema Light Minimal', type: 'tema', description: 'Tema terang bersih dan minimal.', price: 500, status: 'active', emoji: '🤍' },
      { id: 'p6', name: 'Tema Anime', type: 'tema', description: 'Tema bertema ilustrasi anime pastel.', price: 750, status: 'active', emoji: '🌸' },
    ],
    collection: [], // {id, userId, productId, acquiredAt, active}
    redeemCodes: [
      { code: 'MOVEUP-GIFT-2026', rewardType: 'storage', rewardValue: 10 * GB, targetRole: null, maxUsage: 100, usedCount: 0, expiration: null, status: 'active' },
    ],
    transactions: [],
    auditLogs: [],
    session: null, // current logged-in user id
  }
}

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      const s = seed()
      localStorage.setItem(KEY, JSON.stringify(s))
      return s
    }
    return JSON.parse(raw)
  } catch (e) {
    const s = seed()
    localStorage.setItem(KEY, JSON.stringify(s))
    return s
  }
}

function write(db) {
  localStorage.setItem(KEY, JSON.stringify(db))
}

function log(db, userId, action, detail = '') {
  db.auditLogs.unshift({
    id: uid('log'),
    userId,
    action,
    detail,
    at: new Date().toISOString(),
  })
  db.auditLogs = db.auditLogs.slice(0, 500)
}

export const db = {
  GB,
  uid,
  seed,
  read,
  write,
  log,
}
