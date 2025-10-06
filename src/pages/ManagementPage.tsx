import React, { useState, useEffect } from "react";
import { Search, DollarSign,  Printer } from "lucide-react";
import type{ Order } from "../types/order";
import type { Customer } from "../types/customer";
import { getLoggedInUser } from "../services/authService";
import axios from "axios";
import { toast } from "react-hot-toast";
import { getAllCustomers } from "../services/customerService";
import { getAllOrders } from "../services/orderService";
import InvoiceModal from "../components/invoiceModal";
import { updateOrder } from "../services/orderService";
import Swal from "sweetalert2";
import { updateCustomerBalance } from "../services/customerService";
import type { OrderItem } from "../types/orderItem";


const ManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [activeTab, setActiveTab] = useState<'orders' | 'finance'>('orders');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [user,setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  

   useEffect(() => {
    const loggedUser = getLoggedInUser();
    setUser(loggedUser);
  }, []);

  useEffect(() => {
  if (user?.branch) {
    fetchOrders(user.branch);
    fetchCustomers(user.branch);
  }
}, [user]);
console.log(customers)
console.log(isLoading)

  const fetchOrders = async (branch: string) => {
    try {
      setIsLoading(true);
      const result = await getAllOrders(branch);
      setOrders(result);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.message);
      } else {
        toast.error("Failed to fetch orders");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async (branch: string) => {
    try {
      const result = await getAllCustomers(branch);
      setCustomers(result);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.message);
      } else {
        toast.error("Failed to fetch customers");
      }
    }
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

  let selectedCustomerId = selectedOrder ? customers.find(c => c.phone === selectedOrder.customerPhone)?._id || '' : ''
    

const handlePayment = async () => {
  if (!selectedOrder) return;

  const newBalance = selectedOrder.balanceAmount - paymentAmount;
  const newPaidAmount = selectedOrder.paidAmount + paymentAmount;
  const newStatus: 'pending' | 'completed' | 'cancelled' =
    newBalance <= 0 ? 'completed' : 'pending';

  try {
    // 🔹 Update the selected order on backend
    const updatedOrder = {
      ...selectedOrder,
      paidAmount: newPaidAmount,
      balanceAmount: Math.max(0, newBalance),
      status: newStatus,
    };
    console.log("Updating order with data:", updatedOrder);

    await updateOrder(selectedOrder._id, updatedOrder);

    // 🔹 Update local state
    const updatedOrders = orders.map((o) =>
      o._id === selectedOrder._id ? updatedOrder : o
    );

    setOrders(updatedOrders);
    try{
    const message = `Dear Sir/Madam,
     We have Received Your Payment  LKR ${selectedOrder.balanceAmount.toFixed(2) || 0}.Your Due balance is LKR ${(selectedOrder.totalAmount - selectedOrder.balanceAmount).toFixed(2) || 0}.
     Thanks for shopping with DP Communication.`;
//api end point
     await axios.post("https://pos-backend-dp.onrender.com/api/sms/send-sms", {
      phone: selectedOrder.customerPhone,
      message,
    });
  }catch(error){
    console.error("SMS sending failed:", error);
  }
  //updated message for testing

      await updateCustomerBalance(selectedCustomerId);
    // 🔹 Show success alert
    Swal.fire({
      icon: 'success',
      title: 'Payment Recorded',
      text: 'The payment has been successfully recorded and the customer has been notified.',
    });


    // Reset modal & states
    setIsPaymentModalOpen(false);
    setPaymentAmount(0);
    setSelectedOrder(null);
  } catch (error) {
    console.error("Payment update failed:", error);
    // You can add toast/error handling here
  }
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
          <p className="text-gray-600">Comprehensive order tracking 🔕</p>
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
<div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
  <div className="flex justify-between items-start">
    {/* Left: Customer Info */}
    <div>
      <h2 className="text-2xl font-bold mb-2">{customerData.customerName}</h2>
      <p className="text-blue-100">📞 {customerData.customerPhone}</p>
      <p className="text-blue-100 text-sm mt-1">Total Orders: {customerData.totalOrders}</p>
    </div>

    {/* Right: Amounts + Buttons */}
    <div className="text-right">
      <p className="text-sm text-blue-100">Total Amount</p>
      <p className="text-3xl font-bold">LKR {customerData.totalAmount.toFixed(2)}</p>
      <p className="text-sm mt-2">Paid: LKR {customerData.totalPaid.toFixed(2)}</p>
      {customerData.totalBalance > 0 && (
        <p className="text-lg font-bold text-yellow-300 mt-1">
          Due: LKR {customerData.totalBalance.toFixed(2)}
        </p>
      )}
      
      {/* Action Buttons - Only show once per customer */}
      <div className="flex gap-2 mt-4 justify-end">
        {/* <button
  onClick={() => {
    if (!customerData.orders || customerData.orders.length === 0) return;

    // merge all order items into one invoice
    const firstOrder = customerData.orders[0];
    const combinedOrder: Order = {
      _id: "combined-" + customerData.customerPhone,
      customerName: customerData.customerName,
      customerPhone: customerData.customerPhone,
      items: customerData.orders.flatMap((order: Order) => order.items),
      totalAmount: customerData.orders.reduce((sum: number, order: Order) => sum + order.totalAmount, 0),
      paidAmount: customerData.orders.reduce((sum: number, order: Order) => sum + order.paidAmount, 0),
      balanceAmount: customerData.orders.reduce((sum: number, order: Order) => sum + order.balanceAmount, 0),
      status: customerData.totalBalance > 0 ? "pending" : "completed",
      createdAt: firstOrder?.createdAt || new Date().toISOString(),
      orderType: firstOrder?.orderType || "standard",
      branch: firstOrder?.branch || "",
    };

    setSelectedOrder(combinedOrder);
    console.log("Combined Order for Invoice:", combinedOrder);
  }}
  className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition text-sm font-semibold"
>
  <Printer size={16} />
  Print Invoice
</button> */}
      <div className="flex gap-2 mt-4 justify-end">
  <button
    onClick={() => {
      if (!customerData.orders || customerData.orders.length === 0) return;

      // ✅ only keep non-completed orders
      const pendingOrders = customerData.orders.filter(
        (order: Order) => order.status !== "completed"
      );

      if (pendingOrders.length === 0) {
        console.log("No pending orders to print.");
        return;
      }

      const firstOrder = pendingOrders[0];

      // ✅ merge and group items by itemId (or itemName if no IDs)
      const groupedItems: Record<string, OrderItem> = {};

      pendingOrders.forEach((order: Order) => {
        order.items.forEach((item: any) => {
          const key = item.itemId || item.itemName; // fallback if no itemId
          if (!groupedItems[key]) {
            groupedItems[key] = {
              itemId: item.itemId,
              itemName: item.itemName,
              quantity: item.quantity,
              price: item.price ?? item.total / item.quantity,
              total: item.total,
            };
          } else {
            groupedItems[key].quantity += item.quantity;
            groupedItems[key].total += item.total;
          }
        });
      });

      const mergedItems: OrderItem[] = Object.values(groupedItems);

      // ✅ recalc totals from merged items
      const totalAmount = mergedItems.reduce(
        (sum, item) => sum + item.total,
        0
      );

      // Types for merged invoice calculation
      interface PendingOrder extends Order {
        items: OrderItem[];
      }

      const paidAmount: number = (pendingOrders as PendingOrder[]).reduce(
        (sum: number, order: PendingOrder) => sum + order.paidAmount,
        0
      );

      const balanceAmount = totalAmount - paidAmount;

      const combinedOrder: Order = {
        _id: "combined-" + customerData.customerPhone,
        customerName: customerData.customerName,
        customerPhone: customerData.customerPhone,
        items: mergedItems,
        totalAmount,
        paidAmount,
        balanceAmount,
        status: balanceAmount > 0 ? "pending" : "completed",
        createdAt: firstOrder?.createdAt || new Date().toISOString(),
        orderType: firstOrder?.orderType || "standard",
        branch: firstOrder?.branch || "",
      };

      setSelectedOrder(combinedOrder);
      console.log("Combined Order for Invoice:", combinedOrder);
    }}
    className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition text-sm font-semibold"
  >
    <Printer size={16} />
    Print Invoice
  </button>
</div>



<button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-semibold"
onClick={() => toast.error("Delete functionality not implemented yet")}
>
  Delete Order
</button>

        {customerData.totalBalance > 0 && (
          <button
            onClick={() => {
              // Select the first pending order for payment
              const pendingOrder = customerData.orders.find((o: Order) => o.balanceAmount > 0);
              if (pendingOrder) {
                setSelectedOrder(pendingOrder);
                setIsPaymentModalOpen(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-semibold"
          >
            <DollarSign size={16} />
            Record Payment
          </button>
        )}
      </div>
    </div>
  </div>
</div>
            {selectedOrder && (
        <InvoiceModal 
        order={selectedOrder} 
       onClose={() => setSelectedOrder(null)} 
        />
          )}

                  
                  {/* Customer Orders */}
<div className="p-6 space-y-4">
  {customerData.orders
    .filter((order: Order) => order.status !== "completed") // ✅ skip completed
    .map((order: Order) => (
      <div
        key={order._id}
        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  order.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {order.status.toUpperCase()}
              </span>
              <span className="text-xs text-gray-500">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString()
                  : "N/A"}
              </span>
            </div>
            <p className="text-xs text-gray-500">Order ID: {order._id}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-800">
              LKR {order.totalAmount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              Paid: LKR {order.paidAmount.toFixed(2)}
            </p>
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

      
      </div>
    </div>
  );
};

export default ManagementPage;