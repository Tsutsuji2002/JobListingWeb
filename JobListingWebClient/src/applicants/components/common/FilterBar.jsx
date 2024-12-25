import React, { useState } from 'react';
import { FaChevronDown, FaTimes } from 'react-icons/fa';

const FilterOption = ({ label, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (value) => {
    // If the value is already selected, remove it
    // If not, add it to the selection
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];
    
    onChange(newSelected);
  };

  const handleSelectAll = () => {
    // If all options are selected, clear selection
    // Otherwise, select all option values
    const newSelected = selected.length === options.length 
      ? [] 
      : options.map(option => option.value);
    
    onChange(newSelected);
  };

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
              {options.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selected.length === options.length ? 'Xóa tất cả' : 'Chọn tất cả'}
                </button>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto">
              {options.map((option) => (
                <label key={option.value} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.includes(option.value)}
                    onChange={() => handleOptionClick(option.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">{option.label}</span>
                  {option.count !== undefined && (
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

const FilterBar = ({ filters, onFilterChange, filterOptions }) => {
  const [activeFilters, setActiveFilters] = useState(
    Object.keys(filterOptions || {}).reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {})
  );

  const [sortBy, setSortBy] = useState('newest');

  const handleFilterChange = (category, values) => {
    const newFilters = { ...activeFilters, [category]: values };
    setActiveFilters(newFilters);
    onFilterChange({ ...newFilters, sortBy });
  };

  const clearAllFilters = () => {
    const newFilters = Object.keys(activeFilters).reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {});
    
    setActiveFilters(newFilters);
    setSortBy('newest');
    onFilterChange({ ...newFilters, sortBy: 'newest' });
  };

  const sortOptions = [
    { label: 'Mới nhất', value: 'newest' },
    { label: 'Lương cao nhất', value: 'salary-desc' },
    { label: 'Liên quan nhất', value: 'relevant' },
    { label: 'Tên công ty', value: 'company' },
  ];

  const hasActiveFilters = Object.values(activeFilters).some(arr => arr.length > 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-wrap gap-2 flex-grow">
          {Object.entries(filterOptions || {}).map(([key, options]) => (
            <FilterOption
              key={key}
              label={
                key === 'industries' ? 'Ngành nghề' : 
                key === 'locations' ? 'Địa điểm' :
                key === 'ranks' ? 'Cấp bậc' :
                key === 'careers' ? 'Lĩnh vực' :
                key === 'jobTypes' ? 'Loại công việc' :
                key === 'salary' ? 'Mức lương' : 
                key.charAt(0).toUpperCase() + key.slice(1)
              }
              options={options}
              selected={activeFilters[key]}
              onChange={(values) => handleFilterChange(key, values)}
            />
          ))}
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => {
              const newSortBy = e.target.value;
              setSortBy(newSortBy);
              onFilterChange({ ...activeFilters, sortBy: newSortBy });
            }}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm appearance-none pr-8"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                Sắp xếp theo: {option.label}
              </option>
            ))}
          </select>
          <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Bộ lọc đang áp dụng:</span>
          {Object.entries(activeFilters).map(([category, values]) =>
            values.map((value) => (
              <span
                key={`${category}-${value}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {filterOptions && filterOptions[category].find(opt => opt.value === value)?.label}
                <button
                  onClick={() => handleFilterChange(category, activeFilters[category].filter(item => item !== value))}
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