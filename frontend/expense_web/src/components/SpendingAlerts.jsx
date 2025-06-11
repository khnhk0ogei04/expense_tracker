import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const SpendingAlerts = forwardRef((props, ref) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSpendingAlerts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${API_PATHS.SPENDING_LIMITS.GET_ALERTS}?t=${Date.now()}`);
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Error fetching spending alerts:', error);
      toast.error('Error loading alerts');
    } finally {
      setLoading(false);
    }
  };

  // Expose refresh function to parent component
  useImperativeHandle(ref, () => ({
    refresh: fetchSpendingAlerts
  }));

  useEffect(() => {
    fetchSpendingAlerts();
  }, []);

  const dismissAlert = (index) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'monthly_limit_exceeded':
      case 'category_limit_exceeded':
      case 'expense_exceed_income':
        return '🚨';
      case 'monthly_limit_warning':
      case 'category_limit_warning':
      case 'expense_high_vs_income':
        return '⚠️';
      default:
        return '💡';
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-2xl mr-3">✅</span>
          <div>
            <h3 className="text-green-800 font-medium">All Good!</h3>
            <p className="text-green-600 text-sm">No spending alerts.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending Alerts</h3>
      {alerts.map((alert, index) => (
        <div key={index} className={`border rounded-lg p-4 ${getAlertColor(alert.severity)}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <span className="text-2xl mr-3 flex-shrink-0">
                {getAlertIcon(alert.type)}
              </span>
              <div>
                <p className="font-medium">{alert.message}</p>
                {alert.data && (
                  <div className="mt-2 text-sm opacity-75">
                    {alert.type.includes('monthly') && (
                      <div>
                        Spent: ${alert.data.spent?.toLocaleString('en-US')} / 
                        Limit: ${alert.data.limit?.toLocaleString('en-US')}
                        {alert.data.percentage && ` (${alert.data.percentage}%)`}
                      </div>
                    )}
                    {alert.type.includes('category') && (
                      <div>
                        Category: {alert.data.category} - 
                        Spent: ${alert.data.spent?.toLocaleString('en-US')} / 
                        Limit: ${alert.data.limit?.toLocaleString('en-US')}
                      </div>
                    )}
                    {alert.type.includes('income') && (
                      <div>
                        Income: ${alert.data.income?.toLocaleString('en-US')} - 
                        Expenses: ${alert.data.expenses?.toLocaleString('en-US')}
                        {alert.data.deficit && ` (Deficit: $${alert.data.deficit.toLocaleString('en-US')})`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => dismissAlert(index)}
              className="text-gray-400 hover:text-gray-600 ml-4 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
});

SpendingAlerts.displayName = 'SpendingAlerts';

export default SpendingAlerts; 