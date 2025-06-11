import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";

import { LuHandCoins, LuWalletMinimal, LuSettings } from "react-icons/lu";
import { IoMdCard } from "react-icons/io";

import { useNavigate } from "react-router-dom";
import InfoCard from "../../components/cards/InfoCard";
import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { addThousandsSeparator } from "../../utils/helper";
import RecentTransactions from "../../components/Dashboard/RecentTransactions";
import FinanceOverview from "../../components/Dashboard/FinanceOverview";
import ExpenseTransactions from "../../components/Dashboard/ExpenseTransactions";
import Last30DaysExpenses from "../../components/Dashboard/Last30DaysExpenses";
import RecentIncome from "../../components/Dashboard/RecentIncome";
import SpendingAlerts from "../../components/SpendingAlerts";
import SpendingLimitsManager from "../../components/SpendingLimitsManager";
import MonthlyIncomeExpenseChart from "../../components/Dashboard/MonthlyIncomeExpenseChart";
import ExpenseCategoryChart from "../../components/Dashboard/ExpenseCategoryChart";
import Modal from "../../components/Modal";
import EditTransactionForm from "../../components/EditTransactionForm";
import toast from "react-hot-toast";

const Home = () => {
  useUserAuth();

  const navigate = useNavigate();
  const spendingAlertsRef = useRef();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSpendingLimitsModal, setShowSpendingLimitsModal] = useState(false);
  const [allExpenses, setAllExpenses] = useState([]);
  const [allIncomes, setAllIncomes] = useState([]);

  // Edit modal states
  const [openEditExpenseModal, setOpenEditExpenseModal] = useState({
    show: false,
    data: null,
  });
  const [openEditIncomeModal, setOpenEditIncomeModal] = useState({
    show: false,
    data: null,
  });

  const fetchDashboardData = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `${API_PATHS.DASHBOARD.GET_DATA}`
      );

      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFullData = async () => {
    try {
      // Fetch all expenses and incomes for charts
      const [expensesResponse, incomesResponse] = await Promise.all([
        axiosInstance.get('/api/v1/expense/get'),
        axiosInstance.get('/api/v1/income/get')
      ]);

      setAllExpenses(expensesResponse.data || []);
      setAllIncomes(incomesResponse.data || []);
    } catch (error) {
      console.error('Error fetching full data:', error);
    }
  };

  // Helper function to refresh all dashboard data
  const refreshAllData = async () => {
    try {
      // Fetch updated data first
      await fetchDashboardData();
      await fetchFullData();
      
      // Small delay to ensure data is fully updated, then refresh alerts
      setTimeout(() => {
        if (spendingAlertsRef.current) {
          spendingAlertsRef.current.refresh();
        }
      }, 300);
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    }
  };

  // Handle Edit Expense
  const handleEditExpense = async (expenseId, updateData) => {
    try {
      await axiosInstance.put(API_PATHS.EXPENSE.UPDATE_EXPENSE(expenseId), updateData);
      
      setOpenEditExpenseModal({ show: false, data: null });
      toast.success("Expense updated successfully");
      
      // Refresh all dashboard data including alerts
      await refreshAllData();
    } catch (error) {
      console.error(
        "Error updating expense:",
        error.response?.data?.message || error.message
      );
      toast.error("Failed to update expense. Please try again.");
    }
  };

  // Handle Edit Income
  const handleEditIncome = async (incomeId, updateData) => {
    try {
      await axiosInstance.put(API_PATHS.INCOME.UPDATE_INCOME(incomeId), updateData);
      
      setOpenEditIncomeModal({ show: false, data: null });
      toast.success("Income updated successfully");
      
      // Refresh all dashboard data including alerts
      await refreshAllData();
    } catch (error) {
      console.error(
        "Error updating income:",
        error.response?.data?.message || error.message
      );
      toast.error("Failed to update income. Please try again.");
    }
  };

  // Handle edit clicks for different transaction types
  const handleEditTransaction = (transaction) => {
    if (transaction.type === 'expense') {
      setOpenEditExpenseModal({ show: true, data: transaction });
    } else if (transaction.type === 'income') {
      setOpenEditIncomeModal({ show: true, data: transaction });
    }
  };

  const handleEditExpenseTransaction = (expense) => {
    setOpenEditExpenseModal({ show: true, data: expense });
  };

  const handleEditIncomeTransaction = (income) => {
    setOpenEditIncomeModal({ show: true, data: income });
  };

  useEffect(() => {
    fetchDashboardData();
    fetchFullData();

    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="my-5 mx-auto">
        {/* Header with Settings Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <button
            onClick={() => setShowSpendingLimitsModal(true)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <LuSettings className="mr-2" />
            Spending Limits Settings
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            icon={<IoMdCard />}
            label="Total Balance"
            value={addThousandsSeparator(dashboardData?.totalBalance || 0)}
            color="bg-primary"
          />

          <InfoCard
            icon={<LuWalletMinimal />}
            label="Total Income"
            value={addThousandsSeparator(dashboardData?.totalIncome || 0)}
            color="bg-orange-500"
          />

          <InfoCard
            icon={<LuHandCoins />}
            label="Total Expenses"
            value={addThousandsSeparator(dashboardData?.totalExpenses || 0)}
            color="bg-red-500"
          />
        </div>

        {/* Spending Alerts */}
        <div className="mt-6">
          <SpendingAlerts ref={spendingAlertsRef} />
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <MonthlyIncomeExpenseChart 
            incomeData={allIncomes}
            expenseData={allExpenses}
          />
          
          <ExpenseCategoryChart 
            expenseData={allExpenses}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <RecentTransactions
            transactions={dashboardData?.recentTransactions}
            onSeeMore={() => navigate("/expense")}
            onEdit={handleEditTransaction}
          />

          <FinanceOverview
            totalBalance={dashboardData?.totalBalance || 0}
            totalIncome={dashboardData?.totalIncome || 0}
            totalExpense={dashboardData?.totalExpenses || 0}
          />

          <ExpenseTransactions
            transactions={dashboardData?.last30DaysExpenses?.transactions || []}
            onSeeMore={() => navigate("/expense")}
            onEdit={handleEditExpenseTransaction}
          />

          <Last30DaysExpenses
            data={dashboardData?.last30DaysExpenses?.transactions || []}
          />
          
          <RecentIncome
            transactions={dashboardData?.last60DaysIncome?.transactions || []}
            onSeeMore={() => navigate("/income")}
            onEdit={handleEditIncomeTransaction}
          />
        </div>
      </div>

      {/* Spending Limits Manager Modal */}
      <SpendingLimitsManager
        isOpen={showSpendingLimitsModal}
        onClose={() => setShowSpendingLimitsModal(false)}
        onRefresh={refreshAllData}
      />

      {/* Edit Expense Modal */}
      <Modal
        isOpen={openEditExpenseModal.show}
        onClose={() => setOpenEditExpenseModal({ show: false, data: null })}
        title="Edit Expense"
      >
        <EditTransactionForm
          transaction={openEditExpenseModal.data}
          type="expense"
          onSave={handleEditExpense}
          onCancel={() => setOpenEditExpenseModal({ show: false, data: null })}
        />
      </Modal>

      {/* Edit Income Modal */}
      <Modal
        isOpen={openEditIncomeModal.show}
        onClose={() => setOpenEditIncomeModal({ show: false, data: null })}
        title="Edit Income"
      >
        <EditTransactionForm
          transaction={openEditIncomeModal.data}
          type="income"
          onSave={handleEditIncome}
          onCancel={() => setOpenEditIncomeModal({ show: false, data: null })}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default Home;
