import React from 'react';
import { Link } from 'react-router-dom';
import Placeholder from '../../../images/placeholder.jpg'

const Hero = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Tìm công việc mơ ước của bạn ngay hôm nay
            </h1>
            <p className="text-xl mb-8">
            Kết nối với các công ty hàng đầu và khám phá những cơ hội phù hợp với kỹ năng và nguyện vọng của bạn.
            </p>
            <div className="flex space-x-4">
              <Link
                to="/jobs"
                className="border-2 border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-blue-600"
              >
                Duyệt qua việc làm
              </Link>
              <Link
                to="/companies"
                className="border-2 border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-blue-600"
              >
                Xem công ty
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <img
              src={Placeholder}
              alt="Job Search"
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;