import React, { useEffect } from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext.jsx';
import { formatCents } from '../../utils/money.js';

export default function SlideCart() {
  const {
    open,
    items,
    itemCount,
    subtotalCents,
    loading,
    initialLoad,
    error,
    closeCart,
    removeItem,
    clearCart,
    clearError,
  } = useCart();

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        closeCart();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeCart]);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '';
    };
  }, [open]);

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`
          fixed inset-0 bg-black/70 z-40 backdrop-blur-sm
          transition-all duration-500 ease-out
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={open ? closeCart : undefined}
      />

      {/* Cart Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 flex ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          className={`
            bg-gradient-to-b from-[#0e0e15] to-[#0b0b10] border-l border-purple-500/30 
            shadow-2xl shadow-purple-500/20 w-full md:w-[420px] flex flex-col
            transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${open 
              ? 'translate-x-0 opacity-100 scale-100' 
              : 'translate-x-full opacity-0 scale-95'
            }
          `}
          style={{
            transformOrigin: 'right center',
          }}
        >
          {/* Header */}
          <div 
            className={`
              flex items-center justify-between p-4 border-b border-purple-500/30 
              bg-gradient-to-r from-purple-900/20 to-pink-900/20
              transform transition-all duration-600 ease-out
              ${open 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-8 opacity-0'
              }
            `}
            style={{ transitionDelay: open ? '100ms' : '0ms' }}
          >
            <h2 className="text-lg font-semibold flex items-center gap-2 text-white font-heading">
              <ShoppingBag className="w-5 h-5 text-purple-400" />
              Cart ({itemCount})
            </h2>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-purple-800/30 rounded-lg transition-colors text-purple-300 hover:text-white"
              autoFocus
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div 
              className={`
                p-4 bg-red-900/20 border-b border-red-800/30
                transform transition-all duration-600 ease-out
                ${open 
                  ? 'translate-x-0 opacity-100' 
                  : 'translate-x-8 opacity-0'
                }
              `}
              style={{ transitionDelay: open ? '150ms' : '0ms' }}
            >
              <div className="flex items-center justify-between">
                <p className="text-red-400 text-sm">{error}</p>
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div 
            className={`
              flex-1 overflow-y-auto
              transform transition-all duration-700 ease-out
              ${open 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-4 opacity-0'
              }
            `}
            style={{ transitionDelay: open ? '200ms' : '0ms' }}
          >
            {initialLoad && (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-purple-300">Loading cart...</p>
              </div>
            )}

            {!initialLoad && items.length === 0 && (
              <div className="p-8 text-center">
                <ShoppingBag className="w-16 h-16 text-purple-400/60 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2 font-heading">Your cart is empty</h3>
                <p className="text-purple-300">Add some packages to get started!</p>
              </div>
            )}

            {!initialLoad && items.length > 0 && (
              <div className="p-4 space-y-4">
                {items.map((item, index) => {
                  // Determine package color based on slug
                  const getPackageColor = (slug) => {
                    if (slug === 'starter') return 'green';
                    if (slug === 'pro') return 'purple';
                    if (slug === 'elite') return 'blue';
                    return 'purple'; // default
                  };

                  const packageColor = getPackageColor(item.slug);
                  const isHighlight = packageColor === 'purple';

                  return (
                    <div 
                      key={item._id} 
                      className={`
                        flex items-center gap-4 p-4 rounded-lg transition-all duration-500
                        transform
                        ${open 
                          ? 'translate-x-0 opacity-100' 
                          : 'translate-x-6 opacity-0'
                        }
                        ${isHighlight 
                          ? 'bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-purple-800/20 border border-pink-400/50 shadow-lg shadow-pink-500/20' 
                          : packageColor === 'green'
                            ? 'bg-[#14141f] border border-green-600/60 hover:border-green-400/80'
                            : 'bg-[#14141f] border border-blue-600/60 hover:border-blue-400/80'
                        }
                      `}
                      style={{ 
                        transitionDelay: open ? `${300 + (index * 100)}ms` : '0ms' 
                      }}
                    >
                      {/* Package Icon */}
                      <div className={`
                        text-2xl p-3 rounded-full
                        ${isHighlight 
                          ? 'bg-purple-500/20' 
                          : packageColor === 'green'
                            ? 'bg-green-500/20'
                            : 'bg-blue-500/20'
                        }
                      `}>
                        {packageColor === 'green' ? '🎁' : packageColor === 'purple' ? '💎' : '🏦'}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1">
                        <h4 className="font-medium text-white font-heading">{item.name}</h4>
                        <p className="text-sm text-purple-300">One-time purchase</p>
                      </div>

                      {/* Price & Remove */}
                      <div className="text-right flex items-center gap-3">
                        <p className={`
                          font-medium text-lg font-heading
                          ${isHighlight 
                            ? 'text-white' 
                            : packageColor === 'green'
                              ? 'text-green-400'
                              : 'text-blue-400'
                          }
                        `}>
                          {item.priceCents === 0 ? 'Free' : formatCents(item.priceCents)}
                        </p>
                        <button
                          onClick={() => removeItem(item._id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Clear Cart Button */}
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="w-full text-sm text-purple-400 hover:text-red-400 transition-colors py-3 border-t border-purple-500/30 mt-4 pt-4"
                    title="Clear all items"
                  >
                    Clear all items
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div 
              className={`
                border-t border-purple-500/30 p-4 space-y-4 
                bg-gradient-to-r from-purple-900/10 to-pink-900/10
                transform transition-all duration-700 ease-out
                ${open 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-6 opacity-0'
                }
              `}
              style={{ transitionDelay: open ? '400ms' : '0ms' }}
            >
              {/* Subtotal */}
              <div className="flex justify-between items-center text-lg font-semibold">
                <span className="text-purple-300">Total:</span>
                <span className="text-white font-heading text-xl">{formatCents(subtotalCents)}</span>
              </div>

              {/* Checkout Button */}
              <button
                className="w-full bg-gradient-to-r from-purple-600/50 to-pink-600/50 text-purple-200 py-3 px-4 rounded-lg cursor-not-allowed opacity-60 font-medium border border-purple-500/30"
                disabled
              >
                Checkout (Coming Soon)
              </button>

              <p className="text-xs text-purple-400 text-center">
                Secure checkout with Stripe will be available soon
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
