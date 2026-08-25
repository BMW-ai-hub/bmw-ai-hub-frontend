import { useState } from "react";

// Person 1: this is a starting stub, build out routing, upload flow,
// and the score detail view from here. See README.md in this folder.

function App() {
  const [videos, setVideos] = useState([]);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Technician System</h1>
      <p>Upload a service video and view your score and feedback.</p>

      <section>
        <h2>My Videos</h2>
        {videos.length === 0 ? (
          <p>No videos submitted yet.</p>
        ) : (
          <ul>
            {videos.map((v) => (
              <li key={v.video_id}>
                {v.video_id} — {v.status}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;
