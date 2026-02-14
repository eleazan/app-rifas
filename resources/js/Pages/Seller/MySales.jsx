import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

function StatCard({ icon, label, value, sub, accent }) {
    return (
        <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/60 p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {value}
                    </p>
                    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${accent}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function MySales({ sales, stats, seller, raffleName }) {
    const totalTickets = sales.reduce((sum, s) => sum + s.numbers.length, 0);

    return (
        <AuthenticatedLayout header="Mis Ventas">
            <Head title="Mis Ventas" />

            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard icon="🎫" label="Boletos vendidos" value={stats.total_tickets}
                              accent="bg-amber-50 text-amber-600" />
                    <StatCard icon="💰" label="Total vendido" value={`${stats.total_sales}€`}
                              accent="bg-emerald-50 text-emerald-600" />
                    <StatCard icon="🤑" label="Mi comision" value={`${stats.commission}€`}
                              sub={`${stats.commission_pct}%`}
                              accent="bg-violet-50 text-violet-600" />
                </div>

                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-slate-500 text-sm">
                            {sales.length} {sales.length === 1 ? 'venta' : 'ventas'} — {totalTickets} boletos
                            {raffleName && <span className="text-slate-400"> en {raffleName}</span>}
                        </p>
                    </div>
                    <Link href={route('sell.index')} className="btn btn-sm text-slate-900 border-0"
                          style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Vender mas
                    </Link>
                </div>

                {/* Sales table */}
                {sales.length > 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="text-slate-500 font-medium">Numeros</th>
                                        <th className="text-slate-500 font-medium">Comprador</th>
                                        <th className="text-slate-500 font-medium">Contacto</th>
                                        <th className="text-slate-500 font-medium">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.map((sale) => (
                                        <tr key={sale.sale_id} className="hover:bg-slate-50/50">
                                            <td>
                                                <div className="flex flex-wrap gap-1">
                                                    {sale.numbers.map((n) => (
                                                        <span key={n} className="font-mono font-bold text-xs px-1.5 py-0.5 rounded text-slate-900"
                                                              style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                                                            {n}
                                                        </span>
                                                    ))}
                                                </div>
                                                {sale.numbers.length > 1 && (
                                                    <span className="text-xs text-slate-400 mt-1 block">{sale.numbers.length} boletos</span>
                                                )}
                                            </td>
                                            <td className="font-semibold text-slate-800">{sale.buyer_name}</td>
                                            <td className="text-slate-600">
                                                {sale.contact_method === 'whatsapp' ? (
                                                    <span className="flex items-center gap-1 text-sm">
                                                        <span className="text-green-500">📱</span> {sale.buyer_phone || '—'}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-sm">
                                                        <span>✉️</span> {sale.buyer_email || '—'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-slate-500 text-sm">
                                                {new Date(sale.created_at).toLocaleDateString('es-ES', {
                                                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
                        <span className="text-5xl mb-4 block">🎫</span>
                        <h3 className="text-lg font-bold text-slate-700 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            No tienes ventas todavia
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">Empieza a vender boletos</p>
                        <Link href={route('sell.index')} className="btn btn-sm text-slate-900 border-0"
                              style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                            Vender Boletos
                        </Link>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
