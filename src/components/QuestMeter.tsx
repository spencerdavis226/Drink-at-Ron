import type { SessionState } from "../game/types";
import { finaleStage } from "../game/engine";
import { packs } from "../content/manifest.generated";
import { PackLogo } from "./PackMarks";

/** A quest mode's table-wide meter, in the play screen's top row: the goal's
 * progress (Badges 3/8), then the finale stage in play (Elite Four 2/4, or
 * VS for a single card). It glows through the finale. */
export function QuestMeter({ session }: { session: SessionState }) {
  const quest = session.quest;
  if (!quest) return null;
  const pack = packs.find((p) => p.id === quest.packId);
  const stage = quest.due ? finaleStage(quest) : null;
  const label = stage ? stage.label : quest.label;
  const count = stage
    ? stage.size > 1
      ? `${stage.index + 1}/${stage.size}`
      : "VS"
    : `${quest.count}/${quest.goal}`;
  const spoken = stage
    ? stage.size > 1
      ? `${label}: ${stage.index + 1} of ${stage.size}`
      : label
    : `${label}: ${quest.count} of ${quest.goal}`;
  return (
    <div className="quest-meters">
      <div
        className={`quest-meter${quest.due ? " due" : ""}`}
        role="img"
        aria-label={spoken}
      >
        {pack && <PackLogo pack={pack} decorative />}
        <span>
          <small>{label}</small>
          {/* Keyed so each badge and each finale step replays the pop. */}
          <strong
            key={`${quest.count}-${quest.step}`}
            className={quest.count ? "earned" : ""}
          >
            {count}
          </strong>
        </span>
      </div>
    </div>
  );
}
