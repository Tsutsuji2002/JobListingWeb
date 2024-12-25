import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/layout/Layout';
import JobCard from '../components/jobs/JobCard';
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import Pagination from '../components/common/Pagination';
import { fetchLocations } from '../../redux/slices/locationSlice';
import { fetchIndustries } from '../../redux/slices/industrySlice';
import { fetchJobLevels, fetchJobs } from '../../redux/slices/jobSlice';

const JobListingPage = () => {
  const dispatch = useDispatch();
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

  const { jobs = [] } = useSelector((state) => state.jobs);
  const { locations = [] } = useSelector((state) => state.locations);
  const { industries = [] } = useSelector((state) => state.industries);

  useEffect(() => {
    dispatch(fetchLocations());
    dispatch(fetchIndustries());
    dispatch(fetchJobLevels());
    dispatch(fetchJobs());
  }, [dispatch]);

  const itemsPerPage = 6;

  // Safe string comparison function
  const safeCompare = (a, b) => {
    const strA = String(a || '').toLowerCase();
    const strB = String(b || '').toLowerCase();
    return strA.localeCompare(strB);
  };

  // Updated filter logic with null checks
  const filteredJobs = (jobs || [])
    .filter(job => {
      if (!job) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const title = String(job.title || '').toLowerCase();
        const company = String(job.company || '').toLowerCase();
        const location = String(job.location || '').toLowerCase();
        
        return (
          title.includes(query) ||
          company.includes(query) ||
          location.includes(query)
        );
      }
      return true;
    })
    .filter(job => {
      if (!job) return false;

      for (const [category, values] of Object.entries(filters)) {
        if (values.length > 0 && category !== 'sortBy') {
          if (category === 'industries') {
            if (values.includes('all') || values.length === 0) {
              continue;
            }
            if (!values.includes(job.industryID)) {
              return false;
            }
          } else if (category === 'locations') {
            if (!values.includes(job.locationID)) {
              return false;
            }
          } else if (!values.includes(job[category])) {
            return false;
          }
        }
      }
      return true;
    });

  // Sort jobs with null checks
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (!a || !b) return 0;
    
    switch (filters.sortBy) {
      case 'salary-desc':
        return (Number(b.salary) || 0) - (Number(a.salary) || 0);
      case 'company':
        return safeCompare(a.company, b.company);
      case 'relevant':
        return 0;
      case 'newest':
      default:
        return new Date(b.postDate || 0) - new Date(a.postDate || 0);
    }
  });

  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);
  const paginatedJobs = sortedJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filterOptions = {
    careers: [],
    industries: [
      { label: 'Tất cả ngành nghề', value: 'all', count: jobs.length },
      ...(industries || []).map(ind => ({ 
        label: ind.name, 
        value: ind.industryID, 
        count: ind.jobCount 
      }))
    ],
    ranks: [],
    locations: (locations || []).map(loc => ({ 
      label: loc.name, 
      value: loc.locationID, 
      count: loc.jobCount 
    })),
    jobTypes: [],
    salary: []
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Danh sách việc làm</h2>
            <SearchBar 
              placeholder="Tìm kiếm việc làm..." 
              onSearch={setSearchQuery} 
            />
          </div>
          
          <FilterBar 
            filters={filters} 
            onFilterChange={setFilters}
            filterOptions={filterOptions}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedJobs.map((job) => (
              job && <JobCard key={job.jobID} job={job} />
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