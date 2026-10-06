import type { SessionState } from "../game/types";
import { finaleStage } from "../game/engine";
import { packs } from "../content/manifest.generated";
import { stageArt } from "../presentation/league-art";

/** The banner that sweeps across the table as each finale stage begins (the
 * Legendary, the Elite Four, the Champion): shown while the stage's first
 * card is dealt face down, once per stage. It never takes a tap; the card
 * underneath stays playable. */
export function StageBanner({ session }: { session: SessionState }) {
  const quest = session.quest;
  if (!quest?.due || session.phase !== "hidden") return null;
  const stage = finaleStage(quest);
  if (stage.index !== 0) return null;
  const rules = packs.find((p) => p.id === quest.packId)?.quest;
  const intro = rules?.finale[stage.stage]?.intro ?? stage.label;
  // The banner takes the stage's ribbon finish (pearl, violet, crimson).
  const tone = quest.stages[stage.stage].cards[0]?.ribbonTone ?? "gold";
  const banner = quest.packId === "pokemon" ? stageArt(tone) : undefined;
  return (
    <div
      // Keyed by stage so a new stage replays the sweep.
      key={stage.stage}
      className={`stage-banner banner-${tone}`}
      role="status"
    >
      <div className={`stage-banner-cloth${banner ? " painted-banner" : ""}`}>
        {banner && <img className="stage-banner-art" src={banner} alt="" />}
        <small>{rules?.mode}</small>
        <strong>{intro}</strong>
      </div>
    </div>
  );
}
