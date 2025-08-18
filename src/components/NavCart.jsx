import { forwardRef } from "react";
import { useCart } from '../contexts/CartContext.jsx';

const CartIcon = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M6 6h-.8a1 1 0 1 1 0-2H7a1 1 0 0 1 .96.73L8.2 6H20a1 1 0 0 1 .97 1.24l-1.8 7.2A2 2 0 0 1 17.24 16H9a1 1 0 1 1 0-2h8.24l1.2-4.8H8.63l-1.1-3.66A1 1 0 0 0 6.6 5H5.2a1 1 0 1 1 0-2H6a1 1 0 0 1 0 2Z" fill="currentColor"/>
    <circle cx="10" cy="20" r="1.8" fill="currentColor"/>
    <circle cx="17" cy="20" r="1.8" fill="currentColor"/>
  </svg>
);

const NavCart = forwardRef(function NavCart({ count }, ref) {
  const { openCart } = useCart();

  return (
    <button
      ref={ref}
      onClick={openCart}
      aria-label="Cart"
      className="relative inline-flex items-center justify-center rounded-full p-2 text-gray-300 hover:text-white transition-colors duration-200"
      title="Cart"
    >
      <CartIcon className="h-5 w-5" />
      {count > 0 && (
        <span
          data-cart-badge
          className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-emerald-400 text-black text-xs font-extrabold flex items-center justify-center"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
});

export default NavCart;
