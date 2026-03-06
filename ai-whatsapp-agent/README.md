# AI WhatsApp Agent (Gemini + RAG + Tools)

Production-grade modular WhatsApp AI backend in TypeScript/Node.js using Express, Gemini, PostgreSQL, and pgvector.

## Features

- WhatsApp Cloud API webhook and sender
- Gemini `gemini-1.5-pro` LLM client
- ReAct-style agent loop with tool execution
- Two-layer memory (conversation + long-term user facts)
- Full RAG pipeline (chunking, embeddings, pgvector retrieval)
- Logging/metrics and resilient retries
- Dockerized deployment

## Local setup

1. Copy environment file:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Start Postgres with pgvector:

```bash
docker compose up -d postgres
```

4. Setup DB schema:

```bash
npm run setup-db
```

5. Start dev server:

```bash
npm run dev
```

## Docker setup

```bash
docker compose up --build
```

App runs on `http://localhost:3000`.

## WhatsApp webhook setup

- Expose your app publicly (ngrok or cloud URL).
- Configure Meta webhook URL: `https://<domain>/webhook`.
- Set verify token to `VERIFY_TOKEN` value.
- Ensure `WHATSAPP_TOKEN`, `PHONE_NUMBER_ID`, and `WHATSAPP_APP_SECRET` are configured.

## Gemini API setup

- Create API key from Google AI Studio.
- Set `GEMINI_API_KEY` in `.env`.

## RAG document indexing

Put `.txt`/`.md` files into `docs/`, then run:

```bash
npm run index-docs
```

Test retrieval:

```bash
npm run test-rag -- "your query"
```

## Deployment guide

1. Provision Postgres with pgvector.
2. Set all environment variables in your deployment platform.
3. Build and run container image from `Dockerfile`.
4. Run `npm run setup-db` during release initialization.
5. Point Meta webhook to deployed `/webhook` endpoint.

## Environment variables

- `PORT`
- `VERIFY_TOKEN`
- `WHATSAPP_TOKEN`
- `PHONE_NUMBER_ID`
- `WHATSAPP_APP_SECRET`
- `DATABASE_URL`
- `GEMINI_API_KEY`
- `MAX_REASONING_STEPS`
- `TOP_K`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
