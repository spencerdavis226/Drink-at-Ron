export function Atmosphere({
  enabled,
  hidden,
}: {
  enabled: boolean;
  hidden: boolean;
}) {
  return (
    <div
      className={`atmosphere ${enabled ? "enabled" : ""} ${hidden ? "suspended" : ""}`}
      aria-hidden="true"
    >
      <div className="firelight" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <i className={`ember ember-${i}`} key={i} />
      ))}
    </div>
  );
}
