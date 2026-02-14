import { useState, useMemo, useRef } from 'react';

export default function NumberGrid({ totalNumbers, soldNumbers = [], lockedNumbers = [], selectedNumbers = [], onToggle }) {
    const [search, setSearch] = useState('');
    const [showUnavailable, setShowUnavailable] = useState(false);

    // Snapshot of initially sold numbers (at page load), never changes
    const initialSold = useRef(new Set(soldNumbers));

    const numbers = useMemo(() => {
        const sold = new Set(soldNumbers);
        const locked = new Set(lockedNumbers);
        const selected = new Set(selectedNumbers);
        const result = [];

        for (let i = 0; i < totalNumbers; i++) {
            const isSold = sold.has(i);
            const isLocked = locked.has(i);
            const wasInitiallySold = initialSold.current.has(i);

            // Hide numbers that were sold on initial load (unless toggled on or searching)
            const hidden = wasInitiallySold && !showUnavailable && !search.trim();

            result.push({
                number: i,
                sold: isSold,
                locked: isLocked,
                selected: selected.has(i),
                // Numbers that became sold/locked DURING the session are always visible
                newlySold: isSold && !wasInitiallySold,
                hidden,
            });
        }
        return result;
    }, [totalNumbers, soldNumbers, lockedNumbers, selectedNumbers, showUnavailable, search]);

    const filtered = useMemo(() => {
        let list = numbers;
        if (search.trim()) {
            const term = search.trim();
            list = list.filter((n) => String(n.number).includes(term));
        }
        return list.filter((n) => !n.hidden);
    }, [numbers, search]);

    const lockedCount = lockedNumbers.length;
    const stats = useMemo(() => ({
        total: totalNumbers,
        sold: soldNumbers.length,
        available: totalNumbers - soldNumbers.length - lockedCount,
        selected: selectedNumbers.length,
    }), [totalNumbers, soldNumbers, lockedCount, selectedNumbers]);

    const padLength = String(totalNumbers - 1).length;
    const pad = (n) => String(n).padStart(padLength, '0');

    return (
        <div className="space-y-4">
            {/* Stats bar */}
            <div className="flex flex-wrap gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></span>
                    Disponible ({stats.available})
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-slate-300"></span>
                    Vendido ({stats.sold})
                </span>
                {lockedCount > 0 && (
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-orange-200 border border-orange-300"></span>
                        Reservado ({lockedCount})
                    </span>
                )}
                {onToggle && (
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}></span>
                        Seleccionado ({stats.selected})
                    </span>
                )}
            </div>

            {/* Search + toggle */}
            <div className="flex flex-wrap items-center gap-3">
                <input
                    type="text"
                    placeholder="Buscar numero..."
                    className="input input-bordered input-sm w-full max-w-xs"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {initialSold.current.size > 0 && (
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500 select-none">
                        <input
                            type="checkbox"
                            className="toggle toggle-xs toggle-warning"
                            checked={showUnavailable}
                            onChange={(e) => setShowUnavailable(e.target.checked)}
                        />
                        Mostrar vendidos
                    </label>
                )}
            </div>

            {/* Grid */}
            <div className="max-h-[500px] overflow-y-auto rounded-xl border border-slate-200/60 bg-white p-3">
                <div className="grid gap-1.5"
                     style={{
                         gridTemplateColumns: `repeat(auto-fill, minmax(${padLength > 3 ? '54px' : '44px'}, 1fr))`,
                     }}>
                    {filtered.map(({ number, sold, locked, selected, newlySold }) => (
                        <button
                            key={number}
                            type="button"
                            disabled={sold || locked || !onToggle}
                            onClick={() => onToggle && !sold && !locked && onToggle(number)}
                            className={`
                                text-xs font-mono font-medium rounded-lg py-2 px-1 transition-all duration-150
                                ${sold
                                    ? newlySold
                                        ? 'bg-rose-100 text-rose-400 cursor-not-allowed line-through border border-rose-200'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed line-through'
                                    : locked
                                        ? 'bg-orange-100 text-orange-400 cursor-not-allowed border border-orange-200'
                                        : selected
                                            ? 'text-slate-900 shadow-sm scale-105 border-0'
                                            : 'bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-700 border border-slate-200/60 cursor-pointer'
                                }
                            `}
                            style={selected ? { background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' } : {}}
                            title={locked ? 'Reservado por otro vendedor' : newlySold ? 'Vendido durante esta sesion' : ''}
                        >
                            {pad(number)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
