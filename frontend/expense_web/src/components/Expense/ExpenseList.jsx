import React from "react";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import moment from "moment";
import { LuDownload } from "react-icons/lu";

const ExpenseList = ({ transactions, onDelete, onEdit, onDownload }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">All Expenses</h5>

        <button className="card-btn" onClick={onDownload}>
          <LuDownload className="text-base" /> Download
        </button>
      </div>

      {transactions && transactions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2">
          {transactions.map((expense) => (
            <TransactionInfoCard
              key={expense._id}
              title={expense.category}
              icon={expense.icon}
              date={moment(expense.date).format("Do MMM YYYY")}
              amount={expense.amount}
              type="expense"
              onEdit={() => onEdit && onEdit(expense)}
              onDelete={() => onDelete(expense._id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Results Found</h3>
          <p className="text-sm text-gray-500 text-center">
            No expenses match your search criteria.<br />
            Try changing your keywords or filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
