import React from 'react';

interface FilterPanelProps {
  filters: {
    category: string;
    priceRange: [number, number];
    rating: number;
    contractType: string;
  };
  onFilterChange: (filters: any) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          name="category"
          value={filters.category}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All</option>
          <option value="DeFi">DeFi</option>
          <option value="NFT">NFT</option>
          <option value="Gaming">Gaming</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Price Range (XLM)</label>
        <input
          type="number"
          name="priceRange"
          value={filters.priceRange[0]}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              priceRange: [Number(e.target.value), filters.priceRange[1]],
            })
          }
          placeholder="Min"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
        />
        <input
          type="number"
          name="priceRange"
          value={filters.priceRange[1]}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              priceRange: [filters.priceRange[0], Number(e.target.value)],
            })
          }
          placeholder="Max"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Rating</label>
        <input
          type="number"
          name="rating"
          value={filters.rating}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Contract Type</label>
        <select
          name="contractType"
          value={filters.contractType}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All</option>
          <option value="Soroban">Soroban</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;