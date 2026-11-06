import React, { useState, useEffect, useMemo } from 'react';
import { 
  LucideLayout, LucideServer, LucideDatabase, LucideCode2, LucideSparkles,
  LucideShieldCheck, LucideLayers, LucideArrowRight, LucideSearch, LucidePlus,
  LucideEdit, LucideTrash2, LucideEye, LucideRefreshCw, LucideCheckCircle2,
  LucideGlobe, LucideTerminal, LucideCheck, LucideX, LucideSun, LucideMoon,
  LucideMenu, LucideExternalLink, LucideZap, LucideCpu, LucideCloud, LucideLock,
  LucideChevronRight, LucideFilter, LucideClock, LucideUser, LucideTag, LucideSend
} from 'lucide-react';

// --- INITIAL MOCK DATA ---
const INITIAL_CATEGORIES = ['Engineering', 'Cloud Architecture', 'DevOps', 'Product Design', 'AI & ML'];

const INITIAL_POSTS = [
  {
    id: 'post-1',
    title: 'Migrating from Legacy WordPress to Next.js & Node.js Architecture',
    slug: 'migrating-wordpress-to-nextjs-nodejs',
    summary: 'How Tactyqal Labs re-architected monolithic CMS platforms into decoupled, high-performance web applications with sub-100ms response times.',
    content: `# Executive Summary
Monolithic CMS solutions like traditional WordPress often bottleneck modern enterprise scaling due to heavy plugin overhead, database coupling, and slow server-side render times.

## Key Improvements
1. **Decoupled Architecture:** Using headless content delivery via Node.js microservices.
2. **Static & Incremental Rendering:** Utilizing Next.js ISR for instantaneous pages.
3. **Enhanced Security:** Zero exposed SQL/PHP vulnerabilities on the user-facing web tier.

## Results
- 94% reduction in Time to First Byte (TTFB).
- 4.2x increase in Google Lighthouse performance score.
- 60% lower hosting infrastructure expenditure.`,
    category: 'Engineering',
    author: 'Alex Morgan',
    authorRole: 'Principal Architect',
    readTime: '6 min read',
    tags: ['Next.js', 'Node.js', 'Migration', 'Performance'],
    status: 'Published',
    publishedAt: '2025-02-14',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'post-2',
    title: 'Building Resilient Microservices with Node.js and PostgreSQL',
    slug: 'building-resilient-microservices-nodejs-postgresql',
    summary: 'A deep dive into distributed transaction isolation, connection pooling, and circuit breaker patterns in cloud environments.',
    content: `# Introduction
Designing fault-tolerant microservices requires strict isolation patterns, optimized database pooling, and intelligent retries.

## Key Architectural Patterns
- **Connection Pooling:** Using PgBouncer and Knex/Prisma pool management to maintain low memory overhead.
- **Circuit Breakers:** Preventing cascading failures across HTTP APIs using Resilience4j principles in Node.js.
- **Eventual Consistency:** Outbox pattern for publishing asynchronous events safely.`,
    category: 'Cloud Architecture',
    author: 'David Chen',
    authorRole: 'Head of Infrastructure',
    readTime: '8 min read',
    tags: ['Node.js', 'PostgreSQL', 'Microservices', 'Docker'],
    status: 'Published',
    publishedAt: '2025-02-01',
    coverImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'post-3',
    title: 'Designing Accessible & Intuitive Enterprise Design Systems',
    slug: 'designing-accessible-enterprise-design-systems',
    summary: 'How unified UI component libraries accelerate frontend development speeds while keeping full accessibility compliance.',
    content: `# Overview
A design system is more than a color palette—it is a shared language between design teams, frontend engineers, and product managers.

## Highlights
- **WAI-ARIA Standards:** Ensuring screen-reader compliance out of the box.
- **Design Tokens:** Syncing Figma token variables directly to Tailwind CSS configs.
- **Component Scalability:** Building atomic UI primitives for cross-project reuse.`,
    category: 'Product Design',
    author: 'Elena Rostova',
    authorRole: 'Lead UI/UX Strategist',
    readTime: '4 min read',
    tags: ['UI/UX', 'Tailwind CSS', 'Design Systems', 'Accessibility'],
    status: 'Published',
    publishedAt: '2025-01-20',
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80'
  }
];

const DB_TABLES = [
  {
    name: 'posts',
    description: 'Core table for publishing blog posts and metadata',
    columns: [
      { name: 'id', type: 'UUID', key: 'PK', desc: 'Unique identifier' },
      { name: 'title', type: 'VARCHAR(255)', key: '', desc: 'Article title' },
      { name: 'slug', type: 'VARCHAR(255)', key: 'UNIQUE', desc: 'URL slug' },
      { name: 'summary', type: 'TEXT', key: '', desc: 'Excerpt / SEO description' },
      { name: 'content', type: 'TEXT', key: '', desc: 'Markdown content payload' },
      { name: 'category_id', type: 'UUID', key: 'FK', desc: 'Ref -> categories.id' },
      { name: 'author_id', type: 'UUID', key: 'FK', desc: 'Ref -> authors.id' },
      { name: 'status', type: 'VARCHAR(50)', key: '', desc: 'Draft | Published' },
      { name: 'created_at', type: 'TIMESTAMPTZ', key: '', desc: 'Creation timestamp' }
    ]
  },
  {
    name: 'authors',
    description: 'Stores content contributors and admin profiles',
    columns: [
      { name: 'id', type: 'UUID', key: 'PK', desc: 'Unique identifier' },
      { name: 'name', type: 'VARCHAR(100)', key: '', desc: 'Full display name' },
      { name: 'role', type: 'VARCHAR(100)', key: '', desc: 'Designation / Title' },
      { name: 'email', type: 'VARCHAR(255)', key: 'UNIQUE', desc: 'Author email address' },
      { name: 'avatar_url', type: 'TEXT', key: '', desc: 'Profile image link' }
    ]
  },
  {
    name: 'categories',
    description: 'Taxonomy for organizing posts by tech domain',
    columns: [
      { name: 'id', type: 'UUID', key: 'PK', desc: 'Unique identifier' },
      { name: 'name', type: 'VARCHAR(100)', key: 'UNIQUE', desc: 'Category label' },
      { name: 'slug', type: 'VARCHAR(100)', key: 'UNIQUE', desc: 'URL category slug' }
    ]
  },
  {
    name: 'tags',
    description: 'Granular topic tags for filtering content',
    columns: [
      { name: 'id', type: 'UUID', key: 'PK', desc: 'Unique identifier' },
      { name: 'name', type: 'VARCHAR(50)', key: 'UNIQUE', desc: 'Tag text' }
    ]
  },
  {
    name: 'post_tags',
    description: 'Junction table for Many-to-Many post-tag relations',
    columns: [
      { name: 'post_id', type: 'UUID', key: 'PK, FK', desc: 'Ref -> posts.id' },
      { name: 'tag_id', type: 'UUID', key: 'PK, FK', desc: 'Ref -> tags.id' }
    ]
  }
];

export default function App() {
  // Navigation & Theme State
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'blog' | 'cms' | 'api' | 'db'
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Blog & CMS State
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activePostModal, setActivePostModal] = useState(null);

  // CMS Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [currentPostForm, setCurrentPostForm] = useState({
    id: '',
    title: '',
    slug: '',
    summary: '',
    content: '',
    category: 'Engineering',
    author: 'Alex Morgan',
    authorRole: 'Principal Architect',
    readTime: '5 min read',
    tags: 'React, Node.js',
    status: 'Published',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
  });

  // API Tester State
  const [selectedEndpoint, setSelectedEndpoint] = useState('GET_ALL');
  const [apiResponse, setApiResponse] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [customApiPayload, setCustomApiPayload] = useState(
    JSON.stringify({
      title: "New AI Architecture Insights",
      slug: "new-ai-architecture-insights",
      category: "AI & ML",
      author: "Alex Morgan",
      summary: "Exploring real-time LLM caching techniques.",
      content: "Deep dive into vector caching and latency optimization...",
      status: "Published"
    }, null, 2)
  );

  // Notification Toast
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- CRUD HANDLERS ---
  const handleCreateNewClick = () => {
    setCurrentPostForm({
      id: '',
      title: '',
      slug: '',
      summary: '',
      content: '',
      category: 'Engineering',
      author: 'Alex Morgan',
      authorRole: 'Principal Architect',
      readTime: '5 min read',
      tags: 'React, Node.js',
      status: 'Published',
      coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
    });
    setIsEditing(true);
  };

  const handleEditClick = (post) => {
    setCurrentPostForm({
      ...post,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : post.tags
    });
    setIsEditing(true);
  };

  const handleDeletePost = (id) => {
    setPosts(posts.filter(p => p.id !== id));
    triggerToast('Post deleted successfully from database', 'info');
  };

  const handleSavePost = (e) => {
    e.preventDefault();
    if (!currentPostForm.title || !currentPostForm.summary) {
      triggerToast('Please fill out all required fields', 'error');
      return;
    }

    const formattedTags = typeof currentPostForm.tags === 'string'
      ? currentPostForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      : currentPostForm.tags;

    const generatedSlug = currentPostForm.slug || currentPostForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (currentPostForm.id) {
      // Update
      setPosts(posts.map(p => p.id === currentPostForm.id ? {
        ...currentPostForm,
        slug: generatedSlug,
        tags: formattedTags
      } : p));
      triggerToast('Post updated successfully!');
    } else {
      // Create
      const newPost = {
        ...currentPostForm,
        id: `post-${Date.now()}`,
        slug: generatedSlug,
        tags: formattedTags,
        publishedAt: new Date().toISOString().split('T')[0]
      };
      setPosts([newPost, ...posts]);
      triggerToast('New blog post created and published!');
    }
    setIsEditing(false);
  };

  // --- API TESTER RUNNER ---
  const executeApiCall = () => {
    setApiLoading(true);
    setTimeout(() => {
      setApiLoading(false);
      if (selectedEndpoint === 'GET_ALL') {
        setApiResponse({
          status: 200,
          statusText: '200 OK',
          time: '42ms',
          data: {
            success: true,
            count: posts.length,
            data: posts
          }
        });
      } else if (selectedEndpoint === 'GET_BY_SLUG') {
        const sample = posts[0] || {};
        setApiResponse({
          status: 200,
          statusText: '200 OK',
          time: '28ms',
          data: {
            success: true,
            data: sample
          }
        });
      } else if (selectedEndpoint === 'POST_CREATE') {
        try {
          const parsed = JSON.parse(customApiPayload);
          setApiResponse({
            status: 201,
            statusText: '201 Created',
            time: '89ms',
            data: {
              success: true,
              message: 'Blog post created via REST API endpoint',
              insertedId: `post-${Date.now()}`,
              payload: parsed
            }
          });
        } catch (err) {
          setApiResponse({
            status: 400,
            statusText: '400 Bad Request',
            time: '12ms',
            data: {
              error: 'Invalid JSON payload structure',
              details: err.message
            }
          });
        }
      } else if (selectedEndpoint === 'DELETE_BY_ID') {
        setApiResponse({
          status: 200,
          statusText: '200 OK',
          time: '35ms',
          data: {
            success: true,
            message: 'Post id post-1 successfully deleted'
          }
        });
      }
    }, 350);
  };

  // Filtered Posts for Frontend View
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = selectedCategory === 'All' || post.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [posts, searchQuery, selectedCategory]);

  return (
    <div className={`min-h-screen transition-colors duration-200 font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border text-sm font-medium animate-bounce ${
          toastMessage.type === 'error' ? 'bg-red-900/90 border-red-700 text-red-100' :
          toastMessage.type === 'info' ? 'bg-blue-900/90 border-blue-700 text-blue-100' :
          'bg-emerald-900/90 border-emerald-700 text-emerald-100'
        }`}>
          <LucideCheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* HEADER / NAVIGATION BAR */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <LucideSparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Tactyqal Labs
              </span>
              <span className="block text-[10px] text-slate-400 font-mono -mt-1 tracking-widest uppercase">Digital Platform</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {[
              { id: 'home', label: 'Home' },
              { id: 'blog', label: 'Blog & Articles' },
              { id: 'cms', label: 'CMS Dashboard' },
              { id: 'db', label: 'DB Architecture' },
              { id: 'api', label: 'API Playground' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? (isDarkMode ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 font-semibold')
                    : (isDarkMode ? 'text-slate-300 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-yellow-400 hover:bg-slate-800' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="Toggle Theme Mode"
            >
              {isDarkMode ? <LucideSun className="w-4 h-4" /> : <LucideMoon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setActiveTab('cms')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              <LucideTerminal className="w-4 h-4" />
              <span>Launch CMS</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-slate-800 text-slate-400"
            >
              {mobileMenuOpen ? <LucideX className="w-5 h-5" /> : <LucideMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-4 border-t border-slate-800 bg-slate-950 space-y-2">
            {[
              { id: 'home', label: 'Home' },
              { id: 'blog', label: 'Blog & Articles' },
              { id: 'cms', label: 'CMS Admin Dashboard' },
              { id: 'db', label: 'DB Architecture Schema' },
              { id: 'api', label: 'REST API Playground' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* MAIN CONTENT CONTAINERS BASED ON ACTIVE TAB */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ========================================================= */}
        {/* TASK 1: HOMEPAGE REDESIGN                                  */}
        {/* ========================================================= */}
        {activeTab === 'home' && (
          <div className="space-y-24 py-4">

            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-8 sm:p-14 text-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6">
                <LucideZap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Next-Gen Full-Stack & CMS Engine</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
                Accelerating Digital Innovation &{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Scalable Tech Solutions
                </span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal">
                Tactyqal Labs builds high-performance web systems, cloud architectures, and decoupled headless management environments engineered for enterprise scale.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => setActiveTab('blog')}
                  className="px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:opacity-95 shadow-xl shadow-indigo-500/25 flex items-center gap-2 transition-all active:scale-95"
                >
                  <span>Explore Engineering Blog</span>
                  <LucideArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab('cms')}
                  className="px-6 py-3.5 rounded-xl font-semibold border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 flex items-center gap-2 transition-all"
                >
                  <LucideTerminal className="w-4 h-4 text-cyan-400" />
                  <span>Try Live CMS Admin</span>
                </button>
              </div>

              {/* Stats Bar */}
              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-800/80">
                {[
                  { value: '99.99%', label: 'Infrastructure Uptime' },
                  { value: '150+', label: 'Enterprise Applications' },
                  { value: '< 80ms', label: 'Average Global Latency' },
                  { value: '24/7', label: 'DevOps System Monitoring' }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-white">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-slate-400 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Core Services Section */}
            <section className="space-y-10">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold tracking-tight text-white">Our Engineering Capabilities</h2>
                <p className="text-slate-400 max-w-xl mx-auto">
                  From complete modern application rebuilds to enterprise backend architectures.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <LucideServer className="w-6 h-6 text-cyan-400" />,
                    title: 'Headless CMS Architecture',
                    description: 'Replacing legacy WordPress installations with decoupled REST/GraphQL APIs, Next.js static delivery, and instant cache invalidation.'
                  },
                  {
                    icon: <LucideCloud className="w-6 h-6 text-indigo-400" />,
                    title: 'Cloud & Database Optimization',
                    description: 'Designing resilient PostgreSQL and MongoDB database architectures with automated connection pooling and replication.'
                  },
                  {
                    icon: <LucideCpu className="w-6 h-6 text-purple-400" />,
                    title: 'Full-Stack Modernization',
                    description: 'Upgrading legacy backend systems into modern Node.js, Express, and microservices engines optimized for scale.'
                  }
                ].map((srv, idx) => (
                  <div 
                    key={idx}
                    className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      {srv.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{srv.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{srv.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Interactive Showcase Teaser Banner */}
            <section className="rounded-3xl border border-indigo-900/40 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <LucideCheckCircle2 className="w-3.5 h-3.5" />
                  <span>Task 2 Implementation Live Demo</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  Experience Our CMS & API Inspector Engine
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  We have built a fully dynamic blog management suite including complete CRUD operations, relational PostgreSQL ERD visualizers, and interactive REST endpoint inspectors.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <button
                  onClick={() => setActiveTab('cms')}
                  className="px-5 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 text-center transition-all shadow-md"
                >
                  Manage Posts
                </button>
                <button
                  onClick={() => setActiveTab('api')}
                  className="px-5 py-3 rounded-xl font-semibold text-slate-200 border border-slate-700 bg-slate-900 hover:bg-slate-800 text-center transition-all"
                >
                  Inspect APIs
                </button>
              </div>
            </section>

            {/* Tech Stack Banner */}
            <section className="space-y-6 text-center">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-mono">Modern Stack & Enterprise Tooling</p>
              <div className="flex flex-wrap justify-center gap-3">
                {['React.js', 'Next.js', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'TypeScript', 'Supabase', 'shadcn/ui'].map((tech, i) => (
                  <span 
                    key={i} 
                    className="px-4 py-2 rounded-xl text-xs font-medium border border-slate-800 bg-slate-900/80 text-slate-300 shadow-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* TASK 2: BLOG FRONTEND READER                               */}
        {/* ========================================================= */}
        {activeTab === 'blog' && (
          <div className="space-y-8 py-4">
            
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <h1 className="text-3xl font-bold text-white">Engineering Insights & Blog</h1>
                <p className="text-slate-400 text-sm mt-1">Articles published directly from our Tactyqal Decoupled CMS Engine</p>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[280px]">
                <LucideSearch className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {['All', ...INITIAL_CATEGORIES].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Articles Grid */}
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
                <p className="text-slate-400 text-sm">No articles matched your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map(post => (
                  <article
                    key={post.id}
                    onClick={() => setActivePostModal(post)}
                    className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={post.coverImage} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-950/80 text-cyan-400 backdrop-blur-md border border-slate-800">
                        {post.category}
                      </span>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><LucideClock className="w-3.5 h-3.5" /> {post.readTime}</span>
                          <span>•</span>
                          <span>{post.publishedAt}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                          {post.summary}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-300">
                          <div className="w-6 h-6 rounded-full bg-indigo-600/30 flex items-center justify-center font-bold text-indigo-400 text-[10px]">
                            {post.author[0]}
                          </div>
                          <span>{post.author}</span>
                        </div>
                        <span className="text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Read More <LucideChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TASK 2: CMS ADMIN DASHBOARD                                */}
        {/* ========================================================= */}
        {activeTab === 'cms' && (
          <div className="space-y-8 py-4">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <span>CMS Admin Portal</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-normal bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Status: Connected
                  </span>
                </h1>
                <p className="text-slate-400 text-sm mt-1">Manage, update, and publish blog content dynamically</p>
              </div>

              <button
                onClick={handleCreateNewClick}
                className="px-4 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
              >
                <LucidePlus className="w-4 h-4" />
                <span>Create New Post</span>
              </button>
            </div>

            {/* CMS Form Drawer / Modal overlay */}
            {isEditing && (
              <div className="p-6 rounded-2xl border border-indigo-900/50 bg-slate-900 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h3 className="text-xl font-bold text-white">
                    {currentPostForm.id ? 'Edit Blog Article' : 'Create New Article'}
                  </h3>
                  <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                    <LucideX className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSavePost} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Post Title *</label>
                      <input
                        type="text"
                        required
                        value={currentPostForm.title}
                        onChange={(e) => setCurrentPostForm({ ...currentPostForm, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:border-indigo-500"
                        placeholder="e.g. Modern Web Architecture Patterns"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                      <select
                        value={currentPostForm.category}
                        onChange={(e) => setCurrentPostForm({ ...currentPostForm, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:border-indigo-500"
                      >
                        {INITIAL_CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Author Name</label>
                      <input
                        type="text"
                        value={currentPostForm.author}
                        onChange={(e) => setCurrentPostForm({ ...currentPostForm, author: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
                      <select
                        value={currentPostForm.status}
                        onChange={(e) => setCurrentPostForm({ ...currentPostForm, status: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm"
                      >
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Tags (Comma separated)</label>
                      <input
                        type="text"
                        value={currentPostForm.tags}
                        onChange={(e) => setCurrentPostForm({ ...currentPostForm, tags: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm"
                        placeholder="React, Microservices"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Summary / Excerpt *</label>
                    <textarea
                      required
                      rows={2}
                      value={currentPostForm.summary}
                      onChange={(e) => setCurrentPostForm({ ...currentPostForm, summary: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Markdown Body Content</label>
                    <textarea
                      rows={6}
                      value={currentPostForm.content}
                      onChange={(e) => setCurrentPostForm({ ...currentPostForm, content: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
                    >
                      Save Article
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Posts Data Table */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/30">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Title & Slug</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Author</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {posts.map(post => (
                      <tr key={post.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="px-6 py-4 max-w-xs">
                          <div className="font-bold text-white truncate">{post.title}</div>
                          <div className="text-xs text-slate-500 font-mono truncate">{post.slug}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300">
                            {post.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{post.author}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            post.status === 'Published' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => setActivePostModal(post)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="Preview Post"
                          >
                            <LucideEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(post)}
                            className="p-1.5 rounded bg-indigo-950 hover:bg-indigo-900 text-indigo-400"
                            title="Edit Post"
                          >
                            <LucideEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1.5 rounded bg-red-950 hover:bg-red-900 text-red-400"
                            title="Delete Post"
                          >
                            <LucideTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TASK 2: DATABASE ARCHITECTURE SCHEMATIC VISUALIZER        */}
        {/* ========================================================= */}
        {activeTab === 'db' && (
          <div className="space-y-8 py-4">
            <div className="border-b border-slate-800 pb-6">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <LucideDatabase className="w-8 h-8 text-indigo-400" />
                <span>PostgreSQL Database Schema Visualizer</span>
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Relational entity-relationship design powering the Tactyqal Blog & CMS microservice backend
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DB_TABLES.map(table => (
                <div key={table.name} className="border border-slate-800 rounded-2xl bg-slate-900/60 overflow-hidden shadow-lg">
                  <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                    <span className="font-mono font-bold text-indigo-400 text-base">{table.name}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">TABLE</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-400 italic">{table.description}</p>
                    <div className="divide-y divide-slate-800/80">
                      {table.columns.map(col => (
                        <div key={col.name} className="py-2 flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2">
                            {col.key && (
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                col.key.includes('PK') ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'
                              }`}>
                                {col.key}
                              </span>
                            )}
                            <span className="text-slate-200 font-semibold">{col.name}</span>
                          </div>
                          <span className="text-slate-500">{col.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TASK 2: LIVE REST API PLAYGROUND                           */}
        {/* ========================================================= */}
        {activeTab === 'api' && (
          <div className="space-y-8 py-4">
            <div className="border-b border-slate-800 pb-6">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <LucideTerminal className="w-8 h-8 text-cyan-400" />
                <span>Backend REST API Interactive Inspector</span>
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Test simulated live API endpoints connected to the Tactyqal Blog service architecture
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Endpoint Selector Controls */}
              <div className="lg:col-span-4 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-mono">Available Endpoints</h3>
                
                {[
                  { id: 'GET_ALL', method: 'GET', path: '/api/v1/posts', label: 'Fetch All Blog Posts' },
                  { id: 'GET_BY_SLUG', method: 'GET', path: '/api/v1/posts/:slug', label: 'Fetch Single Article' },
                  { id: 'POST_CREATE', method: 'POST', path: '/api/v1/posts', label: 'Create New Article' },
                  { id: 'DELETE_BY_ID', method: 'DELETE', path: '/api/v1/posts/:id', label: 'Delete Article' }
                ].map(ep => (
                  <div
                    key={ep.id}
                    onClick={() => setSelectedEndpoint(ep.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedEndpoint === ep.id 
                        ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md' 
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-mono text-xs mb-1">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        ep.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' :
                        ep.method === 'POST' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {ep.method}
                      </span>
                      <span>{ep.path}</span>
                    </div>
                    <div className="text-sm font-medium">{ep.label}</div>
                  </div>
                ))}
              </div>

              {/* Endpoint Runner & Payload Response */}
              <div className="lg:col-span-8 space-y-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-between">
                  <div className="font-mono text-xs text-slate-300">
                    <span className="text-indigo-400">Endpoint:</span> {selectedEndpoint}
                  </div>
                  <button
                    onClick={executeApiCall}
                    disabled={apiLoading}
                    className="px-5 py-2 rounded-lg font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2 transition-all"
                  >
                    {apiLoading ? <LucideRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LucideSend className="w-3.5 h-3.5" />}
                    <span>Execute Request</span>
                  </button>
                </div>

                {selectedEndpoint === 'POST_CREATE' && (
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400">JSON Request Body Payload</label>
                    <textarea
                      rows={6}
                      value={customApiPayload}
                      onChange={(e) => setCustomApiPayload(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:border-indigo-500"
                    />
                  </div>
                )}

                {/* API Response Output Viewer */}
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                  <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Response Inspector</span>
                    {apiResponse && (
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400">{apiResponse.statusText}</span>
                        <span className="text-slate-500">{apiResponse.time}</span>
                      </div>
                    )}
                  </div>
                  <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-96">
                    {apiLoading ? (
                      <span className="text-slate-500 animate-pulse">Executing HTTP Request...</span>
                    ) : apiResponse ? (
                      JSON.stringify(apiResponse.data, null, 2)
                    ) : (
                      <span className="text-slate-600">// Click "Execute Request" to test endpoint output</span>
                    )}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ARTICLE READ MODAL */}
      {activePostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {activePostModal.category}
              </span>
              <button onClick={() => setActivePostModal(null)} className="text-slate-400 hover:text-white">
                <LucideX className="w-6 h-6" />
              </button>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{activePostModal.title}</h2>

            <div className="flex items-center gap-4 text-xs text-slate-400 border-b border-slate-800/60 pb-4">
              <span>By {activePostModal.author} ({activePostModal.authorRole})</span>
              <span>•</span>
              <span>{activePostModal.publishedAt}</span>
              <span>•</span>
              <span>{activePostModal.readTime}</span>
            </div>

            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {activePostModal.content}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActivePostModal(null)}
                className="px-5 py-2 rounded-lg font-semibold text-sm bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <LucideSparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Tactyqal Labs Platform</span>
          </div>
          <p className="text-xs text-slate-400 text-center md:text-right">
            © {new Date().getFullYear()} Tactyqal Labs. Task 1 & Task 2 Complete Implementation Suite.
          </p>
        </div>
      </footer>

    </div>
  );
}