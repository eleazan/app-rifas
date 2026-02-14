import { Link } from '@inertiajs/react';

function FloatingTicket({ emoji, className }) {
    return (
        <span className={`absolute text-4xl opacity-15 select-none pointer-events-none animate-float ${className}`}>
            {emoji}
        </span>
    );
}

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
             style={{
                 background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 70%, #1e293b 100%)',
             }}>

            {/* Decorative floating elements */}
            <FloatingTicket emoji="🎟️" className="top-[10%] left-[8%]" />
            <FloatingTicket emoji="🎁" className="top-[20%] right-[12%]" style={{ animationDelay: '1s' }} />
            <FloatingTicket emoji="🎰" className="bottom-[15%] left-[15%]" style={{ animationDelay: '2s' }} />
            <FloatingTicket emoji="🏆" className="bottom-[25%] right-[8%]" style={{ animationDelay: '0.5s' }} />
            <FloatingTicket emoji="✨" className="top-[50%] left-[5%]" style={{ animationDelay: '3s' }} />
            <FloatingTicket emoji="🎪" className="top-[8%] right-[30%]" style={{ animationDelay: '1.5s' }} />

            {/* Ambient golden glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
                 style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)' }}
            />

            {/* Card */}
            <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up">
                {/* Logo area */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-5xl">🎟️</span>
                            <div>
                                <h1 className="text-4xl font-extrabold tracking-tight text-white"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Rifa<span className="text-amber-400">App</span>
                                </h1>
                                <p className="text-amber-200/60 text-sm font-medium tracking-widest uppercase mt-0.5">
                                    Gestion de Rifas
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Card with golden accent */}
                <div className="relative">
                    {/* Top golden bar */}
                    <div className="absolute -top-1 left-6 right-6 h-1.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500" />

                    <div className="bg-white/[0.07] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                        <div className="p-8">
                            {children}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-xs mt-6">
                    &copy; {new Date().getFullYear()} RifaApp &mdash; Gestion de rifas populares
                </p>
            </div>
        </div>
    );
}
