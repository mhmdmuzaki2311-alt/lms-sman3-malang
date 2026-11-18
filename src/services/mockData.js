// Mock Database Engine SMAN 3 Kota Malang
// Struktur Relasi Berjenjang: Mata Pelajaran -> Kelas -> Sub Bab -> Forum Diskusi
// 4 Peran: Admin, Guru, Siswa (Murid), Orang Tua

export const MOCK_ROLES = [
  { role_id: 1, role_name: 'Admin' },
  { role_id: 2, role_name: 'Guru' },
  { role_id: 3, role_name: 'Murid' }, // Siswa
  { role_id: 4, role_name: 'Orang Tua' }
];

export const MOCK_USERS = [
  {
    user_id: 2,
    id: 'usr-guru-minjeong',
    role_id: 2,
    name: 'Bu Guru Kim Minjeong, S.Pd.',
    displayName: 'Minjeong',
    email: 'guru@sman3malang.sch.id',
    password: 'password123',
    role: 'guru',
    roleLabel: 'Guru',
    mapel: 'Guru Fisika XI MIPA-3',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    status: 'active',
    isModerator: true
  },
  {
    user_id: 3,
    id: 'usr-siswa-ryujin',
    role_id: 3,
    name: 'Shin Ryujin',
    displayName: 'Ryujin',
    email: 'siswa@sman3malang.sch.id',
    password: 'password123',
    role: 'murid',
    roleLabel: 'Moderator',
    kelas: 'XI MIPA 3',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    status: 'active',
    isModerator: true
  },
  {
    user_id: 4,
    id: 'usr-siswa-yizhou',
    role_id: 3,
    name: 'Ning Yizhou',
    displayName: 'Yizhou',
    email: 'yizhou@sman3malang.sch.id',
    password: 'password123',
    role: 'murid',
    roleLabel: 'Siswa',
    kelas: 'XI MIPA 3',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    status: 'active',
    isModerator: false
  },
  {
    user_id: 5,
    id: 'usr-ortu-karina',
    role_id: 4,
    name: 'Bu Karina',
    fullName: 'Bu Karina (Orang Tua Ning Yizhou)',
    displayName: 'Karina',
    email: 'orangtua@gmail.com',
    password: 'password123',
    role: 'orang_tua',
    roleLabel: 'Orang tua/Wali',
    childName: 'Ning Yizhou',
    childKelas: 'XI MIPA 3',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    status: 'active'
  },
  {
    user_id: 1,
    id: 'usr-admin-sim',
    role_id: 1,
    name: 'Siti Aminah, S.Kom.',
    displayName: 'Admin SIM',
    email: 'admin@sman3malang.sch.id',
    password: 'password123',
    role: 'admin',
    roleLabel: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    status: 'active'
  }
];

// 1. DATA MATA PELAJARAN LENGKAP (7 MATA PELAJARAN IDENTIK DENGAN FORM BUAT FORUM)
export const MOCK_SUBJECTS = [
  {
    id: 'mapel-fisika',
    name: 'Fisika',
    code: 'FIS',
    description: 'Konsep gerak, kinematika, dinamika, termodinamika, dan gelombang',
    icon: 'Atom',
    color: 'sky',
    teacher: 'Bu Guru Kim Minjeong, S.Pd.'
  },
  {
    id: 'mapel-matematika',
    name: 'Matematika',
    code: 'MTK',
    description: 'Aljabar, kalkulus, matriks, trigonometri, dan statistika terapan',
    icon: 'Calculator',
    color: 'emerald',
    teacher: 'Drs. H. Bambang Sudarsono'
  },
  {
    id: 'mapel-kimia',
    name: 'Kimia',
    code: 'KIM',
    description: 'Struktur atom, ikatan kimia, stoikiometri, dan larutan asam basa',
    icon: 'FlaskConical',
    color: 'purple',
    teacher: 'Dra. Nurul Hidayati, M.Pd.'
  },
  {
    id: 'mapel-biologi',
    name: 'Biologi',
    code: 'BIO',
    description: 'Biologi sel, genetika, metabolisme, ekosistem, dan bioteknologi',
    icon: 'Dna',
    color: 'teal',
    teacher: 'Dr. Agus Santoso, M.Si.'
  },
  {
    id: 'mapel-informatika',
    name: 'Informatika',
    code: 'INF',
    description: 'Algoritma, pemrograman web, basis data, dan jaringan komputer',
    icon: 'Cpu',
    color: 'indigo',
    teacher: 'Siti Aminah, S.Kom.'
  },
  {
    id: 'mapel-bindo',
    name: 'Bahasa Indonesia',
    code: 'BIN',
    description: 'Literasi teks eksposisi, teks argumentasi, negosiasi, dan resensi karya sastra',
    icon: 'BookOpen',
    color: 'amber',
    teacher: 'Dra. Endang Sulistyowati'
  },
  {
    id: 'mapel-binggris',
    name: 'Bahasa Inggris',
    code: 'ENG',
    description: 'Reading comprehension, writing narrative and analytical exposition texts',
    icon: 'Languages',
    color: 'blue',
    teacher: 'Sarah Williams, M.Ed.'
  }
];

// 2. DATA KELAS PER MAPEL (Fallback & API)
export const MOCK_CLASSES = [
  {
    class_id: 'cls-fisika-xi-3',
    id: 'cls-fisika-xi-3',
    subject_id: 'mapel-fisika',
    teacher_id: 'usr-guru-minjeong',
    class_name: 'XI MIPA 3',
    academic_year: '2026/2027',
    subject_name: 'Fisika',
    studentsCount: 32
  },
  {
    class_id: 'cls-fisika-xi-4',
    id: 'cls-fisika-xi-4',
    subject_id: 'mapel-fisika',
    teacher_id: 'usr-guru-minjeong',
    class_name: 'XI MIPA 4',
    academic_year: '2026/2027',
    subject_name: 'Fisika',
    studentsCount: 34
  },
  {
    class_id: 'cls-mtk-xi-3',
    id: 'cls-mtk-xi-3',
    subject_id: 'mapel-matematika',
    teacher_id: 'usr-guru-minjeong',
    class_name: 'XI MIPA 3',
    academic_year: '2026/2027',
    subject_name: 'Matematika',
    studentsCount: 32
  },
  {
    class_id: 'cls-inf-xi-3',
    id: 'cls-inf-xi-3',
    subject_id: 'mapel-informatika',
    teacher_id: 'usr-guru-minjeong',
    class_name: 'XI MIPA 3',
    academic_year: '2026/2027',
    subject_name: 'Informatika',
    studentsCount: 32
  }
];

// 3. DATA SUB BAB
export const MOCK_SUB_CHAPTERS = [
  {
    id: 'sub-hukum-newton',
    sub_chapter_id: 'sub-hukum-newton',
    class_id: 'cls-fisika-xi-3',
    title: 'Hukum Newton tentang Gerak Benda',
    chapter_number: 1,
    description: 'Membahas Hukum I, II, dan III Newton beserta diagram gaya bebas pada bidang miring.'
  },
  {
    id: 'sub-gravitasi',
    sub_chapter_id: 'sub-gravitasi',
    class_id: 'cls-fisika-xi-3',
    title: 'Gaya Gravitasi & Hukum Kepler',
    chapter_number: 2,
    description: 'Gaya tarik antar massa dan orbit edar planet.'
  },
  {
    id: 'sub-usaha-energi',
    sub_chapter_id: 'sub-usaha-energi',
    class_id: 'cls-fisika-xi-3',
    title: 'Usaha, Daya, dan Hukum Kekekalan Energi',
    chapter_number: 3,
    description: 'Transformasi energi mekanik, kinetik, dan potensial.'
  }
];

// 4. DATA TOPIK FORUM DISKUSI
export const MOCK_FORUM_TOPICS = [
  {
    id: 'top-fisika-newton',
    topic_id: 'top-fisika-newton',
    subChapterId: 'sub-hukum-newton',
    classId: 'cls-fisika-xi-3',
    courseName: 'Fisika',
    kelas: 'XI MIPA 3',
    title: 'FORUM KELAS: Analisis Hukum II Newton (Fisika XI MIPA 3)',
    creator: 'Bu Guru Kim Minjeong, S.Pd.',
    creatorTitle: 'Bu Guru Kim Minjeong [Guru Fisika]',
    creatorRole: 'guru',
    creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    tag: 'Penting',
    durasiMenit: 45,
    remainingTimeStr: '00:34:15',
    status: 'open',
    onlineCount: 32,
    pemantik: {
      author: 'Bu Guru Kim Minjeong, S.Pd.',
      authorTitle: 'Bu Guru Kim Minjeong [Guru Fisika]',
      timeStr: '09:15 WIB',
      text: 'Selamat pagi siswa-siswi XI MIPA 3. Pada sub bab Hukum Newton ini, diskusikan bagaimana Hukum II Newton menjelaskan percepatan pada benda di bidang miring bermassa licin dan kasar. Tuliskan jawaban serta pemikiran kalian di bawah.'
    },
    description: 'Penerapan konsep Hukum II Newton dalam aktivitas sehari-hari.'
  }
];

export const MOCK_FORUM_MESSAGES = [];
export const MOCK_PARENT_TEACHER_MESSAGES = [];
export const MOCK_NOTIFICATIONS = [];

// Aturan Akses Chat Terpusat
export const CHAT_PERMISSIONS = {
  guru: [
    { targetRole: 'murid', label: 'Chat dengan Siswa', description: 'Konsultasi bimbingan akademik dan tugas siswa' },
    { targetRole: 'orang_tua', label: 'Chat dengan Orang Tua', description: 'Laporan perkembangan belajar anak & komunikasi wali murid' }
  ],
  murid: [
    { targetRole: 'guru', label: 'Chat dengan Guru', description: 'Tanya materi pelajaran dan konsultasi langsung ke Guru pengajar' }
  ],
  orang_tua: [
    { targetRole: 'guru', label: 'Chat dengan Guru', description: 'Konsultasi pribadi tentang progres dan absensi anak ke Guru' }
  ],
  admin: [
    { targetRole: 'guru', label: 'Chat dengan Guru', description: 'Koordinasi teknis SIM dan akademik' },
    { targetRole: 'murid', label: 'Chat dengan Siswa', description: 'Bantuan teknis akun siswa' },
    { targetRole: 'orang_tua', label: 'Chat dengan Orang Tua', description: 'Bantuan akun wali murid' }
  ]
};

export const MOCK_COURSES = MOCK_CLASSES;
export const MOCK_MATERIALS = [];
export const MOCK_ASSIGNMENTS = [];
export const MOCK_SUBMISSIONS = [];
export const MOCK_QUIZZES = [];
export const MOCK_ATTENDANCES = [];
export const MOCK_STUDENTS = MOCK_USERS.filter(u => u.role === 'murid');
