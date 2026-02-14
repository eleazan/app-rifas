import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

function StatCard({ icon, label, value, sub, accent, delay }) {
    return (
        <div className={`animate-fade-in-up ${delay} opacity-0 relative overflow-hidden bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {value}
                    </p>
                    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${accent}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function Dashboard({ stats, recentSales }) {
    const { auth } = usePage().props;

    return (
        <AuthenticatedLayout header="Mi Panel">
            <Head title="Mi Panel" />

            <div className="space-y-8">
                {/* Welcome */}
                <div className="animate-fade-in-up relative overflow-hidden rounded-2xl p-8"
                     style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)' }}>
                    <div className="absolute top-4 right-8 text-6xl opacity-10 animate-float">🎟️</div>
                    <div className="relative z-10">
                        <p className="text-amber-400/80 text-sm font-medium tracking-wider uppercase mb-1">Vendedor</p>
                        <h2 className="text-3xl font-extrabold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Hola, {auth.user.name} 👋
                        </h2>
                        <p className="text-slate-400 text-sm">
                            {stats.activeRaffle
                                ? <>Rifa activa: <span className="text-amber-400 font-medium">{stats.activeRaffle}</span></>
                                : 'No hay rifa activa en este momento.'}
                        </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1"
                         style={{ background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #d97706, transparent)' }} />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard icon="🎫" label="Mis Boletos" value={stats.myTickets}
                              accent="bg-amber-50 text-amber-600" delay="delay-100" />
                    <StatCard icon="💰" label="Mis Ventas" value={`${stats.myRevenue}€`}
                              accent="bg-emerald-50 text-emerald-600" delay="delay-200" />
                    <StatCard icon="🤑" label="Mi Comision" value={`${stats.myCommission}€`}
                              sub={`${stats.commissionPct}% de comision`}
                              accent="bg-violet-50 text-violet-600" delay="delay-300" />
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link href={route('sell.index')}
                          className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200/60 hover:border-amber-300 hover:shadow-md transition-all duration-200 group no-underline">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-700">Vender boletos</p>
                            <p className="text-xs text-slate-400">Registra una nueva venta</p>
                        </div>
                    </Link>
                    <Link href={route('my-sales.index')}
                          className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200/60 hover:border-amber-300 hover:shadow-md transition-all duration-200 group no-underline">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-700">Mis ventas</p>
                            <p className="text-xs text-slate-400">Historial completo</p>
                        </div>
                    </Link>
                </div>

                {/* Recent sales */}
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Ventas Recientes
                    </h3>
                    <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                        {recentSales.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {recentSales.map((sale) => (
                                    <div key={sale.sale_id} className="flex items-center gap-4 px-5 py-3">
                                        <div className="flex flex-wrap gap-1 shrink-0">
                                            {sale.numbers.map((n) => (
                                                <span key={n} className="font-mono font-bold text-xs px-1.5 py-0.5 rounded text-slate-900"
                                                      style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                                                    {n}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-700 truncate">{sale.buyer_name}</p>
                                            <p className="text-xs text-slate-400">{sale.numbers.length} boleto{sale.numbers.length > 1 ? 's' : ''}</p>
                                        </div>
                                        <span className="text-xs text-slate-400 whitespace-nowrap">{sale.created_at}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-sm text-slate-400">Sin ventas todavia</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
