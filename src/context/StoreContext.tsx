import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  Category,
  CartItem,
  Coupon,
  ShippingMethod,
  Language,
  Notification,
  StoreSettings,
} from '../types';
import { ShopBDStore } from '../lib/firebase/store';
import { translations } from '../locales/translations';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface StoreContextType {
  // Localization
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;

  // Dark Mode
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Catalog
  products: Product[];
  categories: Category[];
  loadingCatalog: boolean;
  refreshCatalog: () => Promise<void>;
  reloadProducts: () => Promise<void>;
  storeSettings: StoreSettings | null;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variantId?: string) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // Coupon
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  discountAmount: number;

  // Shipping
  shippingMethod: ShippingMethod;
  setShippingMethod: (method: ShippingMethod) => void;
  availableShippingMethods: ShippingMethod[];
  calculatedShippingCost: number;

  // Final Order Calculations
  orderGrandTotal: number;

  // Notifications
  notifications: Notification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;

  // Toast
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Navigation search helper
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategorySlug: string | null;
  setSelectedCategorySlug: (cat: string | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('shopbd_lang') as Language) || 'bn';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('shopbd_lang', lang);
  };

  const toggleLanguage = () => {
    const next = language === 'bn' ? 'en' : 'bn';
    setLanguage(next);
  };

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = translations[language] as Record<string, string>;
      const fallbackDict = translations['en'] as Record<string, string>;
      let str = dict[key] || fallbackDict[key] || key;
      if (params) {
        Object.entries(params).forEach(([pKey, pVal]) => {
          str = str.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
        });
      }
      return str;
    },
    [language]
  );

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('shopbd_dark') === 'true';
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('shopbd_dark', String(next));
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState<boolean>(true);

  const refreshCatalog = async () => {
    setLoadingCatalog(true);
    try {
      const [prods, cats, sets] = await Promise.all([
        ShopBDStore.getProducts(),
        ShopBDStore.getCategories(),
        ShopBDStore.getStoreSettings(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setStoreSettings(sets);
    } catch (e) {
      console.warn('Error loading catalog:', e);
    } finally {
      setLoadingCatalog(false);
    }
  };

  useEffect(() => {
    refreshCatalog();
  }, []);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('shopbd_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('shopbd_cart', JSON.stringify(cart));
  }, [cart]);

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (product: Product, quantity = 1, variantId?: string) => {
    let effectivePrice = product.discountPrice || product.price;
    let variantName: string | undefined;
    let maxStock = product.stock;
    let sku = product.sku;

    if (variantId && product.variants) {
      const v = product.variants.find((vr) => vr.id === variantId);
      if (v) {
        effectivePrice = v.price;
        variantName = v.name;
        maxStock = v.stock;
        sku = v.sku;
      }
    }

    if (maxStock <= 0) {
      showToast(language === 'bn' ? 'দুঃখিত, এই পণ্যটি বর্তমানে স্টকে নেই।' : 'Sorry, this product is out of stock.', 'error');
      return;
    }

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.productId === product.id && item.variantId === variantId
      );

      if (existingIdx >= 0) {
        const item = prev[existingIdx];
        const newQty = Math.min(item.quantity + quantity, maxStock);
        const updated = [...prev];
        updated[existingIdx] = { ...item, quantity: newQty };
        return updated;
      } else {
        const newItem: CartItem = {
          productId: product.id,
          variantId,
          variantName,
          name: product.name,
          nameBn: product.nameBn,
          price: effectivePrice,
          originalPrice: product.discountPrice ? product.price : undefined,
          quantity: Math.min(quantity, maxStock),
          maxStock,
          image: product.thumbnail || product.images?.[0] || product.image || '',
          sku,
        };
        return [...prev, newItem];
      }
    });

    showToast(
      language === 'bn'
        ? `"${product.nameBn}" কার্টে যোগ করা হয়েছে`
        : `Added "${product.name}" to cart!`,
      'success'
    );
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantId === variantId))
    );
    showToast(language === 'bn' ? 'পণ্য কার্ট থেকে মুছে ফেলা হয়েছে' : 'Item removed from cart', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          return { ...item, quantity: Math.min(quantity, item.maxStock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Wishlist State
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('shopbd_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('shopbd_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast(
          language === 'bn' ? 'পছন্দের তালিকা থেকে সরানো হয়েছে' : 'Removed from wishlist',
          'info'
        );
        return prev.filter((id) => id !== productId);
      } else {
        showToast(
          language === 'bn' ? 'পছন্দের তালিকায় যুক্ত হয়েছে' : 'Added to wishlist!',
          'success'
        );
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  // Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    const cleanCode = code.trim().toUpperCase();
    const coupons = await ShopBDStore.getCoupons();
    const found = coupons.find((c) => c.code.toUpperCase() === cleanCode && c.active);

    if (!found) {
      return {
        success: false,
        message: language === 'bn' ? 'কুপন কোডটি সঠিক নয় বা মেয়াদ শেষ' : 'Invalid or expired coupon code',
      };
    }

    const minOrder = found.minimumOrder ?? found.minOrderAmount ?? 0;
    if (cartSubtotal < minOrder) {
      return {
        success: false,
        message:
          language === 'bn'
            ? `এই কুপনের জন্য সর্বনিম্ন ৳${minOrder} টাকার অর্ডার প্রয়োজন`
            : `Minimum order of ৳${minOrder} required for this coupon`,
      };
    }

    setAppliedCoupon(found);
    return {
      success: true,
      message: language === 'bn' ? 'কুপন সফলভাবে যুক্ত হয়েছে!' : 'Coupon applied successfully!',
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? Math.min(
          Math.round((cartSubtotal * appliedCoupon.value) / 100),
          appliedCoupon.maximumDiscount || 999999
        )
      : appliedCoupon.value
    : 0;

  // Shipping
  const availableShippingMethods: ShippingMethod[] = [
    {
      id: 'inside_dhaka',
      name: 'Inside Dhaka City (24-48 Hours)',
      nameBn: 'ঢাকা সিটির ভেতরে (২৪-৪৮ ঘণ্টা)',
      charge: storeSettings?.insideDhakaCharge ?? 60,
      estimatedDays: '1-2 Days',
      estimatedDaysBn: '১-২ দিন',
    },
    {
      id: 'outside_dhaka',
      name: 'Outside Dhaka / Nationwide (3-5 Days)',
      nameBn: 'ঢাকার বাইরে / সারাদেশে (৩-৫ দিন)',
      charge: storeSettings?.outsideDhakaCharge ?? 120,
      estimatedDays: '3-5 Days',
      estimatedDaysBn: '৩-৫ দিন',
    },
    {
      id: 'express',
      name: 'Express Urgent Delivery (Same Day / 24h)',
      nameBn: 'এক্সপ্রেস জরুরি ডেলিভারি (একই দিনে / ২৪ ঘণ্টা)',
      charge: storeSettings?.expressCharge ?? 180,
      estimatedDays: 'Same Day / 24 Hours',
      estimatedDaysBn: 'একই দিনে / ২৪ ঘণ্টা',
    },
  ];

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>(availableShippingMethods[0]);

  const freeShippingThreshold = storeSettings?.freeDeliveryThreshold ?? 2000;
  const isFreeShipping = cartSubtotal >= freeShippingThreshold && shippingMethod.id !== 'express';
  const calculatedShippingCost = cart.length === 0 ? 0 : isFreeShipping ? 0 : shippingMethod.charge;

  const orderGrandTotal = Math.max(0, cartSubtotal - discountAmount + calculatedShippingCost);

  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif_welcome',
      userId: 'all',
      title: 'Welcome to ShopBD!',
      titleBn: 'শপবিডিতে আপনাকে স্বাগতম!',
      message: 'Use coupon code WELCOME50 for ৳50 off on your first order!',
      messageBn: 'প্রথম অর্ডারে ৫০ টাকা ছাড় পেতে কুপন কোড WELCOME50 ব্যবহার করুন!',
      type: 'promo',
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif_jamdani',
      userId: 'all',
      title: 'Dhakai Jamdani Flash Sale Live',
      titleBn: 'ঢাকাই জামদানি শাড়ির বিশেষ ফ্ল্যাশ সেল চলছে',
      message: 'Explore authentic handwoven Jamdanis with special festive discounts.',
      messageBn: 'উৎসবের সেরা জামদানি শাড়িতে আকর্ষণীয় ছাড় উপভোগ করুন।',
      type: 'promo',
      read: false,
      link: '/product/dhakai-traditional-pure-handwoven-jamdani-saree',
      createdAt: new Date().toISOString(),
    },
  ]);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = (notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: Notification = {
      ...notif,
      id: 'notif_' + Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Search and Category filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);

  return (
    <StoreContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        darkMode,
        toggleDarkMode,
        products,
        categories,
        loadingCatalog,
        refreshCatalog,
        reloadProducts: refreshCatalog,
        storeSettings,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        wishlist,
        toggleWishlist,
        isWishlisted,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        shippingMethod,
        setShippingMethod,
        availableShippingMethods,
        calculatedShippingCost,
        orderGrandTotal,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        toasts,
        showToast,
        removeToast,
        searchQuery,
        setSearchQuery,
        selectedCategorySlug,
        setSelectedCategorySlug,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
};
