import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, ShoppingCart, Users, Package, Calendar, Plus, X } from 'lucide-react';

interface SalesData {
  date: string;
  sales: number;
  orders: number;
  revenue: number;
}

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalOrders: number;
  avgOrderValue: number;
  pendingPayments: number;
}

const AdminDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [salesData] = useState<SalesData[]>([
    { date: '2025-09-01', sales: 45000, orders: 23, revenue: 45000 },
    { date: '2025-09-05', sales: 52000, orders: 28, revenue: 52000 },
    { date: '2025-09-10', sales: 38000, orders: 19, revenue: 38000 },
    { date: '2025-09-15', sales: 67000, orders: 34, revenue: 67000 },
    { date: '2025-09-20', sales: 71000, orders: 38, revenue: 71000 },
    { date: '2025-09-25', sales: 58000, orders: 29, revenue: 58000 },
    { date: '2025-09-30', sales: 83000, orders: 42, revenue: 83000 }
  ]);

  const [categoryData] = useState([
    { name: 'Phone Cases', value: 145000, count: 245 },
    { name: 'Screen Protectors', value: 89000, count: 312 },
    { name: 'Chargers', value: 67000, count: 178 },
    { name: 'Accessories', value: 113000, count: 289 }
  ]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = () => {
    setExpenses([
      {
        id: '1',
        category: 'Rent',
        amount: 25000,
        description: 'Shop rent for September',
        date: '2025-09-01'
      },
      {
        id: '2',
        category: 'Utilities',
        amount: 5000,
        description: 'Electricity and water',
        date: '2025-09-15'
      },
      {
        id: '3',
        category: 'Inventory',
        amount: 150000,
        description: 'Stock purchase',
        date: '2025-09-10'
      }
    ]);
  };

  const financialSummary: FinancialSummary = {
    totalRevenue: salesData.reduce((sum, item) => sum + item.revenue, 0),
    totalExpenses: expenses.reduce((sum, item) => sum + item.amount, 0),
    netProfit: 0,
    totalOrders: salesData.reduce((sum, item) => sum + item.orders, 0),
    avgOrderValue: 0,
    pendingPayments: 45000
  };

  financialSummary.netProfit = financialSummary.totalRevenue - financialSummary.totalExpenses;
  financialSummary.avgOrderValue = financialSummary.totalRevenue / financialSummary.totalOrders;

  const handleAddExpense = () => {
    if (!newExpense.category || !newExpense.amount) {
      alert('Please fill in all required fields');
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      ...newExpense
    };

    setExpenses([expense, ...expenses]);
    setIsExpenseModalOpen(false);
    setNewExpense({
      category: '',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    alert('✅ Expense added successfully!');
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(e => e.id !== id));
      alert('✅ Expense deleted!');
    }
  };

  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const expenseCategoryData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Financial overview and business analytics</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition shadow-lg"
              >
                <Plus size={20} />
                Add Expense
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <DollarSign size={24} />
              </div>
              <TrendingUp size={20} className="opacity-80" />
            </div>
            <h3 className="text-sm font-semibold opacity-90 mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold">LKR {financialSummary.totalRevenue.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <TrendingUp size={24} />
              </div>
              <ShoppingCart size={20} className="opacity-80" />
            </div>
            <h3 className="text-sm font-semibold opacity-90 mb-1">Net Profit</h3>
            <p className="text-3xl font-bold">LKR {financialSummary.netProfit.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Package size={24} />
              </div>
              <Users size={20} className="opacity-80" />
            </div>
            <h3 className="text-sm font-semibold opacity-90 mb-1">Total Orders</h3>
            <p className="text-3xl font-bold">{financialSummary.totalOrders}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <TrendingDown size={24} />
              </div>
              <Calendar size={20} className="opacity-80" />
            </div>
            <h3 className="text-sm font-semibold opacity-90 mb-1">Avg Order Value</h3>
            <p className="text-3xl font-bold">LKR {financialSummary.avgOrderValue.toFixed(0)}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).getDate().toString()}
                  stroke="#9CA3AF"
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  formatter={(value: number) => `LKR ${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Orders Trend */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Orders Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).getDate().toString()}
                  stroke="#9CA3AF"
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Sales by Category */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sales by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `LKR ${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Expenses Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Expenses Breakdown</h2>
            {expenseCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expenseCategoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis dataKey="name" type="category" width={100} stroke="#9CA3AF" />
                  <Tooltip 
                    formatter={(value: number) => `LKR ${value.toLocaleString()}`}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="value" fill="#EF4444" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                No expenses recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary & Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Summary */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Financial Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="font-semibold text-gray-700">Total Revenue</span>
                <span className="text-xl font-bold text-blue-600">
                  LKR {financialSummary.totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <span className="font-semibold text-gray-700">Total Expenses</span>
                <span className="text-xl font-bold text-red-600">
                  LKR {financialSummary.totalExpenses.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="font-semibold text-gray-700">Net Profit</span>
                <span className="text-xl font-bold text-green-600">
                  LKR {financialSummary.netProfit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                <span className="font-semibold text-gray-700">Pending Payments</span>
                <span className="text-xl font-bold text-yellow-600">
                  LKR {financialSummary.pendingPayments.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <span className="font-semibold text-gray-700">Profit Margin</span>
                <span className="text-xl font-bold text-purple-600">
                  {((financialSummary.netProfit / financialSummary.totalRevenue) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Expenses</h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {expenses.length > 0 ? (
                expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{expense.category}</h3>
                      <p className="text-sm text-gray-600">{expense.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-red-600">
                        LKR {expense.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-12">
                  No expenses recorded yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Expense Modal */}
        {isExpenseModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
                <h2 className="text-2xl font-bold">Add New Expense</h2>
                <button onClick={() => setIsExpenseModalOpen(false)} className="text-white hover:text-gray-200 text-2xl">
                  ×
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select category</option>
                    <option value="Rent">Rent</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Salaries">Salaries</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (LKR) *</label>
                  <input
                    type="number"
                    value={newExpense.amount || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Enter expense details..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setIsExpenseModalOpen(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddExpense}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Add Expense
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;