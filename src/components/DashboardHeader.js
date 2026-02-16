export default function DashboardHeader({ companyName = "Nexus Corp." }) {
    return (
        <header className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Welcome back, <span className="text-primary">{companyName}</span></h2>
                <p className="text-white/50 mt-1">Operational analysis synced 2 minutes ago.</p>
            </div>
            <div className="flex items-center gap-4">
                {/* Bell icon removed */}
            </div>
        </header>
    );
}
