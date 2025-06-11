// Predefined expense categories with icons
export const EXPENSE_CATEGORIES = [
  {
    name: 'Food & Dining',
    icon: '🍽️'
  },
  {
    name: 'Transportation',
    icon: '🚗'
  },
  {
    name: 'Shopping',
    icon: '🛍️'
  },
  {
    name: 'Entertainment',
    icon: '🎬'
  },
  {
    name: 'Healthcare',
    icon: '🏥'
  },
  {
    name: 'Education',
    icon: '📚'
  },
  {
    name: 'Housing',
    icon: '🏠'
  },
  {
    name: 'Savings',
    icon: '💰'
  },
  {
    name: 'Investment',
    icon: '📈'
  },
  {
    name: 'Others',
    icon: '📝'
  }
];

// Predefined income sources with icons
export const INCOME_SOURCES = [
  {
    name: 'Salary',
    icon: '💼'
  },
  {
    name: 'Freelance',
    icon: '💻'
  },
  {
    name: 'Investment',
    icon: '📈'
  },
  {
    name: 'Bonus',
    icon: '🎁'
  },
  {
    name: 'Sales',
    icon: '💳'
  },
  {
    name: 'Rental',
    icon: '🏘️'
  },
  {
    name: 'Business',
    icon: '🏢'
  },
  {
    name: 'Others',
    icon: '💵'
  }
];

// Helper function to get icon by category name
export const getExpenseIcon = (categoryName) => {
  const category = EXPENSE_CATEGORIES.find(cat => cat.name === categoryName);
  return category ? category.icon : '📝';
};

// Helper function to get icon by income source name
export const getIncomeIcon = (sourceName) => {
  const source = INCOME_SOURCES.find(src => src.name === sourceName);
  return source ? source.icon : '💵';
};

// Helper function to get all category names
export const getExpenseCategoryNames = () => {
  return EXPENSE_CATEGORIES.map(cat => cat.name);
};

// Helper function to get all income source names
export const getIncomeSourceNames = () => {
  return INCOME_SOURCES.map(src => src.name);
}; 