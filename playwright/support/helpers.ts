export function generateOrderCode() {
    const prefix = 'VLO';

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';

    // Gera 3 letras para o prefixo (ex: VLO)
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        randomPart += chars[randomIndex];
    }

    return `${prefix}-${randomPart}`;
}