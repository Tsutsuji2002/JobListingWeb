import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import JobCard from '../components/jobs/JobCard';
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import Pagination from '../components/common/Pagination';
import { jobListings } from '../data/jobListings';

const JobListingPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    careers: [],
    industries: [],
    ranks: [],
    locations: [],
    jobTypes: [],
    salary: [],
    sortBy: 'newest',
  });

  const itemsPerPage = 6;

  // Apply filters and search to jobs
  const filteredJobs = jobListings
    .filter(job => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.location.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter(job => {
      // Apply each active filter
      for (const [category, values] of Object.entries(filters)) {
        if (values.length > 0 && category !== 'sortBy') {
          // Add your filter logic here based on your data structure
          // This is just an example:
          if (!values.includes(job[category])) {
            return false;
          }
        }
      }
      return true;
    });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (filters.sortBy) {
      case 'salary-desc':
        return (b.salary || 0) - (a.salary || 0);
      case 'company':
        return a.company.localeCompare(b.company);
      case 'relevant':
        // Add your relevance sorting logic here
        return 0;
      case 'newest':
      default:
        return new Date(b.postDate) - new Date(a.postDate);
    }
  });

  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);
  const paginatedJobs = sortedJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Danh sách việc làm</h2>
            <SearchBar onSearch={setSearchQuery} />
          </div>
          
          <FilterBar filters={filters} onFilterChange={setFilters} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          
          {paginatedJobs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">Không tìm thấy việc làm nào phù hợp với tiêu chí của bạn</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </Layout>
  );
};

export default JobListingPage;