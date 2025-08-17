/**
 * Utility functions for formatting data
 */

/**
 * Format currency in Bangladeshi Taka
 */
export const formatCurrency = (amount: number): string => {
    if (amount >= 10000000) {
        return `৳${(amount / 10000000).toFixed(1)} কোটি`;
    } else if (amount >= 100000) {
        return `৳${(amount / 100000).toFixed(1)} লক্ষ`;
    } else if (amount >= 1000) {
        return `৳${(amount / 1000).toFixed(1)} হাজার`;
    } else {
        return `৳${amount.toLocaleString('bn-BD')}`;
    }
};

/**
 * Format percentage with Bengali numerals
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`.replace(/\d/g, (digit) => {
        const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return bengaliDigits[parseInt(digit)];
    });
};

/**
 * Format numbers to Bengali numerals
 */
export const formatBengaliNumber = (num: number): string => {
    return num.toString().replace(/\d/g, (digit) => {
        const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return bengaliDigits[parseInt(digit)];
    });
};

/**
 * Format date to Bengali format
 */
export const formatBengaliDate = (date: Date): string => {
    const bengaliMonths = [
        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
        'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];

    const day = formatBengaliNumber(date.getDate());
    const month = bengaliMonths[date.getMonth()];
    const year = formatBengaliNumber(date.getFullYear());

    return `${day} ${month}, ${year}`;
};

/**
 * Format time duration in Bengali
 */
export const formatDuration = (months: number): string => {
    if (months >= 12) {
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        let result = `${formatBengaliNumber(years)} বছর`;
        if (remainingMonths > 0) {
            result += ` ${formatBengaliNumber(remainingMonths)} মাস`;
        }
        return result;
    } else {
        return `${formatBengaliNumber(months)} মাস`;
    }
};

/**
 * Format large numbers with appropriate units
 */
export const formatLargeNumber = (num: number): string => {
    if (num >= 1000000000) {
        return `${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    } else {
        return num.toString();
    }
};

/**
 * Calculate compound interest
 */
export const calculateCompoundInterest = (
    principal: number,
    rate: number,
    time: number,
    compoundingFrequency: number = 1
): number => {
    return principal * Math.pow(1 + rate / (100 * compoundingFrequency), compoundingFrequency * time);
};

/**
 * Calculate simple interest
 */
export const calculateSimpleInterest = (
    principal: number,
    rate: number,
    time: number
): number => {
    return principal * (1 + (rate * time) / 100);
};

/**
 * Calculate monthly SIP amount needed for target
 */
export const calculateSIPAmount = (
    targetAmount: number,
    annualReturn: number,
    years: number
): number => {
    const monthlyReturn = annualReturn / (12 * 100);
    const months = years * 12;

    if (monthlyReturn === 0) {
        return targetAmount / months;
    }

    return targetAmount * monthlyReturn / (Math.pow(1 + monthlyReturn, months) - 1);
};

/**
 * Calculate future value of SIP
 */
export const calculateSIPFutureValue = (
    monthlyAmount: number,
    annualReturn: number,
    years: number
): number => {
    const monthlyReturn = annualReturn / (12 * 100);
    const months = years * 12;

    if (monthlyReturn === 0) {
        return monthlyAmount * months;
    }

    return monthlyAmount * (Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn;
};

