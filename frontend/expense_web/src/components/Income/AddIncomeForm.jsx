import React, { useState, useEffect } from "react";
import { toast } from 'react-hot-toast';
import ValidatedInput from "../Inputs/ValidatedInput";
import ValidatedSelect from "../Inputs/ValidatedSelect";
import ErrorSummary from "../Inputs/ErrorSummary";
import useFormValidation, { validationRules } from "../../hooks/useFormValidation";
import { INCOME_SOURCES, getIncomeIcon } from "../../utils/categories";

const AddIncomeForm = ({onAddIncome}) => {
  // Define validation rules for the form
  const formValidationRules = {
    source: [validationRules.required],
    amount: [
      validationRules.required, 
      validationRules.positiveNumber,
      validationRules.minAmount(0.01),
      validationRules.maxAmount(1000000)
    ],
    date: [validationRules.validDate]
  };

  const {
    values: income,
    errors,
    isSubmitted,
    handleChange,
    validateAllFields,
    resetForm
  } = useFormValidation({
    source: "",
    amount: "",
    date: "",
    icon: "",
  }, formValidationRules, true); // true = validate only on submit

  // Auto-set icon when source changes
  useEffect(() => {
    if (income.source) {
      handleChange('icon', getIncomeIcon(income.source));
    }
  }, [income.source]);

  const handleFormChange = (field, value) => {
    handleChange(field, value);
  };

  const handleSubmit = () => {
    if (!validateAllFields()) {
      toast.error('Please fix the errors below before submitting');
      return;
    }

    try {
      onAddIncome(income);
      resetForm();
      toast.success('Income added successfully!');
    } catch (error) {
      toast.error('Failed to add income. Please try again.');
    }
  };

  return (
    <div>
      {/* Error Summary */}
      <ErrorSummary errors={errors} isVisible={isSubmitted} />
      
      {/* Income Source Selection with Icon Preview */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Income Source
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="flex items-center gap-3">
          {/* Icon Preview */}
          <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
            <span className="text-2xl">
              {income.icon || '💵'}
            </span>
          </div>
          
          {/* Source Dropdown */}
          <ValidatedSelect
            value={income.source}
            onChange={(e) => handleFormChange("source", e.target.value)}
            error={errors.source}
            isSubmitted={isSubmitted}
            options={INCOME_SOURCES}
            placeholder="Select Income Source"
            className="flex-1"
            required
          />
        </div>
      </div>

      <ValidatedInput
        label="Amount ($)"
        type="number"
        value={income.amount}
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
        value={income.date}
        onChange={(e) => handleFormChange("date", e.target.value)}
        error={errors.date}
        isSubmitted={isSubmitted}
        required
      />

      {/* Preview */}
      {income.source && income.amount && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{income.icon}</span>
            <div>
              <div className="font-medium text-gray-900">{income.source}</div>
              <div className="text-sm text-gray-600">
                ${parseFloat(income.amount || 0).toLocaleString('en-US')}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className={`add-btn add-btn-fill ${
            Object.keys(errors).length > 0 || !income.source || !income.amount || !income.date
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
          onClick={handleSubmit}
          disabled={Object.keys(errors).length > 0 || !income.source || !income.amount || !income.date}
        >
          Add Income
        </button>
      </div>
    </div>
  );
};

export default AddIncomeForm;
