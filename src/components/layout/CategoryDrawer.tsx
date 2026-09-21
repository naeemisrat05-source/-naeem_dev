import React from 'react';
import { X, ChevronRight, Layers, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const CategoryDrawer: React.FC<CategoryDrawerProps> = ({ isOpen, onClose, onNavigate }) => {
  const { categories, language, t, setSelectedCategorySlug } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in-50"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xs bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-teal-800 text-white">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-300" />
            <h2 className="font-bold text-base">{t('allCategories')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Links */}
        <div className="p-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800 flex flex-col gap-1 text-xs">
          <button
            onClick={() => {
              onClose();
              onNavigate('/deals');
            }}
            className="flex items-center justify-between p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500" />
              {t('deals')}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              onClose();
              onNavigate('/shop');
            }}
            className="flex items-center justify-between p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-700 font-semibold transition-colors"
          >
            <span>{t('shop')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-stone-100 dark:divide-stone-800/80">
          {categories.map((cat) => (
            <div key={cat.id} className="py-2">
              <button
                onClick={() => {
                  setSelectedCategorySlug(cat.slug);
                  onClose();
                  onNavigate(`/category/${cat.slug}`);
                }}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-teal-50 dark:hover:bg-stone-800 text-left transition-colors group"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-200 dark:border-stone-700 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate">
                    {language === 'bn' ? cat.nameBn : cat.name}
                  </p>
                  <p className="text-xs text-stone-400">
                    {cat.itemCount} {language === 'bn' ? 'টি পণ্য' : 'items'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-teal-600 transition-colors" />
              </button>

              {/* Subcategories */}
              {cat.subcategories && cat.subcategories.length > 0 && (
                <div className="pl-14 pr-2 pt-1 flex flex-wrap gap-1.5">
                  {cat.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setSelectedCategorySlug(cat.slug);
                        onClose();
                        onNavigate(`/category/${cat.slug}?sub=${sub.slug}`);
                      }}
                      className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] text-stone-600 dark:text-stone-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 hover:text-teal-700 transition-colors"
                    >
                      {language === 'bn' ? sub.nameBn : sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
