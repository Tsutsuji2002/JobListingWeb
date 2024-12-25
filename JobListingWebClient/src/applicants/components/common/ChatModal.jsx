import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage, addUserMessage } from '../../../redux/slices/chatbotSlice';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatModal = ({ isOpen, onClose }) => {
  const [inputMessage, setInputMessage] = useState('');
  const dispatch = useDispatch();
  const { messages, loading, error } = useSelector(state => state.chatbot);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    const trimmedMessage = inputMessage.trim();
    if (trimmedMessage) {
      dispatch(addUserMessage(trimmedMessage));
      dispatch(sendMessage(trimmedMessage));
      setInputMessage(''); 
    }
  };

  const renderMessageContent = (text) => {
    return (
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-xl font-bold" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-semibold" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
          em: ({node, ...props}) => <em className="italic" {...props} />,
          code: ({node, ...props}) => <code className="bg-gray-100 p-1 rounded text-sm" {...props} />,
          pre: ({node, ...props}) => <pre className="bg-gray-100 p-2 rounded-lg overflow-x-auto" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2" {...props} />,
          a: ({node, ...props}) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl flex flex-col h-[600px] max-h-[90vh]">
        {/* Header */}
        <div className="bg-gray-100 p-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Chatbot AI hỗ trợ</h2>
          <button 
            onClick={onClose} 
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`
                  max-w-[80%] p-3 rounded-xl 
                  ${msg.sender === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-800'}
                `}
              >
                {renderMessageContent(msg.text)}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-center text-gray-500 italic">
              Typing...
            </div>
          )}
          {error && (
            <div className="text-red-500 text-center">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-gray-100 p-4 rounded-b-xl flex items-center">
          <input 
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Viết gì đó..."
            className="flex-grow mr-2 p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="
              bg-blue-500 text-white p-2 rounded-xl 
              hover:bg-blue-600 transition-colors
              disabled:bg-gray-300 disabled:cursor-not-allowed
            "
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;