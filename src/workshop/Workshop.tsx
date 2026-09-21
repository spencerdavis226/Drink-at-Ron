import { useState } from "react";
import { validateCatalog } from "../content/catalog";
import { workshopCards as cards, workshopPacks as packs } from "./session";
import { Button } from "../components/UI";

import "./workshop.css";
const sizes = {
  "Small phone": { width: 320, height: 568 },
  "Phone 390": { width: 390, height: 844 },
  "Large phone": { width: 430, height: 932 },
  iPad: { width: 768, height: 1024 },
  Landscape: { width: 844, height: 390 },
  "Split view": { width: 375, height: 667 },
};
export default function Workshop() {
  const [selected, setSelected] = useState(() => {
      const id = new URLSearchParams(location.search).get("card");
      return cards.some((c) => c.id === id) ? id! : "core.house-special";
    }),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("all"),
    [pack, setPack] = useState("all"),
    [seed, setSeed] = useState("tavern-1"),
    [seedDraft, setSeedDraft] = useState("tavern-1"),
    [size, setSize] = useState<keyof typeof sizes>("Small phone"),
    [large, setLarge] = useState(false),
    [revealed, setRevealed] = useState(true),
    [outcome, setOutcome] = useState("Seeded"),
    [nonce, setNonce] = useState(0);
  let validation = "All cards validate";
  try {
    validateCatalog(cards, packs);
  } catch (e) {
    validation = String(e);
  }
  const shown = cards.filter(
    (c) =>
      (category === "all" || c.category === category) &&
      (pack === "all" ||
        packs.find((p) => p.id === pack)?.cardIds.includes(c.id)) &&
      `${c.title} ${c.rules}`.toLowerCase().includes(query.toLowerCase()),
  );
  const card = cards.find((c) => c.id === selected)!;
  const { width, height } = sizes[size];
  // The preview is a real dev-only page in an iframe: it gets true viewport and
  // media conditions, its own document for the body-portalled dice overlay, and
  // never touches the saved-game app.
  const src = `${import.meta.env.BASE_URL}?${new URLSearchParams({
    preview: "1",
    card: selected,
    seed,
    outcome,
    revealed: revealed ? "1" : "0",
    enlarged: large ? "1" : "0",
    n: String(nonce),
  })}`;
  return (
    <div className="workshop">
      <header>
        <h1>Card workshop</h1>
        <p>Approved frame · production preview</p>
        <a href="?">Return to game</a>
      </header>
      <aside>
        <label>
          Search
          <input
            aria-label="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          Category
          <select
            aria-label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {["all", "sip", "group", "category", "challenge", "rule"].map(
              (c) => (
                <option key={c}>{c}</option>
              ),
            )}
          </select>
        </label>
        <label>
          Pack
          <select
            aria-label="Pack"
            value={pack}
            onChange={(e) => setPack(e.target.value)}
          >
            <option value="all">All packs</option>
            {packs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Card
          <select
            aria-label="Card"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {!shown.some((c) => c.id === selected) && (
              <option aria-label="Card" value={selected}>
                {card.title}
              </option>
            )}
            {shown.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Viewport
          <select
            aria-label="Viewport"
            value={size}
            onChange={(e) => setSize(e.target.value as keyof typeof sizes)}
          >
            {Object.keys(sizes).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Dice outcome
          <select
            aria-label="Dice outcome"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
          >
            {["Seeded", "Minimum", "Maximum"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Seed
          <input
            aria-label="Seed"
            value={seedDraft}
            onChange={(e) => setSeedDraft(e.target.value)}
            onBlur={() => setSeed(seedDraft)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setSeed(seedDraft);
            }}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={large}
            onChange={(e) => setLarge(e.target.checked)}
          />{" "}
          Enlarged text
        </label>
        <p>
          {shown.length} cards · {validation}
        </p>
        <p>{card.id}</p>
        <p>{card.illustrationBrief}</p>
        <nav aria-label="Study examples">
          {[
            "core.house-special",
            "core.categories",
            "core.rulemaster",
            "core.dice-tax",
            "core.fuck-around",
          ].map((id) => (
            <Button key={id} onClick={() => setSelected(id)}>
              {cards.find((c) => c.id === id)!.title}
            </Button>
          ))}
        </nav>
      </aside>
      <main>
        <div className="workshop-actions">
          <Button
            onClick={() => {
              setRevealed(false);
              setNonce((n) => n + 1);
            }}
          >
            Replay reveal
          </Button>
          <Button
            onClick={() => {
              setRevealed(true);
              setNonce((n) => n + 1);
            }}
          >
            Front
          </Button>
        </div>
        <div className="workshop-viewport" style={{ width, height }}>
          <iframe
            className="workshop-frame"
            title={`${card.title} preview`}
            src={src}
            width={width}
            height={height}
          />
        </div>
      </main>
    </div>
  );
}
