import React from 'react';

const DashboardStats = ({ stats }) => {
  const statsList = [
    { title: "Tổng số việc làm", value: stats.totalJobListings, icon: "📄", color: "bg-blue-500" },
    { title: "Người dùng đăng ký", value: stats.totalUsers, icon: "👥", color: "bg-green-500" },
    { title: "Tổng số công ty", value: stats.totalCompanies, icon: "🏢", color: "bg-yellow-500" },
    { title: "Tổng số bài viết đã đăng", value: stats.totalPosts, icon: "📝", color: "bg-red-500" },
    { title: "Việc làm chưa duyệt", value: stats.totalUnapprovedJobListings, icon: "⏳", color: "bg-purple-500" },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tổng Quan</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsList.map((stat, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg shadow-md text-white ${stat.color}`}
          >
            <div className="flex items-center">
              <div className="text-4xl mr-4">{stat.icon}</div>
              <div>
                <h2 className="text-xl font-semibold">{stat.value}</h2>
                <p className="text-sm">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;
