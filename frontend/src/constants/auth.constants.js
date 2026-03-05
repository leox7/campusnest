export const GALLERY_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    alt: 'Modern student room with desk',
  },
  {
    src: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    alt: 'Bright shared student apartment',
  },
  {
    src: 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1200&q=80',
    alt: 'Cozy accommodation bedroom',
  },
  {
    src: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    alt: 'Contemporary room near campus',
  },
  {
    src: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80',
    alt: 'Comfortable student interior',
  },
]

export const ROUTE_META = {
  '/login/student': { title: 'Student Login', role: 'student', mode: 'login' },
  '/login/landlord': { title: 'Landlord Login', role: 'landlord', mode: 'login' },
  '/register/student': { title: 'Student Registration', role: 'student', mode: 'register' },
  '/register/landlord': { title: 'Landlord Registration', role: 'landlord', mode: 'register' },
  '/login/admin': { title: 'Admin Login', role: 'admin', mode: 'login' },
}

export const ROLE_ROUTES = {
  student: { login: '/login/student', register: '/register/student' },
  landlord: { login: '/login/landlord', register: '/register/landlord' },
  admin: { login: '/login/admin' },
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
