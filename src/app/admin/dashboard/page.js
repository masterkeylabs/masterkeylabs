"use client";
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
    ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    AreaChart, Area
} from 'recharts';

export default function AdminDashboard() {
    const router = useRouter();
    const [businesses, setBusinesses] = useState([]);
    const [stats, setStats] = useState({ total: 0, critical: 0, totalWaste: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const COLORS = ['#00e5ff', '#ff3d00', '#ffd600', '#00e676', '#d500f9', '#3d5afe', '#ff9100'];

    useEffect(() => {
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
            const { data: bizData } = await supabase
                .from('businesses')
                .select(`
                    *,
                    ai_threat_results (threat_level, score),
                    loss_audit_results (total_burn)
                `)
                .order('created_at', { ascending: false });

            if (bizData) {
                setBusinesses(bizData);

                // Calculate basic stats
                const total = bizData.length;
                const critical = bizData.filter(b => b.ai_threat_results?.[0]?.threat_level === 'KHATRA').length;
                const waste = bizData.reduce((acc, b) => acc + (b.loss_audit_results?.[0]?.total_burn || 0), 0);

                setStats({ total, critical, totalWaste: waste });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
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
        // Mocking trend based on registration date for visual appeal
        const groups = {};
        businesses.forEach(b => {
            const date = new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

    const filteredBusinesses = businesses.filter(b =>
        b.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white flex font-sans selection:bg-primary/30">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-[#03081a] flex flex-col fixed h-full z-10 transition-all">
                <div className="p-8">
                    <img src="/logo-icon.png" alt="MasterKey Labs" className="h-16 w-auto mb-2 object-contain" />
                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mt-2">Command Center</p>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary border border-primary/20 transition-all text-left">
                        <span className="material-symbols-outlined">analytics</span>
                        <span className="text-sm font-bold tracking-tight">Data Tracking</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white transition-all text-left">
                        <span className="material-symbols-outlined text-sm">database</span>
                        <span className="text-sm font-medium">Database Management</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white transition-all text-left">
                        <span className="material-symbols-outlined text-sm">settings_suggest</span>
                        <span className="text-sm font-medium">System Scaling</span>
                    </button>
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all text-left group">
                        <span className="material-symbols-outlined text-sm group-hover:rotate-180 transition-transform">logout</span>
                        <span className="text-sm font-black uppercase tracking-widest text-xs">Disconnect</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-10">
                {/* Header */}
                <header className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">System Intelligence</h1>
                        <p className="text-white/40 font-medium tracking-wide">Real-time tracking of all business diagnostics & market threats.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-black text-primary tracking-widest uppercase mb-1">Status: Operational</span>
                            <div className="flex gap-1">
                                <span className="w-8 h-1 bg-primary rounded-full"></span>
                                <span className="w-8 h-1 bg-primary/30 rounded-full animate-pulse"></span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-8 mb-12">
                    <div className="glass rounded-3xl p-8 border border-white/5 flex flex-col items-start shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <span className="material-symbols-outlined text-7xl">corporate_fare</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-2">Total Deployments</span>
                        <span className="text-5xl font-black text-white mb-2">{stats.total}</span>
                        <span className="text-xs text-primary font-bold">Businesses Analyzed</span>
                    </div>

                    <div className="glass rounded-3xl p-8 border border-alert-red/20 bg-alert-red/5 flex flex-col items-start shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <span className="material-symbols-outlined text-7xl text-alert-red">warning</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-alert-red/50 mb-2">Critical Threats</span>
                        <span className="text-5xl font-black text-alert-red mb-2">{stats.critical}</span>
                        <span className="text-xs text-alert-red font-bold">Immediate Action Required</span>
                    </div>

                    <div className="glass rounded-3xl p-8 border border-primary/20 flex flex-col items-start shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <span className="material-symbols-outlined text-7xl text-primary">payments</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50 mb-2">Total Detected Waste</span>
                        <span className="text-5xl font-black text-white mb-2">₹{(stats.totalWaste / 100000).toFixed(1)}L</span>
                        <span className="text-xs text-primary font-bold">Monthly Operational Burn</span>
                    </div>
                </div>

                {/* Advanced Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Industry Composition */}
                    <div className="glass rounded-[2.5rem] p-8 border border-white/5">
                        <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">pie_chart</span>
                            Market Composition
                        </h3>
                        <div className="h-72 w-full">
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
                        </div>
                    </div>

                    {/* Threat Landscape */}
                    <div className="glass rounded-[2.5rem] p-8 border border-white/5">
                        <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2">
                            <span className="material-symbols-outlined text-alert-red text-lg">bar_chart</span>
                            Threat Landscape
                        </h3>
                        <div className="h-72 w-full">
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
                        </div>
                    </div>

                    {/* Economic Burn Trend */}
                    <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 border border-white/5">
                        <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">timeline</span>
                            Detected Capital Waste Trend (₹K)
                        </h3>
                        <div className="h-64 w-full">
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
                        </div>
                    </div>
                </div>

                {/* Database Table */}
                <div className="glass rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <h3 className="text-xl font-bold tracking-tight flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">storage</span>
                            Operational Database
                        </h3>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/20 text-sm">search</span>
                            <input
                                type="text"
                                placeholder="Search entity or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-6 py-2 text-sm focus:outline-none focus:border-primary/40 focus:bg-white/10 transition-all w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] uppercase font-black tracking-widest text-white/30 border-b border-white/5">
                                    <th className="px-8 py-6">Entity Name</th>
                                    <th className="px-8 py-6">Contact Info</th>
                                    <th className="px-8 py-6">Classification</th>
                                    <th className="px-8 py-6">Threat Status</th>
                                    <th className="px-8 py-6">Burn Rate</th>
                                    <th className="px-8 py-6 text-right">Registered</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center text-white/20 uppercase tracking-[0.5em] font-black animate-pulse">
                                            Scanning Database...
                                        </td>
                                    </tr>
                                ) : filteredBusinesses.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center text-white/20">
                                            No entities detected in the current query.
                                        </td>
                                    </tr>
                                ) : filteredBusinesses.map((biz) => {
                                    const threat = biz.ai_threat_results?.[0];
                                    const loss = biz.loss_audit_results?.[0];
                                    return (
                                        <tr key={biz.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-white group-hover:text-primary transition-colors">{biz.entity_name}</div>
                                                <div className="text-[10px] text-white/30 font-medium uppercase tracking-tighter mt-1">{biz.location || 'Remote Node'}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-sm font-medium text-white/70">{biz.email || '—'}</div>
                                                <div className="text-xs text-white/30">{biz.phone || '—'}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-bold text-white/50 bg-white/5 px-3 py-1 rounded-full uppercase tracking-tighter">
                                                    {biz.classification}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`text-xs font-black uppercase tracking-widest ${threat?.threat_level === 'KHATRA' ? 'text-alert-red' :
                                                    threat?.threat_level === 'SAVDHAN' ? 'text-alert-orange' : 'text-primary'
                                                    }`}>
                                                    {threat?.threat_level || 'PENDING'}
                                                </div>
                                                <div className="text-[10px] text-white/20 mt-1 font-bold">SCORE: {threat?.score || '0'}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-sm font-bold text-white">₹{loss ? (loss.total_burn / 1000).toFixed(1) : '0'}K/mo</div>
                                                <div className="w-16 h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                                    <div className="h-full bg-primary" style={{ width: loss ? `${Math.min(100, (loss.total_burn / 500000) * 100)}%` : '0%' }}></div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="text-xs font-mono text-white/40">{new Date(biz.created_at).toLocaleDateString()}</div>
                                                <div className="text-[10px] text-white/20 font-medium uppercase tracking-widest mt-1">{new Date(biz.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
