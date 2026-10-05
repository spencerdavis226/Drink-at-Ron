import type { SessionState } from "../game/types";
import { packs } from "../content/manifest.generated";
import { PackLogo } from "./PackMarks";

/** A quest mode's table-wide meter, in the play screen's top row. It glows
 * when the finale is the card in play. */
export function QuestMeter({ session }: { session: SessionState }) {
  const quest = session.quest;
  if (!quest) return null;
  const pack = packs.find((p) => p.id === quest.packId);
  return (
    <div className="quest-meters">
      <div
        className={`quest-meter${quest.due ? " due" : ""}`}
        role="img"
        aria-label={`${quest.label}: ${quest.count} of ${quest.goal}`}
      >
        {pack && <PackLogo pack={pack} decorative />}
        <span>
          <small>{quest.label}</small>
          {/* Keyed by the count so each new badge replays the pop. */}
          <strong key={quest.count} className={quest.count ? "earned" : ""}>
            {quest.count}/{quest.goal}
          </strong>
        </span>
      </div>
    </div>
  );
}
