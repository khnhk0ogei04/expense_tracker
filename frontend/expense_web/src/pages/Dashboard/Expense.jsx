import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";

import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import ExpenseList from "../../components/Expense/ExpenseList";
import ExpenseOverview from "../../components/Expense/ExpenseOverview";
import AddExpenseForm from "../../components/Expense/AddExpenseForm";
import DeleteAlert from "../../components/DeleteAlert";
import Modal from "../../components/Modal";
import TransactionFilter from "../../components/TransactionFilter";
import EditTransactionForm from "../../components/EditTransactionForm";
import toast from "react-hot-toast";

const Expense = () => {
  useUserAuth();

  const navigate = useNavigate();

  const [expenseData, setExpenseData] = useState([]);
  const [filteredExpenseData, setFilteredExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState({
    show: false,
    data: null,
  });
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });

  // Get All Expense Details
  const fetchExpenseDetails = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `${API_PATHS.EXPENSE.GET_ALL_EXPENSE}`
      );

      if (response.data) {
        setExpenseData(response.data);
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Expense
  const handleAddExpense = async (expense) => {
    const { category, amount, date, icon } = expense;

    // Validation Checks
    if (!category.trim()) {
      toast.error("Category is required.");
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Amount should be a valid number greater than 0.");
      return;
    }

    if (!date) {
      toast.error("Date is required.");
      return;
    }

    try {
      const response = await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
        category,
        amount,
        date,
        icon,
      });

      setOpenAddExpenseModal(false);
      toast.success("Expense added successfully");
      
      // Check for spending alerts
      if (response.data?.alerts && response.data.alerts.length > 0) {
        response.data.alerts.forEach(alert => {
          if (alert.severity === 'error') {
            toast.error(alert.message, { duration: 6000 });
          } else if (alert.severity === 'warning') {
            toast(alert.message, { 
              duration: 5000,
              icon: '⚠️',
              style: {
                background: '#fef3c7',
                color: '#92400e',
                border: '1px solid #f59e0b'
              }
            });
          }
        });
      }
      
      fetchExpenseDetails();
    } catch (error) {
      console.error(
        "Error adding expense:",
        error.response?.data?.message || error.message
      );
    }
  };

  // Delete Expense
  const deleteExpense = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));

      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Expense details deleted successfully");
      fetchExpenseDetails();
    } catch (error) {
      console.error(
        "Error deleting expense:",
        error.response?.data?.message || error.message
      );
    }
  };

  // Handle Edit Expense
  const handleEditExpense = async (expenseId, updateData) => {
    try {
      await axiosInstance.put(API_PATHS.EXPENSE.UPDATE_EXPENSE(expenseId), updateData);
      
      setOpenEditModal({ show: false, data: null });
      toast.success("Expense updated successfully");
      fetchExpenseDetails();
    } catch (error) {
      console.error(
        "Error updating expense:",
        error.response?.data?.message || error.message
      );
      toast.error("Failed to update expense. Please try again.");
    }
  };

  // handle download expense details
  const handleDownloadExpenseDetails = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.EXPENSE.DOWNLOAD_EXPENSE,
        {
          responseType: "blob", 
        }
      );

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "expense_details.xlsx"); 
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url); 
    } catch (error) {
      console.error("Error downloading expense details:", error);
      toast.error("Failed to download expense details. Please try again.");
    }
  };

  useEffect(() => {
    fetchExpenseDetails();

    return () => {};
  }, []);

  // Initialize filtered data when expense data changes
  useEffect(() => {
    setFilteredExpenseData(expenseData);
  }, [expenseData]);

  return (
    <DashboardLayout activeMenu="Expense">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="">
            <ExpenseOverview
              transactions={expenseData}
              onExpenseIncome={() => setOpenAddExpenseModal(true)}
            />
          </div>

          {/* Transaction Filter */}
          <TransactionFilter
            transactions={expenseData}
            onFilteredResults={setFilteredExpenseData}
            type="expense"
          />

          <ExpenseList
            transactions={filteredExpenseData}
            onEdit={(expense) => setOpenEditModal({ show: true, data: expense })}
            onDelete={(id) => {
              setOpenDeleteAlert({ show: true, data: id });
            }}
            onDownload={handleDownloadExpenseDetails}
          />

          {/* Add Expense Modal */}
          <Modal
            isOpen={openAddExpenseModal}
            onClose={() => setOpenAddExpenseModal(false)}
            title="Add Expense"
          >
            <AddExpenseForm onAddExpense={handleAddExpense} />
          </Modal>

          {/* Edit Expense Modal */}
          <Modal
            isOpen={openEditModal.show}
            onClose={() => setOpenEditModal({ show: false, data: null })}
            title="Edit Expense"
          >
            <EditTransactionForm
              transaction={openEditModal.data}
              type="expense"
              onSave={handleEditExpense}
              onCancel={() => setOpenEditModal({ show: false, data: null })}
            />
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            isOpen={openDeleteAlert.show}
            onClose={() => setOpenDeleteAlert({ show: false, data: null })}
            title="Delete Expense"
          >
            <DeleteAlert
              content="Are you sure you want to delete this expense detail?"
              onDelete={() => deleteExpense(openDeleteAlert.data)}
            />
          </Modal>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Expense;
