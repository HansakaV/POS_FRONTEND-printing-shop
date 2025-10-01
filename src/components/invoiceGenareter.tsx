import  { useState } from 'react';
import { Printer, Download, Plus, Trash2 } from 'lucide-react';

// ----- Types -----
interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  bank: string;
  accountNumber: string;
}

interface Invoice {
  invoiceNumber: string;
  companyInfo: CompanyInfo;
  billTo: string;
  date: string;
  paymentTerms: string;
  poNumber: string;
  items: InvoiceItem[];
  terms: string;
}

// ----- Component -----
export default function InvoiceGenerator() {
  const [invoice, setInvoice] = useState<Invoice>({
    invoiceNumber: '099303',
    companyInfo: {
      name: 'DP-COMMUNICATION',
      address: 'No. 40/55,\nBomaluwa Road,\nNivithigala,\nRathnapura.',
      phone: '0713856863',
      bank: 'BOC-Nivithigala',
      accountNumber: '94941383'
    },
    billTo: 'R/Nivi/Sumana Central College',
    date: new Date().toISOString().split('T')[0],
    paymentTerms: 'Cash/Cheque',
    poNumber: '',
    items: [
      {
        description: 'A3 Grade 11 Maths 3*150 Jagath sir',
        quantity: 450,
        rate: 14.0,
        amount: 6300.0
      }
    ],
    terms: 'All Cheques Should be drawn in favour Of "DP COMMUNICATION"\nBank Payee'
  });

  // ----- Helpers -----
  const calculateTotal = (): number => invoice.items.reduce((sum, item) => sum + item.amount, 0);

  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { description: '', quantity: 0, rate: 0, amount: 0 }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = invoice.items.filter((_, i) => i !== index);
    setInvoice({ ...invoice, items: newItems });
  };

  type UpdateItemKey = keyof InvoiceItem;

  const updateItem = (index: number, field: UpdateItemKey, value: string | number) => {
    const newItems = [...invoice.items];
    newItems[index][field] = value as never;

    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }

    setInvoice({ ...invoice, items: newItems });
  };

  const handlePrint = () => window.print();

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...invoice, total: calculateTotal(), balanceDue: calculateTotal() })
      });

      const data = await response.json();
      if (data.success) {
        alert('Invoice saved successfully!');
        setInvoice({
          ...invoice,
          invoiceNumber: String(parseInt(invoice.invoiceNumber) + 1).padStart(6, '0')
        });
      }
    } catch (err: any) {
      alert('Error saving invoice: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const total = calculateTotal();

  // ----- Render -----
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Action Buttons */}
        <div className="flex gap-3 mb-6 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Printer size={18} />
            Print
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Download size={18} />
            Save Invoice
          </button>
          <button
            onClick={addItem}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            <Plus size={18} />
            Add Item
          </button>
        </div>

        {/* Invoice */}
        <div className="bg-white shadow-lg p-12 rounded-lg" id="invoice">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 border-b-2 border-gray-300 pb-6">
            <div className="flex items-center gap-6">
              <img
                src="https://i.ibb.co/0BZVwJY/dp-logo.png"
                alt="DP Communication Logo"
                className="w-32 h-32 object-contain"
              />
              <div>
                <h1 className="text-4xl font-bold mb-2">INVOICE</h1>
                <p className="text-2xl text-gray-600"># {invoice.invoiceNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold mb-2">{invoice.companyInfo.name}</h2>
              <p className="text-sm whitespace-pre-line text-gray-600">
                {invoice.companyInfo.address}
              </p>
            </div>
          </div>

          {/* Bill To & Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="font-bold text-sm text-gray-600 mb-2">Bill To:</p>
              <input
                type="text"
                value={invoice.billTo}
                onChange={(e) => setInvoice({ ...invoice, billTo: e.target.value })}
                className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-lg print:border-none"
              />
            </div>
            <div className="space-y-2">
              <div className="flex">
                <span className="font-bold text-sm text-gray-600 w-32">Date:</span>
                <input
                  type="date"
                  value={invoice.date}
                  onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
                  className="flex-1 border-b border-gray-300 focus:border-blue-500 outline-none print:border-none"
                />
              </div>
              <div className="flex">
                <span className="font-bold text-sm text-gray-600 w-32">Payment Terms:</span>
                <input
                  type="text"
                  value={invoice.paymentTerms}
                  onChange={(e) => setInvoice({ ...invoice, paymentTerms: e.target.value })}
                  className="flex-1 border-b border-gray-300 focus:border-blue-500 outline-none print:border-none"
                />
              </div>
              <div className="flex">
                <span className="font-bold text-sm text-gray-600 w-32">PO Number:</span>
                <input
                  type="text"
                  value={invoice.poNumber}
                  onChange={(e) => setInvoice({ ...invoice, poNumber: e.target.value })}
                  className="flex-1 border-b border-gray-300 focus:border-blue-500 outline-none print:border-none"
                />
              </div>
              <div className="flex">
                <span className="font-bold text-sm text-gray-600 w-32">Phone:</span>
                <span className="flex-1">{invoice.companyInfo.phone}</span>
              </div>
              <div className="flex">
                <span className="font-bold text-sm text-gray-600 w-32">Balance Due:</span>
                <span className="flex-1 font-bold text-lg text-red-600">
                  LKR {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left p-3 font-bold text-sm">Item</th>
                <th className="text-right p-3 font-bold text-sm w-24">Quantity</th>
                <th className="text-right p-3 font-bold text-sm w-28">Rate</th>
                <th className="text-right p-3 font-bold text-sm w-32">Amount</th>
                <th className="w-12 print:hidden"></th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="p-3">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="w-full border-b border-gray-200 focus:border-blue-500 outline-none print:border-none"
                      placeholder="Item description"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full text-right border-b border-gray-200 focus:border-blue-500 outline-none print:border-none"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full text-right border-b border-gray-200 focus:border-blue-500 outline-none print:border-none"
                    />
                  </td>
                  <td className="p-3 text-right font-semibold">
                    LKR {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 print:hidden">
                    {invoice.items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between items-center bg-gray-800 text-white p-4 rounded">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-xl">
                  LKR {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-300 pt-6">
            <p className="text-center italic mb-4 text-gray-600">
              Thank you come again :)
            </p>
            <p className="text-center font-bold text-lg mb-4 text-blue-600">
              The Golf Mark Of Printing Art
            </p>
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-bold mb-2">Terms:</p>
              <textarea
                value={invoice.terms}
                onChange={(e) => setInvoice({ ...invoice, terms: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-sm print:border-none print:bg-transparent"
                rows={3}
              />
              <p className="text-sm mt-2 font-semibold">{invoice.companyInfo.bank}</p>
              <p className="text-sm font-semibold">{invoice.companyInfo.name}</p>
              <p className="text-sm">A/C - {invoice.companyInfo.accountNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice, #invoice * {
            visibility: visible;
          }
          #invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
