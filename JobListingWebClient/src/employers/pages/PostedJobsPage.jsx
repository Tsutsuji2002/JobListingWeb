import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaPause, FaPlay, FaSortAmountDown, FaSortAmountUp, FaClipboardList} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import EmployerLayout from '../components/layout/EmployerLayout';
import Alert from '@mui/material/Alert';
import { Dialog, DialogContent, DialogActions } from '@mui/material';
import { fetchCompanyByUserId } from '../../redux/slices/companySlice';
import { fetchJobsbyComp, deleteJob, updateJobStatus, extendJob } from '../../redux/slices/jobSlice';
import { getIndustryById } from '../../redux/slices/industrySlice';

const PostedJobsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [industryNames, setIndustryNames] = useState({});
  const [uniqueIndustries, setUniqueIndustries] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const [sortDirection, setSortDirection] = useState('desc');
  const [extensionDays, setExtensionDays] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [extendError, setExtendError] = useState('');

  const { compJobs, status, error } = useSelector((state) => state.jobs);
  const { selectedCompany } = useSelector((state) => state.companies);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      dispatch(fetchCompanyByUserId(userId));
    }
  }, [dispatch]);
  
  useEffect(() => {
    if (selectedCompany?.companyID) {
      setCompanyId(selectedCompany.companyID);
    }
  }, [selectedCompany]);
  
  useEffect(() => {
    if (companyId) {
      dispatch(fetchJobsbyComp(companyId));
    }
  }, [dispatch, companyId]);

  useEffect(() => {
    const fetchIndustryNames = async () => {
      const names = {};
      const uniqueIndustryIds = [...new Set(compJobs.map(job => job.industryID))];
      
      for (const industryId of uniqueIndustryIds) {
        try {
          const industryData = await dispatch(getIndustryById(industryId)).unwrap();
          names[industryId] = industryData.name;
        } catch (error) {
          console.error(`Error fetching industry name for ID ${industryId}:`, error);
          names[industryId] = 'Unknown Industry';
        }
      }
      
      setIndustryNames(names);
      setUniqueIndustries(uniqueIndustryIds.map(id => ({
        id: id,
        name: names[id]
      })));
    };

    if (compJobs.length > 0) {
      fetchIndustryNames();
    }
  }, [compJobs, dispatch]);

  const handleEditJob = (jobId) => {
    navigate(`/employer/jobs/edit/${jobId}`);
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa việc làm này?')) {
      await dispatch(deleteJob(jobId));
      dispatch(fetchJobsbyComp(companyId));
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    if (currentStatus === 0) {
      setSelectedJobId(jobId);
      setExtensionDays(10); // Reset to default
      setExtendError('');
      setIsModalOpen(true);
      return;
    }

    const newStatus = currentStatus === 1 ? 2 : 1;
    try {
      await dispatch(updateJobStatus({ jobId, status: newStatus }));
      dispatch(fetchJobsbyComp(companyId));
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
    }
  };

  const handleManageApplications = (jobId) => {
    navigate(`/employer/jobs/manage-applications/${jobId}`);
  };

  const handleExtendJob = async () => {
    try {
      if (!extensionDays || extensionDays < 1) {
        setExtendError('Số ngày gia hạn phải lớn hơn 0');
        return;
      }

      await dispatch(extendJob({ 
        jobId: selectedJobId, 
        days: parseInt(extensionDays)
      })).unwrap();
      
      dispatch(fetchJobsbyComp(companyId));
      setIsModalOpen(false);
      setSelectedJobId(null);
      setExtendError('');
    } catch (error) {
      setExtendError('Có lỗi xảy ra khi gia hạn công việc');
      console.error('Lỗi gia hạn:', error);
    }
  };

  const handleExtensionDaysChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setExtensionDays(value);
      setExtendError('');
    }
  };

  const handleToggleSortDirection = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const filteredAndSortedJobs = compJobs
    .filter(job => {
      const matchesCategory = !filterCategory || String(job.industryID) === String(filterCategory);
      const matchesStatus = !filterStatus || job.status === parseInt(filterStatus, 10);
      const matchesSearch = !searchTerm || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (industryNames[job.industryID] && 
         industryNames[job.industryID].toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesCategory && matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.postedDate).getTime();
      const dateB = new Date(b.postedDate).getTime();
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const getStatusClass = (status) => {
    switch (status) {
      case '1':
        return 'bg-green-100 text-green-800';
      case '2':
        return 'bg-yellow-100 text-yellow-800';
      case '0':
        return 'bg-red-100 text-red-800';
      case '3':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return 'Đang hoạt động';
      case 2:
        return 'Tạm dừng';
      case 0:
        return 'Hết hạn';
      case 3:
        return 'Chờ duyệt';
      default:
        return 'Không xác định';
    }
  };

  return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Danh Sách Việc Làm Đã Đăng</h2>
          <Link
            to="/employer/post-job"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Đăng Việc Làm Mới
          </Link>
        </div>

        {error && (
          <Alert severity="error" className="mb-6">
            {error}
          </Alert>
        )}

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <select 
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Tất cả ngành nghề</option>
              {uniqueIndustries
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((industry) => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name}
                  </option>
              ))}
            </select>

            <select 
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="1">Đang hoạt động</option>
              <option value="2">Tạm dừng</option>
              <option value="0">Hết hạn</option>
              <option value="3">Chờ duyệt</option>
            </select>

            <input
              type="text"
              placeholder="Tìm kiếm việc làm..."
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <button
              onClick={handleToggleSortDirection}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title={sortDirection === 'desc' ? 'Sắp xếp từ cũ đến mới' : 'Sắp xếp từ mới đến cũ'}
            >
              {sortDirection === 'desc' ? (
                <>
                  <FaSortAmountDown /> Mới nhất
                </>
              ) : (
                <>
                  <FaSortAmountUp /> Cũ nhất
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngành nghề</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày hết hạn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng ứng tuyển</th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lượt xem</th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {status === 'loading' ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center">Đang tải...</td>
                  </tr>
                ) : filteredAndSortedJobs.map((job) => (
                  <tr key={job.jobID}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {industryNames[job.industryID] || 'Loading...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(job.postedDate).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(job.closingDate).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(job.status)}`}>
                        {getStatusText(job.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.applications?.length || 0}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.views}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleEditJob(job.jobID)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Chỉnh sửa"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteJob(job.jobID)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <FaTrash size={16} />
                        </button>
                        {job.status !== 3 && job.status !== 0 && (
                          <button 
                            onClick={() => handleToggleStatus(job.jobID, job.status)}
                            className={job.status === 1 ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                            title={job.status === 1 ? 'Tạm dừng' : 'Kích hoạt'}
                          >
                            {job.status === 1 ? <FaPause size={16} /> : <FaPlay size={16} />}
                          </button>
                        )}
                        <button 
                          onClick={() => handleManageApplications(job.jobID)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Quản lý ứng tuyển"
                        >
                          <FaClipboardList size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Dialog 
          open={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          maxWidth="sm"
        >
          <DialogContent>
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Gia hạn công việc
              </h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Công việc đã hết hạn, vui lòng nhập số ngày muốn gia hạn:
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    value={extensionDays}
                    onChange={handleExtensionDaysChange}
                    placeholder="Nhập số ngày"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">ngày</span>
                </div>
                {extendError && (
                  <p className="text-sm text-red-500">{extendError}</p>
                )}
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setExtendError('');
              }}
              className="mt-3 inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleExtendJob}
              className="inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Đồng ý
            </button>
          </DialogActions>
        </Dialog>
      </div>
  );
};

export default PostedJobsPage;