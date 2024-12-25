import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserAreaDropdown } from '../user/UserAreaDropdown';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import logo from '../../../images/horizontal-logo.png';
import { fetchAllBlogTypes } from '../../../redux/slices/postSlice';

const Header = ({currentUser}) => {
  const dispatch = useDispatch();
  // const { currentUser } = useSelector((state) => state.auth);
  const blogTypes = useSelector((state) => state.posts.blogTypes);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllBlogTypes());
    console.log("check: ", currentUser);
  }, [dispatch]);

  const getNavigationItems = () => {
    const baseNavigationItems = {
      jobs: {
        title: 'Công việc',
        items: [
          { label: 'Tìm việc làm', path: '/jobs' },
          { label: 'Việc làm từ xa', path: '/jobs/remote' },
          { label: 'Việc làm hot', path: '/jobs/trending' },
          { label: 'Việc làm IT', path: '/jobs/it' },
          { label: 'Thông báo việc làm', path: '/user/setting' },
        ],
      },
      cv: {
        title: 'CV & Hồ sơ',
        items: [
          { label: 'Tạo CV', path: '/user/cv/create' },
          { label: 'Quản lý CV', path: '/user/cv/' },
          { label: 'Mẫu CV', path: '/user/cv/createontemplate' },
          { label: 'Hướng dẫn viết CV', path: '/cv/guide' },
        ],
      },
      companies: {
        title: 'Công ty',
        items: [
          { label: 'Danh sách công ty', path: '/companies' },
          { label: 'Top công ty', path: '/companies/top' },
          { label: 'Đánh giá công ty', path: '/companies/reviews' },
          { label: 'So sánh công ty', path: '/companies/compare' },
        ],
      },
      career: {
        title: 'Cẩm nang nghề nghiệp',
        items: [
          ...blogTypes.map(blogType => ({
            label: blogType.name, 
            path: `/career/blog/${blogType.blogTypeID}`
          }))
        ],
      },
    };

    return baseNavigationItems;
  };

  const navigationItems = getNavigationItems();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false); // Close mobile menu when resizing to desktop
        setActiveDropdown(null); // Reset dropdown state
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActiveDropdown(null);
  };

  const handleMobileDropdownClick = (key) => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  return (
    <header className="bg-white shadow relative">
      <div className="container mx-auto px-4 py-4 lg:py-6">
        {/* Top bar with logo and mobile menu button */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Company Logo" className="h-12 w-auto mr-4" />
            {/* <h1 className="text-xl font-bold text-gray-800">Job Board</h1> */}
          </Link>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-gray-600 hover:text-gray-800"
            onClick={handleMobileMenuClick}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex flex-1 mx-8">
            <ul className="flex space-x-6">
              <li>
                <Link to="/" className="text-gray-600 hover:text-gray-800">
                  Trang chủ
                </Link>
              </li>

              {Object.entries(navigationItems).map(([key, section]) => (
                <li
                  key={key}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(key)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center text-gray-600 hover:text-gray-800">
                    {section.title}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>

                  {activeDropdown === key && (
                    <div className="absolute left-0 top-full pt-2 w-56 z-50">
                      <div className="bg-white rounded-md shadow-lg py-2">
                        {section.items.map((item, index) => (
                          <Link
                            key={index}
                            to={item.path}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              ))}

              <li>
                <Link
                  to="/employer"
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  Nhà tuyển dụng
                  <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                    Đăng tuyển ngay
                  </span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Desktop auth buttons */}
          <div className="hidden lg:flex items-center space-x-6">
          {currentUser ? (
              <UserAreaDropdown user={currentUser} />
            ) : (
              <>
                <Link to="/user/login" className="text-gray-600 hover:text-blue-600">
                  Đăng nhập
                </Link>
                <Link to="/user/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} mt-4`}>
          <nav className="space-y-2">
            <Link to="/" className="block py-2 text-gray-600 hover:text-gray-800">
              Trang chủ
            </Link>

            {Object.entries(navigationItems).map(([key, section]) => (
              <div key={key} className="space-y-1">
                <button
                  className="flex items-center justify-between w-full py-2 text-gray-600 hover:text-gray-800"
                  onClick={() => handleMobileDropdownClick(key)}
                >
                  {section.title}
                  <ChevronDown
                    className={`h-4 w-4 transform transition-transform ${
                      activeDropdown === key ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {activeDropdown === key && (
                  <div className="pl-4 space-y-1">
                    {section.items.map((item, index) => (
                      <Link
                        key={index}
                        to={item.path}
                        className="block py-2 text-sm text-gray-700 hover:text-gray-900"
                        onClick={handleMobileMenuClick}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Link
              to="/employer"
              className="block py-2 text-blue-600 hover:text-blue-800 font-medium"
              onClick={handleMobileMenuClick}
            >
              Nhà tuyển dụng
              <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                Mới
              </span>
            </Link>

            {!currentUser && (
              <div className="pt-4 space-y-2">
                <Link
                  to="/user/login"
                  className="block w-full text-center py-2 text-gray-600 hover:text-gray-800"
                  onClick={handleMobileMenuClick}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/user/signup"
                  className="block w-full text-center bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                  onClick={handleMobileMenuClick}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
