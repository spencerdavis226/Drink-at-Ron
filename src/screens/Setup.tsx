import { useState } from "react";
import type { Preferences } from "../app/persistence";
import type { PackDefinition } from "../game/types";
import { Button, DeckChoices, Modal, PackTile } from "../components/UI";
import { PackLogo } from "../components/PackMarks";

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
  const core = packs.find((pack) => pack.id === "core");
  const addons = packs.filter((pack) => pack.id !== "core");
  const selected = addons.filter((pack) =>
    prefs.config.packIds.includes(pack.id),
  );
  const toggle = (id: string) => {
    const addonIds = new Set(selected.map((pack) => pack.id));
    if (addonIds.has(id)) addonIds.delete(id);
    else addonIds.add(id);
    onChange({
      ...prefs,
      config: {
        ...prefs.config,
        packIds: [
          "core",
          ...addons
            .filter((pack) => addonIds.has(pack.id))
            .map((pack) => pack.id),
        ],
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
            <strong>Choose add-ons</strong>
            <small>
              {selected.length
                ? selected.map((pack) => pack.title).join(", ")
                : "Core deck only"}
            </small>
          </span>
          <span aria-hidden="true">›</span>
        </Button>
      </div>
      <Button onClick={onStart}>Play</Button>
      {packsOpen && (
        <Modal title="Card packs" onClose={() => setPacksOpen(false)}>
          {core && (
            <div className="included-pack">
              <PackLogo pack={core} decorative />
              <span>{core.title}</span>
              <small>Always included</small>
            </div>
          )}
          <div className="addon-list">
            {addons.map((pack) => (
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
