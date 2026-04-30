function slugify(s) {
  return String(s || "").toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function PageHeader({ pill, title, subtitle, idPrefix }) {
  const prefix = idPrefix || slugify(title);
  return (
    <div id={`${prefix}-header`}>
      <div
        id={`${prefix}-pill`}
        className="page-label-pill"
        data-testid="page-pill"
      >
        {pill}
      </div>
      <h1 id={`${prefix}-title`} className="page-title">{title}</h1>
      <p id={`${prefix}-subtitle`} className="page-subtitle">{subtitle}</p>
    </div>
  );
}
