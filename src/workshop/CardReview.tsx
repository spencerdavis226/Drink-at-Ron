import { useEffect, useMemo, useRef, useState } from "react";
import type { CardDefinition } from "../game/types";
import { workshopCards as cards, workshopPacks as packs } from "./session";
import "./card-review.css";

const STORAGE_KEY = "drink-at-ron.card-review.v1";
type DecisionStatus = "approved" | "change" | "denied";
type Decision = {
  status: DecisionStatus;
  proposedTitle?: string;
  proposedRules?: string;
  note?: string;
  updatedAt: string;
};
type Decisions = Record<string, Decision>;

function readDecisions(): Decisions {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([id, value]) =>
          cards.some((card) => card.id === id) &&
          value &&
          typeof value === "object" &&
          ["approved", "change", "denied"].includes((value as Decision).status),
      ),
    ) as Decisions;
  } catch {
    return {};
  }
}

function diceLabel(card: CardDefinition) {
  return card.dice ? `${card.dice.count}d${card.dice.sides}` : "";
}

function handoffMarkdown(decisions: Decisions) {
  const reviewed = cards.filter((card) => decisions[card.id]);
  const statusCount = (status: DecisionStatus) =>
    reviewed.filter((card) => decisions[card.id].status === status).length;
  const field = (value: string | undefined) => JSON.stringify(value ?? "");
  const lines = [
    "# Drink at Ron card review handoff",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Catalog: ${cards.length} cards`,
    `Reviewed: ${reviewed.length}`,
    `Approved: ${statusCount("approved")}`,
    `Change requested: ${statusCount("change")}`,
    `Denied: ${statusCount("denied")}`,
    `Unreviewed: ${cards.length - reviewed.length}`,
    "",
    "## Instructions for Codex",
    "",
    "Apply only the explicit Change and Deny decisions below. Preserve card IDs for copy edits. Treat Deny as a request to remove the card from its pack and catalog. Check dice instructions whenever title or rules copy changes. Do not infer edits for Approved or Unreviewed cards.",
    "",
    "## Change requests",
    "",
  ];
  const appendCard = (card: CardDefinition, decision: Decision) => {
    const pack = packs.find((candidate) => candidate.cardIds.includes(card.id));
    lines.push(
      `### ${card.id}`,
      "",
      `- Pack: ${field(pack?.title)}`,
      `- Category: ${field(card.category)}`,
      `- Dice: ${field(diceLabel(card) || "none")}`,
      `- Current title: ${field(card.title)}`,
      `- Requested title: ${field(decision.proposedTitle ?? card.title)}`,
      `- Current rules: ${field(card.rules)}`,
      `- Requested rules: ${field(decision.proposedRules ?? card.rules)}`,
      `- Reviewer note: ${field(decision.note)}`,
      "",
    );
  };
  const changed = reviewed.filter(
    (card) => decisions[card.id].status === "change",
  );
  if (!changed.length) lines.push("None.", "");
  for (const card of changed) appendCard(card, decisions[card.id]);
  lines.push("## Denied cards", "");
  const denied = reviewed.filter(
    (card) => decisions[card.id].status === "denied",
  );
  if (!denied.length) lines.push("None.", "");
  for (const card of denied) {
    const decision = decisions[card.id];
    lines.push(
      `### ${card.id}`,
      "",
      `- Title: ${field(card.title)}`,
      `- Rules: ${field(card.rules)}`,
      `- Reviewer note: ${field(decision.note)}`,
      "",
    );
  }
  const approvedNotes = reviewed.filter(
    (card) =>
      decisions[card.id].status === "approved" &&
      decisions[card.id].note?.trim(),
  );
  lines.push("## Notes on approved cards", "");
  if (!approvedNotes.length) lines.push("None.", "");
  for (const card of approvedNotes)
    lines.push(
      `- ${card.id} (${card.title}): ${field(decisions[card.id].note)}`,
    );
  lines.push("", "## Approved card IDs", "");
  lines.push(
    reviewed
      .filter((card) => decisions[card.id].status === "approved")
      .map((card) => `- ${card.id}`)
      .join("\n") || "None.",
    "",
  );
  return lines.join("\n");
}

function download(name: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function CardReview() {
  const [decisions, setDecisions] = useState<Decisions>(readDecisions);
  const [selected, setSelected] = useState(() => {
    const requested = new URLSearchParams(location.search).get("card");
    return cards.some((card) => card.id === requested)
      ? requested!
      : cards[0].id;
  });
  const [query, setQuery] = useState("");
  const [pack, setPack] = useState("all");
  const [status, setStatus] = useState("all");
  const [diceOnly, setDiceOnly] = useState(false);
  const [message, setMessage] = useState("Review autosaves in this browser.");
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));
      setMessage("Saved locally.");
    } catch {
      setMessage("Could not save locally. Download a backup before leaving.");
    }
  }, [decisions]);

  const shown = useMemo(
    () =>
      cards.filter((card) => {
        const decision = decisions[card.id];
        const searchable =
          `${card.id} ${card.title} ${card.rules}`.toLowerCase();
        return (
          searchable.includes(query.trim().toLowerCase()) &&
          (pack === "all" ||
            packs
              .find((candidate) => candidate.id === pack)
              ?.cardIds.includes(card.id)) &&
          (status === "all" ||
            (status === "unreviewed"
              ? !decision
              : decision?.status === status)) &&
          (!diceOnly || !!card.dice)
        );
      }),
    [decisions, diceOnly, pack, query, status],
  );
  const card = cards.find((candidate) => candidate.id === selected) ?? cards[0];
  const decision = decisions[card.id];
  const reviewed = cards.filter((candidate) => decisions[candidate.id]).length;
  const count = (value: DecisionStatus) =>
    cards.filter((candidate) => decisions[candidate.id]?.status === value)
      .length;
  const setDecision = (next: Partial<Decision> & { status: DecisionStatus }) =>
    setDecisions((current) => ({
      ...current,
      [card.id]: {
        ...current[card.id],
        ...next,
        updatedAt: new Date().toISOString(),
      },
    }));
  const move = (amount: number) => {
    const pool = shown.length ? shown : cards;
    const index = pool.findIndex((candidate) => candidate.id === card.id);
    const next = index < 0 ? 0 : (index + amount + pool.length) % pool.length;
    setSelected(pool[next].id);
    requestAnimationFrame(() =>
      document
        .querySelector(`[data-card-id="${pool[next].id}"]`)
        ?.scrollIntoView({
          block: "nearest",
        }),
    );
  };
  const decideAndNext = (
    next: Partial<Decision> & { status: DecisionStatus },
  ) => {
    setDecision(next);
    move(1);
  };
  const exportData = () => ({
    version: 1,
    generatedAt: new Date().toISOString(),
    catalogCardCount: cards.length,
    decisions: cards
      .filter((candidate) => decisions[candidate.id])
      .map((candidate) => ({
        id: candidate.id,
        packId: packs.find((candidatePack) =>
          candidatePack.cardIds.includes(candidate.id),
        )?.id,
        category: candidate.category,
        dice: diceLabel(candidate) || null,
        currentTitle: candidate.title,
        currentRules: candidate.rules,
        ...decisions[candidate.id],
      })),
  });

  return (
    <main className="card-review">
      <header className="review-header">
        <div>
          <p className="review-kicker">Private local workspace</p>
          <h1>Card review</h1>
          <p>
            Review every title and rule. Your decisions autosave locally until
            you clear this browser’s site data.
          </p>
        </div>
        <nav aria-label="Review tools">
          <a href="?">Game</a>
          <a href="?workshop=1">Visual workshop</a>
          <button
            type="button"
            onClick={() =>
              download(
                `drink-at-ron-card-review-${new Date().toISOString().slice(0, 10)}.md`,
                handoffMarkdown(decisions),
                "text/markdown",
              )
            }
          >
            Download handoff
          </button>
          <button
            type="button"
            onClick={() =>
              download(
                `drink-at-ron-card-review-backup-${new Date().toISOString().slice(0, 10)}.json`,
                JSON.stringify(exportData(), null, 2),
                "application/json",
              )
            }
          >
            Backup JSON
          </button>
          <button type="button" onClick={() => importRef.current?.click()}>
            Restore backup
          </button>
          <input
            ref={importRef}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            aria-label="Restore review backup"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              try {
                const parsed = JSON.parse(await file.text()) as {
                  decisions?: Array<Decision & { id?: string }>;
                };
                if (!Array.isArray(parsed.decisions)) throw new Error();
                const restored: Decisions = {};
                for (const item of parsed.decisions) {
                  if (
                    item.id &&
                    cards.some((candidate) => candidate.id === item.id) &&
                    ["approved", "change", "denied"].includes(item.status)
                  )
                    restored[item.id] = item;
                }
                setDecisions(restored);
                setMessage(
                  `Restored ${Object.keys(restored).length} decisions.`,
                );
              } catch {
                setMessage("That file is not a valid card-review backup.");
              }
              event.target.value = "";
            }}
          />
        </nav>
      </header>

      <section className="review-progress" aria-label="Review progress">
        <strong>
          {reviewed} / {cards.length} reviewed
        </strong>
        <span>{count("approved")} approved</span>
        <span>{count("change")} changes</span>
        <span>{count("denied")} denied</span>
        <progress value={reviewed} max={cards.length} />
        <span className="save-message" role="status">
          {message}
        </span>
      </section>

      <section className="review-filters" aria-label="Card filters">
        <label>
          Search
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title, rules, or ID"
          />
        </label>
        <label>
          Pack
          <select
            value={pack}
            onChange={(event) => setPack(event.target.value)}
          >
            <option value="all">All packs</option>
            {packs.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="unreviewed">Unreviewed</option>
            <option value="approved">Approved</option>
            <option value="change">Change requested</option>
            <option value="denied">Denied</option>
          </select>
        </label>
        <label className="dice-filter">
          <input
            type="checkbox"
            checked={diceOnly}
            onChange={(event) => setDiceOnly(event.target.checked)}
          />
          Dice cards only
        </label>
      </section>

      <div className="review-layout">
        <section className="review-list" aria-label="Cards">
          <p className="review-list-count">Showing {shown.length} cards</p>
          {shown.map((candidate) => {
            const itemDecision = decisions[candidate.id];
            return (
              <article
                key={candidate.id}
                data-card-id={candidate.id}
                className={`${candidate.id === card.id ? "selected" : ""} ${itemDecision?.status ?? "unreviewed"}`}
              >
                <button
                  type="button"
                  className="review-card-summary"
                  aria-current={candidate.id === card.id ? "true" : undefined}
                  onClick={() => setSelected(candidate.id)}
                >
                  <span className="review-card-line">
                    <strong>{candidate.title}</strong>
                    <small>{diceLabel(candidate)}</small>
                  </span>
                  <span>{candidate.rules}</span>
                  <small>
                    {candidate.id} · {itemDecision?.status ?? "unreviewed"}
                  </small>
                </button>
                <div
                  className="quick-decisions"
                  aria-label={`${candidate.title} decision`}
                >
                  <button
                    type="button"
                    aria-label={`Approve ${candidate.title}`}
                    aria-pressed={itemDecision?.status === "approved"}
                    onClick={() => {
                      setSelected(candidate.id);
                      setDecisions((current) => ({
                        ...current,
                        [candidate.id]: {
                          ...current[candidate.id],
                          status: "approved",
                          updatedAt: new Date().toISOString(),
                        },
                      }));
                    }}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    aria-label={`Change ${candidate.title}`}
                    aria-pressed={itemDecision?.status === "change"}
                    onClick={() => {
                      setSelected(candidate.id);
                      setDecisions((current) => ({
                        ...current,
                        [candidate.id]: {
                          ...current[candidate.id],
                          status: "change",
                          proposedTitle:
                            current[candidate.id]?.proposedTitle ??
                            candidate.title,
                          proposedRules:
                            current[candidate.id]?.proposedRules ??
                            candidate.rules,
                          updatedAt: new Date().toISOString(),
                        },
                      }));
                    }}
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    aria-label={`Deny ${candidate.title}`}
                    aria-pressed={itemDecision?.status === "denied"}
                    onClick={() => {
                      setSelected(candidate.id);
                      setDecisions((current) => ({
                        ...current,
                        [candidate.id]: {
                          ...current[candidate.id],
                          status: "denied",
                          updatedAt: new Date().toISOString(),
                        },
                      }));
                    }}
                  >
                    Deny
                  </button>
                </div>
              </article>
            );
          })}
          {!shown.length && <p>No cards match these filters.</p>}
        </section>

        <aside className={`review-editor ${decision?.status ?? "unreviewed"}`}>
          <div className="editor-heading">
            <div>
              <p>{card.id}</p>
              <h2>{card.title}</h2>
            </div>
            <span>{decision?.status ?? "unreviewed"}</span>
          </div>
          <dl className="card-facts">
            <div>
              <dt>Pack</dt>
              <dd>
                {packs.find((candidate) => candidate.cardIds.includes(card.id))
                  ?.title ?? "Unknown"}
              </dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{card.category}</dd>
            </div>
            <div>
              <dt>Dice</dt>
              <dd>{diceLabel(card) || "No"}</dd>
            </div>
          </dl>
          <section className="original-copy">
            <h3>Current card</h3>
            <strong>{card.title}</strong>
            <p>{card.rules}</p>
            {card.dice && (
              <small>
                Dice result text: {card.dice.instruction ?? "Outcome table"}
              </small>
            )}
          </section>
          <div className="editor-decisions" role="group" aria-label="Decision">
            <button
              type="button"
              aria-pressed={decision?.status === "approved"}
              onClick={() => setDecision({ status: "approved" })}
            >
              Approve
            </button>
            <button
              type="button"
              aria-pressed={decision?.status === "change"}
              onClick={() =>
                setDecision({
                  status: "change",
                  proposedTitle: decision?.proposedTitle ?? card.title,
                  proposedRules: decision?.proposedRules ?? card.rules,
                })
              }
            >
              Change
            </button>
            <button
              type="button"
              aria-pressed={decision?.status === "denied"}
              onClick={() => setDecision({ status: "denied" })}
            >
              Deny
            </button>
          </div>
          {decision?.status === "change" && (
            <div className="change-fields">
              <label>
                Replacement title
                <input
                  value={decision.proposedTitle ?? card.title}
                  onChange={(event) =>
                    setDecision({
                      status: "change",
                      proposedTitle: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Replacement body text
                <textarea
                  rows={5}
                  value={decision.proposedRules ?? card.rules}
                  onChange={(event) =>
                    setDecision({
                      status: "change",
                      proposedRules: event.target.value,
                    })
                  }
                />
              </label>
            </div>
          )}
          <label>
            Notes for Codex
            <textarea
              rows={3}
              placeholder="Optional context, tone, or intent"
              value={decision?.note ?? ""}
              onChange={(event) =>
                setDecision({
                  status: decision?.status ?? "change",
                  note: event.target.value,
                  proposedTitle:
                    decision?.proposedTitle ??
                    (decision?.status === "change" ? card.title : undefined),
                  proposedRules:
                    decision?.proposedRules ??
                    (decision?.status === "change" ? card.rules : undefined),
                })
              }
            />
          </label>
          <div className="editor-actions">
            <button type="button" onClick={() => move(-1)}>
              Previous
            </button>
            <button
              type="button"
              className="approve-next"
              onClick={() => decideAndNext({ status: "approved" })}
            >
              Approve & next
            </button>
            <button
              type="button"
              onClick={() =>
                decideAndNext({
                  status: "change",
                  proposedTitle: decision?.proposedTitle ?? card.title,
                  proposedRules: decision?.proposedRules ?? card.rules,
                })
              }
            >
              Save change & next
            </button>
            <button
              type="button"
              className="deny-next"
              onClick={() => decideAndNext({ status: "denied" })}
            >
              Deny & next
            </button>
            <button type="button" onClick={() => move(1)}>
              Skip
            </button>
          </div>
          {decision && (
            <button
              type="button"
              className="reset-card"
              onClick={() =>
                setDecisions((current) => {
                  const next = { ...current };
                  delete next[card.id];
                  return next;
                })
              }
            >
              Reset this card to unreviewed
            </button>
          )}
        </aside>
      </div>
    </main>
  );
}
