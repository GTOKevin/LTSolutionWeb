export interface PasswordStrength {
    score: number;
    hasLength: boolean;
    hasUpper: boolean;
    hasSymbol: boolean;
    label: string;
}

export function getPasswordStrength(password: string): PasswordStrength {
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    let score = 0;
    if (hasLength) score++;
    if (hasUpper) score++;
    if (hasSymbol) score++;

    return {
        score,
        hasLength,
        hasUpper,
        hasSymbol,
        label: score === 0 ? 'Muy Débil' : score === 1 ? 'Débil' : score === 2 ? 'Media' : 'Fuerte',
    };
}
