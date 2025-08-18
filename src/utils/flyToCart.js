// src/utils/flyToCart.js
export function flyGift({ sourceEl, cartEl, onArrive, reduceMotion, packageColor = "#22c55e" }) {
  if (!sourceEl || !cartEl) { onArrive?.(); return; }

  // Define neon colors based on package
  const neonColors = {
    "#22c55e": { primary: "#10b981", glow: "#34d399", trail: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"] }, // emerald neon
    "#e9d5ff": { primary: "#a855f7", glow: "#c084fc", trail: ["#a855f7", "#c084fc", "#ddd6fe", "#f3e8ff"] }, // purple neon  
    "#93c5fd": { primary: "#3b82f6", glow: "#60a5fa", trail: ["#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe"] }  // blue neon
  };
  
  const colors = neonColors[packageColor] || neonColors["#22c55e"];

  if (reduceMotion) {
    // minimal: tiny cart bump only
    receivePop(cartEl);
    onArrive?.();
    return;
  }

  const s = sourceEl.getBoundingClientRect();
  const c = cartEl.getBoundingClientRect();

  // 1) Extract: source icon does a slower pull-out cue with slight grow
  sourceEl.animate(
    [
      { transform: "scale(1)", offset: 0 },
      { transform: "scale(0.88)", offset: 0.3 },
      { transform: "scale(1.05)", offset: 1 }
    ],
    { duration: 400, easing: "ease-out" }
  );

  // Create the traveling clone with enhanced styling and dynamic colors
  const clone = sourceEl.cloneNode(true);
  Object.assign(clone.style, {
    position: "fixed",
    left: `${s.left + s.width/2 - s.width/2}px`,
    top: `${s.top + s.height/2 - s.height/2}px`,
    width: `${s.width}px`,
    height: `${s.height}px`,
    zIndex: 9999,
    pointerEvents: "none",
    willChange: "transform, opacity",
    filter: `drop-shadow(0 0 12px ${colors.primary}) drop-shadow(0 0 24px ${colors.glow}) drop-shadow(0 0 36px ${colors.glow}80)`,
    color: colors.primary,
  });
  document.body.appendChild(clone);

  // small glow behind the clone (cheap: no blur; just a translucent circle)
  const glow = document.createElement("div");
  Object.assign(glow.style, {
    position: "fixed",
    left: `${s.left + s.width/2 - 10}px`,
    top: `${s.top + s.height/2 - 10}px`,
    width: "20px",
    height: "20px",
    borderRadius: "9999px",
    background: "rgba(255,255,255,.18)",
    zIndex: 9998,
    pointerEvents: "none",
  });
  document.body.appendChild(glow);

  // Compute flight delta
  const dx = c.left + c.width / 2 - (s.left + s.width / 2);
  const dy = c.top + c.height / 2 - (s.top + s.height / 2);

  // 2) Extraction grow (pop out of button), then 3) dramatic curved flight (slower)
  const total = 1400; // ms - much slower overall
  const extract = 350; // longer extraction phase
  const flight = total - extract;

  // extraction (clone grows MUCH bigger and lifts more dramatically)
  clone.animate(
    [
      { transform: "translate(0,0) scale(0.2)", opacity: 0.0, offset: 0 },
      { transform: "translate(0,-40px) scale(2.5)", opacity: 1, offset: 0.7 },
      { transform: "translate(0,-45px) scale(2.2)", opacity: 1, offset: 1 },
    ],
    { duration: extract, easing: "cubic-bezier(.2,.9,.2,1)" }
  );
  glow.animate(
    [
      { transform: "scale(0.2)", opacity: 0.0 },
      { transform: "scale(1.4)", opacity: 0.25 },
      { transform: "scale(1.6)", opacity: 0.0 },
    ],
    { duration: extract + 120, easing: "ease-out" }
  );

  // Curved path via a mid control point offset (slight arc upward)
  const midX = dx * 0.55;
  const midY = dy * 0.55 - 80; // lift for arc

  // Create paint brush trail effect with overlapping flowing elements
  const trailParticles = [];
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement("div");
    const colorIndex = i % colors.trail.length;
    const width = Math.max(6, 24 - i * 0.4); // Wider for brush stroke
    const height = Math.max(3, 12 - i * 0.2); // Taller for flowing effect
    
    Object.assign(particle.style, {
      position: "fixed",
      left: `${s.left + s.width/2 - width/2}px`,
      top: `${s.top + s.height/2 - height/2}px`,
      width: `${width}px`,
      height: `${height}px`,
      borderRadius: "50%",
      background: `radial-gradient(ellipse at center, ${colors.trail[colorIndex]}dd, ${colors.trail[colorIndex]}88, ${colors.trail[colorIndex]}44)`,
      boxShadow: `0 0 ${width * 1.5}px ${colors.trail[colorIndex]}aa, 0 0 ${width * 3}px ${colors.glow}55`,
      zIndex: 9998 - i,
      pointerEvents: "none",
      opacity: 0.98 - (i * 0.02),
      filter: `blur(${Math.max(0, i * 0.1)}px)`, // Gradual blur for blending
    });
    document.body.appendChild(particle);
    trailParticles.push(particle);
  }

  const flightAnim = clone.animate(
    [
      { transform: "translate(0px, -45px) scale(2.2)", opacity: 1, offset: 0 },
      { transform: `translate(${midX}px, ${midY}px) scale(1.8)`, opacity: 0.95, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.5)`, opacity: 0.0, offset: 1 },
    ],
    { delay: extract, duration: flight, easing: "cubic-bezier(.22,.61,.2,1)" }
  );

  // Animate trail particles with overlapping timing for paint brush effect
  trailParticles.forEach((particle, index) => {
    const delay = extract + (index * 8); // Very close timing for overlap
    const trailDuration = flight - (index * 4); // Minimal duration offset
    const randomOffset = (Math.random() - 0.5) * 4; // Small random variation
    
    particle.animate(
      [
        { 
          transform: `translate(${randomOffset}px, -45px) scale(1)`, 
          opacity: 0.98 - (index * 0.02), 
          offset: 0 
        },
        { 
          transform: `translate(${midX * 0.95 + randomOffset}px, ${midY * 0.95}px) scale(0.9)`, 
          opacity: 0.8, 
          offset: 0.65 
        },
        { 
          transform: `translate(${dx * 0.99 + randomOffset}px, ${dy * 0.99}px) scale(0.4)`, 
          opacity: 0.0, 
          offset: 1 
        },
      ],
      { 
        delay, 
        duration: Math.max(trailDuration, 100), 
        easing: "cubic-bezier(.22,.61,.2,1)" 
      }
    );
  });

  flightAnim.onfinish = () => {
    clone.remove();
    glow.remove();
    // Clean up trail particles
    trailParticles.forEach(particle => particle.remove());
    receivePop(cartEl);
    onArrive?.();
  };
}

function receivePop(cartEl) {
  // cart bump
  cartEl.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }],
    { duration: 240, easing: "ease-out" }
  );
  // badge bump (if present)
  const badge = cartEl.querySelector("[data-cart-badge]");
  badge?.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }],
    { duration: 260, easing: "ease-out" }
  );
  // subtle burst ring
  const rect = cartEl.getBoundingClientRect();
  const ring = document.createElement("div");
  Object.assign(ring.style, {
    position: "fixed",
    left: `${rect.left + rect.width/2 - 12}px`,
    top: `${rect.top + rect.height/2 - 12}px`,
    width: "24px",
    height: "24px",
    borderRadius: "9999px",
    border: "2px solid rgba(255,255,255,.4)",
    zIndex: 9999,
    pointerEvents: "none",
  });
  document.body.appendChild(ring);
  const ringAnim = ring.animate(
    [
      { transform: "scale(0.6)", opacity: 0.9 },
      { transform: "scale(1.6)", opacity: 0.0 },
    ],
    { duration: 320, easing: "ease-out" }
  );
  ringAnim.onfinish = () => ring.remove();
}
