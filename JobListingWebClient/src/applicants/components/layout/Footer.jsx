import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const socialLinks = [
    { 
      id: 1, 
      icon: <FaFacebook size={24} />, 
      label: "Facebook",
      url: "https://facebook.com/jobboard"
    },
    { 
      id: 2, 
      icon: <FaTwitter size={24} />, 
      label: "Twitter",
      url: "https://twitter.com/jobboard"
    },
    { 
      id: 3, 
      icon: <FaLinkedin size={24} />, 
      label: "LinkedIn",
      url: "https://linkedin.com/company/jobboard"
    },
    { 
      id: 4, 
      icon: <FaInstagram size={24} />, 
      label: "Instagram",
      url: "https://instagram.com/jobboard"
    }
  ];

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-gray-400">Chúng tôi kết nối những chuyên gia tài năng với những cơ hội việc làm tuyệt vời.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white">Trang chủ</Link></li>
              <li><Link to="/jobs" className="text-gray-400 hover:text-white">Công việc</Link></li>
              <li><Link to="/companies" className="text-gray-400 hover:text-white">Công ty</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white">Về chúng tôi</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Kết nối với chúng tôi</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Job Board. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;