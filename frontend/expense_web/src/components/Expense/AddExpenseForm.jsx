import React, { useState, useEffect } from "react";
import { toast } from 'react-hot-toast';
import ValidatedInput from "../Inputs/ValidatedInput";
import ValidatedSelect from "../Inputs/ValidatedSelect";
import ErrorSummary from "../Inputs/ErrorSummary";
import useFormValidation, { validationRules } from "../../hooks/useFormValidation";
import { EXPENSE_CATEGORIES, getExpenseIcon } from "../../utils/categories";

const AddExpenseForm = ({onAddExpense}) => {
  // Define validation rules for the form
  const formValidationRules = {
    category: [validationRules.required],
    amount: [
      validationRules.required, 
      validationRules.positiveNumber,
      validationRules.minAmount(0.01),
      validationRules.maxAmount(1000000)
    ],
    date: [validationRules.validDate]
  };

  const {
    values: expense,
    errors,
    isSubmitted,
    handleChange,
    validateAllFields,
    resetForm
  } = useFormValidation({
    category: "",
    amount: "",
    date: "",
    icon: "",
  }, formValidationRules, true); // true = validate only on submit

  // Auto-set icon when category changes
  useEffect(() => {
    if (expense.category) {
      handleChange('icon', getExpenseIcon(expense.category));
    }
  }, [expense.category]);

  const handleFormChange = (field, value) => {
    handleChange(field, value);
  };

  const handleSubmit = () => {
    if (!validateAllFields()) {
      toast.error('Please fix the errors below before submitting');
      return;
    }

    try {
      onAddExpense(expense);
      resetForm();
      toast.success('Expense added successfully!');
    } catch (error) {
      toast.error('Failed to add expense. Please try again.');
    }
  };

  return (
    <div>
      {/* Error Summary */}
      <ErrorSummary errors={errors} isVisible={isSubmitted} />
      
      {/* Category Selection with Icon Preview */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="flex items-center gap-3">
          {/* Icon Preview */}
          <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
            <span className="text-2xl">
              {expense.icon || '📝'}
            </span>
          </div>
          
          {/* Category Dropdown */}
          <ValidatedSelect
            value={expense.category}
            onChange={(e) => handleFormChange("category", e.target.value)}
            error={errors.category}
            isSubmitted={isSubmitted}
            options={EXPENSE_CATEGORIES}
            placeholder="Select Category"
            className="flex-1"
            required
          />
        </div>
      </div>

      <ValidatedInput
        label="Amount ($)"
        type="number"
        value={expense.amount}
        onChange={(e) => handleFormChange("amount", e.target.value)}
        error={errors.amount}
        isSubmitted={isSubmitted}
        placeholder="0.00"
        step="0.01"
        min="0"
        required
      />

      <ValidatedInput
        label="Date"
        type="date"
        value={expense.date}
        onChange={(e) => handleFormChange("date", e.target.value)}
        error={errors.date}
        isSubmitted={isSubmitted}
        required
      />

      {/* Preview */}
      {expense.category && expense.amount && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{expense.icon}</span>
            <div>
              <div className="font-medium text-gray-900">{expense.category}</div>
              <div className="text-sm text-gray-600">
                ${parseFloat(expense.amount || 0).toLocaleString('en-US')}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className={`add-btn add-btn-fill ${
            Object.keys(errors).length > 0 || !expense.category || !expense.amount || !expense.date
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
          onClick={handleSubmit}
          disabled={Object.keys(errors).length > 0 || !expense.category || !expense.amount || !expense.date}
        >
          Add Expense
        </button>
      </div>
    </div>
  );
};

export default AddExpenseForm;
