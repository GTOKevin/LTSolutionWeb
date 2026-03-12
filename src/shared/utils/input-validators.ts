import React from 'react';
import { INPUT_VAL } from '@/shared/constants/constantes';

/**
 * Validates and restricts input to only allow letters and spaces.
 * Useful for name fields where numbers or special characters are not allowed.
 * 
 * Usage: <TextField onKeyDown={handleLettersOnlyKeyDown} ... />
 */
export const handleLettersOnlyKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Allow control keys (backspace, delete, tab, arrows, enter, etc.)
    // e.key.length > 1 catches most special keys like 'Enter', 'Backspace', 'ArrowLeft', etc.
    // Also explicitly check for ctrl/meta/alt to allow shortcuts like Ctrl+C/V
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    
    // Check if the key is a letter (including accents/ñ) or space
    // Using a regex that covers common latin characters and whitespace
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(e.key)) {
        e.preventDefault();
    }
};

/**
 * Validates and restricts input to prevent spaces.
 * Useful for fields like username, email, password code, etc.
 * 
 * Usage: <TextField onKeyDown={handleNoSpacesKeyDown} ... />
 */
export const handleNoSpacesKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ') {
        e.preventDefault();
    }
};

/**
 * Validates and restricts input to allow letters, numbers, spaces and common address characters.
 * Allowed: a-z, A-Z, 0-9, accents, ñ, spaces, and , . - _ / ( ) [ ]
 * 
 * Usage: <TextField onKeyDown={handleAddressKeyDown} ... />
 */
export const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    
    if (!INPUT_VAL.ALPHA_NUMERICO_ESPECIAL.test(e.key)) {
        e.preventDefault();
    }
};

/**
 * Validates and restricts input to only allow letters, numbers and spaces.
 * Useful for fields like names and surnames (nombres y apellidos).
 * 
 * Usage: <TextField onKeyDown={handleAlphaNumericSpacesKeyDown} ... />
 */
export const handleAlphaNumericSpacesKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    
    if (!INPUT_VAL.ALPHA_NUMERICO_ESPACIOS.test(e.key)) {
        e.preventDefault();
    }
};
