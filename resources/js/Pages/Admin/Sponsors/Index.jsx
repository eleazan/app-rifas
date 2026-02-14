import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ sponsors }) {
    const handleDelete = (sponsor) => {
        if (confirm(`¿Eliminar el patrocinador "${sponsor.name}"?`)) {
            router.delete(route('sponsors.destroy', sponsor.id));
        }
    };

    return (
        <AuthenticatedLayout header="Patrocinadores">
            <Head title="Patrocinadores" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <p className="text-slate-500 text-sm">
                        {sponsors.length} {sponsors.length === 1 ? 'patrocinador' : 'patrocinadores'}
                    </p>
                    <Link href={route('sponsors.create')} className="btn btn-sm text-slate-900 border-0"
                          style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Patrocinador
                    </Link>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                    {sponsors.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr className="bg-slate-50/30">
                                        <th className="text-slate-500 font-medium">Logo</th>
                                        <th className="text-slate-500 font-medium">Nombre</th>
                                        <th className="text-slate-500 font-medium">Web</th>
                                        <th className="text-slate-500 font-medium">Rifas</th>
                                        <th className="text-slate-500 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sponsors.map((sponsor) => (
                                        <tr key={sponsor.id} className="hover:bg-slate-50/50">
                                            <td>
                                                {sponsor.logo ? (
                                                    <img src={sponsor.logo} alt={sponsor.name}
                                                         className="w-10 h-10 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="font-medium text-slate-800">{sponsor.name}</td>
                                            <td>
                                                {sponsor.website ? (
                                                    <a href={sponsor.website} target="_blank" rel="noopener noreferrer"
                                                       className="text-amber-600 hover:text-amber-700 text-sm underline">
                                                        {sponsor.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="badge badge-ghost badge-sm">{sponsor.raffles_count}</span>
                                            </td>
                                            <td className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={route('sponsors.edit', sponsor.id)}
                                                          className="btn btn-ghost btn-xs">
                                                        Editar
                                                    </Link>
                                                    <button onClick={() => handleDelete(sponsor)}
                                                            className="btn btn-ghost btn-xs text-rose-500 hover:text-rose-700">
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
                        <div className="text-center py-12">
                            <p className="text-slate-400">No hay patrocinadores registrados.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
