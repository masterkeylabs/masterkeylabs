"use client";
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
    ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    AreaChart, Area
} from 'recharts';

import AdminBusinessDetailsModal from '@/components/admin/AdminBusinessDetailsModal';
import AdminEmailModal from '@/components/admin/AdminEmailModal';

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview'); // overview, businesses, bookings
    const [businesses, setBusinesses] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({ total: 0, critical: 0, totalWaste: 0, bookingsCount: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [mounted, setMounted] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // User management state
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    
    // Mobile navigation state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const COLORS = ['#00e5ff', '#ff3d00', '#ffd600', '#00e676', '#d500f9', '#3d5afe', '#ff9100'];

    const formatToIST = (dateString, options) => {
        if (!dateString) return 'N/A';
        return new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', ...options }).format(new Date(dateString));
    };

    const formatCurrency = (val) => {
        if (!val) return '₹0';
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
        return `₹${val}`;
    };

    useEffect(() => {
        setMounted(true);
        const session = localStorage.getItem('admin_session');
        if (!session) {
            router.push('/admin/login');
            return;
        }
        fetchData();
    }, [router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Businesses with all audit results
            const { data: bizData } = await supabase
                .from('businesses')
                .select(`
                    *,
                    ai_threat_results (threat_level, score, created_at),
                    loss_audit_results (total_burn, created_at, annual_loss),
                    visibility_results (missed_customers, annual_loss, confidence, created_at),
                    night_loss_results (total_loss, created_at)
                `)
                .order('created_at', { ascending: false });

            // 2. Fetch Bookings (Intent Logs)
            const { data: bookingData } = await supabase
                .from('intent_logs')
                .select('*')
                .eq('source', 'RescueArchitecture')
                .order('created_at', { ascending: false });

            if (bizData) {
                setBusinesses(bizData);

                // Calculate basic stats
                const total = bizData.length;
                const critical = bizData.filter(b => b.ai_threat_results?.[0]?.threat_level === 'KHATRA').length;
                const waste = bizData.reduce((acc, b) => acc + (b.loss_audit_results?.[0]?.total_burn || 0), 0);
                
                setStats(prev => ({ 
                    ...prev, 
                    total, 
                    critical, 
                    totalWaste: waste,
                    bookingsCount: bookingData?.length || 0
                }));
            }

            if (bookingData) {
                // Enrich bookings with business names if possible (manual join since foreign keys might be missing)
                const enrichedBookings = bookingData.map(booking => {
                    const biz = bizData?.find(b => b.id === booking.business_id);
                    return {
                        ...booking,
                        business_name: biz?.entity_name || 'Anonymous Business',
                        business_email: biz?.email || 'N/A',
                        business_phone: biz?.phone || 'N/A'
                    };
                });
                setBookings(enrichedBookings);
            }

            // Fetch users from our new API
            const userRes = await fetch('/api/admin/users');
            const userData = await userRes.json();
            if (userData.success) {
                setUsers(userData.users);
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, updates: { status: newStatus } })
            });
            const data = await res.json();
            if (data.success) {
                setBusinesses(prev => prev.map(b => b.id === userId ? { ...b, status: newStatus } : b));
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
            }
        } catch (error) {
            console.error('Status Toggle Error:', error);
        }
    };

    const handleBlockUser = async (userId) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, updates: { status: 'blocked' } })
            });
            const data = await res.json();
            if (data.success) {
                setBusinesses(prev => prev.map(b => b.id === userId ? { ...b, status: 'blocked' } : b));
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'blocked' } : u));
            }
        } catch (error) {
            console.error('Block User Error:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to PERMANENTLY delete this user? This cannot be undone.')) return;
        try {
            const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setBusinesses(prev => prev.filter(b => b.id !== userId));
                setUsers(prev => prev.filter(u => u.id !== userId));
            }
        } catch (error) {
            console.error('Delete User Error:', error);
        }
    };

    const handleOpenEmailModal = (user) => {
        setSelectedUser(user);
        setIsEmailModalOpen(true);
    };

    // --- Analytics Transformations ---
    const industryData = useMemo(() => {
        const counts = {};
        businesses.forEach(b => {
            const cat = b.classification || 'Other';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return Object.keys(counts).map(name => ({ name: name.replace('_', ' ').toUpperCase(), value: counts[name] }));
    }, [businesses]);

    const threatLandscape = useMemo(() => {
        const counts = { 'KHATRA': 0, 'SAVDHAN': 0, 'SAFE': 0 };
        businesses.forEach(b => {
            const level = b.ai_threat_results?.[0]?.threat_level || 'PENDING';
            if (counts[level] !== undefined) counts[level]++;
        });
        return [
            { name: 'Khatra (Critical)', value: counts['KHATRA'], color: '#ff3d00' },
            { name: 'Savdhan (Warning)', value: counts['SAVDHAN'], color: '#ffd600' },
            { name: 'Safe (Nominal)', value: counts['SAFE'], color: '#00e676' }
        ];
    }, [businesses]);

    const economicTrend = useMemo(() => {
        const groups = {};
        businesses.forEach(b => {
            const date = formatToIST(b.created_at, { month: 'short', day: 'numeric' });
            groups[date] = (groups[date] || 0) + (b.loss_audit_results?.[0]?.total_burn || 0);
        });
        return Object.keys(groups).slice(0, 7).reverse().map(date => ({
            date,
            burn: Math.round(groups[date] / 1000)
        }));
    }, [businesses]);

    const handleLogout = () => {
        localStorage.removeItem('admin_session');
        router.push('/admin/login');
    };

    const handleViewBusiness = (biz) => {
        setSelectedBusiness(biz);
        setIsModalOpen(true);
    };

    const filteredBusinesses = businesses.filter(b =>
        b.entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredBookings = bookings.filter(b =>
        b.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.business_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = (activeTab === 'users' ? users : businesses).filter(u =>
        u.entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white flex font-sans selection:bg-primary/30 relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`w-64 border-r border-white/5 bg-[#03081a] flex flex-col fixed h-full z-30 transition-all duration-300 transform 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-8">
                    <Image src="/logo-icon.png" alt="MasterKey Labs" width={110} height={110} className="h-24 w-auto mb-2 object-contain" />
                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mt-2">Command Center</p>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <button 
                        onClick={() => {
                            setActiveTab('overview');
                            setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${activeTab === 'overview' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        <span className="material-symbols-outlined text-sm">analytics</span>
                        <span className="text-sm font-bold tracking-tight">Overview</span>
                    </button>
                    <button 
                        onClick={() => {
                            setActiveTab('businesses');
                            setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${activeTab === 'businesses' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        <span className="material-symbols-outlined text-sm">corporate_fare</span>
                        <span className="text-sm font-bold tracking-tight">Management</span>
                    </button>
                    <button 
                        onClick={() => {
                            setActiveTab('bookings');
                            setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${activeTab === 'bookings' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                        <span className="text-sm font-bold tracking-tight">Architecture Bookings</span>
                    </button>
                    <button 
                        onClick={() => {
                            setActiveTab('users');
                            setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${activeTab === 'users' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        <span className="material-symbols-outlined text-sm">group</span>
                        <span className="text-sm font-bold tracking-tight">Personnel registry</span>
                    </button>
                    
                    <div className="pt-4 pb-2 px-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">System Ops</p>
                    </div>
                    
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white transition-all text-left">
                        <span className="material-symbols-outlined text-sm">database</span>
                        <span className="text-sm font-medium">Core Logs</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white transition-all text-left">
                        <span className="material-symbols-outlined text-sm">settings_suggest</span>
                        <span className="text-sm font-medium">Scalability Settings</span>
                    </button>
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all text-left group">
                        <span className="material-symbols-outlined text-sm group-hover:rotate-180 transition-transform">logout</span>
                        <span className="text-sm font-black uppercase tracking-widest text-[10px]">Disconnect Hub</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-6 lg:p-10 transition-all overflow-x-hidden">
                {/* Mobile Header Nav */}
                <div className="flex items-center justify-between lg:hidden mb-8 glass-dark p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <Image src="/logo-icon.png" alt="Logo" width={48} height={48} className="h-12 w-auto object-contain" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">MasterKey Ops</span>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 bg-primary/10 text-primary rounded-xl"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 lg:mb-12 gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-4xl font-black tracking-tight mb-2 uppercase">
                            {activeTab === 'overview' ? 'Intelligence Hub' : 
                             activeTab === 'businesses' ? 'Business Registry' : 
                             activeTab === 'bookings' ? 'Review Operations' :
                             'Personnel Command'}
                        </h1>
                        <p className="text-xs lg:text-sm text-white/40 font-medium tracking-wide">
                            {activeTab === 'overview' ? 'Real-time tracking of all business diagnostics & market threats.' : 
                             activeTab === 'businesses' ? 'Full operational over-ride of registered entities.' : 
                             activeTab === 'bookings' ? 'Monitoring and optimizing architectural sessions.' :
                             'Direct control and communication with system operators.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-start md:items-end">
                            <span className="text-[10px] lg:text-xs font-black text-primary tracking-widest uppercase mb-1">Status: Operational</span>
                            <div className="flex gap-1">
                                <span className="w-6 lg:w-8 h-1 bg-primary rounded-full shadow-[0_0_10px_#00E5FF]"></span>
                                <span className="w-6 lg:w-8 h-1 bg-primary/30 rounded-full animate-pulse"></span>
                            </div>
                        </div>
                    </div>
                </header>

                {activeTab === 'overview' && (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-8 lg:mb-12">
                            <div className="glass rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-white/5 flex flex-col items-start shadow-2xl relative overflow-hidden group">
                                <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-2">Total Deployments</span>
                                <span className="text-3xl lg:text-5xl font-black text-white mb-2">{stats.total}</span>
                                <span className="text-[10px] lg:text-xs text-primary font-bold uppercase">Terminal Registrations</span>
                            </div>

                            <div className="glass rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-alert-red/20 bg-alert-red/5 flex flex-col items-start shadow-2xl relative overflow-hidden group">
                                <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-alert-red/50 mb-2">Critical Threats</span>
                                <span className="text-3xl lg:text-5xl font-black text-alert-red mb-2">{stats.critical}</span>
                                <span className="text-[10px] lg:text-xs text-alert-red font-bold uppercase">Khatra Status Active</span>
                            </div>

                            <div className="glass rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-primary/20 flex flex-col items-start shadow-2xl relative overflow-hidden group">
                                <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-primary/50 mb-2">Total Burn Detected</span>
                                <span className="text-3xl lg:text-5xl font-black text-white mb-2">{formatCurrency(stats.totalWaste)}</span>
                                <span className="text-[10px] lg:text-xs text-primary font-bold uppercase">Monthly Combined Drain</span>
                            </div>

                            <div className="glass rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-cyan-400/20 flex flex-col items-start shadow-2xl relative overflow-hidden group">
                                <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400/50 mb-2">Waitlist/Bookings</span>
                                <span className="text-3xl lg:text-5xl font-black text-white mb-2">{stats.bookingsCount}</span>
                                <span className="text-[10px] lg:text-xs text-cyan-400 font-bold uppercase">Architecture Requests</span>
                            </div>
                        </div>

                        {/* Analytics Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                            <div className="glass rounded-[2.5rem] p-8 border border-white/5">
                                <h3 className="text-xs lg:text-sm font-black uppercase tracking-widest mb-6 lg:mb-8 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">pie_chart</span>
                                    Market Composition
                                </h3>
                                <div className="h-64 lg:h-72 w-full">
                                    {mounted && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={industryData}
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {industryData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#03081a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                    itemStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}
                                                />
                                                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            <div className="glass rounded-[2.5rem] p-8 border border-white/5">
                                <h3 className="text-xs lg:text-sm font-black uppercase tracking-widest mb-6 lg:mb-8 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-alert-red text-lg">bar_chart</span>
                                    Threat Landscape
                                </h3>
                                <div className="h-64 lg:h-72 w-full">
                                    {mounted && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={threatLandscape}>
                                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={8} tickLine={false} axisLine={false} />
                                                <YAxis hide />
                                                <Tooltip
                                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                    contentStyle={{ backgroundColor: '#03081a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                />
                                                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                                    {threatLandscape.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 border border-white/5">
                                <h3 className="text-xs lg:text-sm font-black uppercase tracking-widest mb-6 lg:mb-8 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">timeline</span>
                                    Combined Drain Trend (₹K)
                                </h3>
                                <div className="h-56 lg:h-64 w-full">
                                    {mounted && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={economicTrend}>
                                                <defs>
                                                    <linearGradient id="colorBurn" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                                                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#03081a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                />
                                                <Area type="monotone" dataKey="burn" stroke="#00e5ff" fillOpacity={1} fill="url(#colorBurn)" strokeWidth={3} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {(activeTab === 'businesses' || activeTab === 'bookings' || activeTab === 'users') && (
                    <div className="glass rounded-2xl lg:rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
                        <div className="p-4 lg:p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between bg-white/[0.02] gap-4">
                            <h3 className="text-lg lg:text-xl font-bold tracking-tight flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">
                                    {activeTab === 'businesses' ? 'storage' : 
                                     activeTab === 'bookings' ? 'event_note' : 'group'}
                                </span>
                                {activeTab === 'businesses' ? 'Entity Registry' : 
                                 activeTab === 'bookings' ? 'Session Requests' : 'Operator Database'}
                            </h3>
                            <div className="relative w-full sm:w-auto">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/20 text-sm">search</span>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-full pl-10 pr-6 py-2 text-sm focus:outline-none focus:border-primary/40 focus:bg-white/10 transition-all w-full sm:w-64 uppercase tracking-tighter"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                {activeTab === 'businesses' || activeTab === 'users' ? (
                                    <>
                                        <thead>
                                            <tr className="text-[10px] uppercase font-black tracking-widest text-white/30 border-b border-white/5">
                                                <th className="px-6 py-6">Target Entity</th>
                                                <th className="px-6 py-6 font-medium">Data Channel</th>
                                                <th className="px-6 py-6">{activeTab === 'users' ? 'Status' : 'Classification'}</th>
                                                <th className="px-6 py-6">{activeTab === 'users' ? 'Registration' : 'Threat Status'}</th>
                                                <th className="px-6 py-6">{activeTab === 'users' ? 'Actions' : 'Op. Drain'}</th>
                                                <th className="px-6 py-6 text-right">Commands</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.03]">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="6" className="px-8 py-20 text-center text-white/20 uppercase tracking-[0.5em] font-black animate-pulse">
                                                        Accessing Registry...
                                                    </td>
                                                </tr>
                                            ) : filteredUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="px-8 py-20 text-center text-white/20 uppercase tracking-widest text-xs font-bold">
                                                        No active signals detected.
                                                    </td>
                                                </tr>
                                            ) : filteredUsers.map((user) => {
                                                const threat = user.ai_threat_results?.[0];
                                                const loss = user.loss_audit_results?.[0];
                                                return (
                                                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                                        <td className="px-6 py-6">
                                                            <div className="font-bold text-white group-hover:text-primary transition-colors">{user.entity_name}</div>
                                                            <div className="text-[10px] text-white/30 font-medium uppercase tracking-tighter mt-1">{user.location || 'Unknown Node'}</div>
                                                        </td>
                                                        <td className="px-6 py-6">
                                                            <div className="text-sm font-medium text-white/70">{user.email || '—'}</div>
                                                            <div className="text-xs text-white/30">{user.phone || '—'}</div>
                                                        </td>
                                                        <td className="px-6 py-6">
                                                            {activeTab === 'users' ? (
                                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                                                                    user.status === 'active' ? 'bg-primary/20 text-primary border-primary/20' :
                                                                    user.status === 'blocked' ? 'bg-alert-red/20 text-alert-red border-alert-red/20' :
                                                                    'bg-white/5 text-white/40 border-white/10'
                                                                }`}>
                                                                    {user.status || 'active'}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] font-black text-white/40 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest border border-white/5">
                                                                    {user.classification?.replace('_', ' ')}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-6">
                                                            {activeTab === 'users' ? (
                                                                <div className="text-xs font-mono text-white/40">{formatToIST(user.created_at, { dateStyle: 'medium' })}</div>
                                                            ) : (
                                                                <>
                                                                    <div className={`text-xs font-black uppercase tracking-widest ${threat?.threat_level === 'KHATRA' ? 'text-alert-red' :
                                                                        threat?.threat_level === 'SAVDHAN' ? 'text-alert-orange' : 'text-primary'
                                                                        }`}>
                                                                        {threat?.threat_level || 'PENDING'}
                                                                    </div>
                                                                    <div className="text-[10px] text-white/20 mt-1 font-bold tracking-widest uppercase">Score: {threat?.score || '0'}</div>
                                                                </>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-6">
                                                            {activeTab === 'users' ? (
                                                                <div className="flex items-center gap-1">
                                                                    <button 
                                                                        onClick={() => handleToggleStatus(user.id, user.status)}
                                                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
                                                                        title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">{user.status === 'active' ? 'pause' : 'play_arrow'}</span>
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleBlockUser(user.id)}
                                                                        className="p-2 hover:bg-alert-red/10 rounded-lg transition-colors text-white/40 hover:text-alert-red"
                                                                        title="Block User"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">block</span>
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDeleteUser(user.id)}
                                                                        className="p-2 hover:bg-alert-red/10 rounded-lg transition-colors text-white/40 hover:text-alert-red"
                                                                        title="Delete User"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="text-sm font-bold text-white">{formatCurrency(loss?.total_burn)}/mo</div>
                                                                    <div className="w-16 h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                                                        <div className="h-full bg-primary" style={{ width: loss ? `${Math.min(100, (loss.total_burn / 500000) * 100)}%` : '0%' }}></div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-6 text-right min-w-[160px]">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button 
                                                                    onClick={() => handleOpenEmailModal(user)}
                                                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all flex-shrink-0"
                                                                    title="Send Email"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">mail</span>
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleViewBusiness(user)}
                                                                    className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
                                                                >
                                                                    Intelligence
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </>
                                ) : (
                                    <>
                                        <thead>
                                            <tr className="text-[10px] uppercase font-black tracking-widest text-white/30 border-b border-white/5">
                                                <th className="px-8 py-6">Business Entity</th>
                                                <th className="px-8 py-6">Target Slot (IST)</th>
                                                <th className="px-8 py-6">Origin</th>
                                                <th className="px-8 py-6 text-right">Logged At</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.03]">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="4" className="px-8 py-20 text-center text-white/20 uppercase tracking-[0.5em] font-black animate-pulse">
                                                        Scanning Schedule...
                                                    </td>
                                                </tr>
                                            ) : filteredBookings.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="px-8 py-20 text-center text-white/20 uppercase tracking-widest text-xs font-bold">
                                                        No session requests queued.
                                                    </td>
                                                </tr>
                                            ) : filteredBookings.map((booking) => (
                                                <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">{booking.business_name}</div>
                                                        <div className="text-[10px] text-white/30 font-medium uppercase tracking-tighter mt-1">{booking.business_email}</div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-cyan-400 text-sm">schedule</span>
                                                            <div className="text-sm font-bold text-white">
                                                                {booking.metadata?.slot?.label || 'Direct Inquiry'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-[10px] font-black text-cyan-400/60 bg-cyan-400/5 px-3 py-1 rounded-full uppercase tracking-widest border border-cyan-400/10">
                                                            {booking.source}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="text-xs font-mono text-white/40">{formatToIST(booking.created_at, { year: 'numeric', month: 'short', day: '2-digit' })}</div>
                                                        <div className="text-[10px] text-white/20 font-medium uppercase tracking-widest mt-1">{formatToIST(booking.created_at, { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </>
                                )}
                            </table>
                        </div>
                    </div>
                )}
                
                <AdminBusinessDetailsModal 
                    business={selectedBusiness}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />

                <AdminEmailModal 
                    user={selectedUser}
                    isOpen={isEmailModalOpen}
                    onClose={() => setIsEmailModalOpen(false)}
                />
            </main>
        </div>
    );
}
