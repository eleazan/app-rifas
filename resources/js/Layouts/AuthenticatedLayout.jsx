import { Link, usePage } from '@inertiajs/react';
import FlashMessages from '@/Components/FlashMessages';

const adminLinks = [
    { href: 'dashboard', label: 'Dashboard', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm0 7a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5zm-10-2a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1v-5z" />
        </svg>
    )},
    { href: 'raffles.index', label: 'Rifas', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
    )},
    { href: 'prizes.index', label: 'Premios', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
    )},
    { href: 'sellers.index', label: 'Vendedores', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    )},
    { href: 'tickets.index', label: 'Boletos', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
    )},
    { href: 'draw.index', label: 'Sorteo', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    )},
];

const sellerLinks = [
    { href: 'sell.index', label: 'Vender', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
    )},
    { href: 'my-sales.index', label: 'Mis Ventas', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    )},
];

function routeExists(name) {
    try {
        route(name);
        return true;
    } catch {
        return false;
    }
}

function SidebarContent({ user, links }) {
    const availableLinks = links.filter((link) => routeExists(link.href));

    return (
        <div className="flex flex-col h-full w-72 text-white"
             style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
            {/* Logo */}
            <div className="px-6 py-5 border-b border-white/5">
                <Link href={route('dashboard')} className="flex items-center gap-3">
                    <span className="text-3xl">🎟️</span>
                    <span className="text-2xl font-extrabold tracking-tight"
                          style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Rifa<span className="text-amber-400">App</span>
                    </span>
                </Link>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {availableLinks.map((link) => {
                    const isActive = route().current(link.href);
                    return (
                        <Link
                            key={link.href}
                            href={route(link.href)}
                            className={`sidebar-link flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                isActive
                                    ? 'active'
                                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                            }`}
                        >
                            {link.icon}
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* User card at bottom */}
            <div className="px-4 py-4 border-t border-white/5">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04]">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-slate-900"
                         style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.role === 'admin' ? 'Administrador' : 'Vendedor'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const links = user.role === 'admin' ? adminLinks : sellerLinks;

    return (
        <div className="drawer lg:drawer-open">
            <input id="main-drawer" type="checkbox" className="drawer-toggle" />

            <div className="drawer-content flex flex-col min-h-screen bg-slate-50">
                <FlashMessages />
                {/* Navbar */}
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
                    <div className="flex items-center justify-between px-4 lg:px-8 h-16">
                        <div className="flex items-center gap-4">
                            {/* Mobile menu button */}
                            <label htmlFor="main-drawer" className="btn btn-ghost btn-sm btn-square lg:hidden">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </label>
                            {header && (
                                <h1 className="text-lg font-bold text-slate-800"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {header}
                                </h1>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {/* User dropdown */}
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button"
                                     className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                         style={{ background: 'linear-gradient(135deg, #0f172a, #334155)' }}>
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 hidden sm:inline">{user.name}</span>
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                <ul tabIndex={0}
                                    className="dropdown-content mt-2 menu bg-white rounded-xl z-50 w-52 p-2 shadow-lg border border-slate-200/60">
                                    <li>
                                        <Link href={route('profile.edit')} className="rounded-lg text-sm text-slate-600 hover:text-slate-900">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Perfil
                                        </Link>
                                    </li>
                                    <div className="border-t border-slate-100 my-1" />
                                    <li>
                                        <Link href={route('logout')} method="post" as="button"
                                              className="rounded-lg text-sm text-rose-500 hover:text-rose-700 hover:bg-rose-50">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Cerrar sesion
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-8">
                    {children}
                </main>
            </div>

            {/* Sidebar */}
            <div className="drawer-side z-40">
                <label htmlFor="main-drawer" aria-label="cerrar menu" className="drawer-overlay"></label>
                <SidebarContent user={user} links={links} />
            </div>
        </div>
    );
}
