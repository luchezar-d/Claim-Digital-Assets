/**
 * Format cents to currency display
 * @param {number} cents - Amount in cents (e.g., 50 = €0.50)
 * @param {string} currency - Currency code (default: EUR)
 * @returns {string} Formatted currency string
 */
export function formatCents(cents, currency = 'EUR') {
  if (typeof cents !== 'number' || isNaN(cents)) {
    return '€0.00';
  }

  const euros = cents / 100;
  
  // For EUR, use simple formatting
  if (currency === 'EUR') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(euros);
  }

  // For other currencies, use Intl.NumberFormat
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(euros);
  } catch (error) {
    // Fallback if currency is invalid
    return `€${euros.toFixed(2)}`;
  }
}
