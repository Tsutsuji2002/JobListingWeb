import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Paperclip, MoreVertical, Trash2, Archive, Check, CheckCheck } from 'lucide-react';
import { fetchMessages, sendMessage, addNewMessage, markAsRead } from '../../redux/slices/chatSlice';
import { useSignalR } from '../../hooks/useSignalR';
import api from '../../services/api';

const ChatRoom = ({ currentUser }) => {
  const dispatch = useDispatch();
  const { selectedRoom, currentRoomMessages } = useSelector((state) => state.chat);

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const hubUrl = `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://localhost:7082'}/chathub`;

  // SignalR connection
  const {
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage: sendSignalRMessage,
    markAsRead: signalRMarkAsRead,
    sendTyping
  } = useSignalR(
    hubUrl,
    // onReceiveMessage
    (data) => {
      if (data.roomId === selectedRoom?.id) {
        dispatch(addNewMessage({
          id: data.messageId,
          content: data.message,
          senderId: data.senderId,
          sentAt: data.timestamp,
          type: data.type
        }));

        // Mark as read if not sender
        if (data.senderId !== currentUser.id) {
          dispatch(markAsRead({ roomId: data.roomId }));
          signalRMarkAsRead(data.roomId);
        }
      }
    },
    // onMessagesRead
    (data) => {
      if (data.roomId === selectedRoom?.id) {
        // Update read status in messages
        dispatch({ type: 'chat/updateReadStatus', payload: { roomId: data.roomId, readerId: data.readerId } });
      }
    },
    // onTyping
    (data) => {
      if (data.roomId === selectedRoom?.id && data.userId !== currentUser.id) {
        setOtherUserTyping(data.isTyping);
        if (data.isTyping) {
          setTimeout(() => setOtherUserTyping(false), 3000);
        }
      }
    }
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Join room when selected
  useEffect(() => {
    if (selectedRoom && isConnected) {
      joinRoom(selectedRoom.id);
      return () => leaveRoom(selectedRoom.id);
    }
  }, [selectedRoom, isConnected, joinRoom, leaveRoom]);

  // Fetch room messages when a chat is selected
  useEffect(() => {
    if (selectedRoom) {
      dispatch(fetchMessages({ roomId: selectedRoom.id, lastFetch: selectedRoom.lastMessageAt }));
    }
  }, [dispatch, selectedRoom]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [currentRoomMessages]);

  // Handle typing indicator
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      if (selectedRoom) {
        sendTyping(selectedRoom.id, true);
      }
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (selectedRoom) {
        sendTyping(selectedRoom.id, false);
      }
    }, 1000);
  };

  // Send text message
  const sendMessageHandler = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedRoom) {
      try {
        const messageData = {
          chatRoomId: selectedRoom.id,
          content: newMessage,
          type: 0
        };

        // Send via SignalR for real-time
        if (isConnected) {
          await sendSignalRMessage(selectedRoom.id, newMessage);
        }

        // Also send via API for persistence
        await dispatch(sendMessage(messageData)).unwrap();

        setNewMessage('');
        setIsTyping(false);
        if (selectedRoom) {
          sendTyping(selectedRoom.id, false);
        }
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedRoom) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatRoomId', selectedRoom.id);

      const response = await api.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Send file message
      if (isConnected) {
        await sendSignalRMessage(selectedRoom.id, `[File: ${file.name}]`);
      }

      await dispatch(sendMessage({
        chatRoomId: selectedRoom.id,
        content: response.data.fileUrl,
        type: 2 // File type
      })).unwrap();

    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle reply
  const handleReply = (message) => {
    setReplyTo(message);
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`/chat/messages/${messageId}`);
      // Remove from local state
      dispatch({ type: 'chat/deleteMessage', payload: messageId });
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  // Handle archive conversation
  const handleArchive = async () => {
    try {
      await api.put(`/chat/rooms/${selectedRoom.id}/archive`);
      // Remove from list
      dispatch({ type: 'chat/archiveRoom', payload: selectedRoom.id });
      setShowMenu(false);
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    }
  };

  // Handle delete conversation
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await api.delete(`/chat/rooms/${selectedRoom.id}`);
        // Remove from list
        dispatch({ type: 'chat/deleteRoom', payload: selectedRoom.id });
        setShowMenu(false);
      } catch (error) {
        console.error('Failed to delete conversation:', error);
      }
    }
  };

  const otherUser = currentUser.id === selectedRoom?.employerId
    ? selectedRoom?.applicant
    : selectedRoom?.employer;

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-lg font-medium">
                {otherUser?.name?.charAt(0) || otherUser?.companyName?.charAt(0) || '?'}
              </span>
            </div>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {otherUser?.name || otherUser?.companyName || 'Unknown'}
            </h2>
            <p className="text-sm text-gray-500">
              {otherUserTyping ? 'Typing...' : isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
              <button
                onClick={handleArchive}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
              >
                <Archive className="w-4 h-4" />
                <span>Archive</span>
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentRoomMessages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 relative group ${
                msg.senderId === currentUser.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              {msg.type === 2 ? (
                <div className="flex items-center space-x-2">
                  <Paperclip className="w-4 h-4" />
                  <a
                    href={msg.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {msg.content.split('/').pop()}
                  </a>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}

              <div className="flex items-center justify-end space-x-2 mt-1">
                <span className="text-xs opacity-75">
                  {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.senderId === currentUser.id && (
                  <>
                    {msg.isRead ? (
                      <CheckCheck className="w-4 h-4" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </>
                )}
              </div>

              {/* Reply button on hover */}
              <button
                onClick={() => handleReply(msg)}
                className="absolute -top-2 right-2 bg-white text-gray-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
              >
                <span className="text-xs">↩</span>
              </button>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div className="px-4 py-2 bg-gray-50 border-t flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-500">Replying to:</p>
            <p className="text-sm truncate">{replyTo.content}</p>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={sendMessageHandler} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            {uploadingFile ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
            ) : (
              <Paperclip className="w-5 h-5 text-gray-500" />
            )}
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={replyTo ? `Reply to: ${replyTo.content.substring(0, 20)}...` : "Type your message..."}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;
