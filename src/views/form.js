/**
 * Renders the HTML page containing the two-input form.
 *
 * @param {Object} options
 * @param {string} options.host - Incoming host header
 * @param {string} options.path - Request path
 * @param {Object|null} options.submission - Saved submission data if just submitted
 * @param {string|null} options.error - Error message if submission failed
 */
export function renderFormHtml({ host = '', path = '', submission = null, error = null }) {
  const hostDisplay = host || 'default';
  const pathDisplay = path || '/';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Catch-All Form</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --border: #334155;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --success-bg: #064e3b;
      --success-border: #059669;
      --success-text: #a7f3d0;
      --error-bg: #7f1d1d;
      --error-border: #dc2626;
      --error-text: #fecaca;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .container {
      width: 100%;
      max-width: 440px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    }

    .badge-bar {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 1.5rem;
      font-size: 0.75rem;
      color: var(--text-muted);
      background: rgba(15, 23, 42, 0.6);
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      word-break: break-all;
    }

    .badge-bar span strong {
      color: #cbd5e1;
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    p.subtext {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1.25rem;
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .alert-success {
      background-color: var(--success-bg);
      border: 1px solid var(--success-border);
      color: var(--success-text);
    }

    .alert-error {
      background-color: var(--error-bg);
      border: 1px solid var(--error-border);
      color: var(--error-text);
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.4rem;
      color: #e2e8f0;
    }

    input[type="text"] {
      width: 100%;
      padding: 0.75rem 0.875rem;
      font-size: 0.95rem;
      background: #0f172a;
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    input[type="text"]:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
    }

    input[type="text"]::placeholder {
      color: #64748b;
    }

    button[type="submit"] {
      width: 100%;
      padding: 0.75rem 1rem;
      background-color: var(--primary);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.15s ease;
      margin-top: 0.5rem;
    }

    button[type="submit"]:hover {
      background-color: var(--primary-hover);
    }

    button[type="submit"]:active {
      transform: translateY(1px);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge-bar">
      <span><strong>Host:</strong> ${escapeHtml(hostDisplay)}</span>
      <span><strong>Path:</strong> ${escapeHtml(pathDisplay)}</span>
    </div>

    <h1>Catch-All Form</h1>
    <p class="subtext">Any subdomain &amp; page catch.</p>

    ${
      submission
        ? `<div class="alert alert-success">
            <strong>Saved successfully!</strong><br/>
            Name: ${escapeHtml(submission.name || '(empty)')}<br/>
            Email: ${escapeHtml(submission.email || '(empty)')}
           </div>`
        : ''
    }

    ${
      error
        ? `<div class="alert alert-error">
            <strong>Error:</strong> ${escapeHtml(error)}
           </div>`
        : ''
    }

    <!-- 
      Autofill prevention attributes:
      1. autocomplete="off" on form
      2. Hidden dummy input to catch browser autofill heuristics
      3. type="text" instead of type="email" to prevent browser email suggestions
      4. autocomplete="off", autocorrect="off", autocapitalize="none", spellcheck="false"
      5. readonly onfocus="this.removeAttribute('readonly')" to block Chromium initial autofill popup
      6. data-lpignore="true" data-1p-ignore="true" to disable password manager popups
      7. novalidate ensures zero client validation
    -->
    <form method="POST" action="/submit" autocomplete="off" novalidate>
      <!-- Dummy input to absorb browser autofill scan -->
      <input type="text" style="position: absolute; opacity: 0; pointer-events: none; height: 0; width: 0;" tabindex="-1" autocomplete="false" aria-hidden="true" />

      <div class="form-group">
        <label for="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Enter name"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          data-lpignore="true"
          data-1p-ignore="true"
          readonly
          onfocus="this.removeAttribute('readonly');"
        />
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="text"
          id="email"
          name="email"
          placeholder="Enter email"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="none"
          spellcheck="false"
          data-lpignore="true"
          data-1p-ignore="true"
          readonly
          onfocus="this.removeAttribute('readonly');"
        />
      </div>

      <button type="submit">Submit</button>
    </form>
  </div>
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
