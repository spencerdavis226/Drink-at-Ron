import type { Preferences } from "../app/persistence";
import type { PackDefinition } from "../game/types";
import { Button, DeckChoices, Notice, PackTile } from "../components/UI";
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
  const selected = prefs.config.packIds.filter((id) =>
    packs.some((p) => p.id === id),
  );
  const valid =
    /^\d+$/.test(prefs.customSize) &&
    Number(prefs.customSize) >= 1 &&
    Number(prefs.customSize) <= 500;
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
          <h2>Deck size</h2>
        </div>
        <DeckChoices
          value={prefs.choice}
          onChange={(choice) => onChange({ ...prefs, choice })}
        />
        {prefs.choice === "custom" && (
          <label className="custom-label">
            Number of cards
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="500"
              value={prefs.customSize}
              onChange={(e) =>
                onChange({ ...prefs, customSize: e.target.value })
              }
              aria-invalid={!valid}
            />
            {!valid && (
              <span role="alert">Enter a whole number from 1 to 500.</span>
            )}
          </label>
        )}
      </div>
      <div className="setup-section">
        <div className="section-label">
          <h2>Packs</h2>
        </div>
        {packs.map((pack) => (
          <PackTile
            key={pack.id}
            pack={pack}
            selected={selected.includes(pack.id)}
            onToggle={() =>
              onChange({
                ...prefs,
                config: {
                  ...prefs.config,
                  packIds: selected.includes(pack.id)
                    ? selected.filter((id) => id !== pack.id)
                    : [...selected, pack.id],
                },
              })
            }
          />
        ))}
        {packs
          .filter((pack) => selected.includes(pack.id) && pack.setupHint)
          .map((pack) => (
            <p className="pack-hint" key={`${pack.id}-hint`}>
              {pack.setupHint}
            </p>
          ))}
      </div>
      <Button
        disabled={!selected.length || (prefs.choice === "custom" && !valid)}
        onClick={onStart}
      >
        Play
      </Button>
      {!selected.length && <Notice>Choose at least one pack to play.</Notice>}
    </section>
  );
}
