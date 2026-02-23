import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Gmail({ connected: initialConnected, gmailEmail: initialEmail }) {
    const { flash } = usePage().props;

    const [connected, setConnected] = useState(initialConnected);
    const [gmailEmail, setGmailEmail] = useState(initialEmail);
    const [loading, setLoading] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [testResult, setTestResult] = useState(null);

    async function handleDisconnect() {
        setLoading(true);
        try {
            await window.axios.post(route('settings.gmail.disconnect'));
            setConnected(false);
            setGmailEmail(null);
            setTestResult(null);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }

    async function handleTest(e) {
        e.preventDefault();
        setTestResult(null);
        setLoading(true);
        try {
            await window.axios.post(route('settings.gmail.test'), { email: testEmail });
            setTestResult({ ok: true, msg: 'Correo enviado correctamente.' });
        } catch (err) {
            const msg = err.response?.data?.message ?? 'No se pudo enviar el correo.';
            setTestResult({ ok: false, msg });
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthenticatedLayout header="Gmail">
            <div className="max-w-xl mx-auto">
                <div className="card bg-base-100 shadow-sm border border-base-200">
                    <div className="card-body gap-6">

                        {/* Header */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                                <svg className="w-7 h-7 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-base-content">Configuración Gmail</h2>
                                <p className="text-sm text-base-content/60">Conecta una cuenta Gmail para enviar notificaciones</p>
                            </div>
                        </div>

                        {/* Flash messages */}
                        {flash?.success && (
                            <div className="alert alert-success text-sm">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                {flash.success}
                            </div>
                        )}
                        {flash?.error && (
                            <div className="alert alert-error text-sm">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {flash.error}
                            </div>
                        )}

                        {/* IDLE */}
                        {!connected && (
                            <div className="flex flex-col items-center gap-4 py-6">
                                <p className="text-base-content/60 text-sm text-center max-w-sm">
                                    Conecta tu cuenta Gmail para enviar las notificaciones de boletos desde ella en lugar del mailer por defecto.
                                </p>
                                <a
                                    href={route('settings.gmail.redirect')}
                                    className="btn btn-error gap-2"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                    </svg>
                                    Conectar con Google
                                </a>
                                <p className="text-xs text-base-content/40 text-center">
                                    Necesitas tener configuradas las credenciales <code>GOOGLE_CLIENT_ID</code> y <code>GOOGLE_CLIENT_SECRET</code> en el servidor.
                                </p>
                            </div>
                        )}

                        {/* CONNECTED */}
                        {connected && (
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="badge badge-success gap-1">
                                            <span className="w-2 h-2 rounded-full bg-success-content inline-block" />
                                            Conectado
                                        </span>
                                        {gmailEmail && (
                                            <span className="text-sm text-base-content/70 font-medium">{gmailEmail}</span>
                                        )}
                                    </div>
                                    <button
                                        className="btn btn-ghost btn-sm text-error"
                                        onClick={handleDisconnect}
                                        disabled={loading}
                                    >
                                        {loading && <span className="loading loading-spinner loading-xs" />}
                                        Desconectar
                                    </button>
                                </div>

                                <div className="divider text-xs text-base-content/40 my-0">CORREO DE PRUEBA</div>

                                <form onSubmit={handleTest} className="flex flex-col gap-3">
                                    <div className="form-control">
                                        <label className="label pb-1">
                                            <span className="label-text text-sm font-medium">Destinatario</span>
                                        </label>
                                        <input
                                            type="email"
                                            className="input input-bordered input-sm"
                                            placeholder="ejemplo@correo.com"
                                            value={testEmail}
                                            onChange={e => setTestEmail(e.target.value)}
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
