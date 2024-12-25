import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import ChatList from '../../chat/components/ChatList';
import ChatRoom from '../../chat/components/ChatRoom';
import { fetchCurrentApplicant } from '../../redux/slices/authSlice';
import { selectRoom } from '../../redux/slices/chatSlice';

const ApplicantMessagesPage = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { currentUser, isLoading } = useSelector((state) => state.auth);
    const { selectedRoom, rooms } = useSelector((state) => state.chat); // Changed from selectedChat to selectedRoom

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && currentUser.length === 0) {
            dispatch(fetchCurrentApplicant());
        }
    }, [dispatch]);

    useEffect(() => {
        if (location.state?.selectedRoomId) {
            dispatch(selectRoom({
                id: location.state.selectedRoomId,
                employer: location.state.employer
            }));
        }
    }, [location.state, dispatch]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Messages</h1>
            <div className="flex space-x-4">
                <ChatList currentUser={currentUser}/>
                {selectedRoom ? ( // Changed from selectedChat to selectedRoom
                    <ChatRoom currentUser={currentUser} />
                ) : (
                    <div className="flex-1 flex items-center justify-center h-[600px] bg-white rounded-lg shadow-lg">
                        <p className="text-gray-500">Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicantMessagesPage;