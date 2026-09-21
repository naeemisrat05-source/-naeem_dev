import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  CreditCard,
  Flame,
  Star,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { language, t, products, categories, setSelectedCategorySlug } = useStore();

  // Hero Slider
  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = [
    {
      id: 'ban_01',
      title: 'Festive Season Grand Sale',
      titleBn: 'উৎসবের সেরা কেনাকাটা',
      subtitle: 'Up to 35% Off on Traditional Jamdani, Silk Panjabis & Modern Electronics',
      subtitleBn: 'আভিজাত্যময় জামদানি, উৎসবের পাঞ্জাবি ও গ্যাজেটে ৩৫% পর্যন্ত অবিশ্বাস্য মূল্যছাড়!',
      badge: 'MEGA SALE',
      badgeBn: 'মেগা সেল',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1400&q=80',
      link: '/shop',
    },
    {
      id: 'ban_02',
      title: '100% Pure & Organic Groceries',
      titleBn: 'খাঁটি ও স্বাস্থ্যকর দেশীয় খাদ্যপণ্য',
      subtitle: 'Cold-pressed Mustard Oil, Sreemangal Tea, & Sundarbans Raw Honey Delivered Fast',
      subtitleBn: 'ঘানি ভাঙা সরিষার তেল, শ্রীমঙ্গলের চা পাতা ও সুন্দরবনের খাঁটি মধু সরাসরি আপনার ঘরে।',
      badge: 'ORGANIC FOOD',
      badgeBn: 'অর্গানিক ফুড',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80',
      link: '/category/grocery',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Flash Sale Countdown Timer (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashSaleProducts = products.filter((p) => p.discountPercent && p.discountPercent >= 15).slice(0, 4);
  const featuredProducts = products.filter((p) => p.featured).slice(0, 8);
  const bestSellers = products.filter((p) => p.bestSeller).slice(0, 8);
  const newArrivals = products.filter((p) => p.newArrival).slice(0, 4);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner Slider */}
      <section className="relative w-full overflow-hidden bg-stone-900 rounded-3xl mx-auto max-w-7xl shadow-xl">
        <div
          className="flex transition-transform duration-700 ease-out h-[320px] sm:h-[420px] md:h-[480px]"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((ban) => (
            <div key={ban.id} className="w-full shrink-0 relative flex items-center">
              <img
                src={ban.image}
                alt={ban.title}
                className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent" />

              <div className="relative z-10 max-w-2xl px-6 sm:px-12 space-y-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-md">
                  <Flame className="w-3.5 h-3.5" />
                  {language === 'bn' ? ban.badgeBn : ban.badge}
                </span>

                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  {language === 'bn' ? ban.titleBn : ban.title}
                </h1>

                <p className="text-sm sm:text-base text-stone-300 max-w-lg leading-relaxed">
                  {language === 'bn' ? ban.subtitleBn : ban.subtitle}
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => onNavigate(ban.link)}
                    className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-900/40 hover:shadow-teal-900/60 transition-all flex items-center gap-2"
                  >
                    <span>{t('shopNow')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('/shop')}
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md transition-colors"
                  >
                    {t('exploreCollection')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slider Controls */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === idx ? 'w-6 bg-teal-400' : 'w-2 bg-white/50'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">{t('fastDelivery')}</h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">{t('fastDeliveryDesc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">{t('authenticProducts')}</h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">{t('authenticProductsDesc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">{t('securePayment')}</h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">{t('securePaymentDesc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">{t('easyReturn')}</h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">{t('easyReturnDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight">
              {t('topCategories')}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
              {language === 'bn' ? 'আপনার প্রয়োজনীয় পণ্য খুঁজে নিন' : 'Explore by category'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('/shop')}
            className="text-xs sm:text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 group"
          >
            <span>{t('viewAll')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                setSelectedCategorySlug(cat.slug);
                onNavigate(`/category/${cat.slug}`);
              }}
              className="group bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-3 flex flex-col items-center text-center cursor-pointer hover:shadow-md hover:border-teal-500/50 transition-all"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mb-3 bg-stone-100 dark:bg-stone-800">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 group-hover:text-teal-600 transition-colors line-clamp-1">
                {language === 'bn' ? cat.nameBn : cat.name}
              </h3>
              <span className="text-[10px] text-stone-400 mt-0.5">
                {cat.itemCount} {language === 'bn' ? 'পণ্য' : 'items'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Flash Sale with Countdown Timer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-rose-900 via-rose-800 to-amber-950 rounded-3xl p-5 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-rose-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-md">
                <Flame className="w-6 h-6 text-amber-400 animate-bounce" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">{t('flashSale')}</h2>
                <p className="text-xs text-rose-200">
                  {language === 'bn' ? 'সীমিত সময়ের জন্য বিশেষ ছাড়!' : 'Limited time mega discounts'}
                </p>
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-semibold text-rose-200 mr-1">{t('endsIn')}:</span>
              <div className="flex items-center gap-1.5 font-mono text-xs font-black">
                <span className="px-2.5 py-1 rounded-lg bg-black/40 text-amber-300 border border-white/10">
                  {String(timeLeft.hours).padStart(2, '0')} {t('hours')}
                </span>
                <span>:</span>
                <span className="px-2.5 py-1 rounded-lg bg-black/40 text-amber-300 border border-white/10">
                  {String(timeLeft.minutes).padStart(2, '0')} {t('minutes')}
                </span>
                <span>:</span>
                <span className="px-2.5 py-1 rounded-lg bg-black/40 text-amber-300 border border-white/10">
                  {String(timeLeft.seconds).padStart(2, '0')} {t('seconds')}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {flashSaleProducts.map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight">
              {t('featuredProducts')}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
              {language === 'bn' ? 'শপবিডির সেরা নির্বাচিত পণ্যসমূহ' : 'Curated premium picks for you'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('/shop')}
            className="text-xs sm:text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 group"
          >
            <span>{t('viewAll')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* Promotional Deal Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white p-6 sm:p-12 shadow-xl border border-teal-700/50">
          <div className="max-w-xl space-y-3 relative z-10">
            <span className="px-3 py-1 rounded-full bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider">
              {language === 'bn' ? 'বিশেষ ডিসকাউন্ট কুপন' : 'EXCLUSIVE COUPON'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              {language === 'bn' ? 'কুপন কোড ব্যবহার করুন: SHOPBD10' : 'Use Voucher Code: SHOPBD10'}
            </h3>
            <p className="text-sm text-teal-100 leading-relaxed">
              {language === 'bn'
                ? '১,০০০ টাকার বেশি অর্ডারে সাথে সাথে পান ১০% ছাড়। বিকাশ, নগদ বা ক্যাশ অন ডেলিভারিতে দ্রুত সারা বাংলাদেশে হোম ডেলিভারি!'
                : 'Get 10% instant discount on orders over ৳1,000. Fast home delivery across Bangladesh via bKash, Nagad, or COD!'}
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('/shop')}
                className="px-6 py-2.5 rounded-xl bg-white text-teal-900 hover:bg-stone-100 font-bold text-sm shadow-md transition-colors"
              >
                {t('shopNow')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight">
              {t('bestSellers')}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
              {language === 'bn' ? 'গ্রাহকদের সবচেয়ে পছন্দের পণ্য' : 'Top trending products ordered most'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('/shop')}
            className="text-xs sm:text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 group"
          >
            <span>{t('viewAll')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </section>
    </div>
  );
};
