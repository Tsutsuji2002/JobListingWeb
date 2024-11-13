import React from 'react';

const MultipleSelect = ({ 
  label, 
  options, 
  selectedValues, 
  onChange, 
  error, 
  loading,
  allowAddress = false 
}) => {
  const handleSelectChange = (e) => {
    const value = Array.from(e.target.selectedOptions, (option) => ({
      id: option.value,  // Make sure to include `id`
      name: option.text,
    }));
    onChange(value);
  };

  return (
    <div className="space-y-2">
      <label className="block text-gray-700 font-medium">
        {label} <span className="text-red-500">*</span>
      </label>
      {loading ? (
        <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
      ) : (
        <select
          multiple
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
          onChange={handleSelectChange}
          value={selectedValues.map((item) => item.id)}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {allowAddress && selectedValues.length > 0 && (
        <div className="mt-2 space-y-2">
          {selectedValues.map((location) => (
            <div key={location.id} className="flex gap-2">
              <input
                type="text"
                placeholder={`Địa chỉ tại ${location.name}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={location.address || ''}
                onChange={(e) => {
                  const newLocations = selectedValues.map((loc) =>
                    loc.id === location.id ? { ...loc, address: e.target.value } : loc
                  );
                  onChange(newLocations);
                }}
              />
            </div>
          ))}
        </div>
      )}
      <p className="text-sm text-gray-500">
        Giữ Ctrl (Windows) hoặc Command (Mac) để chọn nhiều
      </p>
    </div>
  );
};

export default MultipleSelect;