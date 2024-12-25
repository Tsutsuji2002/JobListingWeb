// src/components/CVEditor.js
import React, { useState } from 'react';
import CVTemplate from './CVTemplate';

const CVEditor = () => {
  const [data, setData] = useState({
    name: '',
    position: '',
    address: '',
    email: '',
    phone: '',
    facebook: '',
    careerObjective: '',
    education: [{ school: '', degree: '', duration: '' }],
    skills: [''],
    experience: [{ company: '', position: '', duration: '' }],
    awards: [''],
    interests: [''],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const handleEducationChange = (index, e) => {
    const { name, value } = e.target;
    const newEducation = [...data.education];
    newEducation[index] = {
      ...newEducation[index],
      [name]: value,
    };
    setData({
      ...data,
      education: newEducation,
    });
  };

  const handleExperienceChange = (index, e) => {
    const { name, value } = e.target;
    const newExperience = [...data.experience];
    newExperience[index] = {
      ...newExperience[index],
      [name]: value,
    };
    setData({
      ...data,
      experience: newExperience,
    });
  };

  const handleSkillsChange = (index, e) => {
    const { value } = e.target;
    const newSkills = [...data.skills];
    newSkills[index] = value;
    setData({
      ...data,
      skills: newSkills,
    });
  };

  const handleAwardsChange = (index, e) => {
    const { value } = e.target;
    const newAwards = [...data.awards];
    newAwards[index] = value;
    setData({
      ...data,
      awards: newAwards,
    });
  };

  const handleInterestsChange = (index, e) => {
    const { value } = e.target;
    const newInterests = [...data.interests];
    newInterests[index] = value;
    setData({
      ...data,
      interests: newInterests,
    });
  };

  return (
    <div className="max-w-screen-xl mx-auto flex gap-8 p-6">
      <div className="w-1/2 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Chỉnh sửa CV</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Họ và tên</label>
          <input type="text" name="name" value={data.name} onChange={handleChange} className="w-full p-2 mb-2 border border-gray-300 rounded" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Vị trí</label>
          <input type="text" name="position" value={data.position} onChange={handleChange} className="w-full p-2 mb-2 border border-gray-300 rounded" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Địa chỉ</label>
          <input type="text" name="address" value={data.address} onChange={handleChange} className="w-full p-2 mb-2 border border-gray-300 rounded" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input type="text" name="email" value={data.email} onChange={handleChange} className="w-full p-2 mb-2 border border-gray-300 rounded" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">SĐT</label>
          <input type="text" name="phone" value={data.phone} onChange={handleChange} className="w-full p-2 mb-2 border border-gray-300 rounded" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Facebook</label>
          <input type="text" name="facebook" value={data.facebook} onChange={handleChange} className="w-full p-2 mb-2 border border-gray-300 rounded" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Mục tiêu nghề nghiệp</label>
          <textarea name="careerObjective" value={data.careerObjective} onChange={handleChange} className="w-full p-2 mb-2 border border-gray-300 rounded" />
        </div>
        {data.education.map((edu, index) => (
          <div key={index} className="mb-4">
            <label className="block text-gray-700">Học vấn {index + 1}</label>
            <input type="text" name="school" placeholder="Trường học" value={edu.school} onChange={(e) => handleEducationChange(index, e)} className="w-full p-2 mb-2 border border-gray-300 rounded" />
            <input type="text" name="degree" placeholder="Bằng cấp" value={edu.degree} onChange={(e) => handleEducationChange(index, e)} className="w-full p-2 mb-2 border border-gray-300 rounded" />
            <input type="text" name="duration" placeholder="Thời gian" value={edu.duration} onChange={(e) => handleEducationChange(index, e)} className="w-full p-2 mb-2 border border-gray-300 rounded" />
          </div>
        ))}
        {data.skills.map((skill, index) => (
          <div key={index} className="mb-4">
            <label className="block text-gray-700">Kỹ năng {index + 1}</label>
            <input type="text" placeholder="Kỹ năng" value={skill} onChange={(e) => handleSkillsChange(index, e)} className="w-full p-2 mb-2 border border-gray-300 rounded" />
          </div>
        ))}
        {data.experience.map((exp, index) => (
          <div key={index} className="mb-4">
            <label className="block text-gray-700">Kinh nghiệm {index + 1}</label>
            <input type="text" name="company" placeholder="Công ty" value={exp.company} onChange={(e) => handleExperienceChange(index, e)} className="w-full p-2 mb-2 border border-gray-300 rounded" />
            <input type="text" name="position" placeholder="Vị trí" value={exp.position} onChange={(e) => handleExperienceChange(index, e)} className="w-full p-2 mb-2 border border-gray-300 rounded" />
            <input type="text" name="duration" placeholder="Thời gian" value={exp.duration} onChange={(e) => handleExperienceChange(index, e)} className="w-full p-2 mb-2 border border-gray-300 rounded" />
          </div>
        ))}
        {data.awards.map((award, index) => (
          <div key={index} className="mb-4">
            <label className="block text-gray-700">Giải thưởng {index + 1}</label>
            <input type="text" placeholder="Giải thưởng" value={award} onChange={(e) => handleAwardsChange(index, e)} className="w-full p-2 mb-2 border border-gray-300 rounded" />
          </div>
        ))}
        {data.interests.map((interest, index) => (
          <div key={index} className="mb-4">
            <label className="block text-gray-700">Sở thích {index + 1}</label>
            <input type="text" placeholder="Sở thích" value={interest} onChange={(e) => handleInterestsChange(index, e)} className="w-full p-2 mb-2 border border-gray-300 rounded" />
          </div>
        ))}
      </div>
      <div className="w-1/2">
        <CVTemplate data={data} />
      </div>
    </div>
  );
};

export default CVEditor;
