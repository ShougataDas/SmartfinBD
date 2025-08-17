// src/utils/securityValidator.ts

export class SecurityValidator {
    /**
     * Validates if a password meets basic strength requirements.
     * - At least 8 characters long
     * - Contains at least one uppercase letter
     * - Contains at least one lowercase letter
     * - Contains at least one number
     * - Contains at least one special character
     */
    static validatePassword(password: string): boolean {
        const hasMinLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
    }

    /**
     * Validates if an email address is in a valid format.
     */
    static validateEmail(email: string): boolean {
        // A more robust regex for email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    /**
     * Sanitizes input to prevent common security vulnerabilities like XSS.
     * This is a basic example and might need more comprehensive libraries for production.
     */
    static sanitizeInput(input: string): string {
        if (typeof input !== 'string') {
            return '';
        }
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/\'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    /**
     * Calculates a strength score for a given password.
     * Returns a number from 0 to 6, higher is stronger.
     */
    static calculatePasswordStrength(password: string): number {
        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++; // Bonus for longer passwords
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
        return score;
    }

    /**
     * Checks if a password is considered strong based on a threshold score.
     */
    static isStrongPassword(password: string): boolean {
        return this.calculatePasswordStrength(password) >= 4; // Threshold for 'strong'
    }

    /**
     * Checks if a given string is a valid UUID (v4).
     */
    static isValidUUID(uuid: string): boolean {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
}
