import React from 'react';
import Layout from '../components/layout/Layout';

const AboutPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Về chúng tôi</h1>
        <p className="text-gray-600">
        Chúng tôi tận tâm kết nối các chuyên gia tài năng với các cơ hội việc làm tuyệt vời.
        Nền tảng của chúng tôi giúp người tìm việc dễ dàng tìm được bước tiến tiếp theo trong sự nghiệp và
        giúp nhà tuyển dụng tìm được ứng viên hoàn hảo.
        </p>
      </div>
    </Layout>
  );
};

export default AboutPage;