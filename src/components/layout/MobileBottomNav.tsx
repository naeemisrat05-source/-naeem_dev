import React from 'react';
import { Home, Grid, ShoppingCart, Package, User } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

interface MobileBottomNavProps {
  onNavigate: (path: string) => void;
  currentPath: string;
  onOpenCategoryDrawer: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onNavigate,
  currentPath,
  onOpenCategoryDrawer,
}) => {
  const { t, cartCount } = useStore();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 lg:hidden px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-lg">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => onNavigate('/')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl min-w-[56px] min-h-[44px] transition-colors ${
            currentPath === '/'
              ? 'text-teal-600 dark:text-teal-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('home')}</span>
        </button>

        {/* Categories Drawer */}
        <button
          onClick={onOpenCategoryDrawer}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl min-w-[56px] min-h-[44px] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('allCategories')}</span>
        </button>

        {/* Cart */}
        <button
          onClick={() => onNavigate('/cart')}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl min-w-[56px] min-h-[44px] transition-colors ${
            currentPath === '/cart'
              ? 'text-teal-600 dark:text-teal-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-teal-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">{t('cart')}</span>
        </button>

        {/* Orders */}
        <button
          onClick={() => onNavigate(user ? '/account/orders' : '/track-order')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl min-w-[56px] min-h-[44px] transition-colors ${
            currentPath.includes('/orders') || currentPath === '/track-order'
              ? 'text-teal-600 dark:text-teal-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('myOrders')}</span>
        </button>

        {/* Account */}
        <button
          onClick={() => onNavigate(user ? '/account' : '/login')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl min-w-[56px] min-h-[44px] transition-colors ${
            currentPath.includes('/account') || currentPath === '/login'
              ? 'text-teal-600 dark:text-teal-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('account')}</span>
        </button>
      </div>
    </nav>
  );
};
