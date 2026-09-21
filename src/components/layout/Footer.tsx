import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { language, t, categories } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 6000);
    }
  };

  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-24 lg:pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Newsletter Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 rounded-3xl p-6 sm:p-8 mb-12 shadow-xl border border-teal-700/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {t('newsletterTitle')}
              </h3>
              <p className="text-sm text-teal-100/80 mt-1">{t('newsletterDesc')}</p>
            </div>

            <div className="w-full md:w-auto">
              {subscribed ? (
                <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-950/80 border border-teal-500/50 text-teal-200 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-teal-400" />
                  <span>{t('subscribedSuccess')}</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    required
                    className="px-4 py-3 rounded-xl bg-white text-stone-900 text-sm placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-teal-400 flex-1 shadow-sm"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <span>{t('subscribe')}</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12 text-sm">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                <span>S</span>
                <span className="text-orange-400 font-bold text-sm">BD</span>
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Shop<span className="text-teal-400">BD</span>
                </span>
                <p className="text-xs text-stone-400">{t('tagline')}</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm">
              {t('aboutShopBdDesc')}
            </p>

            <div className="space-y-2 text-xs text-stone-400 pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>House 42, Road 11, Banani C/A, Dhaka-1213, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>+880 9612-345678 (9:00 AM - 10:00 PM)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>support@shopbd.com</span>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-white font-bold mb-4 tracking-wide uppercase text-xs">
              {t('topCategories')}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate(`/category/${cat.slug}`)}
                    className="hover:text-teal-400 transition-colors text-left"
                  >
                    {language === 'bn' ? cat.nameBn : cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-white font-bold mb-4 tracking-wide uppercase text-xs">
              {t('customerCare')}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/track-order')}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  {t('trackOrder')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/faq')}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  {t('faq')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/returns')}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  {t('returnPolicy')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  {t('contact')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  {t('about')}
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Policy */}
          <div>
            <h4 className="text-white font-bold mb-4 tracking-wide uppercase text-xs">
              {language === 'bn' ? 'শর্ত ও পলিসি' : 'Legal & Policies'}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/privacy')}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  {t('privacyPolicy')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/terms')}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  {t('termsConditions')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/returns')}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  {t('easyReturn')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Gateways Bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-stone-300">{t('paymentMethods')}:</span>
            <span className="px-2.5 py-1 rounded bg-rose-950/80 text-rose-300 font-bold border border-rose-800/60">
              bKash (বিকাশ)
            </span>
            <span className="px-2.5 py-1 rounded bg-orange-950/80 text-orange-300 font-bold border border-orange-800/60">
              Nagad (নগদ)
            </span>
            <span className="px-2.5 py-1 rounded bg-purple-950/80 text-purple-300 font-bold border border-purple-800/60">
              Rocket (রকেট)
            </span>
            <span className="px-2.5 py-1 rounded bg-blue-950/80 text-blue-300 font-bold border border-blue-800/60">
              SSLCommerz / Cards
            </span>
            <span className="px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-800/60">
              Cash on Delivery (ক্যাশ অন ডেলিভারি)
            </span>
          </div>

          <p className="text-center md:text-right">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
};
