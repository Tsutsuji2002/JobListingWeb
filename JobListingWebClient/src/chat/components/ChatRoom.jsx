import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send } from 'lucide-react';
import { fetchMessages, sendMessage, addNewMessage } from '../../redux/slices/chatSlice';

const ChatRoom = ({ currentUser }) => {
  const dispatch = useDispatch();
  const { selectedRoom, currentRoomMessages } = useSelector((state) => state.chat);

  const [newMessage, setNewMessage] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch room messages when a chat is selected
  useEffect(() => {
    if (selectedRoom) {
      dispatch(fetchMessages({ roomId: selectedRoom.id, lastFetch: selectedRoom.lastMessageAt }));
    }
    console.log("selectedRoom", currentRoomMessages);
  }, [dispatch, selectedRoom]);

  // Send text message
  const sendMessageHandler = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedRoom) {
      try {
        await dispatch(sendMessage({
          chatRoomId: selectedRoom.id,
          content: newMessage
        })).unwrap();

        setNewMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Chat</h2>
        {currentUser.id === selectedRoom.employerId ? (
          <p className="text-sm text-gray-500">Chatting with Applicant</p>
        ) : (
          <p className="text-sm text-gray-500">Chatting with Employer</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentRoomMessages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender.id === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.sender.id === currentUser.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              <p>{msg.content}</p> {/* Change to msg.content */}
              <div className="flex items-center justify-end space-x-2 mt-1">
                <span className="text-xs opacity-75">
                  {new Date(msg.sentAt).toLocaleTimeString()} {/* Change to msg.sentAt */}
                </span>
                {msg.sender.id === currentUser.id && msg.isRead && (
                  <span className="text-xs">✓✓</span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessageHandler} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;
