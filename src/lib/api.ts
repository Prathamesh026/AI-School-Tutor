export type ChatRequest = {
  query: string;
  language: string;
  pace: string;
  role: 'student' | 'teacher';
};

export type Material = {
  title: string;
  content: string;
  audience: 'student' | 'teacher' | 'both';
};

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export async function addMaterial(material: Material): Promise<void> {
  const response = await fetch(`${API_URL}/api/materials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(material)
  });
  if (!response.ok) throw new Error('Failed to add material');
}

export async function chatWithTutor(payload: ChatRequest): Promise<string> {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Chat request failed');
  }

  const data = (await response.json()) as { answer: string };
  return data.answer;
}
