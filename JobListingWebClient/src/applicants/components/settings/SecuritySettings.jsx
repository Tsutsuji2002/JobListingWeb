import React from 'react';
import { FaKey } from 'react-icons/fa';

const SecuritySettings = ({ user, labels, setSettings }) => {
  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <FaKey className="mr-2" /> Cài đặt bảo mật
      </h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800">{labels.security.twoFactorAuth}</h3>
            <p className="text-sm text-gray-500">Thêm một lớp bảo mật bổ sung vào tài khoản của bạn</p>
          </div>
          <button className="text-blue-500 hover:text-blue-600">
            {user.security.twoFactorAuth ? 'Vô hiệu hóa' : 'Cho phép'}
          </button>
        </div>

        <div>
          <h3 className="font-medium text-gray-800 mb-2">{labels.security.sessionTimeout}</h3>
          <select
            value={user.security.sessionTimeout}
            onChange={(e) => {
              setSettings((prevSettings) => ({
                ...prevSettings,
                security: {
                  ...prevSettings.security,
                  sessionTimeout: e.target.value
                }
              }));
            }}
            className="w-full p-2 border rounded-md"
          >
            <option value="1h">1 giờ</option>
            <option value="6h">6 giờ</option>
            <option value="12h">12 giờ</option>
            <option value="24h">24 giờ</option>
          </select>
        </div>
      </div>
    </section>
  );
};

export default SecuritySettings;
