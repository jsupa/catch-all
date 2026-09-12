# Express 5 Wildcard Subdomain Catch-All App

A lightweight **Express 5** application built with **pnpm**, **MongoDB**, and **Mongoose**.

- 🌐 **Subdomain Catch-All**: Catches any subdomain (e.g. `kadkmakdma.domain.com`, `*.domain.com`) and any path, showing the exact same form on every page.
- 🚫 **No Autofill / Suggestions**: Specifically disables browser email autocomplete popups and saved email suggestions using `autocomplete="off"`, `type="text"`, dummy heuristics buffers, and `readonly` focus unlocking.
- 📝 **Simple Two-Input Form**: Only **Name** and **Email** fields with a submit button.
- 💾 **MongoDB + Mongoose without validation**: Accepts any input strings directly and saves them to MongoDB without regex or required validation.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
Create or edit `.env` (defaults to local MongoDB):
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/catch_all
```

### 3. Run the App
- **Production mode**:
  ```bash
  pnpm start
  ```
- **Development mode** (auto-reload on file change):
  ```bash
  pnpm dev
  ```

### 4. Run Automated Tests
Runs full integration tests (using an in-memory MongoDB instance):
```bash
pnpm test
```

---

## 🌐 How Wildcard Subdomains Work (`*.domain.com`)

### In Production
1. Point a wildcard DNS record `*.yourdomain.com` (A or CNAME) to your server's IP address.
2. In your reverse proxy (Nginx, Cloudflare, Caddy, etc.), route `*.yourdomain.com` traffic to this Express port.
3. Express 5 does not restrict the `Host` header, so requests to `kadkmakdma.yourdomain.com` or any subdomain are seamlessly caught by the application.
4. `app.set('trust proxy', true)` ensures `req.hostname` and `req.subdomains` are correctly read.

### Testing Locally
Modern browsers (Chrome, Firefox, Safari) and macOS automatically resolve `*.localhost` to `127.0.0.1` out of the box! You can immediately test subdomains by visiting:
- [http://kadkmakdma.localhost:3000](http://kadkmakdma.localhost:3000)
- [http://anything.localhost:3000](http://anything.localhost:3000)
- [http://test.localhost:3000/any/deep/subpath](http://test.localhost:3000/any/deep/subpath)

---

## 🛡️ Autofill & Suggestion Suppression

Modern browsers aggressively trigger email autofill menus when they detect `type="email"` or inputs named `email`. To prevent this:
1. `<form autocomplete="off" novalidate>`
2. `<input type="text" ... autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" data-lpignore="true">`
3. Uses `type="text"` instead of `type="email"` to avoid browser account suggestion hooks while allowing any email format to be submitted.
4. Uses an invisible dummy field to trap browser heuristic scans.
5. Uses `readonly` unlocked on focus to block Chromium from popping up the saved emails dropdown on initial load or tap.

---

## 🗄️ Database Model (Without Validation)

Saved using Mongoose with `validateBeforeSave: false` and `strict: false`:
```javascript
{
  name: String,
  email: String,
  host: String,      // e.g. "kadkmakdma.domain.com"
  subdomain: String, // e.g. "kadkmakdma"
  path: String,      // e.g. "/some/page"
  createdAt: Date
}
```
No validation is enforced: any text, empty strings, or unformatted emails are persisted directly.

---

## 📁 Project Structure

```
catch-all/
├── src/
│   ├── app.js            # Express 5 app setup, routes, wildcard handlers
│   ├── config.js         # Environment configuration (PORT, MONGODB_URI)
│   ├── db.js             # Mongoose connection helpers
│   ├── models/
│   │   └── Submission.js # Mongoose schema (no validation)
│   ├── views/
│   │   └── form.js       # HTML view with autofill prevention
│   └── server.js         # HTTP server entry point
├── test/
│   └── app.test.js       # End-to-end integration tests
├── .env.example
├── .env
├── package.json
└── README.md
```
