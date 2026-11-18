// Socket.IO Real-Time WebSocket Service for SMAN 3 Kota Malang Forum
// Sesuai Use Case Diagram: Guru, Murid, Orang Tua, dan Admin
import { io } from 'socket.io-client';
import { 
  MOCK_FORUM_MESSAGES, 
  MOCK_FORUM_TOPICS, 
  MOCK_USERS, 
  MOCK_PARENT_TEACHER_MESSAGES,
  MOCK_NOTIFICATIONS
} from './mockData';
import { checkProfanity } from './profanityFilter';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:4000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.status = 'connected'; // 'connected' | 'connecting' | 'reconnecting' | 'disconnected'
    this.currentRoom = null;
    
    // In-Memory Data Stores
    this.users = [...MOCK_USERS];
    this.topics = [...MOCK_FORUM_TOPICS];
    this.messages = [...MOCK_FORUM_MESSAGES];
    this.parentTeacherMessages = [...MOCK_PARENT_TEACHER_MESSAGES];
    this.notifications = [...MOCK_NOTIFICATIONS];
    this.typingUsers = new Map();
    this.autoBotTimer = null;
  }

  connect() {
    try {
      this.socket = io(WS_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1500,
      });

      this.socket.on('connect', () => {
        this.status = 'connected';
        this.emitStatusChange();
        if (this.currentRoom) {
          this.joinRoom(this.currentRoom);
        }
      });

      this.socket.on('disconnect', () => {
        this.status = 'disconnected';
        this.emitStatusChange();
      });

      this.socket.on('reconnect_attempt', () => {
        this.status = 'reconnecting';
        this.emitStatusChange();
      });

      this.socket.on('reconnect', () => {
        this.status = 'connected';
        this.emitStatusChange();
        this.notify('history_sync_required', { topicId: this.currentRoom });
      });

      // Database sync events from server
      this.socket.on('history_loaded', ({ topicId, messages: loadedMessages }) => {
        if (Array.isArray(loadedMessages)) {
          this.messages = loadedMessages;
          this.notify('history_sync_required', { topicId });
        }
      });

      this.socket.on('message_created', (newMsg) => {
        if (!this.messages.some((m) => m.id === newMsg.id)) {
          this.messages.push(newMsg);
        }
        this.notify('message_created', newMsg);
      });

      this.socket.on('parent_teacher_message', (chatMsg) => {
        if (!this.parentTeacherMessages.some((m) => m.id === chatMsg.id)) {
          this.parentTeacherMessages.push(chatMsg);
        }
        this.notify('parent_teacher_message', chatMsg);
      });

      this.socket.on('topic_created', (newTopic) => {
        if (!this.topics.some((t) => t.id === newTopic.id)) {
          this.topics.unshift(newTopic);
        }
        this.notify('topic_created', newTopic);
      });

    } catch (e) {
      console.warn('Real Socket.IO server not detected, using robust in-memory real-time engine.');
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event).filter(cb => cb !== callback);
    this.listeners.set(event, callbacks);
  }

  notify(event, payload) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(payload);
        } catch (err) {
          console.error(`Error in socket listener for ${event}:`, err);
        }
      });
    }
  }

  emitStatusChange() {
    this.notify('connection_status', { status: this.status });
  }

  // --- Room Isolation ---
  joinRoom(topicId) {
    this.currentRoom = topicId;
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_room', { topicId });
    }
    this.notify('room_joined', { topicId });
  }

  leaveRoom() {
    if (this.socket && this.socket.connected && this.currentRoom) {
      this.socket.emit('leave_room', { topicId: this.currentRoom });
    }
    this.currentRoom = null;
  }

  // ==========================================================
  // USE CASE: Mengirim Pesan dan Balasan (Guru & Murid)
  // Menyebarkan Pesan melalui WebSocket -> Menerima Notifikasi Real-time
  // ==========================================================
  sendMessage(messageData) {
    const text = messageData.text?.trim() || '';

    // Filter kata tidak pantas
    const profanityResult = checkProfanity(text);
    if (!profanityResult.isClean) {
      const error = new Error(profanityResult.errorMessage);
      error.isProfane = true;
      error.detectedWords = profanityResult.detectedWords;
      throw error;
    }

    const targetTopicId = messageData.topicId || this.currentRoom;
    const topic = this.topics.find(t => t.id === targetTopicId);

    // Cek apakah topik ditutup
    if (topic && topic.status === 'closed') {
      const error = new Error('Diskusi ini telah ditutup. Tidak dapat mengirim pesan baru.');
      error.isClosed = true;
      throw error;
    }

    const newMsg = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      topicId: targetTopicId,
      senderId: messageData.senderId,
      senderName: messageData.senderName,
      senderRole: messageData.senderRole,
      isModerator: messageData.isModerator || false,
      senderAvatar: messageData.senderAvatar,
      text: text,
      createdAt: new Date().toISOString(),
      replyTo: messageData.replyTo ? {
        id: messageData.replyTo.id,
        senderName: messageData.replyTo.senderName,
        text: messageData.replyTo.text
      } : null
    };

    if (this.socket && this.socket.connected) {
      this.socket.emit('message_created', newMsg);
    }

    // Simpan ke Database secara asinkron
    fetch(`${WS_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg)
    }).catch((e) => console.debug('[DB] Fallback lokal:', e.message));

    this.messages.push(newMsg);
    if (topic) {
      topic.repliesCount = (topic.repliesCount || 0) + 1;
      topic.lastActive = 'Baru saja';
    }

    // Broadcast pesan forum melalui WebSocket
    this.notify('message_created', newMsg);

    // Memicu: Menerima Notifikasi Real-time
    this.dispatchNotification({
      id: `notif-${Date.now()}`,
      title: 'Pesan Baru di Forum',
      message: `${newMsg.senderName} mengirim pesan di "${topic ? topic.title.substring(0, 40) + '...' : 'Forum Diskusi'}"`,
      timestamp: 'Baru saja',
      type: 'forum'
    });

    return newMsg;
  }

  // ==========================================================
  // USE CASE: Mengirim Pesan Kepada Guru atau Orang tua
  // Menyebarkan Pesan Chat Melalui WebSocket -> Menerima Pesan Real-Time
  // ==========================================================
  sendParentTeacherMessage(chatData) {
    const text = chatData.text?.trim() || '';
    const profanityResult = checkProfanity(text);
    if (!profanityResult.isClean) {
      const error = new Error(profanityResult.errorMessage);
      error.isProfane = true;
      throw error;
    }

    const newChatMsg = {
      id: `pt-msg-${Date.now()}`,
      senderId: chatData.senderId,
      senderName: chatData.senderName,
      senderRole: chatData.senderRole,
      receiverId: chatData.receiverId,
      receiverName: chatData.receiverName,
      text: text,
      createdAt: new Date().toISOString()
    };

    if (this.socket && this.socket.connected) {
      this.socket.emit('parent_teacher_message', newChatMsg);
    }

    // Simpan ke Database direct_messages secara asinkron
    fetch(`${WS_URL}/api/direct-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newChatMsg)
    }).catch((e) => console.debug('[DB] Fallback lokal direct message:', e.message));

    this.parentTeacherMessages.push(newChatMsg);

    // Menyebarkan Pesan Chat Melalui WebSocket ke lawan bicara
    this.notify('parent_teacher_message', newChatMsg);

    // Memicu Notifikasi Real-time
    this.dispatchNotification({
      id: `notif-chat-${Date.now()}`,
      title: 'Pesan Konsultasi Baru',
      message: `${newChatMsg.senderName} mengirim pesan kepada Anda.`,
      timestamp: 'Baru saja',
      type: 'parent_chat'
    });

    return newChatMsg;
  }

  // ==========================================================
  // USE CASE: Menunjuk atau Mencabut Hak Moderator Murid (Guru)
  // ==========================================================
  toggleModerator(studentId, isModerator) {
    const student = this.users.find(u => u.id === studentId);
    if (student) {
      student.isModerator = isModerator;

      if (this.socket && this.socket.connected) {
        this.socket.emit('moderator_updated', { studentId, isModerator });
      }

      this.notify('moderator_updated', { studentId, isModerator, student });

      // Menerima Notifikasi Real-time ke Murid terkait
      this.dispatchNotification({
        id: `notif-mod-${Date.now()}`,
        title: isModerator ? 'Hak Moderator Diberikan' : 'Hak Moderator Dicabut',
        message: isModerator 
          ? `Pak Budi Prasetyo telah menunjuk ${student.name} sebagai Moderator Murid.`
          : `Hak moderator untuk ${student.name} telah dicabut oleh Guru.`,
        timestamp: 'Baru saja',
        type: 'moderator'
      });

      return student;
    }
    return null;
  }

  // ==========================================================
  // USE CASE: Mengatur Jadwal atau Durasi Diskusi (Guru & Murid Moderator)
  // ==========================================================
  updateTopicSchedule(topicId, scheduleData) {
    const topic = this.topics.find(t => t.id === topicId);
    if (topic) {
      if (scheduleData.scheduleDeadline) topic.scheduleDeadline = scheduleData.scheduleDeadline;
      if (scheduleData.durasiMenit) topic.durasiMenit = scheduleData.durasiMenit;

      if (this.socket && this.socket.connected) {
        this.socket.emit('schedule_updated', { topicId, ...scheduleData });
      }

      this.notify('schedule_updated', { topicId, topic });

      this.dispatchNotification({
        id: `notif-sch-${Date.now()}`,
        title: 'Jadwal Diskusi Diperbarui',
        message: `Batas waktu diskusi "${topic.title.substring(0, 35)}..." telah diatur.`,
        timestamp: 'Baru saja',
        type: 'schedule'
      });

      return topic;
    }
    return null;
  }

  // ==========================================================
  // USE CASE: Memoderasi Diskusi (Guru & Murid Moderator)
  // ==========================================================
  toggleTopicStatus(topicId) {
    const topic = this.topics.find(t => t.id === topicId);
    if (topic) {
      topic.status = topic.status === 'open' ? 'closed' : 'open';
      if (this.socket && this.socket.connected) {
        this.socket.emit('topic_status_updated', { topicId, status: topic.status });
      }
      this.notify('topic_status_updated', { topicId, status: topic.status });
      return topic;
    }
    return null;
  }

  deleteMessage(messageId, topicId) {
    this.messages = this.messages.filter(m => m.id !== messageId);
    const topic = this.topics.find(t => t.id === topicId);
    if (topic && topic.repliesCount > 0) {
      topic.repliesCount--;
    }

    if (this.socket && this.socket.connected) {
      this.socket.emit('message_deleted', { messageId, topicId });
    }

    this.notify('message_deleted', { messageId, topicId });
  }

  createTopic(topicData) {
    const newTopic = {
      id: `top-${Date.now()}`,
      courseId: topicData.courseId || 'crs-umum',
      courseName: topicData.courseName || 'Fisika',
      kelas: topicData.kelas || 'Kelas 10-A',
      title: topicData.title,
      tag: topicData.tag || 'Tanya Soal',
      tagColor: topicData.tag === 'Penting' ? 'red' : 'blue',
      creator: topicData.creator,
      creatorTitle: topicData.creatorTitle || `${topicData.creator} (${topicData.creatorRole === 'guru' ? 'Guru' : 'Murid Moderator'})`,
      creatorRole: topicData.creatorRole || 'guru',
      creatorAvatar: topicData.creatorAvatar,
      createdAt: new Date().toISOString(),
      scheduleDeadline: topicData.scheduleDeadline || '2026-10-31T23:59:00Z',
      durasiMenit: topicData.durasiMenit || 120,
      lastActive: 'Baru saja',
      repliesCount: 0,
      status: 'open',
      description: topicData.description
    };

    this.topics.unshift(newTopic);

    if (this.socket && this.socket.connected) {
      this.socket.emit('topic_created', newTopic);
    }

    // Simpan ke Database discussion_topics secara asinkron
    fetch(`${WS_URL}/api/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTopic)
    }).catch((e) => console.debug('[DB] Fallback lokal topic:', e.message));

    this.notify('topic_created', newTopic);
    return newTopic;
  }

  deleteTopic(topicId) {
    this.topics = this.topics.filter(t => t.id !== topicId);
    this.messages = this.messages.filter(m => m.topicId !== topicId);

    if (this.socket && this.socket.connected) {
      this.socket.emit('topic_deleted', { topicId });
    }

    this.notify('topic_deleted', { topicId });
  }

  // ==========================================================
  // USE CASE: Mengelola Pengguna (Admin)
  // ==========================================================
  updateUserStatus(userId, status) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.status = status;
      this.notify('users_updated', { users: this.users });
      return user;
    }
    return null;
  }

  // ==========================================================
  // USE CASE: Melihat Status Pengguna Aktif (Guru & Murid)
  // ==========================================================
  getActiveUsers() {
    return this.users.filter(u => u.status === 'online');
  }

  getAllUsers() {
    return this.users;
  }

  // --- Notifikasi Real-time Helper ---
  dispatchNotification(notif) {
    this.notifications.unshift(notif);
    this.notify('notification_received', notif);
  }

  getNotifications() {
    return this.notifications;
  }

  getParentTeacherMessages() {
    return this.parentTeacherMessages;
  }

  getMessagesByTopic(topicId) {
    return this.messages.filter(m => m.topicId === topicId);
  }

  getTopics() {
    return this.topics;
  }

  // --- Typing Indicator ---
  sendTyping(topicId, senderName, isTyping) {
    if (!this.typingUsers.has(topicId)) {
      this.typingUsers.set(topicId, new Set());
    }

    const set = this.typingUsers.get(topicId);
    if (isTyping) {
      set.add(senderName);
    } else {
      set.delete(senderName);
    }

    const payload = {
      topicId,
      typingUsers: Array.from(set)
    };

    if (this.socket && this.socket.connected) {
      this.socket.emit('user_typing', payload);
    }

    this.notify('user_typing', payload);
  }

  // --- Connection Simulator ---
  simulateDisconnect() {
    this.status = 'disconnected';
    this.emitStatusChange();
  }

  simulateReconnect() {
    this.status = 'reconnecting';
    this.emitStatusChange();

    setTimeout(() => {
      this.status = 'connected';
      this.emitStatusChange();
      if (this.currentRoom) {
        this.notify('history_sync_required', { topicId: this.currentRoom });
      }
    }, 1500);
  }
}

export const socketService = new SocketService();
