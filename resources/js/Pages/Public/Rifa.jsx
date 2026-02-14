import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';

function PrizeCard({ prize, index }) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm hover:bg-white/[0.08] transition-all duration-300"
             style={{ animationDelay: `${index * 100}ms` }}>
            {/* Image */}
            {prize.image ? (
                <div className="aspect-[4/3] overflow-hidden">
                    <img src={prize.image} alt={prize.name}
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
            ) : (
                <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-amber-500/10 to-amber-600/5">
                    <span className="text-6xl opacity-50">🎁</span>
                </div>
            )}

            {/* Badge position */}
            <div className="absolute top-3 left-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full text-slate-900"
                      style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                    Premio #{prize.sort_order + 1}
                </span>
            </div>

            {/* Drawn badge */}
            {prize.is_drawn && (
                <div className="absolute top-3 right-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white">
                        Ganador: #{prize.winning_number}
                    </span>
                </div>
            )}

            {/* Info */}
            <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-1"
                    style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {prize.name}
                </h3>
                {prize.description && (
                    <p className="text-sm text-slate-400 line-clamp-2">{prize.description}</p>
                )}
            </div>
        </div>
    );
}

export default function Rifa({ raffle }) {
    if (!raffle) {
        return (
            <PublicLayout>
                <Head title="Rifa" />
                <div className="text-center py-32">
                    <span className="text-7xl mb-6 block">🎟️</span>
                    <h1 className="text-3xl font-extrabold text-white mb-3"
                        style={{ fontFamily: "'Outfit', sans-serif" }}>
                        No hay rifa activa
                    </h1>
                    <p className="text-slate-400 text-lg">Vuelve pronto, estamos preparando algo increible.</p>
                </div>
            </PublicLayout>
        );
    }

    const drawnCount = raffle.prizes.filter(p => p.is_drawn).length;
    const progress = raffle.total_numbers > 0
        ? Math.round((raffle.sold_count / raffle.total_numbers) * 100)
        : 0;

    return (
        <PublicLayout>
            <Head title={raffle.name} />

            <div className="space-y-10">
                {/* Hero */}
                <div className="text-center space-y-4 py-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        <span className="text-amber-400 text-sm font-medium">Rifa activa</span>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-extrabold text-white"
                        style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {raffle.name}
                    </h1>

                    {raffle.description && (
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">{raffle.description}</p>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
                        <div className="text-center">
                            <p className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {raffle.ticket_price}€
                            </p>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">por boleto</p>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div className="text-center">
                            <p className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {raffle.prizes.length}
                            </p>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">premios</p>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div className="text-center">
                            <p className="text-3xl font-extrabold text-amber-400" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {progress}%
                            </p>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">vendido</p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="max-w-md mx-auto pt-2">
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000"
                                 style={{
                                     width: `${progress}%`,
                                     background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                                 }} />
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5">
                            {raffle.sold_count} de {raffle.total_numbers} boletos vendidos
                        </p>
                    </div>
                </div>

                {/* Prizes */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6 text-center"
                        style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Premios
                        {drawnCount > 0 && (
                            <span className="text-sm font-normal text-slate-500 ml-2">
                                ({drawnCount}/{raffle.prizes.length} sorteados)
                            </span>
                        )}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {raffle.prizes.map((prize, i) => (
                            <PrizeCard key={prize.id} prize={prize} index={i} />
                        ))}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
