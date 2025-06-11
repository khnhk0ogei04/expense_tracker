import React from 'react';
import CustomPieChart from '../Charts/CustomPieChart';
const COLORS = ['#875CF5', '#FA2C37']
const FinanceOverview = ({totalBalance, totalIncome, totalExpense}) => {
    const balanceData = [
        {name: "Total Balance", amount: totalBalance},
        {name: "Total Expenses", amount: totalExpense},
    ];
    return (
        <>
            <div className='card'>
                <div className='flex items-center justify-between mb-4'>
                    <h5 className='text-lg'>Financial Overview</h5>
                </div>
                <CustomPieChart
                    data = {balanceData}
                    label = {"Total Income"}
                    totalAmount={`$${totalIncome}`}
                    colors={COLORS}
                    showTextAnchor
                />
            </div>
        </>
    );
}

export default FinanceOverview;