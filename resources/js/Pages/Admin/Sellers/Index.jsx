import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ sellers }) {
    const handleDelete = (seller) => {
        if (confirm(`¿Eliminar al vendedor "${seller.name}"?`)) {
            router.delete(route('sellers.destroy', seller.id));
        }
    };

    return (
        <AuthenticatedLayout header="Vendedores">
            <Head title="Vendedores" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <p className="text-slate-500 text-sm">
                        {sellers.length} {sellers.length === 1 ? 'vendedor' : 'vendedores'}
                    </p>
                    <Link href={route('sellers.create')} className="btn btn-sm text-slate-900 border-0"
                          style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Vendedor
                    </Link>
                </div>

                {sellers.length > 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="text-slate-500 font-medium">Nombre</th>
                                        <th className="text-slate-500 font-medium">Email</th>
                                        <th className="text-slate-500 font-medium">Telefono</th>
                                        <th className="text-slate-500 font-medium">Comision</th>
                                        <th className="text-slate-500 font-medium">Ventas</th>
                                        <th className="text-slate-500 font-medium">Estado</th>
                                        <th className="text-slate-500 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sellers.map((seller) => (
                                        <tr key={seller.id} className="hover:bg-slate-50/50">
                                            <td className="font-semibold text-slate-800">{seller.name}</td>
                                            <td className="text-slate-600">{seller.user?.email}</td>
                                            <td className="text-slate-600">{seller.phone || '—'}</td>
                                            <td className="text-slate-600">{seller.commission_pct}%</td>
                                            <td className="text-slate-600">{seller.tickets_count}</td>
                                            <td>
                                                <span className={`badge badge-sm ${seller.is_active ? 'badge-success' : 'badge-ghost'}`}>
                                                    {seller.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={route('sellers.edit', seller.id)} className="btn btn-ghost btn-xs">
                                                        Editar
                                                    </Link>
                                                    <button onClick={() => handleDelete(seller)}
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
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
                        <span className="text-5xl mb-4 block">👥</span>
                        <h3 className="text-lg font-bold text-slate-700 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            No hay vendedores todavia
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">Agrega vendedores para que puedan vender boletos</p>
                        <Link href={route('sellers.create')} className="btn btn-sm text-slate-900 border-0"
                              style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                            Agregar primer vendedor
                        </Link>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
