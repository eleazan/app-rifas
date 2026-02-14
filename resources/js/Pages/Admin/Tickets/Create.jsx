import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import NumberGrid from '@/Components/NumberGrid';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

export default function Create({ raffle, soldNumbers, lockedNumbers: initialLocked = [], sellers }) {
    const { data, setData, post, processing, errors } = useForm({
        raffle_id: raffle.id,
        seller_id: sellers.length > 0 ? sellers[0].id : '',
        numbers: [],
        buyer_name: '',
        buyer_email: '',
        buyer_phone: '',
        contact_method: 'whatsapp',
    });

    const [lockedNumbers, setLockedNumbers] = useState(initialLocked);
    const syncTimer = useRef(null);
    const numbersRef = useRef(data.numbers);
    numbersRef.current = data.numbers;

    // Sync locks with backend (debounced)
    const syncLocks = useCallback((numbers) => {
        clearTimeout(syncTimer.current);
        syncTimer.current = setTimeout(() => {
            axios.post(route('ticket-locks.sync'), {
                raffle_id: raffle.id,
                numbers,
            }).then(({ data: res }) => {
                setLockedNumbers(res.locked_by_others);
            }).catch(() => {});
        }, 300);
    }, [raffle.id]);

    // Sync when numbers change
    useEffect(() => {
        if (data.numbers.length > 0) {
            syncLocks(data.numbers);
        }
    }, [data.numbers, syncLocks]);

    // Periodic refresh of locks from others (every 30s)
    useEffect(() => {
        const interval = setInterval(() => {
            axios.post(route('ticket-locks.sync'), {
                raffle_id: raffle.id,
                numbers: numbersRef.current,
            }).then(({ data: res }) => {
                setLockedNumbers(res.locked_by_others);
            }).catch(() => {});
        }, 30000);

        return () => clearInterval(interval);
    }, [raffle.id]);

    // Release locks on page leave
    useEffect(() => {
        const release = () => {
            navigator.sendBeacon?.(
                route('ticket-locks.release'),
                new Blob([JSON.stringify({ raffle_id: raffle.id })], { type: 'application/json' })
            );
        };

        window.addEventListener('beforeunload', release);
        return () => {
            window.removeEventListener('beforeunload', release);
            // Also release on component unmount (Inertia navigation)
            axios.post(route('ticket-locks.release'), { raffle_id: raffle.id }).catch(() => {});
        };
    }, [raffle.id]);

    const toggleNumber = (number) => {
        const current = [...data.numbers];
        const idx = current.indexOf(number);
        if (idx >= 0) {
            current.splice(idx, 1);
        } else {
            current.push(number);
        }
        setData('numbers', current);
    };

    const clearSelection = () => {
        setData('numbers', []);
        // Release all locks immediately
        axios.post(route('ticket-locks.release'), { raffle_id: raffle.id }).catch(() => {});
    };

    const total = data.numbers.length * parseFloat(raffle.ticket_price);

    const submit = (e) => {
        e.preventDefault();
        post(route('tickets.store'));
    };

    return (
        <AuthenticatedLayout header="Vender Boletos">
            <Head title="Vender Boletos" />

            <div className="space-y-6">
                {/* Raffle info bar */}
                <div className="flex flex-wrap items-center gap-4 bg-white rounded-2xl border border-slate-200/60 p-4">
                    <div>
                        <p className="text-xs text-slate-400">Rifa activa</p>
                        <p className="font-bold text-slate-800" style={{ fontFamily: "'Outfit', sans-serif" }}>{raffle.name}</p>
                    </div>
                    <div className="border-l border-slate-200 pl-4">
                        <p className="text-xs text-slate-400">Precio</p>
                        <p className="font-bold text-slate-800">{raffle.ticket_price}€</p>
                    </div>
                    <div className="border-l border-slate-200 pl-4">
                        <p className="text-xs text-slate-400">Numeros</p>
                        <p className="font-bold text-slate-800">{raffle.total_numbers}</p>
                    </div>
                    {data.numbers.length > 0 && (
                        <div className="ml-auto flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-xs text-slate-400">{data.numbers.length} seleccionado{data.numbers.length > 1 ? 's' : ''}</p>
                                <p className="font-bold text-lg" style={{ color: '#f59e0b', fontFamily: "'Outfit', sans-serif" }}>
                                    ${total.toFixed(2)}
                                </p>
                            </div>
                            <button type="button" onClick={clearSelection}
                                    className="btn btn-ghost btn-xs text-rose-500">
                                Limpiar
                            </button>
                        </div>
                    )}
                </div>

                <form onSubmit={submit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Number grid - 2 cols */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                                <h3 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Selecciona numeros
                                </h3>
                                <NumberGrid
                                    totalNumbers={raffle.total_numbers}
                                    soldNumbers={soldNumbers}
                                    lockedNumbers={lockedNumbers}
                                    selectedNumbers={data.numbers}
                                    onToggle={toggleNumber}
                                />
                                {errors.numbers && (
                                    <p className="text-error text-sm mt-2">{errors.numbers}</p>
                                )}
                            </div>
                        </div>

                        {/* Buyer form - 1 col */}
                        <div className="space-y-5">
                            <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                                <h3 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Datos del comprador
                                </h3>

                                <div className="space-y-4">
                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text font-medium text-slate-700">Vendedor</span>
                                        </label>
                                        <select
                                            className={`select select-bordered w-full ${errors.seller_id ? 'select-error' : ''}`}
                                            value={data.seller_id}
                                            onChange={(e) => setData('seller_id', e.target.value)}
                                        >
                                            {sellers.map((seller) => (
                                                <option key={seller.id} value={seller.id}>{seller.name}</option>
                                            ))}
                                        </select>
                                        {errors.seller_id && <label className="label"><span className="label-text-alt text-error">{errors.seller_id}</span></label>}
                                    </div>

                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text font-medium text-slate-700">Nombre del comprador</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`input input-bordered w-full ${errors.buyer_name ? 'input-error' : ''}`}
                                            value={data.buyer_name}
                                            onChange={(e) => setData('buyer_name', e.target.value)}
                                        />
                                        {errors.buyer_name && <label className="label"><span className="label-text-alt text-error">{errors.buyer_name}</span></label>}
                                    </div>

                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text font-medium text-slate-700">WhatsApp</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`input input-bordered w-full ${errors.buyer_phone ? 'input-error' : ''}`}
                                            value={data.buyer_phone}
                                            onChange={(e) => setData(d => ({ ...d, buyer_phone: e.target.value, contact_method: e.target.value ? 'whatsapp' : (d.buyer_email ? 'email' : 'whatsapp') }))}
                                            placeholder="Ej: 34612345678"
                                        />
                                        {errors.buyer_phone && <label className="label"><span className="label-text-alt text-error">{errors.buyer_phone}</span></label>}
                                    </div>

                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text font-medium text-slate-700">Email</span>
                                        </label>
                                        <input
                                            type="email"
                                            className={`input input-bordered w-full ${errors.buyer_email ? 'input-error' : ''}`}
                                            value={data.buyer_email}
                                            onChange={(e) => setData(d => ({ ...d, buyer_email: e.target.value, contact_method: e.target.value ? 'email' : (d.buyer_phone ? 'whatsapp' : 'whatsapp') }))}
                                            placeholder="correo@ejemplo.com"
                                        />
                                        {errors.buyer_email && <label className="label"><span className="label-text-alt text-error">{errors.buyer_email}</span></label>}
                                    </div>

                                    <p className="text-xs text-slate-400">Al menos uno es obligatorio</p>
                                </div>
                            </div>

                            {/* Selected numbers summary */}
                            {data.numbers.length > 0 && (
                                <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                                    <h4 className="text-sm font-medium text-slate-500 mb-2">Numeros seleccionados</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {data.numbers.sort((a, b) => a - b).map((n) => (
                                            <span key={n}
                                                  className="inline-flex items-center gap-1 text-xs font-mono font-medium px-2 py-1 rounded-md text-slate-900"
                                                  style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                                                {String(n).padStart(String(raffle.total_numbers - 1).length, '0')}
                                                <button type="button" onClick={() => toggleNumber(n)}
                                                        className="hover:text-rose-700 ml-0.5">×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button type="submit" disabled={processing || data.numbers.length === 0}
                                    className="btn w-full text-slate-900 border-0"
                                    style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                                {processing ? 'Registrando...' : `Vender ${data.numbers.length} boleto${data.numbers.length !== 1 ? 's' : ''} — {total.toFixed(2)}€`}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
