import { Link } from '@inertiajs/react';

export default function PublicLayout({ children }) {
    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
            {/* Navbar */}
            <div className="border-b border-white/5">
                <div className="max-w-6xl mx-auto px-4 lg:px-8 h-16 flex items-center">
                    <Link href="/rifa" className="flex items-center gap-2 no-underline">
                        <span className="text-2xl">🎟️</span>
                        <span className="text-xl font-extrabold text-white tracking-tight"
                              style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Rifa<span className="text-amber-400">App</span>
                        </span>
                    </Link>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
