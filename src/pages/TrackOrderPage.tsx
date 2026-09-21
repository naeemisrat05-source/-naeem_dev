import React, { useState, useEffect } from 'react';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Printer,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useStore } from '../context/StoreContext';
import { ShopBDStore } from '../lib/firebase/store';
import { InvoiceModal } from '../components/invoice/InvoiceModal';

interface TrackOrderPageProps {
  initialOrderId?: string;
  onNavigate: (path: string) => void;
}

const ALL_STAGES: { status: OrderStatus; labelEn: string; labelBn: string; desc: string }[] = [
  { status: 'Confirmed', labelEn: 'Order Confirmed', labelBn: 'অর্ডার নিশ্চিত', desc: 'Order received and verified.' },
  { status: 'Processing', labelEn: 'Processing', labelBn: 'প্রক্রিয়াকরণ চলছে', desc: 'Items checked from central Dhaka warehouse.' },
  { status: 'Packed', labelEn: 'Packed', labelBn: 'প্যাকেজিং সম্পন্ন', desc: 'Security bubble wrapped with fragile seal.' },
  { status: 'Shipped', labelEn: 'Shipped', labelBn: 'শিপিং হ্যান্ডওভার', desc: 'Dispatched with courier logistics partner.' },
  { status: 'Out for Delivery', labelEn: 'Out for Delivery', labelBn: 'ডেলিভারির পথে', desc: 'Rider is en route to your shipping location.' },
  { status: 'Delivered', labelEn: 'Delivered', labelBn: 'সফলভাবে ডেলিভার্ড', desc: 'Package handed over to recipient.' },
];

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ initialOrderId = '', onNavigate }) => {
  const { language, t } = useStore();
  const [searchQuery, setSearchQuery] = useState<string>(initialOrderId);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [invoiceOpen, setInvoiceOpen] = useState<boolean>(false);

  const fetchOrder = async (queryStr: string) => {
    if (!queryStr.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const found = await ShopBDStore.getOrderById(queryStr.trim());
      setOrder(found);
    } catch (e) {
      console.warn('Track order fetch error:', e);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      fetchOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(searchQuery);
  };

  // Determine stage progress
  const getStageIndex = (status: OrderStatus) => {
    if (status === 'Cancelled' || status === 'Returned') return -1;
    return ALL_STAGES.findIndex((s) => s.status === status);
  };

  const currentStageIndex = order ? getStageIndex(order.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 pt-4">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
          {t('trackOrderTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          {t('trackOrderSub')}
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('enterOrderId')}
            required
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm font-mono focus:outline-hidden focus:border-teal-500 shadow-sm"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <button
          type="submit"
          disabled={loading || !searchQuery.trim()}
          className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
        >
          {loading ? '...' : t('trackButton')}
        </button>
      </form>

      {/* Result Card */}
      {order ? (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-8 shadow-sm animate-in fade-in-50">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 dark:border-stone-800 gap-4">
            <div>
              <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">
                {t('orderNumber')}
              </span>
              <p className="font-mono font-black text-xl text-teal-700 dark:text-teal-400">
                {order.orderNumber}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  order.status === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : order.status === 'Cancelled'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
                }`}
              >
                ● {order.status}
              </span>

              <button
                onClick={() => setInvoiceOpen(true)}
                className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5"
                title={t('printInvoice')}
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">{t('invoice')}</span>
              </button>
            </div>
          </div>

          {/* Interactive Timeline Progress */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              {language === 'bn' ? 'ডেলিভারি ট্র্যাকিং স্ট্যাটাস' : 'Delivery Tracking Progress'}
            </h3>

            {/* Step indicators */}
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-700">
              {ALL_STAGES.map((stage, idx) => {
                const isPassed = currentStageIndex >= idx;
                const isCurrent = currentStageIndex === idx;

                return (
                  <div key={stage.status} className="relative flex items-start gap-4">
                    {/* Circle icon */}
                    <div
                      className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isPassed
                          ? 'bg-teal-600 text-white ring-4 ring-teal-100 dark:ring-teal-950'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-bold ${
                            isCurrent
                              ? 'text-teal-700 dark:text-teal-400'
                              : isPassed
                              ? 'text-stone-900 dark:text-stone-100'
                              : 'text-stone-400'
                          }`}
                        >
                          {language === 'bn' ? stage.labelBn : stage.labelEn}
                        </p>
                        {isCurrent && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 animate-pulse">
                            Current Stage
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500">{stage.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier & Shipping Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-stone-100 dark:border-stone-800 text-xs">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 space-y-1">
              <span className="font-bold text-stone-400 uppercase text-[10px]">
                {t('courierPartner')}
              </span>
              <p className="font-bold text-stone-900 dark:text-stone-100">
                {order.courierPartner || 'Steadfast Courier / Pathao Express'}
              </p>
              <p className="text-stone-500 font-mono">
                AWB: {order.trackingNumber || `BD-${order.orderNumber.slice(-6)}`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 space-y-1">
              <span className="font-bold text-stone-400 uppercase text-[10px]">
                {t('deliveryAddress')}
              </span>
              <p className="font-bold text-stone-900 dark:text-stone-100">{order.customerName}</p>
              <p className="text-stone-500 truncate">{order.shippingAddress.fullAddress}</p>
              <p className="text-stone-500">{order.shippingAddress.district}, {order.shippingAddress.division}</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 space-y-1">
              <span className="font-bold text-stone-400 uppercase text-[10px]">
                {t('paymentStatus')}
              </span>
              <p className="font-bold text-stone-900 dark:text-stone-100 uppercase">
                {order.paymentMethod}
              </p>
              <p className="text-stone-500">
                Payment: <span className="font-semibold text-teal-600">{order.paymentStatus}</span>
              </p>
              <p className="font-mono font-bold text-teal-700 dark:text-teal-400">
                Total: ৳{order.total.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ) : searched && !loading ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-3">
          <Package className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
            {t('noOrderFound')}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Please check the Order ID format (e.g. SBD-20260921-XXXX). You can view your recent orders from your customer account dashboard.
          </p>
          <button
            onClick={() => onNavigate('/account/orders')}
            className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs"
          >
            {t('myOrders')}
          </button>
        </div>
      ) : null}

      {order && (
        <InvoiceModal
          order={order}
          isOpen={invoiceOpen}
          onClose={() => setInvoiceOpen(false)}
        />
      )}
    </div>
  );
};
