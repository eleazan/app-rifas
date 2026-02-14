import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        logo: null,
        website: '',
    });
    const [preview, setPreview] = useState(null);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        setData('logo', file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('sponsors.store'));
    };

    return (
        <AuthenticatedLayout header="Nuevo Patrocinador">
            <Head title="Nuevo Patrocinador" />

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
                                placeholder="Ej: Empresa Patrocinadora"
                                autoFocus
                            />
                            {errors.name && <label className="label"><span className="label-text-alt text-error">{errors.name}</span></label>}
                        </div>

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium text-slate-700">Sitio web</span>
                            </label>
                            <input
                                type="url"
                                className={`input input-bordered w-full ${errors.website ? 'input-error' : ''}`}
                                value={data.website}
                                onChange={(e) => setData('website', e.target.value)}
                                placeholder="https://ejemplo.com"
                            />
                            {errors.website && <label className="label"><span className="label-text-alt text-error">{errors.website}</span></label>}
                        </div>

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium text-slate-700">Logo</span>
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                className="file-input file-input-bordered w-full"
                                onChange={handleLogoChange}
                            />
                            {errors.logo && <label className="label"><span className="label-text-alt text-error">{errors.logo}</span></label>}
                            {preview && (
                                <div className="mt-3">
                                    <img src={preview} alt="Preview" className="w-24 h-24 rounded-xl object-cover" />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                            <button type="submit" disabled={processing}
                                    className="btn text-slate-900 border-0"
                                    style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                                {processing ? 'Guardando...' : 'Crear Patrocinador'}
                            </button>
                            <Link href={route('sponsors.index')} className="btn btn-ghost">
                                Cancelar
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
