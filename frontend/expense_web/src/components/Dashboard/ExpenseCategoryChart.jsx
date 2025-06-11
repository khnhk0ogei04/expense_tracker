import React, { useEffect, useState } from "react";
import CustomPieChart from "../Charts/CustomPieChart";

const ExpenseCategoryChart = ({ expenseData }) => {
  const [chartData, setChartData] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);

  const COLORS = [
    "#875CF5", "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", 
    "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9", "#F8C471"
  ];

  useEffect(() => {
    const prepareCategoryData = () => {
      if (!expenseData || expenseData.length === 0) {
        setChartData([]);
        setTotalExpense(0);
        return;
      }

      // Group expenses by category
      const categoryTotals = {};
      let total = 0;

      expenseData.forEach(expense => {
        const category = expense.category || 'Other';
        categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
        total += expense.amount;
      });

      // Convert to chart data format
      const data = Object.entries(categoryTotals)
        .map(([category, amount]) => ({
          name: category,
          amount: amount,
          percentage: ((amount / total) * 100).toFixed(1)
        }))
        .sort((a, b) => b.amount - a.amount) // Sort by amount descending
        .slice(0, 8); // Show top 8 categories

      setChartData(data);
      setTotalExpense(total);
    };

    prepareCategoryData();
  }, [expenseData]);

  if (!chartData.length) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-lg font-semibold">Expense Breakdown by Category</h5>
        </div>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No expense data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg font-semibold">Expense Breakdown by Category</h5>
      </div>
      
      <CustomPieChart
        data={chartData}
        label="Total Expenses"
        totalAmount={`$${totalExpense.toLocaleString('en-US')}`}
        colors={COLORS}
        showTextAnchor={true}
      />

      {/* Category breakdown */}
      <div className="mt-4 space-y-2">
        <h6 className="text-sm font-medium text-gray-700 mb-3">Details by category:</h6>
        {chartData.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <span className="text-sm font-medium text-gray-700">{item.name}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                ${item.amount.toLocaleString('en-US')}
              </div>
              <div className="text-xs text-gray-500">
                {item.percentage}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseCategoryChart; 