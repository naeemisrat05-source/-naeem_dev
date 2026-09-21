import React from 'react';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onNavigate: (path: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { language, t, addToCart, toggleWishlist, isWishlisted } = useStore();
  const wishlisted = isWishlisted(product.id);

  const title = language === 'bn' ? product.nameBn || product.name : product.name;
  const price = product.discountPrice || product.price;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const isOutOfStock = product.stock <= 0;

  const handleCardClick = () => {
    onNavigate(`/product/${product.slug}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md hover:border-teal-500/50 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer h-full"
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-square w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
        <img
          src={product.thumbnail || product.images?.[0] || product.image || ''}
          alt={title}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-600 text-white shadow-sm tracking-wide">
              {product.discountPercent ? `-${product.discountPercent}%` : t('saveDiscount')}
            </span>
          )}
          {product.featured && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-600 text-white shadow-sm">
              {language === 'bn' ? 'স্পেশাল' : 'Featured'}
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-stone-800/90 text-white backdrop-blur-sm">
              {t('outOfStock')}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label="Wishlist"
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            wishlisted
              ? 'bg-rose-50 text-rose-500 shadow-md scale-110'
              : 'bg-white/80 dark:bg-stone-900/80 text-stone-600 dark:text-stone-300 hover:text-rose-500 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Content Area */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span className="font-medium truncate max-w-[120px]">{product.brand}</span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{product.rating}</span>
              <span className="text-stone-400 dark:text-stone-500 text-[10px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-semibold text-sm sm:text-base text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            {title}
          </h3>
        </div>

        {/* Pricing and Action */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-teal-700 dark:text-teal-400">
                ৳{price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs text-stone-400 line-through">
                  ৳{product.price.toLocaleString()}
                </span>
              )}
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                {language === 'bn' ? `স্টক বাকি ${product.stock}টি` : `Only ${product.stock} left`}
              </p>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-2.5 sm:px-3 sm:py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold transition-all duration-200 ${
              isOutOfStock
                ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow active:scale-95'
            }`}
            title={t('addToCart')}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">{t('addToCart')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
