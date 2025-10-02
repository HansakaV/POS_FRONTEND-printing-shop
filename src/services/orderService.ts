import type { Order } from '../types/order';
import apiClient from "./apiClient"

export const getAllOrders = async (branch: string): Promise<Order[]> => {
  const response = await apiClient.get(`/orders/${branch}`)
  return response.data
}

export const deleteOrder = async (_id: string): Promise<void> => {
  await apiClient.delete(`/orders/${_id}`)
}

export const addOrder = async (orderData: Omit<Order, "_id">): Promise<Order> => {
  console.log("Adding order with data:", orderData)
  const response = await apiClient.post("/orders", orderData)
  return response.data
}

export const updateOrder = async (_id: string, orderData: Omit<Order, "_id">) => {
  const response = await apiClient.put(`/orders/${_id}`, orderData)
  return response.data
}

export const updateOrderStatus = async (orderId: string, status: Order["status"]): Promise<Order> => {
  const response = await apiClient.put(`/orders/${orderId}`, { status });
  return response.data;
};




