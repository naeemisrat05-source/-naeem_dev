import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { Order } from '../../types';
import { useStore } from '../../context/StoreContext';

interface InvoiceModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose }) => {
  const { language, t } = useStore();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-stone-900/70 backdrop-blur-xs no-print" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white text-stone-900 rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Actions Bar */}
        <div className="p-4 bg-stone-100 border-b border-stone-200 flex items-center justify-between no-print">
          <span className="font-bold text-sm text-stone-700">
            {language === 'bn' ? 'অর্ডার মেমো / ইনভয়েস' : 'Order Invoice'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('printInvoice')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-500 hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-xs sm:text-sm font-sans" id="printable-invoice">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-stone-200 pb-6 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-800 flex items-center justify-center text-white font-black text-xl">
                <span>S</span>
                <span className="text-orange-400 font-bold text-sm">BD</span>
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-teal-900">ShopBD</h1>
                <p className="text-[11px] text-stone-500">Shop Smart. Live Better.</p>
                <p className="text-[11px] text-stone-500">House 42, Road 11, Banani, Dhaka-1213</p>
                <p className="text-[11px] text-stone-500">Hotline: +880 9612-345678</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-teal-50 text-teal-800 font-bold text-xs uppercase tracking-wider mb-1">
                INVOICE / বিল
              </span>
              <p className="font-mono font-bold text-sm text-stone-900">{order.orderNumber}</p>
              <p className="text-xs text-stone-500">
                {new Date(order.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <div className="mt-1 flex items-center justify-end gap-1 text-emerald-700 font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{order.status}</span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-2 gap-6 bg-stone-50 p-4 rounded-2xl mb-6">
            <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">
                {language === 'bn' ? 'বিলিং ও ডেলিভারি প্রাপক' : 'Billed & Shipped To'}
              </p>
              <p className="font-bold text-stone-900">{order.customerName}</p>
              <p className="text-stone-600">{order.customerPhone}</p>
              <p className="text-stone-600">{order.shippingAddress.fullAddress}</p>
              <p className="text-stone-600">
                {order.shippingAddress.upazila}, {order.shippingAddress.district},{' '}
                {order.shippingAddress.division}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">
                {language === 'bn' ? 'পেমেন্ট ও শিপিং' : 'Payment & Shipping'}
              </p>
              <p className="font-semibold text-stone-800">
                Method: <span className="uppercase text-teal-800 font-bold">{order.paymentMethod}</span>
              </p>
              <p className="text-stone-600">
                Payment Status:{' '}
                <span className={`font-semibold ${order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {order.paymentStatus}
                </span>
              </p>
              <p className="text-stone-600">Country: Bangladesh</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left border-collapse mb-6">
            <thead>
              <tr className="border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase">
                <th className="py-2.5">Item Description</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Unit Price</th>
                <th className="py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {order.items.map((item, idx) => (
                <tr key={idx} className="text-stone-800">
                  <td className="py-2.5">
                    <p className="font-semibold">{item.name}</p>
                    {item.variantName && (
                      <p className="text-[11px] text-stone-400">Variant: {item.variantName}</p>
                    )}
                    <p className="text-[10px] text-stone-400 font-mono">SKU: {item.sku}</p>
                  </td>
                  <td className="py-2.5 text-center font-medium">{item.quantity}</td>
                  <td className="py-2.5 text-right">৳{item.price.toLocaleString()}</td>
                  <td className="py-2.5 text-right font-semibold">৳{item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-1.5 text-xs text-stone-600 border-t border-stone-200 pt-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-stone-900">৳{order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Coupon Discount:</span>
                  <span>-৳{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Charge:</span>
                <span className="font-semibold text-stone-900">
                  {order.shippingCost === 0 ? 'FREE' : `৳${order.shippingCost.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-teal-900 border-t border-stone-300 pt-2">
                <span>Total Amount:</span>
                <span>৳{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-4 border-t border-stone-100 text-[11px] text-stone-400">
            <p>Thank you for shopping with ShopBD. For warranty or returns, contact support@shopbd.com</p>
            <p className="font-medium mt-0.5">Shop Smart. Live Better. Bangladesh</p>
          </div>
        </div>
      </div>
    </div>
  );
};
