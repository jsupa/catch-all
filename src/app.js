import express from 'express';
import Submission from './models/Submission.js';
import { renderFormHtml } from './views/form.js';

const app = express();

// Trust reverse proxy headers (e.g. Nginx, Cloudflare, Traefik, Caddy)
// so req.hostname and req.subdomains are accurately read
app.set('trust proxy', true);

// Parse url-encoded form data and JSON payloads
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Helper to extract host, subdomain, and path metadata
function getRequestMeta(req) {
  const host = req.headers.host || req.hostname || '';
  // req.subdomains returns e.g. ['kadkmakdma'] for 'kadkmakdma.domain.com'
  const subdomain =
    Array.isArray(req.subdomains) && req.subdomains.length > 0
      ? req.subdomains.slice().reverse().join('.')
      : '';
  const path = req.originalUrl || req.url || '/';
  return { host, subdomain, path };
}

// Ignore favicon requests gracefully
app.get('/favicon.ico', (req, res) => res.status(204).end());

/**
 * Handles form submissions:
 * Saves name and email to MongoDB via Mongoose without any validation.
 */
async function handleSubmission(req, res) {
  try {
    const { name, email } = req.body;
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedEmail = typeof email === 'string' ? email.trim() : '';

    const isJsonRequest =
      req.xhr ||
      (req.headers.accept && req.headers.accept.includes('application/json'));

    // Reject empty form submissions
    if (!trimmedName || !trimmedEmail) {
      const meta = getRequestMeta(req);
      const errorMessage =
        !trimmedName && !trimmedEmail
          ? 'Form cannot be empty. Please fill in both Name and Email.'
          : !trimmedName
          ? 'Name cannot be empty. Please enter your name.'
          : 'Email cannot be empty. Please enter your email.';

      if (isJsonRequest) {
        return res.status(400).json({
          success: false,
          error: errorMessage,
        });
      }

      const html = renderFormHtml({
        host: meta.host,
        path: meta.path,
        error: errorMessage,
      });
      return res.status(400).send(html);
    }

    const meta = getRequestMeta(req);

    // Save directly to DB without any format restriction
    const submission = await Submission.create({
      name: trimmedName,
      email: trimmedEmail,
      host: meta.host,
      subdomain: meta.subdomain,
      path: meta.path,
    });

    if (isJsonRequest) {
      return res.status(201).json({
        success: true,
        message: 'Submission saved successfully',
        data: submission,
      });
    }

    // Default: render HTML form with success message
    const html = renderFormHtml({
      host: meta.host,
      path: meta.path,
      submission,
    });
    return res.status(201).send(html);
  } catch (error) {
    console.error('Error saving submission to DB:', error);
    const meta = getRequestMeta(req);
    const html = renderFormHtml({
      host: meta.host,
      path: meta.path,
      error: 'Failed to save submission to database.',
    });
    return res.status(500).send(html);
  }
}

// POST endpoint catching submissions on /submit, /, or any other path
app.post('/submit', handleSubmission);
app.post('{*splat}', handleSubmission);

// GET endpoint: catch-all on any path and any subdomain (*.domain.com)
// Shows the exact same form on every page
app.get('{*splat}', (req, res) => {
  const meta = getRequestMeta(req);
  const html = renderFormHtml({
    host: meta.host,
    path: meta.path,
  });
  res.send(html);
});

export default app;
