import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { LuTrash2 } from 'react-icons/lu';
import Modal from './Modal';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import { getExpenseCategoryNames } from '../utils/categories';

const SpendingLimitsManager = ({ isOpen, onClose, onRefresh }) => {
  const [spendingLimits, setSpendingLimits] = useState({
    monthlyLimit: 0,
    categoryLimits: [],
    alertSettings: {
      monthlyLimitEnabled: true,
      categoryLimitEnabled: true,
      incomeVsExpenseEnabled: true,
      monthlyWarningThreshold: 80
    }
  });
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState({ category: '', limit: '', warningThreshold: 80 });

  // Get expense categories from centralized list
  const commonCategories = getExpenseCategoryNames();

  useEffect(() => {
    if (isOpen) {
      fetchSpendingLimits();
    }
  }, [isOpen]);

  const fetchSpendingLimits = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.SPENDING_LIMITS.GET_LIMITS);
      setSpendingLimits(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const updateMonthlyLimit = async () => {
    try {
      setLoading(true);
      await axiosInstance.put(`${API_PATHS.SPENDING_LIMITS.UPDATE_LIMITS}/monthly`, {
        limit: spendingLimits.monthlyLimit,
        warningThreshold: spendingLimits.alertSettings.monthlyWarningThreshold
      });
      toast.success('Monthly spending limit updated successfully!');
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error updating monthly limit:', error);
      toast.error('Error updating monthly limit');
    } finally {
      setLoading(false);
    }
  };

  const updateSpendingLimits = async () => {
    try {
      setLoading(true);
      await axiosInstance.put(API_PATHS.SPENDING_LIMITS.UPDATE_LIMITS, spendingLimits);
      toast.success('Settings updated successfully!');
      
      if (onRefresh) {
        onRefresh();
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating spending limits:', error);
      toast.error('Error updating settings');
    } finally {
      setLoading(false);
    }
  };

  const addCategoryLimit = async () => {
    if (!newCategory.category || !newCategory.limit) {
      toast.error('Please enter both category and limit');
      return;
    }

    const categoryExists = spendingLimits.categoryLimits.some(
      cl => cl.category.toLowerCase() === newCategory.category.toLowerCase()
    );

    if (categoryExists) {
      toast.error('This category already exists');
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post(`${API_PATHS.SPENDING_LIMITS.UPDATE_LIMITS}/category`, {
        category: newCategory.category,
        limit: parseFloat(newCategory.limit),
        warningThreshold: parseFloat(newCategory.warningThreshold)
      });

      setNewCategory({ category: '', limit: '', warningThreshold: 80 });
      toast.success('Category limit added successfully!');
      await fetchSpendingLimits();
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error adding category limit:', error);
      toast.error('Error adding category limit');
    } finally {
      setLoading(false);
    }
  };

  const removeCategoryLimit = async (index) => {
    try {
      setLoading(true);
      const categoryId = spendingLimits.categoryLimits[index]._id;
      await axiosInstance.delete(`${API_PATHS.SPENDING_LIMITS.UPDATE_LIMITS}/category/${categoryId}`);
      toast.success('Category limit deleted successfully!');
      await fetchSpendingLimits();
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error deleting category limit:', error);
      toast.error('Error deleting category limit');
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryLimit = (index, field, value) => {
    setSpendingLimits(prev => ({
      ...prev,
      categoryLimits: prev.categoryLimits.map((item, i) => 
        i === index ? { 
          ...item, 
          [field]: (field === 'limit' || field === 'warningThreshold') ? parseFloat(value) || 0 : value 
        } : item
      )
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Spending Limits Management">
      <div className="space-y-6">
        {/* Monthly Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Spending Limit ($)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            <input
              type="number"
              value={spendingLimits.monthlyLimit}
              onChange={(e) => setSpendingLimits(prev => ({
                ...prev,
                monthlyLimit: parseFloat(e.target.value) || 0
              }))}
              placeholder="Enter monthly limit"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={spendingLimits.alertSettings.monthlyWarningThreshold}
                onChange={(e) => setSpendingLimits(prev => ({
                  ...prev,
                  alertSettings: {
                    ...prev.alertSettings,
                    monthlyWarningThreshold: parseFloat(e.target.value) || 80
                  }
                }))}
                placeholder="Warning %"
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">% warning</span>
            </div>
            <button
              onClick={updateMonthlyLimit}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Category Limits */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Category Limits</h3>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Add Category Limit</h4>
            <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr] gap-2">
                <select
                    value={newCategory.category}
                    onChange={(e) =>
                        setNewCategory(prev => ({ ...prev, category: e.target.value }))
                    }
                    className="
                        w-auto
                        px-4 py-2.5 rounded-lg border border-gray-300 
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                        transition-all text-gray-700 font-medium bg-white shadow-sm
                    "
                    >
                    <option value="">Select category</option>
                    {commonCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
              <div className='flex items-center gap-1'>
                    <input
                    type="number"
                    value={newCategory.limit}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, limit: e.target.value }))}
                    placeholder="Limit ($)"
                    className="px-3 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newCategory.warningThreshold}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, warningThreshold: e.target.value }))}
                  placeholder="Warning %"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-600">%</span>
              </div>
              
              <button
                onClick={addCategoryLimit}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
            </div>
            
            {newCategory.category === '' && (
              <input
                type="text"
                value={newCategory.category}
                onChange={(e) => setNewCategory(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Or enter other category name"
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
          <div className="space-y-2">
            {spendingLimits.categoryLimits.map((item, index) => (
              <div key={item._id || index} className="p-3 bg-white border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr_2fr_1fr] gap-2 items-center">
                  <div>
                    <span className="font-medium text-sm text-gray-800">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-600">Limit: $</span>
                    <input
                      type="number"
                      value={item.limit || ''}
                      onChange={(e) => updateCategoryLimit(index, 'limit', e.target.value)}
                      className="w-30 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-600">Warning:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.warningThreshold || 80}
                      onChange={(e) => updateCategoryLimit(index, 'warningThreshold', e.target.value)}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-600">%</span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => removeCategoryLimit(index)}
                      disabled={loading}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      <LuTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-800">Monthly Limit Alert</h4>
                <span className="text-sm text-gray-700">Alert when monthly limit is exceeded</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={spendingLimits.alertSettings.monthlyLimitEnabled}
                  onChange={(e) => setSpendingLimits(prev => ({
                    ...prev,
                    alertSettings: {
                      ...prev.alertSettings,
                      monthlyLimitEnabled: e.target.checked
                    }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-800">Category Limit Alert</h4>
                <span className="text-sm text-gray-700">Alert when category limit is exceeded</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={spendingLimits.alertSettings.categoryLimitEnabled}
                  onChange={(e) => setSpendingLimits(prev => ({
                    ...prev,
                    alertSettings: {
                      ...prev.alertSettings,
                      categoryLimitEnabled: e.target.checked
                    }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-800">Income vs Expense Alert</h4>
                <span className="text-sm text-gray-700">Alert when expenses exceed income</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={spendingLimits.alertSettings.incomeVsExpenseEnabled}
                  onChange={(e) => setSpendingLimits(prev => ({
                    ...prev,
                    alertSettings: {
                      ...prev.alertSettings,
                      incomeVsExpenseEnabled: e.target.checked
                    }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={updateSpendingLimits}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SpendingLimitsManager; 