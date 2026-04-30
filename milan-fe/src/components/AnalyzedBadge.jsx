export default function AnalyzedBadge({ id = "analyzed-badge" }) {
  return (
    <span id={id} className="analyzed-badge" data-testid="analyzed-badge">
      Analyzed
    </span>
  );
}
