import { useState } from "react";

/**
 * Renders the `data` object returned by POST /testResult.
 *
 * <ResultTable report={json.data} />
 */

const TABS = [
  { key: "sex", label: "By sex" },
  { key: "careSetting", label: "Inpatient / outpatient" },
  { key: "ward", label: "By ward" },
];

const FILTER_LABELS = {
  specimen: "Specimen",
  wardCode: "Ward",
  wardType: "Setting",
  sex: "Sex",
};

const WARD_TYPE_LABEL = { in: "Inpatient", out: "Outpatient" };

const range = (p) => (p ? `${p.from} – ${p.to}` : "");

/* One resistance value: percentage, bar, counts, CI – or "Insufficient data" */
function ResistanceCell({ cell, minN }) {
  if (!cell || cell.status !== "ok") {
    return (
      <div className="rt-cell">
        <div className="rt-na">Insufficient data</div>
        <div className="rt-sub">
          {cell ? cell.tested : 0} tested · minimum {minN}
        </div>
      </div>
    );
  }

  return (
    <div className="rt-cell">
      <div className="rt-pct">{cell.resistancePct.toFixed(1)}%</div>
      <div
        className="rt-bar"
        role="img"
        aria-label={`${cell.resistancePct}% resistant`}
      >
        <div className="rt-bar-fill" style={{ width: `${cell.resistancePct}%` }} />
      </div>
      <div className="rt-sub">
        {cell.resistant} / {cell.tested} resistant
      </div>
      <div className="rt-sub">
        95% CI {cell.ci95.low}–{cell.ci95.high}%
      </div>
    </div>
  );
}

/* Calendar-year trend: one row per specimen, one column per year */
function TrendTable({ trend, minN }) {
  if (!trend?.length) return null;

  const years = [...new Set(trend.map((t) => t.year))].sort();
  const specimens = [...new Set(trend.map((t) => t.specimen))].sort();
  const lookup = new Map(trend.map((t) => [`${t.specimen}|${t.year}`, t]));
  const partial = new Set(trend.filter((t) => t.partialYear).map((t) => t.year));

  return (
    <section className="rt-section">
      <h3>Annual trend</h3>
      <div className="rt-scroll">
        <table className="rt-table">
          <thead>
            <tr>
              <th>Specimen</th>
              {years.map((y) => (
                <th key={y}>
                  {y}
                  {partial.has(y) ? " (to date)" : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {specimens.map((sp) => (
              <tr key={sp}>
                <td className="rt-strong">{sp}</td>
                {years.map((y) => (
                  <td key={y}>
                    <ResistanceCell cell={lookup.get(`${sp}|${y}`)} minN={minN} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function ResultTable({ report }) {
  const [tab, setTab] = useState("sex");

  if (!report) return null;

  const { query, periods, minIsolates, summary, breakdowns, trend, notes } = report;

  const activeFilters = Object.entries(FILTER_LABELS)
    .filter(([key]) => query?.[key])
    .map(([key, label]) => {
      const value = key === "wardType" ? WARD_TYPE_LABEL[query[key]] ?? query[key] : query[key];
      return `${label}: ${value}`;
    });

  const rows = breakdowns?.[tab] ?? [];

  return (
    <div className="rt">
      <style>{css}</style>

      <header className="rt-header">
        <h2>
          {query.organism} <span className="rt-light">vs</span> {query.antibiotic}
        </h2>
        {activeFilters.length > 0 && (
          <ul className="rt-chips">
            {activeFilters.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
      </header>

      {/* ---------- Headline: last 4 weeks vs annual ---------- */}
      <section className="rt-section">
        <h3>Resistance overview</h3>
        {summary?.length ? (
          <div className="rt-scroll">
            <table className="rt-table">
              <thead>
                <tr>
                  <th>Specimen</th>
                  <th>
                    Last 4 weeks
                    <div className="rt-range">{range(periods.last4Weeks)}</div>
                  </th>
                  <th>
                    Annual
                    <div className="rt-range">{range(periods.annual)}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {summary.map((row) => (
                  <tr key={row.specimen}>
                    <td className="rt-strong">{row.specimen}</td>
                    <td>
                      <ResistanceCell cell={row.last4Weeks} minN={minIsolates} />
                    </td>
                    <td>
                      <ResistanceCell cell={row.annual} minN={minIsolates} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rt-empty">No tested isolates match these filters.</p>
        )}
      </section>

      {/* ---------- Breakdowns ---------- */}
      {summary?.length > 0 && (
        <section className="rt-section">
          <h3>Breakdown</h3>
          <div className="rt-tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                className={tab === t.key ? "rt-tab rt-tab-active" : "rt-tab"}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {rows.length ? (
            <div className="rt-scroll">
              <table className="rt-table">
                <thead>
                  <tr>
                    <th>Specimen</th>
                    <th>Group</th>
                    <th>Last 4 weeks</th>
                    <th>Annual</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={`${r.specimen}|${r.group}`}>
                      <td>{r.specimen}</td>
                      <td className="rt-strong">{r.group}</td>
                      <td>
                        <ResistanceCell cell={r.last4Weeks} minN={minIsolates} />
                      </td>
                      <td>
                        <ResistanceCell cell={r.annual} minN={minIsolates} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rt-empty">No data for this breakdown.</p>
          )}
        </section>
      )}

      <TrendTable trend={trend} minN={minIsolates} />

      {notes?.length > 0 && (
        <footer className="rt-notes">
          {notes.map((n) => (
            <p key={n}>{n}</p>
          ))}
        </footer>
      )}
    </div>
  );
}

const css = `
.rt { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #1f2937; max-width: 960px; margin: 0 auto; }
.rt h2 { margin: 0 0 8px; font-size: 1.4rem; }
.rt h3 { margin: 0 0 10px; font-size: 1.05rem; }
.rt-light { font-weight: 400; color: #6b7280; }
.rt-header { margin-bottom: 20px; }
.rt-chips { list-style: none; display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; }
.rt-chips li { background: #eef2ff; color: #3730a3; padding: 2px 10px; border-radius: 999px; font-size: 0.8rem; }
.rt-section { margin-bottom: 28px; }
.rt-scroll { overflow-x: auto; }
.rt-table { width: 100%; border-collapse: collapse; background: #fff; }
.rt-table th, .rt-table td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
.rt-table th { background: #f9fafb; font-size: 0.85rem; color: #374151; }
.rt-range { font-weight: 400; font-size: 0.75rem; color: #6b7280; margin-top: 2px; }
.rt-strong { font-weight: 600; }
.rt-cell { min-width: 150px; }
.rt-pct { font-size: 1.3rem; font-weight: 700; line-height: 1.2; }
.rt-bar { height: 6px; background: #e5e7eb; border-radius: 3px; margin: 6px 0; overflow: hidden; }
.rt-bar-fill { height: 100%; background: #4f46e5; }
.rt-sub { font-size: 0.75rem; color: #6b7280; }
.rt-na { color: #9ca3af; font-style: italic; font-weight: 600; }
.rt-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
.rt-tab { border: 1px solid #d1d5db; background: #fff; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
.rt-tab-active { background: #4f46e5; border-color: #4f46e5; color: #fff; }
.rt-empty { color: #6b7280; font-style: italic; }
.rt-notes { border-top: 1px solid #e5e7eb; padding-top: 10px; font-size: 0.8rem; color: #6b7280; }
.rt-notes p { margin: 4px 0; }
`;