import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, Shield, CheckCircle2, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface StaticPageProps {
  type: 'about' | 'contact' | 'faq' | 'privacy' | 'terms' | 'returns';
  onNavigate: (path: string) => void;
}

export const StaticPage: React.FC<StaticPageProps> = ({ type, onNavigate }) => {
  const { language, t, showToast } = useStore();

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast(
      language === 'bn'
        ? 'ধন্যবাদ! আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।'
        : 'Thank you! Your message has been sent. Our support team will reply shortly.',
      'success'
    );
  };

  const faqs = [
    {
      q: 'How long does delivery take across Bangladesh?',
      qBn: 'সারা বাংলাদেশে ডেলিভারি পেতে কত সময় লাগে?',
      a: 'Inside Dhaka city, deliveries are completed within 24 to 48 hours. For all other 63 districts, deliveries typically take 3 to 5 business days via Steadfast Courier and Pathao Express.',
      aBn: 'ঢাকা সিটির ভেতরে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি সম্পন্ন হয়। ঢাকার বাইরে দেশের যেকোনো জেলা ও উপজেলায় ৩ থেকে ৫ কর্মদিবসের মধ্যে ডেলিভারি সম্পন্ন হয়।',
    },
    {
      q: 'What are the delivery charges?',
      qBn: 'ডেলিভারি চার্জ কত?',
      a: 'Inside Dhaka is ৳60 and Outside Dhaka is ৳120. We also provide Express urgent delivery for ৳180. Orders exceeding ৳2,000 qualify for FREE standard delivery nationwide!',
      aBn: 'ঢাকা সিটির ভেতরে ডেলিভারি চার্জ ৬০ টাকা এবং ঢাকার বাইরে ১২০ টাকা। জরুরি প্রয়োজনে ১৮০ টাকায় এক্সপ্রেস ডেলিভারি সুবিধা রয়েছে। ২,০০০ টাকার বেশি অর্ডারে সারা দেশে ডেলিভারি সম্পূর্ণ ফ্রি!',
    },
    {
      q: 'Can I pay Cash on Delivery (COD)?',
      qBn: 'ক্যাশ অন ডেলিভারিতে কি পণ্য নেওয়া যাবে?',
      a: 'Yes! Cash on Delivery is available across all 64 districts of Bangladesh. You only pay when you inspect and receive the parcel at your doorstep.',
      aBn: 'হ্যাঁ! বাংলাদেশের ৬৪টি জেলাতেই ক্যাশ অন ডেলিভারি (ক্যাশ অন হোম ডেলিভারি) সুবিধা রয়েছে। পার্সেল হাতে পেয়ে মূল্য পরিশোধ করতে পারবেন।',
    },
    {
      q: 'What is your return and exchange policy?',
      qBn: 'পণ্য পরিবর্তন বা রিটার্ন করার নিয়ম কী?',
      a: 'We offer an easy 7-day hassle-free return policy. If you receive a defective, damaged, or incorrect item, contact our helpline (+880 9612-345678) or email support@shopbd.com for instant replacement or refund.',
      aBn: 'আমরা ৭ দিনের সহজ রিটার্ন পলিসি প্রদান করি। ত্রুটিপূর্ণ বা ভুল পণ্য পেলে আমাদের হটলাইন (+880 9612-345678) বা সাপোর্টে জানালে তাৎক্ষণিক রিপ্লেসমেন্ট অথবা রিফান্ড দেওয়া হয়।',
    },
    {
      q: 'How do I pay with bKash or Nagad?',
      qBn: 'বিকাশ বা নগদে কীভাবে পেমেন্ট করব?',
      a: 'During checkout, select bKash or Nagad. You will receive immediate merchant account payment prompts and instructions for 100% secure mobile verification.',
      aBn: 'চেকআউটে বিকাশ বা নগদ অপশন সিলেক্ট করুন। সেখানে দেওয়া মার্চেন্ট নম্বরে "Make Payment" করে সহজে অর্ডার নিশ্চিত করতে পারবেন।',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 space-y-8 pt-4">
      {/* 1. ABOUT US */}
      {type === 'about' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-10 space-y-6 shadow-sm">
          <div className="space-y-2">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
              {language === 'bn' ? 'আমাদের সম্পর্কে' : 'About ShopBD'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              {language === 'bn'
                ? 'বাংলাদেশের নির্ভরযোগ্য ও প্রিমিয়াম ই-কমার্স প্ল্যাটফর্ম'
                : 'Empowering Seamless E-Commerce Across Bangladesh'}
            </h1>
          </div>

          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed space-y-4">
            <p>
              Founded with the vision of connecting authentic Bangladeshi craftsmanship and essential modern products with consumers across all 64 districts, <strong>ShopBD</strong> is committed to delivering quality, trust, and speed.
            </p>
            <p>
              From certified traditional Dhakai Jamdani sarees handwoven in Rupganj, Narayanganj, to genuine cold-pressed mustard oil, Rajshahi silks, and verified international electronics with official warranties, every item on our catalog undergoes rigorous authenticity inspections.
            </p>
            <p>
              Headquartered in Banani, Dhaka, our fulfillment centers operate 24/7 with real-time stock management and nationwide courier routing via Steadfast Courier and Pathao Express.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-stone-100 dark:border-stone-800 text-center">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40">
              <p className="text-2xl font-black text-teal-600 font-mono">64</p>
              <p className="text-xs text-stone-500 font-semibold mt-1">Districts Covered</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40">
              <p className="text-2xl font-black text-teal-600 font-mono">100%</p>
              <p className="text-xs text-stone-500 font-semibold mt-1">Quality Inspection</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40">
              <p className="text-2xl font-black text-teal-600 font-mono">24/48h</p>
              <p className="text-xs text-stone-500 font-semibold mt-1">Dhaka Fast Delivery</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. CONTACT US */}
      {type === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Info (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                {t('contact')}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight mt-1">
                {language === 'bn' ? 'আমাদের সাথে যোগাযোগ করুন' : 'Get in Touch with Us'}
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Have questions about orders, corporate purchases, or seller partnerships?
              </p>
            </div>

            <div className="space-y-4 text-xs text-stone-600 dark:text-stone-300">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 dark:text-white">Head Office</p>
                  <p className="text-stone-500">House 42, Road 11, Block D, Banani, Dhaka-1213, Bangladesh</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 dark:text-white">Helpline Hotline</p>
                  <p className="text-stone-500">+880 9612-345678 (9:00 AM – 10:00 PM)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 dark:text-white">Email Inquiries</p>
                  <p className="text-stone-500">support@shopbd.com / orders@shopbd.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Inquiry Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900 dark:text-white">
              {language === 'bn' ? 'বার্তা পাঠান' : 'Send us a Message'}
            </h2>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                  {language === 'bn' ? 'বার্তা সফলভাবে পাঠানো হয়েছে!' : 'Message Sent Successfully!'}
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Our customer care officer will get in touch with you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">{t('fullName')} *</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{t('phone')} *</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">{t('email')} *</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    placeholder="Order query, delivery status, partnership..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Your Message *</label>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                    rows={4}
                    placeholder="How can we help you today?"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <span>Submit Inquiry</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 3. FAQ */}
      {type === 'faq' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-10 space-y-6 shadow-sm">
          <div className="space-y-2">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
              {t('faq')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              {language === 'bn' ? 'সাধারণ জিজ্ঞাসা ও উত্তর' : 'Frequently Asked Questions'}
            </h1>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {faqs.map((f, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left font-bold text-sm sm:text-base text-stone-900 dark:text-white hover:text-teal-600 transition-colors"
                  >
                    <span>{language === 'bn' ? f.qBn : f.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-400 transition-transform ${
                        isOpen ? 'rotate-180 text-teal-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed pr-6 animate-in fade-in-50">
                      {language === 'bn' ? f.aBn : f.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. POLICIES: Privacy, Terms, Returns */}
      {(type === 'privacy' || type === 'terms' || type === 'returns') && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-10 space-y-6 shadow-sm">
          <h1 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">
            {type === 'privacy'
              ? t('privacyPolicy')
              : type === 'terms'
              ? t('termsConditions')
              : t('returnPolicy')}
          </h1>

          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed space-y-4">
            {type === 'returns' ? (
              <>
                <p>
                  At ShopBD, customer satisfaction is our highest priority. We provide a comprehensive <strong>7-Day Return and Replacement Policy</strong> across Bangladesh.
                </p>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">Conditions for Return:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Item must be in unused condition with all original tags, boxes, and warranty cards.</li>
                  <li>In case of damages during courier transit, please notify support within 24 hours of delivery.</li>
                  <li>Refunds for bKash, Nagad, and card payments will be processed back to the original funding account within 3-5 business days.</li>
                </ul>
              </>
            ) : type === 'privacy' ? (
              <>
                <p>
                  ShopBD respects your personal privacy. We never sell, lease, or share your phone number, delivery address, or credentials with third-party advertising networks.
                </p>
                <p>
                  Your delivery information is solely shared with authorized courier logistics providers (Steadfast Courier / Pathao) strictly to ensure successful doorstep fulfillment.
                </p>
              </>
            ) : (
              <>
                <p>
                  Welcome to ShopBD. By placing orders on our website, you agree to our standard terms of sale, including accurate delivery details and lawful use of payment mechanisms.
                </p>
                <p>
                  All prices are listed in Bangladeshi Taka (BDT ৳) and are inclusive of standard local taxes.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
