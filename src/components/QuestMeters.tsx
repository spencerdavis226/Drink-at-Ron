import type { SessionState } from "../game/types";
import { packs } from "../content/manifest.generated";
import { PackLogo } from "./PackMarks";

/** A pack quest's table-wide meter, in the play screen's top row. It glows
 * when the finale is the card in play. */
export function QuestMeters({ session }: { session: SessionState }) {
  if (!session.quests?.length) return null;
  return (
    <div className="quest-meters">
      {session.quests.map((quest) => {
        const pack = packs.find((p) => p.id === quest.packId);
        return (
          <div
            key={quest.packId}
            className={`quest-meter${quest.due ? " due" : ""}`}
            role="img"
            aria-label={`${quest.label}: ${quest.count} of ${quest.goal}`}
          >
            {pack && <PackLogo pack={pack} decorative />}
            <span>
              <small>{quest.label}</small>
              <strong>
                {quest.count}/{quest.goal}
              </strong>
            </span>
          </div>
        );
      })}
    </div>
  );
}
