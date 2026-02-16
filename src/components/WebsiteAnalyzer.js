'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Globe, Shield, Zap, BarChart3, Layout, ChevronRight, AlertTriangle } from "lucide-react";

export default function WebsiteAnalyzer() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Analysis failed");
            }

            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 90) return "text-emerald-500";
        if (score >= 70) return "text-primary";
        if (score >= 50) return "text-premium-gold";
        return "text-alert-red";
    };

    const categories = [
        { id: "seo", label: "SEO", icon: Search, score: result?.seo?.score },
        { id: "performance", label: "Performance", icon: Zap, score: result?.performance?.score },
        { id: "conversion", label: "Conversion", icon: BarChart3, score: result?.conversion?.score },
        { id: "trust", label: "Trust", icon: Shield, score: result?.trust?.score },
        { id: "ux", label: "UX / UI", icon: Layout, score: result?.ux?.score },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 text-white">
                    Website <span className="text-primary">Analyzer</span>
                </h3>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                    AI-Powered Full Stack Audit
                </p>
            </div>

            <form onSubmit={handleAnalyze} className="mb-10 relative z-20">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Globe className="w-4 h-4 text-white/40" />
                        </div>
                        <input
                            type="url"
                            placeholder="Enter website URL (e.g., masterkeylabs.com)"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all font-mono text-sm"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-cyan-400 text-background-dark px-8 py-4 md:py-0 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center transition-all"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze"}
                    </button>
                </div>
                {error && (
                    <div className="mt-4 p-4 bg-alert-red/10 border border-alert-red/20 rounded-xl flex items-center gap-3 text-alert-red text-xs font-bold uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </form>

            <AnimatePresence mode="wait">
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-20 text-center"
                    >
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping" />
                            <div className="absolute inset-0 border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent rounded-full animate-spin" />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">
                            Scanning Neural Pathways...
                        </div>
                    </motion.div>
                )}

                {result && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Summary Card */}
                        <div className="bg-white/5 backdrop-blur-sm p-8 border border-white/10 rounded-2xl flex flex-col md:flex-row gap-8 items-center">
                            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" className="text-white/5" fill="none" />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        className={getScoreColor(result.overall_score)}
                                        fill="none"
                                        strokeDasharray={351}
                                        strokeDashoffset={351 - (351 * result.overall_score) / 100}
                                        strokeLinecap="round"
                                        style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-4xl font-black ${getScoreColor(result.overall_score)}`}>
                                        {result.efficiency_grade}
                                    </span>
                                    <span className="text-[10px] text-white/40 font-bold uppercase">Grade</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 text-center md:text-left">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">
                                        Overall Score: {result.overall_score}/100
                                    </div>
                                    <p className="text-sm text-white/80 font-medium leading-relaxed">
                                        {result.summary}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    {result.trust?.has_ssl && (
                                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-2">
                                            <Shield className="w-3 h-3" /> SSL Secure
                                        </span>
                                    )}
                                    {result.ux?.has_mobile_viewport && (
                                        <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-2">
                                            <Layout className="w-3 h-3" /> Mobile Ready
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Category Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            {categories.map((cat) => (
                                <div key={cat.id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col items-center text-center gap-3 hover:border-primary/30 transition-colors">
                                    <div className="p-3 bg-white/5 rounded-full text-primary">
                                        <cat.icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-1">{cat.label}</div>
                                        <div className={`text-xl font-black ${getScoreColor(cat.score || 0)}`}>{cat.score || 0}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recommendations */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                                <Zap className="w-4 h-4 text-premium-gold" />
                                AI Recommendations
                            </h4>
                            <div className="grid gap-3">
                                {result.ai_recommendations.map((rec, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-4 items-start hover:bg-white/10 transition-colors"
                                    >
                                        <div className="mt-1">
                                            <ChevronRight className="w-4 h-4 text-primary" />
                                        </div>
                                        <p className="text-xs text-white/70 font-medium leading-relaxed">
                                            {rec}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
