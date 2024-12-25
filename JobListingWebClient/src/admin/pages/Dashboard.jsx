import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardStats from '../components/dashboard/DashboardStats';
import { fetchDashboardData } from '../../redux/slices/dashboardSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { generalData, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      {loading && <p>Loading dashboard...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {generalData && <DashboardStats stats={generalData} />}
    </div>
  );
};

export default Dashboard;
