import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { 
  FaUser,
  FaLinkedin, 
  FaGithub,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';
import { UserSideNav } from '../components/user/UserSideNav';

const UserProfilePage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
      name: "John Doe",
      title: "Senior Software Engineer",
      location: "San Francisco, CA",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      website: "johndoe.dev",
      about: "Experienced software engineer with a passion for building scalable applications...",
      experience: [
        {
          id: 1,
          company: "Tech Corp",
          title: "Senior Software Engineer",
          period: "2020 - Present",
          description: "Leading development of enterprise applications..."
        }
      ],
      education: [
        {
          id: 1,
          school: "University of Technology",
          degree: "BS in Computer Science",
          period: "2012 - 2016"
        }
      ],
      skills: ["JavaScript", "React", "Node.js", "Python", "AWS"]
    });
  
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <UserSideNav activeTab="profile" />
            </div>
            
            <div className="lg:col-span-3 space-y-8">
              {/* Profile Header */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                      <FaUser className="w-12 h-12 text-gray-400" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
                      <p className="text-gray-600">{profile.title}</p>
                      <div className="flex items-center text-gray-600 mt-2">
                        <FaMapMarkerAlt className="mr-2" />
                        <span>{profile.location}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <FaEnvelope className="mr-2" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaPhone className="mr-2" />
                    <span>{profile.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaGlobe className="mr-2" />
                    <span>{profile.website}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <a href="#" className="text-gray-600 hover:text-blue-500">
                      <FaLinkedin className="w-6 h-6" />
                    </a>
                    <a href="#" className="text-gray-600 hover:text-gray-900">
                      <FaGithub className="w-6 h-6" />
                    </a>
                  </div>
                </div>
              </div>
  
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">About</h2>
                <p className="text-gray-700">{profile.about}</p>
              </div>
  
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Experience</h2>
                <div className="space-y-6">
                  {profile.experience.map((exp) => (
                    <div key={exp.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-800">{exp.title}</h3>
                          <p className="text-gray-600">{exp.company}</p>
                          <p className="text-gray-500 text-sm">{exp.period}</p>
                        </div>
                        {isEditing && (
                          <div className="flex space-x-2">
                            <button className="text-blue-500 hover:text-blue-600">
                              <FaEdit />
                            </button>
                            <button className="text-red-500 hover:text-red-600">
                              <FaTrash />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 mt-2">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
  
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Education</h2>
                <div className="space-y-6">
                  {profile.education.map((edu) => (
                    <div key={edu.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-800">{edu.school}</h3>
                          <p className="text-gray-600">{edu.degree}</p>
                          <p className="text-gray-500 text-sm">{edu.period}</p>
                        </div>
                        {isEditing && (
                          <div className="flex space-x-2">
                            <button className="text-blue-500 hover:text-blue-600">
                              <FaEdit />
                            </button>
                            <button className="text-red-500 hover:text-red-600">
                              <FaTrash />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
  
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  };

  export default UserProfilePage;