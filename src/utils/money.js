/**
 * Format cents to currency display
 * @param {number} cents - Amount in cents (e.g., 1990 = $19.90)
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export function formatCents(cents, currency = 'USD') {
  if (typeof cents !== 'number' || isNaN(cents)) {
    return '$0.00';
  }

  const dollars = cents / 100;
  
  // For USD, use simple formatting
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(dollars);
  }

  // For other currencies, use Intl.NumberFormat
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(dollars);
  } catch (error) {
    // Fallback if currency is invalid
    return `$${dollars.toFixed(2)}`;
  }
}
