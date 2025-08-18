export function flyToCart({ sourceEl, cartEl, onFinish, reduceMotion }) {
  if (!sourceEl || !cartEl) { onFinish?.(); return; }
  if (reduceMotion) { onFinish?.(); return; }

  const s = sourceEl.getBoundingClientRect();
  const c = cartEl.getBoundingClientRect();

  const clone = sourceEl.cloneNode(true);
  Object.assign(clone.style, {
    position: "fixed",
    left: `${s.left}px`,
    top: `${s.top}px`,
    width: `${s.width}px`,
    height: `${s.height}px`,
    zIndex: 9999,
    pointerEvents: "none",
  });
  document.body.appendChild(clone);

  const dx = c.left + c.width / 2 - (s.left + s.width / 2);
  const dy = c.top + c.height / 2 - (s.top + s.height / 2);

  const anim = clone.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.6}px, ${dy * 0.7}px) scale(0.9)`, opacity: 0.9, offset: 0.6 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0.0 }
    ],
    { duration: 600, easing: "cubic-bezier(.22,.61,.36,1)" }
  );

  anim.onfinish = () => {
    clone.remove();
    cartEl.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }],
      { duration: 220, easing: "ease-out" }
    );
    const badge = cartEl.querySelector("[data-cart-badge]");
    badge?.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }],
      { duration: 240, easing: "ease-out" }
    );
    onFinish?.();
  };
}
