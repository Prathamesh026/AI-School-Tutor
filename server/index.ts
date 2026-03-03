import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { z } from 'zod';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small';
const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL ?? 'gpt-4o-mini';

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

type IndexedChunk = {
  id: string;
  title: string;
  audience: 'student' | 'teacher' | 'both';
  content: string;
  embedding: number[];
};

const chunks: IndexedChunk[] = [];

const materialSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(20),
  audience: z.enum(['student', 'teacher', 'both'])
});

const chatSchema = z.object({
  query: z.string().min(2),
  language: z.string().min(2),
  pace: z.string().min(2),
  role: z.enum(['student', 'teacher'])
});

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function splitIntoChunks(text: string, size = 600): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  const parts: string[] = [];
  for (let i = 0; i < clean.length; i += size) {
    parts.push(clean.slice(i, i + size));
  }
  return parts;
}

app.post('/api/materials', async (req, res) => {
  const parsed = materialSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  if (!openai) return res.status(500).send('OPENAI_API_KEY not configured.');

  const { title, content, audience } = parsed.data;
  const partList = splitIntoChunks(content);

  const embeddings = await Promise.all(
    partList.map(async (part, idx) => {
      const result = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: part });
      return {
        id: `${Date.now()}-${idx}`,
        title,
        audience,
        content: part,
        embedding: result.data[0].embedding
      } as IndexedChunk;
    })
  );

  chunks.push(...embeddings);
  return res.status(201).json({ message: 'Indexed', chunksAdded: embeddings.length });
});

app.post('/api/chat', async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  if (!openai) return res.status(500).send('OPENAI_API_KEY not configured.');

  const { query, language, pace, role } = parsed.data;

  const queryEmbedding = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: query });
  const qVector = queryEmbedding.data[0].embedding;

  const scoped = chunks.filter((c) => c.audience === 'both' || c.audience === role);
  const ranked = scoped
    .map((c) => ({ ...c, score: cosineSimilarity(qVector, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const context = ranked.map((r, i) => `Source ${i + 1} (${r.title}): ${r.content}`).join('\n\n');

  const system = `You are an AI school tutor. Teach in ${language}, and adapt to learning pace: ${pace}. Keep explanations structured and easy to follow.`;

  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0.4,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: `Question: ${query}\n\nUse only the context below when answering.\n${context || 'No context available.'}` }
    ]
  });

  return res.json({ answer: completion.choices[0]?.message?.content ?? 'No answer generated.' });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`RAG API running on http://localhost:${port}`);
});
