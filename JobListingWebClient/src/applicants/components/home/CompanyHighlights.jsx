import React from 'react';
import { Link } from 'react-router-dom';

const CompanyCard = ({ company }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <img
      src="/api/placeholder/100/100"
      alt={company.name}
      className="w-16 h-16 mb-4 rounded-full"
    />
    <h3 className="text-xl font-semibold mb-2">{company.name}</h3>
    <p className="text-gray-600 mb-4">{company.description}</p>
    <span className="text-sm text-blue-500">{company.openPositions} vị trí đang tuyển dụng</span>
  </div>
);

const CompanyHighlights = ({ companies }) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Các công ty hàng đầu đang tuyển dụng</h2>
          <p className="text-gray-600">
          Tham gia cùng các công ty hàng đầu trong ngành đang định hình tương lai
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {companies.slice(0, 4).map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            to="/companies"
            className="inline-block bg-gray-800 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-900"
          >
            Xem tất cả các công ty
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CompanyHighlights;