import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function SellPaella({ raffle, stock, seller }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        raffle_id:   raffle?.id ?? '',
        buyer_name:  '',
        buyer_phone: '',
        type:        'valenciana',
        quantity:    1,
    });

    if (!raffle) {
        return (
            <AuthenticatedLayout header="Vender Paella">
                <Head title="Vender Paella" />
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
                    <span className="text-5xl mb-4 block">🥘</span>
                    <h3 className="text-lg font-bold text-slate-700 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Paella no disponible
                    </h3>
                    <p className="text-sm text-slate-400">No hay rifa activa con paella configurada.</p>
                </div>
            </AuthenticatedLayout>
        );
    }

    const isPastDeadline = raffle.deadline && new Date() > new Date(raffle.deadline + 'T23:59:59');
    const noStock = stock.remaining <= 0;
    const blocked = isPastDeadline || noStock;

    const total = data.quantity * parseFloat(raffle.price);

    const submit = (e) => {
        e.preventDefault();
        post(route('paella.store'), { onSuccess: () => reset('buyer_name', 'buyer_phone', 'quantity') });
    };

    const formatDate = (d) => {
        if (!d) return null;
        return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <AuthenticatedLayout header="Vender Paella">
            <Head title="Vender Paella" />

            <div className="max-w-2xl space-y-5">
                {/* Stock card */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                    <div className="flex flex-wrap gap-6">
                        <div>
                            <p className="text-xs text-slate-400">Rifa</p>
                            <p className="font-bold text-slate-800" style={{ fontFamily: "'Outfit', sans-serif" }}>{raffle.name}</p>
                        </div>
                        <div className="border-l border-slate-200 pl-4">
                            <p className="text-xs text-slate-400">Precio / ticket</p>
                            <p className="font-bold text-slate-800">{raffle.price}€</p>
                        </div>
                        <div className="border-l border-slate-200 pl-4">
                            <p className="text-xs text-slate-400">Disponibles</p>
                            <p className={`font-bold text-lg ${stock.remaining === 0 ? 'text-error' : stock.remaining <= 10 ? 'text-warning' : 'text-success'}`}
                               style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {stock.remaining} <span className="text-sm font-normal text-slate-400">/ {stock.total}</span>
                            </p>
                        </div>
                        {raffle.deadline && (
                            <div className="border-l border-slate-200 pl-4">
                                <p className="text-xs text-slate-400">Fecha límite</p>
                                <p className={`font-bold text-sm ${isPastDeadline ? 'text-error' : 'text-slate-800'}`}>
                                    {formatDate(raffle.deadline)}
                                </p>
                            </div>
                        )}
                    </div>
                    {/* Breakdown por tipo */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex gap-4 text-sm text-slate-500">
                        <span>Valenciana vendida: <strong className="text-slate-700">{stock.sold_valenciana}</strong></span>
                        <span>Vegana vendida: <strong className="text-slate-700">{stock.sold_vegana}</strong></span>
                    </div>
                </div>

                {isPastDeadline && (
                    <div className="alert alert-error">
                        <span>La fecha límite de venta de paella ha pasado.</span>
                    </div>
                )}

                {noStock && !isPastDeadline && (
                    <div className="alert alert-warning">
                        <span>No quedan tickets de paella disponibles.</span>
                    </div>
                )}

                {!blocked && (
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                        <form onSubmit={submit} className="space-y-5">
                            {/* Tipo */}
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium text-slate-700">Tipo de paella</span>
                                </label>
                                <div className="flex gap-3">
                                    {['valenciana', 'vegana'].map((t) => (
                                        <label key={t}
                                               className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                                   data.type === t ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-slate-300'
                                               }`}>
                                            <input type="radio" className="radio radio-warning radio-sm"
                                                   checked={data.type === t}
                                                   onChange={() => setData('type', t)} />
                                            <span className="font-medium text-slate-700 capitalize">{t}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.type && <label className="label"><span className="label-text-alt text-error">{errors.type}</span></label>}
                            </div>

                            {/* Cantidad */}
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium text-slate-700">Cantidad</span>
                                </label>
                                <input type="number" min="1" max={stock.remaining}
                                       className={`input input-bordered w-full ${errors.quantity ? 'input-error' : ''}`}
                                       value={data.quantity}
                                       onChange={(e) => setData('quantity', parseInt(e.target.value) || 1)} />
                                {errors.quantity && <label className="label"><span className="label-text-alt text-error">{errors.quantity}</span></label>}
                            </div>

                            {/* Nombre */}
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium text-slate-700">Nombre del comprador</span>
                                </label>
                                <input type="text"
                                       className={`input input-bordered w-full ${errors.buyer_name ? 'input-error' : ''}`}
                                       value={data.buyer_name}
                                       onChange={(e) => setData('buyer_name', e.target.value)}
                                       placeholder="Ej: García" />
                                {errors.buyer_name && <label className="label"><span className="label-text-alt text-error">{errors.buyer_name}</span></label>}
                            </div>

                            {/* Teléfono */}
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium text-slate-700">WhatsApp</span>
                                </label>
                                <input type="text"
                                       className={`input input-bordered w-full ${errors.buyer_phone ? 'input-error' : ''}`}
                                       value={data.buyer_phone}
                                       onChange={(e) => setData('buyer_phone', e.target.value)}
                                       placeholder="34612345678" />
                                {errors.buyer_phone && <label className="label"><span className="label-text-alt text-error">{errors.buyer_phone}</span></label>}
                            </div>

                            <button type="submit" disabled={processing}
                                    className="btn w-full text-slate-900 border-0"
                                    style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                                {processing
                                    ? 'Registrando...'
                                    : `Vender ${data.quantity} ticket${data.quantity !== 1 ? 's' : ''} — ${total.toFixed(2)}€`}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
