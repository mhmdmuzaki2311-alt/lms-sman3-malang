import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '../services/mockData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userList, setUserList] = useState(MOCK_USERS);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lms_sman3_user');
    return saved ? JSON.parse(saved) : MOCK_USERS[0]; // Default: Guru (Bu Guru Kim Minjeong)
  });
  const [token, setToken] = useState(() => localStorage.getItem('lms_sman3_token') || 'demo-token-sman3');

  useEffect(() => {
    if (user) {
      localStorage.setItem('lms_sman3_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lms_sman3_user');
    }
  }, [user]);

  const login = (email, password) => {
    const found = userList.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );

    if (found) {
      if (found.status !== 'active') {
        throw new Error('Akun Anda dinonaktifkan oleh administrator.');
      }
      setUser(found);
      const generatedToken = `token-${found.user_id}-${Date.now()}`;
      setToken(generatedToken);
      localStorage.setItem('lms_sman3_token', generatedToken);
      return found;
    } else {
      throw new Error('Email atau kata sandi tidak sesuai.');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('lms_sman3_user');
    localStorage.removeItem('lms_sman3_token');
  };

  const switchUser = (userId) => {
    const target = userList.find((u) => u.id === userId || u.user_id === userId) || userList[0];
    setUser(target);
  };

  const updateUserModeratorStatus = (userId, isModerator) => {
    setUserList((prev) => prev.map((u) => (u.id === userId || u.user_id === userId ? { ...u, isModerator } : u)));
    setUser((prev) => (prev && (prev.id === userId || prev.user_id === userId) ? { ...prev, isModerator } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        users: userList,
        login,
        logout,
        switchUser,
        updateUserModeratorStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
