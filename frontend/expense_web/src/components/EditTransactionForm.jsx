import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import moment from 'moment';
import ValidatedInput from './Inputs/ValidatedInput';
import ValidatedSelect from './Inputs/ValidatedSelect';
import ErrorSummary from './Inputs/ErrorSummary';
import useFormValidation, { validationRules } from '../hooks/useFormValidation';
import { EXPENSE_CATEGORIES, INCOME_SOURCES, getExpenseIcon, getIncomeIcon } from '../utils/categories';

const EditTransactionForm = ({ 
  transaction, 
  type = 'expense', 
  onSave, 
  onCancel 
}) => {
  const [loading, setLoading] = useState(false);
  const getValidationRules = () => {
    const fieldName = type === 'expense' ? 'category' : 'source';
    return {
      [fieldName]: [validationRules.required],
      amount: [
        validationRules.required, 
        validationRules.positiveNumber,
        validationRules.minAmount(0.01),
        validationRules.maxAmount(1000000)
      ],
      date: [validationRules.validDate]
    };
  };

  const {
    values: formData,
    errors,
    isSubmitted,
    handleChange,
    validateAllFields,
    setValues
  } = useFormValidation({
    category: '',
    source: '',
    amount: '',
    date: '',
    icon: ''
  }, getValidationRules(), true);
  useEffect(() => {
    if (transaction) {
      setValues({
        category: transaction.category || '',
        source: transaction.source || '',
        amount: transaction.amount?.toString() || '',
        date: moment(transaction.date).format('YYYY-MM-DD') || '',
        icon: transaction.icon || ''
      });
    }
  }, [transaction, setValues]);
  useEffect(() => {
    if (formData.category && type === 'expense') {
      handleChange('icon', getExpenseIcon(formData.category));
    } else if (formData.source && type === 'income') {
      handleChange('icon', getIncomeIcon(formData.source));
    }
  }, [formData.category, formData.source, type]);

  const handleInputChange = (field, value) => {
    handleChange(field, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    if (!validateAllFields()) {
      toast.error('Please fix the errors below before submitting');
      return;
    }

    try {
      setLoading(true);
      
      const categoryOrSource = type === 'expense' ? formData.category : formData.source;
      const updateData = {
        [type === 'expense' ? 'category' : 'source']: categoryOrSource,
        amount: parseFloat(formData.amount),
        date: formData.date,
        icon: formData.icon
      };

      await onSave(transaction._id, updateData);
      toast.success(`${type === 'expense' ? 'Expense' : 'Income'} updated successfully!`);
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('An error occurred while updating');
    } finally {
      setLoading(false);
    }
  };

  const options = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_SOURCES;
  const fieldValue = type === 'expense' ? formData.category : formData.source;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorSummary errors={errors} isVisible={isSubmitted} /> 
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {type === 'expense' ? 'Expense Category' : 'Income Source'}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="flex items-center gap-3">
          {/* icon preview */}
          <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
            <span className="text-2xl">
              {formData.icon || (type === 'expense' ? '📝' : '💵')}
            </span>
          </div>
          
          <ValidatedSelect
            value={fieldValue}
            onChange={(e) => handleInputChange(
              type === 'expense' ? 'category' : 'source', 
              e.target.value
            )}
            error={errors[type === 'expense' ? 'category' : 'source']}
            isSubmitted={isSubmitted}
            options={options}
            placeholder={`Select ${type === 'expense' ? 'Category' : 'Source'}`}
            className="flex-1"
            required
          />
        </div>
      </div>

      <ValidatedInput
        label="Amount ($)"
        type="number"
        value={formData.amount}
        onChange={(e) => handleInputChange('amount', e.target.value)}
        error={errors.amount}
        isSubmitted={isSubmitted}
        placeholder="0.00"
        min="0"
        step="0.01"
        required
      />

      {/* Date Input */}
      <ValidatedInput
        label="Date"
        type="date"
        value={formData.date}
        onChange={(e) => handleInputChange('date', e.target.value)}
        error={errors.date}
        isSubmitted={isSubmitted}
        required
      />

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {formData.icon || (type === 'expense' ? '📝' : '💵')}
          </span>
          <div>
            <div className="font-medium text-gray-900">
              {fieldValue || 'Not selected'}
            </div>
            <div className="text-sm text-gray-600">
              {formData.amount ? `$${parseFloat(formData.amount).toLocaleString('en-US')}` : '$0'} - {formData.date ? moment(formData.date).format('MM/DD/YYYY') : 'No date selected'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || Object.keys(errors).length > 0}
          className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
            Object.keys(errors).length > 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default EditTransactionForm; 