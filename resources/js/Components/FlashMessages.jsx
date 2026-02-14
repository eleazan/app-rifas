import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function FlashMessages() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (flash?.success) {
            setMessage({ type: 'success', text: flash.success });
            setVisible(true);
        } else if (flash?.error) {
            setMessage({ type: 'error', text: flash.error });
            setVisible(true);
        }
    }, [flash?.success, flash?.error]);

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => setVisible(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible) return null;

    const isSuccess = message.type === 'success';

    return (
        <div className={`fixed top-4 right-4 z-50 animate-fade-in-up max-w-sm`}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
                isSuccess
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
                <span className="text-lg">{isSuccess ? '✓' : '✕'}</span>
                <p className="text-sm font-medium flex-1">{message.text}</p>
                <button onClick={() => setVisible(false)} className="text-current opacity-50 hover:opacity-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
