import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/layout/Layout';
import { UserSideNav } from '../components/user/UserSideNav';
import AccountSettings from '../components/settings/AccountSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import PrivacySettings from '../components/settings/PrivacySettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import { fetchCurrentApplicant } from '../../redux/slices/authSlice';
import { FaSpinner } from 'react-icons/fa';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { currentUser, isLoading, error } = useSelector((state) => state.auth);
  const [settings, setSettings] = useState({
    account: {
      email: "",
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

  // useEffect(() => {
  //   dispatch(fetchCurrentApplicant());
  // }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      setSettings(currentUser.settings);
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="flex items-center space-x-2">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
            <span className="text-gray-600">Loading settings...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-red-600">Error loading settings: {error}</p>
        </div>
      </Layout>
    );
  }

  if (!currentUser) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">No user data available</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <UserSideNav activeTab="settings" />
          </div>

          <div className="lg:col-span-3 space-y-8">
            <AccountSettings user={currentUser} labels={labels} setSettings={setSettings} refreshUserData={fetchCurrentApplicant}/>
            <NotificationSettings user={currentUser} labels={labels} setSettings={setSettings} /> 
            {/* <PrivacySettings user={currentUser} labels={labels} setSettings={setSettings} />
            <SecuritySettings user={currentUser} labels={labels} setSettings={setSettings} /> */}

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
