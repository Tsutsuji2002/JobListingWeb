import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageSquare, Circle, Search, MoreVertical, Archive, Trash2, X } from 'lucide-react';
import { Card, CardContent } from '@mui/material';
import { fetchChatRooms, selectRoom, updateLastFetch } from '../../redux/slices/chatSlice';
import api from '../../services/api';

const ChatList = ({ currentUser }) => {
  const dispatch = useDispatch();
  const { rooms = [], selectedRoom, loading } = useSelector((state) => state.chat);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(null);
  const [filteredRooms, setFilteredRooms] = useState([]);

  const isEmployer = currentUser?.role === 'employer';

  useEffect(() => {
    if (currentUser && rooms.length === 0) {
      dispatch(fetchChatRooms());
    }
  }, [dispatch, currentUser, rooms.length]);

  // Filter rooms based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRooms(rooms);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredRooms(
        rooms.filter((chat) => {
          const name = isEmployer
            ? chat.applicant?.name || ''
            : chat.employer?.companyName || '';
          const message = chat.lastMessage?.message || '';
          return (
            name.toLowerCase().includes(query) ||
            message.toLowerCase().includes(query)
          );
        })
      );
    }
  }, [searchQuery, rooms, isEmployer]);

  const handleChatSelect = async (chat) => {
    dispatch(selectRoom(chat));

    if (chat.unreadCount > 0) {
      try {
        await dispatch(updateLastFetch(new Date().toISOString()));
      } catch (error) {
        console.error('Failed to mark messages as read:', error);
      }
    }
  };

  const handleArchive = async (e, roomId) => {
    e.stopPropagation();
    try {
      await api.put(`/chat/rooms/${roomId}/archive`);
      dispatch({ type: 'chat/archiveRoom', payload: roomId });
      setShowMenu(null);
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    }
  };

  const handleDelete = async (e, roomId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await api.delete(`/chat/rooms/${roomId}`);
        dispatch({ type: 'chat/deleteRoom', payload: roomId });
        setShowMenu(null);
      } catch (error) {
        console.error('Failed to delete conversation:', error);
      }
    }
  };

  const formatLastMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="w-full max-w-md h-[600px] bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Messages</h2>
          <span className="text-sm text-gray-500">
            {filteredRooms.length} {filteredRooms.length === 1 ? 'conversation' : 'conversations'}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <CardContent className="flex-1 overflow-y-auto p-0">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <MessageSquare className="w-12 h-12 mb-2" />
            <p className="text-center">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            {!searchQuery && (
              <p className="text-sm mt-2">Start a conversation to see it here</p>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filteredRooms.map((chat) => (
              <div
                key={chat.roomId || chat.id}
                onClick={() => handleChatSelect(chat)}
                className={`flex items-start p-4 hover:bg-gray-50 cursor-pointer transition-colors relative ${
                  selectedRoom?.roomId === chat.roomId || selectedRoom?.id === chat.id
                    ? 'bg-blue-50'
                    : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {isEmployer ? (
                      <span className="text-lg">
                        {chat.applicant?.name?.charAt(0) || '?'}
                      </span>
                    ) : (
                      <span className="text-lg">
                        {chat.employer?.companyName?.charAt(0) || '?'}
                      </span>
                    )}
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium truncate">
                      {isEmployer
                        ? chat.applicant?.name || 'Unknown Applicant'
                        : chat.employer?.companyName || 'Unknown Company'}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {chat.lastMessage?.timestamp
                        ? formatLastMessageTime(chat.lastMessage.timestamp)
                        : ''}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {chat.lastMessage?.type === 'file' ? (
                      <span className="flex items-center">
                        <span className="mr-1">📎</span>
                        {chat.lastMessage?.fileName || 'File attachment'}
                      </span>
                    ) : chat.lastMessage?.message ? (
                      chat.lastMessage.message.length > 35
                        ? `${chat.lastMessage.message.substring(0, 35)}...`
                        : chat.lastMessage.message
                    ) : (
                      <span className="text-gray-400">No messages yet</span>
                    )}
                  </p>

                  {chat.jobTitle && (
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      Re: {chat.jobTitle}
                    </p>
                  )}
                </div>

                {/* Menu Button */}
                <div className="relative ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(showMenu === chat.id ? null : chat.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                  {showMenu === chat.id && (
                    <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border z-10">
                      <button
                        onClick={(e) => handleArchive(e, chat.id)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-sm"
                      >
                        <Archive className="w-4 h-4" />
                        <span>Archive</span>
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, chat.id)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 text-red-600 flex items-center space-x-2 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatList;
