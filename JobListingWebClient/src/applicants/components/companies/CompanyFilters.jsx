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

const CompanyFilters = ({ filters, onFilterChange, filterOptions }) => {
  const handleFilterChange = (category, values) => {
    onFilterChange(category, values);
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {Object.entries(filterOptions || {}).map(([key, options]) => (
        <FilterOption
          key={key}
          label={
            key === 'industries' ? 'Ngành nghề' :
            key === 'locations' ? 'Địa điểm' :
            key.charAt(0).toUpperCase() + key.slice(1)
          }
          options={options}
          selected={filters[key]}
          onChange={(values) => handleFilterChange(key, values)}
        />
      ))}
    </div>
  );
};

export default CompanyFilters;
