"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import styles from "./ProductGallery.module.css";

interface Props {
  images: string[];
  name: string;
  discount: number;
  badge?: string;
  isRefurbished?: boolean;
}

export default function ProductGallery({ images: sourceImages, name, discount, badge, isRefurbished }: Props) {
  const [active, setActive] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const images = [...new Set(sourceImages.filter((image) => image && !failedImages.includes(image)))];
  const selected = Math.min(active, Math.max(0, images.length - 1));
  const removeImage = (source: string) => {
    setFailedImages((failed) => failed.includes(source) ? failed : [...failed, source]);
    setActive(0);
  };
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
    if (images.length < 2) { setTouchStart(null); return; }
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setActive((a) => (a + 1) % images.length);
      else setActive((a) => (a - 1 + images.length) % images.length);
    }
    setTouchStart(null);
  };

  return (
    <div>
      {/* Main image */}
      <div
        ref={imgRef}
        className={styles.stage}
        onPointerEnter={(e) => { if (e.pointerType === "mouse") setZoomed(true); }}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className={styles.discount}>
              -{discount}%
            </span>
          )}
          {badge === "Nouveau" && (
            <span className="bg-emerald-500 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-sm">
              NOUVEAU
            </span>
          )}
          {isRefurbished && (
            <span className="bg-emerald-500 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-sm">
              OCCASION
            </span>
          )}
        </div>

        {/* Image counter — mobile only */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 z-10 md:hidden bg-white/90 border border-slate-200/70 text-slate-500 text-[10px] font-medium px-2.5 py-1.5 rounded-lg pointer-events-none" aria-live="polite">
            {selected + 1}/{images.length}
          </div>
        )}

        {/* Zoom hint — desktop only */}
        {!zoomed && (
          <div className="absolute bottom-3 right-3 z-10 hidden md:flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-slate-100 text-slate-400 text-[10px] font-semibold px-2.5 py-1.5 rounded-md shadow-sm pointer-events-none">
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
        <div className={styles.frame}>
          {images.length > 0 ? <Image
            key={images[selected]}
            src={images[selected]}
            alt={name}
            width={480}
            height={480}
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-contain w-full h-full mix-blend-multiply transition-transform duration-200"
            style={
              zoomed
                ? {
                    transform: "scale(2.2)",
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transition: "transform-origin 0ms",
                  }
                : {}
            }
            onError={() => removeImage(images[selected])}
            preload
          /> : <div className={styles.unavailable} role="status"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="15" cy="8" r="1"/></svg><span>Photo bientôt disponible</span></div>}
        </div>
      </div>

      {/* Desktop thumbnails + arrows */}
      {images.length > 1 && (
        <div className={styles.navigation}>
          <button
            onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}
            className={styles.arrow}
            aria-label="Image précédente"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className={styles.thumbnails}>
            {images.map((img, i) => (
              <button
                key={i}
                aria-label={`Afficher la vue ${i + 1}`}
                aria-pressed={selected === i}
                onClick={() => setActive(i)}
                className={`${styles.thumbnail} ${selected === i ? styles.selected : ""}`}
              >
                <Image src={img} alt="" width={56} height={56} sizes="56px" onError={() => removeImage(img)} className="object-contain p-1" />
              </button>
            ))}
          </div>

          <button
            onClick={() => setActive((a) => (a + 1) % images.length)}
            className={styles.arrow}
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

