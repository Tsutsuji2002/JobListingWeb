import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaRocket, FaUsers, FaChartLine, FaCog } from 'react-icons/fa';

const EmployerIntroPage = () => {
  return (
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Tìm kiếm ứng viên tài năng cho doanh nghiệp của bạn
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Tiếp cận hàng ngàn ứng viên tiềm năng và xây dựng đội ngũ nhân sự mơ ước của bạn
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/employer/signup"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300"
              >
                Đăng ký miễn phí
              </Link>
              <Link
                to="/employer/login"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition duration-300 border-2 border-blue-600"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <FaRocket className="text-blue-600 text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Đăng tin nhanh chóng</h3>
              <p className="text-gray-600">Đăng tin tuyển dụng chỉ trong vài phút với giao diện thân thiện</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <FaUsers className="text-blue-600 text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Tiếp cận ứng viên</h3>
              <p className="text-gray-600">Kết nối với hàng ngàn ứng viên tiềm năng phù hợp</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <FaChartLine className="text-blue-600 text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Phân tích chi tiết</h3>
              <p className="text-gray-600">Theo dõi hiệu quả tuyển dụng qua các chỉ số chi tiết</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <FaCog className="text-blue-600 text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Quản lý dễ dàng</h3>
              <p className="text-gray-600">Quản lý tin tuyển dụng và ứng viên một cách hiệu quả</p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default EmployerIntroPage;