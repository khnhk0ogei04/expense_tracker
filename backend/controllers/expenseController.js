const xlsx = require('xlsx');
const Expense = require("../models/Expense");
const SpendingLimit = require("../models/SpendingLimit");
const Income = require("../models/Income");
const { Types } = require("mongoose");

// Add Expense
exports.addExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    const { icon, category, amount, date } = req.body;

    // Validation: Check for missing fields
    if (!category || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newExpense = new Expense({
      userId,
      icon,
      category,
      amount,
      date: new Date(date),
    });

    await newExpense.save();

    // Check for spending alerts after adding expense
    const alerts = await checkSpendingAlertsAfterExpense(userId, category, amount, new Date(date));
    
    res.status(200).json({ 
      expense: newExpense,
      alerts: alerts
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Helper function to check spending alerts after adding expense
const checkSpendingAlertsAfterExpense = async (userId, category, amount, expenseDate) => {
  try {
    const userObjectId = new Types.ObjectId(String(userId));
    const spendingLimit = await SpendingLimit.findOne({ userId });
    
    if (!spendingLimit) {
      return [];
    }
    
    const alerts = [];
    const expenseMonth = expenseDate.getMonth();
    const expenseYear = expenseDate.getFullYear();
    
    // Get start and end of expense month
    const monthStart = new Date(expenseYear, expenseMonth, 1);
    const monthEnd = new Date(expenseYear, expenseMonth + 1, 0, 23, 59, 59);
    
    // Check monthly spending limit
    if (spendingLimit.alertSettings.monthlyLimitEnabled && spendingLimit.monthlyLimit > 0) {
      const monthlyExpenses = await Expense.aggregate([
        { 
          $match: { 
            userId: userObjectId,
            date: { $gte: monthStart, $lte: monthEnd }
          } 
        },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      
      const totalMonthlySpent = monthlyExpenses[0]?.total || 0;
      
      if (totalMonthlySpent >= spendingLimit.monthlyLimit) {
        alerts.push({
          type: "monthly_limit_exceeded",
          severity: "error",
          message: `You have exceeded your monthly spending limit! Spent: $${totalMonthlySpent.toLocaleString('en-US')} / Limit: $${spendingLimit.monthlyLimit.toLocaleString('en-US')}`
        });
      }
    }
    
    // Check category spending limit
    if (spendingLimit.alertSettings.categoryLimitEnabled) {
      const categoryLimit = spendingLimit.categoryLimits.find(cl => cl.category === category);
      if (categoryLimit) {
        const categoryExpenses = await Expense.aggregate([
          { 
            $match: { 
              userId: userObjectId,
              category: category,
              date: { $gte: monthStart, $lte: monthEnd }
            } 
          },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        
        const totalCategorySpent = categoryExpenses[0]?.total || 0;
        
        if (totalCategorySpent >= categoryLimit.limit) {
          alerts.push({
            type: "category_limit_exceeded",
            severity: "error",
            message: `Category "${category}" has exceeded the limit! Spent: $${totalCategorySpent.toLocaleString('en-US')} / Limit: $${categoryLimit.limit.toLocaleString('en-US')}`
          });
        }
      }
    }
    
    return alerts;
  } catch (error) {
    console.error('Error checking spending alerts:', error);
    return [];
  }
};

// Get All Expenses (For Logged-in User)
exports.getAllExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    const expenses = await Expense.find({ userId }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Update Expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, amount, date, icon } = req.body;
    const userId = req.user.id;

    // Validation: Check for missing fields
    if (!category || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find and update expense
    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: id, userId }, // Ensure user can only update their own expenses
      {
        category,
        amount,
        date: new Date(date),
        icon
      },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Download Expense Details in Excel
exports.downloadExpenseExcel = async (req, res) => {
  const userId = req.user.id;
  try {
    const expense = await Expense.find({ userId }).sort({ date: -1 });

    // Prepare data for Excel
    const data = expense.map((item) => ({
      Category: item.category,
      Amount: item.amount,
      Date: item.date,
    }));
    
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Expense");
    xlsx.writeFile(wb, 'expense_details.xlsx');
    res.download('expense_details.xlsx');
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
