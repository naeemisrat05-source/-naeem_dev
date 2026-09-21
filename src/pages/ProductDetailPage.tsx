import React, { useState, useEffect } from 'react';
import {
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  Check,
  Share2,
  ChevronRight,
  Send,
  UserCheck,
} from 'lucide-react';
import { Product, ProductVariant, Review } from '../types';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ShopBDStore } from '../lib/firebase/store';
import { ProductCard } from '../components/common/ProductCard';

interface ProductDetailPageProps {
  slug?: string;
  productId?: string;
  onNavigate: (path: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, productId, onNavigate }) => {
  const { products, loadingCatalog, language, t, addToCart, toggleWishlist, isWishlisted, showToast } = useStore();
  const { user } = useAuth();

  const lookupKey = productId || slug;
  const product = products.find((p) => p.id === lookupKey || p.slug === lookupKey) || (products.length > 0 ? products[0] : null);

  const [activeImage, setActiveImage] = useState<string>(product?.thumbnail || product?.images?.[0] || '');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product?.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>(user?.name || '');

  useEffect(() => {
    if (product) {
      setActiveImage(product.thumbnail || product.images?.[0] || '');
      setSelectedVariant(product.variants && product.variants.length > 0 ? product.variants[0] : null);
      setQuantity(1);
      // Load reviews
      ShopBDStore.getReviews(product.id).then((r) => setReviews(r));
    }
  }, [product]);

  if (loadingCatalog && !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent mb-4"></div>
        <p className="text-stone-500 text-sm font-medium">
          {language === 'bn' ? 'পণ্য লোড হচ্ছে...' : 'Loading product details...'}
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold">{t('productNotFound')}</h2>
        <button
          onClick={() => onNavigate('/shop')}
          className="mt-4 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-sm"
        >
          {t('backToShop')}
        </button>
      </div>
    );
  }

  const title = language === 'bn' ? product.nameBn || product.name : product.name;
  const description = language === 'bn' ? product.descriptionBn || product.description : product.description;

  const currentPrice = selectedVariant
    ? selectedVariant.price
    : product.discountPrice || product.price;

  const originalPrice = selectedVariant
    ? undefined
    : product.discountPrice
    ? product.price
    : undefined;

  const maxStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;
  const isOutOfStock = maxStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedVariant?.id);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedVariant?.id);
    onNavigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast(language === 'bn' ? 'লিংক কপি করা হয়েছে!' : 'Link copied to clipboard!', 'success');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const rev: Review = {
      id: 'rev_' + Date.now(),
      productId: product.id,
      userId: user?.uid || 'guest_' + Date.now(),
      userName: authorName.trim() || (user ? user.name : 'Satisfied Customer'),
      rating: newRating,
      comment: newComment.trim(),
      verifiedPurchase: true,
      createdAt: new Date().toISOString(),
    };

    await ShopBDStore.addReview(rev);
    setReviews((prev) => [rev, ...prev]);
    setNewComment('');
    showToast(
      language === 'bn' ? 'মতামত সফলভাবে গ্রহণ করা হয়েছে!' : 'Review submitted successfully!',
      'success'
    );
  };

  const productCat = product.categoryId || product.category || '';
  const relatedProducts = products
    .filter((p) => (p.categoryId === productCat || p.category === productCat) && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500 pt-3">
        <button onClick={() => onNavigate('/')} className="hover:text-teal-600">
          {t('home')}
        </button>
        <ChevronRight className="w-3 h-3 text-stone-400" />
        <button onClick={() => onNavigate('/shop')} className="hover:text-teal-600">
          {t('shop')}
        </button>
        <ChevronRight className="w-3 h-3 text-stone-400" />
        <button
          onClick={() => onNavigate(`/shop?category=${productCat}`)}
          className="hover:text-teal-600 capitalize"
        >
          {product.category || product.categoryId || 'General'}
        </button>
        <ChevronRight className="w-3 h-3 text-stone-400" />
        <span className="text-stone-900 dark:text-stone-100 font-semibold truncate max-w-xs">
          {title}
        </span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
        {/* Gallery (Left: 6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-800 shadow-sm">
            <img
              src={activeImage || product.thumbnail || product.images?.[0] || ''}
              alt={title}
              className="w-full h-full object-cover object-center"
            />
            {product.discountPercent && (
              <span className="absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-xl bg-rose-600 text-white shadow-md">
                -{product.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {Array.isArray(product.images) && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                    activeImage === img
                      ? 'border-teal-600 shadow-md scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details & Purchase Options (Right: 6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header & Meta */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-xs uppercase tracking-wider">
                {product.brand}
              </span>
              <div className="flex items-center gap-2 text-stone-500 text-xs">
                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-1"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2 rounded-xl transition-colors ${
                    isWishlisted(product.id)
                      ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                      : 'hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted(product.id) ? 'fill-rose-500' : ''}`} />
                </button>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-stone-900 dark:text-white leading-snug">
              {title}
            </h1>

            {/* Ratings & SKU */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300 dark:text-stone-600'
                      }`}
                    />
                  ))}
                </div>
                <span>{product.rating}</span>
                <span className="text-stone-400">({reviews.length} {t('reviews')})</span>
              </div>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span className="text-stone-500 font-mono">SKU: {currentSku}</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800 flex items-baseline gap-3">
            <span className="text-3xl font-black text-teal-700 dark:text-teal-400 font-mono">
              ৳{currentPrice.toLocaleString()}
            </span>
            {originalPrice && (
              <span className="text-base text-stone-400 line-through font-mono">
                ৳{originalPrice.toLocaleString()}
              </span>
            )}
            {originalPrice && (
              <span className="text-xs font-bold text-rose-600 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                {language === 'bn' ? `সাশ্রয় ৳${(originalPrice - currentPrice).toLocaleString()}` : `Save ৳${(originalPrice - currentPrice).toLocaleString()}`}
              </span>
            )}
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                <span>{language === 'bn' ? 'ভ্যারিয়েন্ট নির্বাচন করুন' : 'Select Variant'}:</span>
                <span className="text-teal-600 font-bold">{selectedVariant?.name}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVariant(v);
                      setQuantity(1);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 shadow-xs'
                        : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-300'
                    }`}
                  >
                    <span>{v.name}</span>
                    <span className="ml-1.5 font-mono text-[11px] opacity-75">৳{v.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Status & Quantity Stepper */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-600 dark:text-stone-300">
                {t('quantity')}:
              </span>
              <span
                className={`font-bold ${
                  isOutOfStock
                    ? 'text-rose-600'
                    : maxStock <= 5
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {isOutOfStock
                  ? t('outOfStock')
                  : maxStock <= 5
                  ? language === 'bn'
                    ? `সীমিত স্টক! মাত্র ${maxStock}টি অবশিষ্ট`
                    : `Low Stock! Only ${maxStock} left`
                  : t('inStock')}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-800 overflow-hidden shadow-xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="px-3.5 py-2.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-30"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-bold text-stone-800 dark:text-stone-200 font-mono">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                  disabled={quantity >= maxStock || isOutOfStock}
                  className="px-3.5 py-2.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-30"
                >
                  +
                </button>
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('addToCart')}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>{t('buyNow')}</span>
              </button>
            </div>
          </div>

          {/* Delivery & Assurance Info Card */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800 space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <Truck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {language === 'bn' ? 'সারা বাংলাদেশে হোম ডেলিভারি' : 'Nationwide Home Delivery'}
                </span>
                <p className="text-stone-500">
                  {language === 'bn'
                    ? 'ঢাকা সিটির ভেতরে ৬০ টাকা (১-২ দিন) | ঢাকার বাইরে ১২০ টাকা (৩-৫ দিন)'
                    : 'Inside Dhaka ৳60 (1-2 Days) | Outside Dhaka ৳120 (3-5 Days)'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {t('authenticProducts')}
                </span>
                <p className="text-stone-500">
                  {language === 'bn'
                    ? '১০০% আসল ও কোয়ালিটি নিশ্চিত পণ্য'
                    : '100% genuine and strictly quality-inspected products'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <RotateCcw className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {t('easyReturn')}
                </span>
                <p className="text-stone-500">{t('easyReturnDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, Reviews */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-stone-200 dark:border-stone-800 text-sm font-bold pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-2 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'desc'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {t('description')}
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-2 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {t('specifications')}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {t('customerReviews')} ({reviews.length})
          </button>
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'desc' && (
          <div className="prose dark:prose-invert max-w-none text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            <p>{description}</p>
          </div>
        )}

        {/* Tab 2: Specs */}
        {activeTab === 'specs' && (
          <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs sm:text-sm">
            {Array.isArray(product.specifications) && product.specifications.length > 0 ? (
              product.specifications.map((spec, i) => (
                <div key={i} className="py-2.5 grid grid-cols-3 gap-4">
                  <span className="font-semibold text-stone-500">{spec.label}</span>
                  <span className="col-span-2 text-stone-900 dark:text-stone-100 font-medium">{spec.value}</span>
                </div>
              ))
            ) : (
              <p className="text-stone-500 py-4">Standard Bangladesh Retail Specification.</p>
            )}
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                          {rev.userName}
                        </span>
                        {rev.verifiedPurchase && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                            <UserCheck className="w-3 h-3" />
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-amber-400' : 'text-stone-300 dark:text-stone-700'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-stone-500 text-xs py-4">
                  {language === 'bn' ? 'এখনো কোনো মতামত দেওয়া হয়নি। প্রথম রিভিউ দিন!' : 'No reviews yet. Be the first to share your experience!'}
                </p>
              )}
            </div>

            {/* Write a Review Form */}
            <form onSubmit={handleSubmitReview} className="p-5 rounded-2xl border border-teal-600/30 bg-teal-50/30 dark:bg-teal-950/20 space-y-4">
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                {t('writeReview')}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                    {t('fullName')}
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Tanvir Hasan"
                    required
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                    {t('rating')}
                  </label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-semibold text-amber-500"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5/5) Excellent</option>
                    <option value="4">⭐⭐⭐⭐ (4/5) Very Good</option>
                    <option value="3">⭐⭐⭐ (3/5) Average</option>
                    <option value="2">⭐⭐ (2/5) Poor</option>
                    <option value="1">⭐ (1/5) Terrible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  {t('feedback')}
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={language === 'bn' ? 'পণ্যটির গুণমান, ডেলিভারি এবং আপনার অভিজ্ঞতা লিখুন...' : 'Share details about product quality, fit, or delivery...'}
                  required
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('submitReview')}</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">
            {t('relatedProducts')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
