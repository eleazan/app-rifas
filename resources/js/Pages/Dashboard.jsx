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
            <div className="absolute -bottom-2 -right-2 w-24 h-24 rounded-full opacity-[0.03]"
                 style={{ background: 'radial-gradient(circle, currentColor, transparent)' }} />
        </div>
    );
}

function QuickAction({ icon, label, description, href }) {
    return (
        <Link href={href} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200/60 hover:border-amber-300 hover:shadow-md transition-all duration-200 cursor-pointer group no-underline">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">{label}</p>
                <p className="text-xs text-slate-400">{description}</p>
            </div>
            <svg className="w-5 h-5 text-slate-300 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
        </Link>
    );
}

export default function Dashboard({ stats, topSellers, recentSales }) {
    const { auth } = usePage().props;

    const soldPct = stats.totalNumbers > 0
        ? Math.round((stats.ticketsSold / stats.totalNumbers) * 100)
        : 0;

    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* Welcome banner */}
                <div className="animate-fade-in-up relative overflow-hidden rounded-2xl p-8"
                     style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)' }}>
                    <div className="absolute top-4 right-8 text-6xl opacity-10 animate-float">🎟️</div>
                    <div className="absolute bottom-4 right-24 text-4xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>✨</div>

                    <div className="relative z-10">
                        <p className="text-amber-400/80 text-sm font-medium tracking-wider uppercase mb-1">
                            Bienvenido de nuevo
                        </p>
                        <h2 className="text-3xl font-extrabold text-white mb-2"
                            style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Hola, {auth.user.name} 👋
                        </h2>
                        <p className="text-slate-400 text-sm max-w-lg">
                            {stats.activeRaffle
                                ? <>Rifa activa: <span className="text-amber-400 font-medium">{stats.activeRaffle}</span> — {soldPct}% vendido</>
                                : 'No hay una rifa activa. Crea o activa una rifa para empezar a vender.'}
                        </p>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-1"
                         style={{ background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #d97706, transparent)' }} />
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon="🎟️"
                        label="Rifa Activa"
                        value={stats.activeRaffle || '—'}
                        sub={stats.activeRaffle ? `${stats.prizesDrawn}/${stats.prizesCount} premios sorteados` : null}
                        accent="bg-amber-50 text-amber-600"
                        delay="delay-100"
                    />
                    <StatCard
                        icon="🎫"
                        label="Boletos Vendidos"
                        value={`${stats.ticketsSold} / ${stats.totalNumbers}`}
                        sub={`${soldPct}% vendido`}
                        accent="bg-emerald-50 text-emerald-600"
                        delay="delay-200"
                    />
                    <StatCard
                        icon="💰"
                        label="Recaudacion"
                        value={`${stats.revenue}€`}
                        accent="bg-violet-50 text-violet-600"
                        delay="delay-300"
                    />
                    <StatCard
                        icon="👥"
                        label="Vendedores Activos"
                        value={stats.sellersCount}
                        accent="bg-sky-50 text-sky-600"
                        delay="delay-400"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top sellers */}
                    <div className="animate-fade-in-up delay-300 opacity-0">
                        <h3 className="text-lg font-bold text-slate-800 mb-4"
                            style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Top Vendedores
                        </h3>
                        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                            {topSellers.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {topSellers.map((seller, i) => (
                                        <div key={i} className="flex items-center gap-4 px-5 py-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                i === 0 ? 'text-slate-900' : 'bg-slate-100 text-slate-500'
                                            }`}
                                                 style={i === 0 ? { background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' } : {}}>
                                                {i + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-slate-700">{seller.name}</p>
                                            </div>
                                            <span className="text-sm font-bold text-slate-800">{seller.sales}</span>
                                            <span className="text-xs text-slate-400">boletos</span>
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

                    {/* Recent sales */}
                    <div className="animate-fade-in-up delay-400 opacity-0">
                        <h3 className="text-lg font-bold text-slate-800 mb-4"
                            style={{ fontFamily: "'Outfit', sans-serif" }}>
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
                                                <p className="text-xs text-slate-400">por {sale.seller_name} — {sale.numbers.length} boleto{sale.numbers.length > 1 ? 's' : ''}</p>
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

                {/* Quick actions */}
                <div className="animate-fade-in-up delay-500 opacity-0">
                    <h3 className="text-lg font-bold text-slate-800 mb-4"
                        style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Acciones rapidas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <QuickAction
                            href={route('raffles.create')}
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" /></svg>}
                            label="Crear nueva rifa"
                            description="Configura una nueva rifa con premios"
                        />
                        <QuickAction
                            href={route('sellers.create')}
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
                            label="Agregar vendedor"
                            description="Registra un nuevo vendedor en el sistema"
                        />
                        <QuickAction
                            href={route('tickets.create')}
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>}
                            label="Vender boletos"
                            description="Registra ventas de la rifa activa"
                        />
                        <QuickAction
                            href={route('draw.index')}
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
                            label="Realizar sorteo"
                            description="Sortea premios de la rifa activa"
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
