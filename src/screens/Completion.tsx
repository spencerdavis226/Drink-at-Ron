import { Button, Artwork } from "../components/UI";
import { asset, theme } from "../presentation/theme";
export function Completion({
  count,
  celebrate,
  onReplay,
  onSetup,
  onFinish,
}: {
  count: number;
  celebrate: boolean;
  onReplay: () => void;
  onSetup: () => void;
  onFinish: () => void;
}) {
  return (
    <section
      className={`complete ${celebrate ? "celebrate" : ""}`}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) onFinish();
      }}
    >
      <Artwork src={asset(theme.assets.tankard)} alt="" />
      <h1>
        To good
        <br />
        <em>company.</em>
      </h1>
      <p>
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
