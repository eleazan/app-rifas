import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useCallback } from 'react';

function ChannelBadge({ channel }) {
    if (channel === 'email') {
        return (
            <span className="badge badge-sm bg-blue-100 text-blue-700 border-0 gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
            </span>
        );
    }
    return (
        <span className="badge badge-sm bg-green-100 text-green-700 border-0 gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            </svg>
            WhatsApp
        </span>
    );
}

function StatusBadge({ status }) {
    if (status === 'sent') {
        return <span className="badge badge-sm bg-emerald-100 text-emerald-700 border-0">Enviado</span>;
    }
    return <span className="badge badge-sm bg-rose-100 text-rose-700 border-0">Fallido</span>;
}

function EditModal({ log, onClose }) {
    const { data, setData, put, processing, errors } = useForm({
        recipient: log?.recipient || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('notification-logs.update', log.id), {
            onSuccess: () => onClose(),
        });
    };

    if (!log) return null;

    return (
        <dialog className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Editar destinatario
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">
                                {log.channel === 'email' ? 'Email' : 'Telefono'}
                            </span>
                        </label>
                        <input
                            type={log.channel === 'email' ? 'email' : 'text'}
                            className={`input input-bordered ${errors.recipient ? 'input-error' : ''}`}
                            value={data.recipient}
                            onChange={(e) => setData('recipient', e.target.value)}
                            placeholder={log.channel === 'email' ? 'correo@ejemplo.com' : '+34612345678'}
                        />
                        {errors.recipient && (
                            <label className="label">
                                <span className="label-text-alt text-error">{errors.recipient}</span>
                            </label>
                        )}
                    </div>
                    <div className="modal-action">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn text-slate-900 border-0"
                                style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}
                                disabled={processing}>
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
}

function HistoryModal({ log, audits, loading, onClose }) {
    if (!log) return null;

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-lg">
                <h3 className="font-bold text-lg mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Historial de cambios
                </h3>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <span className="loading loading-spinner loading-md"></span>
                    </div>
                ) : audits.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">Sin cambios registrados</p>
                ) : (
                    <ul className="timeline timeline-vertical timeline-compact">
                        {audits.map((audit) => (
                            <li key={audit.id}>
                                <div className="timeline-start text-xs text-slate-400">
                                    {new Date(audit.created_at).toLocaleDateString('es-ES', {
                                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                                    })}
                                </div>
                                <div className="timeline-middle">
                                    <svg className={`w-4 h-4 ${audit.action === 'edit' ? 'text-blue-500' : 'text-amber-500'}`}
                                         fill="currentColor" viewBox="0 0 20 20">
                                        <circle cx="10" cy="10" r="5" />
                                    </svg>
                                </div>
                                <div className="timeline-end timeline-box text-sm">
                                    <p className="font-medium text-slate-700">
                                        {audit.action === 'edit' ? 'Editado' : 'Reenviado'} por {audit.user_name}
                                    </p>
                                    {audit.action === 'edit' && (
                                        <p className="text-slate-500 text-xs mt-1">
                                            {audit.field}: <span className="line-through">{audit.old_value}</span> → {audit.new_value}
                                        </p>
                                    )}
                                    {audit.action === 'resend' && (
                                        <p className={`text-xs mt-1 ${audit.resend_status === 'sent' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {audit.resend_status === 'sent' ? 'Enviado correctamente' : `Error: ${audit.resend_error}`}
                                        </p>
                                    )}
                                </div>
                                <hr />
                            </li>
                        ))}
                    </ul>
                )}
                <div className="modal-action">
                    <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
}

export default function Index({ logs, raffles, filters }) {
    const [editLog, setEditLog] = useState(null);
    const [historyLog, setHistoryLog] = useState(null);
    const [audits, setAudits] = useState([]);
    const [loadingAudits, setLoadingAudits] = useState(false);

    const handleFilter = useCallback((key, value) => {
        router.get(route('notification-logs.index'), {
            ...filters,
            [key]: value || undefined,
        }, { preserveState: true, preserveScroll: true });
    }, [filters]);

    const handleResend = (log) => {
        if (!confirm(`¿Reenviar notificacion por ${log.channel === 'email' ? 'email' : 'WhatsApp'} a ${log.recipient}?`)) return;
        router.post(route('notification-logs.resend', log.id));
    };

    const openHistory = async (log) => {
        setHistoryLog(log);
        setLoadingAudits(true);
        try {
            const res = await fetch(route('notification-logs.history', log.id));
            setAudits(await res.json());
        } catch {
            setAudits([]);
        } finally {
            setLoadingAudits(false);
        }
    };

    const paginationData = logs;
    const logItems = paginationData.data || [];

    return (
        <AuthenticatedLayout header="Notificaciones">
            <Head title="Notificaciones" />

            <div className="space-y-6">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        className="select select-bordered select-sm"
                        value={filters.raffle_id || ''}
                        onChange={(e) => handleFilter('raffle_id', e.target.value)}
                    >
                        <option value="">Todas las rifas</option>
                        {raffles.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                    <select
                        className="select select-bordered select-sm"
                        value={filters.channel || ''}
                        onChange={(e) => handleFilter('channel', e.target.value)}
                    >
                        <option value="">Todos los canales</option>
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                    </select>
                    <select
                        className="select select-bordered select-sm"
                        value={filters.status || ''}
                        onChange={(e) => handleFilter('status', e.target.value)}
                    >
                        <option value="">Todos los estados</option>
                        <option value="sent">Enviado</option>
                        <option value="failed">Fallido</option>
                    </select>
                    <p className="text-slate-500 text-sm ml-auto">
                        {paginationData.total} {paginationData.total === 1 ? 'notificacion' : 'notificaciones'}
                    </p>
                </div>

                {/* Table */}
                {logItems.length > 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="text-slate-500 font-medium">Canal</th>
                                        <th className="text-slate-500 font-medium">Destinatario</th>
                                        <th className="text-slate-500 font-medium">Mensaje</th>
                                        <th className="text-slate-500 font-medium">Estado</th>
                                        <th className="text-slate-500 font-medium">Vendedor</th>
                                        <th className="text-slate-500 font-medium">Fecha</th>
                                        <th className="text-slate-500 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logItems.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/50">
                                            <td><ChannelBadge channel={log.channel} /></td>
                                            <td className="text-slate-700 text-sm max-w-[200px] truncate">{log.recipient}</td>
                                            <td className="text-slate-500 text-sm max-w-[250px] truncate" title={log.message}>
                                                {log.message?.substring(0, 60)}{log.message?.length > 60 ? '...' : ''}
                                            </td>
                                            <td><StatusBadge status={log.status} /></td>
                                            <td className="text-slate-600 text-sm">{log.seller?.name || '—'}</td>
                                            <td className="text-slate-500 text-sm">
                                                {new Date(log.created_at).toLocaleDateString('es-ES', {
                                                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => setEditLog(log)}
                                                            className="btn btn-ghost btn-xs text-slate-500 hover:text-slate-700"
                                                            title="Editar destinatario">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button onClick={() => handleResend(log)}
                                                            className="btn btn-ghost btn-xs text-amber-600 hover:text-amber-700"
                                                            title="Reenviar">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                    </button>
                                                    <button onClick={() => openHistory(log)}
                                                            className="btn btn-ghost btn-xs text-slate-400 hover:text-slate-600"
                                                            title="Historial">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {paginationData.last_page > 1 && (
                            <div className="flex justify-center gap-1 p-4 border-t border-slate-100">
                                {paginationData.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url || link.active}
                                        className={`btn btn-sm ${link.active ? 'btn-active' : 'btn-ghost'}`}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
                        <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <h3 className="text-lg font-bold text-slate-700 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            No hay notificaciones
                        </h3>
                        <p className="text-sm text-slate-400">Las notificaciones apareceran aqui cuando se vendan boletos</p>
                    </div>
                )}
            </div>

            {editLog && <EditModal log={editLog} onClose={() => setEditLog(null)} />}
            {historyLog && <HistoryModal log={historyLog} audits={audits} loading={loadingAudits} onClose={() => setHistoryLog(null)} />}
        </AuthenticatedLayout>
    );
}
