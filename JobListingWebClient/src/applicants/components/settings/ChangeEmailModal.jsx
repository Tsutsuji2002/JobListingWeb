import React, { useState } from 'react';
import api from '../../../services/api';

const ChangeEmailModal = ({ isOpen, onClose, userId, onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  const handleSendVerificationCode = async () => {
    try {
      console.log(userId);
      await api.post('/account/send-email-verification', { userId, newEmail });
      setStep(2);
    } catch (err) {
      setError('Error sending verification code');
    }
  };

  const handleVerifyCode = async () => {
    try {
      await api.post('/account/change-email', { userId, newEmail, code: verificationCode });
      onSuccess();
      onClose();
      window.location.reload();
    } catch (err) {
      setError('Invalid verification code');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-md p-6 w-96">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Thay đổi Email</h2>
        {step === 1 && (
          <>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border rounded-md mb-4"
              placeholder="Nhập mật khẩu hiện tại"
            />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full p-2 border rounded-md mb-4"
              placeholder="Nhập email mới"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800"
              >
                Hủy
              </button>
              <button
                onClick={handleSendVerificationCode}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Gửi mã xác thực
              </button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full p-2 border rounded-md mb-4"
              placeholder="Nhập mã xác thực"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800"
              >
                Hủy
              </button>
              <button
                onClick={handleVerifyCode}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Xác thực
              </button>
            </div>
          </>
        )}
        {error && <p className="text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default ChangeEmailModal;
