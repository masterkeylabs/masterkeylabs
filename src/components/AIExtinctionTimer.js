'use client';
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";

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
    "FINALIZING RISK PROFILE...",
];

const THREAT_CONFIG = {
    CRITICAL: { color: "#FF2D2D", glow: "rgba(255,45,45,0.15)", label: "CRITICAL RISK", emoji: "🔴" },
    HIGH: { color: "#FF6B00", glow: "rgba(255,107,0,0.15)", label: "HIGH RISK", emoji: "🟠" },
    MODERATE: { color: "#FFB800", glow: "rgba(255,184,0,0.15)", label: "MODERATE RISK", emoji: "🟡" },
    RESILIENT: { color: "#00C48C", glow: "rgba(0,196,140,0.15)", label: "RESILIENT", emoji: "🟢" },
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
        <div className="ext-timer-block" style={{
            flex: 1, background: "rgba(255,255,255,0.03)",
            border: `1px solid ${color}33`, borderRadius: "14px",
            padding: "18px 10px", textAlign: "center",
        }}>
            <div className="ext-timer-num" style={{
                fontSize: "clamp(1.8rem, 5vw, 2.4rem)", fontWeight: 900, color,
                lineHeight: 1, fontVariantNumeric: "tabular-nums",
                textShadow: `0 0 20px ${color}66`,
            }}>
                {String(animated).padStart(2, "0")}
            </div>
            <div style={{ fontSize: "0.58rem", color: "#555", letterSpacing: "2.5px", marginTop: "6px" }}>{label}</div>
        </div>
    );
}

function RiskBar({ score, color, t }) {
    const [w, setW] = useState(0);
    useEffect(() => { const t = setTimeout(() => setW(score), 200); return () => clearTimeout(t); }, [score]);
    const animated = useAnimatedValue(score);
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.65rem", color: "#444", letterSpacing: "2px" }}>{t.extinctionTimer.exposureLabel}</span>
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

// ─── Flat share-card rendered off-screen (no backdrop-filter, no blur) ───────
function ShareCard({ result, cfg, jobTitle, years, months, days, t }) {
    if (!result || !cfg) return null;
    return (
        <div style={{
            width: "550px",
            background: "#000",
            border: "1px solid rgba(255,255,255,0.03)",
            borderRadius: "0", // Flat for capture
            padding: "48px 40px",
            fontFamily: "'Inter', -apple-system, sans-serif",
            color: "#fff",
            position: "relative",
            overflow: "hidden"
        }}>
            {/* 1. Brand Header */}
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
                {/* Logo Branding - Centered & Prominent */}
                <div style={{
                    marginBottom: "32px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    filter: "drop-shadow(0 0 20px rgba(255,109,0,0.2))"
                }}>
                    <img
                        src="/logo-new.png"
                        alt="MasterKey Labs"
                        style={{ height: "120px", width: "auto", opacity: 0.95, filter: "brightness(1.2)" }}
                    />
                </div>

                <div style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    fontSize: "0.65rem", letterSpacing: "5px", color: "#FF6D00",
                    fontWeight: 800, marginBottom: "18px", textTransform: "uppercase"
                }}>
                    <span style={{ fontSize: "0.5rem" }}>●</span> {t.extinctionTimer.analysisBadge}
                </div>
                <h1 style={{
                    fontSize: "3.2rem",
                    fontWeight: 900, color: "#fff",
                    margin: "0 0 14px", lineHeight: 1,
                    letterSpacing: "-2px",
                }}>
                    {t.extinctionTimer.title1}<br />
                    <span style={{ color: "#FF6D00" }}>{t.extinctionTimer.title2}</span>
                </h1>
                <p style={{ color: "#777", fontSize: "1rem", margin: 0, lineHeight: 1.6, fontWeight: 500, letterSpacing: "0.2px" }}>
                    {t.extinctionTimer.sub.split('.')[0]}.<br />
                    {t.extinctionTimer.sub.split('.')[1]}
                </p>
            </div>

            {/* 2. Mock Input Box */}
            <div style={{
                width: "100%",
                background: "#0D0D0E",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "20px 24px",
                color: "#fff",
                fontSize: "1.1rem",
                fontWeight: 700,
                marginBottom: "16px",
            }}>
                {jobTitle || "developer"}
            </div>

            {/* 3. Mock Primary Button */}
            <div style={{
                width: "100%",
                padding: "20px",
                background: "linear-gradient(135deg, #FF6000, #FF8000)",
                borderRadius: "16px",
                color: "#fff",
                fontWeight: 900,
                fontSize: "1rem",
                textAlign: "center",
                boxShadow: "0 10px 40px rgba(255,96,0,0.35)",
                marginBottom: "48px",
                letterSpacing: "0.5px"
            }}>
                {t.extinctionTimer.calculateBtn}
            </div>

            {/* 4. Result Card (matches main UI) */}
            <div style={{
                background: "rgba(10,10,11,0.8)",
                border: `1px solid ${cfg.color}25`,
                borderRadius: "28px",
                padding: "32px",
                position: "relative"
            }}>
                {/* Risk Score Badge */}
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: "10px",
                        background: `${cfg.color}15`, border: `1px solid ${cfg.color}33`,
                        color: cfg.color, fontSize: "0.65rem", fontWeight: 900,
                        letterSpacing: "3px", padding: "8px 24px", borderRadius: "99px",
                        textTransform: "uppercase"
                    }}>
                        <span style={{ color: cfg.color }}>●</span> {cfg.label}
                    </div>
                </div>

                {/* Verdict (Italicized) */}
                <div style={{
                    fontSize: "1.1rem", color: "#E0E0E0", fontStyle: "italic",
                    textAlign: "center", marginBottom: "36px", lineHeight: 1.6,
                    padding: "0 10px", fontWeight: 500
                }}>
                    "{result.verdict}"
                </div>

                {/* Automation Exposure Progress Bar */}
                <div style={{ marginBottom: "40px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "14px" }}>
                        <span style={{ fontSize: "0.75rem", color: "#555", letterSpacing: "3px", fontWeight: 700 }}>AUTOMATION EXPOSURE</span>
                        <span style={{ fontSize: "1.4em", fontWeight: 900, color: cfg.color }}>{result.riskScore}%</span>
                    </div>
                    <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "99px", overflow: "hidden" }}>
                        <div style={{
                            height: "100%", width: `${result.riskScore}%`,
                            background: `linear-gradient(90deg, ${cfg.color}44, ${cfg.color})`,
                            borderRadius: "99px", boxShadow: `0 0 20px ${cfg.color}33`
                        }} />
                    </div>
                </div>

                {/* Survival Timer Blocks */}
                <div style={{ textAlign: "center", fontSize: "0.75rem", color: "#555", letterSpacing: "5px", marginBottom: "20px", fontWeight: 800 }}>
                    TIME TO ADAPT YOUR BUSINESS
                </div>
                <div style={{ display: "flex", gap: "16px", marginBottom: "36px" }}>
                    {[{ v: years, l: "YEARS" }, { v: months, l: "MONTHS" }, { v: days, l: "DAYS" }].map(({ v, l }) => (
                        <div key={l} style={{
                            flex: 1, background: "rgba(255,255,255,0.015)",
                            border: `1px solid ${cfg.color}15`, borderRadius: "24px",
                            padding: "28px 10px", textAlign: "center",
                            boxShadow: `0 10px 30px ${cfg.color}08`
                        }}>
                            <div style={{ fontSize: "3.2rem", fontWeight: 900, color: cfg.color, lineHeight: 1 }}>{String(v).padStart(2, "0")}</div>
                            <div style={{ fontSize: "0.65rem", color: "#444", letterSpacing: "3px", marginTop: "14px", fontWeight: 800 }}>{l}</div>
                        </div>
                    ))}
                </div>

                {/* Detailed Breakdown Tags */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "36px" }}>
                    <div style={{ background: `${cfg.color}05`, border: `1px solid ${cfg.color}15`, borderRadius: "24px", padding: "24px" }}>
                        <div style={{ fontSize: "0.65rem", color: cfg.color, letterSpacing: "3px", marginBottom: "20px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
                            <span>🤖</span> AI WILL HANDLE
                        </div>
                        {result.topThreats.map((t, i) => (
                            <div key={i} style={{ fontSize: "0.85rem", color: "#A0A0A0", marginBottom: "10px", lineHeight: 1.5, fontWeight: 500 }}>✗ {t}</div>
                        ))}
                    </div>
                    <div style={{ background: "rgba(0,196,140,0.03)", border: "1px solid rgba(0,196,140,0.12)", borderRadius: "24px", padding: "24px" }}>
                        <div style={{ fontSize: "0.65rem", color: "#00C48C", letterSpacing: "3px", marginBottom: "20px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
                            <span>🧠</span> YOUR EDGE
                        </div>
                        {result.humanEdge.map((s, i) => (
                            <div key={i} style={{ fontSize: "0.85rem", color: "#A0A0A0", marginBottom: "10px", lineHeight: 1.5, fontWeight: 500 }}>✓ {s}</div>
                        ))}
                    </div>
                </div>

                {/* Scientific Basis Stat & Website Branding - Centered Footer */}
                <div style={{
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    paddingTop: "24px",
                    textAlign: "center"
                }}>
                    <div style={{
                        fontSize: "1rem",
                        color: "#FF6D00",
                        fontWeight: 900,
                        letterSpacing: "2px",
                        marginBottom: "12px",
                        textTransform: "lowercase"
                    }}>
                        www.masterkeylabs.ai
                    </div>
                    <div style={{
                        fontSize: "0.7rem",
                        color: "#444",
                        lineHeight: 1.6,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        letterSpacing: "0.5px"
                    }}>
                        <span>📖</span> {result.researchBasis}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AIExtinctionTimer({ guestMode = false, onGetStarted }) {
    const { t } = useLanguage();
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [dots, setDots] = useState(0);
    const [searchIndex, setSearchIndex] = useState(0);
    const [captureStatus, setCaptureStatus] = useState("idle"); // idle | capturing | done | failed
    const inputRef = useRef(null);
    const cardRef = useRef(null);
    const shareCardRef = useRef(null);

    const [previewBlob, setPreviewBlob] = useState(null);
    const [previewImgUrl, setPreviewImgUrl] = useState(null);
    const [shareNotice, setShareNotice] = useState(""); // Feedback like "Copied!" 

    const cfg = result ? (THREAT_CONFIG[result.threatLevel] || THREAT_CONFIG.MODERATE) : null;
    const years = result ? Math.floor(result.yearsRemaining) : 0;
    const months = result ? Math.floor((result.yearsRemaining % 1) * 12) : 0;
    const days = result ? Math.floor(((result.yearsRemaining * 12) % 1) * 30) : 0;

    // Auto-capture the hidden flat share card after result renders
    useEffect(() => {
        if (!result) return;
        setPreviewBlob(null);
        if (previewImgUrl) { URL.revokeObjectURL(previewImgUrl); setPreviewImgUrl(null); }
        setCaptureStatus("capturing");

        const timer = setTimeout(async () => {
            const el = document.getElementById('share-card-target');
            if (!el) { setCaptureStatus("failed"); return; }
            try {
                const { toBlob } = await import('html-to-image');
                const blob = await toBlob(el, {
                    pixelRatio: 4, // Boost quality for high-res social sharing
                    backgroundColor: "#000000",
                    cacheBust: true,
                });

                if (blob) {
                    setPreviewBlob(blob);
                    setPreviewImgUrl(URL.createObjectURL(blob));
                    setCaptureStatus("done");
                } else {
                    setCaptureStatus("failed");
                }
            } catch (err) {
                console.error('Capture failed:', err);
                setCaptureStatus("failed");
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [result]);

    // Share handler — natively shares if supported, opens social link if desktop
    const shareImage = async (platform) => {
        const siteUrl = 'https://masterkeylabs.ai';
        const shareText = ""; // Removed companion text per requirement
        const encodedText = encodeURIComponent(shareText);
        const encodedUrl = encodeURIComponent(siteUrl);

        const platformUrls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            instagram: `https://www.instagram.com/`,
        };

        if (previewBlob && captureStatus === 'done') {
            try {
                const file = new File([previewBlob], 'MasterKeyLabs-Risk.png', { type: 'image/png' });

                const shareData = {
                    files: [file],
                    title: 'My AI Risk Score',
                    text: shareText,
                    url: siteUrl
                };

                // iOS Workaround: Only share the file if text/url causes it to fail
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                const finalShareData = isIOS ? { files: [file] } : shareData;

                if (navigator.canShare && navigator.canShare(finalShareData)) {
                    try {
                        await navigator.share(finalShareData);
                        setShareNotice("Opened Share Menu");
                        setTimeout(() => setShareNotice(""), 3000);
                        return; // Prevent fallback
                    } catch (e) { console.error("Native share aborted/failed:", e); }
                }

                // Desktop Fallbacks:
                // Try clipboard first
                if (navigator.clipboard && window.ClipboardItem) {
                    try {
                        const item = new ClipboardItem({ [previewBlob.type]: previewBlob });
                        await navigator.clipboard.write([item]);
                        setShareNotice("Image Copied! Paste it in the post.");
                        setTimeout(() => setShareNotice(""), 4000);
                    } catch (e) { console.error('Clipboard failed', e); }
                } else {
                    // Force download if clipboard isn't supported
                    const link = document.createElement('a');
                    link.download = 'AI-Risk-Report.png';
                    link.href = URL.createObjectURL(previewBlob);
                    link.click();
                    URL.revokeObjectURL(link.href);
                }

            } catch (e) { console.error('Share logic failed:', e); }
        }

        if (platform && platformUrls[platform]) {
            setTimeout(() => window.open(platformUrls[platform], '_blank'), 400);
        }
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
        if (!trimmed) return;

        setLoading(true); setResult(null); setError(""); setPreviewImgUrl(null); setCaptureStatus("idle");

        const MAX_RETRIES = 3;
        const RETRY_DELAYS = [5000, 10000, 15000];

        const isQuotaErr = (msg) =>
            typeof msg === 'string' && (
                msg.toLowerCase().includes('quota') ||
                msg.toLowerCase().includes('demand') ||
                msg.toLowerCase().includes('overload') ||
                msg.toLowerCase().includes('resource') ||
                msg.toLowerCase().includes('capacity') ||
                msg.toLowerCase().includes('rate')
            );

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
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
                    if (typeof msg === 'string' && (msg.includes('API key') || msg.includes('DEEPSEEK_API_KEY'))) {
                        setError("DEEPSEEK_API_KEY is missing or invalid in production environment.");
                        break;
                    }
                    if (isQuotaErr(msg) && attempt < MAX_RETRIES) {
                        const secs = Math.ceil(RETRY_DELAYS[attempt] / 1000);
                        for (let s = secs; s > 0; s--) {
                            setError(`⏳ DeepSeek High demand — retrying in ${s}s (attempt ${attempt + 1}/${MAX_RETRIES})...`);
                            await new Promise(r => setTimeout(r, 1000));
                        }
                        setError("");
                        continue;
                    }
                    setError(typeof msg === 'string' ? msg : "Analysis failed — please try again.");
                    break;
                }

                // Parse standard OpenAI/DeepSeek response structure
                const raw = data.choices?.[0]?.message?.content || "";
                setResult(JSON.parse(raw.trim()));
                setError("");
                break;

            } catch (err) {
                if (isQuotaErr(err.message) && attempt < MAX_RETRIES) {
                    const secs = Math.ceil(RETRY_DELAYS[attempt] / 1000);
                    for (let s = secs; s > 0; s--) {
                        setError(`⏳ High demand — retrying in ${s}s (attempt ${attempt + 1}/${MAX_RETRIES})...`);
                        await new Promise(r => setTimeout(r, 1000));
                    }
                    setError("");
                    continue;
                }
                console.error(err);
                setError(err.message || "Analysis failed — please try again.");
                break;
            }
        }

        setLoading(false);
    };

    // socialPlatforms array removed to streamline UI

    return (
        <div style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            background: "#080809",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            borderRadius: "24px",
            border: "1px solid rgba(255,255,255,0.05)",
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
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }

        .ext-timer-wrap { width: 100%; max-width: 460px; }

        /* ── Mobile responsive ── */
        @media (max-width: 500px) {
          .ext-h1 { font-size: 1.7rem !important; }
          .ext-timer-blocks { gap: 6px !important; }
          .ext-timer-block { padding: 12px 6px !important; }
          .ext-timer-num  { font-size: 1.8rem !important; }
          .ext-share-grid { grid-template-columns: repeat(5,1fr) !important; gap: 4px !important; }
          .ext-share-btn  { padding: 8px 2px !important; }
          .ext-share-btn svg { width:15px !important; height:15px !important; }
          .ext-share-label { font-size: 0.42rem !important; }
          .ext-preview-img { max-height: 220px !important; }
          .ext-breakdown { grid-template-columns: 1fr !important; }
        }
      `}</style>

            <div className="ext-timer-wrap">

                {/* ─── HEADER ─── */}
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        fontSize: "0.62rem", letterSpacing: "3px", color: "#FF6D00",
                        marginBottom: "14px", fontWeight: 700,
                        animation: "blink 2s ease infinite",
                    }}>
                        <span>●</span> {t.extinctionTimer.analysisBadge}
                    </div>
                    <h1 className="ext-h1" style={{
                        fontSize: "clamp(1.7rem, 6vw, 2.4rem)",
                        fontWeight: 900, color: "#F0F0F0",
                        margin: "0 0 10px", lineHeight: 1.1,
                        letterSpacing: "-0.5px",
                    }}>
                        {t.extinctionTimer.title1}<br />
                        <span style={{ color: "#FF6D00" }}>{t.extinctionTimer.title2}</span>
                    </h1>
                    <p style={{ color: "#A0A0A0", fontSize: "clamp(0.78rem,2.5vw,0.83rem)", margin: 0, lineHeight: 1.7 }}>
                        {t.extinctionTimer.sub.split('.')[0]}.<br />
                        {t.extinctionTimer.sub.split('.')[1]}
                    </p>
                </div>

                {/* ─── INPUT + BUTTON ─── */}
                <div style={{ marginBottom: "10px" }}>
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={e => { setInput(e.target.value); setResult(null); setError(""); }}
                        onKeyDown={e => e.key === "Enter" && !loading && analyze()}
                        placeholder={t.extinctionTimer.placeholder}
                        style={{
                            width: "100%",
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "14px",
                            padding: "16px 18px",
                            color: "#E0E0E0",
                            fontSize: "clamp(0.82rem,2.8vw,0.9rem)",
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
                            padding: "18px",
                            background: loading
                                ? "rgba(255,109,0,0.1)"
                                : "linear-gradient(135deg, #E65100, #FF6D00)",
                            border: loading ? "1px solid rgba(255,109,0,0.2)" : "none",
                            borderRadius: "14px",
                            color: loading ? "#FF6D00" : "#fff",
                            fontWeight: 800,
                            fontSize: "clamp(0.75rem,2.5vw,0.8rem)",
                            letterSpacing: loading ? "1px" : "0.3px",
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "all 0.3s",
                            boxShadow: loading ? "none" : "0 6px 30px rgba(255,109,0,0.35)",
                        }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
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
                                        ⌛
                                    </span>
                                    {t.extinctionTimer.searchSteps[searchIndex]}
                                </>
                            ) : (
                                t.extinctionTimer.calculateBtn
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
                            padding: "clamp(16px,4vw,24px)",
                            animation: "fadeUp 0.5s ease both",
                        }}>

                        {/* Threat badge */}
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
                                {cfg.emoji} {t.extinctionTimer.threatLevels[result.threatLevel] || cfg.label}
                            </span>
                        </div>

                        {/* Verdict */}
                        <p style={{
                            textAlign: "center",
                            color: "#C0C0C0",
                            fontSize: "clamp(0.82rem,2.8vw,0.92rem)",
                            fontStyle: "italic",
                            margin: "0 0 20px",
                            lineHeight: 1.6,
                            padding: "0 8px",
                        }}>
                            "{result.verdict}"
                        </p>

                        <RiskBar score={result.riskScore} color={cfg.color} t={t} />

                        {/* Timer */}
                        <div style={{ marginTop: "22px" }}>
                            <div style={{
                                textAlign: "center",
                                fontSize: "0.6rem",
                                color: "#A0A0A0",
                                letterSpacing: "3px",
                                marginBottom: "12px",
                            }}>
                                {t.extinctionTimer.timeToAdapt}
                            </div>
                            <div className="ext-timer-blocks" style={{ display: "flex", gap: "10px" }}>
                                <TimerBlock value={years} label={t.extinctionTimer.yearsLabel} color={cfg.color} />
                                <TimerBlock value={months} label={t.extinctionTimer.monthsLabel} color={cfg.color} />
                                <TimerBlock value={days} label={t.extinctionTimer.daysLabel} color={cfg.color} />
                            </div>
                        </div>

                        {/* Two-col breakdown */}
                        <div className="ext-breakdown" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "18px" }}>
                            <div style={{
                                background: "rgba(255,109,0,0.04)",
                                border: "1px solid rgba(255,109,0,0.12)",
                                borderRadius: "12px", padding: "14px",
                            }}>
                                <div style={{ fontSize: "0.58rem", color: "#FF6D00", letterSpacing: "2px", marginBottom: "10px", fontWeight: 700 }}>
                                    🤖 {t.extinctionTimer.aiWillHandle}
                                </div>
                                {result.topThreats.map((t, i) => (
                                    <div key={i} style={{ fontSize: "clamp(0.7rem,2.3vw,0.75rem)", color: "#B0B0B0", marginBottom: "5px", lineHeight: 1.4 }}>
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
                                    🧠 {t.extinctionTimer.humanEdgeLabel}
                                </div>
                                {result.humanEdge.map((s, i) => (
                                    <div key={i} style={{ fontSize: "clamp(0.7rem,2.3vw,0.75rem)", color: "#B0B0B0", marginBottom: "5px", lineHeight: 1.4 }}>
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
                            marginBottom: "4px"
                        }}>
                            <div style={{ fontSize: "0.63rem", color: "#A0A0A0", lineHeight: 1.5 }}>
                                📊 {result.researchBasis}
                            </div>
                        </div>

                        {/* ─── SOCIAL SHARE ─── */}
                        <div style={{ marginTop: "18px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px", position: "relative" }}>
                            <button
                                onClick={() => shareImage(null)} // Trigger general native share
                                style={{
                                    display: "block",
                                    width: "100%",
                                    background: "#FF6D00",
                                    padding: "12px 20px",
                                    borderRadius: "99px",
                                    fontSize: "0.75rem",
                                    color: "#000",
                                    fontWeight: 900,
                                    letterSpacing: "1.5px",
                                    textTransform: "uppercase",
                                    zIndex: 10,
                                    boxShadow: "0 10px 25px rgba(255,109,0,0.4)",
                                    border: "2px solid #000",
                                    whiteSpace: "nowrap",
                                    cursor: "pointer",
                                    transition: "transform 0.2s, filter 0.2s",
                                    marginTop: "-14px",
                                    marginBottom: "10px"
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.filter = "brightness(1.1)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.filter = "brightness(1)"; }}
                            >
                                {t.extinctionTimer.sharePrompt || "Share this on Social Media"}
                            </button>

                            <div style={{ textAlign: "center", fontSize: "0.58rem", color: "#444", letterSpacing: "2px", fontWeight: 700, marginBottom: "12px", textTransform: "uppercase", marginTop: "10px" }}>
                                ⚡ Export Your Analysis
                            </div>

                            {/* Captured image preview */}
                            {captureStatus === "capturing" && (
                                <div style={{ marginBottom: "10px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    <svg style={{ animation: "spin 1s linear infinite", width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                    </svg>
                                    <span style={{ fontSize: "0.62rem", color: "#555", letterSpacing: "1px" }}>{t.extinctionTimer.generatingImage}</span>
                                </div>
                            )}

                            {/* Image preview hidden per requirement */}

                            {/* Individual platform icons removed per requirement */}

                            <p style={{ textAlign: "center", color: shareNotice ? "#FF6D00" : "#555", fontSize: "0.58rem", marginTop: "8px", lineHeight: 1.5, fontWeight: shareNotice ? 800 : 400, transition: "color 0.3s" }}>
                                {shareNotice || (captureStatus === "done"
                                    ? t.extinctionTimer.shareNoticeDone
                                    : captureStatus === "failed"
                                        ? "Error preparing share"
                                        : "Generating share image...")}
                            </p>
                        </div>

                        {/* ─── NEW: POST-RESULT CTA CARD (Fix #1) ─── */}
                        <div style={{
                            marginTop: "32px",
                            background: "rgba(255,255,255,0.03)",
                            border: `1px solid ${cfg.color}33`,
                            borderRadius: "20px",
                            padding: "24px",
                            textAlign: "center",
                            animation: "fadeUp 0.6s ease 0.3s both",
                            position: "relative",
                            overflow: "hidden"
                        }}>
                            {/* Visual Accent */}
                            <div style={{
                                position: "absolute",
                                top: 0, left: 0, right: 0, height: "2px",
                                background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`
                            }} />

                            <div style={{
                                display: "inline-block",
                                background: cfg.color === '#FF2D2D' ? 'rgba(255,45,45,0.1)' : cfg.color === '#FF6B00' ? 'rgba(255,107,0,0.1)' : 'rgba(0,229,255,0.1)',
                                border: `1px solid ${cfg.color}55`,
                                color: cfg.color,
                                fontSize: "0.6rem",
                                fontWeight: 900,
                                padding: "5px 14px",
                                borderRadius: "99px",
                                marginBottom: "14px",
                                textTransform: "uppercase",
                                letterSpacing: "1.5px"
                            }}>
                                {result.riskScore > 70 ? (t.extinctionTimer.priorityAction || '🚨 IMMEDIATE ACTION REQUIRED') : (t.extinctionTimer.optimizationAction || '💡 OPTIMIZATION REQUIRED')}
                            </div>

                            <h3 style={{
                                color: "#fff",
                                fontSize: "clamp(1rem, 3.5vw, 1.15rem)",
                                fontWeight: 900,
                                marginBottom: "10px",
                                lineHeight: 1.3,
                                letterSpacing: "-0.5px"
                            }}>
                                {t.extinctionTimer.resultTitle || `AI is coming for ${input.toLowerCase() || 'your role'}.`}<br />
                                {t.extinctionTimer.resultSub || "Don't just watch — adapt."}
                            </h3>
                            <p style={{
                                color: "#A0A0A0",
                                fontSize: "0.78rem",
                                marginBottom: "24px",
                                lineHeight: 1.6,
                                maxWidth: "280px",
                                margin: "0 auto 24px"
                            }}>
                                {t.extinctionTimer.extinctionSub || "Our system detected high friction in your workflow. See exactly where you are losing revenue."}
                            </p>

                            <button
                                onClick={onGetStarted}
                                style={{
                                    display: "block",
                                    width: "100%",
                                    background: "linear-gradient(135deg, #00E5FF, #0099FF)",
                                    color: "#000",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "16px",
                                    borderRadius: "14px",
                                    fontSize: "0.85rem",
                                    fontWeight: 900,
                                    marginBottom: "14px",
                                    boxShadow: "0 10px 25px rgba(0,229,255,0.25)",
                                    transition: "transform 0.2s ease, filter 0.2s ease",
                                    transform: "scale(1)",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = "scale(1.02)";
                                    e.currentTarget.style.filter = "brightness(1.1)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = "scale(1)";
                                    e.currentTarget.style.filter = "brightness(1)";
                                }}
                            >
                                {t.extinctionTimer.seeLeaksBtn || "See your Profit Leaks — 4 min Audit →"}
                            </button>

                            <a
                                href={t?.fab?.waMessage ? `https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(t.fab.waMessage.replace('{businessName}', input || 'Business').replace('{threatZone}', result.threatLevel).replace('{lossText}', 'high risk'))}` : "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    color: "#00C48C",
                                    fontSize: "0.78rem",
                                    fontWeight: 700,
                                    textDecoration: "none",
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    transition: "background 0.2s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(0,196,140,0.05)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.342 2.518.938 3.565l-.994 3.634 3.717-.974c1.011.552 2.169.869 3.407.87 3.181 0 5.767-2.586 5.768-5.766 0-3.181-2.587-5.766-5.768-5.766zM12.031 3c4.935 0 8.938 4.003 8.938 8.938s-4.003 8.938-8.938 8.938c-1.572 0-3.045-.407-4.326-1.118l-5.705 1.494 1.521-5.558c-.808-1.353-1.278-2.937-1.278-4.631 0-4.935 4.003-8.938 8.938-8.938z" />
                                </svg>
                                {t.extinctionTimer.whatsappSecondary || "or chat with us on WhatsApp →"}
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── HIDDEN FLAT SHARE CARD (captured by html2canvas) ─── */}
            {
                result && cfg && (
                    <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
                        <div id="share-card-target" ref={shareCardRef}>
                            <ShareCard
                                result={result}
                                cfg={cfg}
                                jobTitle={input}
                                years={years}
                                months={months}
                                days={days}
                                t={t}
                            />
                        </div>
                    </div>
                )
            }
        </div >
    );
}
