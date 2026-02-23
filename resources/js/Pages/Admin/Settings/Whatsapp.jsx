import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const POLL_INTERVAL = 3000;

function normalizeQR(qr) {
    if (!qr) return null;
    if (qr.startsWith('data:image')) return qr;
    return `data:image/png;base64,${qr}`;
}

export default function Whatsapp({ instanceName, connected }) {
    const [phase, setPhase] = useState(connected ? 'connected' : (instanceName ? 'qr' : 'idle'));
    const [qr, setQr] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [testPhone, setTestPhone] = useState('');
    const [testMessage, setTestMessage] = useState('Hola! Este es un mensaje de prueba de RifaApp.');
    const [testResult, setTestResult] = useState(null);

    const pollRef = useRef(null);

    useEffect(() => {
        if (phase === 'qr') {
            pollRef.current = setInterval(pollStatus, POLL_INTERVAL);
        }
        return () => clearInterval(pollRef.current);
    }, [phase]);

    async function pollStatus() {
        try {
            const res = await window.axios.get(route('settings.whatsapp.status'));
            const data = res.data;

            if (data.connected) {
                clearInterval(pollRef.current);
                setPhase('connected');
                setQr(null);
            } else if (data.qr) {
                setQr(normalizeQR(data.qr));
            }
        } catch {
            // Silent — keep polling
        }
    }

    async function handleActivate() {
        setLoading(true);
        setError(null);
        try {
            const res = await window.axios.post(route('settings.whatsapp.activate'));
            const data = res.data;
            setQr(normalizeQR(data.qr));
            setPhase('qr');
        } catch (e) {
            setError('No se pudo activar WhatsApp. Verifica la configuración de Evolution API.');
        } finally {
            setLoading(false);
        }
    }

    async function handleDeactivate() {
        setLoading(true);
        setError(null);
        try {
            await window.axios.post(route('settings.whatsapp.deactivate'));
            clearInterval(pollRef.current);
            setPhase('idle');
            setQr(null);
        } catch {
            setError('Error al desactivar. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    }

    async function handleTest(e) {
        e.preventDefault();
        setTestResult(null);
        setLoading(true);
        try {
            await window.axios.post(route('settings.whatsapp.test'), {
                phone: testPhone,
                message: testMessage,
            });
            setTestResult({ ok: true, msg: 'Mensaje enviado correctamente.' });
        } catch (e) {
            const msg = e.response?.data?.message ?? 'No se pudo enviar el mensaje.';
            setTestResult({ ok: false, msg });
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthenticatedLayout header="WhatsApp">
            <div className="max-w-xl mx-auto">
                <div className="card bg-base-100 shadow-sm border border-base-200">
                    <div className="card-body gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <svg className="w-7 h-7 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-base-content">Configuración WhatsApp</h2>
                                <p className="text-sm text-base-content/60">Conecta tu instancia de Evolution API</p>
                            </div>
                        </div>

                        {error && (
                            <div className="alert alert-error text-sm">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* IDLE */}
                        {phase === 'idle' && (
                            <div className="flex flex-col items-center gap-4 py-6">
                                <p className="text-base-content/60 text-sm text-center">
                                    WhatsApp no está activado. Haz clic para crear la instancia y obtener el código QR.
                                </p>
                                <button
                                    className="btn btn-success btn-lg gap-2"
                                    onClick={handleActivate}
                                    disabled={loading}
                                >
                                    {loading && <span className="loading loading-spinner loading-sm" />}
                                    Activar WhatsApp
                                </button>
                            </div>
                        )}

                        {/* QR PHASE */}
                        {phase === 'qr' && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="badge badge-warning gap-1">
                                    <span className="loading loading-ring loading-xs" />
                                    Esperando conexión...
                                </div>
                                {qr ? (
                                    <div className="p-3 bg-white rounded-xl border border-base-200 shadow-inner">
                                        <img src={qr} alt="QR WhatsApp" className="w-56 h-56 object-contain" />
                                    </div>
                                ) : (
                                    <div className="w-56 h-56 flex items-center justify-center rounded-xl bg-base-200">
                                        <span className="loading loading-spinner loading-lg text-base-content/40" />
                                    </div>
                                )}
                                <p className="text-sm text-base-content/60 text-center">
                                    Abre WhatsApp → Dispositivos vinculados → Vincular dispositivo → escanea el QR
                                </p>
                                <button
                                    className="btn btn-ghost btn-sm text-error"
                                    onClick={handleDeactivate}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}

                        {/* CONNECTED */}
                        {phase === 'connected' && (
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="badge badge-success gap-1">
                                            <span className="w-2 h-2 rounded-full bg-success-content inline-block" />
                                            Conectado
                                        </span>
                                    </div>
                                    <button
                                        className="btn btn-ghost btn-sm text-error"
                                        onClick={handleDeactivate}
                                        disabled={loading}
                                    >
                                        {loading && <span className="loading loading-spinner loading-xs" />}
                                        Desactivar
                                    </button>
                                </div>

                                <div className="divider text-xs text-base-content/40 my-0">MENSAJE DE PRUEBA</div>

                                <form onSubmit={handleTest} className="flex flex-col gap-3">
                                    <div className="form-control">
                                        <label className="label pb-1">
                                            <span className="label-text text-sm font-medium">Teléfono</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="input input-bordered input-sm"
                                            placeholder="Ej: 5491112345678"
                                            value={testPhone}
                                            onChange={e => setTestPhone(e.target.value)}
                                            required
                                        />
                                        <label className="label pt-1">
                                            <span className="label-text-alt text-base-content/50">Con código de país, sin + ni espacios</span>
                                        </label>
                                    </div>
                                    <div className="form-control">
                                        <label className="label pb-1">
                                            <span className="label-text text-sm font-medium">Mensaje</span>
                                        </label>
                                        <textarea
                                            className="textarea textarea-bordered textarea-sm"
                                            rows={3}
                                            value={testMessage}
                                            onChange={e => setTestMessage(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {testResult && (
                                        <div className={`alert text-sm ${testResult.ok ? 'alert-success' : 'alert-error'}`}>
                                            {testResult.msg}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-sm self-end gap-2"
                                        disabled={loading}
                                    >
                                        {loading && <span className="loading loading-spinner loading-xs" />}
                                        Enviar prueba
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
