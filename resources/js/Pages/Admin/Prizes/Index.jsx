import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ raffles }) {
    const handleDelete = (prize) => {
        if (confirm(`¿Eliminar el premio "${prize.name}"?`)) {
            router.delete(route('prizes.destroy', prize.id));
        }
    };

    const totalPrizes = raffles.reduce((sum, r) => sum + r.prizes.length, 0);

    return (
        <AuthenticatedLayout header="Premios">
            <Head title="Premios" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <p className="text-slate-500 text-sm">
                        {totalPrizes} {totalPrizes === 1 ? 'premio' : 'premios'} en {raffles.length} {raffles.length === 1 ? 'rifa' : 'rifas'}
                    </p>
                    <Link href={route('prizes.create')} className="btn btn-sm text-slate-900 border-0"
                          style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Premio
                    </Link>
                </div>

                {raffles.length > 0 ? (
                    <div className="space-y-6">
                        {raffles.map((raffle) => (
                            <div key={raffle.id} className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                                <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                                    <h3 className="font-semibold text-slate-800">{raffle.name}</h3>
                                    <span className={`badge badge-sm ${
                                        raffle.status === 'active' ? 'badge-success' :
                                        raffle.status === 'draft' ? 'badge-ghost' : 'badge-info'
                                    }`}>
                                        {raffle.status === 'active' ? 'Activa' : raffle.status === 'draft' ? 'Borrador' : 'Completada'}
                                    </span>
                                </div>

                                {raffle.prizes.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="table">
                                            <thead>
                                                <tr className="bg-slate-50/30">
                                                    <th className="text-slate-500 font-medium w-16">Orden</th>
                                                    <th className="text-slate-500 font-medium">Premio</th>
                                                    <th className="text-slate-500 font-medium">Estado</th>
                                                    <th className="text-slate-500 font-medium text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {raffle.prizes.map((prize) => (
                                                    <tr key={prize.id} className="hover:bg-slate-50/50">
                                                        <td className="text-slate-500 text-center">{prize.sort_order}</td>
                                                        <td>
                                                            <div className="flex items-center gap-3">
                                                                {prize.image ? (
                                                                    <div className="avatar">
                                                                        <div className="w-10 h-10 rounded-lg">
                                                                            <img src={prize.image} alt={prize.name} />
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                                                        <span className="text-lg">🎁</span>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="font-semibold text-slate-800">{prize.name}</p>
                                                                    {prize.description && (
                                                                        <p className="text-xs text-slate-400 line-clamp-1">{prize.description}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {prize.is_drawn ? (
                                                                <span className="badge badge-sm badge-success">
                                                                    Sorteado #{prize.winning_number}
                                                                </span>
                                                            ) : (
                                                                <span className="badge badge-sm badge-ghost">Pendiente</span>
                                                            )}
                                                        </td>
                                                        <td className="text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Link href={route('prizes.edit', prize.id)} className="btn btn-ghost btn-xs">
                                                                    Editar
                                                                </Link>
                                                                <button onClick={() => handleDelete(prize)}
                                                                        className="btn btn-ghost btn-xs text-rose-500 hover:bg-rose-50">
                                                                    Eliminar
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-sm text-slate-400">Sin premios todavia</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
                        <span className="text-5xl mb-4 block">🎁</span>
                        <h3 className="text-lg font-bold text-slate-700 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            No hay premios todavia
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">Primero crea una rifa y luego agrega premios</p>
                        <Link href={route('prizes.create')} className="btn btn-sm text-slate-900 border-0"
                              style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                            Agregar primer premio
                        </Link>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
