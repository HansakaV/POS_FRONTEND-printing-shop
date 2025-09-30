import type { Item } from '../types/items';
import apiClient from "./apiClient"

export const getAllItems = async (): Promise<Item[]> => {
  const response = await apiClient.get("/items")
  console.log("items response", response.data);
  return response.data.map((item: any) => ({
    id: item._id, // Map _id from backend to id for your Item type
    itemName: item.itemName,
    qty: item.qty,
    unitPrice: item.unitPrice,
    _id: item._id, // Keep _id as well for use in dropdowns
  }))
}

export const deleteItem = async (_id: string): Promise<void> => {
  await apiClient.delete(`/items/${_id}`)
}

export const addItem = async (itemData: Omit<Item, "id">): Promise<Item> => {
  console.log("new item adding", itemData);
  const response = await apiClient.post("/items", itemData)
  return response.data
}

export const updateItem = async (_id: string, itemData: Omit<Item, "id">) => {
  console.log("item updating", itemData);
  const response = await apiClient.put(`/items/${_id}`, itemData)
  return response.data
}
