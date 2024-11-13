import React, { useState } from 'react';
import { FaChevronDown, FaTimes, FaFilter } from 'react-icons/fa';

const FilterOption = ({ label, options, selected, onChange, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center justify-between min-w-[160px] text-sm"
      >
        <span className="truncate">
          {selected.length ? `${label} (${selected.length})` : label}
        </span>
        <FaChevronDown className={`ml-2 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="p-2">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{label}</span>
              {selected.length > 0 && (
                <button
                  onClick={() => {
                    onClear();
                    setIsOpen(false);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Xóa tất cả
                </button>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto">
              {options.map((option) => (
                <label key={option.value} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.includes(option.value)}
                    onChange={() => onChange(option.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">{option.label}</span>
                  {option.count && (
                    <span className="ml-auto text-xs text-gray-500">({option.count})</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterBar = ({ filters, onFilterChange }) => {
  const [activeFilters, setActiveFilters] = useState({
    careers: [],
    industries: [],
    ranks: [],
    locations: [],
    jobTypes: [],
    salary: [],
  });

  const [sortBy, setSortBy] = useState('Mới nhất');

  const handleFilterChange = (category, value) => {
    const newFilters = { ...activeFilters };
    if (newFilters[category].includes(value)) {
      newFilters[category] = newFilters[category].filter(item => item !== value);
    } else {
      newFilters[category] = [...newFilters[category], value];
    }
    setActiveFilters(newFilters);
    onFilterChange({ ...newFilters, sortBy });
  };

  const handleClearCategory = (category) => {
    const newFilters = { ...activeFilters, [category]: [] };
    setActiveFilters(newFilters);
    onFilterChange({ ...newFilters, sortBy });
  };

  const clearAllFilters = () => {
    const newFilters = Object.keys(activeFilters).reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {});
    setActiveFilters(newFilters);
    setSortBy('Mới nhất');
    onFilterChange({ ...newFilters, sortBy: 'Mới nhất' });
  };

  const filterOptions = {
    careers: [
      { label: 'Software Development', value: 'software', count: 145 },
      { label: 'Data Science', value: 'data', count: 89 },
      { label: 'Product Management', value: 'product', count: 56 },
      { label: 'Design', value: 'design', count: 78 },
      { label: 'Marketing', value: 'marketing', count: 92 },
    ],
    industries: [
      { label: 'Technology', value: 'tech', count: 234 },
      { label: 'Healthcare', value: 'healthcare', count: 156 },
      { label: 'Finance', value: 'finance', count: 189 },
      { label: 'Education', value: 'education', count: 78 },
      { label: 'E-commerce', value: 'ecommerce', count: 145 },
    ],
    ranks: [
      { label: 'Entry Level', value: 'entry', count: 167 },
      { label: 'Mid Level', value: 'mid', count: 245 },
      { label: 'Senior', value: 'senior', count: 189 },
      { label: 'Lead', value: 'lead', count: 78 },
      { label: 'Executive', value: 'executive', count: 34 },
    ],
    locations: [
      { label: 'San Francisco', value: 'sf', count: 234 },
      { label: 'New York', value: 'ny', count: 189 },
      { label: 'London', value: 'london', count: 167 },
      { label: 'Remote', value: 'remote', count: 445 },
      { label: 'Singapore', value: 'singapore', count: 89 },
    ],
    jobTypes: [
      { label: 'Full-time', value: 'fulltime', count: 567 },
      { label: 'Part-time', value: 'parttime', count: 123 },
      { label: 'Contract', value: 'contract', count: 234 },
      { label: 'Internship', value: 'internship', count: 89 },
      { label: 'Temporary', value: 'temporary', count: 45 },
    ],
    salary: [
      { label: '$0 - $50k', value: '0-50k', count: 123 },
      { label: '$50k - $100k', value: '50k-100k', count: 234 },
      { label: '$100k - $150k', value: '100k-150k', count: 189 },
      { label: '$150k - $200k', value: '150k-200k', count: 98 },
      { label: '$200k+', value: '200k+', count: 45 },
    ],
  };

  const sortOptions = [
    { label: 'Mới nhất', value: 'Mới nhất' },
    { label: 'Highest Salary', value: 'salary-desc' },
    { label: 'Most Relevant', value: 'relevant' },
    { label: 'Company Name', value: 'company' },
  ];

  const hasActiveFilters = Object.values(activeFilters).some(arr => arr.length > 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap gap-4">
        {/* Filter Options */}
        <div className="flex flex-wrap gap-2 flex-grow">
          {Object.entries(filterOptions).map(([key, options]) => (
            <FilterOption
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              options={options}
              selected={activeFilters[key]}
              onChange={(value) => handleFilterChange(key, value)}
              onClear={() => handleClearCategory(key)}
            />
          ))}
        </div>

        {/* Sort By Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              onFilterChange({ ...activeFilters, sortBy: e.target.value });
            }}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm appearance-none pr-8"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                Sort by: {option.label}
              </option>
            ))}
          </select>
          <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          {Object.entries(activeFilters).map(([category, values]) =>
            values.map((value) => (
              <span
                key={`${category}-${value}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {filterOptions[category].find(opt => opt.value === value)?.label}
                <button
                  onClick={() => handleFilterChange(category, value)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <FaTimes size={12} />
                </button>
              </span>
            ))
          )}
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 ml-2"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;