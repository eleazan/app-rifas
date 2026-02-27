import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function PaellaSales({ sales, stock, raffleName, isAdmin }) {
    const formatDate = (iso) =>
        new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const byType = (type) => sales.filter((s) => s.type === type);
    const byTypeSeller = sales.reduce((acc, s) => {
        const key = s.seller_name ?? 'Sin vendedor';
        acc[key] = (acc[key] ?? 0) + s.quantity;
        return acc;
    }, {});

    return (
        <AuthenticatedLayout header="Ventas de Paella">
            <Head title="Ventas de Paella" />

            <div className="space-y-6">
                {/* Stock overview */}
                {stock && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Total tickets', value: stock.total, color: 'text-slate-800' },
                            { label: 'Vendidos', value: stock.sold, color: 'text-amber-500' },
                            { label: 'Disponibles', value: stock.remaining, color: stock.remaining === 0 ? 'text-error' : 'text-success' },
                            { label: 'Valenciana / Vegana', value: `${stock.sold_valenciana} / ${stock.sold_vegana}`, color: 'text-slate-600' },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="bg-white rounded-2xl border border-slate-200/60 p-4 text-center">
                                <p className={`text-2xl font-extrabold ${color}`} style={{ fontFamily: "'Outfit', sans-serif" }}>{value}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Resumen por vendedor (admin only) */}
                {isAdmin && Object.keys(byTypeSeller).length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                        <h3 className="font-bold text-slate-800 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Tickets vendidos por vendedor
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(byTypeSeller).map(([seller, qty]) => (
                                <span key={seller}
                                      className="px-3 py-1.5 rounded-full text-sm font-medium text-slate-700 bg-slate-100">
                                    {seller}: <strong>{qty}</strong>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tabla de ventas */}
                <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {raffleName ? `Ventas — ${raffleName}` : 'Ventas de paella'}
                        </h3>
                        <span className="text-sm text-slate-400">{sales.length} venta{sales.length !== 1 ? 's' : ''}</span>
                    </div>

                    {sales.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <span className="text-4xl block mb-2">🥘</span>
                            <p className="text-sm">Aún no hay ventas de paella</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table table-sm w-full">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                                    <tr>
                                        <th>Comprador</th>
                                        <th>Teléfono</th>
                                        <th>Tipo</th>
                                        <th className="text-center">Cantidad</th>
                                        {isAdmin && <th>Vendedor</th>}
                                        <th>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-slate-50">
                                            <td className="font-medium text-slate-800">{sale.buyer_name}</td>
                                            <td className="font-mono text-sm text-slate-500">{sale.buyer_phone}</td>
                                            <td>
                                                <span className={`badge badge-sm font-medium ${
                                                    sale.type === 'vegana'
                                                        ? 'badge-success text-white'
                                                        : 'badge-warning text-slate-900'
                                                }`}>
                                                    {sale.type}
                                                </span>
                                            </td>
                                            <td className="text-center font-bold text-slate-800">{sale.quantity}</td>
                                            {isAdmin && (
                                                <td className="text-slate-500 text-sm">{sale.seller_name ?? '—'}</td>
                                            )}
                                            <td className="text-slate-400 text-xs">{formatDate(sale.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
