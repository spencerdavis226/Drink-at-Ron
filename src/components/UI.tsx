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
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="lengths">
      {[
        ["20", "20"],
        ["40", "40"],
        ["60", "60"],
        ["custom", "Custom"],
        ["endless", "∞"],
      ].map(([id, label]) => (
        <Button
          variant="choice"
          key={id}
          aria-label={
            id === "endless"
              ? "Endless"
              : id === "custom"
                ? "Custom deck size"
                : `${id} cards`
          }
          aria-pressed={id === value}
          onClick={() => onChange(id)}
        >
          {label}
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
          ×
        </IconButton>
      </div>
      {children}
    </dialog>
  );
}
