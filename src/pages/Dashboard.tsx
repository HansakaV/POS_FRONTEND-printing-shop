import React, { useEffect, useState } from "react";
import type { Order } from "../types/order.ts";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getAllCustomers } from "../services/customerService.ts";
import { getAllItems } from "../services/itemService.ts";
import { getAllOrders } from "../services/orderService.ts";
import type { Item } from "../types/items.ts";
import type { Customer } from "../types/customer.ts";
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Plus, 
  UserPlus, 
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);


  const navigate = useNavigate();

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [customersData, itemsData, ordersData] = await Promise.all([
        getAllCustomers(),
        getAllItems(),
        getAllOrders()
      ]);
      setCustomers(customersData);
      setItems(itemsData);
      setOrders(ordersData);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.message);
      } else {
        toast.error("Failed to fetch data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

// Filter orders for today
const todayOrders = orders.filter(order => {
  if (!order.createdAt) return false;
  const orderDate = new Date(order.createdAt);
  const today = new Date();
  return (
    orderDate.getFullYear() === today.getFullYear() &&
    orderDate.getMonth() === today.getMonth() &&
    orderDate.getDate() === today.getDate()
  );
});

// Stats array for today
const stats = [
  { 
    label: 'Today Items Sold', 
    value: todayOrders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0),
    icon: Package,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    change: '+12%',
    trend: 'up'
  },
  { 
    label: 'Today Customers', 
    value: todayOrders.length, // number of orders today
    icon: Users,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    change: '+8%',
    trend: 'up'
  },
  { 
    label: 'Today Orders', 
    value: todayOrders.length, // same as above
    icon: ShoppingCart,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    change: '+23%',
    trend: 'up'
  },
  { 
    label: 'Today Income', 
    value: todayOrders.reduce((total, order) => total + order.totalAmount, 0),
    icon: TrendingUp,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
    change: '+15%',
    trend: 'up'
  }
];

  


  const quickActions = [
    {
      title: 'Add New Items',
      description: 'Add products to inventory',
      icon: Plus,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      path: '/dashboard/items'
    },
    {
      title: 'Register Customer',
      description: 'Add new customer profile',
      icon: UserPlus,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      path: '/dashboard/customers'
    },
    {
      title: 'Create Order',
      description: 'Process new order',
      icon: ShoppingBag,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      path: '/dashboard/orders'
    },
  ];

  const recentActivity = [
    { action: 'New order placed', time: '2 minutes ago', icon: ShoppingCart, color: 'text-green-600' },
    { action: 'Customer registered', time: '15 minutes ago', icon: Users, color: 'text-purple-600' },
    { action: 'Item added to inventory', time: '1 hour ago', icon: Package, color: 'text-blue-600' },
    { action: 'Order completed', time: '2 hours ago', icon: Activity, color: 'text-orange-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-xl border border-blue-200">
          <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
          <span className="text-sm font-medium text-gray-700">Live Updates</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          
          return (
            <div 
              key={index}
              className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer transform hover:-translate-y-1"
            >
              {/* Background gradient */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-300`}></div>
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.bgColor} p-3 rounded-xl`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div className={`flex items-center space-x-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'} text-sm font-semibold`}>
                    <TrendIcon className="w-4 h-4" />
                    <span>{stat.change}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.label === 'Today Income' ? `LKR ${Number(stat.value).toFixed(0)}` : stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className={`group relative bg-gradient-to-br ${action.color} ${action.hoverColor} text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden`}
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  
                  <div className="relative">
                    <div className="bg-white/20 backdrop-blur-sm w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                    <p className="text-sm text-white/80">{action.description}</p>
                  </div>
                  
                  {/* Corner decoration */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-300"></div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div 
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer group"
                >
                  <div className={`${activity.color} bg-gray-50 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <button className="w-full mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 py-2 hover:bg-blue-50 rounded-lg transition-colors duration-200">
            View All Activity
          </button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-2xl p-8 shadow-2xl text-white overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative">
          <h2 className="text-2xl font-bold mb-2">System Performance</h2>
          <p className="text-blue-200 mb-6">All systems operational and running smoothly</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm text-blue-200 mb-2">Server Status</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-lg font-bold">Online</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm text-blue-200 mb-2">Response Time</p>
              <p className="text-lg font-bold">45ms</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm text-blue-200 mb-2">Uptime</p>
              <p className="text-lg font-bold">99.9%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;