import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { UserSideNav } from '../components/user/UserSideNav';
import { 
  FaUser,
  FaBell,
  FaShieldAlt,
  FaKey
} from 'react-icons/fa';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    account: {
      email: "john.doe@example.com",
      password: "••••••••",
    },
    notifications: {
      newJobs: true,
      applicationUpdates: true,
      companyUpdates: false,
      marketing: false
    },
    privacy: {
      profilePublic: true,
      showEmail: false,
      showPhone: false,
      showResume: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: "24h",
      loginAlerts: true
    }
  });

  const labels = {
    account: {
      email: "Địa chỉ Email",
      password: "Mật khẩu"
    },
    notifications: {
      newJobs: "Việc làm mới",
      applicationUpdates: "Cập nhật ứng tuyển",
      companyUpdates: "Cập nhật công ty",
      marketing: "Tiếp thị"
    },
    privacy: {
      profilePublic: "Hồ sơ công khai",
      showEmail: "Hiển thị Email",
      showPhone: "Hiển thị Số điện thoại",
      showResume: "Hiển thị CV"
    },
    security: {
      twoFactorAuth: "Xác thực hai yếu tố",
      sessionTimeout: "Hết thời gian phiên",
      loginAlerts: "Cảnh báo đăng nhập"
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <UserSideNav activeTab="settings" />
          </div>
          
          <div className="lg:col-span-3 space-y-8">
            {/* Account Settings */}
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
                      value={settings.account.email}
                      className="flex-1 p-2 border rounded-md"
                      readOnly
                    />
                    <button className="text-blue-500 hover:text-blue-600">Thay đổi</button>
                  </div>
                </div>
  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {labels.account.password}
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="password"
                      value={settings.account.password}
                      className="flex-1 p-2 border rounded-md"
                      readOnly
                    />
                    <button className="text-blue-500 hover:text-blue-600">Thay đổi</button>
                  </div>
                </div>
              </div>
            </section>
  
            {/* Notification Settings */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <FaBell className="mr-2" /> Cài đặt thông báo
              </h2>
              
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-700">
                      {labels.notifications[key]}
                    </span>
                    <button
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${
                        value ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                      onClick={() => {
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            [key]: !value
                          }
                        });
                      }}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          value ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </section>
  
            {/* Privacy Settings */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <FaShieldAlt className="mr-2" /> Cài đặt quyền riêng tư
              </h2>
              
              <div className="space-y-4">
                {Object.entries(settings.privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-700">
                      {labels.privacy[key]}
                    </span>
                    <button
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${
                        value ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                      onClick={() => {
                        setSettings({
                          ...settings,
                          privacy: {
                            ...settings.privacy,
                            [key]: !value
                          }
                        });
                      }}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          value ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </section>
  
            {/* Security Settings */}
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
                    {settings.security.twoFactorAuth ? 'Vô hiệu hóa' : 'Cho phép'}
                  </button>
                </div>
  
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">{labels.security.sessionTimeout}</h3>
                  <select
                    value={settings.security.sessionTimeout}
                    onChange={(e) => {
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          sessionTimeout: e.target.value
                        }
                      });
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
  
            {/* Save Changes Button */}
            <div className="flex justify-end">
              <button className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
