import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/layout/Layout';
import CompanyCard from '../components/companies/CompanyCard';
import CompanyModal from '../components/companies/CompanyModal';
import CompanyFilters from '../components/companies/CompanyFilters';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import { 
  fetchCompanies, 
  searchCompanies,
  selectAllCompanies, 
  selectCompanyStatus, 
  selectCompanyError,
  selectSearchResults
} from '../../redux/slices/companySlice';

const CompaniesPage = () => {
  const dispatch = useDispatch();
  const companies = useSelector(selectAllCompanies);
  const searchResults = useSelector(selectSearchResults);
  const status = useSelector(selectCompanyStatus);
  const error = useSelector(selectCompanyError);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 6;

  const displayedCompanies = searchTerm ? searchResults : companies;
  const totalPages = Math.ceil(displayedCompanies.length / itemsPerPage);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCompanies());
    }
  }, [status, dispatch]);

  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
  };

  const handleCloseModal = () => {
    setSelectedCompany(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    if (value.trim()) {
      dispatch(searchCompanies(value));
    }
  };

  const handleFilterChange = (filterType, value) => {
    console.log(`Filter ${filterType}:`, value);
    setCurrentPage(1);
  };

  const paginatedCompanies = displayedCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (status === 'loading' && !companies.length) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (status === 'failed') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            <p className="text-xl">Error: {error}</p>
            <button 
              onClick={() => dispatch(fetchCompanies())}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

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
          <CompanyFilters onFilterChange={handleFilterChange} />
          {status === 'loading' && companies.length > 0 && (
            <div className="absolute top-0 left-0 right-0 bg-white bg-opacity-50 h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}
          {paginatedCompanies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCompanies.map((company) => (
                <CompanyCard 
                  key={company.CompanyID} 
                  company={company} 
                  onClick={handleCompanyClick} 
                />
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