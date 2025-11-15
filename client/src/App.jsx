import { useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Call the backend /scan API
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResult(null);

    if (!url.trim()) {
      setError('Please enter a URL.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Scan failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong while scanning.');
    } finally {
      setLoading(false);
    }
  };

  // Small helper for CSS classes based on severity
  const severityClass = (severity) => {
    if (!severity) return 'severity-pill';
    return `severity-pill severity-${severity.toLowerCase()}`;
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">SiteScanner</div>
        <div className="tagline">Passive Web Security Analyzer</div>
        <p className="subtitle">
          Initial security check for your website – passive HTTP analysis, no active attacks.
        </p>
      </header>

      <main className="main">
        <section className="card">
          <h1 className="card-title">Scan your website for basic security issues</h1>
          <p className="card-text">
            Enter a URL and the scanner will analyze common security headers and highlight potential
            weaknesses.
          </p>

          <form className="form" onSubmit={handleSubmit}>
            <label className="label" htmlFor="url-input">
              Your website URL
            </label>
            <div className="input-row">
              <input
                id="url-input"
                type="text"
                className="input"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button className="button" type="submit" disabled={loading}>
                {loading ? 'Scanning...' : 'Scan website'}
              </button>
            </div>
            <p className="hint">
              For example: <code>https://example.com</code> or any site you own.
            </p>
          </form>

          {error && <div className="alert alert-error">{error}</div>}

          {result && (
            <section className="results">
              <div className="results-header">
                <h2>Scan results</h2>
                <span className="status-pill">
                  HTTP status: {result.status}
                </span>
              </div>

              {(!result.issues || result.issues.length === 0) && (
                <p className="no-issues">
                  No issues were found for the headers checked here. This does not guarantee the site
                  is fully secure, but it&apos;s a good start.
                </p>
              )}

              {result.issues && result.issues.length > 0 && (
                <ul className="issues-list">
                  {result.issues.map((issue) => (
                    <li key={issue.id} className="issue-card">
                      <div className="issue-header">
                        <h3 className="issue-title">{issue.title}</h3>
                        <span className={severityClass(issue.severity)}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="issue-description">{issue.description}</p>
                      <p className="issue-recommendation">
                        <strong>Recommendation:</strong> {issue.recommendation}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </section>
      </main>

      <footer className="footer">
        <span>Built with Node.js, Express &amp; React</span>
      </footer>
    </div>
  );
}

export default App;
