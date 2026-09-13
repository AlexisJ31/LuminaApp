import MonthlySpendingCard from './MonthlySpendingCard';
import CashflowChart from './CashflowChart';
import NetWorthCard from './NetWorthCard';
import TransactionsReviewCard from './TransactionsReviewCard';
import BudgetRings from './BudgetRings';

export default function DashboardView() {
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Row 1: KPI Cards (Pacing Engine & Net Worth) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Spending + Pacing Chart (Span 2 cols on Desktop) */}
        <div className="lg:col-span-2">
          <MonthlySpendingCard>
            <CashflowChart />
          </MonthlySpendingCard>
        </div>

        {/* Net Worth Card */}
        <div className="lg:col-span-1">
          <NetWorthCard />
        </div>

      </div>

      {/* Row 2: Transactions to Review Inbox */}
      <div className="w-full">
        <TransactionsReviewCard />
      </div>

      {/* Row 3: Category Budget Rings */}
      <div className="w-full">
        <BudgetRings />
      </div>

    </div>
  );
}
