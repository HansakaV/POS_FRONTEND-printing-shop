import type { Customer} from "../types/customer"
import apiClient from "./apiClient"

export const getAllCustomers = async (branch: string): Promise<Customer[]> => {
  const response = await apiClient.get(`/customers/${branch}`);
  return response.data
}

export const deleteCustomer = async (_id: string): Promise<void> => {
  await apiClient.delete(`/customers/${_id}`)
}

export const addCustomer = async (customerData: Omit<Customer, "_id">): Promise<Customer> => {
    console.log("Adding customer with data:", customerData)
  const response = await apiClient.post("/customers", customerData)
  console.log("Response from adding customer:", response.data)

  return response.data
}

export const updateCustomer = async (_id: string, customerData: Omit<Customer, "_id">) => {
  const response = await apiClient.put(`/customers/${_id}`, customerData)
  return response.data
}

export const updateCustomerBalance = async (_id: string): Promise<Customer> => {
  const response = await apiClient.put(`/customers/update-balance/${_id}`);
  return response.data;
};

export const updateCustomerBalanceViaPhone = async (phone: string, amount: number): Promise<Customer> => {
  const response = await apiClient.put(`/customers/update-balance-phone/${phone}`, { amount });
  return response.data;
}