import type { Customer } from "../types/customer.ts";
import { Button } from "../components/Button.tsx";
import React, { useState, useEffect } from "react";
import { Input } from "../components/Input.tsx"; 
import Table from "../components/Table.tsx";
import { Modal } from "../components/Modal.tsx";
import axios from "axios";
import toast from "react-hot-toast";
import { addCustomer, deleteCustomer, getAllCustomers, updateCustomer } from "../services/customerService.ts";

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isCustomersLoading, setIsCustomersLoading] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  // Fetch all customers
  const fetchAllCustomers = async () => {
    try {
      setIsCustomersLoading(true);
      const result = await getAllCustomers();
      setCustomers(result);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.message);
      } else {
        toast.error("Failed to fetch customers");
      }
    } finally {
      setIsCustomersLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCustomers();
  }, []);

  // Delete customer
  const removeCustomer = async (id: string) => {
    try {
      await deleteCustomer(id);
      toast.success("Customer deleted successfully");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.message);
      } else {
        toast.error("Failed to delete customer");
      }
      throw error;
    }
  };

  // Table columns
  const columns = [
    { key: 'name' as keyof Customer, header: 'Name' },
    { key: 'phone' as keyof Customer, header: 'Phone' },
    { 
      key: 'balance' as keyof Customer, 
      header: "Balance",
    render: (customer: Customer) =>
    `LKR ${(customer.balance ?? 0).toFixed(2)}` 
    },
    { 
       key: 'status' as keyof Customer,
  header: 'Status',
  render: (customer: Customer) => {
    // Use Type Assertion if createdAt is not in your type
    const createdDate = new Date((customer as any).createdAt);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays <= 10) return <span className="text-green-600">Active</span>;
    if (diffInDays <= 30) return <span className="text-yellow-600">Pending</span>;
    return <span className="text-red-600">New</span>;      } 
    },
    {
      key: 'actions' as const,
      header: 'Actions',
      render: (customer: Customer) => (
        <div className="space-x-2">
          <Button variant="secondary" onClick={() => handleEditCustomer(customer)} disabled={isSubmitting}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => handleDeleteCustomer(customer)} disabled={isSubmitting}>
            Delete
          </Button>
          <Button variant="warning" onClick={() => handleReminder(customer)} disabled={isSubmitting}>
            Reminder 🔕
          </Button>
        </div>
      ),
    },
  ];
  
  const handleReminder = async (customer: Customer) => {
  try {
    const message = `Dear Sir/Madam,
You have outstanding payments of LKR ${customer.balance?.toFixed(2) || 0}.
Thanks for shopping with DP Communication.`;

    const res = await axios.post("http://localhost:3000/api/sms/send-sms", {
      phone: customer.phone,
      message,
    });

    const { success, result, error } = res.data;

    if (success) {
      alert("✅ Reminder SMS sent successfully!");
    } else if (result) {
      // Partial success case
      const failed = result.messages.filter((m: any) => m.status.toLowerCase() !== "success");
      if (failed.length) {
        alert(`⚠️ Some SMS failed:\n${failed.map((f: { mobile: string; error?: string; status: string }) => `${f.mobile}: ${f.error || f.status}`).join("\n")}`);
      } else {
        alert("❌ SMS sending failed for unknown reason");
      }
    } else {
      alert(`❌ Failed to send SMS: ${error || "Unknown error"}`);
    }
  } catch (err: any) {
    console.error(err);
    alert(`❌ Error sending SMS: ${err.message}`);
  }
};

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsAddModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const customerData: Omit<Customer, '_id'> = {
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        balance: Number(formData.get('balance') || 0),

      };

      if (selectedCustomer) {
        // Update existing customer
        const updatedCustomer = await updateCustomer(selectedCustomer._id, customerData);
        setCustomers(prev => prev.map(c => c._id === selectedCustomer._id ? updatedCustomer : c));
        setIsEditModalOpen(false);
        toast.success("Customer updated successfully");
      } else {
        // Add new customer
        const newCustomer = await addCustomer(customerData);
        setCustomers(prev => [...prev, newCustomer]);
        setIsAddModalOpen(false);
        toast.success("Customer added successfully");
      }
      setSelectedCustomer(null);
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
    if (selectedCustomer) {
      try {
        setIsSubmitting(true);
        await removeCustomer(selectedCustomer._id);
        await fetchAllCustomers();
      } catch (error) {}
      finally {
        setIsDeleteModalOpen(false);
        setSelectedCustomer(null);
        setIsSubmitting(false);
      }
    }
  };

  const cancelModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedCustomer(null);
  };

  if (isCustomersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
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
            <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
            <p className="text-gray-600 mt-1">Manage your customers efficiently</p>
          </div>
          <Button onClick={handleAddCustomer} disabled={isSubmitting} className="flex items-center space-x-2">
            <span>Add New Customer</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Customers</h3>
            <p className="text-3xl font-bold text-blue-600">{customers.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Active Customers</h3>
            <p className="text-3xl font-bold text-green-600">{customers.filter(c => c.balance && c.balance > 50).length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">New Customers</h3>
            <p className="text-3xl font-bold text-purple-600">{customers.filter(c => !c.balance || c.balance === 0).length}</p>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">All Customers</h2>
            <Table data={customers} columns={columns} />
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Modal isOpen={isAddModalOpen || isEditModalOpen} onClose={cancelModal} title={selectedCustomer ? "Edit Customer" : "Add Customer"}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <Input label="Name" name="name" defaultValue={selectedCustomer?.name || ''} required disabled={isSubmitting}/>
            <Input label="Phone" name="phone" defaultValue={selectedCustomer?.phone || ''} disabled={isSubmitting}/>
            <Input label="Balance" name="balance" type="number" defaultValue={selectedCustomer?.balance?.toString() || '0'} disabled={isSubmitting}/>
            <div className="flex justify-end space-x-2 mt-6">
              <Button type="button" variant="secondary" onClick={cancelModal} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? (selectedCustomer ? 'Updating...' : 'Adding...') : (selectedCustomer ? 'Save Changes' : 'Add Customer')}</Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteModalOpen} onClose={cancelModal} title="Delete Customer">
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete <strong>{selectedCustomer?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2 mt-6">
              <Button type="button" variant="secondary" onClick={cancelModal} disabled={isSubmitting}>Cancel</Button>
              <Button variant="danger" onClick={confirmDelete} disabled={isSubmitting}>{isSubmitting ? 'Deleting...' : 'Delete Customer'}</Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CustomersPage;
