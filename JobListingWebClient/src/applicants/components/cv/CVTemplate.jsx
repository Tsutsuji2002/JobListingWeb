// src/components/CVTemplate.js
import React from 'react';

const CVTemplate = ({ data }) => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex items-center justify-center mb-6">
        <img src="/path-to-profile-image.jpg" alt="Ảnh đại diện" className="w-24 h-24 rounded-full mr-4 border-4 border-gray-200" />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{data.name}</h1>
          <p className="text-gray-600">{data.position}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-purple-100 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2 text-yellow-600">THÔNG TIN CÁ NHÂN</h2>
          <p className="text-gray-700"><strong>Địa chỉ:</strong> {data.address}</p>
          <p className="text-gray-700"><strong>Email:</strong> {data.email}</p>
          <p className="text-gray-700"><strong>SĐT:</strong> {data.phone}</p>
          <p className="text-gray-700"><strong>Facebook:</strong> {data.facebook}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2 text-yellow-600">MỤC TIÊU NGHỀ NGHIỆP</h2>
          <p className="text-gray-700">{data.careerObjective}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2 text-yellow-600">CÁC KỸ NĂNG</h2>
          <p className="text-gray-700">{data.skills.join(', ')}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2 text-yellow-600">HỌC VẤN</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-2">
              <p className="text-gray-700"><strong>Trường học:</strong> {edu.school}</p>
              <p className="text-gray-700"><strong>Bằng cấp:</strong> {edu.degree}</p>
              <p className="text-gray-700"><strong>Thời gian:</strong> {edu.duration}</p>
            </div>
          ))}
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2 text-yellow-600">DẰN HIỆU VÀ GIẢI THƯỞNG</h2>
          <p className="text-gray-700">{data.awards.join(', ')}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2 text-yellow-600">KINH NGHIỆM LÀM VIỆC</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-2">
              <p className="text-gray-700"><strong>Công ty:</strong> {exp.company}</p>
              <p className="text-gray-700"><strong>Vị trí:</strong> {exp.position}</p>
              <p className="text-gray-700"><strong>Thời gian:</strong> {exp.duration}</p>
            </div>
          ))}
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2 text-yellow-600">CHUNG CHÍ</h2>
          <p className="text-gray-700">{data.interests.join(', ')}</p>
        </div>
      </div>
    </div>
  );
};

export default CVTemplate;
