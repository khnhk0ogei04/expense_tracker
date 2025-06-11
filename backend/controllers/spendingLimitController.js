const SpendingLimit = require("../models/SpendingLimit");
const Expense = require("../models/Expense");
const Income = require("../models/Income");
const { Types } = require("mongoose");

// Get user's spending limits
exports.getSpendingLimits = async (req, res) => {
  try {
    const userId = req.user.id;
    let spendingLimit = await SpendingLimit.findOne({ userId });
    
    if (!spendingLimit) {
      spendingLimit = new SpendingLimit({
        userId,
        monthlyLimit: 0,
        categoryLimits: [],
        alertSettings: {
          monthlyLimitEnabled: true,
          categoryLimitEnabled: true,
          incomeVsExpenseEnabled: true,
          monthlyWarningThreshold: 80
        }
      });
      await spendingLimit.save();
    }
    
    res.json(spendingLimit);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.updateSpendingLimits = async (req, res) => {
  try {
    const userId = req.user.id;
    const { monthlyLimit, categoryLimits, alertSettings } = req.body;
    
    let spendingLimit = await SpendingLimit.findOne({ userId });
    
    if (!spendingLimit) {
      spendingLimit = new SpendingLimit({ userId });
    }
    
    if (monthlyLimit !== undefined) spendingLimit.monthlyLimit = monthlyLimit;
    if (categoryLimits !== undefined) spendingLimit.categoryLimits = categoryLimits;
    if (alertSettings !== undefined) spendingLimit.alertSettings = { ...spendingLimit.alertSettings, ...alertSettings };
    
    await spendingLimit.save();
    res.json(spendingLimit);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.checkSpendingAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new Types.ObjectId(String(userId));
    
    const spendingLimit = await SpendingLimit.findOne({ userId });
    if (!spendingLimit) {
      return res.json({ alerts: [] });
    }
    
    const alerts = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    
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
      const warningThreshold = (spendingLimit.monthlyLimit * spendingLimit.alertSettings.monthlyWarningThreshold) / 100;
      
      if (totalMonthlySpent >= spendingLimit.monthlyLimit) {
        alerts.push({
          type: "monthly_limit_exceeded",
          severity: "error",
          message: `You have exceeded your monthly spending limit! Spent: $${totalMonthlySpent.toLocaleString('en-US')} / Limit: $${spendingLimit.monthlyLimit.toLocaleString('en-US')}`,
          data: { spent: totalMonthlySpent, limit: spendingLimit.monthlyLimit }
        });
      } else if (totalMonthlySpent >= warningThreshold) {
        alerts.push({
          type: "monthly_limit_warning",
          severity: "warning",
          message: `Warning: You have spent ${Math.round((totalMonthlySpent / spendingLimit.monthlyLimit) * 100)}% of this month's limit!`,
          data: { spent: totalMonthlySpent, limit: spendingLimit.monthlyLimit, percentage: Math.round((totalMonthlySpent / spendingLimit.monthlyLimit) * 100) }
        });
      }
    }
    
    // Check category spending limits
    if (spendingLimit.alertSettings.categoryLimitEnabled && spendingLimit.categoryLimits.length > 0) {
      for (const categoryLimit of spendingLimit.categoryLimits) {
        const categoryExpenses = await Expense.aggregate([
          { 
            $match: { 
              userId: userObjectId,
              category: categoryLimit.category,
              date: { $gte: monthStart, $lte: monthEnd }
            } 
          },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        
        const totalCategorySpent = categoryExpenses[0]?.total || 0;
        const categoryWarningThreshold = categoryLimit.warningThreshold || 80; // Default to 80% if not set
        const warningThreshold = (categoryLimit.limit * categoryWarningThreshold) / 100;
        
        if (totalCategorySpent >= categoryLimit.limit) {
          alerts.push({
            type: "category_limit_exceeded",
            severity: "error",
            message: `Category "${categoryLimit.category}" has exceeded the limit! Spent: $${totalCategorySpent.toLocaleString('en-US')} / Limit: $${categoryLimit.limit.toLocaleString('en-US')}`,
            data: { category: categoryLimit.category, spent: totalCategorySpent, limit: categoryLimit.limit }
          });
        } else if (totalCategorySpent >= warningThreshold) {
          alerts.push({
            type: "category_limit_warning",
            severity: "warning",
            message: `Warning: Category "${categoryLimit.category}" has spent ${Math.round((totalCategorySpent / categoryLimit.limit) * 100)}% of the limit!`,
            data: { category: categoryLimit.category, spent: totalCategorySpent, limit: categoryLimit.limit, percentage: Math.round((totalCategorySpent / categoryLimit.limit) * 100) }
          });
        }
      }
    }
    
    // Check if expenses exceed income
    if (spendingLimit.alertSettings.incomeVsExpenseEnabled) {
      const monthlyIncome = await Income.aggregate([
        { 
          $match: { 
            userId: userObjectId,
            date: { $gte: monthStart, $lte: monthEnd }
          } 
        },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      
      const monthlyExpenses = await Expense.aggregate([
        { 
          $match: { 
            userId: userObjectId,
            date: { $gte: monthStart, $lte: monthEnd }
          } 
        },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      
      const totalIncome = monthlyIncome[0]?.total || 0;
      const totalExpenses = monthlyExpenses[0]?.total || 0;
      
      if (totalExpenses > totalIncome && totalIncome > 0) {
        alerts.push({
          type: "expense_exceed_income",
          severity: "error",
          message: `Warning: Expenses have exceeded income this month! Income: $${totalIncome.toLocaleString('en-US')}, Expenses: $${totalExpenses.toLocaleString('en-US')}`,
          data: { income: totalIncome, expenses: totalExpenses, deficit: totalExpenses - totalIncome }
        });
      } else if (totalExpenses > (totalIncome * 0.8) && totalIncome > 0) {
        alerts.push({
          type: "expense_high_vs_income",
          severity: "warning",
          message: `Note: Expenses have reached ${Math.round((totalExpenses / totalIncome) * 100)}% of income this month!`,
          data: { income: totalIncome, expenses: totalExpenses, percentage: Math.round((totalExpenses / totalIncome) * 100) }
        });
      }
    }
    
    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Add category limit with custom warning threshold
exports.addCategoryLimit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, limit, warningThreshold = 80 } = req.body;
    
    if (!category || !limit) {
      return res.status(400).json({ message: "Category and limit are required" });
    }

    // Validate warning threshold
    if (warningThreshold < 0 || warningThreshold > 100) {
      return res.status(400).json({ message: "Warning threshold must be between 0 and 100" });
    }
    
    let spendingLimit = await SpendingLimit.findOne({ userId });
    
    if (!spendingLimit) {
      spendingLimit = new SpendingLimit({
        userId,
        monthlyLimit: 0,
        categoryLimits: [],
        alertSettings: {
          monthlyLimitEnabled: true,
          categoryLimitEnabled: true,
          incomeVsExpenseEnabled: true,
          monthlyWarningThreshold: 80
        }
      });
    }
    
    // Check if category already exists
    const existingCategory = spendingLimit.categoryLimits.find(
      cl => cl.category.toLowerCase() === category.toLowerCase()
    );
    
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }
    
    // Add new category limit with warning threshold
    spendingLimit.categoryLimits.push({
      category,
      limit: parseFloat(limit),
      warningThreshold: parseFloat(warningThreshold)
    });
    
    await spendingLimit.save();
    res.json(spendingLimit);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update category limit with warning threshold
exports.updateCategoryLimit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { categoryId } = req.params;
    const { category, limit, warningThreshold } = req.body;
    
    if (!category || !limit) {
      return res.status(400).json({ message: "Category and limit are required" });
    }

    // Validate warning threshold if provided
    if (warningThreshold !== undefined && (warningThreshold < 0 || warningThreshold > 100)) {
      return res.status(400).json({ message: "Warning threshold must be between 0 and 100" });
    }
    
    const spendingLimit = await SpendingLimit.findOne({ userId });
    
    if (!spendingLimit) {
      return res.status(404).json({ message: "Spending limits not found" });
    }
    
    // Find and update category limit
    const categoryIndex = spendingLimit.categoryLimits.findIndex(
      cl => cl._id.toString() === categoryId
    );
    
    if (categoryIndex === -1) {
      return res.status(404).json({ message: "Category limit not found" });
    }
    
    spendingLimit.categoryLimits[categoryIndex].category = category;
    spendingLimit.categoryLimits[categoryIndex].limit = parseFloat(limit);
    if (warningThreshold !== undefined) {
      spendingLimit.categoryLimits[categoryIndex].warningThreshold = parseFloat(warningThreshold);
    }
    
    await spendingLimit.save();
    res.json(spendingLimit);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete category limit
exports.deleteCategoryLimit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { categoryId } = req.params;
    
    const spendingLimit = await SpendingLimit.findOne({ userId });
    
    if (!spendingLimit) {
      return res.status(404).json({ message: "Spending limits not found" });
    }
    
    // Remove category limit by id
    spendingLimit.categoryLimits = spendingLimit.categoryLimits.filter(
      cl => cl._id.toString() !== categoryId
    );
    
    await spendingLimit.save();
    res.json(spendingLimit);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update monthly limit and its warning threshold
exports.updateMonthlyLimit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit, warningThreshold } = req.body;
    
    let spendingLimit = await SpendingLimit.findOne({ userId });
    
    if (!spendingLimit) {
      spendingLimit = new SpendingLimit({
        userId,
        monthlyLimit: 0,
        categoryLimits: [],
        alertSettings: {
          monthlyLimitEnabled: true,
          categoryLimitEnabled: true,
          incomeVsExpenseEnabled: true,
          monthlyWarningThreshold: 80
        }
      });
    }

    // Validate warning threshold if provided
    if (warningThreshold !== undefined && (warningThreshold < 0 || warningThreshold > 100)) {
      return res.status(400).json({ message: "Warning threshold must be between 0 and 100" });
    }
    
    spendingLimit.monthlyLimit = parseFloat(limit) || 0;
    if (warningThreshold !== undefined) {
      spendingLimit.alertSettings.monthlyWarningThreshold = parseFloat(warningThreshold);
    }
    
    await spendingLimit.save();
    res.json(spendingLimit);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}; 