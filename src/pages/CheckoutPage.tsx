import React, { useState } from 'react';
import {
  Truck,
  CreditCard,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Banknote,
  Smartphone,
  Info,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { bangladeshDivisions, getDistrictsByDivision } from '../data/bangladeshData';
import { BangladeshAddress, Order, PaymentMethod, ShippingMethod } from '../types';
import { ShopBDStore } from '../lib/firebase/store';

interface CheckoutPageProps {
  onNavigate: (path: string) => void;
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderPlaced }) => {
  const {
    cart,
    clearCart,
    cartSubtotal,
    appliedCoupon,
    discountAmount,
    availableShippingMethods,
    shippingMethod,
    setShippingMethod,
    calculatedShippingCost,
    orderGrandTotal,
    language,
    t,
    showToast,
  } = useStore();

  const { user } = useAuth();

  // Form State
  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const [recipientName, setRecipientName] = useState(defaultAddr?.recipientName || user?.name || '');
  const [phone, setPhone] = useState(defaultAddr?.phone || user?.phone || '');
  const [division, setDivision] = useState(defaultAddr?.division || 'Dhaka');
  const [district, setDistrict] = useState(defaultAddr?.district || 'Dhaka (City & Suburbs)');
  const [upazila, setUpazila] = useState(defaultAddr?.upazila || '');
  const [fullAddress, setFullAddress] = useState(defaultAddr?.fullAddress || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [mfsNumber, setMfsNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available districts based on division
  const availableDistricts = getDistrictsByDivision(division);

  const handleDivisionChange = (newDiv: string) => {
    setDivision(newDiv);
    const dists = getDistrictsByDivision(newDiv);
    if (dists.length > 0) {
      setDistrict(dists[0]);
    }
    // Auto adjust shipping method based on Dhaka vs outside
    if (newDiv === 'Dhaka') {
      const inside = availableShippingMethods.find((m) => m.id === 'inside_dhaka');
      if (inside) setShippingMethod(inside);
    } else {
      const outside = availableShippingMethods.find((m) => m.id === 'outside_dhaka');
      if (outside) setShippingMethod(outside);
    }
  };

  const validatePhone = (p: string) => {
    const clean = p.replace(/[^0-9]/g, '');
    return clean.length >= 11;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      showToast(language === 'bn' ? 'আপনার কার্ট খালি!' : 'Your cart is empty!', 'error');
      onNavigate('/shop');
      return;
    }

    if (!recipientName.trim()) {
      showToast(language === 'bn' ? 'প্রাপকের নাম প্রদান করুন' : 'Please provide recipient name', 'error');
      return;
    }

    if (!validatePhone(phone)) {
      showToast(
        language === 'bn'
          ? 'সঠিক বাংলাদেশি মোবাইল নম্বর প্রদান করুন (যেমন: 01712345678)'
          : 'Please enter a valid 11-digit Bangladesh phone number',
        'error'
      );
      return;
    }

    if (!fullAddress.trim()) {
      showToast(
        language === 'bn' ? 'বিস্তারিত ঠিকানা প্রদান করুন' : 'Please provide detailed delivery address',
        'error'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate Order Number
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randHex = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `SBD-${dateStr}-${randHex}`;

      const shippingAddress: BangladeshAddress = {
        id: 'addr_' + Date.now(),
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        division,
        district,
        upazila: upazila.trim() || district,
        fullAddress: fullAddress.trim(),
      };

      const newOrder: Order = {
        id: 'ord_' + Date.now() + '_' + randHex,
        orderNumber,
        userId: user?.uid || 'guest_' + Date.now(),
        customerName: recipientName.trim(),
        customerEmail: user?.email || 'guest@shopbd.com',
        customerPhone: phone.trim(),
        shippingAddress,
        items: cart.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          variantName: i.variantName,
          name: i.name,
          nameBn: i.nameBn,
          sku: i.sku,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
          total: i.price * i.quantity,
        })),
        subtotal: cartSubtotal,
        discount: discountAmount,
        couponCode: appliedCoupon?.code,
        shippingCost: calculatedShippingCost,
        shippingMethod: shippingMethod.name,
        total: orderGrandTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
        status: 'Confirmed',
        notes: deliveryNotes.trim() || undefined,
        trackingTimeline: [
          {
            status: 'Confirmed',
            timestamp: new Date().toISOString(),
            note: 'Order successfully placed and verified in ShopBD system.',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save Order
      await ShopBDStore.createOrder(newOrder);

      // Clear Cart
      clearCart();

      // Notify and navigate
      showToast(
        language === 'bn' ? 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে!' : 'Order placed successfully!',
        'success'
      );

      onOrderPlaced(newOrder);
      onNavigate(`/order-success?id=${newOrder.orderNumber}`);
    } catch (err) {
      console.error('Order placement error:', err);
      showToast(
        language === 'bn'
          ? 'অর্ডার প্রক্রিয়া করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
          : 'Failed to place order. Please try again.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
      {/* Back button & Title */}
      <div className="flex items-center gap-3 pt-3">
        <button
          onClick={() => onNavigate('/cart')}
          className="p-2 rounded-xl text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
            {t('checkout')}
          </h1>
          <p className="text-xs text-stone-500">{t('bangladeshDeliveryNotice')}</p>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery Address + Shipping + Payment (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: Bangladesh Delivery Address */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h2 className="text-lg font-black text-stone-900 dark:text-white">
                {t('shippingAddress')}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {t('recipientName')} *
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Arifur Rahman"
                  required
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {t('phone')} (11 digits) *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  required
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 font-mono focus:outline-hidden focus:border-teal-500"
                />
              </div>

              {/* Division */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {t('division')} *
                </label>
                <select
                  value={division}
                  onChange={(e) => handleDivisionChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-teal-500 font-medium"
                >
                  {bangladeshDivisions.map((div) => (
                    <option key={div.id} value={div.name}>
                      {language === 'bn' ? div.nameBn : div.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {t('district')} *
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-teal-500 font-medium"
                >
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upazila / Thana */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {t('upazila')} / Thana / Area
                </label>
                <input
                  type="text"
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  placeholder="e.g. Dhanmondi, Gulshan, Mirpur, or Sadar Upazila"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              {/* Full Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {t('fullAddress')} (House, Road, Block, Sector) *
                </label>
                <textarea
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  placeholder="e.g. House #24, Road #11, Block D, Banani, Dhaka"
                  required
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              {/* Delivery Notes */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {t('orderNotes')}
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Special instructions for courier delivery person..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Shipping Method */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h2 className="text-lg font-black text-stone-900 dark:text-white">
                {t('deliveryCharge')}
              </h2>
            </div>

            <div className="space-y-3">
              {availableShippingMethods.map((m) => {
                const isSelected = shippingMethod.id === m.id;
                return (
                  <label
                    key={m.id}
                    onClick={() => setShippingMethod(m)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/30'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={isSelected}
                        onChange={() => setShippingMethod(m)}
                        className="w-4 h-4 text-teal-600 accent-teal-600"
                      />
                      <div>
                        <p className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                          {language === 'bn' ? m.nameBn : m.name}
                        </p>
                        <p className="text-[11px] text-stone-500">
                          {t('estimatedDelivery')}: {language === 'bn' ? m.estimatedDaysBn : m.estimatedDays}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold font-mono text-sm text-teal-700 dark:text-teal-400">
                      ৳{m.charge}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 3: Bangladeshi Payment Methods */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h2 className="text-lg font-black text-stone-900 dark:text-white">
                {t('paymentMethods')}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cash on Delivery */}
              <label
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col gap-2 transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/30'
                    : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                      {t('cod')}
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-teal-600"
                  />
                </div>
                <p className="text-[11px] text-stone-500 leading-snug">
                  {language === 'bn'
                    ? 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন। সারা বাংলাদেশে প্রযোজ্য।'
                    : 'Pay in cash upon doorstep delivery across all 64 districts.'}
                </p>
              </label>

              {/* bKash */}
              <label
                onClick={() => setPaymentMethod('bkash')}
                className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col gap-2 transition-all ${
                  paymentMethod === 'bkash'
                    ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/30'
                    : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-rose-600" />
                    <span className="font-bold text-xs sm:text-sm text-rose-700 dark:text-rose-400">
                      bKash (বিকাশ)
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => setPaymentMethod('bkash')}
                    className="accent-rose-600"
                  />
                </div>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Instant mobile wallet payment. Fast refund guarantee.
                </p>
              </label>

              {/* Nagad */}
              <label
                onClick={() => setPaymentMethod('nagad')}
                className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col gap-2 transition-all ${
                  paymentMethod === 'nagad'
                    ? 'border-orange-600 bg-orange-50/50 dark:bg-orange-950/30'
                    : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-orange-600" />
                    <span className="font-bold text-xs sm:text-sm text-orange-700 dark:text-orange-400">
                      Nagad (নগদ)
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'nagad'}
                    onChange={() => setPaymentMethod('nagad')}
                    className="accent-orange-600"
                  />
                </div>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Bangladesh Post Office digital mobile financial service.
                </p>
              </label>

              {/* Rocket */}
              <label
                onClick={() => setPaymentMethod('rocket')}
                className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col gap-2 transition-all ${
                  paymentMethod === 'rocket'
                    ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30'
                    : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-xs sm:text-sm text-purple-700 dark:text-purple-400">
                      Rocket (DBBL)
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'rocket'}
                    onChange={() => setPaymentMethod('rocket')}
                    className="accent-purple-600"
                  />
                </div>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Dutch-Bangla Bank Rocket mobile banking.
                </p>
              </label>

              {/* SSLCommerz Cards */}
              <label
                onClick={() => setPaymentMethod('sslcommerz')}
                className={`sm:col-span-2 p-4 rounded-2xl border-2 cursor-pointer flex flex-col gap-2 transition-all ${
                  paymentMethod === 'sslcommerz'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                    : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                      SSLCommerz / Visa / MasterCard / Amex
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'sslcommerz'}
                    onChange={() => setPaymentMethod('sslcommerz')}
                    className="accent-blue-600"
                  />
                </div>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Securely pay via any Bangladeshi or international debit/credit card or internet banking.
                </p>
              </label>
            </div>

            {/* MFS Details Prompt if bKash / Nagad / Rocket */}
            {(paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') && (
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3 animate-in fade-in-50 text-xs">
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold">
                  <Info className="w-4 h-4" />
                  <span>
                    {paymentMethod.toUpperCase()} Merchant Number: 01911-000000 (Merchant)
                  </span>
                </div>
                <p className="text-stone-500">
                  {language === 'bn'
                    ? 'আপনার ওয়ালেট থেকে "Make Payment" অপশন ব্যবহার করুন অথবা অর্ডার নিশ্চিত হলে সাথে সাথে এসএমএস নির্দেশনা পাবেন।'
                    : 'Use "Make Payment" in your app, or enter your number below for immediate automated verification.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <input
                    type="tel"
                    value={mfsNumber}
                    onChange={(e) => setMfsNumber(e.target.value)}
                    placeholder="Your MFS Wallet Number (e.g. 017XXXXXXXX)"
                    className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono text-xs"
                  />
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Transaction ID / TrxID (optional)"
                    className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono text-xs uppercase"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Review & Place Order Button (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-black text-stone-900 dark:text-white tracking-tight pb-3 border-b border-stone-100 dark:border-stone-800">
              {t('orderSummary')}
            </h3>

            {/* Item Previews */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1 divide-y divide-stone-100 dark:divide-stone-800">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.variantId || ''}`} className="flex items-center gap-3 pt-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 bg-stone-100 dark:bg-stone-800 border"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                      {language === 'bn' ? item.nameBn : item.name}
                    </p>
                    <p className="text-stone-400">
                      Qty: {item.quantity} {item.variantName && `• ${item.variantName}`}
                    </p>
                  </div>
                  <span className="font-bold text-xs font-mono text-stone-800 dark:text-stone-200">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs text-stone-600 dark:text-stone-300 pt-3 border-t border-stone-100 dark:border-stone-800">
              <div className="flex justify-between">
                <span>{t('subtotal')}</span>
                <span className="font-mono font-bold text-stone-900 dark:text-white">
                  ৳{cartSubtotal.toLocaleString()}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 dark:text-rose-400 font-medium">
                  <span>{t('discount')} ({appliedCoupon?.code})</span>
                  <span className="font-mono font-bold">-৳{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>{t('deliveryCharge')}</span>
                <span className="font-mono font-bold text-stone-900 dark:text-white">
                  {calculatedShippingCost === 0 ? 'FREE' : `৳${calculatedShippingCost}`}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-stone-900 dark:text-white pt-3 border-t border-stone-200 dark:border-stone-800">
                <span>{t('grandTotal')}</span>
                <span className="font-mono text-teal-700 dark:text-teal-400">
                  ৳{orderGrandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-sm tracking-wide uppercase shadow-lg shadow-teal-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? t('processing') : t('placeOrder')}</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>100% Encrypted & Safe Transaction</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
