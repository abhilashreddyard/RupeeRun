import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Download,
} from 'lucide-react';
import {
  FinancialMetrics,
  Transaction,
  TransactionCategory,
  TransactionType,
} from '../types/finance';
import { exportLedgerToCSV } from '../services/storageService';
import {
  sanitizeTextInput,
  sanitizeCurrencyAmount,
  sanitizeCycleDay,
} from '../utils/security';
import { useDebounce } from '../hooks/useDebounce';

interface SmartLedgerViewProps {
  currentDay: number;
  metrics: FinancialMetrics;
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

const CATEGORIES: TransactionCategory[] = [
  'Food & Dining',
  'Transport & Metro',
  'Social & Hangouts',
  'Shopping & Essentials',
  'Commitments & Bills',
  'Subscriptions',
  'Unexpected Shock',
  'Extra Income',
];

export const SmartLedgerView: React.FC<SmartLedgerViewProps> = React.memo(({
  currentDay,
  metrics,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 150);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'ESSENTIAL' | 'DISCRETIONARY' | 'INCOME'>('ALL');

  // New Entry Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Food & Dining');
  const [type, setType] = useState<TransactionType>('expense');
  const [isEssential, setIsEssential] = useState(false);
  const [day, setDay] = useState(String(currentDay));

  const numAmount = Number(amount) || 0;
  const previewDailyDelta =
    type === 'income'
      ? Math.round(numAmount / Math.max(1, metrics.remainingDays))
      : -Math.round(numAmount / Math.max(1, metrics.remainingDays));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = sanitizeTextInput(title, 90);
    const cleanAmount = sanitizeCurrencyAmount(numAmount, 0, 50000);
    if (!cleanTitle || cleanAmount <= 0) return;

    onAddTransaction({
      title: cleanTitle,
      amount: cleanAmount,
      category: type === 'income' ? 'Extra Income' : category,
      type,
      isEssential: type === 'income' ? true : isEssential,
      day: sanitizeCycleDay(day || currentDay),
    });
    setTitle('');
    setAmount('');
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        const matchesSearch =
          tx.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          tx.category.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchesCat = categoryFilter === 'ALL' || tx.category === categoryFilter;
        const matchesType =
          typeFilter === 'ALL' ||
          (typeFilter === 'INCOME' && tx.type === 'income') ||
          (typeFilter === 'ESSENTIAL' && tx.type === 'expense' && tx.isEssential) ||
          (typeFilter === 'DISCRETIONARY' && tx.type === 'expense' && !tx.isEssential);
        return matchesSearch && matchesCat && matchesType;
      })
      .sort((a, b) => b.day - a.day);
  }, [transactions, debouncedSearch, categoryFilter, typeFilter]);

  const handleExportCSV = () => {
    exportLedgerToCSV(filteredTransactions, currentDay);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-[#131C2E] border border-slate-800 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="text-xs font-mono text-sky-400">
            SMART TRANSACTION LEDGER & INSTANT IMPACT LOGGER
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            30-Day Cash Flow Audit & Expense Breakdown
          </h1>
          <p className="text-sm text-slate-300">
            Every logged expense or income entry shows its immediate per-day allowance impact before you add it. Filter between essential needs and discretionary wants.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            aria-label="Download filtered transactions as CSV"
            className="px-4 py-2 text-xs font-medium text-slate-200 bg-[#090D16] border border-slate-700 hover:border-slate-500 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Log Transaction with Live Consequence Preview (4 cols) */}
        <div className="lg:col-span-4 bg-[#131C2E] border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-white border-b border-slate-800 pb-3">
            Log Expense or Extra Income
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Log new transaction form">
            {/* Expense vs Income Switch */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#090D16] rounded-lg border border-slate-800" role="group" aria-label="Transaction Type">
              <button
                type="button"
                onClick={() => setType('expense')}
                aria-pressed={type === 'expense'}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  type === 'expense'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Expense (-₹)
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                aria-pressed={type === 'income'}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  type === 'income'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Extra Income (+₹)
              </button>
            </div>

            <div>
              <label htmlFor="ledger-tx-title" className="block text-xs font-medium text-slate-300 mb-1">
                Description
              </label>
              <input
                id="ledger-tx-title"
                type="text"
                required
                maxLength={90}
                placeholder={
                  type === 'expense'
                    ? 'e.g., Campus Canteen Thali & Chai'
                    : 'e.g., Hackathon Prize / Tutoring'
                }
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ledger-tx-amount" className="block text-xs font-medium text-slate-300 mb-1">
                  Amount (₹)
                </label>
                <input
                  id="ledger-tx-amount"
                  type="number"
                  required
                  min={1}
                  max={50000}
                  placeholder="250"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-sky-400"
                />
              </div>
              <div>
                <label htmlFor="ledger-tx-day" className="block text-xs font-medium text-slate-300 mb-1">
                  Day of Cycle (1–30)
                </label>
                <input
                  id="ledger-tx-day"
                  type="number"
                  min={1}
                  max={30}
                  value={day}
                  onChange={e => setDay(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            {type === 'expense' && (
              <>
                <div>
                  <label htmlFor="ledger-tx-category" className="block text-xs font-medium text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    id="ledger-tx-category"
                    value={category}
                    onChange={e => setCategory(e.target.value as TransactionCategory)}
                    className="w-full px-3.5 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-400"
                  >
                    {CATEGORIES.filter(c => c !== 'Extra Income').map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#090D16] border border-slate-800 rounded-lg">
                  <span className="text-xs text-slate-300">Spend Classification</span>
                  <button
                    type="button"
                    onClick={() => setIsEssential(!isEssential)}
                    className="text-xs font-mono text-sky-400 hover:underline cursor-pointer"
                  >
                    {isEssential ? 'Essential Need (Switch)' : 'Discretionary Want (Switch)'}
                  </button>
                </div>
              </>
            )}

            {/* Instant Consequence Preview Box */}
            {numAmount > 0 && (
              <div className="p-3.5 bg-[#090D16] border border-sky-500/30 rounded-lg space-y-1 text-xs font-mono tabular-nums">
                <div className="text-slate-400 font-sans">
                  Instant Consequence Preview:
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">New Safe Daily Limit:</span>
                  <span
                    className={
                      previewDailyDelta >= 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'
                    }
                  >
                    ₹{Math.max(0, metrics.safeDailyAllowance + previewDailyDelta)}/day (
                    {previewDailyDelta >= 0 ? `+₹${previewDailyDelta}` : `-₹${Math.abs(previewDailyDelta)}`}
                    /day)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Free Spendable Pool:</span>
                  <span className="text-white">
                    ₹
                    {(
                      metrics.freeSpendablePool + (type === 'income' ? numAmount : -numAmount)
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Transaction in Ledger</span>
            </button>
          </form>
        </div>

        {/* Right Table: Filterable High-Density Ledger (8 cols) */}
        <div className="lg:col-span-8 bg-[#131C2E] border border-slate-800 rounded-xl p-6 space-y-4">
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <label htmlFor="ledger-search-input" className="sr-only">
                Search transactions by title or category
              </label>
              <input
                id="ledger-search-input"
                type="text"
                placeholder="Search transactions by title or category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-[#090D16] border border-slate-800 rounded-lg" role="group" aria-label="Filter by priority">
                {(['ALL', 'ESSENTIAL', 'DISCRETIONARY', 'INCOME'] as const).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setTypeFilter(f)}
                    aria-pressed={typeFilter === f}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      typeFilter === f
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f === 'ALL'
                      ? 'All'
                      : f === 'ESSENTIAL'
                      ? 'Essential'
                      : f === 'DISCRETIONARY'
                      ? 'Wants'
                      : 'Income'}
                  </button>
                ))}
              </div>

              <label htmlFor="ledger-category-filter" className="sr-only">
                Filter by category
              </label>
              <select
                id="ledger-category-filter"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-400"
              >
                <option value="ALL">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary Row */}
          <div className="grid grid-cols-3 gap-4 p-3 bg-[#090D16] border border-slate-800 rounded-lg text-xs font-mono tabular-nums">
            <div>
              <span className="text-slate-400 font-sans block">Total Spent to Date</span>
              <span className="text-sm font-bold text-white">
                ₹{metrics.spentToDate.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-sans block">Essential Needs</span>
              <span className="text-sm font-bold text-sky-400">
                ₹{metrics.essentialSpentToDate.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-sans block">Discretionary Wants</span>
              <span className="text-sm font-bold text-amber-400">
                ₹{metrics.discretionarySpentToDate.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Table */}
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center border border-slate-800/80 rounded-lg space-y-2">
              <div className="text-sm font-medium text-slate-300">
                No matching transactions in ledger
              </div>
              <p className="text-xs text-slate-400">
                Clear your search filters or log a new transaction on the left.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('ALL');
                  setTypeFilter('ALL');
                }}
                className="mt-2 px-3 py-1.5 bg-slate-800 text-xs text-sky-400 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" aria-label="30-Day Transaction Audit Table">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400">
                    <th scope="col" className="py-2.5 pr-3">DAY</th>
                    <th scope="col" className="py-2.5 px-3">TRANSACTION & METADATA</th>
                    <th scope="col" className="py-2.5 px-3 text-right">AMOUNT</th>
                    <th scope="col" className="py-2.5 pl-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-sm">
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 pr-3 font-mono text-xs text-slate-400 tabular-nums whitespace-nowrap">
                        Day {tx.day}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-100">{tx.title}</div>
                        <div className="text-xs text-slate-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span>{tx.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {tx.type === 'income'
                              ? 'Inflow'
                              : tx.isEssential
                              ? 'Essential Need'
                              : 'Discretionary Want'}
                          </span>
                          {tx.note && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-slate-400">{tx.note}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-mono font-semibold tabular-nums whitespace-nowrap ${
                          tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 pl-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete entry"
                          aria-label={`Delete ${tx.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
SmartLedgerView.displayName = 'SmartLedgerView';
