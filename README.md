# cv-lending-api

Express API for accepting contact requests and sending email via SMTP.

## Scripts

```bash
npm run dev
npm run build
npm start
npm test
```

## Environment

Create `.env` from `.env.example`.

```bash
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=user@example.com
SMTP_PASS=password
MAIL_FROM=no-reply@example.com
MAIL_TO=hr@example.com

DEEPSEEK_API_KEY=sk-your-deepseek-key
DEEPSEEK_MODEL=deepseek-chat
```

## Endpoints

`GET /health`

Returns API status.

`POST /api/contact`

Accepts the contact form used by the frontend:

```json
{
  "name": "Jane Doe",
  "phone": "+1 555 0100",
  "email": "jane@example.com",
  "comment": "I want to discuss a frontend project."
}
```

If SMTP variables are configured, the request is sent to `MAIL_TO`, and a copy is sent to the sender email.
If SMTP is not configured, the request is validated and accepted in demo mode.

`POST /api/ai-summary`

Accepts a prompt for the planned AI helper:

```json
{
  "prompt": "React landing with a feedback form and email delivery"
}
```

If `DEEPSEEK_API_KEY` is configured, the API calls DeepSeek Chat Completions API.
Without a key, it returns a local fallback summary.
