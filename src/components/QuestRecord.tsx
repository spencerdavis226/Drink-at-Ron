import type { CardDefinition } from "../game/types";
import type { questRecord } from "../game/engine";

type Record = NonNullable<ReturnType<typeof questRecord>>;

// The last part of a ribbon names what the card earns ("Gym Leader · Boulder
// Badge" -> "Boulder Badge"); a card without one is named by its title.
const prize = (card: CardDefinition) =>
  card.ribbon?.split(" · ").pop() ?? card.title;

/** A quest run laid out as a badge case: one medal slot per badge to earn,
 * then each finale stage with the cards beaten so far. Slots still to come
 * stay empty, so nothing ahead is spoiled. Shared by the badge case dialog
 * and the Hall of Fame. */
export function QuestRecord({ record }: { record: Record }) {
  // Earned slots follow the meter; a badge whose card has been reshuffled
  // away still shows, unnamed.
  const slots = Array.from(
    { length: record.goal },
    (_, i): CardDefinition | "earned" | null =>
      i < record.count ? (record.earned.at(i) ?? "earned") : null,
  );
  return (
    <div className="quest-record">
      <ol
        className="badge-slots"
        aria-label={`${record.label}: ${record.count} of ${record.goal}`}
      >
        {slots.map((card, i) =>
          card === "earned" ? (
            <li key={`earned-${i}`} className="badge-slot earned">
              <span className="badge-medal" aria-hidden="true" />
              <span className="sr-only">Earned</span>
            </li>
          ) : card ? (
            <li key={card.id} className="badge-slot earned">
              <span className="badge-medal" aria-hidden="true">
                {prize(card).charAt(0)}
              </span>
              <strong>{prize(card).replace(/ Badge$/, "")}</strong>
              <small>{card.title}</small>
            </li>
          ) : (
            <li key={`empty-${i}`} className="badge-slot">
              <span className="badge-medal" aria-hidden="true" />
              <span className="sr-only">Not yet earned</span>
            </li>
          ),
        )}
      </ol>
      <dl className="stage-record">
        {record.stages.map((stage) => (
          <div
            key={stage.label}
            className={stage.cards.length === stage.size ? "cleared" : ""}
          >
            <dt>{stage.label}</dt>
            <dd>
              {stage.cards.length
                ? stage.cards.map((c) => c.title).join(" · ")
                : "Not yet faced"}
              {stage.size > 1 &&
                stage.cards.length > 0 &&
                stage.cards.length < stage.size &&
                ` (${stage.cards.length} of ${stage.size})`}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
