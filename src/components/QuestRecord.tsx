import type { CardDefinition } from "../game/types";
import type { questRecord } from "../game/engine";
import { badgeArt } from "../presentation/league-art";
import { asset } from "../presentation/theme";
import type { CSSProperties } from "react";

type Record = NonNullable<ReturnType<typeof questRecord>>;

// The last part of a ribbon names what the card earns ("Gym Leader · Boulder
// Badge" -> "Boulder Badge"); a card without one is named by its title.
const prize = (card: CardDefinition) =>
  card.ribbon?.split(" · ").pop() ?? card.title;

/** A quest run laid out as a badge case: one medal slot per badge to earn,
 * then each finale stage with the cards beaten so far. Slots still to come
 * stay empty, so nothing ahead is spoiled. Shared by the badge case dialog
 * and the Hall of Fame. */
export function QuestRecord({
  record,
  league = false,
}: {
  record: Record;
  league?: boolean;
}) {
  // Earned slots follow the meter; a badge whose card has been reshuffled
  // away still shows, unnamed.
  const slots = Array.from(
    { length: record.goal },
    (_, i): CardDefinition | "earned" | null =>
      i < record.count ? (record.earned.at(i) ?? "earned") : null,
  );
  const painted = league && record.goal === 8;
  return (
    <div className="quest-record">
      <div className={painted ? "painted-badge-case" : undefined}>
        {painted && (
          <>
            <img
              className="badge-case-art"
              src={asset("art/badge-case.webp")}
              alt=""
            />
            <span className="badge-case-count" aria-hidden="true">
              {record.count} / {record.goal}
            </span>
          </>
        )}
        <ol
          className="badge-slots"
          aria-label={`${record.label}: ${record.count} of ${record.goal}`}
        >
          {slots.map((slot, i) => {
            const card = slot && slot !== "earned" ? slot : null;
            const art = card ? badgeArt(card.id) : undefined;
            return (
              <li
                key={card?.id ?? `slot-${i}`}
                className={`badge-slot${slot ? " earned" : ""}`}
                style={
                  painted
                    ? ({
                        "--badge-left": `${25.1 + (i % 4) * 16.7}%`,
                        "--badge-top": `${i < 4 ? 36.8 : 47.3}%`,
                      } as CSSProperties)
                    : undefined
                }
              >
                <span
                  className={`badge-medal${art ? " painted-medal" : ""}`}
                  aria-hidden="true"
                >
                  {art ? (
                    <img src={art} alt="" />
                  ) : card ? (
                    prize(card).charAt(0)
                  ) : null}
                </span>
                {card ? (
                  <>
                    <strong>{prize(card).replace(/ Badge$/, "")}</strong>
                    <small>{card.title}</small>
                  </>
                ) : (
                  <span className="sr-only">
                    {slot ? "Earned" : "Not yet earned"}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
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
