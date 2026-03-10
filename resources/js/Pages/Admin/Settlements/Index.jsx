import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

const currency = (amount) =>
    Number(amount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

function StatCard({ label, value, highlight }) {
    return (
        <div className={`bg-white rounded-2xl border p-5 flex flex-col gap-1 ${highlight ? 'border-amber-300' : 'border-slate-200/60'}`}>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-extrabold ${highlight ? 'text-amber-500' : 'text-slate-800'}`}
               style={{ fontFamily: "'Outfit', sans-serif" }}>
                {value}
            </p>
        </div>
    );
}

function SettlementModal({ modalRef, sellerName, sellerId, raffleId, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        seller_id: sellerId,
        raffle_id: raffleId,
        amount: '',
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('settlements.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('amount', 'notes');
                onClose();
            },
        });
    };

    return (
        <dialog ref={modalRef} className="modal">
            <div className="modal-box rounded-2xl max-w-md">
                <h3 className="font-bold text-lg text-slate-800 mb-1"
                    style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Registrar entrega
                </h3>
                <p className="text-sm text-slate-500 mb-5">
                    Vendedor: <span className="font-semibold text-slate-700">{sellerName}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="hidden" name="seller_id" value={sellerId} />
                    <input type="hidden" name="raffle_id" value={raffleId} />

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-slate-700">Importe entregado (€)</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            placeholder="0.00"
                            className={`input input-bordered w-full ${errors.amount ? 'input-error' : ''}`}
                            required
                        />
                        {errors.amount && (
                            <label className="label">
                                <span className="label-text-alt text-error">{errors.amount}</span>
                            </label>
                        )}
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-slate-700">Notas (opcional)</span>
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Observaciones sobre la entrega..."
                            rows={3}
                            className={`textarea textarea-bordered w-full resize-none ${errors.notes ? 'textarea-error' : ''}`}
                        />
                        {errors.notes && (
                            <label className="label">
                                <span className="label-text-alt text-error">{errors.notes}</span>
                            </label>
                        )}
                    </div>

                    <div className="modal-action mt-2">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={onClose}
                            disabled={processing}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn text-slate-900 border-0"
                            style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}
                        >
                            {processing ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                'Registrar entrega'
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>cerrar</button>
            </form>
        </dialog>
    );
}

function SellerRow({ seller, raffleId, onRegister }) {
    const [expanded, setExpanded] = useState(false);
    const isPending = seller.pending > 0;

    const handleDelete = (settlementId) => {
        if (!confirm('¿Eliminar esta entrega?')) return;
        router.delete(route('settlements.destroy', settlementId), { preserveScroll: true });
    };

    return (
        <>
            <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{seller.name}</p>
                    {seller.commission_pct > 0 && (
                        <p className="text-xs text-slate-400">{seller.commission_pct}% comision</p>
                    )}
                </td>
                <td className="px-4 py-3 text-slate-700 font-medium">
                    {currency(seller.total_sold)}
                </td>
                <td className="px-4 py-3 text-emerald-700 font-medium">
                    {currency(seller.total_settled)}
                </td>
                <td className={`px-4 py-3 font-bold ${isPending ? 'text-amber-600' : 'text-slate-400'}`}>
                    {currency(seller.pending)}
                </td>
                <td className="px-4 py-3">
                    {isPending ? (
                        <span className="badge badge-warning badge-sm font-medium">Pendiente</span>
                    ) : (
                        <span className="badge badge-success badge-sm font-medium">Al dia</span>
                    )}
                </td>
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => onRegister(seller)}
                            className="btn btn-xs text-slate-900 border-0"
                            style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Registrar entrega
                        </button>
                        {seller.settlements.length > 0 && (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="btn btn-xs btn-ghost text-slate-500"
                            >
                                {expanded ? 'Ocultar' : `Ver entregas (${seller.settlements.length})`}
                            </button>
                        )}
                    </div>
                </td>
            </tr>

            {expanded && seller.settlements.length > 0 && (
                <tr>
                    <td colSpan={6} className="px-4 pb-3 pt-0 bg-slate-50">
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-100 text-slate-500 text-xs uppercase tracking-wide">
                                        <th className="px-4 py-2 text-left font-medium">Fecha</th>
                                        <th className="px-4 py-2 text-left font-medium">Importe</th>
                                        <th className="px-4 py-2 text-left font-medium">Notas</th>
                                        <th className="px-4 py-2 text-left font-medium">Registrado por</th>
                                        <th className="px-4 py-2" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {seller.settlements.map((s) => (
                                        <tr key={s.id} className="bg-white hover:bg-slate-50">
                                            <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{s.created_at}</td>
                                            <td className="px-4 py-2.5 font-semibold text-emerald-700 whitespace-nowrap">{currency(s.amount)}</td>
                                            <td className="px-4 py-2.5 text-slate-500 max-w-xs truncate">{s.notes || '—'}</td>
                                            <td className="px-4 py-2.5 text-slate-500">{s.recorded_by || '—'}</td>
                                            <td className="px-4 py-2.5 text-right">
                                                <button
                                                    onClick={() => handleDelete(s.id)}
                                                    className="btn btn-xs btn-ghost text-rose-500 hover:bg-rose-50"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

export default function Index({ raffles, selected_raffle_id, sellers }) {
    const { flash } = usePage().props;
    const modalRef = useRef(null);
    const [activeSeller, setActiveSeller] = useState(null);

    const totalSold = sellers.reduce((sum, s) => sum + s.total_sold, 0);
    const totalSettled = sellers.reduce((sum, s) => sum + s.total_settled, 0);
    const totalPending = sellers.reduce((sum, s) => sum + s.pending, 0);

    const handleRaffleChange = (e) => {
        router.get(route('settlements.index'), { raffle_id: e.target.value }, { preserveState: true });
    };

    const openModal = (seller) => {
        setActiveSeller(seller);
        modalRef.current?.showModal();
    };

    const closeModal = () => {
        modalRef.current?.close();
        setActiveSeller(null);
    };

    return (
        <AuthenticatedLayout header="Liquidaciones">
            <Head title="Liquidaciones" />

            {activeSeller && (
                <SettlementModal
                    modalRef={modalRef}
                    sellerName={activeSeller.name}
                    sellerId={activeSeller.id}
                    raffleId={selected_raffle_id}
                    onClose={closeModal}
                />
            )}

            <div className="space-y-6">
                {/* Flash messages */}
                {flash.success && (
                    <div className="alert alert-success text-sm">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {flash.success}
                    </div>
                )}

                {/* Raffle filter */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                    <div className="flex flex-wrap items-center gap-4">
                        <div>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Rifa</p>
                            <select
                                value={selected_raffle_id ?? ''}
                                onChange={handleRaffleChange}
                                className="select select-bordered min-w-64"
                            >
                                <option value="" disabled>Selecciona una rifa</option>
                                {raffles.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.name} {r.status === 'active' ? '(activa)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Summary stats */}
                {selected_raffle_id && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatCard label="Total vendido" value={currency(totalSold)} />
                        <StatCard label="Total entregado" value={currency(totalSettled)} />
                        <StatCard label="Total pendiente" value={currency(totalPending)} highlight={totalPending > 0} />
                    </div>
                )}

                {/* Sellers table */}
                {selected_raffle_id ? (
                    sellers.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
                            <svg className="w-12 h-12 text-slate-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <h3 className="text-lg font-bold text-slate-700 mb-1"
                                style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Sin vendedores
                            </h3>
                            <p className="text-sm text-slate-400">No hay vendedores con boletos vendidos en esta rifa.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                Vendedor
                                            </th>
                                            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                Total vendido
                                            </th>
                                            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                Entregado
                                            </th>
                                            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                Pendiente
                                            </th>
                                            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                Estado
                                            </th>
                                            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {sellers.map((seller) => (
                                            <SellerRow
                                                key={seller.id}
                                                seller={seller}
                                                raffleId={selected_raffle_id}
                                                onRegister={openModal}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
                        <svg className="w-12 h-12 text-slate-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        <h3 className="text-lg font-bold text-slate-700 mb-1"
                            style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Selecciona una rifa
                        </h3>
                        <p className="text-sm text-slate-400">Elige una rifa para ver el estado de las liquidaciones.</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
