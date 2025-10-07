import React, { useRef } from "react";
import { Download, X } from "lucide-react";
import html2pdf from "html2pdf.js";
import type { Order } from "../types/order";

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}


const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    if (!printRef.current) return;

    const opt = {
      margin: 0.2,
      filename: `Invoice-${order._id?.slice(-6) || "000000"}.pdf`,
      image: { type: "jpeg" as "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" as "portrait" },
    };

    html2pdf().set(opt).from(printRef.current).save();
  };

  const totalAmount = order.totalAmount || 0;
  const paidAmount = order.paidAmount || 0;
  const balanceDue = totalAmount - paidAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with actions */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Invoice Preview</h2>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Download size={18} /> Download PDF
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Invoice Layout */}
        <div className="p-8" ref={printRef}>
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b pb-4 mb-6">
            <div className="flex items-center gap-4">
              <img src="/images/logo.jpg" alt="DP Logo" className="w-24 h-24 object-contain" />
              <div>
                <h1 className="text-4xl font-bold">INVOICE</h1>
                <p className="text-gray-600"># {order._id?.slice(-6) || "000000"}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="font-bold text-lg">DP-COMMUNICATION</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                No. 40/55,{"\n"}Bomaluwa Road,{"\n"}Nivithigala,{"\n"}Rathnapura.
              </p>
              <p className="text-sm text-gray-600">📞 0713856863</p>
            </div>
          </div>

          {/* Bill To + Details */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="text-left">
              <p className="font-bold text-gray-600 text-sm">Bill To:</p>
              <p className="text-lg font-semibold">{order.customerName}</p>
              <p className="text-sm text-gray-600">📞 {order.customerPhone}</p>
            </div>
        <div className="text-right mb-6">
            <div className="text-sm space-y-1">
              <p><strong>Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</p>
              <p><strong>Payment Terms:</strong> Cash / Cheque</p>
              <p><strong>Balance Due:</strong> LKR {order.balanceAmount?.toFixed(2)}</p>
            </div>
          </div>
        </div>

          {/* Items Table */}
          <table className="w-full border border-gray-300 mb-6">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border text-left">Item</th>
                <th className="p-2 border text-center">Quantity</th>
                <th className="p-2 border text-right">Rate</th>
                <th className="p-2 border text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i}>
                  <td className="p-2 border">{item.itemName}</td>
                  <td className="p-2 border text-center">{item.quantity}</td>
                  <td className="p-2 border text-right">LKR {item.price.toFixed(2)}</td>
                  <td className="p-2 border text-right font-semibold">LKR {item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="grid grid-cols-2 gap-2 w-64">
              <div className="flex justify-between">
                <span className="font-semibold">Total:</span>
                <span className="font-bold">LKR {totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Paid:</span>
                <span className="font-bold">LKR {paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Balance Due:</span>
                <span className="font-bold">LKR {balanceDue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-left mb-6">
            <div className="bg-gray-50 p-3 mt-3 rounded">
              <p className="font-semibold">Terms:</p>
              <p className="text-xs text-gray-700">All Cheques should be drawn in favour of "DP COMMUNICATION"</p>
              <p className="text-xs mt-2 font-bold">Bank Payee: BOC - Nivithigala</p>
              <p className="text-xs">DP COMMUNICATION</p>
              <p className="text-xs font-bold">A/C - 94941383</p>
              <br />
              <p className="text-xs">______________________</p>
              <p className="text-xs">Director Signature / Stamp</p>
            </div>
          </div>
          <div className="border-t pt-4 text-center text-sm text-gray-600">
            <p className="italic">Thank you come again :)</p>
            <p className="font-ultrabold text-blue-600">The Gold Mark Of Printing Art</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;

//invoice modal updated
