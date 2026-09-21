import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, X, Search, RotateCcw, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';

interface ShopPageProps {
  onNavigate: (path: string) => void;
  initialCategory?: string;
  initialSearch?: string;
  initialCategorySlug?: string | null;
}

export const ShopPage: React.FC<ShopPageProps> = ({ onNavigate, initialCategory, initialSearch, initialCategorySlug }) => {
  const { products, categories, language, t, searchQuery, setSearchQuery } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || initialCategorySlug || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Derive unique brands
  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameBn?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          (p.category || p.categoryId || '').toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategory !== 'all') {
      list = list.filter(
        (p) =>
          p.category === selectedCategory ||
          p.categoryId === selectedCategory ||
          p.subcategory === selectedCategory ||
          p.subcategoryId === selectedCategory
      );
    }

    // Brand
    if (selectedBrand !== 'all') {
      list = list.filter((p) => p.brand === selectedBrand);
    }

    // Price
    list = list.filter((p) => {
      const effPrice = p.discountPrice || p.price;
      return effPrice >= minPrice && effPrice <= maxPrice;
    });

    // In stock
    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price_desc':
        list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'featured':
      default:
        list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return list;
  }, [products, searchQuery, selectedCategory, selectedBrand, minPrice, maxPrice, inStockOnly, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setMinPrice(0);
    setMaxPrice(30000);
    setInStockOnly(false);
    setSortBy('featured');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedBrand !== 'all' ||
    minPrice > 0 ||
    maxPrice < 30000 ||
    inStockOnly ||
    Boolean(searchQuery.trim());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      {/* Page Title & Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-stone-200 dark:border-stone-800 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
            {t('shop')}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            {language === 'bn'
              ? `${filteredProducts.length}টি পণ্য পাওয়া গেছে`
              : `Showing ${filteredProducts.length} products`}
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Mobile Filter Trigger */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold lg:hidden hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <SlidersHorizontal className="w-4 h-4 text-teal-600" />
            <span>{t('filter')}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-teal-600 inline-block ml-1" />
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-medium hidden sm:inline">{t('sortBy')}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-hidden focus:border-teal-500"
            >
              <option value="featured">{t('featuredProducts')}</option>
              <option value="price_asc">{t('priceLowToHigh')}</option>
              <option value="price_desc">{t('priceHighToLow')}</option>
              <option value="rating">{t('customerRating')}</option>
              <option value="newest">{t('newArrivals')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <span className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-teal-600" />
                {t('filter')}
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" />
                  {t('clearAll')}
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                {t('allCategories')}
              </h4>
              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-teal-600 text-white'
                      : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <span>{language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</span>
                  <span>{products.length}</span>
                </button>

                {categories.map((cat) => {
                  const count = products.filter((p) => p.category === cat.slug).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                        selectedCategory === cat.slug
                          ? 'bg-teal-600 text-white'
                          : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span className="truncate">{language === 'bn' ? cat.nameBn : cat.name}</span>
                      <span className="text-[11px] opacity-75">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2 pt-4 border-t border-stone-100 dark:border-stone-800">
              <div className="flex justify-between items-center text-xs font-bold text-stone-500 uppercase tracking-wider">
                <span>{t('priceRange')}</span>
                <span className="text-teal-600 dark:text-teal-400 font-mono">
                  ৳{minPrice} - ৳{maxPrice}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex items-center gap-2 pt-1 text-xs">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  placeholder="Min"
                  className="w-1/2 p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-center font-mono"
                />
                <span className="text-stone-400">-</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  placeholder="Max"
                  className="w-1/2 p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-center font-mono"
                />
              </div>
            </div>

            {/* Brands */}
            {brands.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-stone-100 dark:border-stone-800">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {t('brand')}
                </h4>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedBrand('all')}
                    className={`w-full text-left px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      selectedBrand === 'all'
                        ? 'bg-teal-600 text-white'
                        : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    All Brands
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBrand(b)}
                      className={`w-full text-left px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        selectedBrand === b
                          ? 'bg-teal-600 text-white'
                          : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* In Stock Only Toggle */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <label htmlFor="inStock" className="text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer">
                {t('inStockOnly')}
              </label>
              <input
                id="inStock"
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 text-teal-600 accent-teal-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </aside>

        {/* Products Grid Area */}
        <main className="lg:col-span-3 space-y-6">
          {/* Active Filter Pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-stone-100 dark:bg-stone-800/60 rounded-xl text-xs">
              <span className="text-stone-500 font-semibold">{t('activeFilters')}:</span>
              {selectedCategory !== 'all' && (
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 flex items-center gap-1 font-medium">
                  Cat: {selectedCategory}
                  <button onClick={() => setSelectedCategory('all')}>
                    <X className="w-3 h-3 text-stone-400 hover:text-stone-600" />
                  </button>
                </span>
              )}
              {selectedBrand !== 'all' && (
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 flex items-center gap-1 font-medium">
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand('all')}>
                    <X className="w-3 h-3 text-stone-400 hover:text-stone-600" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 flex items-center gap-1 font-medium">
                  Query: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}>
                    <X className="w-3 h-3 text-stone-400 hover:text-stone-600" />
                  </button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-rose-600 dark:text-rose-400 hover:underline font-bold ml-auto"
              >
                {t('clearAll')}
              </button>
            </div>
          )}

          {/* Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto text-stone-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">
                {language === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products found'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
                {language === 'bn'
                  ? 'আপনার ফিল্টারের শর্ত পরিবর্তন করে আবার চেষ্টা করুন।'
                  : 'Try adjusting your filters or search keywords to find what you are looking for.'}
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-sm hover:bg-teal-700 transition-colors"
              >
                {t('resetFilters')}
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            onClick={() => setMobileFiltersOpen(false)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
          />
          <div className="relative ml-auto w-full max-w-xs bg-white dark:bg-stone-900 h-full p-5 shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                <span className="font-bold text-base text-stone-900 dark:text-white">
                  {t('filter')}
                </span>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-500 uppercase">{t('allCategories')}</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                      selectedCategory === 'all' ? 'bg-teal-600 text-white' : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                        selectedCategory === cat.slug ? 'bg-teal-600 text-white' : 'text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {language === 'bn' ? cat.nameBn : cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2 pt-4 border-t border-stone-200 dark:border-stone-800">
                <div className="flex justify-between text-xs font-bold text-stone-500">
                  <span>{t('priceRange')}</span>
                  <span className="text-teal-600">৳{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              {/* In Stock */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {t('inStockOnly')}
                </span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 accent-teal-600"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-stone-200 dark:border-stone-800 space-y-2">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold text-sm shadow-md"
              >
                {language === 'bn' ? 'ফিল্টার প্রয়োগ করুন' : 'Apply Filters'}
              </button>
              <button
                onClick={() => {
                  resetFilters();
                  setMobileFiltersOpen(false);
                }}
                className="w-full py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-400"
              >
                {t('clearAll')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
