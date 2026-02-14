import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ seller }) {
    const { data, setData, put, processing, errors } = useForm({
        name: seller.name,
        email: seller.user?.email || '',
        password: '',
        phone: seller.phone || '',
        commission_pct: seller.commission_pct,
        is_active: seller.is_active,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('sellers.update', seller.id));
    };

    return (
        <AuthenticatedLayout header="Editar Vendedor">
            <Head title="Editar Vendedor" />

            <div className="max-w-2xl">
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 lg:p-8">
                    <form onSubmit={submit} className="space-y-5">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium text-slate-700">Nombre</span>
                            </label>
                            <input
                                type="text"
                                className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                autoFocus
                            />
                            {errors.name && <label className="label"><span className="label-text-alt text-error">{errors.name}</span></label>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium text-slate-700">Email</span>
                                </label>
                                <input
                                    type="email"
                                    className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && <label className="label"><span className="label-text-alt text-error">{errors.email}</span></label>}
                            </div>

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium text-slate-700">Contrasena</span>
                                </label>
                                <input
                                    type="password"
                                    className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Dejar vacio para no cambiar"
                                />
                                {errors.password && <label className="label"><span className="label-text-alt text-error">{errors.password}</span></label>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium text-slate-700">Telefono</span>
                                </label>
                                <input
                                    type="text"
                                    className={`input input-bordered w-full ${errors.phone ? 'input-error' : ''}`}
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="Opcional"
                                />
                                {errors.phone && <label className="label"><span className="label-text-alt text-error">{errors.phone}</span></label>}
                            </div>

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium text-slate-700">Comision (%)</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    className={`input input-bordered w-full ${errors.commission_pct ? 'input-error' : ''}`}
                                    value={data.commission_pct}
                                    onChange={(e) => setData('commission_pct', e.target.value)}
                                />
                                {errors.commission_pct && <label className="label"><span className="label-text-alt text-error">{errors.commission_pct}</span></label>}
                            </div>

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium text-slate-700">Estado</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={data.is_active ? '1' : '0'}
                                    onChange={(e) => setData('is_active', e.target.value === '1')}
                                >
                                    <option value="1">Activo</option>
                                    <option value="0">Inactivo</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                            <button type="submit" disabled={processing}
                                    className="btn text-slate-900 border-0"
                                    style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                                {processing ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                            <Link href={route('sellers.index')} className="btn btn-ghost">
                                Cancelar
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
