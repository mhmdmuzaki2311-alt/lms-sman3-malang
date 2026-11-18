import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/socketService';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(() => socketService.socket);
  const [connectionStatus, setConnectionStatus] = useState(socketService.status);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [topics, setTopics] = useState(socketService.getTopics());
  const [typingUsers, setTypingUsers] = useState([]);
  const [parentTeacherMessages, setParentTeacherMessages] = useState(socketService.getParentTeacherMessages());
  const [notifications, setNotifications] = useState(socketService.getNotifications());
  const [users, setUsers] = useState(socketService.getAllUsers());
  const [historySynced, setHistorySynced] = useState(true);

  useEffect(() => {
    socketService.connect();
    setSocket(socketService.socket);

    const handleStatusChange = ({ status }) => {
      setConnectionStatus(status);
    };

    const handleMessageCreated = (newMsg) => {
      if (socketService.currentRoom && newMsg.topicId === socketService.currentRoom) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
      setTopics([...socketService.getTopics()]);
    };

    const handleMessageDeleted = ({ messageId, topicId }) => {
      if (socketService.currentRoom === topicId) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
      setTopics([...socketService.getTopics()]);
    };

    const handleParentTeacherMessage = (chatMsg) => {
      setParentTeacherMessages((prev) => {
        if (prev.some((m) => m.id === chatMsg.id)) return prev;
        return [...prev, chatMsg];
      });
    };

    const handleNotification = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    };

    const handleModeratorUpdated = () => {
      setUsers([...socketService.getAllUsers()]);
    };

    const handleScheduleUpdated = () => {
      setTopics([...socketService.getTopics()]);
    };

    const handleTopicStatusUpdated = () => {
      setTopics([...socketService.getTopics()]);
    };

    const handleTopicCreated = () => {
      setTopics([...socketService.getTopics()]);
    };

    const handleTopicDeleted = ({ topicId }) => {
      setTopics([...socketService.getTopics()]);
      if (currentRoom === topicId) {
        setMessages([]);
      }
    };

    const handleTyping = ({ topicId, typingUsers: tUsers }) => {
      if (socketService.currentRoom === topicId) {
        setTypingUsers(tUsers);
      }
    };

    const handleHistorySync = ({ topicId }) => {
      setHistorySynced(true);
      if (topicId) {
        setMessages(socketService.getMessagesByTopic(topicId));
      }
    };

    socketService.on('connection_status', handleStatusChange);
    socketService.on('message_created', handleMessageCreated);
    socketService.on('message_deleted', handleMessageDeleted);
    socketService.on('parent_teacher_message', handleParentTeacherMessage);
    socketService.on('notification_received', handleNotification);
    socketService.on('moderator_updated', handleModeratorUpdated);
    socketService.on('schedule_updated', handleScheduleUpdated);
    socketService.on('topic_status_updated', handleTopicStatusUpdated);
    socketService.on('topic_created', handleTopicCreated);
    socketService.on('topic_deleted', handleTopicDeleted);
    socketService.on('user_typing', handleTyping);
    socketService.on('history_sync_required', handleHistorySync);

    return () => {
      socketService.off('connection_status', handleStatusChange);
      socketService.off('message_created', handleMessageCreated);
      socketService.off('message_deleted', handleMessageDeleted);
      socketService.off('parent_teacher_message', handleParentTeacherMessage);
      socketService.off('notification_received', handleNotification);
      socketService.off('moderator_updated', handleModeratorUpdated);
      socketService.off('schedule_updated', handleScheduleUpdated);
      socketService.off('topic_status_updated', handleTopicStatusUpdated);
      socketService.off('topic_created', handleTopicCreated);
      socketService.off('topic_deleted', handleTopicDeleted);
      socketService.off('user_typing', handleTyping);
      socketService.off('history_sync_required', handleHistorySync);
    };
  }, [currentRoom]);

  const joinRoom = useCallback((topicId) => {
    setCurrentRoom(topicId);
    socketService.joinRoom(topicId);
    setMessages(socketService.getMessagesByTopic(topicId));
    setTypingUsers([]);
  }, []);

  const leaveRoom = useCallback(() => {
    socketService.leaveRoom();
    setCurrentRoom(null);
    setMessages([]);
    setTypingUsers([]);
  }, []);

  const sendMessage = useCallback((data) => {
    return socketService.sendMessage(data);
  }, []);

  const sendParentTeacherMessage = useCallback((data) => {
    return socketService.sendParentTeacherMessage(data);
  }, []);

  const deleteMessage = useCallback((messageId, topicId) => {
    socketService.deleteMessage(messageId, topicId);
  }, []);

  const toggleModerator = useCallback((studentId, isModerator) => {
    const res = socketService.toggleModerator(studentId, isModerator);
    setUsers([...socketService.getAllUsers()]);
    return res;
  }, []);

  const updateTopicSchedule = useCallback((topicId, scheduleData) => {
    const res = socketService.updateTopicSchedule(topicId, scheduleData);
    setTopics([...socketService.getTopics()]);
    return res;
  }, []);

  const toggleTopicStatus = useCallback((topicId) => {
    return socketService.toggleTopicStatus(topicId);
  }, []);

  const createTopic = useCallback((topicData) => {
    return socketService.createTopic(topicData);
  }, []);

  const deleteTopic = useCallback((topicId) => {
    socketService.deleteTopic(topicId);
  }, []);

  const updateUserStatus = useCallback((userId, status) => {
    const res = socketService.updateUserStatus(userId, status);
    setUsers([...socketService.getAllUsers()]);
    return res;
  }, []);

  const sendTyping = useCallback((topicId, name, isTyping) => {
    socketService.sendTyping(topicId, name, isTyping);
  }, []);

  const simulateDisconnect = useCallback(() => {
    socketService.simulateDisconnect();
  }, []);

  const simulateReconnect = useCallback(() => {
    socketService.simulateReconnect();
  }, []);

  const activeUsers = users.filter((u) => u.status === 'online');

  return (
    <SocketContext.Provider
      value={{
        socket,
        socketService,
        connectionStatus,
        currentRoom,
        messages,
        topics,
        typingUsers,
        historySynced,
        parentTeacherMessages,
        notifications,
        users,
        activeUsers,
        joinRoom,
        leaveRoom,
        sendMessage,
        sendParentTeacherMessage,
        deleteMessage,
        toggleModerator,
        updateTopicSchedule,
        toggleTopicStatus,
        createTopic,
        deleteTopic,
        updateUserStatus,
        sendTyping,
        simulateDisconnect,
        simulateReconnect
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
