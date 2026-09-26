import {
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ImgHTMLAttributes,
  type ReactNode,
} from "react";
import { PackLogo } from "./PackMarks";
import { asset, theme } from "../presentation/theme";
import type { PackDefinition } from "../game/types";
import type { DeckChoice } from "../app/persistence";
export function Button({
  variant = "primary",
  className = "",
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "text-button" | "menu-row" | "icon-button" | "choice";
}) {
  return (
    <button
      {...props}
      className={`${variant} ${className}`}
      onClick={(e) => {
        e.currentTarget.focus({ preventScroll: true });
        onClick?.(e);
      }}
    />
  );
}
export function IconButton({
  label,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
}) {
  return (
    <Button variant="icon-button" aria-label={label} {...props}>
      {children}
    </Button>
  );
}
export function InstallIcon() {
  return (
    <svg className="ui-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v11m0 0 4-4m-4 4-4-4" />
      <path d="M5 15v3.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V15" />
    </svg>
  );
}
export function CloseIcon() {
  return (
    <svg className="ui-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />
    </svg>
  );
}
export function Notice({ children }: { children: ReactNode }) {
  return (
    <p className="notice" role="status">
      {children}
    </p>
  );
}
export function Artwork({
  src,
  fallback = asset(theme.assets.tankard),
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { fallback?: string }) {
  return (
    <img
      {...props}
      src={src}
      onError={(e) => {
        if (e.currentTarget.dataset.fallback) {
          e.currentTarget.style.visibility = "hidden";
          return;
        }
        e.currentTarget.dataset.fallback = "true";
        e.currentTarget.src = fallback;
      }}
    />
  );
}
export function PackTile({
  pack,
  selected,
  onToggle,
}: {
  pack: PackDefinition;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      variant="choice"
      className="pack"
      aria-pressed={selected}
      onClick={onToggle}
    >
      <span className="pack-art">
        <Artwork src={asset(pack.artwork ?? theme.assets.tankard)} alt="" />
      </span>
      <span className="pack-copy">
        <strong>{pack.title}</strong>
        <PackLogo pack={pack} decorative />
      </span>
      <span className="checkbox" aria-hidden="true">
        {selected ? "✓" : "+"}
      </span>
    </Button>
  );
}
export function DeckChoices({
  value,
  onChange,
}: {
  value: DeckChoice;
  onChange: (value: DeckChoice) => void;
}) {
  return (
    <div className="lengths" role="group" aria-label="Game length">
      {[
        ["short", "Short", "30 cards"],
        ["long", "Long", "60 cards"],
        ["infinite", "Infinite", "Keeps going"],
      ].map(([id, label, detail]) => (
        <Button
          variant="choice"
          key={id}
          aria-label={`${label}, ${detail}`}
          aria-pressed={id === value}
          onClick={() => onChange(id as DeckChoice)}
        >
          <strong>{label}</strong>
          <small>{detail}</small>
        </Button>
      ))}
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  exiting = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  exiting?: boolean;
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
  }, [title]);
  return (
    <dialog
      ref={ref}
      className={exiting ? "closing" : ""}
      // An exiting dialog must not accept input or focus while it animates out.
      inert={exiting || undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="dialog-title"
    >
      <div className="dialog-head">
        <h2 id="dialog-title">{title}</h2>
        <IconButton label="Close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>
      {children}
    </dialog>
  );
}
