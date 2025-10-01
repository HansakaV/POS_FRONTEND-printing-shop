import React, { useState, useEffect } from "react";
import { Search, DollarSign, TrendingUp, Calendar, Plus, Printer } from "lucide-react";

// Mock data types (replace with your actual types)
interface Order {
  _id: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    itemName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  orderType: 'standard' | 'custom';
  createdAt: string;
}

interface Expense {
  _id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

const ManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [activeTab, setActiveTab] = useState<'orders' | 'finance'>('orders');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  
  // Expense form state
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: 0,
    category: 'operations',
    date: new Date().toISOString().split('T')[0]
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Fetch orders and expenses from your API
    fetchOrders();
    fetchExpenses();
  }, []);

  const fetchOrders = async () => {
    // Replace with actual API call
    const mockOrders: Order[] = [
      {
        _id: '1',
        customerName: 'John Doe',
        customerPhone: '0771234567',
        items: [
          { itemName: 'iPhone 14', quantity: 1, price: 250000, total: 250000 },
          { itemName: 'Case', quantity: 2, price: 1500, total: 3000 }
        ],
        totalAmount: 253000,
        paidAmount: 200000,
        balanceAmount: 53000,
        status: 'pending',
        orderType: 'standard',
        createdAt: '2025-10-01T10:30:00'
      },
      {
        _id: '2',
        customerName: 'Jane Smith',
        customerPhone: '0779876543',
        items: [
          { itemName: 'Samsung S24', quantity: 1, price: 180000, total: 180000 }
        ],
        totalAmount: 180000,
        paidAmount: 180000,
        balanceAmount: 0,
        status: 'completed',
        orderType: 'standard',
        createdAt: '2025-09-28T14:20:00'
      },
      {
        _id: '3',
        customerName: 'John Doe',
        customerPhone: '0771234567',
        items: [
          { itemName: 'AirPods Pro', quantity: 1, price: 45000, total: 45000 }
        ],
        totalAmount: 45000,
        paidAmount: 45000,
        balanceAmount: 0,
        status: 'completed',
        orderType: 'standard',
        createdAt: '2025-09-15T09:15:00'
      }
    ];
    setOrders(mockOrders);
  };

  const fetchExpenses = async () => {
    // Replace with actual API call
    const mockExpenses: Expense[] = [
      { _id: '1', description: 'Rent', amount: 50000, category: 'operations', date: '2025-10-01' },
      { _id: '2', description: 'Electricity Bill', amount: 15000, category: 'utilities', date: '2025-09-28' },
      { _id: '3', description: 'Staff Salary', amount: 120000, category: 'salary', date: '2025-09-25' }
    ];
    setExpenses(mockExpenses);
  };

  // Filter orders by phone number
  const filteredOrders = orders.filter(order => {
    const matchesPhone = searchPhone === '' || order.customerPhone.includes(searchPhone);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesPhone && matchesStatus;
  });

  // Group orders by customer
  const groupedByCustomer = filteredOrders.reduce((acc, order) => {
    const key = order.customerPhone;
    if (!acc[key]) {
      acc[key] = {
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        orders: [],
        totalOrders: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalBalance: 0
      };
    }
    acc[key].orders.push(order);
    acc[key].totalOrders += 1;
    acc[key].totalAmount += order.totalAmount;
    acc[key].totalPaid += order.paidAmount;
    acc[key].totalBalance += order.balanceAmount;
    return acc;
  }, {} as Record<string, any>);

  // Financial calculations
  const calculateFinancials = (period: typeof selectedPeriod) => {
    const now = new Date();
    const periodStart = new Date();
    
    switch(period) {
      case 'daily':
        periodStart.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case 'yearly':
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
    }

    const periodOrders = orders.filter(o => new Date(o.createdAt) >= periodStart);
    const periodExpenses = expenses.filter(e => new Date(e.date) >= periodStart);

    const revenue = periodOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    
    const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = revenue - totalExpenses;

    return { revenue, totalExpenses, profit, orderCount: periodOrders.length };
  };

  const financials = calculateFinancials(selectedPeriod);

  // Handle payment
  const handlePayment = async () => {
    if (!selectedOrder) return;
    
    const newBalance = selectedOrder.balanceAmount - paymentAmount;
    const newPaidAmount = selectedOrder.paidAmount + paymentAmount;
    const newStatus: 'pending' | 'completed' | 'cancelled' = newBalance <= 0 ? 'completed' : 'pending';

    // Update order (replace with actual API call)
    const updatedOrders = orders.map(o => 
      o._id === selectedOrder._id 
        ? { ...o, paidAmount: newPaidAmount, balanceAmount: Math.max(0, newBalance), status: newStatus }
        : o
    );
    setOrders(updatedOrders);
    
    setIsPaymentModalOpen(false);
    setPaymentAmount(0);
    setSelectedOrder(null);
  };

  // Handle add expense
  const handleAddExpense = async () => {
    const expense: Expense = {
      _id: Date.now().toString(),
      ...newExpense
    };
    
    setExpenses([expense, ...expenses]);
    setIsExpenseModalOpen(false);
    setNewExpense({
      description: '',
      amount: 0,
      category: 'operations',
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Print invoice
  const handlePrintInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order._id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DP Communication</h1>
            <h2>Invoice</h2>
          </div>
          <div class="info">
            <p><strong>Customer:</strong> ${order.customerName}</p>
            <p><strong>Phone:</strong> ${order.customerPhone}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Order ID:</strong> ${order._id}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.itemName}</td>
                  <td>${item.quantity}</td>
                  <td>LKR ${item.price.toFixed(2)}</td>
                  <td>LKR ${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Total Amount: LKR ${order.totalAmount.toFixed(2)}</p>
            <p>Paid Amount: LKR ${order.paidAmount.toFixed(2)}</p>
            <p style="color: ${order.balanceAmount > 0 ? 'red' : 'green'}">
              Balance: LKR ${order.balanceAmount.toFixed(2)}
            </p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalPendingValue: orders.filter(o => o.status === 'pending').reduce((sum, o) => sum + o.balanceAmount, 0),
    totalRevenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalAmount, 0)
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Management Dashboard</h1>
          <p className="text-gray-600">Comprehensive order tracking and financial analytics</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'orders'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Order Management
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'finance'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Financial Analytics
            </button>
          </div>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Orders</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Pending Orders</h3>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Completed Orders</h3>
                <p className="text-3xl font-bold text-green-600">{stats.completedOrders}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Pending Value</h3>
                <p className="text-2xl font-bold text-red-600">LKR {stats.totalPendingValue.toFixed(2)}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Revenue</h3>
                <p className="text-2xl font-bold text-purple-600">LKR {stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="tel"
                    placeholder="Search by customer phone number..."
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending Only</option>
                  <option value="completed">Completed Only</option>
                </select>
              </div>
            </div>

            {/* Grouped Orders by Customer */}
            <div className="space-y-6">
              {Object.values(groupedByCustomer).map((customerData: any) => (
                <div key={customerData.customerPhone} className="bg-white rounded-lg shadow overflow-hidden">
                  {/* Customer Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">{customerData.customerName}</h2>
                        <p className="text-blue-100">📞 {customerData.customerPhone}</p>
                        <p className="text-blue-100 text-sm mt-1">Total Orders: {customerData.totalOrders}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-blue-100">Total Amount</p>
                        <p className="text-3xl font-bold">LKR {customerData.totalAmount.toFixed(2)}</p>
                        <p className="text-sm mt-2">Paid: LKR {customerData.totalPaid.toFixed(2)}</p>
                        {customerData.totalBalance > 0 && (
                          <p className="text-sm text-yellow-300 font-semibold">
                            Due: LKR {customerData.totalBalance.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Customer Orders */}
                  <div className="p-6 space-y-4">
                    {customerData.orders.map((order: Order) => (
                      <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                order.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">Order ID: {order._id}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-800">
                              LKR {order.totalAmount.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">Paid: LKR {order.paidAmount.toFixed(2)}</p>
                            {order.balanceAmount > 0 && (
                              <p className="text-sm text-red-600 font-semibold">
                                Balance: LKR {order.balanceAmount.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-gray-50 rounded p-3 mb-3">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Items:</h4>
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  {item.itemName} × {item.quantity}
                                </span>
                                <span className="font-semibold text-gray-800">
                                  LKR {item.total.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePrintInvoice(order)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                          >
                            <Printer size={16} />
                            Print Invoice
                          </button>
                          {order.balanceAmount > 0 && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsPaymentModalOpen(true);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                            >
                              <DollarSign size={16} />
                              Record Payment
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {Object.keys(groupedByCustomer).length === 0 && (
                <div className="bg-white p-12 rounded-lg shadow text-center">
                  <p className="text-gray-500 text-lg">No orders found</p>
                  <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Finance Tab */}
        {activeTab === 'finance' && (
          <>
            {/* Period Selector */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Financial Overview</h2>
                <div className="flex gap-2">
                  {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        selectedPeriod === period
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold opacity-90">Revenue</h3>
                  <TrendingUp size={24} />
                </div>
                <p className="text-3xl font-bold">LKR {financials.revenue.toFixed(2)}</p>
                <p className="text-sm opacity-90 mt-1">{financials.orderCount} orders</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold opacity-90">Expenses</h3>
                  <DollarSign size={24} />
                </div>
                <p className="text-3xl font-bold">LKR {financials.totalExpenses.toFixed(2)}</p>
                <p className="text-sm opacity-90 mt-1">{expenses.length} transactions</p>
              </div>

              <div className={`bg-gradient-to-br ${
                financials.profit >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'
              } text-white p-6 rounded-lg shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold opacity-90">Net Profit</h3>
                  <TrendingUp size={24} />
                </div>
                <p className="text-3xl font-bold">LKR {financials.profit.toFixed(2)}</p>
                <p className="text-sm opacity-90 mt-1">
                  {financials.profit >= 0 ? 'Profitable' : 'Loss'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold opacity-90">Profit Margin</h3>
                  <Calendar size={24} />
                </div>
                <p className="text-3xl font-bold">
                  {financials.revenue > 0 ? ((financials.profit / financials.revenue) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-sm opacity-90 mt-1">Of total revenue</p>
              </div>
            </div>

            {/* Expense Management */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Expense Management</h2>
                  <p className="text-gray-600 text-sm mt-1">Track and manage business expenses</p>
                </div>
                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  <Plus size={20} />
                  Add Expense
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <div key={expense._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div>
                        <h3 className="font-semibold text-gray-800">{expense.description}</h3>
                        <div className="flex gap-3 mt-1">
                          <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                            {expense.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-red-600">
                        - LKR {expense.amount.toFixed(2)}
                      </p>
                    </div>
                  ))}

                  {expenses.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No expenses recorded</p>
                      <p className="text-gray-400 text-sm mt-1">Click "Add Expense" to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Payment Modal */}
        {isPaymentModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">Record Payment</h2>
                <p className="text-gray-600 text-sm mt-1">Order ID: {selectedOrder._id}</p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold">LKR {selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Already Paid:</span>
                      <span className="font-bold text-green-600">LKR {selectedOrder.paidAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Balance:</span>
                      <span className="font-bold text-red-600">LKR {selectedOrder.balanceAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Amount
                    </label>
                    <input
                      type="number"
                      value={paymentAmount || ''}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      min="0"
                      max={selectedOrder.balanceAmount}
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="Enter amount"
                    />
                  </div>

                  {paymentAmount > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-gray-700">New Balance:</span>
                        <span className={`text-xl font-bold ${
                          selectedOrder.balanceAmount - paymentAmount <= 0 ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          LKR {Math.max(0, selectedOrder.balanceAmount - paymentAmount).toFixed(2)}
                        </span>
                      </div>
                      {selectedOrder.balanceAmount - paymentAmount <= 0 && (
                        <p className="text-green-600 text-sm font-semibold">✓ Order will be marked as completed</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    setPaymentAmount(0);
                    setSelectedOrder(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={paymentAmount <= 0 || paymentAmount > selectedOrder.balanceAmount}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Expense Modal */}
        {isExpenseModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">Add New Expense</h2>
                <p className="text-gray-600 text-sm mt-1">Record a business expense</p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Office Rent, Utilities, Salary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount (LKR)
                  </label>
                  <input
                    type="number"
                    value={newExpense.amount || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="operations">Operations</option>
                    <option value="utilities">Utilities</option>
                    <option value="salary">Salary</option>
                    <option value="inventory">Inventory</option>
                    <option value="marketing">Marketing</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsExpenseModalOpen(false);
                    setNewExpense({
                      description: '',
                      amount: 0,
                      category: 'operations',
                      date: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddExpense}
                  disabled={!newExpense.description || newExpense.amount <= 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Add Expense
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagementPage;