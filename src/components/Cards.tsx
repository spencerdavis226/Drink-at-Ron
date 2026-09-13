import React, { useEffect, useRef } from "react";
import type { CardDefinition } from "../game/types";
const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
export function CardFace({ card }: { card: CardDefinition }) {
  return (
    <>
      <span className="card-category">{card.category}</span>
      <img
        className="card-art"
        src={asset(
          card.artwork === "art/tankard.svg"
            ? "art/tankard.webp"
            : card.artwork,
        )}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = asset("art/tankard.webp");
        }}
        alt=""
      />
      <div className="card-copy">
        <h2>{card.title}</h2>
        <span className="divider">✦</span>
        <p>{card.rules}</p>
      </div>
    </>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="dialog-title"
    >
      <div className="dialog-head">
        <h2 id="dialog-title">{title}</h2>
        <button className="icon-button" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
