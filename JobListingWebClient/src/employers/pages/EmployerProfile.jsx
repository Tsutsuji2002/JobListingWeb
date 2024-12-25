import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCurrentEmployer } from '../../redux/slices/employerSlice';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FaCheck, FaTimes, FaLock, FaEdit, FaUser, FaBuilding, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendar, FaIdCard } from 'react-icons/fa';

const EmployerProfile = () => {
  const dispatch = useDispatch();
  const { currentEmployer, isLoading, error } = useSelector((state) => state.employer);
  // const [isEditing, setIsEditing] = useState(false);

  const formatDate = (date) => {
    if (!date) return 'Chưa có thông tin';
    return format(new Date(date), 'PPpp', { locale: vi });
  };

  useEffect(() => {
    if (!currentEmployer) {
      dispatch(fetchCurrentEmployer());
    }
  }, [dispatch, currentEmployer]);

  const StatusBadge = ({ condition, trueText, falseText }) => (
    <span className={`px-2 py-1 rounded-full text-sm ${condition ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {condition ? <FaCheck className="inline mr-1" /> : <FaTimes className="inline mr-1" />}
      {condition ? trueText : falseText}
    </span>
  );

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Đang tải thông tin...</div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">Có lỗi xảy ra: {error}</div>
        </div>
    );
  }

  if (!currentEmployer) {
    return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Không tìm thấy thông tin người dùng</div>
        </div>
    );
  }

  return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center">
              <FaUser className="mr-2" /> Thông Tin Cá Nhân
            </h2>
            <Link to="/employer/profile/edit" className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-700 transition duration-200">
              <FaEdit size={16} />
            </Link>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Thông tin cơ bản */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Thông tin cá nhân</h3>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    <FaUser className="inline mr-2" />Họ và Tên
                  </label>
                  <p className="text-gray-900">{`${currentEmployer.firstName} ${currentEmployer.lastName}`}</p>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    <FaEnvelope className="inline mr-2" />Email
                  </label>
                  <p className="text-gray-900">{currentEmployer.email}</p>
                  <StatusBadge 
                    condition={currentEmployer.emailConfirmed}
                    trueText="Đã xác thực"
                    falseText="Chưa xác thực"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    <FaPhone className="inline mr-2" />Số điện thoại
                  </label>
                  <p className="text-gray-900">{currentEmployer.phoneNumber || 'Chưa cập nhật'}</p>
                  <StatusBadge 
                    condition={currentEmployer.phoneNumberConfirmed}
                    trueText="Đã xác thực"
                    falseText="Chưa xác thực"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    <FaMapMarkerAlt className="inline mr-2" />Địa chỉ
                  </label>
                  <p className="text-gray-900">
                    {currentEmployer.district && currentEmployer.city 
                      ? `${currentEmployer.district}, ${currentEmployer.city}`
                      : 'Chưa cập nhật'}
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    <FaIdCard className="inline mr-2" />Số CMND/CCCD
                  </label>
                  <p className="text-gray-900">{currentEmployer.identificationCardNumber || 'Chưa cập nhật'}</p>
                </div>
              </div>

              {/* Thông tin công ty và bảo mật */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Thông tin công ty & Bảo mật</h3>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    <FaBuilding className="inline mr-2" />Tên Công Ty
                  </label>
                  <p className="text-gray-900">{currentEmployer.companyName || 'Chưa cập nhật'}</p>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    <FaLock className="inline mr-2" />Bảo mật hai lớp
                  </label>
                  <StatusBadge 
                    condition={currentEmployer.twoFactorEnabled}
                    trueText="Đã bật"
                    falseText="Chưa bật"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    <FaCalendar className="inline mr-2" />Thời gian
                  </label>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-600">Ngày tạo:</span> {formatDate(currentEmployer.createTime)}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Cập nhật lần cuối:</span> {formatDate(currentEmployer.modifiedDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default EmployerProfile;
