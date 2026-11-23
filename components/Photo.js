"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Photo({ src, alt, className, fallback, zoomable = true }) {
  const [ok, setOk] = useState(true);
  const [zoomed, setZoomed] = useState(false);
  const zoomRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setZoomed(false);
    };
    if (zoomed) {
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [zoomed]);

  if (!src || !ok) return fallback || null;

  const img = (
    <img
      className={className}
      src={src}
      alt={alt || ""}
      loading="lazy"
      onError={() => setOk(false)}
      onClick={() => zoomable && setZoomed(true)}
      style={zoomable ? { cursor: "zoom-in" } : {}}
    />
  );

  if (!zoomed) return img;

  const modal = (
    <div
      className="photo-zoom-modal"
      onClick={() => setZoomed(false)}
      role="dialog"
      aria-modal="true"
      aria-label={`Zoomed image: ${alt}`}
    >
      <div className="photo-zoom-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="photo-zoom-close"
          onClick={() => setZoomed(false)}
          aria-label="Close zoomed image"
        >
          ✕
        </button>
        <img
          ref={zoomRef}
          src={src}
          alt={alt || ""}
          style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain" }}
        />
        {alt && <p className="photo-zoom-caption">{alt}</p>}
      </div>
    </div>
  );

  return createPortal(
    <>
      {img}
      {modal}
    </>,
    document.body
  );
}