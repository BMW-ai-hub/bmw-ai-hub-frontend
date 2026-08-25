# Technician System (Person 1)

React app for technicians. This is the internal, employee facing side.

## What to build today
1. Login screen (stub auth for now, hardcode a fake logged in technician)
2. Upload screen, technician selects/records a video and submits it
3. "My Videos" list, shows past submissions with status: pending, scored
4. Score detail view, shows the score and written feedback once `services/technician-services` returns it
5. Simple analytics view (optional if time runs out), average score over time

## API contract you need from Person 3 / Person 4
- `POST /api/technician/videos` — upload a video, returns `{ video_id, status }`
- `GET /api/technician/videos/:id` — returns `{ video_id, status, score, feedback }`
- `GET /api/technician/videos` — list of this technician's submissions

Agree on the exact JSON shape with Person 4 before building the upload flow, don't guess it.

## Run it
```bash
npm install
npm run dev
```
Runs on port 5173. Talks to the API Gateway at `http://localhost:8000`.
