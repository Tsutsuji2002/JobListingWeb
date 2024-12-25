import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import ChangeEmailModal from './ChangeEmailModal';
import ChangePasswordModal from './ChangePasswordModal';

const AccountSettings = ({ user, labels, setSettings, refreshUserData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleEmailChangeSuccess = (newEmail) => {
    refreshUserData();
    setSettings((prevSettings) => ({
      ...prevSettings,
      email: newEmail
    }));
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <FaUser className="mr-2" /> Cài đặt tài khoản
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {labels.account.email}
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="email"
              value={user.email}
              className="flex-1 p-2 border rounded-md"
              readOnly
            />
            <button
              onClick={handleOpenModal}
              className="text-blue-500 hover:text-blue-600"
            >
              Thay đổi
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {labels.account.password}
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="password"
              value={user.password}
              className="flex-1 p-2 border rounded-md"
              readOnly
            />
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-blue-500 hover:text-blue-600"
            >
              Thay đổi
            </button>
          </div>
        </div>
      </div>

      <ChangeEmailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userId={user.userId}
        onSuccess={handleEmailChangeSuccess}
      />
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        userId={user.userId}
        userEmail={user.email}
      />

    </section>
  );
};

export default AccountSettings;
