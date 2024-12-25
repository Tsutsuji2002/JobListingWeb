import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEmployerDashboardData } from '../../redux/slices/dashboardSlice';
import { FaBriefcase, FaUsers, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const EmployerDashboard = () => {
    const dispatch = useDispatch();
    const { employerData, loadingEmployer, errorEmployer } = useSelector((state) => state.dashboard);
    const { currentEmployer } = useSelector((state) => state.employer);

    useEffect(() => {
        if (currentEmployer?.userId) {
            dispatch(fetchEmployerDashboardData(currentEmployer.userId));
        }
    }, [dispatch, currentEmployer]);

    if (loadingEmployer) return <div>Loading...</div>;
    if (errorEmployer) return <div>Error: {errorEmployer}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Nhà tuyển dụng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-xl font-semibold text-gray-800">Tổng số công việc đã đăng</div>
                        <FaBriefcase className="text-blue-500 text-2xl" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{employerData?.totalJobsPosted || 0}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-xl font-semibold text-gray-800">Tổng số đơn ứng tuyển</div>
                        <FaUsers className="text-green-500 text-2xl" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{employerData?.totalApplications || 0}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-xl font-semibold text-gray-800">Tổng số đơn chưa duyệt</div>
                        <FaClock className="text-orange-500 text-2xl" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{employerData?.tendingApplications || 0}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-xl font-semibold text-gray-800">Các công việc đã quá hạn</div>
                        <FaExclamationTriangle className="text-red-500 text-2xl" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{employerData?.expiredJobs?.length || 0}</div>
                </div>
            </div>
            {employerData?.ExpiredJobs?.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Công việc đã quá hạn</h3>
                    <ul className="list-disc list-inside text-gray-700">
                        {employerData.ExpiredJobs.map((job) => (
                            <li key={job.JobID}>
                                {job.Title} - Hết hạn: {new Date(job.ClosingDate).toLocaleDateString()}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default EmployerDashboard;
