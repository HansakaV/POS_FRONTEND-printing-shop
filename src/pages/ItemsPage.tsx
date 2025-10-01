import type { Item } from "../types/items.ts";
import { Button } from "../components/Button.tsx";
import React, { useState, useEffect } from "react";
import { Input } from "../components/Input.tsx";
import Table from "../components/Table.tsx";
import { Modal } from "../components/Modal.tsx";
import axios from "axios";
import toast from "react-hot-toast";
import { addItem, deleteItem, getAllItems, updateItem } from "../services/itemService.ts";

const ItemsPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isItemsLoading, setIsItemsLoading] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all items
  const fetchAllItems = async () => {
    try {
      setIsItemsLoading(true);
      const result = await getAllItems();
      console.log("Fetched items:", result);
      setItems(result);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.message);
      } else {
        toast.error("Failed to fetch items");
      }
    } finally {
      setIsItemsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllItems();
  }, []);

  // Delete item
  const removeItem = async (itemName: string) => {
    try {
      await deleteItem(itemName);
      toast.success("Item deleted successfully");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.message);
      } else {
        toast.error("Failed to delete item");
      }
      throw error;
    }
  };

  // Table columns
  const columns = [
    { key: "itemName" as keyof Item, 
      header: "Item Name" ,
      render: (item: Item) => item.itemName},
    { key: "qty" as keyof Item, header: "Quantity" },
    {
      key: "unitPrice" as keyof Item,
      header: "Unit Price",
      render: (item: Item) => `LKR ${(item.unitPrice ?? 0).toFixed(2)}`,
    },
    {
      key: "actions" as const,
      header: "Actions",
      render: (item: Item) => (
        <div className="space-x-2">
          <Button
            variant="secondary"
            onClick={() => handleEditItem(item)}
            disabled={isSubmitting}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDeleteItem(item)}
            disabled={isSubmitting}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleAddItem = () => {
    setSelectedItem(null);
    setIsAddModalOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDeleteItem = (item: Item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const itemData: Omit<Item, "_id"> = {
        itemName: formData.get("itemName") as string,
        qty: Number(formData.get("qty") || 0),
        unitPrice: Number(formData.get("unitPrice") || 0),
      };

      if (selectedItem) {
        // Update existing item
        const updatedItem = await updateItem(selectedItem.itemName, itemData);
        setItems((prev) =>
          prev.map((i) =>
            i.itemName === selectedItem.itemName ? updatedItem : i
          )
        );
        setIsEditModalOpen(false);
        toast.success("Item updated successfully");
      } else {
        // Add new item
        const newItem = await addItem(itemData);
        setItems((prev) => [...prev, newItem]);
        setIsAddModalOpen(false);
        toast.success("Item added successfully");
      }
      setSelectedItem(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (selectedItem) {
      try {
        setIsSubmitting(true);
        await removeItem(selectedItem.itemName);
        await fetchAllItems();
      } catch (error) {
      } finally {
        setIsDeleteModalOpen(false);
        setSelectedItem(null);
        setIsSubmitting(false);
      }
    }
  };

  const cancelModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  if (isItemsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading items...</p>
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
            <h1 className="text-3xl font-bold text-gray-800">
              Item Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your items efficiently
            </p>
          </div>
          <Button
            onClick={handleAddItem}
            disabled={isSubmitting}
            className="flex items-center space-x-2"
          >
            <span>Add New Item</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Items
            </h3>
            <p className="text-3xl font-bold text-blue-600">{items.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">
              Low Stock (&lt; 10)
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {items.filter((i) => i.qty < 10).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Inventory Value
            </h3>
            <p className="text-3xl font-bold text-green-600">
              LKR{" "}
              {items
                .reduce((sum, i) => sum + i.qty * i.unitPrice, 0)
                .toFixed(2)}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              All Items
            </h2>
            <Table data={items} columns={columns} />
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={cancelModal}
          title={selectedItem ? "Edit Item" : "Add Item"}
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <Input
              label="Item Name"
              name="itemName"
              defaultValue={selectedItem?.itemName || ""}
              required
              disabled={isSubmitting}
            />
            <Input
              label="Quantity"
              name="qty"
              type="number"
              defaultValue={selectedItem?.qty?.toString() || "0"}
              disabled={isSubmitting}
            />
            <Input
              label="Unit Price"
              name="unitPrice"
              type="number"
              defaultValue={selectedItem?.unitPrice?.toString() || "0"}
              disabled={isSubmitting}
            />
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={cancelModal}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? selectedItem
                    ? "Updating..."
                    : "Adding..."
                  : selectedItem
                  ? "Save Changes"
                  : "Add Item"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={cancelModal}
          title="Delete Item"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete{" "}
              <strong>{selectedItem?.itemName}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={cancelModal}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete Item"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ItemsPage;
