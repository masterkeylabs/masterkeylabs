"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function DiagnosticLog() {
    const [logs, setLogs] = useState([]);
    const scrollRef = useRef(null);

    useEffect(() => {
        // Fetch existing logs
        const fetchLogs = async () => {
            const { data } = await supabase
                .from('diagnostic_logs')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(10);
            if (data) setLogs(data);
        };

        fetchLogs();

        // Subscribe to new logs
        const logsSubscription = supabase
            .channel('public:diagnostic_logs')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'diagnostic_logs' }, payload => {
                setLogs(prev => [...prev.slice(-9), payload.new]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(logsSubscription);
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="bg-glass rounded-2xl p-8 border border-white/5 opacity-90 h-full flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-white/5 border-l border-b border-white/10 rounded-bl-lg text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">
                System Log v2.0
            </div>

            <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-4 bg-cyan-400/40 rounded-full" />
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Diagnostic Stream</h4>
            </div>

            <div
                ref={scrollRef}
                className="font-mono text-[10px] space-y-2 text-cyan-400/50 overflow-y-auto max-h-[160px] pr-4 scrollbar-hide select-none"
            >
                {logs.length > 0 ? (
                    logs.map((log) => (
                        <div key={log.id} className={`flex gap-3 leading-relaxed transition-opacity ${log.type === 'error' ? 'text-red-400/60' : log.type === 'warning' ? 'text-yellow-400/60' : ''}`}>
                            <span className="opacity-30 whitespace-nowrap">[{new Date(log.created_at).toLocaleTimeString([], { hour12: false })}]</span>
                            <span className="font-medium tracking-tight">{log.message}</span>
                        </div>
                    ))
                ) : (
                    <div className="animate-pulse">_ EXEC_DATA_FETCHING...</div>
                )}
                <div className="animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-3 bg-cyan-400/40" />
                    <span className="text-white/20 font-black tracking-[0.2em] text-[8px]">AWAIT_ANOMALY</span>
                </div>
            </div>
        </div>
    );
}
