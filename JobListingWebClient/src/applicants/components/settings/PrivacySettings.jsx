import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';

const PrivacySettings = ({ user, labels, setSettings }) => {
  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <FaShieldAlt className="mr-2" /> Cài đặt quyền riêng tư
      </h2>

      <div className="space-y-4">
        {Object.entries(user.privacy).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-gray-700">
              {labels.privacy[key]}
            </span>
            <button
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                value ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => {
                setSettings((prevSettings) => ({
                  ...prevSettings,
                  privacy: {
                    ...prevSettings.privacy,
                    [key]: !value
                  }
                }));
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
  );
};

export default PrivacySettings;
