import React from 'react';
import JobCard from '../jobs/JobCard';
import { Link } from 'react-router-dom';

const FeaturedJobs = ({ jobs = [] }) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Việc làm nổi bật</h2>
          <p className="text-gray-600">
            Khám phá những cơ hội được chúng tôi lựa chọn kỹ lưỡng từ các công ty hàng đầu
          </p>
        </div>
        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.slice(0, 3).map((job) => (
              <div key={job.jobId}>
                <JobCard job={job} onClick={() => {}} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">
            Không có việc làm nổi bật nào được tìm thấy
          </div>
        )}
        <div className="text-center mt-8">
          <Link
            to="/jobs"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-600"
          >
            Xem tất cả công việc
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;