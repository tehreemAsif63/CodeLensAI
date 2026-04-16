import { useState } from "react";

const API_BASE = "http://localhost:8080";

type Mode = "explain" | "teach" | "quiz" | "structure";

export default function App() {
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<Mode>("explain");
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setResponseText("");
    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, mode, depth: "shallow" }),
      });
      const data = await res.json();
      setResponseText(JSON.stringify(data, null, 2));
    } catch (e) {
      setResponseText(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>CodeLens AI</h1>
      <label>
        Code
        <br />
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={12}
          cols={80}
        />
      </label>
      <br />
      <label>
        Mode
        <br />
        <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
          <option value="explain">explain</option>
          <option value="teach">teach</option>
          <option value="quiz">quiz</option>
          <option value="structure">structure</option>
        </select>
      </label>
      <br />
      <button type="button" onClick={handleSubmit} disabled={loading}>
        {loading ? "Sending…" : "Analyze"}
      </button>
      <h2>Response</h2>
      <pre>{responseText}</pre>
    </div>
  );
}
