import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../firebase';
import { collection, query, getDocs, limit, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { PenTool, Target, Calendar, Globe2, FileText, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

interface Article {
  id: string;
  title: string;
  status: string;
  blogName: string;
  imageUrl?: string;
  bloggerUrl?: string;
  createdAt: any;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { isAR } = useLanguage();
  const navigate = useNavigate();

  const t = {
    welcome: isAR ? 'مرحباً بك،' : 'Welcome back,',
    creator: isAR ? 'المبدع' : 'Creator',
    desc: isAR ? 'عزز قوة السيو لمدونتك اليوم. لديك' : "Let's power up your SEO today. You have",
    articlesInArchive: isAR ? 'مقال في أرشيفك.' : 'articles in your archive.',
    generateNew: isAR ? 'توليد مقال جديد' : 'Generate New Article',
    totalArticles: isAR ? 'إجمالي المقالات' : 'Total Articles',
    published: isAR ? 'منشورة' : 'Published',
    drafts: isAR ? 'مسودات' : 'Drafts',
    linkedBlogs: isAR ? 'مدونات مرتبطة' : 'Linked Blogs',
    recentArticles: isAR ? 'آخر المقالات' : 'Recent Articles',
    viewAll: isAR ? 'عرض الكل' : 'View All',
    noArticles: isAR ? 'لا توجد مقالات منشورة بعد.' : 'No articles published yet.',
    blog: isAR ? 'المدونة:' : 'Blog:',
    publishedStatus: isAR ? 'تم النشر' : 'Published',
    draftStatus: isAR ? 'مسودة' : 'Draft',
    performance: isAR ? 'إحصائيات الأداء' : 'Performance Stats',
    avgSeo: isAR ? 'متوسط قوة السيو' : 'Avg SEO Score',
    automationRate: isAR ? 'معدل الأتمتة' : 'Automation Rate',
    new: isAR ? 'جديد' : 'New',
    upgradeTitle: isAR ? 'حول إلى باقة برو' : 'Upgrade to Pro',
    upgradeDesc: isAR ? 'فعل ميزات الذكاء الاصطناعي اللامحدودة، تحسين السيو المتقدم، والنشر التلقائي الذكي.' : 'Unlock unlimited AI generation, premium SEO optimization, and priority auto-publishing.',
    viewPlans: isAR ? 'عرض الخطط' : 'View Plans',
  };

  const [stats, setStats] = useState({ totalArticles: 0, published: 0, drafts: 0, blogs: 0 });
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;

    // Fetch Stats
    const fetchStats = async () => {
      try {
        const blogsQ = query(collection(db, 'user_blogs'), where('userId', '==', user.uid));
        const blogsSnap = await getDocs(blogsQ);
        const articlesQ = query(collection(db, 'articles'), where('userId', '==', user.uid));
        const articlesSnap = await getDocs(articlesQ);
        
        const allArticles = articlesSnap.docs;
        setStats({
          totalArticles: allArticles.length,
          published: allArticles.filter(d => d.data().status === 'published').length,
          drafts: allArticles.filter(d => d.data().status === 'draft').length,
          blogs: blogsSnap.size
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'stats');
      }
    };

    // Fetch Recent Articles (Real-time)
    const recentQ = query(
      collection(db, 'articles'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    const unsubscribe = onSnapshot(recentQ, (snapshot) => {
      const fetched: Article[] = [];
      snapshot.forEach(doc => {
        fetched.push({ id: doc.id, ...doc.data() } as Article);
      });
      setRecentArticles(fetched);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'recent_articles');
      setLoading(false);
    });

    fetchStats();
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <header className="flex justify-between items-center bg-blue-900/20 border border-blue-800/30 p-6 rounded-2xl relative overflow-hidden">
        <div className={`absolute top-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none ${isAR ? 'left-0' : 'right-0'}`}></div>
        <div className="relative z-10 w-full flex flex-col">
          <h1 className="text-2xl font-bold text-white mb-2">{t.welcome} {profile?.name?.split(' ')[0] || t.creator}</h1>
          <p className="text-blue-300/80 max-w-md">{t.desc} {stats.totalArticles} {t.articlesInArchive}</p>
        </div>
        <div className="relative z-10 hidden sm:block shrink-0">
          <Link to="/blog-settings" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition flex items-center gap-2">
            <PenTool className="w-5 h-5" /> {t.generateNew}
          </Link>
        </div>
      </header>
      
      {/* Stat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-blue-500">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">{t.totalArticles}</div>
            <div className="text-2xl font-black text-white">{stats.totalArticles}</div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">{t.published}</div>
            <div className="text-2xl font-black text-white">{stats.published}</div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-purple-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">{t.drafts}</div>
            <div className="text-2xl font-black text-white">{stats.drafts}</div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-amber-500">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">{t.linkedBlogs}</div>
            <div className="text-2xl font-black text-white">{stats.blogs}</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.8fr_1fr] gap-6 flex-1 items-start mt-2">
        {/* Recent Articles */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">{t.recentArticles}</h2>
            <Link to="/articles" className="text-blue-500 text-sm hover:underline font-medium">{t.viewAll}</Link>
          </div>
          
          <div className="space-y-3">
            {loading ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : recentArticles.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                {t.noArticles}
              </div>
            ) : recentArticles.map(article => (
              <div key={article.id} className="flex items-center justify-between p-4 bg-gray-950 border border-gray-800 rounded-xl gap-4">
                <div className="flex items-center gap-4 flex-1">
                  {article.imageUrl ? (
                    <img src={article.imageUrl} alt={article.title} className="w-16 h-12 rounded object-cover border border-gray-800" />
                  ) : (
                    <div className="w-16 h-12 rounded bg-gray-800 border border-gray-700 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-white mb-1">{article.title}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <span>{t.blog} {article.blogName}</span> • <span>{article.createdAt?.toDate().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {article.bloggerUrl && (
                    <a href={article.bloggerUrl} target="_blank" rel="noreferrer" className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <div className={`${article.status === 'published' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900/50' : 'bg-gray-800 text-gray-300 border-gray-700'} border px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest`}>
                    {article.status === 'published' ? t.publishedStatus : t.draftStatus}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar Elements */}
        <div className="flex flex-col gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
               <Target className="w-4 h-4 text-blue-500" />
               {t.performance}
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  <span>{t.avgSeo}</span>
                  <span className="text-emerald-400">92%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[92%]" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  <span>{t.automationRate}</span>
                  <span className="text-white bg-blue-600 px-1.5 py-0.5 rounded text-[8px]">{t.new}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[45%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-900/50 rounded-2xl p-6 relative overflow-hidden">
            <h2 className="text-base font-bold text-white mb-2">{t.upgradeTitle}</h2>
            <p className="text-sm text-gray-400 mb-6">{t.upgradeDesc}</p>
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-500/20">
              {t.viewPlans}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
