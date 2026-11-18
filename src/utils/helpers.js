// Helper utilities for SMAN 3 Kota Malang LMS

export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'guru',
  STUDENT: 'siswa',
  PARENT: 'orang_tua'
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator LMS',
  [ROLES.TEACHER]: 'Guru / Tenaga Pengajar',
  [ROLES.STUDENT]: 'Peserta Didik (Siswa)',
  [ROLES.PARENT]: 'Orang Tua / Wali Murid'
};

export const ROLE_BADGES = {
  [ROLES.ADMIN]: { bg: '#fee2e2', color: '#991b1b', text: 'Admin' },
  [ROLES.TEACHER]: { bg: '#e0e7ff', color: '#3730a3', text: 'Guru' },
  [ROLES.STUDENT]: { bg: '#dcfce7', color: '#166534', text: 'Siswa' },
  [ROLES.PARENT]: { bg: '#fef3c7', color: '#92400e', text: 'Orang Tua' }
};

export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date) + ' WIB';
}

export function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Baru saja';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m yang lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}j yang lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}hari yang lalu`;
  
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function getAvatarUrl(name, role = 'siswa') {
  const encoded = encodeURIComponent(name || 'User');
  let bg = '1e40af';
  if (role === ROLES.TEACHER) bg = '4f46e5';
  if (role === ROLES.ADMIN) bg = 'dc2626';
  if (role === ROLES.PARENT) bg = 'd97706';
  
  return `https://ui-avatars.com/api/?name=${encoded}&background=${bg}&color=fff&bold=true&size=128`;
}
