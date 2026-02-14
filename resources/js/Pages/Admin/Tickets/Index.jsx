import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ sales, raffles, currentRaffleId }) {
    const handleRaffleChange = (e) => {
        router.get(route('tickets.index'), { raffle_id: e.target.value }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (sale) => {
        const count = sale.numbers.length;
        const label = count > 1
            ? `¿Eliminar ${count} boletos de ${sale.buyer_name}?`
            : `¿Eliminar boleto #${sale.numbers[0]} de ${sale.buyer_name}?`;

        if (confirm(label)) {
            router.delete(route('tickets.destroy', sale.ticket_ids[0]));
        }
    };

    const totalTickets = sales.reduce((sum, s) => sum + s.numbers.length, 0);
    const currentRaffle = raffles.find((r) => r.id === currentRaffleId);

    return (
        <AuthenticatedLayout header="Boletos">
            <Head title="Boletos" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <select
                            className="select select-bordered select-sm"
                            value={currentRaffleId || ''}
                            onChange={handleRaffleChange}
                        >
                            {raffles.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.name} {r.status === 'active' ? '(Activa)' : ''}
                                </option>
                            ))}
                        </select>
                        <p className="text-slate-500 text-sm">
                            {sales.length} {sales.length === 1 ? 'venta' : 'ventas'} — {totalTickets} boletos
                        </p>
                    </div>
                    <Link href={route('tickets.create')} className="btn btn-sm text-slate-900 border-0"
                          style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Vender Boletos
                    </Link>
                </div>

                {!currentRaffle ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
                        <span className="text-5xl mb-4 block">🎟️</span>
                        <h3 className="text-lg font-bold text-slate-700 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            No hay rifas creadas
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">Crea una rifa primero para poder vender boletos</p>
                        <Link href={route('raffles.create')} className="btn btn-sm text-slate-900 border-0"
                              style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                            Crear Rifa
                        </Link>
                    </div>
                ) : sales.length > 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="text-slate-500 font-medium">Numeros</th>
                                        <th className="text-slate-500 font-medium">Comprador</th>
                                        <th className="text-slate-500 font-medium">Contacto</th>
                                        <th className="text-slate-500 font-medium">Vendedor</th>
                                        <th className="text-slate-500 font-medium">Fecha</th>
                                        <th className="text-slate-500 font-medium text-right">Acciones</th>
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
                                                    <span className="text-xs text-slate-400 mt-1 block">
                                                        {sale.numbers.length} boletos
                                                    </span>
                                                )}
                                            </td>
                                            <td className="font-semibold text-slate-800">{sale.buyer_name}</td>
                                            <td className="text-slate-600">
                                                {sale.contact_method === 'whatsapp' ? (
                                                    <span className="flex items-center gap-1 text-sm">
                                                        <span className="text-green-500">📱</span>
                                                        {sale.buyer_phone || '—'}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-sm">
                                                        <span>✉️</span>
                                                        {sale.buyer_email || '—'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-slate-600">{sale.seller_name || '—'}</td>
                                            <td className="text-slate-500 text-sm">
                                                {new Date(sale.created_at).toLocaleDateString('es-ES', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="text-right">
                                                <button onClick={() => handleDelete(sale)}
                                                        className="btn btn-ghost btn-xs text-rose-500 hover:bg-rose-50">
                                                    Eliminar
                                                </button>
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
                            No hay boletos vendidos
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">Empieza a vender boletos para esta rifa</p>
                        <Link href={route('tickets.create')} className="btn btn-sm text-slate-900 border-0"
                              style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                            Vender Boletos
                        </Link>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
