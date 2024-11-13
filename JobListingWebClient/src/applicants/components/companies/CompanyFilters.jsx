import React from 'react';

const CompanyFilters = ({ onFilterChange }) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <select
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => onFilterChange('industry', e.target.value)}
      >
        <option value="">Tất cả các ngành</option>
        <option value="technology">Công nghệ</option>
        <option value="healthcare">Chăm sóc sức khỏe</option>
        <option value="finance">Tài chính</option>
        <option value="education">Giáo dục</option>
      </select>

      <select
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => onFilterChange('size', e.target.value)}
      >
        <option value="">Quy mô công ty</option>
        <option value="1-50">1-50 nhân công</option>
        <option value="51-200">51-200 nhân công</option>
        <option value="201-500">201-500 nhân công</option>
        <option value="501+">501+ nhân công</option>
      </select>

      <select
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => onFilterChange('location', e.target.value)}
      >
        <option value="">Mọi địa điểm</option>
        <option value="remote">Xa</option>
        <option value="us">United States</option>
        <option value="europe">Europe</option>
        <option value="asia">Asia</option>
      </select>
    </div>
  );
};

export default CompanyFilters;