import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import moment from "moment";

const MonthlyIncomeExpenseChart = ({ incomeData, expenseData }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const prepareMonthlyData = () => {
      const monthlyData = {};
      
      // Process income data
      incomeData?.forEach(income => {
        const month = moment(income.date).format('MMM YYYY');
        if (!monthlyData[month]) {
          monthlyData[month] = { month, income: 0, expense: 0 };
        }
        monthlyData[month].income += income.amount;
      });

      // Process expense data
      expenseData?.forEach(expense => {
        const month = moment(expense.date).format('MMM YYYY');
        if (!monthlyData[month]) {
          monthlyData[month] = { month, income: 0, expense: 0 };
        }
        monthlyData[month].expense += expense.amount;
      });

      // Convert to array and sort by date
      const sortedData = Object.values(monthlyData)
        .sort((a, b) => moment(a.month, 'MMM YYYY').diff(moment(b.month, 'MMM YYYY')))
        .slice(-6); // Show last 6 months

      setChartData(sortedData);
    };

    if (incomeData || expenseData) {
      prepareMonthlyData();
    }
  }, [incomeData, expenseData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white shadow-lg rounded-lg p-3 border border-gray-200">
          <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'income' ? 'Income' : 'Expense'}: ${entry.value?.toLocaleString('en-US')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg font-semibold">Income & Expense by Month</h5>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12, fill: "#666" }} 
            stroke="#ccc"
          />
          <YAxis 
            tick={{ fontSize: 12, fill: "#666" }} 
            stroke="#ccc"
            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="income" 
            name="Income"
            fill="#10B981" 
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          />
          <Bar 
            dataKey="expense" 
            name="Expense"
            fill="#EF4444" 
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyIncomeExpenseChart; 