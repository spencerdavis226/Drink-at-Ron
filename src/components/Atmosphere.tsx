export function Atmosphere({ hidden }: { hidden: boolean }) {
  return (
    <div
      className={`atmosphere ${hidden ? "suspended" : ""}`}
      aria-hidden="true"
    >
      <div className="firelight" />
      <div className="candle" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <i className={`ember ember-${i}`} key={i} />
      ))}
      <div className="dust">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <i className={`dust-${i}`} key={i} />
        ))}
      </div>
    </div>
  );
}
