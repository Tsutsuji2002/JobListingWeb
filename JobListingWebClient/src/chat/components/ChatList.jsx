import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageSquare, Circle } from 'lucide-react';
import { Card, CardContent } from '@mui/material';
import { fetchChatRooms, selectRoom, updateLastFetch } from '../../redux/slices/chatSlice';

const ChatList = ({ currentUser }) => {
  const dispatch = useDispatch();
  const { rooms = [], selectedRoom, loading } = useSelector((state) => state.chat); // Fallback to empty array
  const isEmployer = currentUser?.role === 'employer';

  useEffect(() => {
    if (currentUser && rooms.length === 0) {
      dispatch(fetchChatRooms());
    }
    console.log("chatList", rooms); 
  }, [dispatch, currentUser, rooms.length]);

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

  return (
    <Card className="w-full max-w-md h-[600px] bg-white">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Các đoạn chat của {currentUser.userName}</h2>
      </div>

      <CardContent className="overflow-y-auto h-[calc(100%-4rem)]">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="w-12 h-12 mb-2" />
            <p>No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rooms.map((chat) => (
              <div
                key={chat.roomId}
                onClick={() => handleChatSelect(chat)}
                className={`flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors ${
                  selectedRoom?.roomId === chat.roomId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    {isEmployer ? (
                      <span className="text-lg">{chat.applicant.name.charAt(0)}</span>
                    ) : (
                      <span className="text-lg">{chat.employer.companyName.charAt(0)}</span>
                    )}
                  </div>
                  {chat.unreadCount > 0 && (
                    <Circle className="w-3 h-3 fill-blue-500 text-blue-500 absolute -top-1 -right-1" />
                  )}
                </div>

                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">
                      {isEmployer ? chat.applicant.name : chat.employer.companyName}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {new Date(chat.lastMessage?.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    {chat.lastMessage?.type === 'file'
                      ? `📎 ${chat.lastMessage.fileName}`
                      : chat.lastMessage?.message.length > 30
                        ? `${chat.lastMessage.message.substring(0, 30)}...`
                        : chat.lastMessage?.message || 'No messages yet'}
                  </p>

                  {chat.jobTitle && (
                    <p className="text-xs text-gray-400 mt-1">
                      Re: {chat.jobTitle}
                    </p>
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
