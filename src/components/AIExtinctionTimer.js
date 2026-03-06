'use client';
import { useState, useEffect, useRef } from "react";

const SYSTEM_PROMPT = `You are an AI displacement risk analyst. Ground ALL analysis in these landmark studies:

RESEARCH BASE:
- Goldman Sachs (2023): 300M jobs globally exposed; 2/3 of US/EU jobs face some AI automation; 25% could be performed entirely by AI
- McKinsey Global Institute (2024): 30% of US work hours automated by 2030; 14% of global workforce (375M workers) must change careers
- World Economic Forum Future of Jobs (2025): 92M jobs displaced by 2030; 39% of skills will be obsolete; 86% of businesses affected by AI/info-processing by 2030
- Oxford University (Frey & Osborne): Probability of automation scores by occupation — routine cognitive tasks highest risk
- ARXIV/Penn+OpenAI: 80% of US workforce has 10%+ of tasks affected by LLMs; educated white-collar workers earning under $80K most exposed
- PwC AI Jobs Barometer (2025): AI-skilled workers earn 56% wage premium; productivity gap widening fast between AI-users and non-users
- Dario Amodei (Anthropic CEO): AI could replace up to 50% of entry-level office jobs within 5 years
- McKinsey: 70% of companies will adopt at least one AI technology by 2030

RISK TIERS (be specific, not vague):
- CRITICAL (75-100): 0-3 years — data entry clerks, basic accountants, paralegals, customer service reps, schedulers, translators, basic coders, admin assistants, bookkeepers
- HIGH (50-74): 3-6 years — mid-level managers, HR generalists, marketing analysts, sales ops, financial analysts, recruiters, copywriters, basic designers
- MODERATE (25-49): 6-12 years — senior consultants, specialized sales, experienced teachers, therapists, complex project managers, skilled tradespeople with certification requirements  
- RESILIENT (1-24): 12+ years — plumbers, electricians, surgeons, emergency responders, crisis counselors, master craftspeople, C-suite strategists, complex physical trades

TASK: Given a job title or business type, return ONLY valid JSON (no markdown, no preamble, no explanation):
{
  "riskScore": <integer 1-100>,
  "yearsRemaining": <number like 2.5 or 8>,
  "threatLevel": <"CRITICAL"|"HIGH"|"MODERATE"|"RESILIENT">,
  "topThreats": [<exactly 3 specific task descriptions being automated, under 8 words each>],
  "humanEdge": [<exactly 2 skills that keep humans irreplaceable, under 6 words each>],
  "verdict": <one punchy honest sentence under 18 words — no fluff>,
  "urgency": <one action-oriented sentence under 15 words>,
  "researchBasis": <one specific stat from the studies above relevant to this role>
}`;

const SEARCH_STEPS = [
    "INITIALIZING NEURAL ENGINE...",
    "SCANNING DISPLACEMENT DATABASES...",
    "MATCHING GOLDMAN SACHS (2023) PROJECTIONS...",
    "CALCULATING AUTOMATION HORIZON...",
    "ESTIMATING SURVIVAL METRICS...",
    "DECRYPTING EXTINCTION TIMELINE...",
    "FINALIZING RISK PROFILE..."
];

const THREAT_CONFIG = {
    CRITICAL: { color: "#FF2D2D", glow: "rgba(255,45,45,0.2)", label: "CRITICAL RISK", emoji: "🔴" },
    HIGH: { color: "#FF6B00", glow: "rgba(255,107,0,0.2)", label: "HIGH RISK", emoji: "🟠" },
    MODERATE: { color: "#FFB800", glow: "rgba(255,184,0,0.2)", label: "MODERATE RISK", emoji: "🟡" },
    RESILIENT: { color: "#00C48C", glow: "rgba(0,196,140,0.2)", label: "RESILIENT", emoji: "🟢" },
};

function useAnimatedValue(target, duration = 1400) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (target === 0) return;
        let current = 0;
        const step = target / (duration / 16);
        const t = setInterval(() => {
            current += step;
            if (current >= target) { setVal(target); clearInterval(t); }
            else setVal(Math.floor(current));
        }, 16);
        return () => clearInterval(t);
    }, [target]);
    return val;
}

function TimerBlock({ value, label, color }) {
    const animated = useAnimatedValue(value, 1200);
    return (
        <div style={{
            flex: 1, background: "rgba(255,255,255,0.03)",
            border: `1px solid ${color}33`, borderRadius: "14px",
            padding: "18px 10px", textAlign: "center",
        }}>
            <div style={{
                fontSize: "2.4rem", fontWeight: 900, color,
                lineHeight: 1, fontVariantNumeric: "tabular-nums",
                textShadow: `0 0 20px ${color}66`,
            }}>
                {String(animated).padStart(2, "0")}
            </div>
            <div style={{ fontSize: "0.58rem", color: "#555", letterSpacing: "2.5px", marginTop: "6px" }}>{label}</div>
        </div>
    );
}

function RiskBar({ score, color }) {
    const [w, setW] = useState(0);
    useEffect(() => { const t = setTimeout(() => setW(score), 200); return () => clearTimeout(t); }, [score]);
    const animated = useAnimatedValue(score);
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.65rem", color: "#444", letterSpacing: "2px" }}>AUTOMATION EXPOSURE</span>
                <span style={{ fontSize: "1rem", fontWeight: 800, color }}>{animated}%</span>
            </div>
            <div style={{ height: "5px", background: "rgba(255,255,255,0.05)", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{
                    height: "100%", width: `${w}%`,
                    background: `linear-gradient(90deg, ${color}66, ${color})`,
                    borderRadius: "99px",
                    transition: "width 1.6s cubic-bezier(0.22,1,0.36,1)",
                    boxShadow: `0 0 10px ${color}55`,
                }} />
            </div>
        </div>
    );
}

export default function AIExtinctionTimer({ guestMode = false, onGetStarted }) {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [dots, setDots] = useState(0);
    const [searchIndex, setSearchIndex] = useState(0);
    const inputRef = useRef(null);
    const cardRef = useRef(null);
    const fullTimerRef = useRef(null);

    const [previewImg, setPreviewImg] = useState(null);

    // Auto-capture the full timer widget (header + input + results) after result renders
    useEffect(() => {
        if (!result) return;
        setPreviewImg(null);
        const timer = setTimeout(async () => {
            const el = fullTimerRef.current;
            if (!el) return;
            try {
                const html2canvas = (await import('html2canvas')).default;
                const canvas = await html2canvas(el, {
                    backgroundColor: '#080809',
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                });
                setPreviewImg(canvas.toDataURL('image/png'));
            } catch (err) {
                console.error('Capture failed:', err);
                setPreviewImg('failed');
            }
        }, 900);
        return () => clearTimeout(timer);
    }, [result]);

    // Share the captured image via platform
    const shareImage = async (platform) => {
        const siteUrl = 'https://masterkeylabs.com';
        const shareText = `🚨 My AI Risk Score from MasterkeyOS Extinction Timer → ${siteUrl}`;
        const encodedText = encodeURIComponent(shareText);
        const encodedUrl = encodeURIComponent(siteUrl);

        const platformUrls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            instagram: `https://www.instagram.com/`,
        };

        // If image is captured, try native share or auto-download it first
        if (previewImg && previewImg !== 'failed') {
            try {
                const res = await fetch(previewImg);
                const blob = await res.blob();
                const file = new File([blob], 'ai-risk-score.png', { type: 'image/png' });

                // On mobile: try native share sheet (supports Instagram, WhatsApp etc)
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({ title: 'My AI Risk Score', text: shareText, files: [file] });
                        return; // native share handled everything
                    } catch (e) { /* user cancelled or not supported, fall through */ }
                }

                // Desktop: auto-download the image so user can attach it when posting
                const objUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = objUrl;
                a.download = 'ai-risk-score.png';
                a.click();
                URL.revokeObjectURL(objUrl);
            } catch (e) { /* capture failed silently */ }
        }

        // Always open the platform — with a short delay so the download dialog doesn't block
        setTimeout(() => window.open(platformUrls[platform], '_blank'), 400);
    };

    useEffect(() => {
        if (!loading) return;
        setSearchIndex(0);
        const t = setInterval(() => setDots(d => (d + 1) % 4), 350);
        const s = setInterval(() => {
            setSearchIndex(prev => (prev + 1) % SEARCH_STEPS.length);
        }, 800);
        return () => { clearInterval(t); clearInterval(s); };
    }, [loading]);

    const analyze = async () => {
        const trimmed = input.trim();
        if (!trimmed) { inputRef.current?.focus(); return; }
        setLoading(true); setResult(null); setError("");
        try {
            const res = await fetch("/api/ai-risk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    systemPrompt: SYSTEM_PROMPT,
                    prompt: `Analyze this role or business type: "${trimmed}"`,
                }),
            });
            const data = await res.json();

            if (data.error) {
                const msg = data.error.message || data.error || '';
                if (typeof msg === 'string' && (msg.includes('API key') || msg.includes('GEMINI_API_KEY'))) {
                    throw new Error("GEMINI_API_KEY is missing or invalid in .env.local");
                }
                if (typeof msg === 'string' && (msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('demand') || msg.toLowerCase().includes('overload') || msg.toLowerCase().includes('resource'))) {
                    throw new Error("Our AI engine is temporarily at capacity. Please try again in 30 seconds.");
                }
                throw new Error(typeof msg === 'string' ? msg : "Analysis failed — please try again.");
            }

            const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            const clean = raw.trim();
            setResult(JSON.parse(clean));
        } catch (err) {
            console.error(err);
            setError(err.message || "Analysis failed — please try again.");
        } finally {
            setLoading(false);
        }
    };

    const cfg = result ? (THREAT_CONFIG[result.threatLevel] || THREAT_CONFIG.MODERATE) : null;
    const years = result ? Math.floor(result.yearsRemaining) : 0;
    const months = result ? Math.floor((result.yearsRemaining % 1) * 12) : 0;
    const days = result ? Math.floor(((result.yearsRemaining * 12) % 1) * 30) : 0;

    return (
        <div style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            background: "#080809",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            borderRadius: "24px",
            border: "1px solid rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)"
        }}>
            <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: #333; }
        input:focus { outline: none; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes scan {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

            <div ref={fullTimerRef} style={{ width: "100%", maxWidth: "460px" }}>

                {/* ─── HEADER ─── */}
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        fontSize: "0.62rem", letterSpacing: "3px", color: "#FF6D00",
                        marginBottom: "14px", fontWeight: 700,
                        animation: "blink 2s ease infinite",
                    }}>
                        <span>●</span> AI DISPLACEMENT ANALYSIS
                    </div>
                    <h1 style={{
                        fontSize: "clamp(1.8rem, 6vw, 2.4rem)",
                        fontWeight: 900, color: "#F0F0F0",
                        margin: "0 0 10px", lineHeight: 1.1,
                        letterSpacing: "-0.5px",
                    }}>
                        Will AI Replace<br />
                        <span style={{ color: "#FF6D00" }}>Your Business?</span>
                    </h1>
                    <p style={{ color: "#A0A0A0", fontSize: "0.83rem", margin: 0, lineHeight: 1.7 }}>
                        Enter your job title or business type below.<br />
                        Get your AI extinction timeline in seconds.
                    </p>
                </div>

                {/* ─── INPUT + BUTTON ─── */}
                <div style={{ marginBottom: "10px" }}>
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={e => { setInput(e.target.value); setResult(null); setError(""); }}
                        onKeyDown={e => e.key === "Enter" && !loading && analyze()}
                        placeholder="e.g. accountant · HR manager · law firm · marketing agency"
                        style={{
                            width: "100%",
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "14px",
                            padding: "16px 18px",
                            color: "#E0E0E0",
                            fontSize: "0.9rem",
                            transition: "border 0.2s, background 0.2s",
                            marginBottom: "10px",
                        }}
                        onFocus={e => {
                            e.target.style.border = "1px solid rgba(255,109,0,0.4)";
                            e.target.style.background = "rgba(255,109,0,0.03)";
                        }}
                        onBlur={e => {
                            e.target.style.border = "1px solid rgba(255,255,255,0.08)";
                            e.target.style.background = "rgba(255,255,255,0.03)";
                        }}
                    />

                    <button
                        onClick={analyze}
                        disabled={loading}
                        style={{
                            position: "relative",
                            overflow: "hidden",
                            width: "100%",
                            padding: "15px",
                            background: loading
                                ? "rgba(255,109,0,0.1)"
                                : "linear-gradient(135deg, #E65100, #FF6D00)",
                            border: loading ? "1px solid rgba(255,109,0,0.2)" : "none",
                            borderRadius: "14px",
                            color: loading ? "#FF6D00" : "#fff",
                            fontWeight: 800,
                            fontSize: "0.8rem",
                            letterSpacing: loading ? "1px" : "0.3px",
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "all 0.3s",
                            boxShadow: loading ? "none" : "0 6px 30px rgba(255,109,0,0.35)",
                        }}
                        onMouseEnter={e => { if (!loading) e.target.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={e => { e.target.style.transform = "translateY(0)"; }}
                    >
                        {loading && (
                            <div style={{
                                position: "absolute",
                                top: 0, left: 0, width: "100%", height: "100%",
                                background: "linear-gradient(90deg, transparent, rgba(255,109,0,0.2), transparent)",
                                backgroundSize: "50% 100%",
                                backgroundRepeat: "no-repeat",
                                animation: "scan 1.5s linear infinite"
                            }} />
                        )}
                        <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                            {loading ? (
                                <>
                                    <span style={{ fontSize: "12px", border: "1px solid currentColor", borderRadius: "50%", padding: "2px", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center", animation: "spin 1s linear infinite" }}>
                                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                                        ⌛
                                    </span>
                                    {SEARCH_STEPS[searchIndex]}
                                </>
                            ) : (
                                "Calculate My AI Risk →"
                            )}
                        </span>
                    </button>
                </div>

                {error && (
                    <p style={{ textAlign: "center", color: "#FF6D00", fontSize: "0.8rem", marginTop: "8px" }}>{error}</p>
                )}

                {/* ─── RESULTS ─── */}
                {result && cfg && (
                    <div
                        ref={cardRef}
                        style={{
                            marginTop: "20px",
                            background: `radial-gradient(ellipse at top, ${cfg.glow} 0%, transparent 70%), rgba(255,255,255,0.02)`,
                            border: `1px solid ${cfg.color}22`,
                            borderRadius: "20px",
                            padding: "24px",
                            animation: "fadeUp 0.5s ease both",
                        }}>

                        {/* Result card content */}
                        <div>
                            {/* Threat level badge */}
                            <div style={{ textAlign: "center", marginBottom: "12px" }}>
                                <span style={{
                                    display: "inline-block",
                                    background: cfg.color,
                                    color: "#000",
                                    fontSize: "0.6rem",
                                    fontWeight: 900,
                                    letterSpacing: "3px",
                                    padding: "5px 16px",
                                    borderRadius: "99px",
                                    animation: result.threatLevel === "CRITICAL" || result.threatLevel === "HIGH"
                                        ? "blink 1.8s ease infinite" : "none",
                                }}>
                                    {cfg.emoji} {cfg.label}
                                </span>
                            </div>

                            {/* Verdict */}
                            <p style={{
                                textAlign: "center",
                                color: "#C0C0C0",
                                fontSize: "0.92rem",
                                fontStyle: "italic",
                                margin: "0 0 20px",
                                lineHeight: 1.6,
                                padding: "0 8px",
                            }}>
                                "{result.verdict}"
                            </p>

                            {/* Risk bar */}
                            <RiskBar score={result.riskScore} color={cfg.color} />

                            {/* Timer */}
                            <div style={{ marginTop: "22px" }}>
                                <div style={{
                                    textAlign: "center",
                                    fontSize: "0.6rem",
                                    color: "#A0A0A0",
                                    letterSpacing: "3px",
                                    marginBottom: "12px",
                                }}>
                                    TIME TO ADAPT YOUR BUSINESS
                                </div>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <TimerBlock value={years} label="YEARS" color={cfg.color} />
                                    <TimerBlock value={months} label="MONTHS" color={cfg.color} />
                                    <TimerBlock value={days} label="DAYS" color={cfg.color} />
                                </div>
                            </div>

                            {/* Two-col breakdown */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "18px" }}>
                                <div style={{
                                    background: "rgba(255,109,0,0.04)",
                                    border: "1px solid rgba(255,109,0,0.12)",
                                    borderRadius: "12px", padding: "14px",
                                }}>
                                    <div style={{ fontSize: "0.58rem", color: "#FF6D00", letterSpacing: "2px", marginBottom: "10px", fontWeight: 700 }}>
                                        🤖 AI WILL HANDLE
                                    </div>
                                    {result.topThreats.map((t, i) => (
                                        <div key={i} style={{ fontSize: "0.75rem", color: "#B0B0B0", marginBottom: "5px", lineHeight: 1.4 }}>
                                            ✗ {t}
                                        </div>
                                    ))}
                                </div>
                                <div style={{
                                    background: "rgba(0,196,140,0.04)",
                                    border: "1px solid rgba(0,196,140,0.1)",
                                    borderRadius: "12px", padding: "14px",
                                }}>
                                    <div style={{ fontSize: "0.58rem", color: "#00C48C", letterSpacing: "2px", marginBottom: "10px", fontWeight: 700 }}>
                                        🧠 YOUR EDGE
                                    </div>
                                    {result.humanEdge.map((s, i) => (
                                        <div key={i} style={{ fontSize: "0.75rem", color: "#B0B0B0", marginBottom: "5px", lineHeight: 1.4 }}>
                                            ✓ {s}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Research citation */}
                            <div style={{
                                marginTop: "14px",
                                borderLeft: `2px solid ${cfg.color}44`,
                                paddingLeft: "12px",
                                paddingTop: "8px",
                                paddingBottom: "8px",
                                marginBottom: "16px"
                            }}>
                                <div style={{ fontSize: "0.63rem", color: "#A0A0A0", lineHeight: 1.5 }}>
                                    📊 {result.researchBasis}
                                </div>
                            </div>

                        </div>

                        {/* ─── SOCIAL SHARE (outside capture ref) ─── */}
                        <div style={{ marginTop: "16px" }}>
                            <div style={{ textAlign: "center", fontSize: "0.58rem", color: "#666", letterSpacing: "2px", fontWeight: 700, marginBottom: "10px", textTransform: "uppercase" }}>
                                ⚡ Share Your Risk Score
                            </div>

                            {/* Captured image preview */}
                            {previewImg && previewImg !== 'failed' ? (
                                <div style={{ marginBottom: "10px", borderRadius: "12px", overflow: "hidden", border: `1px solid ${cfg.color}33` }}>
                                    <img src={previewImg} alt="Your AI Risk Score" style={{ width: "100%", display: "block", borderRadius: "12px" }} />
                                </div>
                            ) : previewImg !== 'failed' ? (
                                <div style={{ marginBottom: "10px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    <svg style={{ animation: "spin 1s linear infinite", width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                                    <span style={{ fontSize: "0.62rem", color: "#555", letterSpacing: "1px" }}>Generating preview...</span>
                                </div>
                            ) : null}

                            {/* 5 Platform Buttons with official SVG logos */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
                                {[
                                    {
                                        name: "X", bg: "#000", border: "rgba(255,255,255,0.15)", key: "twitter",
                                        svg: <svg viewBox="0 0 24 24" fill="white" style={{ width: 18, height: 18 }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.762l7.74-8.85L2.25 2.25h6.792l4.262 5.638L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg>
                                    },
                                    {
                                        name: "LinkedIn", bg: "#0A66C2", border: "#0A66C2", key: "linkedin",
                                        svg: <svg viewBox="0 0 24 24" fill="white" style={{ width: 18, height: 18 }}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                    },
                                    {
                                        name: "WhatsApp", bg: "#25D366", border: "#25D366", key: "whatsapp",
                                        svg: <svg viewBox="0 0 24 24" fill="white" style={{ width: 18, height: 18 }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
                                    },
                                    {
                                        name: "Facebook", bg: "#1877F2", border: "#1877F2", key: "facebook",
                                        svg: <svg viewBox="0 0 24 24" fill="white" style={{ width: 18, height: 18 }}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                    },
                                    {
                                        name: "Instagram", bg: "#E1306C", border: "#E1306C", key: "instagram",
                                        extraStyle: { background: "linear-gradient(135deg,#405DE6,#5851DB,#833AB4,#C13584,#E1306C,#FD1D1D,#F56040,#F77737,#FCAF45,#FFDC80)" },
                                        svg: <svg viewBox="0 0 24 24" fill="white" style={{ width: 18, height: 18 }}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
                                    },
                                ].map(p => (
                                    <button
                                        key={p.name}
                                        onClick={() => shareImage(p.key)}
                                        title={p.key === 'instagram' ? 'Opens Instagram — image auto-downloaded if available' : `Share on ${p.name}`}
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "4px",
                                            padding: "10px 4px",
                                            background: p.bg,
                                            ...p.extraStyle,
                                            border: `1px solid ${p.border}`,
                                            borderRadius: "10px",
                                            color: "#fff",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            opacity: 1,
                                            transition: "all 0.2s ease",
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.05)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.5)"; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
                                    >
                                        {p.svg}
                                        <span style={{ fontSize: "0.46rem", opacity: 0.9, letterSpacing: "0.3px", lineHeight: 1 }}>{p.name}</span>
                                    </button>
                                ))}
                            </div>
                            <p style={{ textAlign: "center", color: "#555", fontSize: "0.58rem", marginTop: "8px" }}>
                                {previewImg && previewImg !== 'failed' ? 'Image auto-saved when sharing • tap any platform to post' : 'Click any platform to share your risk score'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
