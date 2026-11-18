-- ====================================================================
-- DATABASE SCHEMA UPDATE: LMS SMAN 3 KOTA MALANG (SMARTI CONNECT)
-- Struktur Berjenjang: Mata Pelajaran -> Kelas -> Sub Bab -> Forum Diskusi
-- Dan Tabel Chat Pribadi dengan Peserta (Participant Isolation)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `lms_sman3` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `lms_sman3`;

-- 1. TABEL ROLE
CREATE TABLE IF NOT EXISTS `roles` (
    `role_id` INT AUTO_INCREMENT PRIMARY KEY,
    `role_name` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. TABEL USER
CREATE TABLE IF NOT EXISTS `users` (
    `user_id` VARCHAR(50) PRIMARY KEY,
    `role_id` INT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role_label` VARCHAR(50) NOT NULL,
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `avatar` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. TABEL MATA PELAJARAN (SUBJECTS)
CREATE TABLE IF NOT EXISTS `subjects` (
    `subject_id` VARCHAR(50) PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `description` TEXT NULL,
    `icon` VARCHAR(50) DEFAULT 'BookOpen',
    `color` VARCHAR(50) DEFAULT 'sky',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. TABEL KELAS (LMS_CLASSES) - Berelasi ke Mata Pelajaran
CREATE TABLE IF NOT EXISTS `lms_classes` (
    `class_id` VARCHAR(50) PRIMARY KEY,
    `subject_id` VARCHAR(50) NOT NULL,
    `teacher_id` VARCHAR(50) NOT NULL,
    `class_name` VARCHAR(50) NOT NULL,
    `academic_year` VARCHAR(20) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`subject_id`) ON DELETE CASCADE,
    FOREIGN KEY (`teacher_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. TABEL SUB BAB (SUB_CHAPTERS) - Wadah Pembahasan / Forum
CREATE TABLE IF NOT EXISTS `sub_chapters` (
    `sub_chapter_id` VARCHAR(50) PRIMARY KEY,
    `class_id` VARCHAR(50) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `chapter_number` INT DEFAULT 1,
    `description` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`class_id`) REFERENCES `lms_classes`(`class_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. TABEL ENROLLMENTS
CREATE TABLE IF NOT EXISTS `enrollments` (
    `enrollment_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` VARCHAR(50) NOT NULL,
    `class_id` VARCHAR(50) NOT NULL,
    `is_moderator` BOOLEAN DEFAULT FALSE,
    `enrollment_status` ENUM('active', 'pending') DEFAULT 'active',
    FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    FOREIGN KEY (`class_id`) REFERENCES `lms_classes`(`class_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. TABEL TOPIK FORUM DISKUSI (Berelasi ke SUB BAB & Hanya Guru Pembuat)
CREATE TABLE IF NOT EXISTS `discussion_topics` (
    `topic_id` VARCHAR(50) PRIMARY KEY,
    `sub_chapter_id` VARCHAR(50) NOT NULL,
    `class_id` VARCHAR(50) NOT NULL,
    `creator_id` VARCHAR(50) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `moderation_status` ENUM('open', 'closed') DEFAULT 'open',
    `replies_count` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`sub_chapter_id`) REFERENCES `sub_chapters`(`sub_chapter_id`) ON DELETE CASCADE,
    FOREIGN KEY (`class_id`) REFERENCES `lms_classes`(`class_id`) ON DELETE CASCADE,
    FOREIGN KEY (`creator_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. TABEL PESAN FORUM DISKUSI
CREATE TABLE IF NOT EXISTS `discussion_messages` (
    `message_id` VARCHAR(50) PRIMARY KEY,
    `topic_id` VARCHAR(50) NOT NULL,
    `sender_id` VARCHAR(50) NOT NULL,
    `sender_name` VARCHAR(100) NOT NULL,
    `sender_role` VARCHAR(50) NOT NULL,
    `parent_message_id` VARCHAR(50) NULL,
    `message_content` TEXT NOT NULL,
    `message_status` ENUM('visible', 'flagged', 'deleted') DEFAULT 'visible',
    `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`topic_id`) REFERENCES `discussion_topics`(`topic_id`) ON DELETE CASCADE,
    FOREIGN KEY (`sender_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. TABEL CHAT PRIBADI DENGAN PESERTA (SECURE DIRECT MESSAGES)
CREATE TABLE IF NOT EXISTS `direct_messages` (
    `message_id` VARCHAR(50) PRIMARY KEY,
    `conversation_id` VARCHAR(100) NOT NULL,
    `channel_type` VARCHAR(50) NOT NULL DEFAULT 'private',
    `sender_id` VARCHAR(50) NOT NULL,
    `recipient_id` VARCHAR(50) NOT NULL,
    `sender_name` VARCHAR(100) NOT NULL,
    `sender_role` VARCHAR(50) NOT NULL,
    `message_content` TEXT NOT NULL,
    `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`sender_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    FOREIGN KEY (`recipient_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================================================
-- SEED DATA AWAL
-- ====================================================================

INSERT IGNORE INTO `roles` (`role_id`, `role_name`) VALUES 
(1, 'Admin'), 
(2, 'Guru'), 
(3, 'Murid'), 
(4, 'Orang Tua');

INSERT IGNORE INTO `users` (`user_id`, `role_id`, `name`, `email`, `password_hash`, `role_label`, `status`, `avatar`) VALUES
('usr-guru-minjeong', 2, 'Bu Guru Kim Minjeong, S.Pd.', 'guru@sman3malang.sch.id', 'password123', 'Guru Fisika', 'active', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'),
('usr-siswa-ryujin', 3, 'Shin Ryujin', 'siswa@sman3malang.sch.id', 'password123', 'Siswa / Moderator', 'active', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150'),
('usr-siswa-yizhou', 3, 'Ning Yizhou', 'yizhou@sman3malang.sch.id', 'password123', 'Siswa', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'),
('usr-ortu-karina', 4, 'Bu Karina (Wali Ning Yizhou)', 'orangtua@gmail.com', 'password123', 'Orang Tua Murid', 'active', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'),
('usr-admin-aminah', 1, 'Siti Aminah, S.Kom.', 'admin@sman3malang.sch.id', 'password123', 'Administrator LMS', 'active', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150');

-- 3 Mata Pelajaran Utama
INSERT IGNORE INTO `subjects` (`subject_id`, `name`, `code`, `description`, `icon`, `color`) VALUES
('mapel-fisika', 'Fisika', 'FIS', 'Konsep gerak, dinamika, termodinamika, dan gelombang', 'Atom', 'sky'),
('mapel-matematika', 'Matematika', 'MTK', 'Aljabar, kalkulus, trigonometri, dan statistika terapan', 'Calculator', 'emerald'),
('mapel-informatika', 'Informatika', 'INF', 'Algoritma, pemrograman web, basis data, dan jaringan', 'Cpu', 'indigo'),
('mapel-bindo', 'Bahasa Indonesia', 'BIN', 'Literasi teks eksposisi, teks argumentasi, dan resensi sastra', 'BookOpen', 'amber');

-- Kelas Fisika & Lainnya
INSERT IGNORE INTO `lms_classes` (`class_id`, `subject_id`, `teacher_id`, `class_name`, `academic_year`) VALUES
('cls-fisika-xi-3', 'mapel-fisika', 'usr-guru-minjeong', 'XI MIPA 3', '2026/2027'),
('cls-fisika-xi-4', 'mapel-fisika', 'usr-guru-minjeong', 'XI MIPA 4', '2026/2027'),
('cls-mtk-xi-3', 'mapel-matematika', 'usr-guru-minjeong', 'XI MIPA 3', '2026/2027'),
('cls-inf-xi-3', 'mapel-informatika', 'usr-guru-minjeong', 'XI MIPA 3', '2026/2027');

-- Sub Bab di Fisika XI MIPA 3
INSERT IGNORE INTO `sub_chapters` (`sub_chapter_id`, `class_id`, `title`, `chapter_number`, `description`) VALUES
('sub-hukum-newton', 'cls-fisika-xi-3', 'Hukum Newton tentang Gerak Benda', 1, 'Membahas Hukum I, II, dan III Newton beserta diagram gaya bebas pada bidang miring.'),
('sub-gravitasi', 'cls-fisika-xi-3', 'Gaya Gravitasi & Hukum Kepler', 2, 'Gaya tarik antar massa dan orbit edar planet.'),
('sub-usaha-energi', 'cls-fisika-xi-3', 'Usaha, Daya, dan Hukum Kekekalan Energi', 3, 'Transformasi energi mekanik, kinetik, dan potensial.');

-- Topik Forum Diskusi SMAN 3 (Hanya ada di sub-hukum-newton)
INSERT IGNORE INTO `discussion_topics` (`topic_id`, `sub_chapter_id`, `class_id`, `creator_id`, `title`, `description`, `moderation_status`, `replies_count`) VALUES
('top-fisika-newton', 'sub-hukum-newton', 'cls-fisika-xi-3', 'usr-guru-minjeong', 'FORUM KELAS: Analisis Hukum II Newton (Fisika XI MIPA 3)', 'Penerapan konsep Hukum II Newton dalam aktivitas sehari-hari.', 'open', 0);
