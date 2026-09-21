import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseAvailable, handleFirestoreError, OperationType } from './client';
import { Product, Category, Order, Coupon, Banner, Review, Notification, StoreSettings, OrderStatus, PaymentStatus } from '../../types';
import { initialProducts, initialCategories, initialCoupons, initialBanners, initialStoreSettings } from '../../data/seedData';

const LOCAL_STORAGE_PREFIX = 'shopbd_';

function getLocalData<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setLocalData<T>(key: string, val: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(val));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

export class ShopBDStore {
  // PRODUCTS
  static async getProducts(): Promise<Product[]> {
    const local = getLocalData<Product[]>('products', initialProducts);
    if (!isFirebaseAvailable || !db) return local;

    try {
      const colRef = collection(db, 'products');
      const snap = await getDocs(colRef);
      if (snap.empty) {
        // initialize local
        setLocalData('products', initialProducts);
        return initialProducts;
      }
      const list: Product[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Product));
      setLocalData('products', list);
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'products');
      return local;
    }
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    const all = await this.getProducts();
    return all.find((p) => p.slug === slug || p.id === slug) || null;
  }

  static async saveProduct(product: Product): Promise<void> {
    const all = getLocalData<Product[]>('products', initialProducts);
    const idx = all.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      all[idx] = { ...product, updatedAt: new Date().toISOString() };
    } else {
      all.unshift({ ...product, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setLocalData('products', all);

    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, 'products', product.id), {
          ...product,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
      }
    }
  }

  static async createProduct(product: Product): Promise<void> {
    const id = product.id || 'prod_' + Date.now();
    await this.saveProduct({ ...product, id });
  }

  static async updateProduct(id: string, partial: Partial<Product>): Promise<void> {
    const all = await this.getProducts();
    const existing = all.find((p) => p.id === id);
    if (existing) {
      await this.saveProduct({ ...existing, ...partial, id });
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    const all = getLocalData<Product[]>('products', initialProducts).filter((p) => p.id !== id);
    setLocalData('products', all);

    if (isFirebaseAvailable && db) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
      }
    }
  }

  // CATEGORIES
  static async getCategories(): Promise<Category[]> {
    const local = getLocalData<Category[]>('categories', initialCategories);
    if (!isFirebaseAvailable || !db) return local;

    try {
      const colRef = collection(db, 'categories');
      const snap = await getDocs(colRef);
      if (snap.empty) return local;
      const list: Category[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Category));
      setLocalData('categories', list);
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'categories');
      return local;
    }
  }

  static async saveCategory(category: Category): Promise<void> {
    const all = getLocalData<Category[]>('categories', initialCategories);
    const idx = all.findIndex((c) => c.id === category.id);
    if (idx >= 0) {
      all[idx] = category;
    } else {
      all.push(category);
    }
    setLocalData('categories', all);

    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, 'categories', category.id), category);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `categories/${category.id}`);
      }
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    const all = getLocalData<Category[]>('categories', initialCategories).filter((c) => c.id !== id);
    setLocalData('categories', all);

    if (isFirebaseAvailable && db) {
      try {
        await deleteDoc(doc(db, 'categories', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
      }
    }
  }

  // ORDERS
  static async getOrders(userId?: string): Promise<Order[]> {
    const local = getLocalData<Order[]>('orders', []);
    let filteredLocal = local;
    if (userId && userId !== 'admin') {
      filteredLocal = local.filter((o) => o.userId === userId);
    }

    if (!isFirebaseAvailable || !db) return filteredLocal;

    try {
      const colRef = collection(db, 'orders');
      const q = userId && userId !== 'admin'
        ? query(colRef, where('userId', '==', userId), orderBy('createdAt', 'desc'))
        : query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list: Order[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Order));

      if (list.length > 0) {
        // Merge into local
        const merged = [...list];
        setLocalData('orders', merged);
        return list;
      }
      return filteredLocal;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'orders');
      return filteredLocal;
    }
  }

  static async getOrderById(orderNumberOrId: string): Promise<Order | null> {
    const cleanQuery = orderNumberOrId.trim().toUpperCase();
    const all = getLocalData<Order[]>('orders', []);
    const foundLocal = all.find(
      (o) => o.id === orderNumberOrId || o.orderNumber.toUpperCase() === cleanQuery
    );
    if (foundLocal) return foundLocal;

    if (isFirebaseAvailable && db) {
      try {
        // Direct doc get
        const docRef = doc(db, 'orders', orderNumberOrId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return { id: snap.id, ...snap.data() } as Order;
        }

        // Query by orderNumber
        const q = query(collection(db, 'orders'), where('orderNumber', '==', cleanQuery));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          const first = qSnap.docs[0];
          return { id: first.id, ...first.data() } as Order;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `orders/${orderNumberOrId}`);
      }
    }
    return null;
  }

  static async createOrder(order: Order): Promise<Order> {
    // 1. Deduct stock from products
    const products = getLocalData<Product[]>('products', initialProducts);
    for (const item of order.items) {
      const pIdx = products.findIndex((p) => p.id === item.productId);
      if (pIdx >= 0) {
        products[pIdx].stock = Math.max(0, products[pIdx].stock - item.quantity);
        products[pIdx].soldCount = (products[pIdx].soldCount || 0) + item.quantity;
      }
    }
    setLocalData('products', products);

    // 2. Save order locally
    const allOrders = getLocalData<Order[]>('orders', []);
    allOrders.unshift(order);
    setLocalData('orders', allOrders);

    // 3. Persist to Firestore if available
    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, 'orders', order.id), order);
        // Also update stock in firestore
        for (const item of order.items) {
          const p = products.find((pr) => pr.id === item.productId);
          if (p) {
            await updateDoc(doc(db, 'products', p.id), {
              stock: p.stock,
              soldCount: p.soldCount,
            });
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `orders/${order.id}`);
      }
    }

    return order;
  }

  static async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    paymentStatus?: PaymentStatus,
    note?: string
  ): Promise<void> {
    const allOrders = getLocalData<Order[]>('orders', []);
    const idx = allOrders.findIndex((o) => o.id === orderId);
    if (idx >= 0) {
      allOrders[idx].status = status;
      if (paymentStatus) allOrders[idx].paymentStatus = paymentStatus;
      allOrders[idx].updatedAt = new Date().toISOString();
      allOrders[idx].trackingTimeline.push({
        status,
        timestamp: new Date().toISOString(),
        note: note || `Order status updated to ${status}`,
      });
      setLocalData('orders', allOrders);
    }

    if (isFirebaseAvailable && db) {
      try {
        const updatePayload: Record<string, unknown> = {
          status,
          updatedAt: new Date().toISOString(),
        };
        if (paymentStatus) updatePayload.paymentStatus = paymentStatus;
        if (idx >= 0) {
          updatePayload.trackingTimeline = allOrders[idx].trackingTimeline;
        }
        await updateDoc(doc(db, 'orders', orderId), updatePayload);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
      }
    }
  }

  // COUPONS
  static async getCoupons(): Promise<Coupon[]> {
    const local = getLocalData<Coupon[]>('coupons', initialCoupons);
    if (!isFirebaseAvailable || !db) return local;

    try {
      const snap = await getDocs(collection(db, 'coupons'));
      if (snap.empty) return local;
      const list: Coupon[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Coupon));
      setLocalData('coupons', list);
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'coupons');
      return local;
    }
  }

  static async saveCoupon(coupon: Coupon): Promise<void> {
    const all = getLocalData<Coupon[]>('coupons', initialCoupons);
    const idx = all.findIndex((c) => c.id === coupon.id);
    if (idx >= 0) {
      all[idx] = coupon;
    } else {
      all.push(coupon);
    }
    setLocalData('coupons', all);

    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, 'coupons', coupon.id), coupon);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `coupons/${coupon.id}`);
      }
    }
  }

  static async deleteCoupon(id: string): Promise<void> {
    const all = getLocalData<Coupon[]>('coupons', initialCoupons).filter((c) => c.id !== id);
    setLocalData('coupons', all);

    if (isFirebaseAvailable && db) {
      try {
        await deleteDoc(doc(db, 'coupons', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `coupons/${id}`);
      }
    }
  }

  // BANNERS
  static async getBanners(): Promise<Banner[]> {
    const local = getLocalData<Banner[]>('banners', initialBanners);
    if (!isFirebaseAvailable || !db) return local;

    try {
      const snap = await getDocs(collection(db, 'banners'));
      if (snap.empty) return local;
      const list: Banner[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Banner));
      setLocalData('banners', list);
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'banners');
      return local;
    }
  }

  static async saveBanner(banner: Banner): Promise<void> {
    const all = getLocalData<Banner[]>('banners', initialBanners);
    const idx = all.findIndex((b) => b.id === banner.id);
    if (idx >= 0) {
      all[idx] = banner;
    } else {
      all.push(banner);
    }
    setLocalData('banners', all);

    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, 'banners', banner.id), banner);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `banners/${banner.id}`);
      }
    }
  }

  // REVIEWS
  static async getReviews(productId: string): Promise<Review[]> {
    const allReviews = getLocalData<Review[]>('reviews', [
      {
        id: 'rev_01',
        productId: 'prod_jamdani_01',
        userId: 'user_01',
        userName: 'Sharmin Akhter (Dhanmondi, Dhaka)',
        rating: 5,
        comment: 'অসাধারণ কোয়ালিটি! বুনন নিখুঁত এবং রঙ ছবির চেয়েও সুন্দর। ডেলিভারি ২ দিনের মধ্যে পেয়েছি।',
        verifiedPurchase: true,
        createdAt: '2026-03-12T14:30:00Z',
      },
      {
        id: 'rev_02',
        productId: 'prod_mustard_oil_03',
        userId: 'user_02',
        userName: 'Tanvir Hossain (Uttara)',
        rating: 5,
        comment: 'ঘানি ভাঙা সরিষার তেলের চমৎকার ঝাঁঝ। আলু ভর্তা আর মাছে একদম খাঁটি স্বাদ পেয়েছি। প্যাকেজিংও খুব ভালো ছিল।',
        verifiedPurchase: true,
        createdAt: '2026-03-15T09:20:00Z',
      },
      {
        id: 'rev_03',
        productId: 'prod_earbuds_anc_06',
        userId: 'user_03',
        userName: 'Mahmudul Hasan (Chattogram)',
        rating: 5,
        comment: 'The ANC really works well during public transit! Calls are crystal clear and battery lasts multiple days.',
        verifiedPurchase: true,
        createdAt: '2026-03-17T18:00:00Z',
      },
    ]);
    return allReviews.filter((r) => r.productId === productId);
  }

  static async addReview(review: Review): Promise<void> {
    const all = getLocalData<Review[]>('reviews', []);
    all.unshift(review);
    setLocalData('reviews', all);

    // Update product rating
    const products = getLocalData<Product[]>('products', initialProducts);
    const pIdx = products.findIndex((p) => p.id === review.productId);
    if (pIdx >= 0) {
      const prodReviews = all.filter((r) => r.productId === review.productId);
      const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
      products[pIdx].rating = Number(avg.toFixed(1));
      products[pIdx].reviewCount = prodReviews.length;
      setLocalData('products', products);
    }

    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, 'reviews', review.id), review);
        if (pIdx >= 0) {
          await updateDoc(doc(db, 'products', review.productId), {
            rating: products[pIdx].rating,
            reviewCount: products[pIdx].reviewCount,
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `reviews/${review.id}`);
      }
    }
  }

  // STORE SETTINGS
  static async getStoreSettings(): Promise<StoreSettings> {
    const local = getLocalData<StoreSettings>('settings', initialStoreSettings);
    if (!isFirebaseAvailable || !db) return local;

    try {
      const snap = await getDoc(doc(db, 'settings', 'general'));
      if (snap.exists()) {
        const s = snap.data() as StoreSettings;
        setLocalData('settings', s);
        return s;
      }
      return local;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'settings/general');
      return local;
    }
  }

  static async updateStoreSettings(settings: StoreSettings): Promise<void> {
    setLocalData('settings', settings);
    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, 'settings', 'general'), settings);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'settings/general');
      }
    }
  }

  // SEED TO FIRESTORE DIRECTLY
  static async seedInitialDataToFirestore(): Promise<{ success: boolean; count: number; message: string }> {
    setLocalData('products', initialProducts);
    setLocalData('categories', initialCategories);
    setLocalData('coupons', initialCoupons);
    setLocalData('banners', initialBanners);
    setLocalData('settings', initialStoreSettings);

    if (!isFirebaseAvailable || !db) {
      return {
        success: true,
        count: initialProducts.length,
        message: 'Loaded sample data in local memory. (Configure remote Firebase credentials in .env to sync to cloud)',
      };
    }

    try {
      let written = 0;
      // Products
      for (const p of initialProducts) {
        await setDoc(doc(db, 'products', p.id), p);
        written++;
      }
      // Categories
      for (const c of initialCategories) {
        await setDoc(doc(db, 'categories', c.id), c);
        written++;
      }
      // Coupons
      for (const cp of initialCoupons) {
        await setDoc(doc(db, 'coupons', cp.id), cp);
        written++;
      }
      // Banners
      for (const b of initialBanners) {
        await setDoc(doc(db, 'banners', b.id), b);
        written++;
      }
      // Settings
      await setDoc(doc(db, 'settings', 'general'), initialStoreSettings);

      return {
        success: true,
        count: written,
        message: `Successfully seeded ${written} records to Firestore!`,
      };
    } catch (err) {
      console.warn('Seed to Firestore error:', err);
      return {
        success: true,
        count: initialProducts.length,
        message: 'Sample data active in local store. Notice: Firestore permissions or quota prevented direct cloud write.',
      };
    }
  }
}
