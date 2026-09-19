import { useState, useRef } from "react";
import { validateCatalog } from "../content/catalog";
import { PresentationController } from "../presentation/controller";
import { usePresentation } from "../presentation/usePresentation";
import { Play } from "../screens/Play";
import {
  workshopCards as cards,
  workshopPacks as packs,
  workshopSession,
  seededRandom,
} from "./session";
import { Button } from "../components/UI";

import "./workshop.css";
const sizes = {
  "Small phone": 320,
  "Phone 390": 390,
  "Large phone": 430,
  iPad: 768,
  Landscape: 844,
  "Split view": 375,
};
function Preview({
  id,
  seed,
  large,
  width,
  study,
  outcome,
}: {
  id: string;
  seed: string;
  large: boolean;
  width: number;
  study: boolean;
  outcome: string;
}) {
  const [initial] = useState(() => workshopSession(seed, id));
  const random = useRef(initial.random);
  const diceRandom = useRef(seededRandom(`${seed}:dice`));
  const state = usePresentation(
    () =>
      new PresentationController(
        initial.session,
        () => {},
        () => {},
        () => random.current(),
        () =>
          outcome === "Minimum"
            ? 0
            : outcome === "Maximum"
              ? 0.999999
              : diceRandom.current(),
      ),
  );
  const { controller, session, outgoing, motion, transition } = state;
  return (
    <>
      <div className="workshop-actions">
        <Button
          onClick={() => {
            controller.settleAll();
            const next = workshopSession(seed, id, false);
            random.current = next.random;
            controller.start(next.session);
          }}
        >
          Replay reveal
        </Button>
        <Button
          onClick={() => {
            controller.settleAll();
            const next = workshopSession(seed, id, true);
            random.current = next.random;
            controller.start(next.session);
          }}
        >
          Front
        </Button>
      </div>
      <div
        className={`workshop-viewport ${large ? "enlarged" : ""} ${study ? "study" : ""}`}
        style={{ width, maxWidth: "100%" }}
      >
        <Play
          session={(outgoing ?? session)!}
          motion={motion}
          transition={transition}
          onTap={() => controller.tap()}
          onFinish={controller.finish.bind(controller)}
        />
      </div>
    </>
  );
}
export default function Workshop() {
  const [selected, setSelected] = useState(() => {
      const id = new URLSearchParams(location.search).get("card");
      return cards.some((c) => c.id === id) ? id! : "core.cheers";
    }),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("all"),
    [pack, setPack] = useState("all"),
    [seed, setSeed] = useState("tavern-1"),
    [size, setSize] = useState<keyof typeof sizes>("Small phone"),
    [large, setLarge] = useState(false),
    [study, setStudy] = useState(true),
    [outcome, setOutcome] = useState("Seeded");
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
  return (
    <div className="workshop">
      <header>
        <h1>Card workshop</h1>
        <p>Approved frame · dice interaction study</p>
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
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
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
        <label>
          <input
            type="checkbox"
            checked={study}
            onChange={(e) => setStudy(e.target.checked)}
          />{" "}
          New front study
        </label>
        <p>
          {shown.length} cards · {validation}
        </p>
        <p>{card.id}</p>
        <p>{card.illustrationBrief}</p>
        <nav aria-label="Study examples">
          {[
            "core.cheers",
            "core.animals",
            "core.left",
            "core.dice-toast-study",
            "core.dice-title-study",
          ].map((id) => (
            <Button key={id} onClick={() => setSelected(id)}>
              {cards.find((c) => c.id === id)!.title}
            </Button>
          ))}
        </nav>
      </aside>
      <main>
        <Preview
          key={`${selected}:${seed}:${study}:${outcome}`}
          id={selected}
          seed={seed}
          large={large}
          width={sizes[size]}
          study={study}
          outcome={outcome}
        />
      </main>
    </div>
  );
}
