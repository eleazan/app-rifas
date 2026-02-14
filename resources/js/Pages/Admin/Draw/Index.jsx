import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

function DrawAnimation({ totalNumbers, winningNumber, onComplete }) {
    const [display, setDisplay] = useState('???');
    const [phase, setPhase] = useState('spinning');
    const intervalRef = useRef(null);
    const padLength = String(totalNumbers - 1).length;
    const pad = (n) => String(n).padStart(padLength, '0');

    useEffect(() => {
        let speed = 50;
        let elapsed = 0;
        const totalDuration = 3500;

        const tick = () => {
            elapsed += speed;
            const random = Math.floor(Math.random() * totalNumbers);
            setDisplay(pad(random));

            if (elapsed > totalDuration * 0.7) {
                setPhase('slowing');
                speed = Math.min(speed + 25, 350);
            }

            if (elapsed >= totalDuration) {
                clearInterval(intervalRef.current);
                setDisplay(pad(winningNumber));
                setPhase('reveal');
                setTimeout(() => onComplete?.(), 2000);
                return;
            }

            clearInterval(intervalRef.current);
            intervalRef.current = setInterval(tick, speed);
        };

        intervalRef.current = setInterval(tick, speed);
        return () => clearInterval(intervalRef.current);
    }, [winningNumber, totalNumbers]);

    return (
        <div className="flex flex-col items-center gap-6 py-12"
             style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
            <div className={`
                text-7xl lg:text-9xl font-mono font-black tracking-wider transition-all duration-500
                ${phase === 'reveal' ? 'scale-125' : 'scale-100'}
            `}
                 style={{
                     color: phase === 'reveal' ? '#f59e0b' : '#94a3b8',
                     textShadow: phase === 'reveal'
                         ? '0 0 60px rgba(245,158,11,0.6), 0 0 120px rgba(245,158,11,0.3)'
                         : '0 0 20px rgba(148,163,184,0.3)',
                     fontFamily: "'Outfit', sans-serif",
                 }}>
                {display}
            </div>
            {phase === 'spinning' && (
                <p className="text-slate-400 animate-pulse text-sm tracking-widest uppercase">Sorteando...</p>
            )}
            {phase === 'slowing' && (
                <p className="text-amber-400 animate-pulse text-sm tracking-widest uppercase">Casi...</p>
            )}
            {phase === 'reveal' && (
                <p className="text-amber-400 font-bold text-lg animate-bounce">Tenemos ganador!</p>
            )}
        </div>
    );
}

function WinnerCard({ result, hasPending, onNext }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
            <div className="text-center p-8 space-y-4">
                <span className="text-6xl block animate-bounce">🎉</span>
                <h2 className="text-2xl font-extrabold text-slate-800"
                    style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Ganador
                </h2>
                <div className="py-4">
                    <p className="text-7xl font-mono font-black mb-3"
                       style={{ color: '#f59e0b', fontFamily: "'Outfit', sans-serif" }}>
                        #{result.winning_number}
                    </p>
                    <p className="text-sm text-slate-400">
                        Premio: <span className="font-medium text-slate-600 text-base">{result.prize_name}</span>
                    </p>
                </div>
                <div className="pt-4">
                    {hasPending ? (
                        <button onClick={onNext}
                                className="btn text-slate-900 border-0"
                                style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            Sortear otro premio
                        </button>
                    ) : (
                        <div className="text-center py-4 bg-emerald-50 rounded-xl">
                            <p className="text-sm font-semibold text-emerald-700">Todos los premios han sido sorteados</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ConfirmModal({ prize, onConfirm, onCancel, isLoading }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4"
                 onClick={(e) => e.stopPropagation()}>
                <div className="text-center">
                    <span className="text-4xl block mb-2">🎲</span>
                    <h3 className="text-lg font-bold text-slate-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Sortear premio
                    </h3>
                    <p className="text-sm text-slate-500 mt-2">
                        Vas a sortear <span className="font-semibold text-slate-700">{prize.name}</span>.
                        Se elegira un boleto al azar entre los vendidos.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={isLoading}
                            className="btn btn-ghost flex-1">
                        Cancelar
                    </button>
                    <button onClick={onConfirm} disabled={isLoading}
                            className="btn flex-1 text-slate-900 border-0"
                            style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                        {isLoading ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                            'Sortear'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Index({ raffle, prizes, stats }) {
    const { flash } = usePage().props;
    // phase: 'idle' | 'animating' | 'winner'
    const [phase, setPhase] = useState('idle');
    const [drawResult, setDrawResult] = useState(null);
    const [confirmPrize, setConfirmPrize] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // When flash arrives (after Inertia re-render), start animation
    useEffect(() => {
        if (flash.draw_result && phase === 'idle') {
            setDrawResult(flash.draw_result);
            setPhase('animating');
        }
    }, [flash.draw_result]);

    const handleConfirm = () => {
        setIsLoading(true);
        router.post(route('draw.execute'), { prize_id: confirmPrize.id }, {
            preserveScroll: true,
            onError: () => {
                setIsLoading(false);
                setConfirmPrize(null);
            },
        });
        // After Inertia re-renders, flash.draw_result will trigger the animation via useEffect
    };

    const handleAnimationComplete = () => {
        setPhase('winner');
    };

    const handleNextDraw = () => {
        setDrawResult(null);
        setPhase('idle');
        setConfirmPrize(null);
        setIsLoading(false);
        router.visit(route('draw.index'), { preserveScroll: true });
    };

    if (!raffle) {
        return (
            <AuthenticatedLayout header="Sorteo">
                <Head title="Sorteo" />
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
                    <span className="text-5xl mb-4 block">🎲</span>
                    <h3 className="text-lg font-bold text-slate-700 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        No hay rifa activa
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">Activa una rifa para poder realizar sorteos</p>
                    <Link href={route('raffles.index')} className="btn btn-sm text-slate-900 border-0"
                          style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                        Ver Rifas
                    </Link>
                </div>
            </AuthenticatedLayout>
        );
    }

    const pendingPrizes = prizes.filter(p => !p.is_drawn);
    const drawnPrizes = prizes.filter(p => p.is_drawn);

    return (
        <AuthenticatedLayout header="Sorteo">
            <Head title="Sorteo" />

            {/* Confirm modal */}
            {confirmPrize && phase === 'idle' && (
                <ConfirmModal
                    prize={confirmPrize}
                    onConfirm={handleConfirm}
                    onCancel={() => { setConfirmPrize(null); setIsLoading(false); }}
                    isLoading={isLoading}
                />
            )}

            <div className="space-y-6">
                {/* Raffle info + stats */}
                <div className="flex flex-wrap items-center gap-6 bg-white rounded-2xl border border-slate-200/60 p-5">
                    <div>
                        <p className="text-xs text-slate-400">Rifa activa</p>
                        <p className="font-bold text-lg text-slate-800" style={{ fontFamily: "'Outfit', sans-serif" }}>{raffle.name}</p>
                    </div>
                    <div className="border-l border-slate-200 pl-6">
                        <p className="text-xs text-slate-400">Boletos vendidos</p>
                        <p className="font-bold text-slate-800">{stats.total_tickets}</p>
                    </div>
                    <div className="border-l border-slate-200 pl-6">
                        <p className="text-xs text-slate-400">Premios sorteados</p>
                        <p className="font-bold text-slate-800">{stats.drawn_count} / {stats.prizes_count}</p>
                    </div>
                </div>

                {/* Animation area */}
                {phase === 'animating' && drawResult && (
                    <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                        <DrawAnimation
                            totalNumbers={raffle.total_numbers}
                            winningNumber={drawResult.winning_number}
                            onComplete={handleAnimationComplete}
                        />
                    </div>
                )}

                {/* Winner result */}
                {phase === 'winner' && drawResult && (
                    <WinnerCard
                        result={drawResult}
                        hasPending={pendingPrizes.length > 0}
                        onNext={handleNextDraw}
                    />
                )}

                {/* Pending prizes */}
                {pendingPrizes.length > 0 && phase === 'idle' && (
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Premios pendientes ({pendingPrizes.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pendingPrizes.map((prize) => (
                                <div key={prize.id} className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                                    {prize.image ? (
                                        <div className="aspect-video overflow-hidden">
                                            <img src={prize.image} alt={prize.name} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="aspect-video flex items-center justify-center bg-slate-50">
                                            <span className="text-5xl">🎁</span>
                                        </div>
                                    )}
                                    <div className="p-4 space-y-3">
                                        <div>
                                            <h4 className="font-bold text-slate-800">{prize.name}</h4>
                                            <p className="text-xs text-slate-400">Orden: {prize.sort_order}</p>
                                        </div>
                                        <button
                                            onClick={() => setConfirmPrize(prize)}
                                            disabled={stats.total_tickets === 0}
                                            className="btn btn-sm w-full text-slate-900 border-0"
                                            style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                            Sortear
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Drawn prizes */}
                {drawnPrizes.length > 0 && phase !== 'animating' && (
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Premios sorteados ({drawnPrizes.length})
                        </h3>
                        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                            <div className="divide-y divide-slate-100">
                                {drawnPrizes.map((prize) => (
                                    <div key={prize.id} className="flex items-center gap-4 px-5 py-4">
                                        {prize.image ? (
                                            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                                                <img src={prize.image} alt={prize.name} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                                <span className="text-xl">🎁</span>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-800">{prize.name}</p>
                                            <p className="text-xs text-slate-400">Sorteado: {prize.drawn_at}</p>
                                        </div>
                                        <span className="font-mono font-bold text-lg px-3 py-1 rounded-lg text-slate-900"
                                              style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                                            #{prize.winning_number}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* All drawn */}
                {pendingPrizes.length === 0 && drawnPrizes.length > 0 && phase === 'idle' && (
                    <div className="text-center py-8 bg-emerald-50 rounded-2xl border border-emerald-200/60">
                        <span className="text-5xl mb-3 block">✅</span>
                        <h3 className="text-lg font-bold text-emerald-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Todos los premios han sido sorteados
                        </h3>
                        <p className="text-sm text-emerald-600 mt-1">La rifa ha finalizado exitosamente</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
