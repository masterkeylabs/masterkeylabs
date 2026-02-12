"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, FileText, Download, Shield, Eye, Lock, Activity, Terminal, Send, Calendar, BarChart2, Trash2 } from "lucide-react";

export default function AdminDashboard() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [view, setView] = useState<"LEADS" | "AUDITS" | "CAREERS" | "BOOKINGS" | "WORKSHOPS">("LEADS");
    const [applications, setApplications] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [audits, setAudits] = useState<any[]>([]);
    const [workshops, setWorkshops] = useState<any[]>([]);
    const [workshopStatuses, setWorkshopStatuses] = useState<Record<string, string>>({})

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "admin123") {
            setIsLoggedIn(true);
            setError("");
            fetchApplications();
            fetchBookings();
            fetchAudits();
            fetchWorkshops();
        } else {
            setError("Access Cryptographically Denied");
        }
    };

    const fetchApplications = async () => {
        try {
            const res = await fetch("/api/apply");
            const data = await res.json();
            setApplications(data);
        } catch (err) {
            console.error("Failed to fetch applications");
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await fetch("/api/bookings");
            const data = await res.json();
            setBookings(data);
        } catch (err) {
            console.error("Failed to fetch bookings");
        }
    };

    const fetchAudits = async () => {
        try {
            const res = await fetch("/api/audits");
            const data = await res.json();
            setAudits(data);
        } catch (err) {
            console.error("Failed to fetch audits");
        }
    };

    const fetchWorkshops = async () => {
        try {
            const res = await fetch("/api/workshop");
            const data = await res.json();
            setWorkshops(data);
        } catch (err) {
            console.error("Failed to fetch workshop registrations");
        }
    };

    const deleteWorkshopRegistration = async (id: string) => {
        if (!confirm("Are you sure you want to delete this registration?")) return;
        try {
            const res = await fetch(`/api/workshop?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setWorkshops(workshops.filter(w => w.id !== id));
            }
        } catch (err) {
            console.error("Failed to delete workshop registration");
        }
    };

    const updateWorkshopStatus = (id: string, status: string) => {
        setWorkshopStatuses(prev => ({ ...prev, [id]: status }));
    };

    const exportWorkshopData = () => {
        const csvContent = [
            ["Full Name", "Email", "Contact Number", "Stream", "Registered Date", "Status"],
            ...workshops.map(w => [
                w.fullName,
                w.email,
                w.contactNumber,
                w.stream,
                w.createdAt ? new Date(w.createdAt).toLocaleDateString() : "—",
                workshopStatuses[w.id] || "Pending"
            ])
        ]
            .map(row => row.map(cell => `"${cell}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Workshop_Registrations_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cyan-accent)]/20 to-transparent" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:50px_50px]" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-12 w-full max-w-md relative z-10 border-white/5 shadow-cyan/10"
                >
                    <div className="flex flex-col items-center mb-12">
                        <img
                            src="/branding-logo.png"
                            alt="Masterkey Logo"
                            className="w-20 h-20 object-contain mb-8 pulse-cyan"
                        />
                        <h2 className="text-3xl font-black uppercase tracking-tighter dual-accent-text">Control Center</h2>
                        <p className="text-[10px] font-bold text-silver/40 uppercase tracking-[0.3em] mt-2">Neural Bridge Authentication</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <input
                                type="password"
                                placeholder="ENTER ACCESS KEY"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-5 text-[10px] font-black tracking-[0.5em] focus:outline-none focus:border-[var(--cyan-accent)] transition-all text-white text-center"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-red-500 text-[8px] font-black uppercase text-center tracking-widest">{error}</p>}
                        <button type="submit" className="btn-cyan w-full py-5 text-[10px] shadow-cyan uppercase font-black tracking-widest">
                            Authorize Access
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black pt-28 p-8 pb-32">
            <div className="container mx-auto">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Activity className="w-4 h-4 text-[var(--cyan-accent)] animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-silver/40">Network Synchronized</span>
                        </div>
                        <img src="/branding-name.png" alt="Masterkey" className="h-10 md:h-12 object-contain mb-2" />
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white/40">
                            Command <span className="dual-accent-text">Dashboard</span>
                        </h1>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => setView("LEADS")}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === "LEADS" ? "bg-white text-black shadow-chrome" : "bg-white/5 text-silver/40 hover:text-white"}`}
                        >
                            Leads
                        </button>
                        <button
                            onClick={() => setView("AUDITS")}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === "AUDITS" ? "bg-white text-black shadow-chrome" : "bg-white/5 text-silver/40 hover:text-white"}`}
                        >
                            Audits ({audits.length})
                        </button>
                        <button
                            onClick={() => setView("CAREERS")}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === "CAREERS" ? "btn-cyan shadow-cyan" : "bg-white/5 text-silver/40 hover:text-white"}`}
                        >
                            Careers ({applications.length})
                        </button>
                        <button
                            onClick={() => setView("BOOKINGS")}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === "BOOKINGS" ? "bg-[var(--orange-signal)] text-black shadow-orange" : "bg-white/5 text-silver/40 hover:text-white"}`}
                        >
                            Bookings ({bookings.length})
                        </button>
                        <button
                            onClick={() => setView("WORKSHOPS")}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === "WORKSHOPS" ? "bg-white text-black shadow-chrome" : "bg-white/5 text-silver/40 hover:text-white"}`}
                        >
                            Workshops ({workshops.length})
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {view === "LEADS" ? (
                        <motion.div
                            key="leads"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                                {[
                                    { label: "Neural Lead Count", value: "1,240", icon: Users, color: "cyan-accent-text" },
                                    { label: "Conversion Rate", value: "2.4%", icon: Activity, color: "orange-signal-text" },
                                    { label: "System Health", value: "100%", icon: Shield, color: "text-white" },
                                    { label: "Data Pipeline", value: "Active", icon: Lock, color: "text-silver/60" },
                                ].map((stat, i) => (
                                    <div key={i} className="glass-card p-8 border-white/5 hover:shadow-cyan/5">
                                        <div className="flex justify-between items-start mb-6">
                                            <stat.icon className="w-5 h-5 text-silver/40" />
                                            <div className="text-[8px] font-bold text-[var(--cyan-accent)] bg-[var(--cyan-accent)]/10 px-2 py-0.5 rounded">CONNECTED</div>
                                        </div>
                                        <div className={`text-3xl font-black tracking-tighter mb-1 ${stat.color}`}>{stat.value}</div>
                                        <div className="text-[8px] font-black uppercase tracking-widest text-silver/40">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="glass-card border-white/5 overflow-hidden shadow-cyan/5">
                                <div className="p-8 border-b border-white/5 bg-white/[0.01]">
                                    <div className="flex items-center gap-3">
                                        <Eye className="w-4 h-4 text-silver/40" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Lead Interception Stream</h3>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-[8px] font-black uppercase tracking-[0.3em] text-silver/40 bg-black/40">
                                            <tr>
                                                <th className="px-8 py-6">Identity</th>
                                                <th className="px-8 py-6">Corporate Origin</th>
                                                <th className="px-8 py-6">Protocol Status</th>
                                                <th className="px-8 py-6">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[10px] font-bold text-silver leading-none">
                                            {[
                                                { name: "Siddhant Sharma", company: "MetaScale Inc", status: "Report Generated" },
                                                { name: "Priya Patel", company: "DataSync AI", status: "Booking Pending" },
                                                { name: "Rahul Varma", company: "Legacy Banks", status: "Initial Scan" },
                                            ].map((row, i) => (
                                                <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-8 py-8 text-white">{row.name}</td>
                                                    <td className="px-8 py-8">{row.company}</td>
                                                    <td className="px-8 py-8">
                                                        <span className="bg-white/5 px-3 py-1.5 rounded-full border border-white/10 uppercase tracking-widest text-[8px]">{row.status}</span>
                                                    </td>
                                                    <td className="px-8 py-8">
                                                        <button className="text-[var(--cyan-accent)] hover:underline uppercase tracking-widest text-[8px] font-black">View Profile</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    ) : view === "AUDITS" ? (
                        <motion.div
                            key="audits"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="glass-card border-white/5 overflow-hidden shadow-cyan/10">
                                <div className="p-8 border-b border-white/5 bg-white/[0.01]">
                                    <div className="flex items-center gap-3">
                                        <BarChart2 className="w-4 h-4 text-silver/40" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Audit Submissions ({audits.length})</h3>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-[8px] font-black uppercase tracking-[0.3em] text-silver/40 bg-black/40">
                                            <tr>
                                                <th className="px-8 py-6">User</th>
                                                <th className="px-8 py-6">Company</th>
                                                <th className="px-8 py-6">Audit Type</th>
                                                <th className="px-8 py-6">Data Summary</th>
                                                <th className="px-8 py-6">Date</th>
                                                <th className="px-8 py-6">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[10px] font-bold text-silver leading-none">
                                            {audits.length > 0 ? audits.map((audit, i) => (
                                                <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-8 py-8">
                                                        <div>
                                                            <div className="text-white font-black">{audit.userName || "—"}</div>
                                                            <div className="text-[8px] text-silver/40 group-hover:text-[var(--cyan-accent)] transition-colors">{audit.userEmail}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-8">{audit.userCompany || "—"}</td>
                                                    <td className="px-8 py-8">
                                                        <span className="bg-[var(--cyan-accent)]/10 border border-[var(--cyan-accent)]/20 px-3 py-1 rounded-full text-[var(--cyan-accent)] uppercase tracking-widest text-[8px]">
                                                            {audit.auditType}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-8 max-w-xs truncate opacity-80">
                                                        {typeof audit.auditData === "object"
                                                            ? JSON.stringify(audit.auditData).slice(0, 60) + "..."
                                                            : String(audit.auditData || "—")}
                                                    </td>
                                                    <td className="px-8 py-8 text-[8px] text-silver/60">
                                                        {audit.createdAt ? new Date(audit.createdAt).toLocaleDateString() : "—"}
                                                    </td>
                                                    <td className="px-8 py-8">
                                                        <a
                                                            href={`mailto:${audit.userEmail}?subject=Masterkey Labs - Your ${audit.auditType} Results&body=Hello ${audit.userName || "there"},%0D%0A%0D%0AThank you for completing the ${audit.auditType} audit.%0D%0A%0D%0A`}
                                                            className="btn-cyan px-4 py-3 text-[8px] inline-flex items-center gap-2 shadow-cyan/20 rounded-lg"
                                                        >
                                                            <Send className="w-3 h-3" />
                                                            Email
                                                        </a>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={6} className="px-8 py-20 text-center text-silver/20 uppercase tracking-[0.5em] font-black">No Audit Submissions Yet</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    ) : view === "CAREERS" ? (
                        <motion.div
                            key="careers"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="glass-card border-white/5 overflow-hidden shadow-orange/10">
                                <div className="p-8 border-b border-white/5 bg-white/[0.01]">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-4 h-4 text-silver/40" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Career Applicants ({applications.length})</h3>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-[8px] font-black uppercase tracking-[0.3em] text-silver/40 bg-black/40">
                                            <tr>
                                                <th className="px-8 py-6">Applicant</th>
                                                <th className="px-8 py-6">Email Address</th>
                                                <th className="px-8 py-6">Vision Note</th>
                                                <th className="px-8 py-6">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[10px] font-bold text-silver leading-none">
                                            {applications.length > 0 ? applications.map((app, i) => (
                                                <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-8 py-8 text-white font-black">{app.fullName}</td>
                                                    <td className="px-8 py-8 group-hover:text-[var(--cyan-accent)] transition-colors">{app.email}</td>
                                                    <td className="px-8 py-8 max-w-sm truncate opacity-60 italic whitespace-normal">"{app.vision}"</td>
                                                    <td className="px-8 py-8 flex items-center gap-3">
                                                        {app.cvData && (
                                                            <button
                                                                onClick={() => {
                                                                    const link = document.createElement('a');
                                                                    link.href = app.cvData;
                                                                    link.download = `CV_${app.fullName.replace(/\s+/g, '_')}.pdf`;
                                                                    link.click();
                                                                }}
                                                                className="bg-white/5 hover:bg-white/10 p-3 rounded-lg text-silver transition-all"
                                                                title="Download CV"
                                                            >
                                                                <Download className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                        <a
                                                            href={`mailto:${app.email}?subject=Masterkey Labs - Career Application Update&body=Hello ${app.fullName},`}
                                                            className="btn-orange px-4 py-3 text-[8px] inline-flex items-center gap-2 shadow-orange/20 rounded-lg"
                                                        >
                                                            <Send className="w-3 h-3" />
                                                            Respond
                                                        </a>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="px-8 py-20 text-center text-silver/20 uppercase tracking-[0.5em] font-black">No Applications Yet</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    ) : view === "BOOKINGS" ? (
                        <motion.div
                            key="bookings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="glass-card border-white/5 overflow-hidden shadow-orange/10">
                                <div className="p-8 border-b border-white/5 bg-white/[0.01]">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-silver/40" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Deep Dive Bookings ({bookings.length})</h3>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-[8px] font-black uppercase tracking-[0.3em] text-silver/40 bg-black/40">
                                            <tr>
                                                <th className="px-8 py-6">Name</th>
                                                <th className="px-8 py-6">Company</th>
                                                <th className="px-8 py-6">Contact</th>
                                                <th className="px-8 py-6">Preferred Date/Time</th>
                                                <th className="px-8 py-6">Status</th>
                                                <th className="px-8 py-6">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[10px] font-bold text-silver leading-none">
                                            {bookings.length > 0 ? bookings.map((booking, i) => (
                                                <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-8 py-8 text-white font-black">{booking.name}</td>
                                                    <td className="px-8 py-8">{booking.company}</td>
                                                    <td className="px-8 py-8">
                                                        <div className="space-y-1">
                                                            <div className="group-hover:text-[var(--cyan-accent)] transition-colors">{booking.email}</div>
                                                            <div className="text-[8px] text-silver/40">{booking.phone}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-8">
                                                        <div className="space-y-1">
                                                            <div className="text-white">{new Date(booking.preferredDate).toLocaleDateString()}</div>
                                                            <div className="text-[8px] text-silver/40">{booking.preferredTime}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-8">
                                                        <span className={`px-3 py-1.5 rounded-full border uppercase tracking-widest text-[8px] ${booking.status === 'confirmed' ? 'bg-[var(--cyan-accent)]/10 border-[var(--cyan-accent)]/20 text-[var(--cyan-accent)]' :
                                                                booking.status === 'contacted' ? 'bg-[var(--orange-signal)]/10 border-[var(--orange-signal)]/20 text-[var(--orange-signal)]' :
                                                                    'bg-white/5 border-white/10'
                                                            }`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-8 flex items-center gap-3">
                                                        <a
                                                            href={`mailto:${booking.email}?subject=Masterkey Labs - Deep Dive Session&body=Hello ${booking.name},%0D%0A%0D%0AThank you for booking a 60-minute deep dive session with us.%0D%0A%0D%0APreferred Date: ${new Date(booking.preferredDate).toLocaleDateString()}%0D%0APreferred Time: ${booking.preferredTime}%0D%0A%0D%0A`}
                                                            className="btn-cyan px-4 py-3 text-[8px] inline-flex items-center gap-2 shadow-cyan/20 rounded-lg"
                                                        >
                                                            <Send className="w-3 h-3" />
                                                            Email
                                                        </a>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={6} className="px-8 py-20 text-center text-silver/20 uppercase tracking-[0.5em] font-black">No Bookings Yet</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    ) : view === "WORKSHOPS" ? (
                        <motion.div
                            key="workshops"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">Workshop Registrations</h2>
                                    <p className="text-[10px] font-bold text-silver/40 uppercase tracking-[0.3em]">5-Day AI Revolution Workshop • {workshops.length} Registrations</p>
                                </div>
                                {workshops.length > 0 && (
                                    <button
                                        onClick={exportWorkshopData}
                                        className="bg-[var(--cyan-accent)]/10 hover:bg-[var(--cyan-accent)]/20 border border-[var(--cyan-accent)]/20 px-4 py-3 rounded-lg text-[var(--cyan-accent)] text-[8px] font-black uppercase tracking-widest inline-flex items-center gap-2 transition-all"
                                    >
                                        <Download className="w-3 h-3" />
                                        Export CSV
                                    </button>
                                )}
                            </div>

                            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-white/[0.02]">
                                <table className="w-full">
                                    <thead className="text-[8px] font-black uppercase tracking-[0.3em] text-silver/40 bg-black/40">
                                        <tr>
                                            <th className="px-8 py-6">Full Name</th>
                                            <th className="px-8 py-6">Email Address</th>
                                            <th className="px-8 py-6">Contact Number</th>
                                            <th className="px-8 py-6">Stream</th>
                                            <th className="px-8 py-6">Status</th>
                                            <th className="px-8 py-6">Registered</th>
                                            <th className="px-8 py-6">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[10px] font-bold text-silver leading-none">
                                        {workshops.length > 0 ? workshops.map((workshop, i) => (
                                            <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-8 py-8 text-white font-black">{workshop.fullName}</td>
                                                <td className="px-8 py-8 group-hover:text-[var(--cyan-accent)] transition-colors">{workshop.email}</td>
                                                <td className="px-8 py-8">{workshop.contactNumber}</td>
                                                <td className="px-8 py-8">
                                                    <span className="px-3 py-1.5 rounded-full bg-[var(--cyan-accent)]/10 border border-[var(--cyan-accent)]/20 text-[var(--cyan-accent)] text-[8px] font-bold uppercase tracking-widest">
                                                        {workshop.stream}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <select
                                                        value={workshopStatuses[workshop.id] || "pending"}
                                                        onChange={(e) => updateWorkshopStatus(workshop.id, e.target.value)}
                                                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[8px] font-black uppercase tracking-widest focus:outline-none focus:border-[var(--cyan-accent)] transition-all text-white cursor-pointer"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="attended">Attended</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td className="px-8 py-8 text-[8px] text-silver/60">
                                                    {workshop.createdAt ? new Date(workshop.createdAt).toLocaleDateString() : "—"}
                                                </td>
                                                <td className="px-8 py-8 flex items-center gap-2">
                                                    <a
                                                        href={`mailto:${workshop.email}?subject=Masterkey Labs - AI Workshop Confirmation&body=Hello ${workshop.fullName},%0D%0A%0D%0AThank you for registering for the 5-Day AI Revolution Workshop!%0D%0A%0D%0ASelected Stream: ${workshop.stream}%0D%0A%0D%0AWorkshop Dates: Feb 20 - Feb 24, 2026%0D%0A%0D%0AWe look forward to seeing you soon!%0D%0A%0D%0ABest Regards,%0D%0AMasterkey Labs`}
                                                        className="bg-[var(--cyan-accent)]/10 hover:bg-[var(--cyan-accent)]/20 border border-[var(--cyan-accent)]/20 p-2 rounded-lg text-[var(--cyan-accent)] transition-all"
                                                        title="Send Email"
                                                    >
                                                        <Send className="w-3 h-3" />
                                                    </a>
                                                    <button
                                                        onClick={() => deleteWorkshopRegistration(workshop.id)}
                                                        className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 p-2 rounded-lg text-red-500 transition-all"
                                                        title="Delete Registration"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={7} className="px-8 py-20 text-center text-silver/20 uppercase tracking-[0.5em] font-black">No Workshop Registrations Yet</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
}
