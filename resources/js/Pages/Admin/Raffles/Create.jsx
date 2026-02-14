import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        ticket_price: '',
        total_numbers: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('raffles.store'));
    };

    return (
        <AuthenticatedLayout header="Nueva Rifa">
            <Head title="Nueva Rifa" />

            <div className="max-w-2xl">
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 lg:p-8">
                    <form onSubmit={submit} className="space-y-5">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium text-slate-700">Nombre de la rifa</span>
                            </label>
                            <input
                                type="text"
                                className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Ej: Rifa Navidad 2026"
                                autoFocus
                            />
                            {errors.name && <label className="label"><span className="label-text-alt text-error">{errors.name}</span></label>}
                        </div>

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium text-slate-700">Descripcion</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Descripcion opcional..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium text-slate-700">Precio del boleto ($)</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    className={`input input-bordered w-full ${errors.ticket_price ? 'input-error' : ''}`}
                                    value={data.ticket_price}
                                    onChange={(e) => setData('ticket_price', e.target.value)}
                                    placeholder="10.00"
                                />
                                {errors.ticket_price && <label className="label"><span className="label-text-alt text-error">{errors.ticket_price}</span></label>}
                            </div>

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium text-slate-700">Total de numeros</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    className={`input input-bordered w-full ${errors.total_numbers ? 'input-error' : ''}`}
                                    value={data.total_numbers}
                                    onChange={(e) => setData('total_numbers', e.target.value)}
                                    placeholder="1000"
                                />
                                {errors.total_numbers && <label className="label"><span className="label-text-alt text-error">{errors.total_numbers}</span></label>}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                            <button type="submit" disabled={processing}
                                    className="btn text-slate-900 border-0"
                                    style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                                {processing ? 'Guardando...' : 'Crear Rifa'}
                            </button>
                            <Link href={route('raffles.index')} className="btn btn-ghost">
                                Cancelar
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
