import { useState, useCallback } from 'react';

const useFormValidation = (initialValues, validationRules, validateOnSubmit = true) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateField = useCallback((fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return '';

    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    return '';
  }, [validationRules, values]);

  const validateAllFields = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setIsSubmitted(true);
    return isValid;
  }, [values, validateField, validationRules]);

  const handleChange = useCallback((fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    
    // Only clear errors if validateOnSubmit is false, otherwise don't validate until submit
    if (!validateOnSubmit && isSubmitted) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    } else if (isSubmitted) {
      // Clear specific error if user is fixing it after submit
      if (errors[fieldName]) {
        const error = validateField(fieldName, value);
        if (!error) {
          setErrors(prev => ({ ...prev, [fieldName]: '' }));
        }
      }
    }
  }, [validateField, validateOnSubmit, isSubmitted, errors]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitted(false);
  }, [initialValues]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsSubmitted(false);
  }, []);

  const hasErrors = Object.values(errors).some(error => error);

  return {
    values,
    errors,
    isSubmitted,
    handleChange,
    validateAllFields,
    resetForm,
    clearErrors,
    hasErrors,
    setValues
  };
};

// Common validation rules
export const validationRules = {
  required: (value) => {
    if (!value || value.toString().trim() === '') {
      return 'This field is required';
    }
    return '';
  },

  positiveNumber: (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      return 'Amount must be a positive number';
    }
    return '';
  },

  validDate: (value) => {
    if (!value) return 'Date is required';
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'Please enter a valid date';
    }
    if (date > new Date()) {
      return 'Date cannot be in the future';
    }
    return '';
  },

  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `Maximum ${max} characters allowed`;
    }
    return '';
  },

  minAmount: (min) => (value) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num < min) {
      return `Amount must be at least $${min}`;
    }
    return '';
  },

  maxAmount: (max) => (value) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num > max) {
      return `Amount cannot exceed $${max.toLocaleString()}`;
    }
    return '';
  }
};

export default useFormValidation; 