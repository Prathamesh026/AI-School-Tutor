# AI School Tutor (Production-Ready TypeScript Starter)

This project now uses a proper TypeScript setup with:

- **React + Vite frontend** (student + teacher dashboard)
- **Express TypeScript backend** for **RAG** flow
- **OpenAI embeddings + chat completion** integration
- `.env` and `.env.example` placeholders so you can deploy by filling API keys

## Features

### Student dashboard
- Upcoming classes
- Notes
- AI tutor chat that adapts to language + pace

### Teacher dashboard
- Upload study material (indexed into vector chunks)
- AI teaching assistant chat over uploaded content

## RAG implementation
1. Teacher uploads material to `POST /api/materials`
2. Backend chunks text and generates embeddings
3. Query to `POST /api/chat` embeds the question
4. Top similar chunks are retrieved by cosine similarity
5. Model answers from retrieved context in selected language/pace

## Setup

```bash
npm install
cp .env.example .env
# add your OPENAI_API_KEY in .env
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:4000`.

## Production build

```bash
npm run build
npm run build:server
npm run start
```

Deploy `dist/` (frontend) and `dist-server/` (backend) with environment variables configured.
