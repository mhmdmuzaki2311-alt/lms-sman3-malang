import Database from 'better-sqlite3';
import mysql from 'mysql2/promise';

// Konfigurasi Database MySQL (Laragon default)
const MYSQL_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lms_sman3',
};

let dbMode = 'sqlite'; // 'mysql' | 'sqlite'
let mysqlPool = null;
let sqliteDb = null;

// Daftar Lengkap 7 Mata Pelajaran SMAN 3 Kota Malang (Sumber Tunggal)
export const SEED_SUBJECTS = [
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

// Inisialisasi Database
export async function initDatabase() {
  try {
    const rawConn = await mysql.createConnection({
      host: MYSQL_CONFIG.host,
      port: MYSQL_CONFIG.port,
      user: MYSQL_CONFIG.user,
      password: MYSQL_CONFIG.password,
    });

    await rawConn.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_CONFIG.database}\` DEFAULT CHARACTER SET utf8mb4;`);
    await rawConn.end();

    mysqlPool = mysql.createPool(MYSQL_CONFIG);
    await initMysqlTables(mysqlPool);
    dbMode = 'mysql';
    console.log(`[Database] Terhubung ke MySQL (Laragon) database: ${MYSQL_CONFIG.database}`);
    return { mode: 'mysql' };
  } catch (err) {
    console.warn(`[Database] MySQL tidak terdeteksi (${err.message}). Menggunakan SQLite bawaan (server/forum.db) yang siap pakai.`);
    initSqliteTables();
    dbMode = 'sqlite';
    return { mode: 'sqlite' };
  }
}

// Inisialisasi Tabel MySQL
async function initMysqlTables(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS roles (
      role_id INT AUTO_INCREMENT PRIMARY KEY,
      role_name VARCHAR(50) NOT NULL UNIQUE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id VARCHAR(50) PRIMARY KEY,
      role_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role_label VARCHAR(50) NOT NULL,
      status VARCHAR(20) DEFAULT 'active',
      avatar VARCHAR(255) NULL
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS subjects (
      subject_id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      code VARCHAR(20) NOT NULL UNIQUE,
      description TEXT NULL,
      icon VARCHAR(50) DEFAULT 'BookOpen',
      color VARCHAR(50) DEFAULT 'sky',
      teacher VARCHAR(100) NULL,
      created_at VARCHAR(50) NOT NULL
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS lms_classes (
      class_id VARCHAR(50) PRIMARY KEY,
      subject_id VARCHAR(50) NOT NULL,
      teacher_id VARCHAR(50) NOT NULL,
      class_name VARCHAR(50) NOT NULL,
      academic_year VARCHAR(20) NOT NULL,
      created_at VARCHAR(50) NOT NULL
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sub_chapters (
      sub_chapter_id VARCHAR(50) PRIMARY KEY,
      class_id VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      chapter_number INT DEFAULT 1,
      description TEXT NULL,
      created_at VARCHAR(50) NOT NULL
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS discussion_topics (
      topic_id VARCHAR(50) PRIMARY KEY,
      sub_chapter_id VARCHAR(50) NOT NULL,
      class_id VARCHAR(50) NOT NULL,
      course_name VARCHAR(100) NULL,
      creator_id VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NULL,
      moderation_status VARCHAR(20) DEFAULT 'open',
      replies_count INT DEFAULT 0,
      created_at VARCHAR(50) NOT NULL
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS discussion_messages (
      message_id VARCHAR(50) PRIMARY KEY,
      topic_id VARCHAR(50) NOT NULL,
      sender_id VARCHAR(50) NOT NULL,
      sender_name VARCHAR(100) NOT NULL,
      sender_role VARCHAR(50) NOT NULL,
      parent_message_id VARCHAR(50) NULL,
      message_content TEXT NOT NULL,
      sent_at VARCHAR(50) NOT NULL
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS conversations (
      conversation_id VARCHAR(100) PRIMARY KEY,
      user_one_id VARCHAR(50) NOT NULL,
      user_two_id VARCHAR(50) NOT NULL,
      last_message_text TEXT NULL,
      last_message_at VARCHAR(50) NULL,
      created_at VARCHAR(50) NOT NULL
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS direct_messages (
      message_id VARCHAR(50) PRIMARY KEY,
      conversation_id VARCHAR(100) NOT NULL,
      channel_type VARCHAR(50) NOT NULL DEFAULT 'private',
      sender_id VARCHAR(50) NOT NULL,
      recipient_id VARCHAR(50) NOT NULL,
      sender_name VARCHAR(100) NOT NULL,
      sender_role VARCHAR(50) NOT NULL,
      message_content TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      sent_at VARCHAR(50) NOT NULL
    ) ENGINE=InnoDB;
  `);

  // Auto-migration: Tambahkan kolom yang belum ada jika tabel sudah ada dari skema lama
  async function ensureMysqlColumn(table, column, definition) {
    try {
      const [cols] = await pool.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
      if (cols.length === 0) {
        await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
        console.log(`[Database Migration] Menambahkan kolom \`${column}\` ke tabel \`${table}\` di MySQL.`);
      }
    } catch (err) {
      console.warn(`[Database Migration Warning] ${table}.${column}:`, err.message);
    }
  }

  await ensureMysqlColumn('direct_messages', 'recipient_id', "VARCHAR(50) NOT NULL DEFAULT 'system' AFTER sender_id");
  await ensureMysqlColumn('direct_messages', 'is_read', "BOOLEAN DEFAULT FALSE AFTER message_content");
  await ensureMysqlColumn('discussion_topics', 'sub_chapter_id', "VARCHAR(50) NOT NULL DEFAULT 'sub-hukum-newton' AFTER topic_id");
  await ensureMysqlColumn('discussion_topics', 'course_name', "VARCHAR(100) NULL DEFAULT 'Fisika' AFTER class_id");

  // Seed semua 7 mata pelajaran
  for (const s of SEED_SUBJECTS) {
    await pool.query(`
      INSERT IGNORE INTO subjects (subject_id, name, code, description, icon, color, teacher, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [s.id, s.name, s.code, s.description, s.icon, s.color, s.teacher, new Date().toISOString()]);
  }

  // Seed kelas Fisika XI MIPA 3 dan default sub-chapter jika belum ada
  const [clsRows] = await pool.query('SELECT COUNT(*) as cnt FROM lms_classes WHERE class_id = ?', ['cls-fisika-xi-3']);
  if (clsRows[0].cnt === 0) {
    const now = new Date().toISOString();
    await pool.query(`
      INSERT INTO lms_classes (class_id, subject_id, teacher_id, class_name, academic_year, created_at)
      VALUES ('cls-fisika-xi-3', 'mapel-fisika', 'usr-guru-minjeong', 'XI MIPA 3', '2026/2027', ?)
    `, [now]);

    await pool.query(`
      INSERT INTO sub_chapters (sub_chapter_id, class_id, title, chapter_number, description, created_at)
      VALUES ('sub-hukum-newton', 'cls-fisika-xi-3', 'Hukum Newton tentang Gerak Benda', 1, 'Membahas Hukum I, II, dan III Newton beserta diagram gaya bebas pada bidang miring.', ?)
    `, [now]);

    await pool.query(`
      INSERT INTO discussion_topics (topic_id, sub_chapter_id, class_id, course_name, creator_id, title, description, moderation_status, replies_count, created_at)
      VALUES ('top-fisika-newton', 'sub-hukum-newton', 'cls-fisika-xi-3', 'Fisika', 'usr-guru-minjeong', 'FORUM KELAS: Analisis Hukum II Newton (Fisika XI MIPA 3)', 'Penerapan konsep Hukum II Newton dalam aktivitas sehari-hari.', 'open', 0, ?)
    `, [now]);
  }
}

// Inisialisasi Tabel SQLite
function initSqliteTables() {
  sqliteDb = new Database('server/forum.db');
  sqliteDb.pragma('journal_mode = WAL');

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
      subject_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      description TEXT,
      icon TEXT DEFAULT 'BookOpen',
      color TEXT DEFAULT 'sky',
      teacher TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lms_classes (
      class_id TEXT PRIMARY KEY,
      subject_id TEXT NOT NULL,
      teacher_id TEXT NOT NULL,
      class_name TEXT NOT NULL,
      academic_year TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sub_chapters (
      sub_chapter_id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL,
      title TEXT NOT NULL,
      chapter_number INTEGER DEFAULT 1,
      description TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS discussion_topics (
      topic_id TEXT PRIMARY KEY,
      sub_chapter_id TEXT NOT NULL,
      class_id TEXT NOT NULL,
      course_name TEXT,
      creator_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      moderation_status TEXT DEFAULT 'open',
      replies_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS discussion_messages (
      message_id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      parent_message_id TEXT,
      message_content TEXT NOT NULL,
      sent_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conversations (
      conversation_id TEXT PRIMARY KEY,
      user_one_id TEXT NOT NULL,
      user_two_id TEXT NOT NULL,
      last_message_text TEXT,
      last_message_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS direct_messages (
      message_id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      channel_type TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      message_content TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      sent_at TEXT NOT NULL
    );
  `);

  // Auto-migration SQLite: Tambahkan kolom yang belum ada dari skema lama
  function ensureSqliteColumn(table, column, definition) {
    try {
      const cols = sqliteDb.pragma(`table_info(${table})`);
      const exists = cols.some((c) => c.name === column);
      if (!exists) {
        sqliteDb.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
        console.log(`[Database Migration] Menambahkan kolom ${column} ke tabel ${table} di SQLite.`);
      }
    } catch (err) {
      console.warn(`[Database Migration Warning SQLite] ${table}.${column}:`, err.message);
    }
  }

  ensureSqliteColumn('direct_messages', 'recipient_id', "TEXT DEFAULT 'system'");
  ensureSqliteColumn('direct_messages', 'is_read', "INTEGER DEFAULT 0");
  ensureSqliteColumn('discussion_topics', 'sub_chapter_id', "TEXT DEFAULT 'sub-hukum-newton'");
  ensureSqliteColumn('discussion_topics', 'course_name', "TEXT DEFAULT 'Fisika'");

  // Seed semua 7 mata pelajaran jika kosong
  const countStmt = sqliteDb.prepare('SELECT COUNT(*) as cnt FROM subjects');
  if (countStmt.get().cnt === 0) {
    const now = new Date().toISOString();
    const insSub = sqliteDb.prepare(`
      INSERT OR IGNORE INTO subjects (subject_id, name, code, description, icon, color, teacher, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const s of SEED_SUBJECTS) {
      insSub.run(s.id, s.name, s.code, s.description, s.icon, s.color, s.teacher, now);
    }

    // Seed kelas & sub bab
    const insClass = sqliteDb.prepare(`
      INSERT OR IGNORE INTO lms_classes (class_id, subject_id, teacher_id, class_name, academic_year, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insClass.run('cls-fisika-xi-3', 'mapel-fisika', 'usr-guru-minjeong', 'XI MIPA 3', '2026/2027', now);
    insClass.run('cls-fisika-xi-4', 'mapel-fisika', 'usr-guru-minjeong', 'XI MIPA 4', '2026/2027', now);
    insClass.run('cls-mtk-xi-3', 'mapel-matematika', 'usr-guru-minjeong', 'XI MIPA 3', '2026/2027', now);
    insClass.run('cls-inf-xi-3', 'mapel-informatika', 'usr-guru-minjeong', 'XI MIPA 3', '2026/2027', now);

    const insSubChapter = sqliteDb.prepare(`
      INSERT OR IGNORE INTO sub_chapters (sub_chapter_id, class_id, title, chapter_number, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insSubChapter.run('sub-hukum-newton', 'cls-fisika-xi-3', 'Hukum Newton tentang Gerak Benda', 1, 'Membahas Hukum I, II, dan III Newton beserta diagram gaya bebas pada bidang miring.', now);
    insSubChapter.run('sub-gravitasi', 'cls-fisika-xi-3', 'Gaya Gravitasi & Hukum Kepler', 2, 'Gaya tarik antar massa dan orbit edar planet.', now);
    insSubChapter.run('sub-usaha-energi', 'cls-fisika-xi-3', 'Usaha, Daya, dan Hukum Kekekalan Energi', 3, 'Transformasi energi mekanik, kinetik, dan potensial.', now);

    const insTopic = sqliteDb.prepare(`
      INSERT OR IGNORE INTO discussion_topics (topic_id, sub_chapter_id, class_id, course_name, creator_id, title, description, moderation_status, replies_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insTopic.run(
      'top-fisika-newton',
      'sub-hukum-newton',
      'cls-fisika-xi-3',
      'Fisika',
      'usr-guru-minjeong',
      'FORUM KELAS: Analisis Hukum II Newton (Fisika XI MIPA 3)',
      'Penerapan konsep Hukum II Newton dalam aktivitas sehari-hari.',
      'open',
      0,
      now
    );
  }
}

// ========================================================
// DATA ACCESS FUNCTIONS
// ========================================================

export async function getDbStatus() {
  return {
    engine: dbMode,
    database: dbMode === 'mysql' ? MYSQL_CONFIG.database : 'server/forum.db',
    host: dbMode === 'mysql' ? MYSQL_CONFIG.host : 'local'
  };
}

// 1. Mata Pelajaran (Subjects)
export async function getSubjects() {
  if (dbMode === 'mysql') {
    const [rows] = await mysqlPool.query('SELECT * FROM subjects ORDER BY name ASC');
    return rows.map(r => ({
      id: r.subject_id,
      name: r.name,
      code: r.code,
      description: r.description,
      icon: r.icon,
      color: r.color,
      teacher: r.teacher
    }));
  } else {
    const rows = sqliteDb.prepare('SELECT * FROM subjects ORDER BY name ASC').all();
    return rows.map(r => ({
      id: r.subject_id,
      name: r.name,
      code: r.code,
      description: r.description,
      icon: r.icon,
      color: r.color,
      teacher: r.teacher
    }));
  }
}

// 2. Kelas Berdasarkan Subject
export async function getClassesBySubject(subjectId) {
  if (dbMode === 'mysql') {
    const [rows] = await mysqlPool.query('SELECT * FROM lms_classes WHERE subject_id = ? ORDER BY class_name ASC', [subjectId]);
    return rows.map(r => ({
      id: r.class_id,
      subjectId: r.subject_id,
      teacherId: r.teacher_id,
      className: r.class_name,
      academicYear: r.academic_year
    }));
  } else {
    const rows = sqliteDb.prepare('SELECT * FROM lms_classes WHERE subject_id = ? ORDER BY class_name ASC').all(subjectId);
    return rows.map(r => ({
      id: r.class_id,
      subjectId: r.subject_id,
      teacherId: r.teacher_id,
      className: r.class_name,
      academicYear: r.academic_year
    }));
  }
}

// 3. Sub Bab Berdasarkan Kelas
export async function getSubChaptersByClass(classId) {
  if (dbMode === 'mysql') {
    const [rows] = await mysqlPool.query('SELECT * FROM sub_chapters WHERE class_id = ? ORDER BY chapter_number ASC', [classId]);
    return rows.map(r => ({
      id: r.sub_chapter_id,
      classId: r.class_id,
      title: r.title,
      chapterNumber: r.chapter_number,
      description: r.description
    }));
  } else {
    const rows = sqliteDb.prepare('SELECT * FROM sub_chapters WHERE class_id = ? ORDER BY chapter_number ASC').all(classId);
    return rows.map(r => ({
      id: r.sub_chapter_id,
      classId: r.class_id,
      title: r.title,
      chapterNumber: r.chapter_number,
      description: r.description
    }));
  }
}

// 4. Topik Forum Berdasarkan Sub Bab
export async function getTopicsBySubChapter(subChapterId) {
  if (dbMode === 'mysql') {
    const [rows] = await mysqlPool.query('SELECT * FROM discussion_topics WHERE sub_chapter_id = ? ORDER BY created_at DESC', [subChapterId]);
    return rows.map(r => ({
      id: r.topic_id,
      subChapterId: r.sub_chapter_id,
      classId: r.class_id,
      courseName: r.course_name,
      creatorId: r.creator_id,
      title: r.title,
      description: r.description,
      status: r.moderation_status,
      repliesCount: r.replies_count,
      createdAt: r.created_at
    }));
  } else {
    const rows = sqliteDb.prepare('SELECT * FROM discussion_topics WHERE sub_chapter_id = ? ORDER BY created_at DESC').all(subChapterId);
    return rows.map(r => ({
      id: r.topic_id,
      subChapterId: r.sub_chapter_id,
      classId: r.class_id,
      courseName: r.course_name,
      creatorId: r.creator_id,
      title: r.title,
      description: r.description,
      status: r.moderation_status,
      repliesCount: r.replies_count,
      createdAt: r.created_at
    }));
  }
}

// 5. Semua Topik Forum
export async function getTopics() {
  if (dbMode === 'mysql') {
    const [rows] = await mysqlPool.query('SELECT * FROM discussion_topics ORDER BY created_at DESC');
    return rows.map(r => ({
      id: r.topic_id,
      subChapterId: r.sub_chapter_id,
      classId: r.class_id,
      courseName: r.course_name,
      creatorId: r.creator_id,
      title: r.title,
      description: r.description,
      status: r.moderation_status,
      repliesCount: r.replies_count,
      createdAt: r.created_at
    }));
  } else {
    const rows = sqliteDb.prepare('SELECT * FROM discussion_topics ORDER BY created_at DESC').all();
    return rows.map(r => ({
      id: r.topic_id,
      subChapterId: r.sub_chapter_id,
      classId: r.class_id,
      courseName: r.course_name,
      creatorId: r.creator_id,
      title: r.title,
      description: r.description,
      status: r.moderation_status,
      repliesCount: r.replies_count,
      createdAt: r.created_at
    }));
  }
}

// Helper: dapatkan atau buat kelas otomatis jika mapel belum punya kelas terdaftar
export async function ensureClassForSubject(subjectName, className = 'XI MIPA 3') {
  const subjectSlug = subjectName.toLowerCase().replace(/\s+/g, '-');
  const classId = `cls-${subjectSlug}-${className.toLowerCase().replace(/\s+/g, '-')}`;
  const subjectId = `mapel-${subjectSlug}`;
  const now = new Date().toISOString();

  if (dbMode === 'mysql') {
    await mysqlPool.query(`
      INSERT IGNORE INTO lms_classes (class_id, subject_id, teacher_id, class_name, academic_year, created_at)
      VALUES (?, ?, 'usr-guru-minjeong', ?, '2026/2027', ?)
    `, [classId, subjectId, className, now]);
  } else {
    sqliteDb.prepare(`
      INSERT OR IGNORE INTO lms_classes (class_id, subject_id, teacher_id, class_name, academic_year, created_at)
      VALUES (?, ?, 'usr-guru-minjeong', ?, '2026/2027', ?)
    `).run(classId, subjectId, className, now);
  }
  return classId;
}

// Helper: pastikan sub bab ada
export async function ensureSubChapterForClass(classId, title = 'Pendahuluan Materi') {
  const subId = `sub-${classId}-intro`;
  const now = new Date().toISOString();

  if (dbMode === 'mysql') {
    await mysqlPool.query(`
      INSERT IGNORE INTO sub_chapters (sub_chapter_id, class_id, title, chapter_number, description, created_at)
      VALUES (?, ?, ?, 1, 'Pembahasan materi dasar dan diskusi kelas.', ?)
    `, [subId, classId, title, now]);
  } else {
    sqliteDb.prepare(`
      INSERT OR IGNORE INTO sub_chapters (sub_chapter_id, class_id, title, chapter_number, description, created_at)
      VALUES (?, ?, ?, 1, 'Pembahasan materi dasar dan diskusi kelas.', ?)
    `).run(subId, classId, title, now);
  }
  return subId;
}

// Validasi & Simpan Topik (HANYA GURU YANG BISA BUAT FORUM)
export async function createTopic(topic, creatorRole = 'guru') {
  if (creatorRole !== 'guru') {
    throw new Error('Akses ditolak: Hanya role Guru yang memiliki otorisasi membuat forum diskusi baru.');
  }

  const id = topic.id || `topic-${Date.now()}`;
  const courseName = topic.courseName || 'Fisika';
  const targetKelas = topic.kelas || 'XI MIPA 3';

  // Pastikan relasi konsisten: jika mapel belum punya kelas / sub bab, buat secara otomatis
  const classId = topic.classId || await ensureClassForSubject(courseName, targetKelas);
  const subChapterId = topic.subChapterId || await ensureSubChapterForClass(classId, `Diskusi ${courseName}`);
  const createdAt = topic.createdAt || new Date().toISOString();

  if (dbMode === 'mysql') {
    await mysqlPool.query(`
      INSERT INTO discussion_topics (topic_id, sub_chapter_id, class_id, course_name, creator_id, title, description, moderation_status, replies_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, subChapterId, classId, courseName, topic.creatorId, topic.title, topic.description || '', 'open', 0, createdAt]);
  } else {
    const stmt = sqliteDb.prepare(`
      INSERT INTO discussion_topics (topic_id, sub_chapter_id, class_id, course_name, creator_id, title, description, moderation_status, replies_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, subChapterId, classId, courseName, topic.creatorId, topic.title, topic.description || '', 'open', 0, createdAt);
  }

  return { id, subChapterId, classId, courseName, ...topic, createdAt, repliesCount: 0, status: 'open' };
}

// 6. Pesan Forum
export async function getMessagesByTopic(topicId) {
  if (dbMode === 'mysql') {
    const [rows] = await mysqlPool.query(
      'SELECT * FROM discussion_messages WHERE topic_id = ? ORDER BY sent_at ASC',
      [topicId]
    );
    return rows.map(r => ({
      id: r.message_id,
      topicId: r.topic_id,
      senderId: r.sender_id,
      senderName: r.sender_name,
      senderRole: r.sender_role,
      parentMessageId: r.parent_message_id,
      text: r.message_content,
      createdAt: r.sent_at
    }));
  } else {
    const rows = sqliteDb.prepare(
      'SELECT * FROM discussion_messages WHERE topic_id = ? ORDER BY sent_at ASC'
    ).all(topicId);
    return rows.map(r => ({
      id: r.message_id,
      topicId: r.topic_id,
      senderId: r.sender_id,
      senderName: r.sender_name,
      senderRole: r.sender_role,
      parentMessageId: r.parent_message_id,
      text: r.message_content,
      createdAt: r.sent_at
    }));
  }
}

export async function insertMessage(msg) {
  const id = msg.id || `msg-${Date.now()}`;
  const sentAt = msg.createdAt || new Date().toISOString();

  if (dbMode === 'mysql') {
    await mysqlPool.query(`
      INSERT INTO discussion_messages (message_id, topic_id, sender_id, sender_name, sender_role, parent_message_id, message_content, sent_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, msg.topicId, msg.senderId, msg.senderName, msg.senderRole, msg.replyTo?.id || null, msg.text, sentAt]);

    await mysqlPool.query(`
      UPDATE discussion_topics SET replies_count = replies_count + 1 WHERE topic_id = ?
    `, [msg.topicId]);
  } else {
    const stmt = sqliteDb.prepare(`
      INSERT INTO discussion_messages (message_id, topic_id, sender_id, sender_name, sender_role, parent_message_id, message_content, sent_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, msg.topicId, msg.senderId, msg.senderName, msg.senderRole, msg.replyTo?.id || null, msg.text, sentAt);

    sqliteDb.prepare(`
      UPDATE discussion_topics SET replies_count = replies_count + 1 WHERE topic_id = ?
    `).run(msg.topicId);
  }

  return { ...msg, id, createdAt: sentAt };
}

// 7. Secure Direct Message (Peserta Terisolasi: Hanya 2 user yang terlibat)
export async function getSecureDirectMessages({ conversationId, userId }) {
  if (!conversationId || !userId) {
    throw new Error('Akses ditolak: Parameter conversationId dan identitas userId wajib disertakan.');
  }

  // Verifikasi apakah userId termasuk dalam conversation_id
  if (!conversationId.includes(userId)) {
    throw new Error('Akses ditolak: Anda bukan peserta yang sah dari percakapan pribadi ini.');
  }

  if (dbMode === 'mysql') {
    const [rows] = await mysqlPool.query(
      `SELECT * FROM direct_messages 
       WHERE conversation_id = ? AND (sender_id = ? OR recipient_id = ?)
       ORDER BY sent_at ASC`,
      [conversationId, userId, userId]
    );
    return rows.map(r => ({
      id: r.message_id,
      conversationId: r.conversation_id,
      channelType: r.channel_type,
      senderId: r.sender_id,
      recipientId: r.recipient_id,
      senderName: r.sender_name,
      senderRole: r.sender_role,
      text: r.message_content,
      isRead: Boolean(r.is_read),
      createdAt: r.sent_at,
      timeStr: new Date(r.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    }));
  } else {
    const rows = sqliteDb.prepare(
      `SELECT * FROM direct_messages 
       WHERE conversation_id = ? AND (sender_id = ? OR recipient_id = ?)
       ORDER BY sent_at ASC`
    ).all(conversationId, userId, userId);
    return rows.map(r => ({
      id: r.message_id,
      conversationId: r.conversation_id,
      channelType: r.channel_type,
      senderId: r.sender_id,
      recipientId: r.recipient_id,
      senderName: r.sender_name,
      senderRole: r.sender_role,
      text: r.message_content,
      isRead: Boolean(r.is_read),
      createdAt: r.sent_at,
      timeStr: new Date(r.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    }));
  }
}

export async function insertSecureDirectMessage(msg) {
  if (!msg.senderId || !msg.recipientId) {
    throw new Error('Validasi gagal: Pengirim (senderId) dan penerima (recipientId) wajib ada.');
  }

  // Standarisasi conversationId deterministik: chat-<id_terkecil>-<id_terbesar>
  const participants = [msg.senderId, msg.recipientId].sort();
  const canonicalConvId = `chat-${participants[0]}-${participants[1]}`;

  const id = msg.id || `dm-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const sentAt = msg.createdAt || new Date().toISOString();

  if (dbMode === 'mysql') {
    // 1. Catat ke tabel conversations
    await mysqlPool.query(`
      INSERT INTO conversations (conversation_id, user_one_id, user_two_id, last_message_text, last_message_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE last_message_text = VALUES(last_message_text), last_message_at = VALUES(last_message_at)
    `, [canonicalConvId, participants[0], participants[1], msg.text, sentAt, sentAt]);

    // 2. Simpan pesan langsung
    await mysqlPool.query(`
      INSERT INTO direct_messages (message_id, conversation_id, channel_type, sender_id, recipient_id, sender_name, sender_role, message_content, is_read, sent_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
      ON DUPLICATE KEY UPDATE message_content = VALUES(message_content)
    `, [id, canonicalConvId, msg.channelType || 'private', msg.senderId, msg.recipientId, msg.senderName, msg.senderRole, msg.text, sentAt]);
  } else {
    // 1. Catat ke tabel conversations di SQLite
    sqliteDb.prepare(`
      INSERT INTO conversations (conversation_id, user_one_id, user_two_id, last_message_text, last_message_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(conversation_id) DO UPDATE SET
        last_message_text = excluded.last_message_text,
        last_message_at = excluded.last_message_at
    `).run(canonicalConvId, participants[0], participants[1], msg.text, sentAt, sentAt);

    // 2. Simpan pesan ke direct_messages
    const stmt = sqliteDb.prepare(`
      INSERT INTO direct_messages (message_id, conversation_id, channel_type, sender_id, recipient_id, sender_name, sender_role, message_content, is_read, sent_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
      ON CONFLICT(message_id) DO UPDATE SET message_content = excluded.message_content
    `);
    stmt.run(id, canonicalConvId, msg.channelType || 'private', msg.senderId, msg.recipientId, msg.senderName, msg.senderRole, msg.text, sentAt);
  }

  return { ...msg, id, conversationId: canonicalConvId, createdAt: sentAt };
}
