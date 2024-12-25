import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import ChatList from '../../chat/components/ChatList';
import ChatRoom from '../../chat/components/ChatRoom';
import { fetchCurrentEmployer } from '../../redux/slices/employerSlice';
import { selectRoom } from '../../redux/slices/chatSlice';

const EmployerMessagesPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { currentEmployer } = useSelector((state) => state.employer);
  const { selectedRoom, rooms } = useSelector((state) => state.chat);

  // Fetch employer data when the page loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !currentEmployer) {
      dispatch(fetchCurrentEmployer());
    }
  }, [dispatch, currentEmployer]);

  // Select a room if a roomId is passed through location state
  useEffect(() => {
    if (location.state?.selectedRoomId) {
      dispatch(selectRoom({
        id: location.state.selectedRoomId,
        employer: location.state.employer
      }));
    }
  }, [location.state, dispatch]);

  // Guard against accessing currentEmployer before it's loaded
  if (!currentEmployer) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <div className="flex space-x-4">
        {/* Ensure rooms is always an array */}
        <ChatList currentUser={currentEmployer} rooms={rooms ?? []} />
        {selectedRoom ? (
          <ChatRoom currentUser={currentEmployer} />
        ) : (
          <div className="flex-1 flex items-center justify-center h-[600px] bg-white rounded-lg shadow-lg">
            <p className="text-gray-500">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerMessagesPage;
