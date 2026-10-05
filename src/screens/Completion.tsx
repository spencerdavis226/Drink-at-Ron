import { Button, Artwork } from "../components/UI";
import { asset, theme } from "../presentation/theme";
import { QuestRecord } from "../components/QuestRecord";
import type { questRecord } from "../game/engine";
/** The end of a game: a toast to the table, or, when a quest mode's finale is
 * beaten, the Hall of Fame with the run laid out. */
export function Completion({
  count,
  record,
  mode,
  celebrate,
  onReplay,
  onSetup,
  onFinish,
}: {
  count: number;
  record: ReturnType<typeof questRecord>;
  /** The quest mode's name, e.g. "Pokémon League". */
  mode?: string;
  celebrate: boolean;
  onReplay: () => void;
  onSetup: () => void;
  onFinish: () => void;
}) {
  return (
    <section
      className={`complete${record?.won ? " hall-of-fame" : ""}${celebrate ? " celebrate" : ""}`}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) onFinish();
      }}
    >
      {record?.won ? (
        <>
          <p className="hall-kicker">{mode}</p>
          <h1>
            Hall of
            <br />
            <em>Fame.</em>
          </h1>
          <QuestRecord record={record} />
        </>
      ) : (
        <>
          <Artwork src={asset(theme.assets.tankard)} alt="" />
          <h1>
            To good
            <br />
            <em>company.</em>
          </h1>
        </>
      )}
      <p className="cards-played">
        {count} {count === 1 ? "card" : "cards"} played
      </p>
      <Button disabled={celebrate} onClick={onReplay}>
        Play again
      </Button>
      <Button variant="text-button" disabled={celebrate} onClick={onSetup}>
        Change deck
      </Button>
    </section>
  );
}
