import React, { useState } from 'react';
import { Trash2, ArrowRight, ShoppingBag, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CartPageProps {
  onNavigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    shippingMethod,
    calculatedShippingCost,
    orderGrandTotal,
    language,
    t,
    showToast,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplying(true);
    setCouponError('');
    const res = await applyCoupon(couponInput.trim());
    setApplying(false);
    if (!res.success) {
      setCouponError(res.message);
      showToast(res.message, 'error');
    } else {
      setCouponInput('');
      showToast(res.message, 'success');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto text-stone-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">{t('emptyCart')}</h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
          {language === 'bn'
            ? 'আপনার কার্টে এখনো কোনো পণ্য যোগ করেননি। চমৎকার সব পণ্য দেখতে শপিং শুরু করুন।'
            : 'You haven\'t added any items to your shopping cart yet.'}
        </p>
        <button
          onClick={() => onNavigate('/shop')}
          className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
        >
          <span>{t('startShopping')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
      <div className="py-4 border-b border-stone-200 dark:border-stone-800">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
          {t('shoppingCart')} ({cart.reduce((a, b) => a + b.quantity, 0)})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items Table/List (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="divide-y divide-stone-100 dark:divide-stone-800 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
            {cart.map((item) => (
              <div
                key={`${item.productId}-${item.variantId || 'base'}`}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                />

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 truncate">
                    {language === 'bn' ? item.nameBn : item.name}
                  </h3>
                  {item.variantName && (
                    <p className="text-xs text-stone-500">
                      Variant: <span className="font-semibold text-teal-600">{item.variantName}</span>
                    </p>
                  )}
                  <p className="text-xs font-mono text-stone-400">SKU: {item.sku}</p>

                  <div className="pt-1 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-teal-700 dark:text-teal-400 font-mono">
                      ৳{item.price.toLocaleString()}
                    </span>
                    {item.originalPrice && (
                      <span className="text-xs text-stone-400 line-through font-mono">
                        ৳{item.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Stepper & Subtotal */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-stone-100 dark:border-stone-800">
                  <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-xl bg-stone-50 dark:bg-stone-800 overflow-hidden text-xs">
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity - 1, item.variantId)}
                      className="px-2.5 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 font-bold font-mono text-stone-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1, item.variantId)}
                      disabled={item.quantity >= item.maxStock}
                      className="px-2.5 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <span className="text-sm font-black text-stone-900 dark:text-stone-100 font-mono">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId, item.variantId)}
                    className="p-2 text-stone-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                    title={t('remove')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onNavigate('/shop')}
              className="text-xs font-bold text-teal-600 hover:underline"
            >
              ← {t('continueShopping')}
            </button>
          </div>
        </div>

        {/* Order Summary (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-6 shadow-sm">
            <h2 className="text-lg font-black text-stone-900 dark:text-white tracking-tight pb-3 border-b border-stone-100 dark:border-stone-800">
              {t('orderSummary')}
            </h2>

            {/* Coupon Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-teal-600" />
                <span>{t('couponCode')}</span>
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-500/40 text-xs">
                  <div>
                    <span className="font-bold text-teal-800 dark:text-teal-300">
                      {appliedCoupon.code}
                    </span>
                    <p className="text-[11px] text-teal-600">
                      {appliedCoupon.type === 'percentage'
                        ? `${appliedCoupon.value}% Discount Applied`
                        : `৳${appliedCoupon.value} Discount Applied`}
                    </p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    {t('removeCoupon')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder={t('enterCoupon')}
                      className="flex-1 px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs uppercase font-mono tracking-wider focus:outline-hidden focus:border-teal-500"
                    />
                    <button
                      type="submit"
                      disabled={applying || !couponInput.trim()}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
                    >
                      {applying ? '...' : t('applyCoupon')}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {couponError}
                    </p>
                  )}
                  <p className="text-[10px] text-stone-400">
                    Try <span className="font-mono font-bold text-teal-600">SHOPBD10</span> or <span className="font-mono font-bold text-teal-600">WELCOME50</span>
                  </p>
                </form>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 text-xs text-stone-600 dark:text-stone-300 pt-3 border-t border-stone-100 dark:border-stone-800">
              <div className="flex justify-between">
                <span>{t('subtotal')}</span>
                <span className="font-mono font-bold text-stone-900 dark:text-white">
                  ৳{cartSubtotal.toLocaleString()}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 dark:text-rose-400 font-medium">
                  <span>{t('discount')}</span>
                  <span className="font-mono font-bold">-৳{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>{t('deliveryCharge')} ({language === 'bn' ? shippingMethod.nameBn : shippingMethod.name})</span>
                <span className="font-mono font-bold text-stone-900 dark:text-white">
                  {calculatedShippingCost === 0 ? (
                    <span className="text-emerald-600 font-bold">{t('freeDeliveryBadge')}</span>
                  ) : (
                    `৳${calculatedShippingCost}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-stone-900 dark:text-white pt-3 border-t border-stone-200 dark:border-stone-800">
                <span>{t('total')}</span>
                <span className="font-mono text-teal-700 dark:text-teal-400">
                  ৳{orderGrandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Proceed to Checkout */}
            <button
              onClick={() => onNavigate('/checkout')}
              className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{t('proceedToCheckout')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
