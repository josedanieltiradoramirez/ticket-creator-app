# Render deployment notes

Deploy this as one FastAPI web service so the frontend and API share an origin.
That allows the browser to send the session cookie without exposing the JWT to
JavaScript.

## Build and start

- Build command: `pip install -r requirements.txt && alembic upgrade head`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Connect a Render PostgreSQL database and set `DATABASE_URL` to its internal
connection URL. Generate a new secret with
`python -c "import secrets; print(secrets.token_urlsafe(48))"`, set it as
`SECRET_KEY`, and set `COOKIE_SECURE=true`. Keep `CORS_ORIGINS` empty for the
single-origin deployment. If the frontend is hosted separately, set
`CORS_ORIGINS` to its exact HTTPS origin, without a trailing slash.
For a separately hosted frontend, also define `window.TICKET_CREATOR_API_URL`
before `js/api.js` loads so it points to the API service.

After the database is connected and migrations have run, create the first
administrator from a trusted shell with:

```text
python -m app.scripts.create_admin
```

The command prompts for the admin details and password; it does not expose an
HTTP endpoint for creating the initial administrator. The web user-creation
endpoint requires an authenticated administrator.

For local development, copy `.env.example` to `.env`, provide a local database
URL, generate a distinct secret, and keep `COOKIE_SECURE=false` when serving
over plain HTTP. Never reuse a local secret in production.
