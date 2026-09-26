import { useState } from "react";
import type { Preferences } from "../app/persistence";
import type { PackDefinition } from "../game/types";
import { Button, DeckChoices, Modal, PackTile } from "../components/UI";

export function Setup({
  prefs,
  packs,
  onChange,
  onStart,
}: {
  prefs: Preferences;
  packs: PackDefinition[];
  onChange: (prefs: Preferences) => void;
  onStart: () => void;
}) {
  const [packsOpen, setPacksOpen] = useState(false);
  const selected = packs.filter((pack) =>
    prefs.config.packIds.includes(pack.id),
  );
  const toggle = (id: string) => {
    const next = new Set(prefs.config.packIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({
      ...prefs,
      config: {
        ...prefs.config,
        packIds: packs.filter((pack) => next.has(pack.id)).map((p) => p.id),
      },
    });
  };
  return (
    <section className="setup">
      <div className="intro">
        <h1>
          Drink
          <br />
          <em>at Ron</em>
        </h1>
      </div>
      <div className="setup-section">
        <div className="section-label">
          <h2>How long?</h2>
        </div>
        <DeckChoices
          value={prefs.choice}
          onChange={(choice) => onChange({ ...prefs, choice })}
        />
      </div>
      <div className="setup-section setup-packs">
        <div className="section-label">
          <h2>Card packs</h2>
        </div>
        <Button
          variant="menu-row"
          className="pack-selector"
          onClick={() => setPacksOpen(true)}
        >
          <span>
            <strong>Choose packs</strong>
            <small>
              {selected.length
                ? selected.map((pack) => pack.title).join(", ")
                : "Pick at least one"}
            </small>
          </span>
          <span aria-hidden="true">›</span>
        </Button>
      </div>
      <Button onClick={onStart} disabled={!selected.length}>
        Play
      </Button>
      {packsOpen && (
        <Modal title="Card packs" onClose={() => setPacksOpen(false)}>
          <div className="addon-list">
            {packs.map((pack) => (
              <div key={pack.id}>
                <PackTile
                  pack={pack}
                  selected={selected.includes(pack)}
                  onToggle={() => toggle(pack.id)}
                />
                {selected.includes(pack) && pack.setupHint && (
                  <p className="pack-hint">{pack.setupHint}</p>
                )}
              </div>
            ))}
          </div>
          <Button onClick={() => setPacksOpen(false)}>Done</Button>
        </Modal>
      )}
    </section>
  );
}
