"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface Props {
  images: string[];
  name: string;
  discount: number;
  badge?: string;
  isRefurbished?: boolean;
}

export default function ProductGallery({ images, name, discount, badge, isRefurbished }: Props) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setActive((a) => (a + 1) % images.length);
      else setActive((a) => (a - 1 + images.length) % images.length);
    }
    setTouchStart(null);
  };

  return (
    <div className="md:col-span-5">
      {/* Main image */}
      <div
        ref={imgRef}
        className="relative rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm cursor-zoom-in select-none"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="bg-orange-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
              -{discount}%
            </span>
          )}
          {badge === "Nouveau" && (
            <span className="bg-emerald-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
              NOUVEAU
            </span>
          )}
          {isRefurbished && (
            <span className="bg-emerald-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
              OCCASION
            </span>
          )}
        </div>

        {/* Image counter — mobile only */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 z-10 md:hidden bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full pointer-events-none">
            {active + 1}/{images.length}
          </div>
        )}

        {/* Zoom hint — desktop only */}
        {!zoomed && (
          <div className="absolute bottom-3 right-3 z-10 hidden md:flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-gray-100 text-gray-400 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg shadow-sm pointer-events-none">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            Survoler pour zoomer
          </div>
        )}

        {/* Left / Right tap zones — mobile only */}
        {images.length > 1 && (
          <>
            <button
              className="absolute left-0 top-0 h-full w-1/4 z-10 md:hidden"
              aria-label="Image précédente"
              onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}
            />
            <button
              className="absolute right-0 top-0 h-full w-1/4 z-10 md:hidden"
              aria-label="Image suivante"
              onClick={() => setActive((a) => (a + 1) % images.length)}
            />
          </>
        )}

        {/* Main image */}
        <div className="aspect-square flex items-center justify-center p-4 overflow-hidden">
          <Image
            key={active}
            src={images[active]}
            alt={name}
            width={480}
            height={480}
            className="object-contain w-full h-full transition-transform duration-200"
            style={
              zoomed
                ? {
                    transform: "scale(2.2)",
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transition: "transform-origin 0ms",
                  }
                : {}
            }
            priority
          />
        </div>
      </div>

      {/* Mobile dot indicators */}
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3 md:hidden">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Image ${i + 1}`}
              className={`rounded-full transition-all duration-200 ${
                active === i ? "w-5 h-1.5 bg-orange-500" : "w-1.5 h-1.5 bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}

      {/* Mobile thumbnail strip */}
      {images.length > 1 && (
        <div className="flex md:hidden gap-2 mt-2 overflow-x-auto pb-1 scrollbar-none">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-14 h-14 shrink-0 rounded-xl border-2 overflow-hidden flex items-center justify-center bg-white transition-all ${
                active === i
                  ? "border-orange-500 shadow-md shadow-orange-100"
                  : "border-gray-200 opacity-60"
              }`}
            >
              <Image src={img} alt={`Vue ${i + 1}`} width={48} height={48} className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}

      {/* Desktop thumbnails + arrows */}
      {images.length > 1 && (
        <div className="hidden md:flex items-center gap-2 mt-3">
          <button
            onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}
            className="w-9 h-9 shrink-0 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm hover:border-orange-400 hover:shadow transition-all"
            aria-label="Image précédente"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex gap-2 flex-1 overflow-x-auto pb-0.5">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-16 h-16 shrink-0 rounded-xl border-2 overflow-hidden flex items-center justify-center bg-white transition-all ${
                  active === i
                    ? "border-orange-500 shadow-md shadow-orange-100"
                    : "border-gray-200 hover:border-orange-300 opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img} alt={`Vue ${i + 1}`} width={56} height={56} className="object-contain p-1" />
              </button>
            ))}
          </div>

          <button
            onClick={() => setActive((a) => (a + 1) % images.length)}
            className="w-9 h-9 shrink-0 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm hover:border-orange-400 hover:shadow transition-all"
            aria-label="Image suivante"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

