import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/layout/Layout';
import CompanyCard from '../components/companies/CompanyCard';
import CompanyModal from '../components/companies/CompanyModal';
import CompanyFilters from '../components/companies/CompanyFilters';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import {
  fetchCompanies,
  selectAllCompanies,
  selectCompanyStatus,
  selectCompanyError,
} from '../../redux/slices/companySlice';
import { fetchIndustries } from '../../redux/slices/industrySlice';
import { fetchLocations } from '../../redux/slices/locationSlice';

const CompaniesPage = () => {
  const dispatch = useDispatch();

  // Local state management
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCompanyIds, setVisibleCompanyIds] = useState(new Set());
  const [filters, setFilters] = useState({
    industries: [],
    locations: [],
    sortBy: 'newest',
  });

  // Pagination configuration
  const itemsPerPage = 6;

  // Redux state selectors
  const companies = useSelector(selectAllCompanies);
  const industries = useSelector((state) => state.industries.industries);
  const locations = useSelector((state) => state.locations.locations);
  const status = useSelector(selectCompanyStatus);
  const error = useSelector(selectCompanyError);

  // Fetch initial data on component mount
  useEffect(() => {
    dispatch(fetchCompanies());
    dispatch(fetchIndustries());
    dispatch(fetchLocations());
  }, [dispatch]);

  // Initialize visible companies when companies data is loaded
  useEffect(() => {
    if (companies.length > 0) {
      setVisibleCompanyIds(new Set(companies.map(company => company?.companyID)));
    }
  }, [companies]);

  // Search and filter logic
  useEffect(() => {
    const applySearchAndFilters = () => {
      const matchingIds = new Set();
      
      companies.forEach(company => {
        if (!company) return;

        // Search term matching
        let matchesSearch = true;
        if (searchTerm) {
          const query = searchTerm.toLowerCase();
          const searchableFields = [
            company.name,
            company.description,
            ...(company.mappingLocations?.map(ml => ml?.location?.name) || []),
            ...(company.mappingIndustries?.map(mi => mi?.industry?.name) || [])
          ];
          
          matchesSearch = searchableFields.some(field => 
            String(field || '').toLowerCase().includes(query)
          );
        }

        // Filter matching
        let matchesFilters = true;
        
        // Industry filter
        if (filters.industries.length > 0 && !filters.industries.includes('all')) {
          matchesFilters = company.mappingIndustries?.some(mi => 
            filters.industries.includes(mi?.industry?.industryID)
          );
        }
        
        // Location filter
        if (filters.locations.length > 0) {
          matchesFilters = matchesFilters && company.mappingLocations?.some(ml =>
            filters.locations.includes(ml?.location?.locationID)
          );
        }

        // Add to visible set if matches both search and filters
        if (matchesSearch && matchesFilters) {
          matchingIds.add(company.companyID);
        }
      });

      setVisibleCompanyIds(matchingIds);
      setCurrentPage(1); // Reset to first page when search/filters change
    };

    applySearchAndFilters();
  }, [searchTerm, filters, companies]);

  // Compute visible and sorted companies
  const visibleAndSortedCompanies = useMemo(() => {
    const visibleCompanies = companies.filter(company => 
      visibleCompanyIds.has(company?.companyID)
    );

    // Apply sorting
    return [...visibleCompanies].sort((a, b) => {
      if (!a || !b) return 0;

      switch (filters.sortBy) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'newest':
        default:
          return new Date(b.createdDate || 0) - new Date(a.createdDate || 0);
      }
    });
  }, [companies, visibleCompanyIds, filters.sortBy]);

  // Calculate pagination
  const totalPages = Math.ceil(visibleAndSortedCompanies.length / itemsPerPage);
  const paginatedCompanies = visibleAndSortedCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Event handlers
  const handleCompanyClick = (company) => setSelectedCompany(company);
  const handleCloseModal = () => setSelectedCompany(null);
  const handleSearch = (value) => setSearchTerm(value);
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Prepare filter options
  const filterOptions = {
    industries: [
      { label: 'Tất cả ngành nghề', value: 'all', count: companies.length },
      ...(industries || []).map(ind => ({
        label: ind.name,
        value: ind.industryID,
        count: ind.companyCount
      }))
    ],
    locations: (locations || []).map(loc => ({
      label: loc.name,
      value: loc.locationID,
      count: loc.companyCount
    })),
  };

  // Loading state
  if (status === 'loading' && !companies.length) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (status === 'failed') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-xl text-red-600">Error: {error}</p>
          <button
            onClick={() => dispatch(fetchCompanies())}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </Layout>
    );
  }

  // Main render
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Các công ty nổi bật</h2>
            <SearchBar
              onSearch={handleSearch}
              initialValue={searchTerm}
              placeholder="Tìm kiếm công ty..."
            />
          </div>

          <CompanyFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions}
          />

          {paginatedCompanies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <div 
                  key={company?.companyID}
                  className={`transition-opacity duration-300 ${
                    visibleCompanyIds.has(company?.companyID) 
                      ? 'opacity-100'
                      : 'opacity-50 pointer-events-none hidden'
                  }`}
                >
                  <CompanyCard 
                    company={company} 
                    onClick={handleCompanyClick}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              <p className="text-xl">Không tìm thấy kết quả phù hợp</p>
              {searchTerm && (
                <button
                  onClick={() => handleSearch('')}
                  className="mt-4 text-blue-500 hover:text-blue-600"
                >
                  Xóa tìm kiếm
                </button>
              )}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}

        <CompanyModal company={selectedCompany} onClose={handleCloseModal} />
      </div>
    </Layout>
  );
};

export default CompaniesPage;