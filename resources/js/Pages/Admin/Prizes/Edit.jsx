import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ prize, raffles }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        raffle_id: prize.raffle_id,
        name: prize.name,
        description: prize.description || '',
        image: null,
        sort_order: prize.sort_order,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('prizes.update', prize.id), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout header="Editar Premio">
            <Head title="Editar Premio" />

            <div className="max-w-2xl">
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 lg:p-8">
                    <form onSubmit={submit} className="space-y-5">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium text-slate-700">Rifa</span>
                            </label>
                            <select
                                className={`select select-bordered w-full ${errors.raffle_id ? 'select-error' : ''}`}
                                value={data.raffle_id}
                                onChange={(e) => setData('raffle_id', e.target.value)}
                            >
                                {raffles.map((raffle) => (
                                    <option key={raffle.id} value={raffle.id}>
                                        {raffle.name} ({raffle.status === 'active' ? 'Activa' : raffle.status === 'draft' ? 'Borrador' : 'Completada'})
                                    </option>
                                ))}
                            </select>
                            {errors.raffle_id && <label className="label"><span className="label-text-alt text-error">{errors.raffle_id}</span></label>}
                        </div>

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium text-slate-700">Nombre del premio</span>
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

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium text-slate-700">Descripcion</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium text-slate-700">Imagen</span>
                                </label>
                                {prize.image && (
                                    <div className="mb-2">
                                        <img src={prize.image} alt={prize.name} className="w-20 h-20 object-cover rounded-lg" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className={`file-input file-input-bordered w-full ${errors.image ? 'file-input-error' : ''}`}
                                    onChange={(e) => setData('image', e.target.files[0])}
                                />
                                <label className="label">
                                    <span className="label-text-alt text-slate-400">Dejar vacio para mantener la imagen actual</span>
                                </label>
                                {errors.image && <label className="label"><span className="label-text-alt text-error">{errors.image}</span></label>}
                            </div>

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium text-slate-700">Orden</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    className={`input input-bordered w-full ${errors.sort_order ? 'input-error' : ''}`}
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', e.target.value)}
                                />
                                {errors.sort_order && <label className="label"><span className="label-text-alt text-error">{errors.sort_order}</span></label>}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                            <button type="submit" disabled={processing}
                                    className="btn text-slate-900 border-0"
                                    style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                                {processing ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                            <Link href={route('prizes.index')} className="btn btn-ghost">
                                Cancelar
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
