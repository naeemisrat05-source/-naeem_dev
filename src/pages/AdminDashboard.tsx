import React, { useState, useEffect } from 'react';
import {
  Package,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  Plus,
  Edit2,
  Trash2,
  Search,
  Printer,
  Shield,
  Tag,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus, Product, Coupon } from '../types';
import { ShopBDStore } from '../lib/firebase/store';
import { InvoiceModal } from '../components/invoice/InvoiceModal';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user, isAdmin, loginDemoAdmin } = useAuth();
  const { products, categories, reloadProducts, showToast, language } = useStore();

  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'products' | 'coupons'>('analytics');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  // Orders Filter & Search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodNameBn, setProdNameBn] = useState('');
  const [prodCategory, setProdCategory] = useState(categories[0]?.id || 'electronics');
  const [prodPrice, setProdPrice] = useState<number>(1000);
  const [prodOriginalPrice, setProdOriginalPrice] = useState<number>(1200);
  const [prodStock, setProdStock] = useState<number>(20);
  const [prodImage, setProdImage] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodFeatured, setProdFeatured] = useState(false);

  // Coupon State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponVal, setNewCouponVal] = useState<number>(10);
  const [newCouponMin, setNewCouponMin] = useState<number>(500);

  const loadAllOrders = async () => {
    setLoadingOrders(true);
    try {
      const ords = await ShopBDStore.getOrders();
      setOrders(ords);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadAllOrders();
    // Load coupons
    const initialCoupons: Coupon[] = [
      { id: 'c1', code: 'SHOPBD10', type: 'percentage', value: 10, minOrderAmount: 1000, isActive: true },
      { id: 'c2', code: 'EIDMUBARAK', type: 'percentage', value: 15, minOrderAmount: 2500, isActive: true },
      { id: 'c3', code: 'WELCOME50', type: 'fixed', value: 100, minOrderAmount: 800, isActive: true },
    ];
    setCoupons(initialCoupons);
  }, []);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Shield className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900 dark:text-white">Admin Access Restricted</h2>
        <p className="text-xs text-stone-500">
          This portal requires store administration privileges (Authorized UID: fO27HKUtQofzCq4TLNhfNu6quw03).
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => {
              loginDemoAdmin();
              showToast('Logged in as Authorized Store Admin', 'success');
            }}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md"
          >
            Authenticate with Demo Admin Credentials
          </button>
          <button
            onClick={() => onNavigate('/')}
            className="px-5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  // Analytics Calculations
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'Cancelled' ? sum + o.total : sum), 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'Confirmed' || o.status === 'Processing').length;
  const lowStockCount = products.filter((p) => p.stock < 10).length;

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone.includes(orderSearch);

    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await ShopBDStore.updateOrderStatus(orderId, newStatus, undefined, `Status manually updated to ${newStatus} by admin.`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      showToast(`Order status updated to ${newStatus}`, 'success');
    } catch (e) {
      showToast('Failed to update order status', 'error');
    }
  };

  // Product Add / Edit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodImage.trim()) {
      showToast('Name and Image URL are required', 'error');
      return;
    }

    const newProdData: Partial<Product> = {
      name: prodName.trim(),
      nameBn: prodNameBn.trim() || prodName.trim(),
      category: prodCategory,
      price: prodPrice,
      originalPrice: prodOriginalPrice || undefined,
      discountPercentage: prodOriginalPrice > prodPrice ? Math.round(((prodOriginalPrice - prodPrice) / prodOriginalPrice) * 100) : undefined,
      stock: prodStock,
      image: prodImage.trim(),
      isFeatured: prodFeatured,
      description: prodDesc.trim() || 'Premium quality product verified by ShopBD.',
      sku: 'SBD-' + Math.floor(10000 + Math.random() * 90000),
    };

    try {
      if (editingProductId) {
        await ShopBDStore.updateProduct(editingProductId, newProdData);
        showToast('Product updated successfully', 'success');
      } else {
        await ShopBDStore.createProduct(newProdData as Product);
        showToast('New product added to catalog', 'success');
      }
      setIsProductModalOpen(false);
      setEditingProductId(null);
      await reloadProducts();
    } catch (err) {
      showToast('Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await ShopBDStore.deleteProduct(id);
      showToast('Product deleted', 'info');
      await reloadProducts();
    }
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const newC: Coupon = {
      id: 'c_' + Date.now(),
      code: newCouponCode.trim().toUpperCase(),
      type: newCouponType,
      value: newCouponVal,
      minOrderAmount: newCouponMin,
      isActive: true,
    };
    setCoupons((prev) => [newC, ...prev]);
    setNewCouponCode('');
    showToast(`Voucher ${newC.code} activated`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
      {/* Admin Header */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-teal-600 text-white font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">ShopBD Merchant Admin</h1>
              <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-400 text-[10px] font-bold">
                LIVE PRODUCTION
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Logged in as: <span className="font-mono text-stone-300">{user?.email}</span> (Dhaka Central HQ)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/')}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-300 flex items-center gap-1.5 transition-colors"
          >
            <span>View Public Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-200 dark:border-stone-800">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'analytics'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <span>Customer Orders</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
            {orders.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'products'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <span>Catalog Inventory</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
            {products.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'coupons'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          Coupons & Discounts
        </button>
      </div>

      {/* 1. ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in-50">
          {/* 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-mono">
                ৳{totalRevenue.toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +18.4% month-over-month
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                <Package className="w-5 h-5 text-teal-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-mono">
                {totalOrdersCount}
              </p>
              <p className="text-[11px] text-stone-400 font-medium">All 64 districts fulfilled</p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Orders</span>
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
                {pendingOrdersCount}
              </p>
              <p className="text-[11px] text-stone-400 font-medium">Awaiting courier dispatch</p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-bold uppercase tracking-wider">Low Stock SKUs</span>
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">
                {lowStockCount}
              </p>
              <p className="text-[11px] text-rose-500 font-medium">Items with &lt; 10 units</p>
            </div>
          </div>

          {/* Quick Recent Orders Table */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">Recent Customer Orders</h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-teal-600 hover:underline"
              >
                Manage All Orders →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-stone-400 border-b border-stone-100 dark:border-stone-800 pb-2">
                    <th className="py-2.5 font-bold">Order ID</th>
                    <th className="py-2.5 font-bold">Customer</th>
                    <th className="py-2.5 font-bold">Location</th>
                    <th className="py-2.5 font-bold">Total</th>
                    <th className="py-2.5 font-bold">Payment</th>
                    <th className="py-2.5 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                      <td className="py-3 font-mono font-bold text-teal-700 dark:text-teal-400">{o.orderNumber}</td>
                      <td className="py-3 font-medium">{o.customerName}</td>
                      <td className="py-3 text-stone-500">{o.shippingAddress.district}</td>
                      <td className="py-3 font-mono font-bold">৳{o.total.toLocaleString()}</td>
                      <td className="py-3 uppercase font-semibold text-stone-600 dark:text-stone-400">{o.paymentMethod}</td>
                      <td className="py-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-[10px]">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. ORDERS MANAGEMENT TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-6 shadow-xs animate-in fade-in-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-black text-stone-900 dark:text-white">Orders Management</h2>

            {/* Filter & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search order ID, phone..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs w-52"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="p-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold"
              >
                <option value="all">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-stone-400 border-b border-stone-100 dark:border-stone-800 pb-2">
                  <th className="py-2.5 font-bold">Order Details</th>
                  <th className="py-2.5 font-bold">Customer & Shipping</th>
                  <th className="py-2.5 font-bold">Amount</th>
                  <th className="py-2.5 font-bold">Update Status</th>
                  <th className="py-2.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                    <td className="py-3 space-y-0.5">
                      <p className="font-mono font-bold text-teal-700 dark:text-teal-400">{ord.orderNumber}</p>
                      <p className="text-[11px] text-stone-400">
                        {new Date(ord.createdAt).toLocaleDateString()} • {ord.items.length} items
                      </p>
                    </td>

                    <td className="py-3 space-y-0.5">
                      <p className="font-semibold text-stone-900 dark:text-white">{ord.customerName}</p>
                      <p className="text-[11px] text-stone-500">{ord.customerPhone}</p>
                      <p className="text-[11px] text-stone-400 truncate max-w-xs">
                        {ord.shippingAddress.fullAddress}, {ord.shippingAddress.district}
                      </p>
                    </td>

                    <td className="py-3 space-y-0.5">
                      <p className="font-mono font-bold text-stone-900 dark:text-white">৳{ord.total.toLocaleString()}</p>
                      <p className="text-[10px] uppercase font-semibold text-stone-400">
                        {ord.paymentMethod} • {ord.paymentStatus}
                      </p>
                    </td>

                    <td className="py-3">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-[11px] font-bold text-stone-800 dark:text-stone-200"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedOrderForInvoice(ord)}
                        className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white inline-flex items-center gap-1"
                        title="Print Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PRODUCTS MANAGEMENT TAB */}
      {activeTab === 'products' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-6 shadow-xs animate-in fade-in-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-stone-900 dark:text-white">Product Catalog & Inventory</h2>
              <p className="text-xs text-stone-500">Add, edit stock, modify pricing, and configure featured items.</p>
            </div>

            <button
              onClick={() => {
                setEditingProductId(null);
                setProdName('');
                setProdNameBn('');
                setProdCategory(categories[0]?.id || 'electronics');
                setProdPrice(1500);
                setProdOriginalPrice(1800);
                setProdStock(25);
                setProdImage('https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80');
                setProdDesc('');
                setProdFeatured(false);
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-stone-400 border-b border-stone-100 dark:border-stone-800 pb-2">
                  <th className="py-2.5 font-bold">Product</th>
                  <th className="py-2.5 font-bold">Category</th>
                  <th className="py-2.5 font-bold">Price (BDT)</th>
                  <th className="py-2.5 font-bold">Stock</th>
                  <th className="py-2.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.thumbnail || p.images?.[0] || p.image || ''} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0 border" />
                        <div>
                          <p className="font-semibold text-stone-900 dark:text-white line-clamp-1">{p.name}</p>
                          <p className="text-[11px] text-stone-400 font-mono">SKU: {p.sku || 'SBD-GEN'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 capitalize text-stone-500">{p.category || p.categoryId}</td>

                    <td className="py-3 font-mono font-bold text-stone-900 dark:text-white">
                      ৳{p.price.toLocaleString()}
                    </td>

                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          p.stock <= 5
                            ? 'bg-rose-100 text-rose-700'
                            : p.stock <= 15
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingProductId(p.id);
                            setProdName(p.name);
                            setProdNameBn(p.nameBn || p.name);
                            setProdCategory(p.category || p.categoryId || 'electronics');
                            setProdPrice(p.price);
                            setProdOriginalPrice(p.originalPrice || p.price);
                            setProdStock(p.stock);
                            setProdImage(p.thumbnail || p.images?.[0] || p.image || '');
                            setProdDesc(p.description);
                            setProdFeatured(Boolean(p.featured || p.isFeatured));
                            setIsProductModalOpen(true);
                          }}
                          className="p-1.5 text-stone-500 hover:text-teal-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. COUPONS TAB */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in-50">
          <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-stone-900 dark:text-white">Active Promotional Vouchers</h3>
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {coupons.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-sm text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-500/30">
                      {c.code}
                    </span>
                    <p className="text-[11px] text-stone-500 mt-1">
                      {c.type === 'percentage' ? `${c.value}% discount` : `৳${c.value} flat discount`} • Min Order: ৳{c.minOrderAmount}
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleAddCoupon}
            className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-4 shadow-xs"
          >
            <h3 className="font-bold text-sm text-stone-900 dark:text-white">Create New Voucher</h3>
            <div>
              <label className="block text-xs font-semibold mb-1">Coupon Code</label>
              <input
                type="text"
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. FLASH20"
                required
                className="w-full p-2 rounded-xl border text-xs font-mono uppercase"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Type</label>
                <select
                  value={newCouponType}
                  onChange={(e) => setNewCouponType(e.target.value as 'percentage' | 'fixed')}
                  className="w-full p-2 rounded-xl border text-xs"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed BDT (৳)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Value</label>
                <input
                  type="number"
                  value={newCouponVal}
                  onChange={(e) => setNewCouponVal(Number(e.target.value))}
                  required
                  className="w-full p-2 rounded-xl border text-xs font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Minimum Order (BDT)</label>
              <input
                type="number"
                value={newCouponMin}
                onChange={(e) => setNewCouponMin(Number(e.target.value))}
                required
                className="w-full p-2 rounded-xl border text-xs font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm"
            >
              Add Voucher
            </button>
          </form>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsProductModalOpen(false)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" />
          <form
            onSubmit={handleSaveProduct}
            className="relative bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 max-w-lg w-full space-y-4 z-10 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-bold text-base text-stone-900 dark:text-white">
              {editingProductId ? 'Edit Product' : 'Add New Product to Catalog'}
            </h3>

            <div>
              <label className="block text-xs font-semibold mb-1">Product Title (English) *</label>
              <input
                type="text"
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                required
                className="w-full p-2 rounded-xl border text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Product Title (Bangla)</label>
              <input
                type="text"
                value={prodNameBn}
                onChange={(e) => setProdNameBn(e.target.value)}
                placeholder="পণ্যের বাংলা নাম"
                className="w-full p-2 rounded-xl border text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Category *</label>
                <select
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  className="w-full p-2 rounded-xl border text-xs capitalize"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Stock Quantity *</label>
                <input
                  type="number"
                  value={prodStock}
                  onChange={(e) => setProdStock(Number(e.target.value))}
                  required
                  className="w-full p-2 rounded-xl border text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Sale Price (BDT ৳) *</label>
                <input
                  type="number"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(Number(e.target.value))}
                  required
                  className="w-full p-2 rounded-xl border text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Original Price (BDT ৳)</label>
                <input
                  type="number"
                  value={prodOriginalPrice}
                  onChange={(e) => setProdOriginalPrice(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Image URL (Unsplash or direct) *</label>
              <input
                type="url"
                value={prodImage}
                onChange={(e) => setProdImage(e.target.value)}
                required
                className="w-full p-2 rounded-xl border text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Description</label>
              <textarea
                value={prodDesc}
                onChange={(e) => setProdDesc(e.target.value)}
                rows={2}
                className="w-full p-2 rounded-xl border text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeat"
                checked={prodFeatured}
                onChange={(e) => setProdFeatured(e.target.checked)}
                className="w-4 h-4 rounded-md accent-teal-600"
              />
              <label htmlFor="isFeat" className="text-xs font-semibold cursor-pointer">
                Highlight as Featured on Homepage
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invoice Modal for Admin */}
      {selectedOrderForInvoice && (
        <InvoiceModal
          order={selectedOrderForInvoice}
          isOpen={Boolean(selectedOrderForInvoice)}
          onClose={() => setSelectedOrderForInvoice(null)}
        />
      )}
    </div>
  );
};
