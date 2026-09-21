import React, { useState, useEffect } from 'react';
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  Shield,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Printer,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { Order, BangladeshAddress } from '../types';
import { ShopBDStore } from '../lib/firebase/store';
import { bangladeshDivisions, getDistrictsByDivision } from '../data/bangladeshData';
import { InvoiceModal } from '../components/invoice/InvoiceModal';
import { ProductCard } from '../components/common/ProductCard';

interface AccountPageProps {
  initialTab?: 'dashboard' | 'orders' | 'addresses' | 'wishlist' | 'profile';
  onNavigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ initialTab = 'dashboard', onNavigate }) => {
  const { user, isAdmin, logout, updateAddresses, updateProfileInfo } = useAuth();
  const { language, t, wishlist, products, showToast } = useStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'addresses' | 'wishlist' | 'profile'>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  // Address form modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrDivision, setAddrDivision] = useState('Dhaka');
  const [addrDistrict, setAddrDistrict] = useState('Dhaka (City & Suburbs)');
  const [addrUpazila, setAddrUpazila] = useState('');
  const [addrFull, setAddrFull] = useState('');

  // Profile edit state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');

  useEffect(() => {
    if (user) {
      ShopBDStore.getOrders(user.uid).then((res) => {
        setOrders(res);
        setLoadingOrders(false);
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <User className="w-16 h-16 text-stone-300 mx-auto" />
        <h2 className="text-xl font-bold">{t('signInRequired')}</h2>
        <p className="text-xs text-stone-500">
          Please log in to view your orders, addresses, and account details.
        </p>
        <button
          onClick={() => onNavigate('/login')}
          className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs"
        >
          {t('signIn')}
        </button>
      </div>
    );
  }

  // Handle Save Address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentAddresses = user.addresses || [];
    let updated: BangladeshAddress[];

    if (editingAddressId) {
      updated = currentAddresses.map((a) =>
        a.id === editingAddressId
          ? {
              ...a,
              recipientName: addrName,
              phone: addrPhone,
              division: addrDivision,
              district: addrDistrict,
              upazila: addrUpazila,
              fullAddress: addrFull,
            }
          : a
      );
    } else {
      const newAddr: BangladeshAddress = {
        id: 'addr_' + Date.now(),
        recipientName: addrName,
        phone: addrPhone,
        division: addrDivision,
        district: addrDistrict,
        upazila: addrUpazila,
        fullAddress: addrFull,
        isDefault: currentAddresses.length === 0,
      };
      updated = [...currentAddresses, newAddr];
    }

    await updateAddresses(updated);
    setIsAddressModalOpen(false);
    setEditingAddressId(null);
    showToast(language === 'bn' ? 'ঠিকানা সংরক্ষিত হয়েছে' : 'Address saved successfully', 'success');
  };

  const handleDeleteAddress = async (id: string) => {
    const updated = (user.addresses || []).filter((a) => a.id !== id);
    await updateAddresses(updated);
    showToast(language === 'bn' ? 'ঠিকানা মুছে ফেলা হয়েছে' : 'Address removed', 'info');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileInfo(profileName, profilePhone);
    showToast(language === 'bn' ? 'প্রোফাইল আপডেট সম্পন্ন' : 'Profile updated successfully', 'success');
  };

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
      {/* User Header */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-2xl flex items-center justify-center">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
              {user.name}
            </h1>
            <p className="text-xs text-stone-500">{user.email}</p>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                <Shield className="w-3 h-3" />
                Store Admin
              </span>
            )}
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => onNavigate('/admin')}
            className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm self-start sm:self-auto"
          >
            <Shield className="w-4 h-4" />
            <span>{t('adminPanel')}</span>
          </button>
        )}
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-2 space-y-1 shadow-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-left transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-teal-600 text-white'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t('dashboard')}</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-left transition-colors ${
              activeTab === 'orders'
                ? 'bg-teal-600 text-white'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t('myOrders')}</span>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-left transition-colors ${
              activeTab === 'addresses'
                ? 'bg-teal-600 text-white'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>{t('addresses')}</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-left transition-colors ${
              activeTab === 'wishlist'
                ? 'bg-teal-600 text-white'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>{t('wishlist')}</span>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              {wishlist.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-left transition-colors ${
              activeTab === 'profile'
                ? 'bg-teal-600 text-white'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t('profile')}</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors pt-3 border-t border-stone-100 dark:border-stone-800"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logout')}</span>
          </button>
        </div>

        {/* Tab Content (9 Cols) */}
        <div className="lg:col-span-9">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-1">
                  <span className="text-xs text-stone-400 font-bold uppercase">{t('totalOrders')}</span>
                  <p className="text-2xl font-black text-stone-900 dark:text-white font-mono">
                    {orders.length}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-1">
                  <span className="text-xs text-stone-400 font-bold uppercase">{t('wishlistItems')}</span>
                  <p className="text-2xl font-black text-teal-600 font-mono">{wishlist.length}</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-1">
                  <span className="text-xs text-stone-400 font-bold uppercase">{t('savedAddresses')}</span>
                  <p className="text-2xl font-black text-stone-900 dark:text-white font-mono">
                    {user.addresses?.length || 0}
                  </p>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                    {t('recentOrders')}
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-teal-600 hover:underline"
                  >
                    {t('viewAll')}
                  </button>
                </div>

                {orders.length > 0 ? (
                  <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    {orders.slice(0, 3).map((ord) => (
                      <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-mono font-bold text-stone-900 dark:text-white">
                            {ord.orderNumber}
                          </p>
                          <p className="text-stone-400 text-[11px]">
                            {new Date(ord.createdAt).toLocaleDateString()} • {ord.items.length} items
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                            ৳{ord.total.toLocaleString()}
                          </span>
                          <button
                            onClick={() => onNavigate(`/track-order?id=${ord.orderNumber}`)}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-[11px]"
                          >
                            Track
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 py-4">No recent orders yet.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">{t('myOrders')}</h2>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 gap-2">
                        <div>
                          <span className="font-mono font-bold text-sm text-teal-700 dark:text-teal-400">
                            {ord.orderNumber}
                          </span>
                          <p className="text-[11px] text-stone-400">
                            {new Date(ord.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold">
                            {ord.status}
                          </span>
                          <button
                            onClick={() => setSelectedOrderForInvoice(ord)}
                            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs flex items-center gap-1"
                            title="Print Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onNavigate(`/track-order?id=${ord.orderNumber}`)}
                            className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
                          >
                            Track
                          </button>
                        </div>
                      </div>

                      <div className="divide-y divide-stone-100 dark:divide-stone-800">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="py-2 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                              <div>
                                <p className="font-semibold text-stone-900 dark:text-white line-clamp-1">
                                  {language === 'bn' ? item.nameBn : item.name}
                                </p>
                                <p className="text-stone-400 text-[11px]">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-mono font-bold">৳{item.total.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2 text-xs font-bold text-stone-700 dark:text-stone-300 border-t border-stone-100 dark:border-stone-800">
                        <span>Total Paid:</span>
                        <span className="text-sm font-mono text-teal-700 dark:text-teal-400">
                          ৳{ord.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-3xl border text-xs text-stone-500">
                  You haven't placed any orders yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-stone-900 dark:text-white">{t('addresses')}</h2>
                <button
                  onClick={() => {
                    setEditingAddressId(null);
                    setAddrName(user.name);
                    setAddrPhone(user.phone || '');
                    setAddrDivision('Dhaka');
                    setAddrDistrict('Dhaka (City & Suburbs)');
                    setAddrUpazila('');
                    setAddrFull('');
                    setIsAddressModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('addNewAddress')}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses && user.addresses.length > 0 ? (
                  user.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2 text-xs relative"
                    >
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-[10px] inline-block">
                          DEFAULT ADDRESS
                        </span>
                      )}
                      <p className="font-bold text-sm text-stone-900 dark:text-white">{addr.recipientName}</p>
                      <p className="text-stone-500">{addr.phone}</p>
                      <p className="text-stone-700 dark:text-stone-300">{addr.fullAddress}</p>
                      <p className="text-stone-500 font-medium">
                        {addr.upazila}, {addr.district}, {addr.division}
                      </p>

                      <div className="pt-3 flex items-center gap-2 border-t border-stone-100 dark:border-stone-800">
                        <button
                          onClick={() => {
                            setEditingAddressId(addr.id);
                            setAddrName(addr.recipientName);
                            setAddrPhone(addr.phone);
                            setAddrDivision(addr.division);
                            setAddrDistrict(addr.district);
                            setAddrUpazila(addr.upazila);
                            setAddrFull(addr.fullAddress);
                            setIsAddressModalOpen(true);
                          }}
                          className="text-teal-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-rose-500 hover:underline flex items-center gap-1 font-semibold ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-500 col-span-2 py-8 text-center bg-white dark:bg-stone-900 rounded-2xl border">
                    No addresses added yet. Click above to add your primary delivery location.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">{t('wishlist')}</h2>
              {wishlistedProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {wishlistedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border text-xs text-stone-500">
                  Your wishlist is empty. Explore our catalog to save products you love.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 max-w-md space-y-4">
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">{t('profile')}</h2>
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  {t('fullName')}
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-xs hover:bg-teal-700"
              >
                Save Changes
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Address Edit/Add Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddressModalOpen(false)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" />
          <form
            onSubmit={handleSaveAddress}
            className="relative bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 max-w-lg w-full space-y-4 z-10 shadow-2xl"
          >
            <h3 className="font-bold text-base text-stone-900 dark:text-white">
              {editingAddressId ? 'Edit Address' : t('addNewAddress')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">{t('recipientName')} *</label>
                <input
                  type="text"
                  value={addrName}
                  onChange={(e) => setAddrName(e.target.value)}
                  required
                  className="w-full p-2 rounded-xl border text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">{t('phone')} *</label>
                <input
                  type="tel"
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  required
                  className="w-full p-2 rounded-xl border text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">{t('division')} *</label>
                <select
                  value={addrDivision}
                  onChange={(e) => {
                    setAddrDivision(e.target.value);
                    setAddrDistrict(getDistrictsByDivision(e.target.value)[0]);
                  }}
                  className="w-full p-2 rounded-xl border text-xs"
                >
                  {bangladeshDivisions.map((d) => (
                    <option key={d.id} value={d.name}>{language === 'bn' ? d.nameBn : d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">{t('district')} *</label>
                <select
                  value={addrDistrict}
                  onChange={(e) => setAddrDistrict(e.target.value)}
                  className="w-full p-2 rounded-xl border text-xs"
                >
                  {getDistrictsByDivision(addrDivision).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1">{t('upazila')}</label>
                <input
                  type="text"
                  value={addrUpazila}
                  onChange={(e) => setAddrUpazila(e.target.value)}
                  placeholder="Thana / Area"
                  className="w-full p-2 rounded-xl border text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1">{t('fullAddress')} *</label>
                <textarea
                  value={addrFull}
                  onChange={(e) => setAddrFull(e.target.value)}
                  required
                  rows={2}
                  className="w-full p-2 rounded-xl border text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invoice Modal */}
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
