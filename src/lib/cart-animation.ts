function isVisible(element: Element) {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight
    && rect.right > 0 && rect.left < window.innerWidth;
}

export function flyProductToCart(imageUrl: string, name: string, origin?: HTMLElement | null): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const target = Array.from(document.querySelectorAll('[data-cart-target], a[href="/panier"]')).find(isVisible);
  const image = origin instanceof HTMLImageElement ? origin
    : Array.from(document.querySelectorAll<HTMLImageElement>("main img")).find((img) => img.alt === name && isVisible(img));
  const source = image ?? origin;
  if (!target || !source || !isVisible(source) || typeof source.animate !== "function") return () => {};

  const from = source.getBoundingClientRect();
  const to = (target.querySelector("svg") ?? target).getBoundingClientRect();
  const size = Math.min(100, from.width, from.height);
  const startX = from.left + from.width / 2 - size / 2;
  const startY = from.top + from.height / 2 - size / 2;
  const dx = to.left + to.width / 2 - (startX + size / 2);
  const dy = to.top + to.height / 2 - (startY + size / 2);
  const flying = document.createElement("img");
  flying.src = image?.currentSrc || imageUrl;
  flying.alt = "";
  flying.setAttribute("aria-hidden", "true");
  Object.assign(flying.style, {
    position: "fixed", left: `${startX}px`, top: `${startY}px`, width: `${size}px`, height: `${size}px`,
    objectFit: "contain", borderRadius: "16px", background: "#fff", padding: "8px",
    boxShadow: "0 10px 32px #14203530", pointerEvents: "none", zIndex: "1000",
  });
  document.body.appendChild(flying);
  const flight = flying.animate([
    { transform: "translate(0, 0) scale(1)", opacity: 1 },
    { transform: `translate(${dx * .45}px, ${dy * .45 - 60}px) scale(.85)`, opacity: 1, offset: .45 },
    { transform: `translate(${dx}px, ${dy}px) scale(.15)`, opacity: 0 },
  ], { duration: 750, easing: "cubic-bezier(.3,.05,.25,1)", fill: "forwards" });
  let pulse: Animation | undefined;
  flight.finished.then(() => {
    flying.remove();
    if (target.isConnected) pulse = target.animate([
      { transform: "scale(1)" }, { transform: "scale(1.15)" }, { transform: "scale(1)" },
    ], { duration: 300, easing: "ease-out" });
  }).catch(() => flying.remove());
  return () => { flight.cancel(); pulse?.cancel(); flying.remove(); };
}
