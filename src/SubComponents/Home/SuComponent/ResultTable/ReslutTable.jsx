import React from 'react';
import './ResultTable.css';

export default function ResultTable({ report, onClose }) {
  if (!report) return null;

  const { query, periods, trend, notes } = report;

  return (
    <div className="home-results-overlay">
      <div className="home-results-panel popup-card animate-fade-in">
        
        {/* Header / Summary Bar */}
        <div className="panel-header">
          <div className="header-titles">
            <h2>Antimicrobial Susceptibility Report</h2>
            <p className="subtitle">
              Organism: <strong>{query.organism}</strong> | Antibiotic: <strong>{query.antibiotic}</strong>
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
            <strong>Last 4 Weeks:</strong> {periods.last4Weeks.from} to {periods.last4Weeks.to}
          </span>
          <span className="badge">
            <strong>Annual Period:</strong> {periods.annual.from} to {periods.annual.to}
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
                    <span className={`specimen-dot ${row.specimen}`}></span>
                    {row.specimen.charAt(0).toUpperCase() + row.specimen.slice(1)}
                  </td>
                  <td>{row.year} {row.partialYear && <span className="tag-partial">(YTD)</span>}</td>
                  <td>{row.tested}</td>
                  <td>{row.resistant}</td>
                  <td>{row.susceptible}</td>
                  <td>
                    <div className="progress-cell">
                      <span className="pct-text"><strong>{row.display}</strong></span>
                      <div className="mini-progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${row.resistancePct}%`, backgroundColor: row.resistancePct > 40 ? '#e53e3e' : '#3182ce' }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge ok">Active</span>
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