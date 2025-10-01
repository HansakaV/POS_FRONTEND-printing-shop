import React, { useState, useEffect } from "react";
import type { Customer } from "../types/customer";
import type { Item } from "../types/items";
import type { Order } from "../types/order";
import type { OrderItem } from "../types/orderItem";
import { getAllCustomers } from "../services/customerService";
import { getAllItems, updateItem } from "../services/itemService";
import { getAllOrders, addOrder } from "../services/orderService";
import { updateCustomerBalance } from "../services/customerService";
import axios from "axios";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import InvoiceModal from "../components/invoiceModal";

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderType, setOrderType] = useState<'standard' | 'custom'>('standard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [customCustomerPhone, setCustomCustomerPhone] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchItems();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const result = await getAllOrders();
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

  const fetchCustomers = async () => {
    try {
      const result = await getAllCustomers();
      setCustomers(result);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.message);
      } else {
        toast.error("Failed to fetch customers");
      }
    }
  };
  
  let customerPhone = customers.find(c => c._id === selectedCustomerId)?.phone || ''
  if(orderType === 'custom'){
    customerPhone = customCustomerPhone
  }
  console.log("customerPhone", customerPhone);

  const fetchItems = async () => {
    try {
      const result = await getAllItems();
      setItems(result);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.message);
      } else {
        toast.error("Failed to fetch items");
      }
    }
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { 
      itemId: '', 
      itemName: '', 
      quantity: 1, 
      price: 0, 
      total: 0 
    }]);
  };
  

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...orderItems];
    
    if (field === 'itemId' && typeof value === 'string') {
      newItems[index].itemId = value;
      if (orderType === 'standard') {
        const selectedItem = items.find(item => item._id === value);
        if (selectedItem) {
          newItems[index].itemName = selectedItem.itemName;
          newItems[index].price = selectedItem.unitPrice;
          newItems[index].total = newItems[index].quantity * selectedItem.unitPrice;
          
        }
      }
    } else if (field === 'itemName' && typeof value === 'string') {
      newItems[index].itemName = value;
    } else if (field === 'quantity' && typeof value === 'number') {
      newItems[index].quantity = value;
      newItems[index].total = value * newItems[index].price;
    } else if (field === 'price' && typeof value === 'number') {
      newItems[index].price = value;
      newItems[index].total = newItems[index].quantity * value;
    }
    
    setOrderItems(newItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmitOrder = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const totalAmount = calculateTotal();
      const balanceAmount = totalAmount - paidAmount;

      const orderData = {
        customerName: orderType === "standard" 
          ? customers.find((c) => c._id === selectedCustomerId)?.name || "" 
          : customCustomerName,
        customerPhone: orderType === "standard" 
          ? customers.find((c) => c._id === selectedCustomerId)?.phone || "" 
          : customCustomerPhone,
        items: orderItems,
        totalAmount,
        paidAmount,
        balanceAmount,
        status: (balanceAmount > 0 ? "pending" : "completed") as Order["status"],
        orderType,
      };

      //fetch realtimeUpdated customer Balance using phone
      const fetchCustomer = customers.find(c => c.phone === customerPhone);
      const currentBalance = fetchCustomer?.balance || 0;
      console.log("currentBalance", currentBalance);
      console.log("paidAmount", paidAmount);
      console.log("balanceAmount", balanceAmount);

      const newBalance = currentBalance +  balanceAmount;
      console.log("newBalance", newBalance);
      

      const savedOrder = await addOrder(orderData);
      setOrders([savedOrder, ...orders]);
      Swal.fire({
        title: "Success!",
        text: "Order created successfully!",
        icon: "success",
        draggable: true
          });
      handleCloseModal();

      if (orderType === "standard") {
      // Update balance on backend
      await updateCustomerBalance(selectedCustomerId);
      fetchCustomers(); // refresh customer data in UI
      

      for (const item of orderItems) {
    const selectedItem = items.find(i => i._id === item.itemId);
    if (selectedItem) {
      const updatedQty = selectedItem.qty - item.quantity; // deduct
      if (updatedQty < 0) {
        toast.error(`Not enough stock for ${selectedItem.itemName}`);
        continue; // skip this item
      }
      await updateItem(selectedItem._id, {
        ...selectedItem,
        qty: updatedQty
      });
    }
  }

  // Refresh items in UI
  fetchItems();
}

     const message = `Dear Sir/Madam,
     Your Order has been placed successfully.Total Amount is LKR ${totalAmount.toFixed(2) || 0}.
      Paid Amount is LKR ${paidAmount.toFixed(2) || 0}.
       Thanks for shopping with DP Communication.`;

     await axios.post("http://localhost:3000/api/sms/send-sms", {
      phone: customerPhone,
      message,
    });



    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.message);
      } else {
        toast.error("❌ Failed to create order");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setOrderType('standard');
    setSelectedCustomerId('');
    setCustomCustomerName('');
    setCustomCustomerPhone('');
    setOrderItems([]);
    setPaidAmount(0);
  };


  

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.customerPhone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalAmount, 0),
    pendingPayments: orders.filter(o => o.status === 'pending').reduce((sum, o) => sum + o.balanceAmount, 0)
  };

  

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
            <p className="text-gray-600 mt-1">Create and manage customer orders</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-200 shadow-lg"
          >
            + Create New Order
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-600">Total Orders</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-600">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-600">Completed</h3>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-600">Total Revenue</h3>
            <p className="text-2xl font-bold text-purple-600">LKR {stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-600">Pending Payments</h3>
            <p className="text-2xl font-bold text-red-600">LKR {stats.pendingPayments.toFixed(2)}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Search by customer name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              {/* <option value="cancelled">Paid Amounts</option> */}
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{order.customerName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {order.orderType.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">📞 {order.customerPhone}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">LKR {order.totalAmount.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Paid: LKR {order.paidAmount.toFixed(2)}</p>
                  {order.balanceAmount > 0 && (
                    <p className="text-sm text-red-600 font-semibold">
                      Balance: LKR {order.balanceAmount.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Order Items:</h4>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                      <span className="text-gray-700">{item.itemName} × {item.quantity}</span>
                      <span className="font-semibold text-gray-800">LKR {item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedOrder(order)}
                  className="px-4 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                >
                  Print Invoice
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        )}

        {selectedOrder && (
        <InvoiceModal 
        order={selectedOrder} 
       onClose={() => setSelectedOrder(null)} 
        />
        )}


        {/* Create Order Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Create New Order</h2>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                {/* Order Type */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Order Type</label>
                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setOrderType('standard')}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                        orderType === 'standard' 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-semibold">Standard Order</div>
                      <div className="text-xs mt-1">Select from existing customers and items</div>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setOrderType('custom')}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                        orderType === 'custom' 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-semibold">Custom Order</div>
                      <div className="text-xs mt-1">Quick entry with manual typing</div>
                    </button>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Details</label>
                  {orderType === 'standard' ? (
                    <select 
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a customer</option>
                      {customers.map(customer => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name} - {customer.phone}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Customer Name"
                        value={customCustomerName}
                        onChange={(e) => setCustomCustomerName(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input 
                        type="tel" 
                        placeholder="Customer Phone"
                        value={customCustomerPhone}
                        onChange={(e) => setCustomCustomerPhone(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700">Order Items</label>
                    <button 
                      type="button" 
                      onClick={handleAddItem}
                      className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                    >
                      + Add Item
                    </button>
                  </div>
                  <div className="space-y-3">
                    {orderItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 bg-gray-50 p-3 rounded-lg">
                        {orderType === 'standard' ? (
                          <select 
                            value={item.itemId || ''}
                            onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                            className="col-span-5 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select item</option>
                            {items.map(i => (
                              <option key={i._id} value={i._id}>
                                {i.itemName} - LKR {i.unitPrice}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input 
                            type="text" 
                            placeholder="Item name"
                            value={item.itemName}
                            onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                            className="col-span-5 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                        <input 
                          type="number" 
                          placeholder="Qty"
                          value={item.quantity || ''}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          min="1"
                          className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <input 
                          type="number" 
                          placeholder="Price"
                          value={item.price || ''}
                          onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                          min="0"
                          step="0.01"
                          disabled={orderType === 'standard' && !!item.itemId}
                          className="col-span-3 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                        <div className="col-span-1 flex items-center justify-center">
                          <button 
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-700 font-bold text-xl"
                          >
                            ×
                          </button>
                        </div>
                        <div className="col-span-12 text-right text-sm font-semibold text-gray-700">
                          Total: LKR {item.total.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {orderItems.length === 0 && (
                    <p className="text-center text-gray-500 py-8">Click Add Item to start adding items</p>
                  )}
                </div>

                {/* Order Summary */}
                {orderItems.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">Total Amount:</span>
                        <span className="font-bold text-blue-600">LKR {calculateTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="font-semibold">Paid Amount:</label>
                        <input 
                          type="number" 
                          value={paidAmount || ''}
                          onChange={(e) => setPaidAmount(Number(e.target.value))}
                          min="0"
                          max={calculateTotal()}
                          step="0.01"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">Balance:</span>
                        <span className={`font-bold ${
                          calculateTotal() - paidAmount > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          LKR {(calculateTotal() - paidAmount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting || orderItems.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Order'}
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

export default OrdersPage;