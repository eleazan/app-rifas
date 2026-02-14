import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

const statusConfig = {
    draft: { label: 'Borrador', class: 'badge-ghost' },
    active: { label: 'Activa', class: 'badge-success' },
    completed: { label: 'Completada', class: 'badge-info' },
};

export default function Index({ raffles }) {
    const handleDelete = (raffle) => {
        if (confirm(`¿Eliminar la rifa "${raffle.name}"?`)) {
            router.delete(route('raffles.destroy', raffle.id));
        }
    };

    return (
        <AuthenticatedLayout header="Rifas">
            <Head title="Rifas" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <p className="text-slate-500 text-sm">
                        {raffles.length} {raffles.length === 1 ? 'rifa' : 'rifas'} registradas
                    </p>
                    <Link href={route('raffles.create')} className="btn btn-sm text-slate-900 border-0"
                          style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Nueva Rifa
                    </Link>
                </div>

                {/* Table */}
                {raffles.length > 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="text-slate-500 font-medium">Nombre</th>
                                        <th className="text-slate-500 font-medium">Estado</th>
                                        <th className="text-slate-500 font-medium">Precio</th>
                                        <th className="text-slate-500 font-medium">Numeros</th>
                                        <th className="text-slate-500 font-medium">Premios</th>
                                        <th className="text-slate-500 font-medium">Vendidos</th>
                                        <th className="text-slate-500 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {raffles.map((raffle) => {
                                        const status = statusConfig[raffle.status];
                                        return (
                                            <tr key={raffle.id} className="hover:bg-slate-50/50">
                                                <td className="font-semibold text-slate-800">{raffle.name}</td>
                                                <td>
                                                    <span className={`badge badge-sm ${status.class}`}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="text-slate-600">{raffle.ticket_price}€</td>
                                                <td className="text-slate-600">{raffle.total_numbers.toLocaleString()}</td>
                                                <td className="text-slate-600">{raffle.prizes_count}</td>
                                                <td className="text-slate-600">{raffle.tickets_count}</td>
                                                <td className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link href={route('raffles.edit', raffle.id)}
                                                              className="btn btn-ghost btn-xs">
                                                            Editar
                                                        </Link>
                                                        <button onClick={() => handleDelete(raffle)}
                                                                className="btn btn-ghost btn-xs text-rose-500 hover:bg-rose-50">
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
                        <span className="text-5xl mb-4 block">🎟️</span>
                        <h3 className="text-lg font-bold text-slate-700 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            No hay rifas todavia
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">Crea tu primera rifa para empezar</p>
                        <Link href={route('raffles.create')} className="btn btn-sm text-slate-900 border-0"
                              style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                            Crear primera rifa
                        </Link>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
