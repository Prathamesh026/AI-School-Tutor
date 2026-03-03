import { useState } from 'react';
import { addMaterial, chatWithTutor } from './lib/api';

type Role = 'student' | 'teacher';
type Message = { from: 'user' | 'ai'; text: string };

const upcoming = [
  'Math - Algebra Revision (Mon 10:00)',
  'Biology - Cell Structure (Tue 12:30)',
  'History - Industrial Revolution (Wed 14:00)'
];

export function App() {
  const [role, setRole] = useState<Role>('student');
  const [notes, setNotes] = useState<string[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { from: 'ai', text: 'Hi! I am your AI tutor. Ask from uploaded material.' }
  ]);
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('English');
  const [pace, setPace] = useState('Balanced');
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialContent, setMaterialContent] = useState('');
  const [status, setStatus] = useState('');

  async function sendMessage() {
    if (!query.trim()) return;
    const text = query.trim();
    setMessages((p) => [...p, { from: 'user', text }]);
    setQuery('');
    try {
      const answer = await chatWithTutor({ query: text, language, pace, role });
      setMessages((p) => [...p, { from: 'ai', text: answer }]);
    } catch (error) {
      setMessages((p) => [...p, { from: 'ai', text: `Error: ${(error as Error).message}` }]);
    }
  }

  async function uploadMaterial() {
    if (!materialTitle.trim() || !materialContent.trim()) return;
    try {
      await addMaterial({
        title: materialTitle,
        content: materialContent,
        audience: 'both'
      });
      setStatus('Material uploaded and indexed for RAG.');
      setMaterialTitle('');
      setMaterialContent('');
    } catch (error) {
      setStatus(`Upload failed: ${(error as Error).message}`);
    }
  }

  return (
    <div className="app">
      <aside>
        <h1>AI School Tutor</h1>
        <button className={role === 'student' ? 'active' : ''} onClick={() => setRole('student')}>Student</button>
        <button className={role === 'teacher' ? 'active' : ''} onClick={() => setRole('teacher')}>Teacher</button>
      </aside>
      <main>
        {role === 'student' ? (
          <section>
            <h2>Student Dashboard</h2>
            <div className="card">
              <h3>Upcoming Classes</h3>
              <ul>{upcoming.map((u) => <li key={u}>{u}</li>)}</ul>
            </div>
            <div className="card">
              <h3>Notes</h3>
              <textarea value={noteInput} onChange={(e) => setNoteInput(e.target.value)} />
              <button onClick={() => noteInput.trim() && (setNotes((p) => [...p, noteInput.trim()]), setNoteInput(''))}>Save Note</button>
              <ul>{notes.map((n, i) => <li key={`${n}-${i}`}>{n}</li>)}</ul>
            </div>
          </section>
        ) : (
          <section>
            <h2>Teacher Dashboard</h2>
            <div className="card">
              <h3>Upload Material</h3>
              <input placeholder="Title" value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} />
              <textarea placeholder="Paste notes, chapters, lesson plan" value={materialContent} onChange={(e) => setMaterialContent(e.target.value)} />
              <button onClick={uploadMaterial}>Upload</button>
              <p>{status}</p>
            </div>
          </section>
        )}

        <section className="card">
          <h3>AI {role === 'student' ? 'Tutor' : 'Teaching Assistant'} (RAG)</h3>
          <div className="row">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option>English</option>
              <option>Hindi</option>
              <option>Spanish</option>
            </select>
            <select value={pace} onChange={(e) => setPace(e.target.value)}>
              <option>Slow & Detailed</option>
              <option>Balanced</option>
              <option>Fast Revision</option>
            </select>
          </div>
          <div className="chat">
            {messages.map((m, i) => <p className={m.from} key={`${m.from}-${i}`}>{m.text}</p>)}
          </div>
          <div className="row">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask question" />
            <button onClick={sendMessage}>Send</button>
          </div>
        </section>
      </main>
    </div>
  );
}
