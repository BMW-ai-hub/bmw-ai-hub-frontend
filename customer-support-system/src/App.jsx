import { useState } from "react";

// Person 2: starting stub. Build the pre diagnostics chat flow,
// ticket list, and knowledge base search from here.

function App() {
  const [messages, setMessages] = useState([]);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Customer Support System</h1>
      <p>Pre diagnostics chat and support ticket view.</p>

      <section>
        <h2>Chat</h2>
        {messages.length === 0 ? (
          <p>Start a conversation to report an issue.</p>
        ) : (
          messages.map((m, i) => <p key={i}>{m.text}</p>)
        )}
      </section>
    </div>
  );
}

export default App;
