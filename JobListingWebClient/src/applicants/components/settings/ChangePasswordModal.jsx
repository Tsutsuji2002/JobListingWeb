import React, { useState } from 'react';
import api from '../../../services/api';

const ChangePasswordModal = ({ isOpen, onClose, userId, userEmail }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePasswords = () => {
    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    return true;
  };

  const handleSendVerificationCode = async () => {
    if (!validatePasswords()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await api.post('/account/send-password-verification', {
        userId,
        currentPassword,
        newPassword
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra khi gửi mã xác thực');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndChangePassword = async () => {
    setIsLoading(true);
    setError('');

    try {
      await api.post('/account/change-password', {
        userId,
        currentPassword,
        newPassword,
        verificationCode
      });
      onClose();
      // Show success message or trigger refresh if needed
    } catch (err) {
      setError(err.response?.data?.error || 'Mã xác thực không hợp lệ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setVerificationCode('');
    setStep(1);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-md p-6 w-96">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Thay đổi mật khẩu
        </h2>

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Nhập mật khẩu mới"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Mã xác thực đã được gửi đến email: {userEmail}
            </p>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Nhập mã xác thực"
            />
          </div>
        )}

        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-800 px-4 py-2"
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            onClick={step === 1 ? handleSendVerificationCode : handleVerifyAndChangePassword}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isLoading ? (
              <span>Đang xử lý...</span>
            ) : step === 1 ? (
              'Tiếp tục'
            ) : (
              'Xác nhận'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;