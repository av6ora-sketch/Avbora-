import { Link } from 'react-router-dom';
import { PenTool, Search, ArrowRight, Rss, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Home() {
  const { language, setLanguage, isAR } = useLanguage();

  const content = {
    EN: {
      brand: 'Avbora',
      login: 'Login',
      register: 'Sign Up',
      heroTag: 'AI-Powered Blog Management',
      heroTitle: 'Automate your blogging',
      heroHighlight: 'with AI & SEO',
      heroDesc: 'Avbora helps you auto-generate SEO-optimized articles, manage content without manual intervention, and automatically publish to Blogger.',
      startNow: 'Start Now',
      explore: 'Explore',
      aboutTitle: 'About Avbora',
      aboutDesc: 'Avbora is an intelligent blog management system powered by AI. We take the heavy lifting out of content creation. Our platform generates highly optimized articles, ensures they rank well in search engines, and schedules them directly to your blog.',
      featuresTitle: 'Everything you need to scale your blog',
      f1Title: 'AI Article Generation',
      f1Desc: 'Generate full-length, high-quality articles automatically with advanced AI.',
      f2Title: 'Auto SEO Optimization',
      f2Desc: 'Built-in keyword research, meta descriptions, and title optimization for higher rankings.',
      f3Title: 'Auto Publishing',
      f3Desc: 'Connect your Blogger account and let Avbora handle scheduling and publishing automatically.',
      f4Title: 'Effortless Management',
      f4Desc: 'Manage hundreds of articles, drafts, and media files from a single, intuitive dashboard.',
      howItWorksTitle: 'How it works',
      step1: 'Link Your Blog',
      step1Desc: 'Connect your Blogger account securely in one click.',
      step2: 'Create Article',
      step2Desc: 'Set your topic and let the AI generate a complete article.',
      step3: 'SEO Optimization',
      step3Desc: 'The system automatically optimizes headings and keywords.',
      step4: 'Auto Publish',
      step4Desc: 'Your article is published or scheduled automatically.',
      statsTitle: 'Trusted by creators',
      stat1: '10K+',
      stat1Lbl: 'Articles Generated',
      stat2: '95%',
      stat2Lbl: 'SEO Score Avg',
      stat3: '500+',
      stat3Lbl: 'Blogs Connected',
      faqTitle: 'Frequently Asked Questions',
      faq1Q: 'Can I connect multiple Blogger accounts?',
      faq1A: 'Yes! Depending on your plan, you can connect and manage multiple Blogger accounts from a single Avbora dashboard.',
      faq2Q: 'Is the generated content SEO optimized?',
      faq2A: 'Absolutely. Our AI is trained to follow SEO best practices, including proper heading structures, keyword density, and meta descriptions.',
      faq3Q: 'Do I need technical skills to use Avbora?',
      faq3A: 'Not at all. If you know how to click a button, you can use Avbora. We handle all the API connections and complex logic behind the scenes.',
      ctaTitle: 'Ready to automate your blog?',
      ctaDesc: 'Join thousands of creators who are using Avbora to scale their content creation.',
      footerRights: 'All rights reserved.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      contact: 'Contact Us',
    },
    AR: {
      brand: 'Avbora',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      heroTag: 'إدارة المدونات بالذكاء الاصطناعي',
      heroTitle: 'أتمتة التدوين الخاصة بك',
      heroHighlight: 'بالذكاء الاصطناعي والـ SEO',
      heroDesc: 'تساعدك منصة Avbora على إنشاء مقالات متوافقة مع السيو تلقائياً، وإدارة المحتوى بدون تدخل يدوي، والنشر التلقائي على بلوجر.',
      startNow: 'ابدأ الآن',
      explore: 'استكشاف',
      aboutTitle: 'من نحن',
      aboutDesc: 'منصة Avbora هي نظام ذكي لإدارة المدونات يعتمد على الذكاء الاصطناعي. نحن نقوم بالعمل الشاق بدلاً منك، حيث نولد مقالات محسنة، ونضمن ترتيبها في محركات البحث، ونجدولها مباشرة على مدونتك.',
      featuresTitle: 'كل ما تحتاجه لتكبير مدونتك',
      f1Title: 'كتابة مقالات بالـ AI',
      f1Desc: 'قم بإنشاء مقالات كاملة وعالية الجودة بشكل تلقائي تماماً.',
      f2Title: 'تحسين SEO تلقائي',
      f2Desc: 'بحث عن الكلمات المفتاحية، وتحسين العناوين للظهور في النتائج الأولى.',
      f3Title: 'نشر تلقائي',
      f3Desc: 'اربط حساب بلوجر الخاص بك ودعنا نتولى الجدولة والنشر.',
      f4Title: 'إدارة سلسة',
      f4Desc: 'إدارة مئات المقالات والمسودات وملفات الميديا من لوحة تحكم واحدة.',
      howItWorksTitle: 'كيف تعمل المنصة',
      step1: 'ربط المدونة',
      step1Desc: 'قم بربط حساب بلوجر الخاص بك بأمان وبنقرة واحدة.',
      step2: 'إنشاء المقال',
      step2Desc: 'حدد موضوعك ودع الذكاء الاصطناعي يكتب المقال.',
      step3: 'تحسين SEO',
      step3Desc: 'يقوم النظام تلقائياً بتهيئة الكلمات المفتاحية والعناوين.',
      step4: 'النشر التلقائي',
      step4Desc: 'يتم نشر المقال أو جدولته بشكل تلقائي.',
      statsTitle: 'موثوق من صناع المحتوى',
      stat1: '+10 آلاف',
      stat1Lbl: 'مقال تم إنشاؤه',
      stat2: '95%',
      stat2Lbl: 'متوسط السيو',
      stat3: '+500',
      stat3Lbl: 'مدونة مرتبطة',
      faqTitle: 'الأسئلة الشائعة',
      faq1Q: 'هل يمكنني ربط عدة حسابات بلوجر؟',
      faq1A: 'نعم! اعتماداً على باقتك، يمكنك ربط وإدارة عدة حسابات بلوجر من لوحة تحكم واحدة.',
      faq2Q: 'هل المحتوى الذي يتم إنشاؤه متوافق مع السيو؟',
      faq2A: 'بالتأكيد. تم تدريب الذكاء الاصطناعي لدينا على اتباع أفضل ممارسات تحسين محركات البحث السيو، بما في ذلك الهياكل الصحيحة وتسلسل الكلمات المفتاحية والأوصاف.',
      faq3Q: 'هل أحتاج إلى مهارات تقنية لاستخدام المنصة؟',
      faq3A: 'على الإطلاق. إذا كنت تعرف كيفية النقر على زر، يمكنك استخدام Avbora. نحن نتولى جميع الاتصالات التقنية في الخلفية.',
      ctaTitle: 'هل أنت مستعد لأتمتة مدونتك؟',
      ctaDesc: 'انضم إلى آلاف صناع المحتوى الذين يستخدمون Avbora لتوسيع نطاق إنتاجهم.',
      footerRights: 'جميع الحقوق محفوظة.',
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الخدمة',
      contact: 'اتصل بنا',
    }
  };

  const t = content[language];

  return (
    <div className={`min-h-screen bg-gray-950 text-gray-200 selection:bg-blue-500/30 font-sans`}>
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-500" />
              <span className="text-xl font-bold text-white tracking-tight">{t.brand}</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition">
                {t.login}
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                {t.register}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 pt-24 pb-32 overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-950/50 border border-blue-800/50 text-blue-400 text-sm font-bold mb-4 uppercase tracking-widest">
            {t.heroTag}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            {t.heroTitle} <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              {t.heroHighlight}
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t.heroDesc}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              {t.startNow} <ArrowRight className={`w-5 h-5 ${isAR ? 'rotate-180' : ''}`} />
            </Link>
            <a href="#about" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 hover:border-gray-700 text-white font-bold text-lg transition flex items-center justify-center">
              {t.explore}
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-16 bg-blue-600/5 border-y border-blue-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-800">
            <div className="py-4">
              <div className="text-4xl font-black text-white mb-2">{t.stat1}</div>
              <div className="text-gray-400 font-medium uppercase tracking-wide text-sm">{t.stat1Lbl}</div>
            </div>
            <div className="py-4">
              <div className="text-4xl font-black text-emerald-400 mb-2">{t.stat2}</div>
              <div className="text-gray-400 font-medium uppercase tracking-wide text-sm">{t.stat2Lbl}</div>
            </div>
            <div className="py-4 border-gray-800">
              <div className="text-4xl font-black text-white mb-2">{t.stat3}</div>
              <div className="text-gray-400 font-medium uppercase tracking-wide text-sm">{t.stat3Lbl}</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="px-4 py-24 bg-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">{t.aboutTitle}</h2>
          <p className="text-xl text-gray-400 leading-relaxed">
            {t.aboutDesc}
          </p>
        </div>
      </section>

      {/* Features Preview */}
      <section className="px-4 py-24 bg-gray-900/30 border-y border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">{t.featuresTitle}</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8 hover:border-blue-500/50 transition duration-300">
              <div className="w-12 h-12 bg-blue-900/30 text-blue-400 rounded-xl flex items-center justify-center mb-6">
                <PenTool className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t.f1Title}</h3>
              <p className="text-gray-400 text-sm">{t.f1Desc}</p>
            </div>

            <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8 hover:border-emerald-500/50 transition duration-300">
              <div className="w-12 h-12 bg-emerald-900/30 text-emerald-400 rounded-xl flex items-center justify-center mb-6">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t.f2Title}</h3>
              <p className="text-gray-400 text-sm">{t.f2Desc}</p>
            </div>

            <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition duration-300">
              <div className="w-12 h-12 bg-purple-900/30 text-purple-400 rounded-xl flex items-center justify-center mb-6">
                <Rss className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t.f3Title}</h3>
              <p className="text-gray-400 text-sm">{t.f3Desc}</p>
            </div>

            <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8 hover:border-yellow-500/50 transition duration-300">
              <div className="w-12 h-12 bg-yellow-900/30 text-yellow-400 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t.f4Title}</h3>
              <p className="text-gray-400 text-sm">{t.f4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">{t.howItWorksTitle}</h2>
          </div>
          
          <div className="space-y-6">
            {[ 
              { step: 1, title: t.step1, desc: t.step1Desc },
              { step: 2, title: t.step2, desc: t.step2Desc },
              { step: 3, title: t.step3, desc: t.step3Desc },
              { step: 4, title: t.step4, desc: t.step4Desc }
            ].map((s) => (
              <div key={s.step} className="flex gap-6 items-center p-6 bg-gray-900 border border-gray-800 rounded-2xl hover:bg-gray-800/50 transition">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-900/30 text-blue-400 flex items-center justify-center font-black text-xl">
                  {s.step}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">{s.title}</h4>
                  <p className="text-gray-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-24 bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">{t.faqTitle}</h2>
          </div>
          
          <div className="space-y-6">
            {[
              { q: t.faq1Q, a: t.faq1A },
              { q: t.faq2Q, a: t.faq2A },
              { q: t.faq3Q, a: t.faq3A },
            ].map((faq, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" /> {faq.q}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed pl-5 md:pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ready to start CTA */}
      <section className="px-4 py-32 bg-blue-900/10 border-t border-blue-900/30 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">{t.ctaTitle}</h2>
          <p className="text-xl text-gray-400 mb-10">{t.ctaDesc}</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-105 duration-300">
            {t.startNow} <ArrowRight className={`w-5 h-5 ${isAR ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-800 bg-gray-950 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col gap-2 items-center md:items-start">
            <div className="text-gray-300 font-bold text-xl tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" /> {t.brand}
            </div>
            <div className="text-gray-600 text-sm font-medium">
              &copy; {new Date().getFullYear()} {t.brand}. {t.footerRights}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-gray-500">
             <Link to="/privacy-policy" className="hover:text-gray-300 transition">{t.privacy}</Link>
             <Link to="/terms-of-service" className="hover:text-gray-300 transition">{t.terms}</Link>
             <Link to="/contact" className="hover:text-gray-300 transition">{t.contact}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
