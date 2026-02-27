export function normalizePhone(v) {
    const stripped = v.replace(/[\s\-().]/g, '');
    if (!stripped) return stripped;
    if (stripped.startsWith('+')) return stripped.slice(1);
    if (stripped.startsWith('00')) return stripped.slice(2);
    if (stripped.length === 9) return '34' + stripped;
    return stripped;
}
