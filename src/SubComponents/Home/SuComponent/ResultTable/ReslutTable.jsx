import React, { useEffect } from 'react';
import './ResultTable.css';

const getLevel = (pct) => (pct > 40 ? 'level-high' : pct > 20 ? 'level-mid' : 'level-low');

export default function ResultTable({ report, onClose }) {
  // Close on Escape
  useEffect(() => {
    if (!onClose) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!report) return null;

  const { query, periods, trend, notes } = report;

  return (
    <div
      className="home-results-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className="home-results-panel popup-card animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rt-title"
      >
        {/* Header / Summary Bar */}
        <div className="panel-header">
          <div className="header-titles">
            <h2 id="rt-title">Antimicrobial Susceptibility Report</h2>
            <p className="subtitle">
              <span>Organism: <strong>{query.organism}</strong></span>
              <span>Antibiotic: <strong>{query.antibiotic}</strong></span>
            </p>
          </div>
          {onClose && (
            <button className="close-btn" onClick={onClose} aria-label="Close panel">
              &times;
            </button>
          )}
        </div>

        {/* Period Context */}
        <div className="period-badges">
          <span className="badge">
            <strong>Last 4 weeks:</strong> {periods.last4Weeks.from} → {periods.last4Weeks.to}
          </span>
          <span className="badge">
            <strong>Annual period:</strong> {periods.annual.from} → {periods.annual.to}
          </span>
        </div>

        {/* Data Table for Trends */}
        <div className="table-container">
          <h3>Historical Resistance Trends by Specimen</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Specimen</th>
                <th>Year</th>
                <th>Tested</th>
                <th>Resistant</th>
                <th>Susceptible</th>
                <th>Resistance %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trend.map((row, index) => (
                <tr key={index} className={row.partialYear ? 'partial-year' : ''}>
                  <td className="specimen-cell">
                    <span className={`specimen-dot ${row.specimen}`} />
                    {row.specimen.charAt(0).toUpperCase() + row.specimen.slice(1)}
                  </td>
                  <td>
                    {row.year}
                    {row.partialYear && <span className="tag-partial">YTD</span>}
                  </td>
                  <td>{row.tested}</td>
                  <td>{row.resistant}</td>
                  <td>{row.susceptible}</td>
                  <td>
                    <div className="progress-cell">
                      <span className="pct-text"><strong>{row.display}</strong></span>
                      <div className="mini-progress-bar">
                        <div
                          className={`progress-fill ${getLevel(row.resistancePct)}`}
                          style={{ width: `${Math.min(row.resistancePct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${row.partialYear ? 'partial' : 'ok'}`}>
                      {row.partialYear ? 'In progress' : 'Complete'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes Footer */}
        {notes && notes.length > 0 && (
          <div className="panel-footer-notes">
            <blockquote>
              <p>📌 <strong>Note:</strong> {notes[0]}</p>
            </blockquote>
          </div>
        )}
      </div>
    </div>
  );
}