# Secondary-screen evidence — 2026-09-20

Before/after captures for task 1D (`../STATUS.md`). Chromium, 390×844 CSS px,
device scale factor 1, dev server. Layout/appearance evidence only; not a
performance or physical-device measurement.

- `*-setup-default-phone.png` — the unselected Dice pack. Before, it was so
  desaturated and dimmed (`saturate(0.3); opacity: 0.65`) that it read as
  disabled. After, it stays fully readable and only the selection mark changes
  (`+` muted vs `✓` gold), with a subtle ring on the selected tile.
- `*-setup-swapped-phone.png` — the same tiles with the selection reversed; the
  title/pack-mark slot stays stable when the Core name wraps to two lines.
- `*-pause-phone.png` — the menu panel. Before, the high-contrast `panel.webp`
  fill sat behind the body copy. After, the frame keeps its painted border while
  the interior is scrimmed for readable text.
- `*-dice-cta-phone.png` — the Roll control. Before, a smooth teal gradient pill
  unlike the rest of the UI. After, the painted `button.webp` surface used by
  Play and the menu.
