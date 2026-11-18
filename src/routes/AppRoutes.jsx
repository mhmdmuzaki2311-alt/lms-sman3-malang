import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../pages/LoginPage';
import SubjectListPage from '../pages/SubjectListPage';
import SubjectClassListPage from '../pages/SubjectClassListPage';
import SubChapterListPage from '../pages/SubChapterListPage';
import ForumTopicDetailPage from '../pages/ForumTopicDetailPage';
import DirectChatPage from '../pages/DirectChatPage';

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/subjects" replace />} />

      {/* Protected Routes inside MainLayout */}
      <Route element={user ? <MainLayout /> : <Navigate to="/login" replace />}>
        {/* Alur Berjenjang: Default ke Daftar Mata Pelajaran */}
        <Route path="/" element={<Navigate to="/subjects" replace />} />
        <Route path="/subjects" element={<SubjectListPage />} />
        <Route path="/subjects/:subjectId/classes" element={<SubjectClassListPage />} />
        <Route path="/classes/:classId/sub-chapters" element={<SubChapterListPage />} />
        
        {/* Forum Diskusi di dalam Sub Bab */}
        <Route path="/forum" element={<ForumTopicDetailPage />} />
        <Route path="/forum/:id" element={<ForumTopicDetailPage />} />
        
        {/* Private Chat */}
        <Route path="/chat" element={<DirectChatPage />} />
        
        <Route path="*" element={<Navigate to="/subjects" replace />} />
      </Route>
    </Routes>
  );
}
