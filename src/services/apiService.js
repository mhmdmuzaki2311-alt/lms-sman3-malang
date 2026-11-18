// REST API Service Layer (Laravel REST API Integration + Mock Engine Drop-in)
import { 
  MOCK_USERS, 
  MOCK_COURSES, 
  MOCK_MATERIALS, 
  MOCK_ASSIGNMENTS, 
  MOCK_QUIZZES, 
  MOCK_ATTENDANCE, 
  MOCK_FORUM_TOPICS, 
  MOCK_FORUM_MESSAGES,
  MOCK_NOTIFICATIONS,
  MOCK_PARENT_DATA
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.useMock = true; // Set to false when connecting to live Laravel Backend
  }

  async login(credentials) {
    if (this.useMock) {
      await new Promise((res) => setTimeout(res, 500));
      const user = MOCK_USERS.find(u => u.role === credentials.role) || MOCK_USERS[0];
      return {
        success: true,
        token: `mock-jwt-token-sman3-${user.role}`,
        user
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return await response.json();
    } catch (err) {
      console.warn('REST API Error, falling back to mock:', err);
      const user = MOCK_USERS.find(u => u.role === credentials.role) || MOCK_USERS[0];
      return { success: true, token: 'mock-jwt-token', user };
    }
  }

  async getCourses() {
    if (this.useMock) return MOCK_COURSES;
    const res = await fetch(`${API_BASE_URL}/courses`);
    return await res.json();
  }

  async getCourseDetail(courseId) {
    if (this.useMock) return MOCK_COURSES.find(c => c.id === courseId) || MOCK_COURSES[0];
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}`);
    return await res.json();
  }

  async getMaterials(courseId) {
    if (this.useMock) return MOCK_MATERIALS.filter(m => !courseId || m.courseId === courseId);
    const res = await fetch(`${API_BASE_URL}/materials?courseId=${courseId}`);
    return await res.json();
  }

  async getAssignments(courseId) {
    if (this.useMock) return MOCK_ASSIGNMENTS.filter(a => !courseId || a.courseId === courseId);
    const res = await fetch(`${API_BASE_URL}/assignments?courseId=${courseId}`);
    return await res.json();
  }

  async submitAssignment(assignmentId, payload) {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 600));
      const asg = MOCK_ASSIGNMENTS.find(a => a.id === assignmentId);
      if (asg) {
        asg.status = 'dikumpulkan';
        asg.mySubmission = {
          fileName: payload.fileName || 'Jawaban_Tugas.pdf',
          submittedAt: new Date().toISOString(),
          fileSize: '1.5 MB',
          notes: payload.notes || ''
        };
      }
      return { success: true, message: 'Tugas berhasil dikumpulkan!', assignment: asg };
    }
    const res = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return await res.json();
  }

  async getQuizzes(courseId) {
    if (this.useMock) return MOCK_QUIZZES.filter(q => !courseId || q.courseId === courseId);
    const res = await fetch(`${API_BASE_URL}/quizzes?courseId=${courseId}`);
    return await res.json();
  }

  async submitQuiz(quizId, answers) {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 700));
      return { success: true, score: 90, totalQuestions: answers.length, feedback: 'Hasil kuis terekam!' };
    }
    const res = await fetch(`${API_BASE_URL}/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
    return await res.json();
  }

  async getAttendance() {
    if (this.useMock) return MOCK_ATTENDANCE;
    const res = await fetch(`${API_BASE_URL}/attendance`);
    return await res.json();
  }

  async submitAttendance(code) {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 500));
      return { success: true, message: 'Presensi digital berhasil dicatat!' };
    }
    const res = await fetch(`${API_BASE_URL}/attendance/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    return await res.json();
  }

  async getForumTopics() {
    if (this.useMock) return MOCK_FORUM_TOPICS;
    const res = await fetch(`${API_BASE_URL}/forum/topics`);
    return await res.json();
  }

  async getForumMessages(topicId) {
    if (this.useMock) return MOCK_FORUM_MESSAGES.filter(m => m.topicId === topicId);
    const res = await fetch(`${API_BASE_URL}/forum/topics/${topicId}/messages`);
    return await res.json();
  }

  async getNotifications() {
    if (this.useMock) return MOCK_NOTIFICATIONS;
    const res = await fetch(`${API_BASE_URL}/notifications`);
    return await res.json();
  }

  async getParentData() {
    if (this.useMock) return MOCK_PARENT_DATA;
    const res = await fetch(`${API_BASE_URL}/parent/monitoring`);
    return await res.json();
  }
}

export const apiService = new ApiService();
