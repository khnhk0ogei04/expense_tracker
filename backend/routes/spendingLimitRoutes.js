const express = require('express');
const {
  getSpendingLimits, 
  updateSpendingLimits, 
  checkSpendingAlerts,
  addCategoryLimit,
  updateCategoryLimit,
  deleteCategoryLimit,
  updateMonthlyLimit
} = require('../controllers/spendingLimitController');
const {protect} = require('../middleware/authMiddleware');
const router = express.Router();

router.get("/", protect, getSpendingLimits);
router.put("/", protect, updateSpendingLimits);
router.get("/alerts", protect, checkSpendingAlerts);

// Monthly limit routes
router.put("/monthly", protect, updateMonthlyLimit);

// Category limit routes
router.post("/category", protect, addCategoryLimit);
router.put("/category/:categoryId", protect, updateCategoryLimit);
router.delete("/category/:categoryId", protect, deleteCategoryLimit);

module.exports = router;