import React, { memo, useMemo, useRef, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { flyToCart } from "../utils/flyToCart";

const GiftIcon = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M3 9h18v3H3z" fill="currentColor" opacity=".15"/>
    <path d="M4 9h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9Zm7-7c1.66 0 3 1.34 3 3v1h2.5a1.5 1.5 0 0 1 0 3H7.5a1.5 1.5 0 0 1 0-3H10V5c0-1.66 1.34-3 3-3Z" fill="currentColor"/>
  </svg>
);

const DiamondIcon = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M3 9 7 3h10l4 6-9 12L3 9Z" fill="currentColor" opacity=".15"/>
    <path d="M7 3h10l4 6h-6l-3 12L9 9H3l4-6Z" fill="currentColor"/>
  </svg>
);

const BankIcon = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M3 9 12 3l9 6v2H3V9Z" fill="currentColor"/>
    <path d="M5 11h2v7H5zm6 0h2v7h-2zm6 0h2v7h-2zM3 20h18v2H3z" fill="currentColor"/>
  </svg>
);

const Card = memo(function Card({ pkg, featured, onAdd, reduceMotion }) {
  const iconRef = useRef(null);

  const base =
    "relative rounded-2xl p-6 sm:p-8 bg-[#0e1116] ring-1 ring-white/10 text-white/90 " +
    "transition-transform duration-300 motion-safe:transform-gpu will-change-transform " +
    "hover:-translate-y-1 hover:scale-[1.015] shadow-sm";

  return (
    <div className={base}>
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold bg-fuchsia-600/20 border border-fuchsia-400/40 text-fuchsia-200">
          MOST POPULAR
        </span>
      )}
      <div className={featured ? "pt-3" : ""} />

      <div className="flex items-center gap-3">
        <div
          ref={iconRef}
          className="flex h-12 w-12 items-center justify-center rounded-full ring-1 ring-white/10"
          style={{ background: pkg.iconBg }}
        >
          {pkg.icon}
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: pkg.pillBg, color: pkg.pillFg }}>
          {pkg.pill}
        </span>
      </div>

      <div className="mt-3">
        <div className="text-3xl font-bold" style={{ color: pkg.priceColor }}>{pkg.price}</div>
        <h3 className="mt-1 text-2xl font-semibold">{pkg.title}</h3>
        <p className="mt-1 text-sm text-white/60">{pkg.subtitle}</p>
      </div>

      <ul className="mt-4 space-y-2 text-sm">
        {pkg.features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full" style={{ background: pkg.bullet }} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onAdd?.(iconRef.current, pkg)}
        className="mt-6 w-full rounded-xl py-3 font-medium bg-white text-black hover:opacity-90 transition-opacity"
        style={{ boxShadow: "0 4px 20px rgba(0,0,0,.25)" }}
      >
        🛒 Add to Cart
      </button>
    </div>
  );
});

export default function PackagesSection({ cartRef }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, openCart } = useCart();

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const pkgs = useMemo(
    () => [
      {
        key: "starter",
        title: "Free Starter",
        subtitle: "Get started with no-risk bonus opportunities.",
        price: "Free",
        priceColor: "#22c55e", // emerald-500
        pill: "Up to $50",
        pillBg: "rgba(34,197,94,.12)",
        pillFg: "#86efac",
        iconBg: "rgba(34,197,94,.10)",
        bullet: "rgba(255,255,255,.6)",
        icon: <GiftIcon className="h-6 w-6 text-emerald-400" />,
        features: ["100% free registration", "Instant bonus access", "No verification required", "Risk-free rewards"],
      },
      {
        key: "pro",
        title: "Pro Package",
        subtitle: "Unlock premium bonuses with advanced reward strategies.",
        price: "€9.90",
        priceColor: "#e9d5ff", // purple-200
        pill: "Up to $500",
        pillBg: "rgba(168,85,247,.14)",
        pillFg: "#e9d5ff",
        iconBg: "rgba(168,85,247,.10)",
        bullet: "rgba(255,255,255,.6)",
        icon: <DiamondIcon className="h-6 w-6 text-fuchsia-300" />,
        features: [
          "Premium bonus offers", 
          "No-deposit rewards", 
          "Priority access", 
          "Advanced tracking tools",
          "Expert support"
        ],
        featured: true,
      },
      {
        key: "elite",
        title: "Elite Package",
        subtitle: "Maximum rewards with verified high-value offers.",
        price: "€29.90",
        priceColor: "#93c5fd", // blue-300
        pill: "Up to $300",
        pillBg: "rgba(59,130,246,.14)",
        pillFg: "#bfdbfe",
        iconBg: "rgba(59,130,246,.10)",
        bullet: "rgba(255,255,255,.6)",
        icon: <BankIcon className="h-6 w-6 text-blue-300" />,
        features: ["Deposit bonuses", "Verified offers", "Premium support", "Exclusive access"],
      },
    ],
    []
  );

  // Memoized callback to prevent unnecessary re-renders
  const handleAddToCart = useCallback(async (iconEl, pkg) => {
    if (!isAuthenticated) {
      alert('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }

    try {
      console.log('Adding to cart:', pkg.key);
      
      // Find the product by slug from the database
      const response = await api.get(`/products/${pkg.key}`);
      const product = response.data;
      
      console.log('Found product:', product);
      
      // Trigger fly-to-cart animation first, then add to cart
      flyToCart({
        sourceEl: iconEl,
        cartEl: cartRef?.current,
        reduceMotion,
        onFinish: async () => {
          try {
            await addToCart(product._id, 1);
            console.log('Added to cart successfully');
            openCart();
          } catch (addError) {
            console.error('Error adding to cart after animation:', addError);
            // Don't show alert for duplicate items, just open cart to show what's there
            if (addError.message === 'This package is already in your cart') {
              openCart();
              return;
            }
            alert(`Failed to add item to cart: ${addError.response?.data?.message || addError.message}`);
          }
        }
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      alert(`Failed to find product: ${error.response?.data?.message || error.message}`);
    }
  }, [isAuthenticated, navigate, addToCart, openCart, cartRef, reduceMotion]);

  return (
    <section
      id="packages"
      className="relative z-10 py-20 px-6 text-white"
      style={{ 
        contain: "layout paint style",
        background: 'linear-gradient(180deg, #0e0e15 0%, #0b0b10 100%)'
      }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight">Choose Your Package</h2>
          <p className="text-white/70 mt-3 mb-4">
            Explore verified signup rewards, crypto bonuses, fintech perks & more.
          </p>
          <p className="text-sm text-purple-400 font-medium">
            ✨ One-time purchase • No subscription • Lifetime access
          </p>
        </div>

        {/* Top-align so featured can be taller */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start max-w-5xl mx-auto">
          {pkgs.map((pkg) => (
            <Card
              key={pkg.key}
              pkg={pkg}
              featured={!!pkg.featured}
              reduceMotion={reduceMotion}
              onAdd={handleAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
