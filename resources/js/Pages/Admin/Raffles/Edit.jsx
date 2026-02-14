import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ raffle, organizers, sponsors }) {
    const { data, setData, put, processing, errors } = useForm({
        name: raffle.name,
        description: raffle.description || '',
        ticket_price: raffle.ticket_price,
        total_numbers: raffle.total_numbers,
        status: raffle.status,
        organizer_id: raffle.organizer_id || '',
        sponsors: raffle.sponsors || [],
    });

    const toggleSponsor = (id) => {
        const current = data.sponsors;
        if (current.includes(id)) {
            setData('sponsors', current.filter((s) => s !== id));
        } else {
            setData('sponsors', [...current, id]);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('raffles.update', raffle.id));
    };

    return (
        <AuthenticatedLayout header="Editar Rifa">
            <Head title="Editar Rifa" />

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

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium text-slate-700">Precio (€)</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    className={`input input-bordered w-full ${errors.ticket_price ? 'input-error' : ''}`}
                                    value={data.ticket_price}
                                    onChange={(e) => setData('ticket_price', e.target.value)}
                                />
                                {errors.ticket_price && <label className="label"><span className="label-text-alt text-error">{errors.ticket_price}</span></label>}
                            </div>

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium text-slate-700">Total numeros</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    className={`input input-bordered w-full ${errors.total_numbers ? 'input-error' : ''}`}
                                    value={data.total_numbers}
                                    onChange={(e) => setData('total_numbers', e.target.value)}
                                />
                                {errors.total_numbers && <label className="label"><span className="label-text-alt text-error">{errors.total_numbers}</span></label>}
                            </div>

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium text-slate-700">Estado</span>
                                </label>
                                <select
                                    className={`select select-bordered w-full ${errors.status ? 'select-error' : ''}`}
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                >
                                    <option value="draft">Borrador</option>
                                    <option value="active">Activa</option>
                                    <option value="completed">Completada</option>
                                </select>
                                {errors.status && <label className="label"><span className="label-text-alt text-error">{errors.status}</span></label>}
                            </div>
                        </div>

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium text-slate-700">Organizador</span>
                            </label>
                            <select
                                className={`select select-bordered w-full ${errors.organizer_id ? 'select-error' : ''}`}
                                value={data.organizer_id}
                                onChange={(e) => setData('organizer_id', e.target.value || null)}
                            >
                                <option value="">Sin organizador</option>
                                {organizers.map((org) => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                            </select>
                            {errors.organizer_id && <label className="label"><span className="label-text-alt text-error">{errors.organizer_id}</span></label>}
                        </div>

                        {sponsors.length > 0 && (
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium text-slate-700">Patrocinadores</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {sponsors.map((sponsor) => (
                                        <label key={sponsor.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-sm checkbox-warning"
                                                checked={data.sponsors.includes(sponsor.id)}
                                                onChange={() => toggleSponsor(sponsor.id)}
                                            />
                                            <span className="text-sm text-slate-700">{sponsor.name}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.sponsors && <label className="label"><span className="label-text-alt text-error">{errors.sponsors}</span></label>}
                            </div>
                        )}

                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                            <button type="submit" disabled={processing}
                                    className="btn text-slate-900 border-0"
                                    style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                                {processing ? 'Guardando...' : 'Guardar Cambios'}
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
