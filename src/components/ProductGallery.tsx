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
  const imgRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="md:col-span-5">
      {/* Main image */}
      <div
        ref={imgRef}
        className="relative rounded-2xl border border-gray-100 overflow-hidden bg-gray-50 cursor-zoom-in select-none"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="bg-orange-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow">
              Offre -{discount}%
            </span>
          )}
          {badge === "Nouveau" && (
            <span className="bg-green-600 text-white text-xs font-black px-2.5 py-1 rounded">
              NOUVEAUTÉ
            </span>
          )}
          {isRefurbished && (
            <span className="bg-green-600 text-white text-xs font-black px-2.5 py-1 rounded">
              OCCASION
            </span>
          )}
        </div>

        {/* Zoom hint */}
        {!zoomed && (
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-gray-100 text-gray-500 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg shadow-sm pointer-events-none">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            Survoler pour zoomer
          </div>
        )}

        {/* Main image */}
        <div className="aspect-square flex items-center justify-center p-8 overflow-hidden">
          <Image
            src={images[active]}
            alt={name}
            width={420}
            height={420}
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

      {/* Thumbnails + arrows */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 mt-3">
          {/* Prev */}
          <button
            onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}
            className="w-9 h-9 shrink-0 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm hover:border-orange-400 hover:shadow transition-all"
            aria-label="Image précédente"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Thumbnails */}
          <div className="flex gap-2 flex-wrap flex-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex items-center justify-center bg-gray-50 transition-all ${
                  active === i
                    ? "border-orange-500 shadow-md shadow-orange-100"
                    : "border-gray-200 hover:border-orange-300 opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img} alt={`Vue ${i + 1}`} width={56} height={56} className="object-contain" />
              </button>
            ))}
          </div>

          {/* Next */}
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
