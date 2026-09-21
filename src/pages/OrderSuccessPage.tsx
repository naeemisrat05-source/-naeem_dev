import React, { useState } from 'react';
import { CheckCircle2, Package, Printer, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';
import { InvoiceModal } from '../components/invoice/InvoiceModal';

interface OrderSuccessPageProps {
  order: Order | null;
  onNavigate: (path: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ order, onNavigate }) => {
  const { language, t } = useStore();
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
        <h1 className="text-2xl font-bold">{t('orderConfirmed')}</h1>
        <p className="text-stone-500 text-sm">{t('orderSuccessNotice')}</p>
        <button
          onClick={() => onNavigate('/shop')}
          className="mt-4 px-6 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-sm"
        >
          {t('startShopping')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Success Badge Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
          {t('orderConfirmed')}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          {t('orderSuccessNotice')}
        </p>
      </div>

      {/* Main Order Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 dark:border-stone-800 gap-3">
          <div>
            <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">
              {t('orderNumber')}
            </span>
            <p className="font-mono font-black text-lg text-teal-700 dark:text-teal-400">
              {order.orderNumber}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setInvoiceOpen(true)}
              className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{t('printInvoice')}</span>
            </button>
            <button
              onClick={() => onNavigate(`/track-order?id=${order.orderNumber}`)}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Package className="w-4 h-4" />
              <span>{t('trackOrder')}</span>
            </button>
          </div>
        </div>

        {/* Customer & Address Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 space-y-1">
            <p className="font-bold text-stone-400 uppercase text-[10px]">{t('shippingAddress')}</p>
            <p className="font-bold text-stone-800 dark:text-stone-200">{order.customerName}</p>
            <p className="text-stone-600 dark:text-stone-400">{order.customerPhone}</p>
            <p className="text-stone-600 dark:text-stone-400">{order.shippingAddress.fullAddress}</p>
            <p className="text-stone-600 dark:text-stone-400">
              {order.shippingAddress.upazila}, {order.shippingAddress.district}, {order.shippingAddress.division}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 space-y-1">
            <p className="font-bold text-stone-400 uppercase text-[10px]">{t('paymentMethods')}</p>
            <p className="font-bold text-stone-800 dark:text-stone-200 uppercase">
              {order.paymentMethod}
            </p>
            <p className="text-stone-600 dark:text-stone-400">
              Status: <span className="font-semibold text-teal-600">{order.paymentStatus}</span>
            </p>
            <p className="text-stone-600 dark:text-stone-400">
              Shipping: <span className="font-semibold">{order.shippingMethod || order.shippingMethodId}</span>
            </p>
          </div>
        </div>

        {/* Ordered Items */}
        <div className="space-y-3 pt-2">
          <h4 className="font-bold text-xs uppercase text-stone-400">{t('itemsInOrder')}</h4>
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 bg-stone-100 dark:bg-stone-800"
                  />
                  <div>
                    <p className="font-semibold text-stone-900 dark:text-stone-100 line-clamp-1">
                      {language === 'bn' ? item.nameBn : item.name}
                    </p>
                    <p className="text-stone-400">
                      Qty: {item.quantity} {item.variantName && `• ${item.variantName}`}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                  ৳{item.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Price Bar */}
        <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-500/30 flex items-center justify-between text-sm">
          <span className="font-bold text-teal-900 dark:text-teal-200">{t('grandTotal')}:</span>
          <span className="font-mono font-black text-lg text-teal-700 dark:text-teal-400">
            ৳{order.total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="text-center pt-2">
        <button
          onClick={() => onNavigate('/shop')}
          className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
        >
          <span>{t('continueShopping')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Printable Invoice Modal */}
      <InvoiceModal
        order={order}
        isOpen={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
      />
    </div>
  );
};
