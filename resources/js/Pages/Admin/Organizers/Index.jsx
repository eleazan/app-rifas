import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ organizers }) {
    const handleDelete = (organizer) => {
        if (confirm(`¿Eliminar el organizador "${organizer.name}"?`)) {
            router.delete(route('organizers.destroy', organizer.id));
        }
    };

    return (
        <AuthenticatedLayout header="Organizadores">
            <Head title="Organizadores" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <p className="text-slate-500 text-sm">
                        {organizers.length} {organizers.length === 1 ? 'organizador' : 'organizadores'}
                    </p>
                    <Link href={route('organizers.create')} className="btn btn-sm text-slate-900 border-0"
                          style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Organizador
                    </Link>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                    {organizers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr className="bg-slate-50/30">
                                        <th className="text-slate-500 font-medium">Logo</th>
                                        <th className="text-slate-500 font-medium">Nombre</th>
                                        <th className="text-slate-500 font-medium">Rifas</th>
                                        <th className="text-slate-500 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {organizers.map((organizer) => (
                                        <tr key={organizer.id} className="hover:bg-slate-50/50">
                                            <td>
                                                {organizer.logo ? (
                                                    <img src={organizer.logo} alt={organizer.name}
                                                         className="w-10 h-10 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="font-medium text-slate-800">{organizer.name}</td>
                                            <td>
                                                <span className="badge badge-ghost badge-sm">{organizer.raffles_count}</span>
                                            </td>
                                            <td className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={route('organizers.edit', organizer.id)}
                                                          className="btn btn-ghost btn-xs">
                                                        Editar
                                                    </Link>
                                                    <button onClick={() => handleDelete(organizer)}
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
                            <p className="text-slate-400">No hay organizadores registrados.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
