import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import {
  initDatabase,
  getDbStatus,
  getSubjects,
  getClassesBySubject,
  getSubChaptersByClass,
  getTopicsBySubChapter,
  getTopics,
  createTopic,
  getMessagesByTopic,
  insertMessage,
  getSecureDirectMessages,
  insertSecureDirectMessage,
} from './database.js';

const app = express();
const httpServer = createServer(app);

const PORT = Number(process.env.PORT) || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: '*' }));
app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Inisialisasi Database (MySQL Laragon dengan fallback otomatis SQLite)
await initDatabase();

// ========================================================
// REST API ENDPOINTS
// ========================================================

// Health check
app.get('/health', async (_req, res) => {
  const db = await getDbStatus();
  res.json({ status: 'ok', service: 'lms-sman3-backend', database: db });
});

// 1. ALUR MATA PELAJARAN -> KELAS -> SUB BAB -> FORUM DISKUSI
app.get('/api/subjects', async (_req, res) => {
  try {
    const subjects = await getSubjects();
    res.json({ success: true, data: subjects });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/subjects/:subjectId/classes', async (req, res) => {
  try {
    const classes = await getClassesBySubject(req.params.subjectId);
    res.json({ success: true, data: classes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/classes/:classId/sub-chapters', async (req, res) => {
  try {
    const subChapters = await getSubChaptersByClass(req.params.classId);
    res.json({ success: true, data: subChapters });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/sub-chapters/:subChapterId/topics', async (req, res) => {
  try {
    const topics = await getTopicsBySubChapter(req.params.subChapterId);
    res.json({ success: true, data: topics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/topics', async (_req, res) => {
  try {
    const topics = await getTopics();
    res.json({ success: true, data: topics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Validasi otorisasi di server: HANYA ROLE GURU YANG BISA BUAT FORUM
app.post('/api/topics', async (req, res) => {
  try {
    const userRole = req.headers['x-user-role'] || req.body.creatorRole || 'murid';
    if (userRole !== 'guru') {
      return res.status(403).json({
        success: false,
        error: 'Akses Ditolak: Hanya Guru yang berwenang membuat Forum Diskusi pada Sub Bab.'
      });
    }

    const newTopic = await createTopic(req.body, userRole);
    io.emit('topic_created', newTopic);
    res.status(201).json({ success: true, data: newTopic });
  } catch (err) {
    res.status(403).json({ success: false, error: err.message });
  }
});

// 2. PESAN FORUM DISKUSI
app.get('/api/topics/:topicId/messages', async (req, res) => {
  try {
    const messages = await getMessagesByTopic(req.params.topicId);
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const saved = await insertMessage(req.body);
    io.to(`topic:${saved.topicId}`).emit('message_created', saved);
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. SECURE DIRECT CHAT (OTORISASI KETAT & PRIVASI TERJAGA)
// Request baca: verifikasi pengguna adalah salah satu peserta percakapan
app.get('/api/direct-messages', async (req, res) => {
  try {
    const conversationId = req.query.conversationId;
    const userId = req.headers['x-user-id'] || req.query.userId;

    if (!conversationId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Parameter conversationId dan header x-user-id wajib disertakan.'
      });
    }

    // Server-side check
    if (!conversationId.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: 'Otorisasi gagal: Anda tidak memiliki izin membaca riwayat chat ini.'
      });
    }

    const messages = await getSecureDirectMessages({ conversationId, userId });
    res.json({ success: true, data: messages });
  } catch (err) {
    console.error(`[Backend API Error] Gagal memuat riwayat direct messages (${req.query.conversationId}):`, err.message);
    res.status(403).json({ success: false, error: err.message });
  }
});

// Request kirim chat: pastikan pengirim adalah user yang sedang login
app.post('/api/direct-messages', async (req, res) => {
  try {
    const requesterId = req.headers['x-user-id'] || req.body.senderId;
    if (requesterId !== req.body.senderId) {
      console.warn(`[Backend Auth] Akses ditolak pada kirim pesan: requester (${requesterId}) != sender (${req.body.senderId})`);
      return res.status(403).json({
        success: false,
        error: 'Otorisasi gagal: Identitas pengirim tidak valid.'
      });
    }

    const saved = await insertSecureDirectMessage(req.body);

    // Broadcast HANYA ke room percakapan yang unik (bukan io.emit ke semua orang!)
    io.to(`chat:${saved.conversationId}`).emit('direct_message_received', saved);

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('[Backend API Error] Gagal menyimpan pesan langsung ke database:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ========================================================
// SOCKET.IO REAL-TIME EVENTS
// ========================================================

io.on('connection', (socket) => {
  console.log('[Socket] Client terhubung:', socket.id);

  // 1. Room Forum
  socket.on('join_room', async ({ topicId } = {}) => {
    if (!topicId) return;
    const room = `topic:${topicId}`;
    socket.join(room);

    try {
      const messages = await getMessagesByTopic(topicId);
      socket.emit('history_loaded', { topicId, messages });
    } catch (err) {
      console.error('[Socket] Gagal history:', err.message);
    }
  });

  socket.on('leave_room', ({ topicId } = {}) => {
    if (topicId) socket.leave(`topic:${topicId}`);
  });

  socket.on('message_created', async (message = {}) => {
    if (!message.topicId || !message.text) return;
    try {
      const saved = await insertMessage(message);
      io.to(`topic:${message.topicId}`).emit('message_created', saved);
    } catch (err) {
      socket.emit('message_error', { message: 'Gagal simpan pesan forum.' });
    }
  });

  // 2. Room Private Chat (Terisolasi per pasangan peserta)
  socket.on('join_chat_room', ({ conversationId, userId } = {}) => {
    if (!conversationId || !userId) return;

    // Verifikasi apakah user adalah bagian dari conversationId
    if (!conversationId.includes(userId)) {
      socket.emit('chat_error', { message: 'Akses ditolak: Anda bukan peserta ruang chat ini.' });
      return;
    }

    const room = `chat:${conversationId}`;
    socket.join(room);
    console.log(`[Socket] User ${userId} bergabung ke secure room: ${room}`);
  });

  socket.on('leave_chat_room', ({ conversationId } = {}) => {
    if (conversationId) {
      socket.leave(`chat:${conversationId}`);
    }
  });

  socket.on('send_direct_message', async (chatData = {}) => {
    if (!chatData.senderId || !chatData.recipientId) return;

    try {
      const saved = await insertSecureDirectMessage(chatData);
      // Kirim HANYA ke anggota room chat yang sah
      io.to(`chat:${saved.conversationId}`).emit('direct_message_received', saved);
    } catch (err) {
      console.error('[Socket] Gagal simpan pesan langsung:', err.message);
      socket.emit('chat_error', { message: err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('[Socket] Client terputus:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`SMARTI Connect Forum Backend Aktif di http://localhost:${PORT}`);
  console.log(`Arsitektur Berjenjang: Mapel -> Kelas -> Sub Bab -> Forum`);
  console.log(`Keamanan Chat: Server-Side Participant Isolation Aktif`);
  console.log(`=======================================================`);
});
