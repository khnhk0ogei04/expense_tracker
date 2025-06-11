import React, { useState, useEffect } from 'react';
import { LuSearch, LuFilter, LuX, LuCalendar } from 'react-icons/lu';
import moment from 'moment';
import { getExpenseCategoryNames, getIncomeSourceNames } from '../utils/categories';

const TransactionFilter = ({ 
  transactions, 
  onFilteredResults, 
  type = 'expense'
}) => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  });
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const categories = type === 'expense' ? getExpenseCategoryNames() : getIncomeSourceNames();
  useEffect(() => {
    if (!transactions) return;
    const hasActiveFilters = Object.values(filters).some(value => value !== '');
    if (!hasActiveFilters) {
      onFilteredResults(transactions);
      return;
    }

    let filtered = [...transactions];
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(transaction => {
        const searchField = type === 'expense' ? transaction.category : transaction.source;
        return searchField?.toLowerCase().includes(searchLower);
      });
    }
    if (filters.category) {
      filtered = filtered.filter(transaction => {
        const categoryField = type === 'expense' ? transaction.category : transaction.source;
        return categoryField === filters.category;
      });
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(transaction => 
        moment(transaction.date).isSameOrAfter(moment(filters.dateFrom))
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(transaction => 
        moment(transaction.date).isSameOrBefore(moment(filters.dateTo))
      );
    }
    if (filters.amountMin) {
      filtered = filtered.filter(transaction => 
        transaction.amount >= parseFloat(filters.amountMin)
      );
    }

    if (filters.amountMax) {
      filtered = filtered.filter(transaction => 
        transaction.amount <= parseFloat(filters.amountMax)
      );
    }

    onFilteredResults(filtered);
  }, [filters, transactions, onFilteredResults, type]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      category: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: ''
    });
    setShowAdvancedFilters(false);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${type === 'expense' ? 'expense categories' : 'income sources'}...`}
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex items-center px-4 py-2 rounded-md border transition-colors ${
            showAdvancedFilters 
              ? 'bg-blue-500 text-white border-blue-500' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <LuFilter className="mr-2" />
          Filter
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            <LuX className="mr-2" />
            Clear filters
          </button>
        )}
      </div>
      {showAdvancedFilters && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {type === 'expense' ? 'Category' : 'Income Source'}
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount From ($)
              </label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={filters.amountMin}
                onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount To ($)
              </label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={filters.amountMax}
                onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Filters
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const today = moment().format('YYYY-MM-DD');
                    handleFilterChange('dateFrom', today);
                    handleFilterChange('dateTo', today);
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    const weekStart = moment().startOf('week').format('YYYY-MM-DD');
                    const weekEnd = moment().endOf('week').format('YYYY-MM-DD');
                    handleFilterChange('dateFrom', weekStart);
                    handleFilterChange('dateTo', weekEnd);
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  This Week
                </button>
                <button
                  onClick={() => {
                    const monthStart = moment().startOf('month').format('YYYY-MM-DD');
                    const monthEnd = moment().endOf('month').format('YYYY-MM-DD');
                    handleFilterChange('dateFrom', monthStart);
                    handleFilterChange('dateTo', monthEnd);
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  This Month
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Search: "{filters.searchTerm}"
                <button 
                  onClick={() => handleFilterChange('searchTerm', '')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                {type === 'expense' ? 'Category' : 'Source'}: {filters.category}
                <button 
                  onClick={() => handleFilterChange('category', '')}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {(filters.dateFrom || filters.dateTo) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                Date: {filters.dateFrom ? moment(filters.dateFrom).format('MM/DD') : '...'} - {filters.dateTo ? moment(filters.dateTo).format('MM/DD') : '...'}
                <button 
                  onClick={() => {
                    handleFilterChange('dateFrom', '');
                    handleFilterChange('dateTo', '');
                  }}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFilter; 